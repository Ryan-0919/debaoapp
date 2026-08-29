import {type IncomingMessage, type ServerResponse} from 'node:http';
import {randomUUID} from 'node:crypto';
import {createStore} from './store.js';
import {createPaymentAdapter, gradingAdapter, pushAdapter, smsAdapter} from './adapters.js';
import {loadConfig} from './config.js';
import {Infrastructure} from './infrastructure.js';
import type {Order, Product, UserProfile} from './types.js';

export const config = loadConfig();
export const store = createStore();
export const paymentAdapter = createPaymentAdapter();
export const infrastructure = new Infrastructure(config);

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
      store.profile = {...store.profile, phone: `${phone.slice(0, 3)}****${phone.slice(-4)}`};
      return send(res, 200, {accessToken: access, refreshToken: refresh, expiresIn: 604800, profile: store.profile}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/refresh') {
      const input = await body(req); const refresh = String(input.refreshToken ?? ''); const session = [...store.sessions.values()].find(item => item.refreshToken === refresh && !item.revokedAt);
      if (!session) throw new HttpError(401, 'AUTH_REQUIRED', 'refresh token 无效');
      const access = `local-${randomUUID()}`; store.sessions.set(access, {...session, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()});
      return send(res, 200, {accessToken: access, refreshToken: refresh, expiresIn: 604800}, requestId);
    }
    if (req.method === 'GET' && path === '/v1/me') { requireAuth(req); return send(res, 200, store.profile, requestId); }
    if (req.method === 'PATCH' && path === '/v1/me') {
      requireAuth(req); const input = await body(req);
      const next: UserProfile = {...store.profile, ...(typeof input.name === 'string' ? {name: input.name.trim()} : {}), ...(typeof input.examYear === 'string' ? {examYear: input.examYear} : {})};
      if (!next.name || !/^20\d{2}$/.test(next.examYear)) throw new HttpError(422, 'VALIDATION_ERROR', '昵称和考试年份格式不正确');
      store.profile = next; return send(res, 200, next, requestId);
    }
    if (req.method === 'POST' && path === '/v1/auth/logout') { const token = accessToken(req); requireAuth(req); if (token) { const session = store.sessions.get(token); if (session) session.revokedAt = new Date().toISOString(); } return send(res, 200, {loggedOut: true}, requestId); }
    if (req.method === 'POST' && path === '/v1/account/deletion') { const userId = requireAuth(req); store.profile = {...store.profile, name: '已注销用户', phone: '已脱敏', studyDays: 0}; for (const session of store.sessions.values()) if (session.userId === userId) session.revokedAt = new Date().toISOString(); return send(res, 200, {scheduled: true, coolingOffDays: 7}, requestId); }
    if (req.method === 'GET' && path === '/v1/devices') { const userId = requireAuth(req); return send(res, 200, store.devices.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/devices') { const userId = requireAuth(req); const input = await body(req); const platform = String(input.platform ?? 'android'); if (!['android', 'ios', 'harmony'].includes(platform)) throw new HttpError(422, 'VALIDATION_ERROR', '不支持的平台'); const device = {id: String(input.deviceId ?? randomUUID()), userId, platform: platform as 'android' | 'ios' | 'harmony', name: String(input.name ?? '未命名设备'), pushToken: typeof input.pushToken === 'string' ? input.pushToken : undefined, lastSeenAt: new Date().toISOString()}; store.devices = [device, ...store.devices.filter(item => item.id !== device.id)]; return send(res, 201, device, requestId); }
    const deviceMatch = path.match(/^\/v1\/devices\/([^/]+)$/);
    if (deviceMatch && req.method === 'DELETE') { const userId = requireAuth(req); store.devices = store.devices.filter(item => !(item.id === deviceMatch[1] && item.userId === userId)); return send(res, 200, {removed: true}, requestId); }
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
      store.drafts.set(draftMatch[1], {questionId: input.questionId, answers: input.answers.map(String), updatedAt: new Date().toISOString()});
      return send(res, 200, {saved: true}, requestId);
    }
    if (req.method === 'POST' && path === '/v1/question-submissions') {
      requireAuth(req); const input = await body(req); const questionId = String(input.questionId ?? ''); const question = store.questions.find(item => item.id === questionId);
      if (!question || !Array.isArray(input.answers)) throw new HttpError(422, 'VALIDATION_ERROR', '题目或答案无效');
      const userId = requireAuth(req); const correct = Number(input.answers[0]) === question.answer; const submission = {id: `SUB-${Date.now()}-${randomUUID().slice(0, 8)}`, userId, questionId, answers: input.answers.map(String), correct, createdAt: new Date().toISOString()}; store.submissions.unshift(submission); if (!correct) { const old = store.mistakes.find(item => item.userId === userId && item.questionId === questionId); if (old) { old.wrongCount += 1; old.lastAnswer = String(input.answers[0] ?? ''); } else store.mistakes.unshift({id: randomUUID(), userId, questionId, wrongCount: 1, lastAnswer: String(input.answers[0] ?? ''), resolved: false}); } return send(res, 200, {submissionId: submission.id, questionId, correct}, requestId);
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
    if (progressMatch && req.method === 'POST') { requireAuth(req); const course = store.courses.find(item => item.id === progressMatch[1]); if (!course) throw new HttpError(404, 'NOT_FOUND', '课程不存在'); const input = await body(req); const progress = Math.min(100, Math.max(0, Number(input.progress ?? course.progress))); course.progress = Number.isFinite(progress) ? progress : course.progress; return send(res, 200, {courseId: course.id, progress: course.progress, updatedAt: new Date().toISOString()}, requestId); }

    if (req.method === 'GET' && path === '/v1/learning/plans') { const userId = requireAuth(req); return send(res, 200, store.learningPlans.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/learning/plans') { const userId = requireAuth(req); const input = await body(req); if (!String(input.title ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '计划标题不能为空'); const plan = {id: `plan-${randomUUID()}`, userId, title: String(input.title).trim(), dailyMinutes: Math.max(1, Number(input.dailyMinutes ?? 60)), startDate: String(input.startDate ?? new Date().toISOString().slice(0, 10)), endDate: String(input.endDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)), status: 'active' as const}; store.learningPlans.unshift(plan); return send(res, 201, plan, requestId); }
    const planMatch = path.match(/^\/v1\/learning\/plans\/([^/]+)$/);
    if (planMatch && req.method === 'PATCH') { const userId = requireAuth(req); const plan = store.learningPlans.find(item => item.id === planMatch[1] && item.userId === userId); if (!plan) throw new HttpError(404, 'NOT_FOUND', '学习计划不存在'); const input = await body(req); if (typeof input.title === 'string') plan.title = input.title.trim(); if (typeof input.status === 'string' && ['active', 'completed', 'archived'].includes(input.status)) plan.status = input.status as typeof plan.status; return send(res, 200, plan, requestId); }
    if (planMatch && req.method === 'DELETE') { const userId = requireAuth(req); store.learningPlans = store.learningPlans.filter(item => !(item.id === planMatch[1] && item.userId === userId)); store.learningTasks = store.learningTasks.filter(item => item.planId !== planMatch[1]); return send(res, 200, {deleted: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/learning/tasks') { const userId = requireAuth(req); const plans = new Set(store.learningPlans.filter(item => item.userId === userId).map(item => item.id)); return send(res, 200, store.learningTasks.filter(item => plans.has(item.planId)), requestId); }
    const taskMatch = path.match(/^\/v1\/learning\/tasks\/([^/]+)\/complete$/);
    if (taskMatch && req.method === 'POST') { const userId = requireAuth(req); const plans = new Set(store.learningPlans.filter(item => item.userId === userId).map(item => item.id)); const task = store.learningTasks.find(item => item.id === taskMatch[1] && plans.has(item.planId)); if (!task) throw new HttpError(404, 'NOT_FOUND', '学习任务不存在'); task.status = 'done'; return send(res, 200, task, requestId); }
    if (req.method === 'GET' && path === '/v1/learning/report') { const userId = requireAuth(req); const submissions = store.submissions.filter(item => item.userId === userId); const correct = submissions.filter(item => item.correct).length; const minutes = store.learningTasks.filter(item => item.status === 'done').reduce((sum, item) => sum + item.minutes, 0); return send(res, 200, {period: url.searchParams.get('period') ?? 'week', minutes, answered: submissions.length, correctRate: submissions.length ? Math.round((correct / submissions.length) * 100) : 0, subjects: store.subjects.map(item => ({subjectId: item.id, minutes: 0, correctRate: 0}))}, requestId); }
    if (req.method === 'GET' && path === '/v1/mistakes') { const userId = requireAuth(req); return send(res, 200, store.mistakes.filter(item => item.userId === userId && !item.resolved).map(item => ({...item, question: store.questions.find(question => question.id === item.questionId)})), requestId); }
    const mistakeMatch = path.match(/^\/v1\/mistakes\/([^/]+)$/);
    if (mistakeMatch && req.method === 'DELETE') { const userId = requireAuth(req); const mistake = store.mistakes.find(item => item.id === mistakeMatch[1] && item.userId === userId); if (mistake) mistake.resolved = true; return send(res, 200, {resolved: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/favorites') { const userId = requireAuth(req); return send(res, 200, store.favorites.filter(item => item.userId === userId).map(item => ({...item, question: store.questions.find(question => question.id === item.questionId)})), requestId); }
    if (req.method === 'POST' && path === '/v1/favorites') { const userId = requireAuth(req); const input = await body(req); const questionId = String(input.questionId ?? ''); if (!store.questions.some(item => item.id === questionId)) throw new HttpError(404, 'NOT_FOUND', '题目不存在'); const existing = store.favorites.find(item => item.userId === userId && item.questionId === questionId); const favorite = existing ?? {id: randomUUID(), userId, questionId, createdAt: new Date().toISOString()}; if (!existing) store.favorites.unshift(favorite); return send(res, existing ? 200 : 201, favorite, requestId); }
    const favoriteMatch = path.match(/^\/v1\/favorites\/([^/]+)$/);
    if (favoriteMatch && req.method === 'DELETE') { const userId = requireAuth(req); store.favorites = store.favorites.filter(item => !(item.id === favoriteMatch[1] && item.userId === userId)); return send(res, 200, {removed: true}, requestId); }
    if (req.method === 'GET' && path === '/v1/grading/submissions') { const userId = requireAuth(req); return send(res, 200, store.grading.filter(item => item.userId === userId), requestId); }
    if (req.method === 'POST' && path === '/v1/grading/submissions') { const userId = requireAuth(req); const input = await body(req); if (!input.fileUrl && !input.questionId) throw new HttpError(422, 'VALIDATION_ERROR', '请提交答题文件或题目答案'); const item = {id: `grade-${randomUUID()}`, userId, questionId: typeof input.questionId === 'string' ? input.questionId : undefined, fileUrl: typeof input.fileUrl === 'string' ? input.fileUrl : undefined, status: 'queued' as const, createdAt: new Date().toISOString()}; store.grading.unshift(item); await gradingAdapter.enqueue(item.id); return send(res, 201, {...item, adapter: gradingAdapter.name}, requestId); }
    const gradingMatch = path.match(/^\/v1\/grading\/submissions\/([^/]+)$/);
    if (gradingMatch && req.method === 'GET') { const userId = requireAuth(req); const item = store.grading.find(entry => entry.id === gradingMatch[1] && entry.userId === userId); if (!item) throw new HttpError(404, 'NOT_FOUND', '批改记录不存在'); return send(res, 200, item, requestId); }
    const gradingRetryMatch = path.match(/^\/v1\/grading\/submissions\/([^/]+)\/retry$/);
    if (gradingRetryMatch && req.method === 'POST') { const userId = requireAuth(req); const item = store.grading.find(entry => entry.id === gradingRetryMatch[1] && entry.userId === userId); if (!item) throw new HttpError(404, 'NOT_FOUND', '批改记录不存在'); item.status = 'queued'; return send(res, 200, item, requestId); }
    if (req.method === 'GET' && path === '/v1/announcements') { requireAuth(req); return send(res, 200, store.announcements.filter(item => item.status === 'published'), requestId); }
    if (req.method === 'GET' && path === '/v1/home') { requireAuth(req); return send(res, 200, {banners: store.banners.filter(item => !item.endsAt || Date.parse(item.endsAt) > Date.now()), announcements: store.announcements.filter(item => item.status === 'published').slice(0, 3), hotCourses: store.courses.slice(0, 3), exam: {year: '2026', daysRemaining: 42}}, requestId); }
    if (req.method === 'GET' && path === '/v1/products') { requireAuth(req); return send(res, 200, store.products, requestId); }
    const productMatch = path.match(/^\/v1\/products\/([^/]+)$/);
    if (productMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, productFor(productMatch[1]), requestId); }
    if (req.method === 'GET' && path === '/v1/law/search') { requireAuth(req); const query = (url.searchParams.get('q') ?? '').trim(); if (!query) throw new HttpError(422, 'VALIDATION_ERROR', '搜索关键词不能为空'); const results = store.legalDocuments.filter(item => `${item.title}${item.article}${item.content}`.includes(query)); return send(res, 200, {items: results, total: results.length, query}, requestId); }
    if (req.method === 'GET' && path === '/v1/forum/posts') { requireAuth(req); return send(res, 200, store.forumPosts, requestId); }
    if (req.method === 'POST' && path === '/v1/forum/posts') { const userId = requireAuth(req); const input = await body(req); if (!String(input.title ?? '').trim() || !String(input.body ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '帖子标题和正文不能为空'); const post = {id: `post-${randomUUID()}`, userName: userId === 'u-demo' ? store.profile.name : '用户', title: String(input.title).trim(), body: String(input.body).trim(), likes: 0, createdAt: new Date().toISOString()}; store.forumPosts.unshift(post); return send(res, 201, post, requestId); }
    if (req.method === 'GET' && path === '/v1/admin/overview') { requireAdmin(req); return send(res, 200, {users: 1, courses: store.courses.length, products: store.products.length, orders: store.orders.length, submissions: store.submissions.length, gradingQueue: store.grading.filter(item => item.status === 'queued').length}, requestId); }
    if (req.method === 'GET' && path === '/v1/admin/orders') { requireAdmin(req); return send(res, 200, store.orders, requestId); }
    if (req.method === 'POST' && path === '/v1/admin/push/test') { requireAdmin(req); const input = await body(req); const token = String(input.deviceToken ?? ''); if (!token) throw new HttpError(422, 'VALIDATION_ERROR', 'deviceToken 不能为空'); return send(res, 200, await pushAdapter.send(token, String(input.title ?? '得宝通知'), String(input.body ?? '测试推送')), requestId); }
    if (req.method === 'POST' && path === '/v1/admin/announcements') { requireAdmin(req); const input = await body(req); if (!String(input.title ?? '').trim() || !String(input.body ?? '').trim()) throw new HttpError(422, 'VALIDATION_ERROR', '公告标题和正文不能为空'); const announcement = {id: `a-${randomUUID()}`, title: String(input.title).trim(), body: String(input.body).trim(), status: input.status === 'draft' ? 'draft' as const : 'published' as const, startsAt: typeof input.startsAt === 'string' ? input.startsAt : undefined, endsAt: typeof input.endsAt === 'string' ? input.endsAt : undefined, createdAt: new Date().toISOString()}; store.announcements.unshift(announcement); return send(res, 201, announcement, requestId); }
    if (req.method === 'GET' && path === '/v1/orders') { requireAuth(req); return send(res, 200, store.orders, requestId); }
    const orderMatch = path.match(/^\/v1\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'GET') { requireAuth(req); return send(res, 200, orderFor(orderMatch[1]), requestId); }
    if (req.method === 'POST' && path === '/v1/orders') {
      requireAuth(req); const input = await body(req); const product = productFor(String(input.productId ?? '')); const clientRequestId = String(input.clientRequestId ?? ''); if (!clientRequestId) throw new HttpError(422, 'VALIDATION_ERROR', 'clientRequestId 不能为空'); const existing = store.orders.find(order => order.clientRequestId === clientRequestId);
      if (existing) return send(res, 200, existing, requestId);
      const order: Order = {id: `DB${Date.now()}-${randomUUID().slice(0, 6)}`, productId: product.id, clientRequestId, productName: product.name, amount: product.price, status: 'pending', createdAt: new Date().toISOString()}; store.orders.unshift(order); return send(res, 201, order, requestId);
    }
    const payMatch = path.match(/^\/v1\/orders\/([^/]+)\/pay$/);
    if (payMatch && req.method === 'POST') { const userId = requireAuth(req); const order = orderFor(payMatch[1]); if (order.status === 'paid') return send(res, 200, {status: 'paid', transactionId: `EXISTING-${order.id}`}, requestId); const result = await paymentAdapter.pay(order.id, order.amount); if (result.status === 'paid') { order.status = 'paid'; store.entitlements.unshift({userId, courseId: order.productId === 'p1' ? 'c1' : order.productId === 'p2' ? 'c3' : 'c2', sourceOrderId: order.id}); } return send(res, 200, result, requestId); }
    throw new HttpError(404, 'NOT_FOUND', '接口不存在');
  } catch (error) {
    if (error instanceof HttpError) return send(res, error.status, {code: error.code, message: error.message, ...(error.details ? {details: error.details} : {})}, requestId);
    console.error(error); return send(res, 500, {code: 'INTERNAL_ERROR', message: '服务暂时不可用'}, requestId);
  }
}
