import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, store, infrastructure, config} from '../main.js';
import {createStore} from '../store.js';

const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};

test('report questions accept private, persistent, idempotent inquiries and real teacher replies', async () => {
  const old = {...store}; Object.assign(store, createStore(true));
  const query = infrastructure.query; const transaction = infrastructure.transaction;
  const writes: string[] = [];
  infrastructure.query = (async (sql: string) => {writes.push(sql); return null;}) as typeof query;
  infrastructure.transaction = (async (sql: Array<{text: string}>) => {writes.push(...sql.map(item => item.text));}) as typeof transaction;
  const server = createServer(handle);
  try {
    store.objectiveReports.push({
      id: 'report-inquiry', sessionId: 'session-inquiry', userId: 'u-demo',
      mode: 'chapter', title: '配套题组', total: 1, answered: 1, correct: 0,
      score: 0, maxScore: 100, subjectStats: [], submittedAt: new Date().toISOString(),
      results: [{questionId: 'real-question', stem: '真实答题快照', options: ['甲','乙'],
        version: 1, answers: ['0'], correctAnswers: ['1'], correct: false, analysis: '完整解析'}],
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const payload = {reportId: 'report-inquiry', questionId: 'real-question', reason: '我混淆了两个构成要件，请老师解释。', clientRequestId: 'inquiry-once'};
    assert.equal((await fetch(`${base}/v1/learning/inquiries`)).status, 401);
    const post = () => fetch(`${base}/v1/learning/inquiries`, {method: 'POST', headers: auth, body: JSON.stringify(payload)});
    const created = await post(); assert.equal(created.status, 201);
    const item = (await created.json() as any).data;
    assert.equal(item.status, 'pending'); assert.equal(item.question.analysis, '完整解析');
    assert.equal((await post()).status, 200); assert.equal(store.learningInquiries.length, 1);
    assert.ok(writes.some(sql => sql.startsWith('insert into learning_inquiries')));
    store.sessions.set('other-student', {userId: 'other', refreshToken: '', deviceId: 'other', expiresAt: '2099-01-01T00:00:00Z'});
    const other = {authorization: 'Bearer other-student', 'content-type': 'application/json'};
    assert.deepEqual((await (await fetch(`${base}/v1/learning/inquiries`, {headers: other})).json() as any).data, []);
    assert.equal((await fetch(`${base}/v1/learning/inquiries`, {method: 'POST', headers: other, body: JSON.stringify(payload)})).status, 404);
    assert.equal((await fetch(`${base}/v1/admin/learning-inquiries/${item.id}/reply`, {method: 'POST', headers: auth, body: '{}'})).status, 401);
    const login = await fetch(`${base}/v1/learning-admin/auth/login`, {method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({username:config.learningAdminUsername, password:config.learningAdminPassword})});
    assert.equal(login.status, 200);
    const token = (await login.json() as any).data.csrfToken;
    const headers = {'content-type':'application/json', cookie: login.headers.get('set-cookie')!.split(';')[0], 'x-csrf-token':token};
    const listed = await fetch(`${base}/v1/admin/learning-inquiries`, {headers}); assert.equal(listed.status, 200);
    assert.equal((await listed.json() as any).data.length, 1);
    const replied = await fetch(`${base}/v1/admin/learning-inquiries/${item.id}/reply`, {method:'POST', headers, body:JSON.stringify({teacherName:'答疑老师', reply:'先区分成立要件与生效要件，再逐项对照题干事实。'})});
    assert.equal(replied.status, 200);
    assert.ok(writes.some(sql => sql.startsWith('update learning_inquiries')));
    const visible = (await (await fetch(`${base}/v1/learning/inquiries`, {headers: auth})).json() as any).data[0];
    assert.equal(visible.status, 'answered'); assert.equal(visible.teacherName, '答疑老师');
    assert.match(visible.reply, /生效要件/);
    const notifications = (await (await fetch(`${base}/v1/notifications`, {headers: auth})).json() as any).data;
    assert.ok(notifications.some((n: any) => n.id === `inquiry:${item.id}`));
  } finally {
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
    infrastructure.query = query; infrastructure.transaction = transaction; Object.assign(store, old);
  }
});

test('question micro lesson visibility is respected when building a real report', async () => {
  const old = {...store}; Object.assign(store, createStore(true));
  const server = createServer(handle);
  try {
    const source = store.learningQuestionBankQuestions[0];
    assert.ok(source);
    store.learningQuestionBankQuestions = [
      {...source, id: 'micro-hidden', explanationMediaVisible: false, explanationMediaType: 'audio', explanationMediaReference: '/v1/learning-question-media/hidden.mp3'},
      {...source, id: 'micro-shown', explanationMediaVisible: true, explanationMediaType: 'audio', explanationMediaReference: '/v1/learning-question-media/shown.mp3'},
    ];
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const opened = await fetch(`${base}/v1/question-sessions`, {method:'POST', headers: auth, body:JSON.stringify({mode:'chapter', questionIds:['micro-hidden','micro-shown']})});
    assert.equal(opened.status, 201);
    const session = (await opened.json() as any).data;
    const submitted = await fetch(`${base}/v1/question-sessions/${session.id}/submit`, {method:'POST', headers:{...auth, 'idempotency-key':'micro-visibility-submit'}, body:'{}'});
    assert.equal(submitted.status, 201);
    const report = (await submitted.json() as any).data;
    assert.equal(report.results.find((q: any) => q.questionId === 'micro-hidden').explanationMediaReference, undefined);
    assert.equal(report.results.find((q: any) => q.questionId === 'micro-shown').explanationMediaReference, '/v1/learning-question-media/shown.mp3');
  } finally {
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); Object.assign(store, old);
  }
});
