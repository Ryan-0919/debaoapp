import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createAIAdapter, createCarrierAuthAdapter, createGradingAdapter, createMediaAdapter, createPaymentAdapter, createPushAdapter, createSmsAdapter, createWechatAuthAdapter} from '../adapters.js';

test('adapter factories keep local and unconfigured behavior explicit', async () => {
  assert.equal(createPaymentAdapter({PAYMENT_ADAPTER: 'local'}).name, 'local');
  assert.equal((await createPaymentAdapter({PAYMENT_ADAPTER: 'unconfigured'}).pay('o1', 100)).status, 'pending');
  assert.equal((await createSmsAdapter({SMS_ADAPTER: 'unconfigured'}).sendCode('13800138000', 'login')).accepted, false);
  assert.equal(createPushAdapter({}).name, 'unconfigured');
  assert.equal(createPushAdapter({PUSH_ADAPTER: 'local'}).name, 'local');
  assert.equal(createPushAdapter({PUSH_ADAPTER: 'unconfigured'}).name, 'unconfigured');
  assert.equal(createGradingAdapter({GRADING_ADAPTER: 'unconfigured'}).name, 'unconfigured');
  assert.equal(createAIAdapter({AI_ADAPTER: 'unconfigured'}).name, 'unconfigured');
  assert.equal((await createMediaAdapter({}).prepare('c1', 'video')).available, false);
  assert.equal(createWechatAuthAdapter({NODE_ENV: 'production'}).name, 'unconfigured');
  assert.equal(createCarrierAuthAdapter({NODE_ENV: 'production'}).name, 'unconfigured');
  assert.equal((await createWechatAuthAdapter({WECHAT_AUTH_ADAPTER: 'local'}).exchangeCode('local-wechat-test')).providerUserId, 'wx-local-demo');
  assert.equal((await createCarrierAuthAdapter({CARRIER_AUTH_ADAPTER: 'local'}).verifyToken('local-one-click:13800138000')).phone, '13800138000');
});

test('http adapters forward payloads and bearer credentials to a sandbox provider', async () => {
  const received: Array<{url: string; authorization?: string; body: unknown}> = [];
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    received.push({url: req.url ?? '', authorization: req.headers.authorization, body: JSON.parse(raw)});
    res.writeHead(200, {'content-type': 'application/json'});
    if (req.url === '/ai/reply') res.end(JSON.stringify({reply: 'sandbox answer'}));
    else if (req.url === '/media/prepare') res.end(JSON.stringify({available: true, url: 'https://media.invalid/signed', expiresAt: '2099-01-01T00:00:00Z'}));
    else if (req.url === '/sms/verify-code') res.end(JSON.stringify({valid: true}));
    else if (req.url === '/auth/wechat/exchange') res.end(JSON.stringify({providerUserId: 'wx-sandbox', unionId: 'union-sandbox'}));
    else if (req.url === '/auth/carrier/verify') res.end(JSON.stringify({phone: '13800138000', carrier: 'sandbox'}));
    else res.end(JSON.stringify({accepted: true, providerMessageId: 'sandbox-id'}));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('sandbox unavailable');
  const endpoint = `http://127.0.0.1:${address.port}`;
  try {
    const ai = await createAIAdapter({AI_ADAPTER: 'http', AI_PROVIDER_URL: endpoint, AI_PROVIDER_KEY: 'test-key'}).reply('question');
    const media = await createMediaAdapter({MEDIA_ADAPTER: 'http', MEDIA_PROVIDER_URL: endpoint, MEDIA_PROVIDER_KEY: 'test-key'}).prepare('c1', 'video');
    const smsAdapter = createSmsAdapter({SMS_ADAPTER: 'http', SMS_PROVIDER_URL: endpoint, SMS_PROVIDER_KEY: 'test-key'});
    const sms = await smsAdapter.sendCode('13800138000', 'login');
    const smsVerified = await smsAdapter.verifyCode('13800138000', '654321', 'login');
    const wechat = await createWechatAuthAdapter({WECHAT_AUTH_ADAPTER: 'http', WECHAT_AUTH_PROVIDER_URL: endpoint, WECHAT_AUTH_PROVIDER_KEY: 'test-key'}).exchangeCode('provider-code');
    const carrier = await createCarrierAuthAdapter({CARRIER_AUTH_ADAPTER: 'http', CARRIER_AUTH_PROVIDER_URL: endpoint, CARRIER_AUTH_PROVIDER_KEY: 'test-key'}).verifyToken('provider-token');
    assert.equal(ai.reply, 'sandbox answer'); assert.equal(media.available, true); assert.equal(sms.accepted, true); assert.equal(smsVerified.valid, true); assert.equal(wechat.unionId, 'union-sandbox'); assert.equal(carrier.phone, '13800138000');
    assert.deepEqual(received.map(item => item.url), ['/ai/reply', '/media/prepare', '/sms/send-code', '/sms/verify-code', '/auth/wechat/exchange', '/auth/carrier/verify']);
    assert.equal(received.every(item => item.authorization === 'Bearer test-key'), true);
  } finally {
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
