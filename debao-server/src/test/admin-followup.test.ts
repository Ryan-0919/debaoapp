import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, infrastructure, store} from '../main.js';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try { await run(`http://127.0.0.1:${address.port}`); } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}

async function adminSession(base: string) {
  const response = await fetch(`${base}/v1/admin/auth/login`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: 'admin', password: 'change-me-local'})});
  assert.equal(response.status, 200);
  const payload = await response.json() as any;
  return {cookie: response.headers.get('set-cookie')?.split(';')[0] ?? '', csrf: payload.data.csrfToken};
}

function jsonHeaders(session: {cookie: string; csrf: string}) { return {'content-type': 'application/json', cookie: session.cookie, 'x-csrf-token': session.csrf}; }

test('admin can create and safely remove a user while retaining business records', async () => withServer(async base => {
  const session = await adminSession(base);
  const headers = jsonHeaders(session);
  const phone = `139${String(Date.now()).slice(-8)}`;
  const create = await fetch(`${base}/v1/admin/users`, {method: 'POST', headers, body: JSON.stringify({name: '后台创建用户', phone, examYear: '2027'})});
  assert.equal(create.status, 201);
  const created = (await create.json() as any).data;
  assert.equal(created.name, '后台创建用户');
  assert.equal(created.phone, `${phone.slice(0, 3)}****${phone.slice(-4)}`);
  assert.equal(store.profiles.get(created.id)?.phone, phone);

  const duplicate = await fetch(`${base}/v1/admin/users`, {method: 'POST', headers, body: JSON.stringify({name: '重复手机号', phone, examYear: '2027'})});
  assert.equal(duplicate.status, 409);

  const invalidDelete = await fetch(`${base}/v1/admin/users/${created.id}`, {method: 'DELETE', headers, body: JSON.stringify({reason: '重复测试创建', confirmation: 'NO'})});
  assert.equal(invalidDelete.status, 422);
  assert.equal(store.profiles.has(created.id), true);

  const remove = await fetch(`${base}/v1/admin/users/${created.id}`, {method: 'DELETE', headers, body: JSON.stringify({reason: '重复测试创建，清理测试账号', confirmation: 'DELETE'})});
  assert.equal(remove.status, 200);
  const removed = (await remove.json() as any).data;
  assert.equal(removed.deleted, true);
  assert.equal(removed.retainedBusinessRecords, true);
  assert.equal(store.profiles.has(created.id), false);
}));

test('learning admin manages diagnostic questions and purchased users submit once', async () => withServer(async base => {
  const login = await fetch(`${base}/v1/learning-admin/auth/login`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: 'learning-admin', password: 'local-compose-learning-admin-2026'})});
  assert.equal(login.status, 200);
  const loginJson = await login.json() as any;
  const headers = {'content-type': 'application/json', cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '', 'x-csrf-token': loginJson.data.csrfToken};
  const currentAdmin = await fetch(`${base}/v1/admin/me`, {headers: {cookie: headers.cookie}});
  assert.equal(currentAdmin.status, 200);
  assert.equal((await currentAdmin.json() as any).data.role, 'learning_admin');
  const beforeCount = store.learningDiagnosticQuestions.length;
  const beforePlanIds = new Set(store.learningPlans.filter(item => item.userId === 'u-demo').map(item => item.id));
  const beforeTaskIds = new Set(store.learningTasks.filter(item => beforePlanIds.has(item.planId)).map(item => item.id));
  const beforeStageItems = store.learningStagePlanItems.filter(item => item.stageId === 'stage-foundation').map(item => ({...item}));
  const beforeStageConfig = store.learningStagePlanConfigs.find(item => item.stageId === 'stage-foundation');
  const unlockCardId = `test-card-${Date.now()}`;
  store.learningCards.push({id: unlockCardId, title: '联调学习卡片', contentType: 'image_gallery', assets: [], recallItems: [], sortOrder: 99, status: 'published', version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString()});
  store.learningStagePlanItems = store.learningStagePlanItems.filter(item => item.stageId !== 'stage-foundation');
  store.learningStagePlanItems.push(
    ...beforeStageItems.map(item => item.contentType === 'question' ? {...item, sortOrder: 30} : item.contentType === 'task' ? {...item, sortOrder: 40} : item),
    {id: `stage-plan-${unlockCardId}`, stageId: 'stage-foundation', contentType: 'card', contentId: unlockCardId, title: '完成联调学习卡片', minutes: 20, sortOrder: 20, required: true},
  );
  if (beforeStageConfig) store.learningStagePlanConfigs = store.learningStagePlanConfigs.map(item => item.stageId === 'stage-foundation' ? {...item, totalMinutes: 120} : item);
  const create = await fetch(`${base}/v1/admin/learning-diagnostic/questions`, {method: 'POST', headers, body: JSON.stringify({stem: '你通常如何复盘做错的题目？', type: 'single', dimension: 'practice', required: true, sortOrder: 99, options: [{label: '很少复盘', score: 0, sortOrder: 10}, {label: '定期整理并重做', score: 3, sortOrder: 20}]})});
  assert.equal(create.status, 201);
  const question = (await create.json() as any).data;
  assert.equal(question.status, 'draft');
  assert.equal(question.options.length, 2);
  try {
    const publish = await fetch(`${base}/v1/admin/learning-diagnostic/questions/${question.id}/publish`, {method: 'POST', headers});
    assert.equal(publish.status, 200);
    const publicDiagnostic = await fetch(`${base}/v1/learning/diagnostic`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal(publicDiagnostic.status, 200);
    const diagnostic = (await publicDiagnostic.json() as any).data;
    assert.equal(diagnostic.access, 'granted');
    assert.equal(diagnostic.questions.some((item: any) => item.id === question.id), true);
    assert.equal('score' in diagnostic.questions.find((item: any) => item.id === question.id).options[0], false);

    const answers = diagnostic.questions.map((item: any) => ({questionId: item.id, optionIds: [item.options[0].id]}));
    const submit = await fetch(`${base}/v1/learning/diagnostic/submit`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({startedAt: new Date(Date.now() - 60_000).toISOString(), answers})});
    assert.equal(submit.status, 201);
    const submitData = (await submit.json() as any).data;
    assert.equal(submitData.assignment.status, 'assigned');
    const generatedPlans = await fetch(`${base}/v1/learning/plans`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal(generatedPlans.status, 200);
    const generatedPlanData = (await generatedPlans.json() as any).data;
    assert.equal(generatedPlanData.some((item: any) => item.autoGenerated === true), true);
    const generatedTasks = await fetch(`${base}/v1/learning/tasks`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal(generatedTasks.status, 200);
    const generatedTaskData = (await generatedTasks.json() as any).data;
    assert.equal(generatedTaskData.length > 0, true);
    const courseTask = generatedTaskData.find((item: any) => item.contentType === 'course');
    const cardTask = generatedTaskData.find((item: any) => item.contentType === 'card');
    const questionTask = generatedTaskData.find((item: any) => item.contentType === 'question');
    assert.ok(courseTask && cardTask && questionTask);
    assert.equal(cardTask.locked, true);
    const completeCourse = await fetch(`${base}/v1/learning/tasks/${courseTask.id}/complete`, {method: 'POST', headers: {authorization: 'Bearer demo-token'}});
    assert.equal(completeCourse.status, 200);
    const afterCourse = (await (await fetch(`${base}/v1/learning/tasks`, {headers: {authorization: 'Bearer demo-token'}})).json() as any).data;
    assert.equal(afterCourse.find((item: any) => item.id === cardTask.id).locked, false);
    store.learningCards.find(item => item.id === unlockCardId)!.recallItems = [{id: 'recall-one', prompt: '物权____', answer: '公示', sortOrder: 0}];
    const rateCard = (payload: unknown) => fetch(`${base}/v1/learning/tasks/${cardTask.id}/complete`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify(payload)});
    assert.equal((await rateCard({cardVersion: 0, recallRatings: []})).status, 409);
    assert.equal((await rateCard({cardVersion: 1, recallRatings: []})).status, 422);
    assert.equal((await rateCard({cardVersion: 1, recallRatings: [{index: 0, rating: 'invalid'}]})).status, 422);
    assert.notEqual(store.learningTasks.find(item => item.id === cardTask.id)!.status, 'done');
    const completeCard = await rateCard({cardVersion: 1, recallRatings: [{index: 0, rating: 'uncertain'}]});
    assert.equal(completeCard.status, 200);
    assert.equal(((await completeCard.json()) as any).data.cardRecall.items[0].rating, 'uncertain');
    await rateCard({cardVersion: 1, recallRatings: [{index: 0, rating: 'remembered'}]});
    assert.equal(store.learningTasks.find(item => item.id === cardTask.id)!.cardRecall!.items[0].rating, 'uncertain');
    const afterCard = (await (await fetch(`${base}/v1/learning/tasks`, {headers: {authorization: 'Bearer demo-token'}})).json() as any).data;
    assert.equal(afterCard.find((item: any) => item.id === questionTask.id).locked, false);
    const reopened = await fetch(`${base}/v1/learning/diagnostic`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal(reopened.status, 200);
    const reopenedData = (await reopened.json() as any).data;
    assert.equal(reopenedData.completed, true);
    assert.equal(reopenedData.questions.length, 0);
    assert.equal(reopenedData.result.attemptId, submitData.attemptId);
    assert.equal(reopenedData.result.assignment.teacher.name, '张老师');
    const results = await fetch(`${base}/v1/admin/learning-diagnostic/results?keyword=${encodeURIComponent('法考')}`, {headers: {cookie: headers.cookie}});
    assert.equal(results.status, 200);
    const resultsData = (await results.json() as any).data;
    assert.equal(resultsData.items.some((item: any) => item.attemptId === submitData.attemptId), true);
    assert.equal(resultsData.items.find((item: any) => item.attemptId === submitData.attemptId).assignment.teacher.name, '张老师');
    const duplicate = await fetch(`${base}/v1/learning/diagnostic/submit`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({startedAt: new Date().toISOString(), answers})});
    assert.equal(duplicate.status, 409);
  } finally {
    store.learningDiagnosticQuestions = store.learningDiagnosticQuestions.filter(item => item.id !== question.id);
    store.learningDiagnosticAttempts = store.learningDiagnosticAttempts.filter(item => item.userId !== 'u-demo');
    store.learningTeacherAssignments = store.learningTeacherAssignments.filter(item => item.userId !== 'u-demo');
    store.learningPlans = store.learningPlans.filter(item => item.userId !== 'u-demo' || beforePlanIds.has(item.id));
    store.learningTasks = store.learningTasks.filter(item => beforeTaskIds.has(item.id));
    store.learningCards = store.learningCards.filter(item => item.id !== unlockCardId);
    store.learningStagePlanItems = store.learningStagePlanItems.filter(item => item.stageId !== 'stage-foundation');
    store.learningStagePlanItems.push(...beforeStageItems);
    if (beforeStageConfig) store.learningStagePlanConfigs = store.learningStagePlanConfigs.map(item => item.stageId === 'stage-foundation' ? beforeStageConfig : item);
    assert.equal(store.learningDiagnosticQuestions.length, beforeCount);
  }
}));

test('learning diagnostic form supports custom dimensions and non-choice questions', async () => withServer(async base => {
  const login = await fetch(`${base}/v1/learning-admin/auth/login`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: 'learning-admin', password: 'local-compose-learning-admin-2026'})});
  assert.equal(login.status, 200);
  const loginJson = await login.json() as any;
  const headers = {'content-type': 'application/json', cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '', 'x-csrf-token': loginJson.data.csrfToken};
  const dimension = await fetch(`${base}/v1/admin/learning-diagnostic/dimensions`, {method: 'POST', headers, body: JSON.stringify({code: `focus_${Date.now()}`, label: '专注稳定性', description: '连续学习时的专注程度', sortOrder: 80})});
  assert.equal(dimension.status, 201);
  const dimensionData = (await dimension.json() as any).data;
  const question = await fetch(`${base}/v1/admin/learning-diagnostic/questions`, {method: 'POST', headers, body: JSON.stringify({stem: '请用一句话描述你最容易被什么打断？', type: 'text', dimension: dimensionData.code, required: false, sortOrder: 80, placeholder: '例如：手机通知、临时工作', validation: {maxLength: 120}, options: []})});
  assert.equal(question.status, 201);
  const questionData = (await question.json() as any).data;
  assert.equal(questionData.type, 'text');
  assert.equal(questionData.placeholder, '例如：手机通知、临时工作');
  try {
    const form = await fetch(`${base}/v1/admin/learning-diagnostic/form`, {headers: {cookie: headers.cookie}});
    assert.equal(form.status, 200);
    assert.equal((await form.json() as any).data.form.id, 'initial-assessment');
  } finally {
    await fetch(`${base}/v1/admin/learning-diagnostic/questions/${questionData.id}`, {method: 'DELETE', headers});
    await fetch(`${base}/v1/admin/learning-diagnostic/dimensions/${encodeURIComponent(dimensionData.code)}`, {method: 'DELETE', headers});
  }
}));

test('learning admin keeps stages and teacher tables isolated', async () => withServer(async base => {
  const login = await fetch(`${base}/v1/learning-admin/auth/login`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: 'learning-admin', password: 'local-compose-learning-admin-2026'})});
  assert.equal(login.status, 200);
  const loginJson = await login.json() as any;
  const headers = {'content-type': 'application/json', cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '', 'x-csrf-token': loginJson.data.csrfToken};
  const code = `custom_${Date.now()}`;
  const stage = await fetch(`${base}/v1/admin/learning-coach/stages`, {method: 'POST', headers, body: JSON.stringify({code, name: '专项期', description: '专项突破阶段', sortOrder: 90, conditions: [{dimension: 'foundation', operator: 'gte', value: 50}]})});
  assert.equal(stage.status, 201);
  const stageData = (await stage.json() as any).data;
  const teacher = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/teachers`, {method: 'POST', headers, body: JSON.stringify({name: '测试老师', subject: '行政法', specialty: '擅长专项突破', sortOrder: 10})});
  assert.equal(teacher.status, 201);
  const teacherData = (await teacher.json() as any).data;
  const stageWithoutMatchingRules = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}`, {method: 'PATCH', headers, body: JSON.stringify({conditions: []})});
  assert.equal(stageWithoutMatchingRules.status, 200);
  const list = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/teachers`, {headers: {cookie: headers.cookie}});
  assert.equal(list.status, 200);
  assert.equal((await list.json() as any).data.items[0].id, teacherData.id);
  const plan = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan`, {headers: {cookie: headers.cookie}});
  assert.equal(plan.status, 200);
  assert.equal((await plan.json() as any).data.stage.id, stageData.id);
  const config = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan`, {method: 'PATCH', headers, body: JSON.stringify({dailyMinutes: 150, durationDays: 45, studyDays: [1, 3, 5], makeupPolicy: 'weekend'})});
  assert.equal(config.status, 200);
  assert.equal((await config.json() as any).data.dailyMinutes, 150);
  const externalCourse = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items`, {method: 'POST', headers, body: JSON.stringify({contentType: 'course', title: '站外课程第一讲', description: '请在外部平台完成课程后回到 App 打卡。', minutes: 45, sortOrder: 1, required: true})});
  assert.equal(externalCourse.status, 201);
  const externalCourseData = (await externalCourse.json() as any).data;
  assert.equal(externalCourseData.description, '请在外部平台完成课程后回到 App 打卡。');
  assert.equal(externalCourseData.contentId, undefined);
  const invalidExternalCourse = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items`, {method: 'POST', headers, body: JSON.stringify({contentType: 'course', title: '不应关联站内视频', description: '外部课程说明', contentId: 'course-internal', minutes: 20})});
  assert.equal(invalidExternalCourse.status, 422);
  const item = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items`, {method: 'POST', headers, body: JSON.stringify({contentType: 'task', title: '完成专项复盘', minutes: 30, sortOrder: 10, required: true})});
  assert.equal(item.status, 201);
  const itemData = (await item.json() as any).data;
  assert.equal(itemData.title, '完成专项复盘');
  const itemUpdate = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items/${itemData.id}`, {method: 'PATCH', headers, body: JSON.stringify({minutes: 40})});
  assert.equal(itemUpdate.status, 200);
  assert.equal((await itemUpdate.json() as any).data.minutes, 40);
  const invalidContent = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items`, {method: 'POST', headers, body: JSON.stringify({contentType: 'course', contentId: 'missing-course', title: '无效课程', minutes: 20})});
  assert.equal(invalidContent.status, 422);
  const itemDelete = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items/${itemData.id}`, {method: 'DELETE', headers});
  assert.equal(itemDelete.status, 200);
  const externalCourseDelete = await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}/plan/items/${externalCourseData.id}`, {method: 'DELETE', headers});
  assert.equal(externalCourseDelete.status, 200);
  await fetch(`${base}/v1/admin/learning-coach/teachers/${teacherData.id}`, {method: 'DELETE', headers});
  await fetch(`${base}/v1/admin/learning-coach/stages/${stageData.id}`, {method: 'DELETE', headers});
  store.learningTeachers = store.learningTeachers.filter(item => item.id !== teacherData.id);
  store.learningStages = store.learningStages.filter(item => item.id !== stageData.id);
  store.learningStagePlanConfigs = store.learningStagePlanConfigs.filter(item => item.stageId !== stageData.id);
  store.learningStagePlanItems = store.learningStagePlanItems.filter(item => item.stageId !== stageData.id);
}));

test('AI admin quota and usage reflect completed and blocked requests', async () => withServer(async base => {
  const session = await adminSession(base);
  const original = store.aiQuotas.get('u-demo');
  try {
    const update = await fetch(`${base}/v1/admin/ai/quotas/u-demo`, {method: 'PATCH', headers: jsonHeaders(session), body: JSON.stringify({dailyLimit: 1, monthlyLimit: 2, reason: '专项额度测试'})});
    assert.equal(update.status, 200);
    const first = await fetch(`${base}/v1/ai/reply`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({prompt: 'quota test'})});
    assert.equal(first.status, 200);
    const second = await fetch(`${base}/v1/ai/reply`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({prompt: 'quota test again'})});
    assert.equal(second.status, 429);
    const usage = await fetch(`${base}/v1/admin/ai/usage?userId=u-demo`, {headers: {cookie: session.cookie}});
    const usageJson = await usage.json() as any;
    assert.equal(usage.status, 200);
    assert.equal(usageJson.data.eventCount >= 2, true);
    assert.equal(usageJson.data.items[0].requests >= 2, true);
  } finally {
    if (original) store.aiQuotas.set('u-demo', original); else store.aiQuotas.delete('u-demo');
  }
}));

test('community report resolution applies a moderation action and enforces a mute', async () => withServer(async base => {
  const session = await adminSession(base);
  const profileId = `moderation-user-${Date.now()}`;
  const postId = `moderation-post-${Date.now()}`;
  store.profiles.set(profileId, {id: profileId, name: 'Moderation user', phone: '13900000000', examYear: '2026', studyDays: 0});
  store.forumPosts.unshift({id: postId, userId: profileId, userName: 'Moderation user', category: '经验分享', title: 'Moderation test post', body: 'This is a sufficiently long moderation test post.', likes: 0, status: 'published', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()});
  try {
    const reportResponse = await fetch(`${base}/v1/forum/posts/${postId}/report`, {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer demo-token'}, body: JSON.stringify({reason: '违规内容'})});
    assert.equal(reportResponse.status, 201);
    const report = (await reportResponse.json() as any).data;
    const resolveResponse = await fetch(`${base}/v1/admin/community/reports/${report.id}/resolve`, {method: 'POST', headers: jsonHeaders(session), body: JSON.stringify({resolution: '限时禁言', action: 'restrict', targetType: 'user', targetId: profileId, durationSeconds: 60, reason: '违反社区规则'})});
    assert.equal(resolveResponse.status, 200);
    const result = (await resolveResponse.json() as any).data;
    assert.equal(result.moderationAction.action, 'restrict');
    assert.equal(store.userRestrictions.get(profileId)?.type, 'community');
    const actions = await fetch(`${base}/v1/admin/community/moderation-actions?targetId=${encodeURIComponent(profileId)}`, {headers: {cookie: session.cookie}});
    assert.equal((await actions.json() as any).data.total >= 1, true);
  } finally {
    store.profiles.delete(profileId);
    store.forumPosts = store.forumPosts.filter(item => item.id !== postId);
    store.userRestrictions.delete(profileId);
  }
}));

test('admin export worker produces an authenticated CSV download', async () => withServer(async base => {
  const session = await adminSession(base);
  const response = await fetch(`${base}/v1/admin/exports`, {method: 'POST', headers: jsonHeaders(session), body: JSON.stringify({resourceType: 'users'})});
  assert.equal(response.status, 202);
  const job = (await response.json() as any).data;
  await new Promise(resolve => setTimeout(resolve, 10));
  const detail = await fetch(`${base}/v1/admin/exports/${job.id}`, {headers: {cookie: session.cookie}});
  const detailJson = await detail.json() as any;
  assert.equal(detailJson.data.status, 'completed');
  const download = await fetch(`${base}/v1/admin/exports/${job.id}/download`, {headers: {cookie: session.cookie}});
  assert.equal(download.status, 200);
  assert.match(await download.text(), /id,name,phone/);
}));

test('product price updates require a reason and expose immutable history', async () => withServer(async base => {
  const session = await adminSession(base);
  const productId = `price-history-${Date.now()}`;
  const product = {id: productId, name: 'Price history test', category: 'test', price: 10, originalPrice: 10, sold: 0, accent: '#123456', benefits: [], status: 'on_sale' as const, updatedAt: new Date().toISOString()};
  store.products.push(product);
  try {
    const invalid = await fetch(`${base}/v1/admin/products/${productId}`, {method: 'PATCH', headers: jsonHeaders(session), body: JSON.stringify({price: 12})});
    assert.equal(invalid.status, 422);
    assert.equal(product.price, 10);
    const update = await fetch(`${base}/v1/admin/products/${productId}`, {method: 'PATCH', headers: jsonHeaders(session), body: JSON.stringify({price: 12, priceReason: 'seasonal adjustment'})});
    assert.equal(update.status, 200);
    const history = await fetch(`${base}/v1/admin/products/${productId}/price-history`, {headers: {cookie: session.cookie}});
    const historyJson = await history.json() as any;
    assert.equal(historyJson.data.total, 1);
    assert.equal(historyJson.data.items[0].price, 12);
  } finally { store.products = store.products.filter(item => item.id !== productId); }
}));

test('admin paper management separates objective and subjective paper workflows', async () => withServer(async base => {
  const session = await adminSession(base);
  const headers = jsonHeaders(session);
  let objectiveId = '';
  let subjectiveId = '';
  try {
    const objectiveResponse = await fetch(`${base}/v1/admin/content/papers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({name: '客观题分流测试卷', year: '2026', questionKind: 'objective', volume: '客观题卷一', mode: 'mock', durationMinutes: 180, totalScore: 100, questionIds: ['oq1']}),
    });
    assert.equal(objectiveResponse.status, 201);
    const objective = (await objectiveResponse.json() as any).data;
    objectiveId = objective.id;
    assert.equal(objective.questionKind, 'objective');

    const subjectiveResponse = await fetch(`${base}/v1/admin/content/papers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({name: '主观题分流测试卷', year: '2026', questionKind: 'subjective', subjectId: 'civil', totalScore: 40, questionIds: ['subjective-demo-1', 'subjective-demo-2']}),
    });
    assert.equal(subjectiveResponse.status, 201);
    const subjective = (await subjectiveResponse.json() as any).data;
    subjectiveId = subjective.id;
    assert.equal(subjective.questionKind, 'subjective');
    assert.equal(store.gradingPapers.some(item => item.id === subjectiveId), true);

    const mixedResponse = await fetch(`${base}/v1/admin/content/papers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({name: '错误混合测试卷', year: '2026', questionKind: 'subjective', subjectId: 'civil', totalScore: 20, questionIds: ['oq1']}),
    });
    assert.equal(mixedResponse.status, 422);

    const updateResponse = await fetch(`${base}/v1/admin/content/papers/${subjectiveId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({name: '主观题分流测试卷（更新）', questionKind: 'subjective', subjectId: 'civil', totalScore: 40, questionIds: ['subjective-demo-1', 'subjective-demo-2'], updatedAt: subjective.updatedAt}),
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json() as any).data.name, '主观题分流测试卷（更新）');

    const listResponse = await fetch(`${base}/v1/admin/content/papers`, {headers: {cookie: session.cookie}});
    assert.equal(listResponse.status, 200);
    const list = (await listResponse.json() as any).data.items;
    assert.equal(list.some((item: any) => item.id === objectiveId && item.questionKind === 'objective'), true);
    assert.equal(list.some((item: any) => item.id === subjectiveId && item.questionKind === 'subjective'), true);
  } finally {
    store.papers = store.papers.filter(item => item.id !== objectiveId);
    store.gradingPapers = store.gradingPapers.filter(item => item.id !== subjectiveId);
  }
}));

test('announcement lifecycle enforces scheduling, audience, receipts, withdrawal and draft deletion', async () => withServer(async base => {
  const session = await adminSession(base);
  const headers = jsonHeaders(session);
  const createdIds: string[] = [];
  try {
    const scheduledResponse = await fetch(`${base}/v1/admin/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: '2026 exam announcement',
        body: 'Only the selected exam-year audience should receive this announcement.',
        status: 'published',
        isPinned: true,
        audienceType: 'exam_year',
        audienceValue: '2026',
        deepLink: '/learning/plans',
        startsAt: new Date(Date.now() + 3_600_000).toISOString(),
        endsAt: new Date(Date.now() + 7_200_000).toISOString(),
      }),
    });
    assert.equal(scheduledResponse.status, 201);
    const scheduled = (await scheduledResponse.json() as any).data;
    createdIds.push(scheduled.id);
    assert.equal(scheduled.status, 'scheduled');

    const invalidScheduledEdit = await fetch(`${base}/v1/admin/announcements/${scheduled.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({startsAt: new Date(Date.now() - 60_000).toISOString()}),
    });
    assert.equal(invalidScheduledEdit.status, 422);
    assert.equal(store.announcements.find(item => item.id === scheduled.id)?.status, 'scheduled');

    const beforePublish = await fetch(`${base}/v1/announcements`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal((await beforePublish.json() as any).data.some((item: any) => item.id === scheduled.id), false);

    const publishResponse = await fetch(`${base}/v1/admin/announcements/${scheduled.id}/publish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({publishNow: true}),
    });
    assert.equal(publishResponse.status, 200);
    assert.equal((await publishResponse.json() as any).data.status, 'published');

    const afterPublish = await fetch(`${base}/v1/announcements`, {headers: {authorization: 'Bearer demo-token'}});
    const publicItems = (await afterPublish.json() as any).data;
    assert.equal(publicItems.some((item: any) => item.id === scheduled.id && item.deepLink === '/learning/plans' && item.isPinned === true), true);

    const readResponse = await fetch(`${base}/v1/announcements/${scheduled.id}/read`, {method: 'POST', headers: {authorization: 'Bearer demo-token'}});
    assert.equal(readResponse.status, 200);
    const closeResponse = await fetch(`${base}/v1/announcements/${scheduled.id}/close`, {method: 'POST', headers: {authorization: 'Bearer demo-token'}});
    assert.equal(closeResponse.status, 200);
    const afterClose = await fetch(`${base}/v1/announcements`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal((await afterClose.json() as any).data.some((item: any) => item.id === scheduled.id), false);
    const closedDetail = await fetch(`${base}/v1/announcements/${scheduled.id}`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal((await closedDetail.json() as any).data.closed, true);
    const adminList = await fetch(`${base}/v1/admin/announcements`, {headers: {cookie: session.cookie}});
    const adminItem = (await adminList.json() as any).data.items.find((item: any) => item.id === scheduled.id);
    assert.equal(adminItem.readCount, 1);
    assert.equal(typeof adminItem.readRate, 'number');

    const filtered = await fetch(`${base}/v1/admin/announcements?status=published&keyword=exam`, {headers: {cookie: session.cookie}});
    assert.equal((await filtered.json() as any).data.items.some((item: any) => item.id === scheduled.id), true);
    const pinned = await fetch(`${base}/v1/admin/announcements?isPinned=true&page=1&pageSize=10`, {headers: {cookie: session.cookie}});
    assert.equal((await pinned.json() as any).data.items.some((item: any) => item.id === scheduled.id), true);
    const paged = await fetch(`${base}/v1/admin/announcements?page=1&pageSize=1`, {headers: {cookie: session.cookie}});
    const pagedData = (await paged.json() as any).data;
    assert.equal(pagedData.items.length, 1);
    assert.equal(pagedData.total >= 1, true);
    const stats = await fetch(`${base}/v1/admin/announcements/stats`, {headers: {cookie: session.cookie}});
    const statsData = (await stats.json() as any).data;
    assert.equal(stats.status, 200);
    assert.equal(statsData.total >= 1, true);
    assert.equal(typeof statsData.readRate, 'number');

    const invalidTarget = await fetch(`${base}/v1/admin/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({title: 'Invalid target', body: 'This should be rejected.', status: 'published', isPinned: false, audienceType: 'all', deepLink: '/not-a-real-page'}),
    });
    assert.equal(invalidTarget.status, 422);

    const withdrawResponse = await fetch(`${base}/v1/admin/announcements/${scheduled.id}/withdraw`, {
      method: 'POST',
      headers,
      body: JSON.stringify({reason: 'Content needs correction'}),
    });
    assert.equal(withdrawResponse.status, 200);
    assert.equal((await withdrawResponse.json() as any).data.status, 'withdrawn');
    const afterWithdraw = await fetch(`${base}/v1/announcements/${scheduled.id}`, {headers: {authorization: 'Bearer demo-token'}});
    assert.equal(afterWithdraw.status, 404);

    const draftResponse = await fetch(`${base}/v1/admin/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({title: 'Disposable draft', body: 'This draft should be removable.', status: 'draft', isPinned: false, audienceType: 'all'}),
    });
    assert.equal(draftResponse.status, 201);
    const draft = (await draftResponse.json() as any).data;
    createdIds.push(draft.id);
    const deleteResponse = await fetch(`${base}/v1/admin/announcements/${draft.id}`, {method: 'DELETE', headers});
    assert.equal(deleteResponse.status, 200);
    assert.equal(store.announcements.some(item => item.id === draft.id), false);
  } finally {
    store.announcements = store.announcements.filter(item => !createdIds.includes(item.id));
    for (const id of createdIds) {
      store.notificationReceipts.delete(`u-demo:announcement:${id}`);
      store.notificationClosures.delete(`u-demo:announcement:${id}`);
    }
  }
}));

test('announcement mutations keep memory unchanged when the database transaction fails', async () => withServer(async base => {
  const session = await adminSession(base);
  const headers = jsonHeaders(session);
  const title = `Atomic announcement ${Date.now()}`;
  const originalTransaction = infrastructure.transaction.bind(infrastructure);
  infrastructure.transaction = async () => { throw new Error('forced transaction failure'); };
  try {
    const response = await fetch(`${base}/v1/admin/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({title, body: 'This announcement must not enter memory after a failed transaction.', status: 'draft', audienceType: 'all', isPinned: false}),
    });
    assert.equal(response.status, 500);
    assert.equal(store.announcements.some(item => item.title === title), false);
  } finally {
    infrastructure.transaction = originalTransaction;
  }
}));
