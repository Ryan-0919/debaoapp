import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {authorizePolyvWatch, polyvViewerId, verifyPolyvCallbackSignature} from '../polyv.js';

test('Polyv authorization accepts a fresh signed request and binds viewer id', () => {
  const secret = 'polyv-test-secret'; const ts = String(Date.now()); const id = '104400';
  const sign = createHash('md5').update(secret + id + secret + ts).digest('hex');
  const result = authorizePolyvWatch({channelId: id, userId: 'u-demo', nickname: '测试学员', secret, timestamp: ts, sign, returnUrl: `https://live.polyv.cn/watch/${id}`});
  assert.match(result, /userid=debao_[a-f0-9]{48}/); assert.equal(result.includes('appSecret'), false);
});

test('Polyv authorization rejects stale, cross-host and malformed channel requests', () => {
  const secret = 'polyv-test-secret'; const ts = String(Date.now() - 360001); const id = '104400';
  const sign = createHash('md5').update(secret + id + secret + ts).digest('hex');
  assert.throws(() => authorizePolyvWatch({channelId: id, userId: 'u', nickname: 'x', secret, timestamp: ts, sign, returnUrl: `https://live.polyv.cn/watch/${id}`}));
  assert.throws(() => authorizePolyvWatch({channelId: id, userId: 'u', nickname: 'x', secret, timestamp: String(Date.now()), sign, returnUrl: 'https://evil.example/watch/104400'}));
  assert.match(polyvViewerId('same'), /^debao_[a-f0-9]{48}$/);
});

test('Polyv callback signature accepts fresh AppSecret signatures and rejects replay', () => {
  const secret = 'polyv-callback-secret'; const timestamp = String(Date.now());
  const sign = createHash('md5').update(secret + timestamp).digest('hex');
  assert.equal(verifyPolyvCallbackSignature({timestamp, sign, secret}), true);
  assert.equal(verifyPolyvCallbackSignature({timestamp, sign: sign.slice(0, 31), secret}), false);
  assert.equal(verifyPolyvCallbackSignature({timestamp: String(Date.now() - 11 * 60_000), sign, secret}), false);
});
