import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, store} from '../main.js';

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

test('objective sessions filter published questions and grade from immutable snapshots', async () => withServer(async base => {
  const singleId = `objective-single-${Date.now()}`;
  const multipleId = `objective-multiple-${Date.now()}`;
  const draftId = `objective-draft-${Date.now()}`;
  const originalStem = '快照题干：所有权变动不影响租赁合同效力。';
  store.questions.unshift(
    {id: singleId, subjectId: 'civil', stem: originalStem, options: ['甲', '乙'], answer: 1, analysis: '快照解析', questionType: 'single', status: 'published', version: 3, updatedAt: new Date().toISOString()},
    {id: multipleId, subjectId: 'civil', stem: '多选题干：下列哪些属于民事权利。', options: ['请求权', '支配权', '程序事实'], answer: 0, answerIndexes: [0, 1], analysis: '多选解析', questionType: 'multiple', status: 'published', version: 2, updatedAt: new Date().toISOString()},
    {id: draftId, subjectId: 'civil', stem: '草稿题干：不应展示给用户。', options: ['甲', '乙'], answer: 0, analysis: '草稿解析', questionType: 'single', status: 'draft', version: 1, updatedAt: new Date().toISOString()},
  );
  const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};
  try {
    const listResponse = await fetch(`${base}/v1/questions?subjectId=civil`, {headers: auth});
    const listJson = await listResponse.json() as any;
    assert.equal(listResponse.status, 200);
    assert.equal(listJson.data.items.some((item: any) => item.id === draftId), false);
    assert.equal(listJson.data.items.find((item: any) => item.id === singleId).answer, undefined);
    assert.equal(listJson.data.items.find((item: any) => item.id === multipleId).questionType, 'multiple');

    const createResponse = await fetch(`${base}/v1/question-sessions`, {method: 'POST', headers: {...auth, 'idempotency-key': `objective-create-${Date.now()}`}, body: JSON.stringify({mode: 'chapter', subjectId: 'civil', questionIds: [multipleId, singleId], limit: 10, durationSeconds: 600, title: '快照回归'})});
    const createJson = await createResponse.json() as any;
    assert.equal(createResponse.status, 201);
    assert.deepEqual(createJson.data.questionIds, [multipleId, singleId]);
    assert.equal(createJson.data.questions[0].answer, undefined);
    assert.equal(createJson.data.questions[0].analysis, undefined);

    const sessionId = createJson.data.id as string;
    const outside = await fetch(`${base}/v1/question-sessions/${sessionId}/answers/${draftId}`, {method: 'PUT', headers: auth, body: JSON.stringify({answers: ['0']})});
    assert.equal(outside.status, 404);
    const invalidSingle = await fetch(`${base}/v1/question-sessions/${sessionId}/answers/${singleId}`, {method: 'PUT', headers: auth, body: JSON.stringify({answers: ['0', '1']})});
    assert.equal(invalidSingle.status, 422);
    const savedMultiple = await fetch(`${base}/v1/question-sessions/${sessionId}/answers/${multipleId}`, {method: 'PUT', headers: auth, body: JSON.stringify({answers: ['1', '0']})});
    assert.equal(savedMultiple.status, 200);
    const savedSingle = await fetch(`${base}/v1/question-sessions/${sessionId}/answers`, {method: 'PATCH', headers: auth, body: JSON.stringify({questionId: singleId, answers: ['1']})});
    assert.equal(savedSingle.status, 200);

    const submitKey = `objective-submit-${Date.now()}`;
    const submitted = await fetch(`${base}/v1/question-sessions/${sessionId}/submit`, {method: 'POST', headers: {...auth, 'idempotency-key': submitKey}, body: JSON.stringify({idempotencyKey: submitKey})});
    const reportJson = await submitted.json() as any;
    assert.equal(submitted.status, 201);
    assert.equal(reportJson.data.correct, 2);
    assert.equal(reportJson.data.results.find((item: any) => item.questionId === multipleId).correct, true);
    assert.equal(reportJson.data.results.find((item: any) => item.questionId === multipleId).correctAnswers.join(','), '0,1');

    const repeated = await fetch(`${base}/v1/question-sessions/${sessionId}/submit`, {method: 'POST', headers: {...auth, 'idempotency-key': submitKey}, body: JSON.stringify({idempotencyKey: submitKey})});
    const repeatedJson = await repeated.json() as any;
    assert.equal(repeated.status, 200);
    assert.equal(repeatedJson.data.id, reportJson.data.id);

    const stored = store.questions.find(item => item.id === singleId)!;
    stored.stem = '已更新题干：报告必须保留旧版本。';
    stored.analysis = '已更新解析';
    const reportAgain = await fetch(`${base}/v1/question-sessions/${sessionId}/report`, {headers: auth});
    const reportAgainJson = await reportAgain.json() as any;
    assert.equal(reportAgain.status, 200);
    assert.equal(reportAgainJson.data.results.find((item: any) => item.questionId === singleId).stem, originalStem);
    assert.equal(reportAgainJson.data.results.find((item: any) => item.questionId === singleId).analysis, '快照解析');
  } finally {
    const createdSessionIds = new Set(store.objectiveSessions.filter(item => item.questionIds.some(id => [singleId, multipleId].includes(id))).map(item => item.id));
    store.questions = store.questions.filter(item => ![singleId, multipleId, draftId].includes(item.id));
    store.objectiveSessions = store.objectiveSessions.filter(item => !createdSessionIds.has(item.id));
    store.objectiveReports = store.objectiveReports.filter(item => !createdSessionIds.has(item.sessionId));
  }
}));

test('objective sessions are user-scoped and expired sessions cannot be submitted', async () => withServer(async base => {
  const questionId = `objective-expire-${Date.now()}`;
  const otherUserId = `objective-other-${Date.now()}`;
  const otherToken = `objective-token-${Date.now()}`;
  store.questions.unshift({id: questionId, subjectId: 'civil', stem: '过期会话题干：请判断。', options: ['正确', '错误'], answer: 0, analysis: '过期解析', status: 'published', version: 1, updatedAt: new Date().toISOString()});
  store.profiles.set(otherUserId, {id: otherUserId, name: '隔离用户', phone: `13${String(Date.now()).slice(-9)}`, examYear: '2026', studyDays: 0});
  store.sessions.set(otherToken, {userId: otherUserId, refreshToken: `${otherToken}-refresh`, deviceId: `${otherToken}-device`, expiresAt: '2099-01-01T00:00:00.000Z'});
  const auth = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};
  try {
    const created = await fetch(`${base}/v1/question-sessions`, {method: 'POST', headers: auth, body: JSON.stringify({mode: 'chapter', subjectId: 'civil', questionIds: [questionId], durationSeconds: 600})});
    const createdJson = await created.json() as any;
    assert.equal(created.status, 201);
    const sessionId = createdJson.data.id as string;
    const forbidden = await fetch(`${base}/v1/question-sessions/${sessionId}`, {headers: {authorization: `Bearer ${otherToken}`}});
    assert.equal(forbidden.status, 404);
    const session = store.objectiveSessions.find(item => item.id === sessionId)!;
    session.expiresAt = new Date(Date.now() - 1_000).toISOString();
    const expired = await fetch(`${base}/v1/question-sessions/${sessionId}/submit`, {method: 'POST', headers: {...auth, 'idempotency-key': `objective-expired-${Date.now()}`}, body: JSON.stringify({idempotencyKey: `objective-expired-${Date.now()}`})});
    assert.equal(expired.status, 409);
  } finally {
    store.questions = store.questions.filter(item => item.id !== questionId);
    store.profiles.delete(otherUserId);
    store.sessions.delete(otherToken);
    store.objectiveSessions = store.objectiveSessions.filter(item => item.userId !== otherUserId && !item.questionIds.includes(questionId));
    store.objectiveReports = store.objectiveReports.filter(item => item.userId !== otherUserId && !item.results.some(result => result.questionId === questionId));
  }
}));
