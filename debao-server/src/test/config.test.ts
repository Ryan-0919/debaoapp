import test from 'node:test';
import assert from 'node:assert/strict';
import {loadConfig} from '../config.js';

test('config exposes and validates every adapter mode', () => {
  const config = loadConfig({NODE_ENV: 'test', PORT: '4100', PAYMENT_ADAPTER: 'local', SMS_ADAPTER: 'http', PUSH_ADAPTER: 'unconfigured', GRADING_ADAPTER: 'local', AI_ADAPTER: 'http', MEDIA_ADAPTER: 'unconfigured', WECHAT_AUTH_ADAPTER: 'http', CARRIER_AUTH_ADAPTER: 'local'});
  assert.deepEqual({payment: config.paymentAdapter, sms: config.smsAdapter, push: config.pushAdapter, grading: config.gradingAdapter, ai: config.aiAdapter, media: config.mediaAdapter, wechatAuth: config.wechatAuthAdapter, carrierAuth: config.carrierAuthAdapter}, {payment: 'local', sms: 'http', push: 'unconfigured', grading: 'local', ai: 'http', media: 'unconfigured', wechatAuth: 'http', carrierAuth: 'local'});
  assert.throws(() => loadConfig({NODE_ENV: 'test', PORT: '4100', AI_ADAPTER: 'vendor-sdk'}), /Invalid adapter mode/);
});

test('config validates the default and deployment override for refund review threshold', () => {
  assert.equal(loadConfig({NODE_ENV: 'test'}).refundReviewThreshold, 1000);
  assert.equal(loadConfig({NODE_ENV: 'test', DEBAO_REFUND_REVIEW_THRESHOLD: '2500.5'}).refundReviewThreshold, 2500.5);
  assert.throws(() => loadConfig({NODE_ENV: 'test', DEBAO_REFUND_REVIEW_THRESHOLD: '-1'}), /DEBAO_REFUND_REVIEW_THRESHOLD/);
  assert.throws(() => loadConfig({NODE_ENV: 'test', DEBAO_REFUND_REVIEW_THRESHOLD: 'not-a-number'}), /DEBAO_REFUND_REVIEW_THRESHOLD/);
});

test('production configuration fails closed without durable infrastructure and a strong secret', () => {
  const production = {NODE_ENV: 'production', PORT: '4100', DEBAO_AUTH_SECRET: 'a'.repeat(32), DEBAO_ADMIN_PASSWORD: 'a-secure-admin-password', DEBAO_LEARNING_ADMIN_PASSWORD: 'a-secure-learning-password'};
  assert.throws(() => loadConfig(production), /DATABASE_URL is required/);
  assert.throws(() => loadConfig({...production, DATABASE_URL: 'postgres://database/debao'}), /REDIS_URL is required/);
  assert.doesNotThrow(() => loadConfig({...production, DATABASE_URL: 'postgres://database/debao', REDIS_URL: 'redis://cache:6379'}));
});
