import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import test from 'node:test';
import {handle, store} from '../main.js';
import type {Store} from '../types.js';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

async function adminSession(base: string) {
  const login = await fetch(`${base}/v1/admin/auth/login`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({username: 'admin', password: 'change-me-local'}),
  });
  assert.equal(login.status, 200);
  const payload = await login.json() as {data: {csrfToken: string}};
  return {cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '', csrf: payload.data.csrfToken};
}

test('high-value refund requires two distinct reviews before approval', async () => withServer(async base => {
  const session = await adminSession(base);
  const order: Store['orders'][number] = {id: `order-refund-dual-${Date.now()}`, userId: 'u-demo', productId: 'p2', productName: 'test', amount: 1500, status: 'refund_requested', createdAt: new Date().toISOString()};
  const refund: Store['refunds'][number] = {id: `refund-dual-${Date.now()}`, orderId: order.id, userId: 'u-demo', reason: '用户申请退款', amount: 1500, status: 'requested', createdAt: new Date().toISOString()};
  store.orders.unshift(order);
  store.refunds.unshift(refund);
  try {
    const headers = {cookie: session.cookie, 'x-csrf-token': session.csrf};
    const premature = await fetch(`${base}/v1/admin/refunds/${refund.id}/approve`, {method: 'POST', headers});
    const prematureJson = await premature.json() as any;
    assert.equal(premature.status, 409);
    assert.equal(prematureJson.error.code, 'REFUND_DUAL_REVIEW_REQUIRED');
    assert.equal(refund.status, 'requested');

    const first = await fetch(`${base}/v1/admin/refunds/${refund.id}/review`, {method: 'POST', headers: {...headers, 'content-type': 'application/json'}, body: JSON.stringify({reason: '核验订单与申请信息'})});
    const firstJson = await first.json() as any;
    assert.equal(first.status, 200);
    assert.equal(firstJson.data.reviewStage, 'first_reviewed');
    assert.equal(firstJson.data.status, 'reviewing');

    const duplicate = await fetch(`${base}/v1/admin/refunds/${refund.id}/review`, {method: 'POST', headers: {...headers, 'content-type': 'application/json'}, body: JSON.stringify({reason: '重复复核'})});
    const duplicateJson = await duplicate.json() as any;
    assert.equal(duplicate.status, 409);
    assert.equal(duplicateJson.error.code, 'REFUND_REVIEW_DUPLICATE');

    // Simulate a second authenticated administrator in the in-memory test
    // store; the route still validates that the IDs differ.
    refund.firstReviewedBy = '00000000-0000-0000-0000-000000000098';
    const second = await fetch(`${base}/v1/admin/refunds/${refund.id}/review`, {method: 'POST', headers: {...headers, 'content-type': 'application/json'}, body: JSON.stringify({reason: '第二位管理员复核'})});
    const secondJson = await second.json() as any;
    assert.equal(second.status, 200);
    assert.equal(secondJson.data.reviewStage, 'ready');
    assert.equal(secondJson.data.readyForApproval, true);

    const approved = await fetch(`${base}/v1/admin/refunds/${refund.id}/approve`, {method: 'POST', headers});
    const approvedJson = await approved.json() as any;
    assert.equal(approved.status, 200);
    assert.equal(approvedJson.data.status, 'completed');
    assert.equal(approvedJson.data.reviewedBy, '00000000-0000-0000-0000-000000000099');
    assert.equal(order.status, 'refunded');
  } finally {
    const refundIndex = store.refunds.indexOf(refund);
    if (refundIndex >= 0) store.refunds.splice(refundIndex, 1);
    const orderIndex = store.orders.indexOf(order);
    if (orderIndex >= 0) store.orders.splice(orderIndex, 1);
    store.orderEvents = store.orderEvents.filter(item => item.orderId !== order.id);
  }
}));

test('refund rejection records the reviewer reason and restores a requested order', async () => withServer(async base => {
  const session = await adminSession(base);
  const order: Store['orders'][number] = {id: `order-refund-reject-${Date.now()}`, userId: 'u-demo', productId: 'p2', productName: 'test', amount: 20, status: 'refund_requested', createdAt: new Date().toISOString()};
  const refund: Store['refunds'][number] = {id: `refund-reject-${Date.now()}`, orderId: order.id, userId: 'u-demo', reason: '重复下单', amount: 20, status: 'requested', createdAt: new Date().toISOString()};
  store.orders.unshift(order);
  store.refunds.unshift(refund);
  try {
    const response = await fetch(`${base}/v1/admin/refunds/${refund.id}/reject`, {
      method: 'POST',
      headers: {cookie: session.cookie, 'x-csrf-token': session.csrf, 'content-type': 'application/json'},
      body: JSON.stringify({reason: '订单不满足退款条件'}),
    });
    const json = await response.json() as any;
    assert.equal(response.status, 200);
    assert.equal(json.data.status, 'rejected');
    assert.equal(json.data.reviewReason, '订单不满足退款条件');
    assert.equal(json.data.reviewedBy, '00000000-0000-0000-0000-000000000099');
    assert.equal(order.status, 'paid');
  } finally {
    const refundIndex = store.refunds.indexOf(refund);
    if (refundIndex >= 0) store.refunds.splice(refundIndex, 1);
    const orderIndex = store.orders.indexOf(order);
    if (orderIndex >= 0) store.orders.splice(orderIndex, 1);
    store.orderEvents = store.orderEvents.filter(item => item.orderId !== order.id);
  }
}));

test('admin SKU endpoint exposes inventory and accepts a stock/status update', async () => withServer(async base => {
  const session = await adminSession(base);
  const product = store.products.find(item => item.id === 'p2');
  const sku = store.productSkus.find(item => item.productId === 'p2');
  assert.ok(product);
  assert.ok(sku);
  const previousStock = sku.stock;
  const previousStatus = sku.status;
  try {
    const headers = {cookie: session.cookie, 'x-csrf-token': session.csrf};
    const list = await fetch(`${base}/v1/admin/products/skus?productId=${encodeURIComponent(product.id)}`, {headers});
    const listJson = await list.json() as any;
    assert.equal(list.status, 200);
    assert.equal(listJson.data.items.some((item: any) => item.id === sku.id && item.stock === previousStock), true);

    const update = await fetch(`${base}/v1/admin/products/${product.id}/skus/${sku.id}`, {
      method: 'PATCH',
      headers: {...headers, 'content-type': 'application/json'},
      body: JSON.stringify({stock: previousStock + 1, status: previousStatus}),
    });
    const updateJson = await update.json() as any;
    assert.equal(update.status, 200);
    assert.equal(updateJson.data.stock, previousStock + 1);
    assert.equal(updateJson.data.status, previousStatus);
  } finally {
    sku.stock = previousStock;
    sku.status = previousStatus;
  }
}));

test('admin can update and read the durable refund review threshold', async () => withServer(async base => {
  const session = await adminSession(base);
  const headers = {cookie: session.cookie, 'x-csrf-token': session.csrf};
  const initialResponse = await fetch(`${base}/v1/admin/settings`, {headers});
  assert.equal(initialResponse.status, 200);
  const initialJson = await initialResponse.json() as any;
  const initialThreshold = initialJson.data.refundReviewThreshold;
  try {
    const update = await fetch(`${base}/v1/admin/settings`, {
      method: 'PATCH',
      headers: {...headers, 'content-type': 'application/json'},
      body: JSON.stringify({refundReviewThreshold: 2500.5}),
    });
    const updateJson = await update.json() as any;
    assert.equal(update.status, 200);
    assert.equal(updateJson.data.refundReviewThreshold, 2500.5);

    const readBack = await fetch(`${base}/v1/admin/settings`, {headers});
    const readBackJson = await readBack.json() as any;
    assert.equal(readBackJson.data.refundReviewThreshold, 2500.5);

    const invalid = await fetch(`${base}/v1/admin/settings`, {
      method: 'PATCH',
      headers: {...headers, 'content-type': 'application/json'},
      body: JSON.stringify({refundReviewThreshold: -1}),
    });
    assert.equal(invalid.status, 422);
  } finally {
    await fetch(`${base}/v1/admin/settings`, {
      method: 'PATCH',
      headers: {...headers, 'content-type': 'application/json'},
      body: JSON.stringify({refundReviewThreshold: initialThreshold}),
    });
  }
}));
