import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, infrastructure, store} from '../main.js';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try { await run(`http://127.0.0.1:${address.port}`); }
  finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}

const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};

test('learning activities are idempotent and included in period aggregates', async () => withServer(async base => {
  const key = `activity-${Date.now()}`;
  const first = await fetch(`${base}/v1/learning/activities`, {method: 'POST', headers: {...auth, 'idempotency-key': key}, body: JSON.stringify({kind: 'reading', durationSeconds: 125, quantity: 2, idempotencyKey: key})});
  const firstJson = await first.json() as any;
  const retry = await fetch(`${base}/v1/learning/activities`, {method: 'POST', headers: {...auth, 'idempotency-key': key}, body: JSON.stringify({kind: 'reading', durationSeconds: 125, quantity: 2, idempotencyKey: key})});
  const retryJson = await retry.json() as any;
  assert.equal(first.status, 201); assert.equal(retry.status, 200); assert.equal(retryJson.data.id, firstJson.data.id);
  const list = await fetch(`${base}/v1/learning/activities?period=day&limit=10`, {headers: auth}); const listJson = await list.json() as any;
  assert.equal(list.status, 200); assert.equal(listJson.data.items.some((item: any) => item.id === firstJson.data.id), true);
  const report = await fetch(`${base}/v1/learning/report?period=day`, {headers: auth}); const reportJson = await report.json() as any;
  assert.equal(report.status, 200); assert.equal(reportJson.data.durationSeconds >= 125, true); assert.equal(Array.isArray(reportJson.data.dailyTrend), true);
  store.learningActivities = store.learningActivities.filter(item => item.id !== firstJson.data.id); store.learningActivityKeys.delete(`u-demo\u0000${key}`);
}));

test('attachments require a valid completion token and expose upload state', async () => withServer(async base => {
  const preflight = await fetch(`${base}/v1/attachments/preflight`, {method: 'POST', headers: auth, body: JSON.stringify({filename: 'answer.pdf', contentType: 'application/pdf', sizeBytes: 1024})}); const preflightJson = await preflight.json() as any;
  assert.equal(preflight.status, 201); assert.match(preflightJson.data.uploadToken, /^upload-token-/);
  const id = preflightJson.data.id; const denied = await fetch(`${base}/v1/attachments/${id}/complete`, {method: 'POST', headers: auth, body: JSON.stringify({uploadToken: 'wrong'})}); assert.equal(denied.status, 403);
  const complete = await fetch(`${base}/v1/attachments/${id}/complete`, {method: 'POST', headers: {...auth, 'x-upload-token': preflightJson.data.uploadToken}}); const completeJson = await complete.json() as any;
  assert.equal(complete.status, 200); assert.equal(completeJson.data.status, 'completed');
  const state = await fetch(`${base}/v1/attachments/${id}`, {headers: auth}); assert.equal((await state.json() as any).data.status, 'completed');
  store.attachmentUploads = store.attachmentUploads.filter(item => item.id !== id);
}));

test('AI conversation history supports retries, rename and deletion', async () => withServer(async base => {
  const createKey = `ai-create-${Date.now()}`; const created = await fetch(`${base}/v1/ai/conversations`, {method: 'POST', headers: {...auth, 'idempotency-key': createKey}, body: JSON.stringify({title: '测试会话', clientRequestId: createKey})}); const createdJson = await created.json() as any;
  assert.equal(created.status, 201); const id = createdJson.data.id;
  const messageKey = `ai-message-${Date.now()}`; const sent = await fetch(`${base}/v1/ai/conversations/${id}/messages`, {method: 'POST', headers: {...auth, 'idempotency-key': messageKey}, body: JSON.stringify({content: '请解释善意取得', clientRequestId: messageKey})}); const sentJson = await sent.json() as any;
  const retry = await fetch(`${base}/v1/ai/conversations/${id}/messages`, {method: 'POST', headers: {...auth, 'idempotency-key': messageKey}, body: JSON.stringify({content: '请解释善意取得', clientRequestId: messageKey})}); const retryJson = await retry.json() as any;
  assert.equal(sent.status, 201); assert.equal(retry.status, 200); assert.equal(retryJson.data.assistantMessage.id, sentJson.data.assistantMessage.id);
  const renamed = await fetch(`${base}/v1/ai/conversations/${id}`, {method: 'PATCH', headers: auth, body: JSON.stringify({title: '已重命名'})}); assert.equal((await renamed.json() as any).data.title, '已重命名');
  const deleted = await fetch(`${base}/v1/ai/conversations/${id}`, {method: 'DELETE', headers: auth}); assert.equal(deleted.status, 200);
  store.aiSessions = store.aiSessions.filter(item => item.id !== id); store.aiMessages = store.aiMessages.filter(item => item.sessionId !== id); store.aiSessionRequestKeys.delete(`u-demo:${createKey}`); store.aiMessageRequestKeys.delete(`${id}:${messageKey}`);
}));

test('notification pagination, announcement receipt and order lifecycle are user-scoped', async () => withServer(async base => {
  const page = await fetch(`${base}/v1/notifications?limit=2&cursor=0`, {headers: auth}); const pageJson = await page.json() as any; assert.equal(page.status, 200); assert.equal(Array.isArray(pageJson.data.items), true);
  const announcement = store.announcements.find(item => item.status === 'published'); assert.ok(announcement);
  const read = await fetch(`${base}/v1/announcements/${announcement!.id}/read`, {method: 'POST', headers: auth}); assert.equal(read.status, 200);
  const close = await fetch(`${base}/v1/announcements/${announcement!.id}/close`, {method: 'POST', headers: auth}); assert.equal(close.status, 200);
  assert.equal(store.notificationClosures.has(`u-demo:announcement:${announcement!.id}`), true);

  const productId = `lifecycle-product-${Date.now()}`; const skuId = `lifecycle-sku-${Date.now()}`;
  store.products.push({id: productId, name: 'Lifecycle product', category: 'test', price: 100, originalPrice: 100, sold: 0, accent: '#123456', benefits: [], status: 'on_sale'});
  store.productSkus.push({id: skuId, productId, name: '标准', price: 100, stock: 1, status: 'active', attributes: {}, updatedAt: new Date().toISOString()});
  const key = `lifecycle-order-${Date.now()}`; const created = await fetch(`${base}/v1/orders`, {method: 'POST', headers: {...auth, 'idempotency-key': key}, body: JSON.stringify({productId, skuId, clientRequestId: key})}); const createdJson = await created.json() as any;
  assert.equal(created.status, 201); assert.equal(store.productSkus.find(item => item.id === skuId)?.stock, 0);
  const cancelled = await fetch(`${base}/v1/orders/${createdJson.data.id}/cancel`, {method: 'POST', headers: auth}); assert.equal(cancelled.status, 200); assert.equal(store.productSkus.find(item => item.id === skuId)?.stock, 1);
  const events = await fetch(`${base}/v1/orders/${createdJson.data.id}/events`, {headers: auth}); assert.equal((await events.json() as any).data.items.some((item: any) => item.type === 'cancelled'), true);
  store.products = store.products.filter(item => item.id !== productId); store.productSkus = store.productSkus.filter(item => item.id !== skuId); store.orders = store.orders.filter(item => item.id !== createdJson.data.id); store.orderEvents = store.orderEvents.filter(item => item.orderId !== createdJson.data.id);
}));

test('pending orders close at the persisted expiresAt deadline', async () => withServer(async base => {
  const productId = `expiry-product-${Date.now()}`; const skuId = `expiry-sku-${Date.now()}`;
  store.products.push({id: productId, name: 'Expiry product', category: 'test', price: 50, originalPrice: 50, sold: 0, accent: '#123456', benefits: [], status: 'on_sale'});
  store.productSkus.push({id: skuId, productId, name: '标准', price: 50, stock: 1, status: 'active', attributes: {}, updatedAt: new Date().toISOString()});
  const key = `expiry-order-${Date.now()}`;
  const created = await fetch(`${base}/v1/orders`, {method: 'POST', headers: {...auth, 'idempotency-key': key}, body: JSON.stringify({productId, skuId, clientRequestId: key})});
  const createdJson = await created.json() as any;
  assert.equal(created.status, 201);
  const order = store.orders.find(item => item.id === createdJson.data.id);
  assert.ok(order);
  order!.expiresAt = new Date(Date.now() - 1).toISOString();
  const listed = await fetch(`${base}/v1/orders`, {headers: auth});
  assert.equal(listed.status, 200);
  assert.equal(store.orders.find(item => item.id === order!.id)?.status, 'closed');
  assert.equal(store.productSkus.find(item => item.id === skuId)?.stock, 1);
  store.products = store.products.filter(item => item.id !== productId);
  store.productSkus = store.productSkus.filter(item => item.id !== skuId);
  store.orders = store.orders.filter(item => item.id !== order!.id);
  store.orderEvents = store.orderEvents.filter(item => item.orderId !== order!.id);
}));

test('SKU inventory updates are atomic and reject a stale zero-row reservation', async () => withServer(async base => {
  const productId = `atomic-product-${Date.now()}`;
  const skuId = `atomic-sku-${Date.now()}`;
  const product = {id: productId, name: 'Atomic inventory product', category: 'test', price: 80, originalPrice: 80, sold: 0, accent: '#123456', benefits: [], status: 'on_sale' as const};
  const sku = {id: skuId, productId, name: '标准', price: 80, stock: 2, status: 'active' as const, attributes: {}, updatedAt: new Date().toISOString()};
  store.products.push(product);
  store.productSkus.push(sku);
  const originalQuery = infrastructure.query;
  let databaseStock = 2;
  const statements: string[] = [];
  (infrastructure as any).query = async (text: string, values: unknown[] = []) => {
    statements.push(text);
    if (text.includes('stock = stock - 1')) {
      if (databaseStock < 1) return {rows: [], rowCount: 0};
      databaseStock -= 1;
      return {rows: [{stock: databaseStock}], rowCount: 1};
    }
    if (text.includes('stock = stock + 1')) {
      databaseStock += 1;
      return {rows: [{stock: databaseStock}], rowCount: 1};
    }
    return {rows: [], rowCount: 1};
  };
  const createdIds: string[] = [];
  try {
    const headers = {...auth, 'idempotency-key': `atomic-order-${Date.now()}`};
    const first = await fetch(`${base}/v1/orders`, {method: 'POST', headers, body: JSON.stringify({productId, skuId, clientRequestId: headers['idempotency-key']})});
    const firstJson = await first.json() as any;
    assert.equal(first.status, 201);
    createdIds.push(firstJson.data.id);
    // Simulate another application instance reserving the final database unit
    // while this process still believes one unit remains.
    databaseStock -= 1;
    // The local view still has one unit after the first request, while a
    // concurrent writer consumes the final database unit before this request.
    // The conditional UPDATE must reject this reservation and leave the local
    // stock unchanged.
    const second = await fetch(`${base}/v1/orders`, {method: 'POST', headers: {...auth, 'idempotency-key': `atomic-order-${Date.now()}-second`}, body: JSON.stringify({productId, skuId})});
    assert.equal(second.status, 409);
    assert.equal((await second.json() as any).error.code, 'SKU_OUT_OF_STOCK');
    assert.equal(sku.stock, 1);
    assert.equal(databaseStock, 0);
    assert.equal(statements.some(statement => /stock\s*=\s*stock\s*-\s*1/.test(statement)), true);

    // Releasing the first order uses the same atomic pattern and applies the
    // database-returned stock value instead of incrementing a stale counter.
    const cancelled = await fetch(`${base}/v1/orders/${encodeURIComponent(createdIds[0])}/cancel`, {method: 'POST', headers: auth});
    assert.equal(cancelled.status, 200);
    assert.equal(sku.stock, 1);
    assert.equal(databaseStock, 1);
    assert.equal(statements.some(statement => /stock\s*=\s*stock\s*\+\s*1/.test(statement)), true);
  } finally {
    (infrastructure as any).query = originalQuery;
    store.products = store.products.filter(item => item.id !== productId);
    store.productSkus = store.productSkus.filter(item => item.id !== skuId);
    store.orders = store.orders.filter(item => !createdIds.includes(item.id));
    store.orderEvents = store.orderEvents.filter(item => !createdIds.includes(item.orderId));
  }
}));
