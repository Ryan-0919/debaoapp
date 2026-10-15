import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.js';
import {createAIAdapter, createGradingAdapter, createPaymentAdapter, createSmsAdapter} from '../adapters.js';
import {createServer} from 'node:http';
import {handle, store} from '../main.js';

test('runtime store never inserts demo content or authenticated sessions', () => {
  const store = createStore();
  for (const [key, value] of Object.entries(store)) {
    if (Array.isArray(value)) assert.equal(value.length, 0, key);
    else if (value instanceof Map || value instanceof Set) assert.equal(value.size, 0, key);
  }
  assert.ok(createStore(true).sessions.has('demo-token'));
  assert.equal(createStore().sessions.has('demo-token'), false);
});

test('providers without configuration cannot simulate successful operations', async () => {
  assert.equal(createAIAdapter({}).name, 'unconfigured');
  assert.equal((await createSmsAdapter({}).sendCode('13800138000', 'login')).accepted, false);
  assert.notEqual((await createPaymentAdapter({}).pay('unconfigured-order', 100)).status, 'paid');
  assert.equal(createAIAdapter({AI_ADAPTER: 'local'}).name, 'unconfigured');
  assert.equal(createPaymentAdapter({PAYMENT_ADAPTER: 'local'}).name, 'unconfigured');
  await assert.rejects(createGradingAdapter({}).enqueue('submission'), /NOT_CONFIGURED/);
});

test('real runtime notifications never invent learning, grading or order events', async () => {
  const originalMode = process.env.DEBAO_TEST_FIXTURES;
  const originalStore = {...store};
  const empty = createStore();
  Object.assign(store, empty);
  store.sessions.set('real-notification-test', {
    userId: 'notification-test', refreshToken: 'unused', deviceId: 'test',
    expiresAt: '2099-01-01T00:00:00.000Z',
  });
  delete process.env.DEBAO_TEST_FIXTURES;
  const server = createServer(handle);
  try {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}/v1/notifications`, {
      headers: {authorization: 'Bearer real-notification-test'},
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as any).data, []);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    Object.assign(store, originalStore);
    if (originalMode === undefined) delete process.env.DEBAO_TEST_FIXTURES;
    else process.env.DEBAO_TEST_FIXTURES = originalMode;
  }
});
