import {type IncomingMessage, type ServerResponse} from 'node:http';
import {createHash, randomUUID} from 'node:crypto';
import {createStore} from './store.js';
import {createPaymentAdapter, gradingAdapter, pushAdapter, smsAdapter} from './adapters.js';
import {loadConfig} from './config.js';
import {Infrastructure} from './infrastructure.js';
import type {Order, Product, UserProfile} from './types.js';

export const config = loadConfig();
export const store = createStore();
export const paymentAdapter = createPaymentAdapter();
export const infrastructure = new Infrastructure(config);
const DEMO_DB_USER_ID = '00000000-0000-0000-0000-000000000001';

function dbUserId(userId: string) { return userId === 'u-demo' ? DEMO_DB_USER_ID : userId; }
async function persist(text: string, values: unknown[] = []) { await infrastructure.query(text, values); }
function tokenHash(value: string) { return createHash('sha256').update(value).digest('hex'); }
async function sessionByRefreshToken(refreshToken: string) {
  const memory = [...store.sessions.values()].find(item => item.refreshToken === refreshToken && !item.revokedAt && Date.parse(item.expiresAt) > Date.now());
  if (memory) return memory;
  const cached = await infrastructure.cacheGet<{userId: string; refreshToken: string; deviceId: string; expiresAt: string}>(`session:${tokenHash(refreshToken)}`);
  if (cached && Date.parse(cached.expiresAt) > Date.now()) return cached;
  const result = await infrastructure.query<{user_id: string; device_id: string; expires_at: string}>('select user_id, device_id, expires_at from refresh_sessions where token_hash = $1 and revoked_at is null and expires_at > now()', [tokenHash(refreshToken)]);
  const row = result?.rows[0];
  return row ? {userId: row.user_id === DEMO_DB_USER_ID ? 'u-demo' : row.user_id, refreshToken, deviceId: row.device_id, expiresAt: new Date(row.expires_at).toISOString()} : undefined;
}

export async function hydrateStore() {
  const profile = await infrastructure.query<{name: string; phone: string; exam_year: string; study_days: number}>('select name, phone, exam_year, study_days from users order by created_at asc limit 1');
  if (profile?.rows[0]) store.profile = {...store.profile, name: profile.rows[0].name, phone: profile.rows[0].phone, examYear: profile.rows[0].exam_year, studyDays: profile.rows[0].study_days};
  const courses = await infrastructure.query<{id: string; title: string; teacher: string; type: 'video' | 'audio' | 'live'; progress: number; lessons: number; accent: string}>('select id, title, teacher, type, progress, lessons, accent from courses order by id');
  if (courses?.rows.length) store.courses = courses.rows;
  const products = await infrastructure.query<{id: string; name: string; category: string; price: number; original_price: number; sold: number; accent: string; benefits: string[]}>('select id, name, category, price::float, original_price::float, sold, accent, benefits from products order by id');
  if (products?.rows.length) store.products = products.rows.map(item => ({id: item.id, name: item.name, category: item.category, price: item.price, originalPrice: item.original_price, sold: item.sold, accent: item.accent, benefits: item.benefits}));
  const orders = await infrastructure.query<{id: string; product_id: string; amount: number; status: 'paid' | 'pending' | 'closed'; created_at: string; product_name: string}>('select o.id, o.product_id, o.amount::float, o.status, o.created_at, p.name as product_name from orders o join products p on p.id = o.product_id order by o.created_at desc');
  if (orders?.rows.length) store.orders = orders.rows.map(item => ({id: item.id, productId: item.product_id, productName: item.product_name, amount: item.amount, status: item.status, createdAt: new Date(item.created_at).toISOString()}));
  const plans = await infrastructure.query<{id: string; user_id: string; title: string; daily_minutes: number; start_date: string; end_date: string; status: 'active' | 'completed' | 'archived'}>('select id, user_id, title, daily_minutes, start_date, end_date, status from learning_plans order by created_at desc');
  if (plans?.rows.length) store.learningPlans = plans.rows.map(item => ({id: item.id, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, title: item.title, dailyMinutes: item.daily_minutes, startDate: item.start_date, endDate: item.end_date, status: item.status}));
  const questions = await infrastructure.query<{id: string; stem: string; options: string[]; answer: number; analysis: string}>('select id, stem, options, answer, analysis from questions order by id');
  if (questions?.rows.length) store.questions = questions.rows;
  const submissions = await infrastructure.query<{id: string; user_id: string; question_id: string; answers: string[]; score: number; created_at: string}>('select id, user_id, question_id, answers, score::float, created_at from question_submissions order by created_at desc');
  if (submissions?.rows.length) store.submissions = submissions.rows.map(item => ({id: item.id, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, questionId: item.question_id, answers: item.answers, correct: Number(item.score) > 0, createdAt: new Date(item.created_at).toISOString()}));
  const tasks = await infrastructure.query<{id: string; plan_id: string; title: string; due_date: string; minutes: number; status: 'todo' | 'done' | 'overdue'}>('select id, plan_id, title, due_date, minutes, status from learning_tasks order by due_date, id');
  if (tasks?.rows.length) store.learningTasks = tasks.rows.map(item => ({id: item.id, planId: item.plan_id, title: item.title, dueDate: item.due_date, minutes: item.minutes, status: item.status}));
  const favorites = await infrastructure.query<{user_id: string; question_id: string; created_at: string}>('select user_id, question_id, created_at from favorites order by created_at desc');
  if (favorites?.rows.length) store.favorites = favorites.rows.map(item => ({id: `favorite:${item.question_id}`, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, questionId: item.question_id, createdAt: new Date(item.created_at).toISOString()}));
  const mistakes = await infrastructure.query<{user_id: string; question_id: string; wrong_count: number; last_answer: string}>('select user_id, question_id, wrong_count, last_answer from mistakes where resolved_at is null');
  if (mistakes?.rows.length) store.mistakes = mistakes.rows.map(item => ({id: `mistake:${item.question_id}`, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, questionId: item.question_id, wrongCount: item.wrong_count, lastAnswer: item.last_answer ?? '', resolved: false}));
  const entitlements = await infrastructure.query<{user_id: string; course_id: string; source_order_id: string; expires_at?: string}>('select user_id, course_id, source_order_id, expires_at from course_entitlements');
  if (entitlements?.rows.length) store.entitlements = entitlements.rows.map(item => ({userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, courseId: item.course_id, sourceOrderId: item.source_order_id, expiresAt: item.expires_at ? new Date(item.expires_at).toISOString() : undefined}));
  const grading = await infrastructure.query<{id: string; user_id: string; question_id?: string; file_url?: string; status: 'queued' | 'processing' | 'completed' | 'rejected'; score?: number; feedback?: string; created_at: string}>('select id, user_id, question_id, file_url, status, score::float, feedback, created_at from grading_submissions order by created_at desc');
  if (grading?.rows.length) store.grading = grading.rows.map(item => ({id: item.id, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, questionId: item.question_id, fileUrl: item.file_url, status: item.status, score: item.score, feedback: item.feedback, createdAt: new Date(item.created_at).toISOString()}));
  const legalDocuments = await infrastructure.query<{id: string; title: string; article: string; content: string; effective_from: string; effective_to?: string}>('select id, title, article, content, effective_from, effective_to from legal_documents order by id');
  if (legalDocuments?.rows.length) store.legalDocuments = legalDocuments.rows.map(item => ({id: item.id, title: item.title, article: item.article, content: item.content, effectiveFrom: item.effective_from, effectiveTo: item.effective_to}));
  const announcements = await infrastructure.query<{id: string; title: string; body: string; status: 'draft' | 'published'; starts_at?: string; ends_at?: string; created_at: string}>('select id, title, body, status, starts_at, ends_at, created_at from announcements order by created_at desc');
  if (announcements?.rows.length) store.announcements = announcements.rows.map(item => ({id: item.id, title: item.title, body: item.body, status: item.status, startsAt: item.starts_at ? new Date(item.starts_at).toISOString() : undefined, endsAt: item.ends_at ? new Date(item.ends_at).toISOString() : undefined, createdAt: new Date(item.created_at).toISOString()}));
  const banners = await infrastructure.query<{id: string; title: string; image_url: string; target: string; starts_at: string; ends_at?: string}>('select id, title, image_url, target, starts_at, ends_at from banners order by starts_at desc');
  if (banners?.rows.length) store.banners = banners.rows.map(item => ({id: item.id, title: item.title, imageUrl: item.image_url, target: item.target, startsAt: new Date(item.starts_at).toISOString(), endsAt: item.ends_at ? new Date(item.ends_at).toISOString() : undefined}));
  const devices = await infrastructure.query<{id: string; user_id: string; platform: 'android' | 'ios' | 'harmony'; name: string; push_token?: string; last_seen_at: string}>('select id, user_id, platform, name, push_token, last_seen_at from devices order by last_seen_at desc');
  if (devices?.rows.length) store.devices = devices.rows.map(item => ({id: item.id, userId: item.user_id === DEMO_DB_USER_ID ? 'u-demo' : item.user_id, platform: item.platform, name: item.name, pushToken: item.push_token, lastSeenAt: new Date(item.last_seen_at).toISOString()}));
  const forumPosts = await infrastructure.query<{id: string; user_name: string; title: string; body: string; likes: number; created_at: string}>('select p.id, coalesce(u.name, \'用户\') as user_name, p.title, p.body, p.likes, p.created_at from forum_posts p left join users u on u.id = p.user_id where p.status = \'published\' order by p.created_at desc');
  if (forumPosts?.rows.length) store.forumPosts = forumPosts.rows.map(item => ({id: item.id, userName: item.user_name, title: item.title, body: item.body, likes: item.likes, createdAt: new Date(item.created_at).toISOString()}));
}

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

function accessToken(req: IncomingMessage) {
  return req.headers.authorization?.replace(/^Bearer\s+/i, '');
}

function requireAuth(req: IncomingMessage) {
  const token = accessToken(req);
  if (!token || (token !== 'demo-token' && !store.sessions.has(token))) throw new HttpError(401, 'AUTH_REQUIRED', '请先登录');
  const session = store.sessions.get(token);
  if (session?.revokedAt || (session && Date.parse(session.expiresAt) <= Date.now())) throw new HttpError(401, 'AUTH_REQUIRED', '登录状态已失效');
  return session?.userId ?? 'u-demo';
}

function requireAdmin(req: IncomingMessage) {
  const token = accessToken(req);
  if (token !== 'admin-token') throw new HttpError(403, 'FORBIDDEN', '需要运营管理员权限');
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
    if (req.method === 'GET' && path === '/v1/health') { const infra = await infrastructure.status(); return send(res, 200, {status: 'ok', service: 'debao-server', paymentAdapter: paymentAdapter.name, ...infra}, requestId); }
    if (req.method === 'POST' && path === '/v1/auth/send-code') {
      const input = await body(req); const phone = String(input.phone ?? '').trim(); if (!/^1\d{10}$/.test(phone)) throw new HttpError(422, 'VALIDATION_ERROR', '手机号格式不正确'); const result = await smsAdapter.sendCode(phone); return send(res, 200, {accepted: result.accepted, expiresIn: 300, ...(smsAdapter.name === 'local' ? {developmentCode: '123456'} : {})}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/login') {
      const input = await body(req); const phone = String(input.phone ?? '').trim(); const code = String(input.code ?? '').trim();
      if (!/^1\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) throw new HttpError(422, 'VALIDATION_ERROR', '手机号或验证码格式不正确');
      if (code !== '123456') throw new HttpError(401, 'AUTH_CODE_INVALID', '验证码错误或已过期');
      const access = `local-${randomUUID()}`; const refresh = `refresh-${randomUUID()}`; const deviceId = String(input.deviceId ?? `device-${randomUUID()}`);
      store.sessions.set(access, {userId: store.profile.id, refreshToken: refresh, deviceId, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()});
      await persist('insert into refresh_sessions (user_id, token_hash, device_id, expires_at) values ($1, $2, $3, $4)', [DEMO_DB_USER_ID, tokenHash(refresh), deviceId, new Date(Date.now() + 7 * 86400000).toISOString()]);
      await infrastructure.cacheSet(`session:${tokenHash(refresh)}`, {userId: store.profile.id, refreshToken: refresh, deviceId, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()}, 604800);
      store.profile = {...store.profile, phone: `${phone.slice(0, 3)}****${phone.slice(-4)}`};
      return send(res, 200, {accessToken: access, refreshToken: refresh, expiresIn: 604800, profile: store.profile}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/refresh') {
      const input = await body(req); const refresh = String(input.refreshToken ?? ''); const session = await sessionByRefreshToken(refresh);
      if (!session) throw new HttpError(401, 'AUTH_REQUIRED', 'refresh token 无效');
      const access = `local-${randomUUID()}`; const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString(); store.sessions.set(access, {...session, expiresAt});
      return send(res, 200, {accessToken: access, refreshToken: refresh, expiresIn: 604800}, requestId);
    }
    if (req.method === 'GET' && path === '/v1/me') { requireAuth(req); return send(res, 200, store.profile, requestId); }
    if (req.method === 'PATCH' && path === '/v1/me') {
      const userId = requireAuth(req); const input = await body(req);
      const next: UserProfile = {...store.profile, ...(typeof input.name === 'string' ? {name: input.name.trim()} : {}), ...(typeof input.examYear === 'string' ? {examYear: input.examYear} : {})};
      if (!next.name || !/^20\d{2}$/.test(next.examYear)) throw new HttpError(422, 'VALIDATION_ERROR', '昵称和考试年份格式不正确');
      store.profile = next; await persist('insert into users (id, name, phone, exam_year, study_days) values ($1, $2, $3, $4, $5) on conflict (id) do update set name = excluded.name, phone = excluded.phone, exam_year = excluded.exam_year, study_days = excluded.study_days, updated_at = now()', [dbUserId(userId), next.name, next.phone, next.examYear, next.studyDays]); return send(res, 200, next, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/logout') { const token = accessToken(req); requireAuth(req); if (token) { const session = store.sessions.get(token); if (session) { session.revokedAt = new Date().toISOString(); await persist('update refresh_sessions set revoked_at = now() where token_hash = $1', [tokenHash(session.refreshToken)]); await infrastructure.cacheDelete(`session:${tokenHash(session.refreshToken)}`); } } return send(res, 200, {loggedOut: true}, requestId); }
    if (req.method === 'POST' && path === '/v1/account/deletion') { const userId = requireAuth(req); store.profile = {...store.profile, name: '已注销用户', phone: '已脱敏', studyDays: 0}; for (const session of store.sessions.values()) if (session.userId === userId) session.revokedAt = new Date().toISOString(); await persist('update refresh_sessions set revoked_at = now() where user_id = $1 and revoked_at is null', [dbUserId(userId)]); await persist('insert into account_deletion_requests (user_id, execute_after) values ($1, now() + interval \'7 days\')', [dbUserId(userId)]); return send(res, 200, {scheduled: true, coolingOffDays: 7}, requestId); }
    if (req.method === 'GET' && path === '/v1/devices') { const userId = requireAuth(req); return send(res, 200, store.devices.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/devices') { const userId = requireAuth(req); const input = await body(req); const platform = String(input.platform ?? 'android'); if (!['android', 'ios', 'harmony'].includes(platform)) throw new HttpError(422, 'VALIDATION_ERROR', '不支持的平台'); const device = {id: String(input.deviceId ?? randomUUID()), userId, platform: platform as 'android' | 'ios' | 'harmony', name: String(input.name ?? '未命名设备'), pushToken: typeof input.pushToken === 'string' ? input.pushToken : undefined, lastSeenAt: new Date().toISOString()}; store.devices = [device, ...store.devices.filter(item => item.id !== device.id)]; await persist('insert into devices (id, user_id, platform, name, push_token, last_seen_at) values ($1, $2, $3, $4, $5, $6) on conflict (id) do update set name = excluded.name, push_token = excluded.push_token, last_seen_at = excluded.last_seen_at', [device.id, dbUserId(userId), device.platform, device.name, device.pushToken ?? null, device.lastSeenAt]); return send(res, 201, device, requestId); }
    const deviceMatch = path.match(/^\/v1\/devices\/([^/]+)$/);
    if (deviceMatch && req.method === 'DELETE') { const userId = requireAuth(req); store.devices = store.devices.filter(item => !(item.id === deviceMatch[1] && item.userId === userId)); await persist('delete from devices where id = $1 and user_id = $2', [deviceMatch[1], dbUserId(userId)]); return send(res, 200, {removed: true}, requestId); }
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
    if (req.method === 'GET' && path === '/v1/questions') {
      requireAuth(req); const subject = url.searchParams.get('subjectId'); const page = Math.max(1, Number(url.searchParams.get('page') ?? 1)); const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20))); const filtered = subject ? store.questions.filter(item => item.id.startsWith(subject)) : store.questions; return send(res, 200, {items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length}, requestId);
    }
    const questionMatch = path.match(/^\/v1\/questions\/([^/]+)$/);
    if (questionMatch && req.method === 'GET') { requireAuth(req); const question = store.questions.find(item => item.id === questionMatch[1]); if (!question) throw new HttpError(404, 'NOT_FOUND', '题目不存在'); return send(res, 200, question, requestId); }
    const draftMatch = path.match(/^\/v1\/question-drafts\/([^/]+)$/);
    if (draftMatch && req.method === 'PUT') {
      requireAuth(req); const input = await body(req); if (typeof input.questionId !== 'string' || !Array.isArray(input.answers)) throw new HttpError(422, 'VALIDATION_ERROR', '题目草稿参数不完整');
      const userId = requireAuth(req); const updatedAt = new Date().toISOString(); store.drafts.set(draftMatch[1], {questionId: input.questionId, answers: input.answers.map(String), updatedAt}); await persist('insert into question_drafts (user_id, question_id, answers, updated_at) values ($1, $2, $3::jsonb, $4) on conflict (user_id, question_id) do update set answers = excluded.answers, updated_at = excluded.updated_at', [dbUserId(userId), input.questionId, JSON.stringify(input.answers), updatedAt]);
      return send(res, 200, {saved: true}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/question-submissions') {
      requireAuth(req); const input = await body(req); const questionId = String(input.questionId ?? ''); const question = store.questions.find(item => item.id === questionId);
      if (!question || !Array.isArray(input.answers)) throw new HttpError(422, 'VALIDATION_ERROR', '题目或答案无效');
      const userId = requireAuth(req); const correct = Number(input.answers[0]) === question.answer; const submission = {id: randomUUID(), userId, questionId, answers: input.answers.map(String), correct, createdAt: new Date().toISOString()}; store.submissions.unshift(submission); await persist('insert into question_submissions (id, user_id, question_id, answers, score) values ($1, $2, $3, $4::jsonb, $5)', [submission.id, dbUserId(userId), questionId, JSON.stringify(submission.answers), correct ? 1 : 0]); if (!correct) { const lastAnswer = String(input.answers[0] ?? ''); const old = store.mistakes.find(item => item.userId === userId && item.questionId === questionId); if (old) { old.wrongCount += 1; old.lastAnswer = lastAnswer; old.resolved = false; } else store.mistakes.unshift({id: `mistake:${questionId}`, userId, questionId, wrongCount: 1, lastAnswer, resolved: false}); await persist('insert into mistakes (user_id, question_id, wrong_count, last_answer, resolved_at) values ($1, $2, 1, $3, null) on conflict (user_id, question_id) do update set wrong_count = mistakes.wrong_count + 1, last_answer = excluded.last_answer, resolved_at = null', [dbUserId(userId), questionId, lastAnswer]); } return send(res, 200, {submissionId: submission.id, questionId, correct}, requestId);
    }
    if (req.method === 'GET' && path === '/v1/question-records') { const userId = requireAuth(req); return send(res, 200, store.submissions.filter(item => item.userId === userId), requestId); }
    const reportMatch = path.match(/^\/v1\/question-submissions\/([^/]+)\/report$/);
    if (reportMatch && req.method === 'GET') { const userId = requireAuth(req); const submission = store.submissions.find(item => item.id === reportMatch[1] && item.userId === userId); if (!submission) throw new HttpError(404, 'NOT_FOUND', '答题记录不存在'); const question = store.questions.find(item => item.id === submission.questionId); return send(res, 200, {...submission, analysis: question?.analysis ?? ''}, requestId); }
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
    const entitlementMatch = path.match(/^\/v1\/courses\/([^/]+)\/entitlement$/);
    if (entitlementMatch && req.method === 'GET') { const userId = requireAuth(req); const entitlement = store.entitlements.find(item => item.userId === userId && item.courseId === entitlementMatch[1]); return send(res, 200, entitlement ? {hasAccess: true, ...entitlement} : {hasAccess: false}, requestId); }
    const progressMatch = path.match(/^\/v1\/courses\/([^/]+)\/progress$/);
    if (progressMatch && req.method === 'POST') { requireAuth(req); const course = store.courses.find(item => item.id === progressMatch[1]); if (!course) throw new HttpError(404, 'NOT_FOUND', '课程不存在'); const input = await body(req); const progress = Math.min(100, Math.max(0, Number(input.progress ?? course.progress))); course.progress = Number.isFinite(progress) ? progress : course.progress; await persist('update courses set progress = $1 where id = $2', [course.progress, course.id]); return send(res, 200, {courseId: course.id, progress: course.progress, updatedAt: new Date().toISOString()}, requestId); }

    if (req.method === 'GET' && path === '/v1/learning/plans') { const userId = requireAuth(req); return send(res, 200, store.learningPlans.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/learning/plans') { const userId = requireAuth(req); const input = await body(req); if (!String(input.title ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '计划标题不能为空'); const plan = {id: `plan-${randomUUID()}`, userId, title: String(input.title).trim(), dailyMinutes: Math.max(1, Number(input.dailyMinutes ?? 60)), startDate: String(input.startDate ?? new Date().toISOString().slice(0, 10)), endDate: String(input.endDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)), status: 'active' as const}; store.learningPlans.unshift(plan); await persist('insert into learning_plans (id, user_id, title, daily_minutes, start_date, end_date, status) values ($1, $2, $3, $4, $5, $6, $7)', [plan.id, dbUserId(userId), plan.title, plan.dailyMinutes, plan.startDate, plan.endDate, plan.status]); return send(res, 201, plan, requestId); }
    const planMatch = path.match(/^\/v1\/learning\/plans\/([^/]+)$/);
    if (planMatch && req.method === 'PATCH') { const userId = requireAuth(req); const plan = store.learningPlans.find(item => item.id === planMatch[1] && item.userId === userId); if (!plan) throw new HttpError(404, 'NOT_FOUND', '学习计划不存在'); const input = await body(req); if (typeof input.title === 'string') plan.title = input.title.trim(); if (typeof input.status === 'string' && ['active', 'completed', 'archived'].includes(input.status)) plan.status = input.status as typeof plan.status; await persist('update learning_plans set title = $1, status = $2, updated_at = now() where id = $3 and user_id = $4', [plan.title, plan.status, plan.id, dbUserId(userId)]); return send(res, 200, plan, requestId); }
    if (planMatch && req.method === 'DELETE') { const userId = requireAuth(req); store.learningPlans = store.learningPlans.filter(item => !(item.id === planMatch[1] && item.userId === userId)); store.learningTasks = store.learningTasks.filter(item => item.planId !== planMatch[1]); await persist('delete from learning_plans where id = $1 and user_id = $2', [planMatch[1], dbUserId(userId)]); return send(res, 200, {deleted: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/learning/tasks') { const userId = requireAuth(req); const plans = new Set(store.learningPlans.filter(item => item.userId === userId).map(item => item.id)); return send(res, 200, store.learningTasks.filter(item => plans.has(item.planId)), requestId); }
    const taskMatch = path.match(/^\/v1\/learning\/tasks\/([^/]+)\/complete$/);
    if (taskMatch && req.method === 'POST') { const userId = requireAuth(req); const plans = new Set(store.learningPlans.filter(item => item.userId === userId).map(item => item.id)); const task = store.learningTasks.find(item => item.id === taskMatch[1] && plans.has(item.planId)); if (!task) throw new HttpError(404, 'NOT_FOUND', '学习任务不存在'); task.status = 'done'; await persist('update learning_tasks set status = \'done\', completed_at = now() where id = $1 and plan_id = any($2::text[])', [task.id, [...plans]]); return send(res, 200, task, requestId); }
    if (req.method === 'GET' && path === '/v1/learning/report') { const userId = requireAuth(req); const submissions = store.submissions.filter(item => item.userId === userId); const correct = submissions.filter(item => item.correct).length; const plans = new Set(store.learningPlans.filter(item => item.userId === userId).map(item => item.id)); const minutes = store.learningTasks.filter(item => plans.has(item.planId) && item.status === 'done').reduce((sum, item) => sum + item.minutes, 0); return send(res, 200, {period: url.searchParams.get('period') ?? 'week', minutes, answered: submissions.length, correctRate: submissions.length ? Math.round((correct / submissions.length) * 100) : 0, subjects: store.subjects.map(item => ({subjectId: item.id, minutes: 0, correctRate: 0}))}, requestId); }
    if (req.method === 'GET' && path === '/v1/mistakes') { const userId = requireAuth(req); return send(res, 200, store.mistakes.filter(item => item.userId === userId && !item.resolved).map(item => ({...item, question: store.questions.find(question => question.id === item.questionId)})), requestId); }
    const mistakeMatch = path.match(/^\/v1\/mistakes\/([^/]+)$/);
    if (mistakeMatch && req.method === 'DELETE') { const userId = requireAuth(req); const mistake = store.mistakes.find(item => item.id === mistakeMatch[1] && item.userId === userId); if (mistake) { mistake.resolved = true; await persist('update mistakes set resolved_at = now() where user_id = $1 and question_id = $2', [dbUserId(userId), mistake.questionId]); } return send(res, 200, {resolved: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/favorites') { const userId = requireAuth(req); return send(res, 200, store.favorites.filter(item => item.userId === userId).map(item => ({...item, question: store.questions.find(question => question.id === item.questionId)})), requestId); }
    if (req.method === 'POST' && path === '/v1/favorites') { const userId = requireAuth(req); const input = await body(req); const questionId = String(input.questionId ?? ''); if (!store.questions.some(item => item.id === questionId)) throw new HttpError(404, 'NOT_FOUND', '题目不存在'); const existing = store.favorites.find(item => item.userId === userId && item.questionId === questionId); const favorite = existing ?? {id: `favorite:${questionId}`, userId, questionId, createdAt: new Date().toISOString()}; if (!existing) { store.favorites.unshift(favorite); await persist('insert into favorites (user_id, question_id, created_at) values ($1, $2, $3) on conflict (user_id, question_id) do nothing', [dbUserId(userId), questionId, favorite.createdAt]); } return send(res, existing ? 200 : 201, favorite, requestId); }
    const favoriteMatch = path.match(/^\/v1\/favorites\/([^/]+)$/);
    if (favoriteMatch && req.method === 'DELETE') { const userId = requireAuth(req); const favorite = store.favorites.find(item => item.id === favoriteMatch[1] && item.userId === userId); store.favorites = store.favorites.filter(item => !(item.id === favoriteMatch[1] && item.userId === userId)); if (favorite) await persist('delete from favorites where user_id = $1 and question_id = $2', [dbUserId(userId), favorite.questionId]); return send(res, 200, {removed: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/grading/submissions') { const userId = requireAuth(req); return send(res, 200, store.grading.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/grading/submissions') { const userId = requireAuth(req); const input = await body(req); if (!input.fileUrl && !input.questionId) throw new HttpError(422, 'VALIDATION_ERROR', '请提交答题文件或题目答案'); const item = {id: `grade-${randomUUID()}`, userId, questionId: typeof input.questionId === 'string' ? input.questionId : undefined, fileUrl: typeof input.fileUrl === 'string' ? input.fileUrl : undefined, status: 'queued' as const, createdAt: new Date().toISOString()}; store.grading.unshift(item); await persist('insert into grading_submissions (id, user_id, question_id, file_url, status, created_at) values ($1, $2, $3, $4, $5, $6)', [item.id, dbUserId(userId), item.questionId ?? null, item.fileUrl ?? null, item.status, item.createdAt]); await gradingAdapter.enqueue(item.id); return send(res, 201, {...item, adapter: gradingAdapter.name}, requestId); }
    const gradingMatch = path.match(/^\/v1\/grading\/submissions\/([^/]+)$/);
    if (gradingMatch && req.method === 'GET') { const userId = requireAuth(req); const item = store.grading.find(entry => entry.id === gradingMatch[1] && entry.userId === userId); if (!item) throw new HttpError(404, 'NOT_FOUND', '批改记录不存在'); return send(res, 200, item, requestId); }
    const gradingRetryMatch = path.match(/^\/v1\/grading\/submissions\/([^/]+)\/retry$/);
    if (gradingRetryMatch && req.method === 'POST') { const userId = requireAuth(req); const item = store.grading.find(entry => entry.id === gradingRetryMatch[1] && entry.userId === userId); if (!item) throw new HttpError(404, 'NOT_FOUND', '批改记录不存在'); item.status = 'queued'; await persist('update grading_submissions set status = \'queued\', completed_at = null where id = $1 and user_id = $2', [item.id, dbUserId(userId)]); return send(res, 200, item, requestId); }
    if (req.method === 'GET' && path === '/v1/announcements') { requireAuth(req); return send(res, 200, store.announcements.filter(item => item.status === 'published'), requestId); }
    if (req.method === 'GET' && path === '/v1/home') { requireAuth(req); return send(res, 200, {banners: store.banners.filter(item => !item.endsAt || Date.parse(item.endsAt) > Date.now()), announcements: store.announcements.filter(item => item.status === 'published').slice(0, 3), hotCourses: store.courses.slice(0, 3), exam: {year: '2026', daysRemaining: 42}}, requestId); }
    if (req.method === 'GET' && path === '/v1/products') { requireAuth(req); return send(res, 200, store.products, requestId); }
    const productMatch = path.match(/^\/v1\/products\/([^/]+)$/);
    if (productMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, productFor(productMatch[1]), requestId); }
    if (req.method === 'GET' && path === '/v1/law/search') { requireAuth(req); const query = (url.searchParams.get('q') ?? '').trim(); if (!query) throw new HttpError(422, 'VALIDATION_ERROR', '搜索关键词不能为空'); const results = store.legalDocuments.filter(item => `${item.title}${item.article}${item.content}`.includes(query)); return send(res, 200, {items: results, total: results.length, query}, requestId); }
    if (req.method === 'GET' && path === '/v1/forum/posts') { requireAuth(req); return send(res, 200, store.forumPosts, requestId); }
    if (req.method === 'POST' && path === '/v1/forum/posts') { const userId = requireAuth(req); const input = await body(req); if (!String(input.title ?? '').trim() || !String(input.body ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '帖子标题和正文不能为空'); const post = {id: `post-${randomUUID()}`, userName: userId === 'u-demo' ? store.profile.name : '用户', title: String(input.title).trim(), body: String(input.body).trim(), likes: 0, createdAt: new Date().toISOString()}; store.forumPosts.unshift(post); await persist('insert into forum_posts (id, user_id, title, body, likes, status, created_at) values ($1, $2, $3, $4, 0, \'published\', $5)', [post.id, dbUserId(userId), post.title, post.body, post.createdAt]); return send(res, 201, post, requestId); }
    if (req.method === 'GET' && path === '/v1/admin/overview') { requireAdmin(req); return send(res, 200, {users: 1, courses: store.courses.length, products: store.products.length, orders: store.orders.length, submissions: store.submissions.length, gradingQueue: store.grading.filter(item => item.status === 'queued').length}, requestId); }
    if (req.method === 'GET' && path === '/v1/admin/orders') { requireAdmin(req); return send(res, 200, store.orders, requestId); }
    if (req.method === 'POST' && path === '/v1/admin/push/test') { requireAdmin(req); const input = await body(req); const token = String(input.deviceToken ?? ''); if (!token) throw new HttpError(422, 'VALIDATION_ERROR', 'deviceToken 不能为空'); return send(res, 200, await pushAdapter.send(token, String(input.title ?? '得宝通知'), String(input.body ?? '测试推送')), requestId); }
    if (req.method === 'POST' && path === '/v1/admin/announcements') { requireAdmin(req); const input = await body(req); if (!String(input.title ?? '').trim() || !String(input.body ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '公告标题和正文不能为空'); const announcement = {id: `a-${randomUUID()}`, title: String(input.title).trim(), body: String(input.body).trim(), status: input.status === 'draft' ? 'draft' as const : 'published' as const, startsAt: typeof input.startsAt === 'string' ? input.startsAt : undefined, endsAt: typeof input.endsAt === 'string' ? input.endsAt : undefined, createdAt: new Date().toISOString()}; store.announcements.unshift(announcement); await persist('insert into announcements (id, title, body, status, starts_at, ends_at, created_at) values ($1, $2, $3, $4, $5, $6, $7)', [announcement.id, announcement.title, announcement.body, announcement.status, announcement.startsAt ?? null, announcement.endsAt ?? null, announcement.createdAt]); return send(res, 201, announcement, requestId); }
    if (req.method === 'GET' && path === '/v1/orders') { requireAuth(req); return send(res, 200, store.orders, requestId); }
    const orderMatch = path.match(/^\/v1\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, orderFor(orderMatch[1]), requestId); }
    if (req.method === 'POST' && path === '/v1/orders') {
      const userId = requireAuth(req); const input = await body(req); const product = productFor(String(input.productId ?? '')); const clientRequestId = String(input.clientRequestId ?? ''); if (!clientRequestId) throw new HttpError(422, 'VALIDATION_ERROR', 'clientRequestId 不能为空'); const existing = store.orders.find(order => order.clientRequestId === clientRequestId);
      if (existing) return send(res, 200, existing, requestId);
      const order: Order = {id: `DB${Date.now()}-${randomUUID().slice(0, 6)}`, productId: product.id, clientRequestId, productName: product.name, amount: product.price, status: 'pending', createdAt: new Date().toISOString()}; store.orders.unshift(order); await persist('insert into orders (id, user_id, product_id, amount, status, client_request_id, created_at) values ($1, $2, $3, $4, $5, $6, $7) on conflict (client_request_id) do nothing', [order.id, dbUserId(userId), order.productId, order.amount, order.status, order.clientRequestId, order.createdAt]); return send(res, 201, order, requestId);
    }
    const payMatch = path.match(/^\/v1\/orders\/([^/]+)\/pay$/);
    if (payMatch && req.method === 'POST') { const userId = requireAuth(req); const order = orderFor(payMatch[1]); if (order.status === 'paid') return send(res, 200, {status: 'paid', transactionId: `EXISTING-${order.id}`}, requestId); const result = await paymentAdapter.pay(order.id, order.amount); if (result.status === 'paid') { order.status = 'paid'; const courseId = order.productId === 'p1' ? 'c1' : order.productId === 'p2' ? 'c3' : 'c2'; store.entitlements.unshift({userId, courseId, sourceOrderId: order.id}); await persist('update orders set status = $1, paid_at = now() where id = $2', ['paid', order.id]); await persist('insert into course_entitlements (user_id, course_id, source_order_id) values ($1, $2, $3) on conflict (user_id, course_id) do nothing', [dbUserId(userId), courseId, order.id]); } return send(res, 200, result, requestId); }
    throw new HttpError(404, 'NOT_FOUND', '接口不存在');
  } catch (error) {
    if (error instanceof HttpError) return send(res, error.status, {code: error.code, message: error.message, ...(error.details ? {details: error.details} : {})}, requestId);
    console.error(error); return send(res, 500, {code: 'INTERNAL_ERROR', message: '服务暂时不可用'}, requestId);
  }
}
