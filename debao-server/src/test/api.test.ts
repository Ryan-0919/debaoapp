import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../main.js';
import {createServer} from 'node:http';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try { await run(`http://127.0.0.1:${address.port}`); } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

test('health endpoint returns service status', async () => withServer(async base => {
  const response = await fetch(`${base}/v1/health`); const json = await response.json() as any;
  assert.equal(response.status, 200); assert.equal(json.data.status, 'ok');
}));

test('auth and course endpoints enforce token and return data', async () => withServer(async base => {
  const denied = await fetch(`${base}/v1/courses`); assert.equal(denied.status, 401);
  const response = await fetch(`${base}/v1/courses`, {headers: {authorization: 'Bearer demo-token'}}); const json = await response.json() as any;
  assert.equal(response.status, 200); assert.equal(json.data.length, 4);
}));

test('order creation is pending until local payment adapter confirms it', async () => withServer(async base => {
  const headers = {'content-type': 'application/json', authorization: 'Bearer demo-token'};
  const created = await fetch(`${base}/v1/orders`, {method: 'POST', headers, body: JSON.stringify({productId: 'p2', clientRequestId: 'test-unique-1'})}); const order = await created.json() as any;
  assert.equal(created.status, 201); assert.equal(order.data.status, 'pending');
  const paid = await fetch(`${base}/v1/orders/${order.data.id}/pay`, {method: 'POST', headers}); const payment = await paid.json() as any;
  assert.equal(payment.data.status, 'paid');
}));
