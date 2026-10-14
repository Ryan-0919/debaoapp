import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, store} from '../main.js';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try { await run(`http://127.0.0.1:${address.port}`); }
  finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

test('question drafts are isolated by user and validate the path id', async () => withServer(async base => {
  const questionId = `draft-contract-${Date.now()}`;
  const userId = `draft-user-${Date.now()}`;
  const otherUserId = `${userId}-other`;
  const userToken = `${userId}-token`;
  const otherToken = `${otherUserId}-token`;
  const now = new Date().toISOString();
  store.questions.unshift({id: questionId, subjectId: 'civil', stem: '草稿隔离测试题干足够长', options: ['甲', '乙'], answer: 0, analysis: '草稿测试解析', status: 'published', version: 1, updatedAt: now});
  store.profiles.set(userId, {id: userId, name: '草稿用户一', phone: `139${String(Date.now()).slice(-8)}`, examYear: '2026', studyDays: 0});
  store.profiles.set(otherUserId, {id: otherUserId, name: '草稿用户二', phone: `138${String(Date.now() + 1).slice(-8)}`, examYear: '2026', studyDays: 0});
  store.sessions.set(userToken, {userId, refreshToken: `${userToken}-refresh`, deviceId: `${userToken}-device`, expiresAt: '2099-01-01T00:00:00.000Z'});
  store.sessions.set(otherToken, {userId: otherUserId, refreshToken: `${otherToken}-refresh`, deviceId: `${otherToken}-device`, expiresAt: '2099-01-01T00:00:00.000Z'});
  const headers = {'content-type': 'application/json'};
  try {
    const first = await fetch(`${base}/v1/question-drafts/${questionId}`, {method: 'PUT', headers: {...headers, authorization: `Bearer ${userToken}`}, body: JSON.stringify({questionId, answers: ['0']})});
    assert.equal(first.status, 200);
    const second = await fetch(`${base}/v1/question-drafts/${questionId}`, {method: 'PUT', headers: {...headers, authorization: `Bearer ${otherToken}`}, body: JSON.stringify({questionId, answers: ['1']})});
    assert.equal(second.status, 200);
    const own = await fetch(`${base}/v1/question-drafts/${questionId}`, {headers: {authorization: `Bearer ${userToken}`}});
    const ownJson = await own.json() as any;
    const other = await fetch(`${base}/v1/question-drafts/${questionId}`, {headers: {authorization: `Bearer ${otherToken}`}});
    const otherJson = await other.json() as any;
    assert.deepEqual(ownJson.data.answers, ['0']);
    assert.deepEqual(otherJson.data.answers, ['1']);
    const mismatch = await fetch(`${base}/v1/question-drafts/${questionId}`, {method: 'PUT', headers: {...headers, authorization: `Bearer ${userToken}`}, body: JSON.stringify({questionId: `${questionId}-different`, answers: []})});
    assert.equal(mismatch.status, 422);
  } finally {
    store.questions = store.questions.filter(item => item.id !== questionId);
    store.drafts.delete(`${userId}\u0000${questionId}`);
    store.drafts.delete(`${otherUserId}\u0000${questionId}`);
    store.profiles.delete(userId);
    store.profiles.delete(otherUserId);
    store.sessions.delete(userToken);
    store.sessions.delete(otherToken);
  }
}));

test('question pagination rejects non-integer values', async () => withServer(async base => {
  const response = await fetch(`${base}/v1/questions?page=abc&pageSize=1.5`, {headers: {authorization: 'Bearer demo-token'}});
  assert.equal(response.status, 422);
  const json = await response.json() as any;
  assert.equal(json.error.code, 'VALIDATION_ERROR');
}));

test('standalone multiple-choice submissions grade all answers and retain a historical snapshot', async () => withServer(async base => {
  const questionId = `submission-contract-${Date.now()}`;
  const now = new Date().toISOString();
  store.questions.unshift({id: questionId, subjectId: 'civil', stem: '多选历史快照测试题干足够长', options: ['甲', '乙', '丙'], answer: 0, answerIndexes: [0, 2], questionType: 'multiple', analysis: '旧版解析', status: 'published', version: 4, updatedAt: now});
  let submissionId: string | undefined;
  try {
    const response = await fetch(`${base}/v1/question-submissions`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({questionId, answers: ['2', '0']})});
    const json = await response.json() as any;
    assert.equal(response.status, 200);
    assert.equal(json.data.correct, true);
    submissionId = json.data.submissionId;
    const stored = store.submissions.find(item => item.id === submissionId);
    assert.deepEqual(stored?.answers, ['0', '2']);
    assert.equal(stored?.questionSnapshot?.stem, '多选历史快照测试题干足够长');
    const question = store.questions.find(item => item.id === questionId)!;
    question.stem = '新版题干已经发生变化';
    question.options = ['新甲', '新乙', '新丙'];
    question.answer = 1;
    question.answerIndexes = [1];
    question.questionType = 'single';
    question.analysis = '新版解析';
    question.version = 5;
    const report = await fetch(`${base}/v1/question-submissions/${submissionId}/report`, {headers: {authorization: 'Bearer demo-token'}});
    const reportJson = await report.json() as any;
    assert.equal(report.status, 200);
    assert.equal(reportJson.data.stem, '多选历史快照测试题干足够长');
    assert.deepEqual(reportJson.data.options, ['甲', '乙', '丙']);
    assert.deepEqual(reportJson.data.correctAnswers, ['0', '2']);
    assert.equal(reportJson.data.version, 4);
    assert.equal(reportJson.data.analysis, '旧版解析');
  } finally {
    store.questions = store.questions.filter(item => item.id !== questionId);
    if (submissionId) store.submissions = store.submissions.filter(item => item.id !== submissionId);
    store.mistakes = store.mistakes.filter(item => item.questionId !== questionId);
  }
}));

