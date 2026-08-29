import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {randomUUID} from 'node:crypto';
import {createStore} from './store.js';
import {createPaymentAdapter} from './adapters.js';
import type {Order, Product, Store, UserProfile} from './types.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';
export const store = createStore();
export const paymentAdapter = createPaymentAdapter();

class HttpError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly details?: Record<string, unknown>) {
    super(message);
  }
}

function send(res: ServerResponse, status: number, body: unknown, requestId: string) {
  res.writeHead(status, {'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*'});
  res.end(JSON.stringify(status >= 400 ? {error: {...body as object, requestId}} : {data: body, requestId}));
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'VALIDATION_ERROR', '请求体必须是 JSON 对象');
  }
}

function requireAuth(req: IncomingMessage) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token || (token !== 'demo-token' && !token.startsWith('local-'))) throw new HttpError(401, 'AUTH_REQUIRED', '请先登录');
}

function productFor(id: string): Product {
  const product = store.products.find(item => item.id === id);
  if (!product) throw new HttpError(404, 'NOT_FOUND', '商品不存在');
  return product;
}

function orderFor(id: string): Order {
  const order = store.orders.find(item => item.id === id);
  if (!order) throw new HttpError(404, 'NOT_FOUND', '订单不存在');
  return order;
}

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const requestId = randomUUID();
  if (req.method === 'OPTIONS') { res.writeHead(204, {'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type'}); res.end(); return; }
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname.replace(/\/$/, '') || '/';
  try {
    if (req.method === 'GET' && path === '/v1/health') return send(res, 200, {status: 'ok', service: 'debao-server', paymentAdapter: paymentAdapter.name}, requestId);
    if (req.method === 'GET' && path === '/v1/me') { requireAuth(req); return send(res, 200, store.profile, requestId); }
    if (req.method === 'PATCH' && path === '/v1/me') {
      requireAuth(req); const input = await body(req);
      const next: UserProfile = {...store.profile, ...(typeof input.name === 'string' ? {name: input.name.trim()} : {}), ...(typeof input.examYear === 'string' ? {examYear: input.examYear} : {})};
      if (!next.name || !/^20\d{2}$/.test(next.examYear)) throw new HttpError(422, 'VALIDATION_ERROR', '昵称和考试年份格式不正确');
      store.profile = next; return send(res, 200, next, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/logout') { requireAuth(req); return send(res, 200, {loggedOut: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/notifications') {
      requireAuth(req);
      return send(res, 200, [
        {id: 'n1', title: '今日学习提醒', body: '民法体系精讲还有 2 节待完成。', time: '10 分钟前', read: false},
        {id: 'n2', title: '批改完成', body: '您的主观题答案已完成批改。', time: '昨天', read: false},
        {id: 'n3', title: '订单通知', body: '订单 DB202608270001 已支付成功。', time: '8 月 27 日', read: true},
      ], requestId);
    }
    if (req.method === 'POST' && path === '/v1/notifications/permission') {
      requireAuth(req); return send(res, 200, {granted: false, reason: '系统通知权限需由三端原生模块申请'}, requestId);
    }
    if (req.method === 'GET' && path === '/v1/question-subjects') { requireAuth(req); return send(res, 200, store.subjects, requestId); }
    const draftMatch = path.match(/^\/v1\/question-drafts\/([^/]+)$/);
    if (draftMatch && req.method === 'PUT') {
      requireAuth(req); const input = await body(req); if (typeof input.questionId !== 'string' || !Array.isArray(input.answers)) throw new HttpError(422, 'VALIDATION_ERROR', '题目草稿参数不完整');
      store.drafts.set(draftMatch[1], {questionId: input.questionId, answers: input.answers.map(String), updatedAt: new Date().toISOString()});
      return send(res, 200, {saved: true}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/question-submissions') {
      requireAuth(req); const input = await body(req); const questionId = String(input.questionId ?? ''); const question = store.questions.find(item => item.id === questionId);
      if (!question || !Array.isArray(input.answers)) throw new HttpError(422, 'VALIDATION_ERROR', '题目或答案无效');
      return send(res, 200, {submissionId: `SUB-${Date.now()}`, questionId, correct: Number(input.answers[0]) === question.answer}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/ai/reply') {
      requireAuth(req); const input = await body(req); const prompt = String(input.prompt ?? '').trim();
      if (!prompt) throw new HttpError(422, 'VALIDATION_ERROR', '问题不能为空');
      return send(res, 200, {reply: `本地 AI 适配器回答：“${prompt}”。正式环境需配置 AI provider key、内容审核和配额策略。`}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/media/prepare') {
      requireAuth(req); const input = await body(req); const kind = String(input.kind ?? 'media');
      return send(res, 200, {available: false, reason: `${kind} 媒体适配器尚未配置对象存储/CDN 与播放授权`}, requestId);
    }
    if (req.method === 'GET' && path === '/v1/courses') { requireAuth(req); return send(res, 200, store.courses, requestId); }
    const courseMatch = path.match(/^\/v1\/courses\/([^/]+)$/);
    if (courseMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, store.courses.find(item => item.id === courseMatch[1]) ?? null, requestId); }
    if (req.method === 'GET' && path === '/v1/orders') { requireAuth(req); return send(res, 200, store.orders, requestId); }
    const orderMatch = path.match(/^\/v1\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, orderFor(orderMatch[1]), requestId); }
    if (req.method === 'POST' && path === '/v1/orders') {
      requireAuth(req); const input = await body(req); const product = productFor(String(input.productId ?? '')); const existing = typeof input.clientRequestId === 'string' && store.orders.find(order => order.id === input.clientRequestId);
      if (existing) return send(res, 200, existing, requestId);
      const order: Order = {id: `DB${Date.now()}`, productId: product.id, productName: product.name, amount: product.price, status: 'pending', createdAt: new Date().toISOString()}; store.orders.unshift(order); return send(res, 201, order, requestId);
    }
    const payMatch = path.match(/^\/v1\/orders\/([^/]+)\/pay$/);
    if (payMatch && req.method === 'POST') { requireAuth(req); const order = orderFor(payMatch[1]); if (order.status === 'paid') return send(res, 200, {status: 'paid', transactionId: `EXISTING-${order.id}`}, requestId); const result = await paymentAdapter.pay(order.id, order.amount); if (result.status === 'paid') order.status = 'paid'; return send(res, 200, result, requestId); }
    throw new HttpError(404, 'NOT_FOUND', '接口不存在');
  } catch (error) {
    if (error instanceof HttpError) return send(res, error.status, {code: error.code, message: error.message, ...(error.details ? {details: error.details} : {})}, requestId);
    console.error(error); return send(res, 500, {code: 'INTERNAL_ERROR', message: '服务暂时不可用'}, requestId);
  }
}

// The test runner imports this module to reuse the request handler. Do not bind
// the production listener when Node is running with `--test`.
