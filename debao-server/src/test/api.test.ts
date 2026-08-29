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
  const forged = await fetch(`${base}/v1/courses`, {headers: {authorization: 'Bearer local-forged-token'}}); const forgedJson = await forged.json() as any; assert.equal(forged.status, 401); assert.equal(forgedJson.error.code, 'AUTH_REQUIRED'); assert.match(forgedJson.error.requestId, /^[0-9a-f-]{36}$/);
  const response = await fetch(`${base}/v1/courses`, {headers: {authorization: 'Bearer demo-token'}}); const json = await response.json() as any;
  assert.equal(response.status, 200); assert.equal(json.data.length, 4);
}));

test('order creation is pending until local payment adapter confirms it', async () => withServer(async base => {
  const headers = {'content-type': 'application/json', authorization: 'Bearer demo-token'};
  const created = await fetch(`${base}/v1/orders`, {method: 'POST', headers, body: JSON.stringify({productId: 'p2', clientRequestId: 'test-unique-1'})}); const order = await created.json() as any;
  assert.equal(created.status, 201); assert.equal(order.data.status, 'pending');
  const duplicate = await fetch(`${base}/v1/orders`, {method: 'POST', headers, body: JSON.stringify({productId: 'p2', clientRequestId: 'test-unique-1'})}); const duplicateJson = await duplicate.json() as any;
  assert.equal(duplicate.status, 200); assert.equal(duplicateJson.data.id, order.data.id);
  const paid = await fetch(`${base}/v1/orders/${order.data.id}/pay`, {method: 'POST', headers}); const payment = await paid.json() as any;
  assert.equal(payment.data.status, 'paid');
}));

test('local auth login issues refreshable tokens and logout revokes access', async () => withServer(async base => {
  const headers = {'content-type': 'application/json'};
  const sent = await fetch(`${base}/v1/auth/send-code`, {method: 'POST', headers, body: JSON.stringify({phone: '13800138000'})});
  const sentJson = await sent.json() as any; assert.equal(sent.status, 200); assert.equal(sentJson.data.developmentCode, '123456');
  const loggedIn = await fetch(`${base}/v1/auth/login`, {method: 'POST', headers, body: JSON.stringify({phone: '13800138000', code: '123456'})}); const login = await loggedIn.json() as any;
  assert.equal(loggedIn.status, 200); assert.match(login.data.accessToken, /^local-/);
  const refreshed = await fetch(`${base}/v1/auth/refresh`, {method: 'POST', headers, body: JSON.stringify({refreshToken: login.data.refreshToken})}); const refresh = await refreshed.json() as any;
  assert.equal(refreshed.status, 200); assert.match(refresh.data.accessToken, /^local-/);
  const out = await fetch(`${base}/v1/auth/logout`, {method: 'POST', headers: {...headers, authorization: `Bearer ${refresh.data.accessToken}`}}); assert.equal(out.status, 200);
  const denied = await fetch(`${base}/v1/me`, {headers: {authorization: `Bearer ${refresh.data.accessToken}`}}); assert.equal(denied.status, 401);
}));

test('learning, grading and admin routes expose local product workflows', async () => withServer(async base => {
  const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};
  const task = await fetch(`${base}/v1/learning/tasks` , {headers: auth}); const taskJson = await task.json() as any; assert.equal(task.status, 200); assert.equal(taskJson.data.length, 2);
  const plan = await fetch(`${base}/v1/learning/plans`, {method: 'POST', headers: auth, body: JSON.stringify({title: '周末复习', dailyMinutes: 90})}); assert.equal(plan.status, 201);
  const grade = await fetch(`${base}/v1/grading/submissions`, {method: 'POST', headers: auth, body: JSON.stringify({questionId: 'oq1'})}); const gradeJson = await grade.json() as any; assert.equal(grade.status, 201); assert.equal(gradeJson.data.status, 'queued');
  const overview = await fetch(`${base}/v1/admin/overview`, {headers: {authorization: 'Bearer admin-token'}}); const overviewJson = await overview.json() as any; assert.equal(overview.status, 200); assert.equal(overviewJson.data.gradingQueue >= 1, true);
}));

test('question activity feeds records, mistakes, favorites and learning report', async () => withServer(async base => {
  const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};
  const submitted = await fetch(`${base}/v1/question-submissions`, {method: 'POST', headers: auth, body: JSON.stringify({questionId: 'oq1', answers: ['0']})});
  const submission = await submitted.json() as any;
  assert.equal(submitted.status, 200); assert.equal(submission.data.correct, false);

  const records = await fetch(`${base}/v1/question-records`, {headers: auth}); const recordsJson = await records.json() as any;
  assert.equal(records.status, 200); assert.equal(recordsJson.data.some((item: any) => item.id === submission.data.submissionId), true);

  const mistakes = await fetch(`${base}/v1/mistakes`, {headers: auth}); const mistakesJson = await mistakes.json() as any;
  assert.equal(mistakes.status, 200); assert.equal(mistakesJson.data.some((item: any) => item.questionId === 'oq1'), true);

  const favorite = await fetch(`${base}/v1/favorites`, {method: 'POST', headers: auth, body: JSON.stringify({questionId: 'oq1'})}); const favoriteJson = await favorite.json() as any;
  assert.equal(favorite.status === 200 || favorite.status === 201, true);
  const favorites = await fetch(`${base}/v1/favorites`, {headers: auth}); const favoritesJson = await favorites.json() as any;
  assert.equal(favoritesJson.data.some((item: any) => item.questionId === 'oq1'), true);
  const removed = await fetch(`${base}/v1/favorites/${encodeURIComponent(favoriteJson.data.id)}`, {method: 'DELETE', headers: auth});
  assert.equal(removed.status, 200);

  const report = await fetch(`${base}/v1/learning/report?period=week`, {headers: auth}); const reportJson = await report.json() as any;
  assert.equal(report.status, 200); assert.equal(reportJson.data.answered >= 1, true);
}));
