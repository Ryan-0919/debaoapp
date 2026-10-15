import type {GradingAIRun, GradingAssignment, GradingPaper, GradingReport, GradingReview, GradingRubric, GradingSubmission, LearningClassType, LearningDiagnosticDimensionDefinition, LearningDiagnosticForm, LearningStage, LearningTeacher, Store, UserSettings, ProductSku, Coupon} from './types.js';
import {appLegalDocuments} from './app-legal-documents.js';

const demoNow = new Date().toISOString();
const demoDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};
const demoRubrics: GradingRubric[] = [
  {
    id: 'rubric-demo-civil-1', questionId: 'subjective-demo-1', questionVersion: 1, title: '民法案例分析：房屋买卖与租赁', subjectId: 'civil',
    caseMaterial: '甲乙之间发生民事争议，请结合民法典分析请求权基础及法律后果。',
    subQuestions: [{id: 'sq-1', prompt: '分析请求权基础及法律后果', maxScore: 20}],
    gradingBasis: '围绕请求权基础、构成要件、法律后果和规范依据作答。', totalScore: 20, suggestedMinutes: 45, allowedAnswerTypes: ['text', 'image', 'pdf'],
    points: [
      {id: 'rp-1', title: '请求权基础', description: '准确识别并说明适用的请求权基础', maxScore: 8, sortOrder: 1, keywords: ['请求权', '法律关系'], legalReferences: ['《民法典》相关规定']},
      {id: 'rp-2', title: '构成要件', description: '结合事实分析构成要件和证据', maxScore: 7, sortOrder: 2, keywords: ['构成要件', '事实'], legalReferences: []},
      {id: 'rp-3', title: '法律后果', description: '给出完整且有依据的处理结论', maxScore: 5, sortOrder: 3, keywords: ['法律后果', '结论'], legalReferences: []},
    ], status: 'published', createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow,
  },
  {
    id: 'rubric-demo-civil-2', questionId: 'subjective-demo-2', questionVersion: 1, title: '民法案例分析：合同解除与违约责任', subjectId: 'civil',
    caseMaterial: '甲乙签订设备买卖合同，乙迟延交付且设备存在质量瑕疵。甲催告后乙仍未修复，甲遂解除合同并主张损失。',
    subQuestions: [{id: 'civil-2-a', prompt: '分析甲是否有权解除合同。', maxScore: 10}, {id: 'civil-2-b', prompt: '分析甲可主张的违约责任范围。', maxScore: 10}],
    gradingBasis: '围绕根本违约、催告解除、损害赔偿可预见性和减损规则作答。', totalScore: 20, suggestedMinutes: 40, allowedAnswerTypes: ['text', 'image'],
    points: [
      {id: 'civil-2-p1', title: '解除条件', description: '判断迟延履行和质量瑕疵是否达到解除条件', maxScore: 8, sortOrder: 1, keywords: ['解除', '根本违约'], legalReferences: ['《民法典》第五百六十三条']},
      {id: 'civil-2-p2', title: '赔偿范围', description: '区分实际损失、可得利益及减损义务', maxScore: 7, sortOrder: 2, keywords: ['损害赔偿', '可得利益'], legalReferences: []},
      {id: 'civil-2-p3', title: '论证表达', description: '结论明确，事实与规则对应完整', maxScore: 5, sortOrder: 3, keywords: ['结论', '论证'], legalReferences: []},
    ], status: 'published', createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow,
  },
  {
    id: 'rubric-demo-criminal-1', questionId: 'subjective-demo-3', questionVersion: 1, title: '刑法案例分析：共同犯罪与犯罪中止', subjectId: 'criminal',
    caseMaterial: '甲邀约乙盗窃，乙进入现场后因害怕主动停止并返还工具，甲独自完成盗窃。请分析甲乙的刑事责任。',
    subQuestions: [{id: 'criminal-1-a', prompt: '分析甲、乙是否构成共同犯罪及各自责任。', maxScore: 12}, {id: 'criminal-1-b', prompt: '分析乙主动退出行为的法律性质。', maxScore: 8}],
    gradingBasis: '重点考察共同故意、实行行为、犯罪中止成立条件及未遂区分。', totalScore: 20, suggestedMinutes: 45, allowedAnswerTypes: ['text', 'image', 'pdf'],
    points: [
      {id: 'criminal-1-p1', title: '共同犯罪认定', description: '说明共同故意与行为分工', maxScore: 8, sortOrder: 1, keywords: ['共同故意', '共犯'], legalReferences: ['《刑法》第二十五条']},
      {id: 'criminal-1-p2', title: '中止判断', description: '判断乙是否自动放弃并有效防止结果', maxScore: 7, sortOrder: 2, keywords: ['犯罪中止', '自动放弃'], legalReferences: ['《刑法》第二十四条']},
      {id: 'criminal-1-p3', title: '责任结论', description: '分别给出甲乙定罪量刑结论', maxScore: 5, sortOrder: 3, keywords: ['刑事责任', '量刑'], legalReferences: []},
    ], status: 'published', createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow,
  },
];
const demoPapers: GradingPaper[] = [
  {id: 'grading-paper-civil', title: '2026 民法主观题专项套卷（一）', subjectId: 'civil', year: '2026', totalScore: 40, questionIds: ['subjective-demo-1', 'subjective-demo-2'], status: 'published', createdAt: demoNow, updatedAt: demoNow},
  {id: 'grading-paper-criminal', title: '2026 刑法主观题专项套卷（一）', subjectId: 'criminal', year: '2026', totalScore: 20, questionIds: ['subjective-demo-3'], status: 'published', createdAt: demoNow, updatedAt: demoNow},
];
const demoSubmissions: GradingSubmission[] = [
  {id: 'gsub-showcase-available-1', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-1', rubricId: 'rubric-demo-civil-1', questionVersion: 1, idempotencyKey: 'showcase-available-1', answerHash: 'showcase-hash-available-1', answers: [{subQuestionId: 'sq-1', text: '甲将房屋出售给丙不当然影响既有租赁关系。乙可以依据买卖不破租赁规则继续占有使用房屋，并向新的所有权人履行租金给付义务。', attachments: []}], status: 'manual_queued', currentAssignmentId: 'gassign-showcase-available-1', createdAt: '2026-08-31T09:10:00.000Z', updatedAt: '2026-08-31T09:12:00.000Z'},
  {id: 'gsub-showcase-available-2', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-2', rubricId: 'rubric-demo-civil-2', questionVersion: 1, idempotencyKey: 'showcase-available-2', answerHash: 'showcase-hash-available-2', answers: [{subQuestionId: 'civil-2-a', text: '乙迟延交付并且设备存在严重质量问题，经催告后仍未修复，已经导致合同目的不能实现，甲可以解除合同。', attachments: []}, {subQuestionId: 'civil-2-b', text: '甲可以请求赔偿实际损失和订立合同时可以预见的可得利益损失，但应当履行减损义务。', attachments: []}], status: 'manual_queued', currentAssignmentId: 'gassign-showcase-available-2', createdAt: '2026-08-31T08:35:00.000Z', updatedAt: '2026-08-31T08:38:00.000Z'},
  {id: 'gsub-showcase-claimed', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-1', rubricId: 'rubric-demo-civil-1', questionVersion: 1, idempotencyKey: 'showcase-claimed', answerHash: 'showcase-hash-claimed', answers: [{subQuestionId: 'sq-1', text: '本案应先确定合同效力，再分析承租人的占有依据和房屋所有权变动后的法律后果。', attachments: []}], status: 'manual_claimed', currentAssignmentId: 'gassign-showcase-claimed', createdAt: '2026-08-31T07:20:00.000Z', updatedAt: '2026-08-31T07:40:00.000Z'},
  {id: 'gsub-showcase-returned', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-2', rubricId: 'rubric-demo-civil-2', questionVersion: 1, idempotencyKey: 'showcase-returned', answerHash: 'showcase-hash-returned', answers: [{subQuestionId: 'civil-2-a', text: '图片答案无法辨认。', attachments: []}, {subQuestionId: 'civil-2-b', text: '', attachments: []}], status: 'manual_returned', currentAssignmentId: 'gassign-showcase-returned', createdAt: '2026-08-30T15:10:00.000Z', updatedAt: '2026-08-30T15:45:00.000Z'},
  {id: 'gsub-demo-queued', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-1', rubricId: 'rubric-demo-civil-1', questionVersion: 1, idempotencyKey: 'demo-queued', answerHash: 'demo-hash-queued', answers: [{subQuestionId: 'sq-1', text: '应从请求权基础、构成要件和法律后果展开分析。', attachments: []}], status: 'manual_queued', currentAssignmentId: 'gassign-demo-available', createdAt: '2026-08-30T09:20:00.000Z', updatedAt: '2026-08-30T09:25:00.000Z'},
  {id: 'gsub-demo-claimed', userId: 'u-demo', paperId: 'grading-paper-criminal', questionId: 'subjective-demo-3', rubricId: 'rubric-demo-criminal-1', questionVersion: 1, idempotencyKey: 'demo-claimed', answerHash: 'demo-hash-claimed', answers: [{subQuestionId: 'criminal-1-a', text: '甲乙具有共同盗窃故意。', attachments: []}, {subQuestionId: 'criminal-1-b', text: '乙主动退出，可能成立犯罪中止。', attachments: []}], status: 'manual_claimed', currentAssignmentId: 'gassign-demo-claimed', createdAt: '2026-08-29T14:10:00.000Z', updatedAt: '2026-08-29T14:35:00.000Z'},
  {id: 'gsub-demo-published', userId: 'u-demo', paperId: 'grading-paper-civil', questionId: 'subjective-demo-2', rubricId: 'rubric-demo-civil-2', questionVersion: 1, idempotencyKey: 'demo-published', answerHash: 'demo-hash-published', answers: [{subQuestionId: 'civil-2-a', text: '乙构成根本违约，甲可解除合同。', attachments: []}, {subQuestionId: 'civil-2-b', text: '甲可请求实际损失及可预见的可得利益。', attachments: []}], status: 'published', currentAssignmentId: 'gassign-demo-submitted', latestReportId: 'greport-demo-published', createdAt: '2026-08-27T10:00:00.000Z', updatedAt: '2026-08-28T12:00:00.000Z'},
  {id: 'gsub-demo-failed', userId: 'u-demo', paperId: 'grading-paper-criminal', questionId: 'subjective-demo-3', rubricId: 'rubric-demo-criminal-1', questionVersion: 1, idempotencyKey: 'demo-failed', answerHash: 'demo-hash-failed', answers: [{subQuestionId: 'criminal-1-a', text: '待补充', attachments: []}, {subQuestionId: 'criminal-1-b', text: '', attachments: []}], status: 'ai_failed', aiFailureReason: '开发环境未配置 AI Provider', createdAt: '2026-08-26T16:00:00.000Z', updatedAt: '2026-08-26T16:01:00.000Z'},
];
const demoAssignments: GradingAssignment[] = [
  {id: 'gassign-showcase-available-1', submissionId: 'gsub-showcase-available-1', status: 'available', createdAt: '2026-08-31T09:12:00.000Z'},
  {id: 'gassign-showcase-available-2', submissionId: 'gsub-showcase-available-2', status: 'available', createdAt: '2026-08-31T08:38:00.000Z'},
  {id: 'gassign-showcase-claimed', submissionId: 'gsub-showcase-claimed', graderId: 'grader-demo', status: 'claimed', claimedAt: '2026-08-31T07:40:00.000Z', dueAt: '2026-09-01T07:40:00.000Z', createdAt: '2026-08-31T07:35:00.000Z'},
  {id: 'gassign-showcase-returned', submissionId: 'gsub-showcase-returned', graderId: 'grader-demo', status: 'returned', claimedAt: '2026-08-30T15:30:00.000Z', dueAt: '2026-08-31T15:30:00.000Z', returnReason: '用户上传的第二问答案为空，第一问内容无法形成有效论证。', createdAt: '2026-08-30T15:25:00.000Z'},
  {id: 'gassign-demo-available', submissionId: 'gsub-demo-queued', status: 'available', createdAt: '2026-08-30T09:25:00.000Z'},
  {id: 'gassign-demo-claimed', submissionId: 'gsub-demo-claimed', graderId: 'grader-criminal', status: 'claimed', claimedAt: '2026-08-29T14:35:00.000Z', dueAt: '2026-09-01T14:35:00.000Z', createdAt: '2026-08-29T14:30:00.000Z'},
  {id: 'gassign-demo-submitted', submissionId: 'gsub-demo-published', graderId: 'grader-demo', status: 'submitted', claimedAt: '2026-08-27T11:00:00.000Z', dueAt: '2026-08-28T11:00:00.000Z', submittedAt: '2026-08-28T11:30:00.000Z', createdAt: '2026-08-27T10:30:00.000Z'},
];
const demoAiRuns: GradingAIRun[] = [
  {id: 'gai-showcase-available-1', submissionId: 'gsub-showcase-available-1', provider: 'openai', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 15, result: {pointResults: [{pointId: 'rp-1', suggestedScore: 7, status: 'hit', evidence: '明确识别买卖不破租赁规则'}, {pointId: 'rp-2', suggestedScore: 5, status: 'partial', evidence: '提及所有权变动，但构成要件展开不足'}, {pointId: 'rp-3', suggestedScore: 3, status: 'partial', evidence: '结论正确，法律后果仍可补充'}], feedback: '请求权基础识别较准确，需要补足构成要件与法律后果。', needsHumanAttention: true}, createdAt: '2026-08-31T09:11:00.000Z', completedAt: '2026-08-31T09:12:00.000Z'},
  {id: 'gai-showcase-available-2', submissionId: 'gsub-showcase-available-2', provider: 'openai', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 17, result: {pointResults: [{pointId: 'civil-2-p1', suggestedScore: 7, status: 'hit', evidence: '指出经催告仍未修复且合同目的不能实现'}, {pointId: 'civil-2-p2', suggestedScore: 6, status: 'hit', evidence: '覆盖实际损失、可得利益和减损义务'}, {pointId: 'civil-2-p3', suggestedScore: 4, status: 'hit', evidence: '结论与事实对应清楚'}], feedback: '整体论证完整，可重点复核解除条件是否达到满分标准。', needsHumanAttention: false}, createdAt: '2026-08-31T08:37:00.000Z', completedAt: '2026-08-31T08:38:00.000Z'},
  {id: 'gai-showcase-claimed', submissionId: 'gsub-showcase-claimed', provider: 'openai', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 12, result: {pointResults: [{pointId: 'rp-1', suggestedScore: 5, status: 'partial', evidence: '能够识别合同效力与租赁关系'}, {pointId: 'rp-2', suggestedScore: 4, status: 'partial', evidence: '缺少对关键事实的逐项涵摄'}, {pointId: 'rp-3', suggestedScore: 3, status: 'partial', evidence: '法律后果表述较概括'}], feedback: '答题结构正确，但规范依据和事实涵摄不足。', needsHumanAttention: true}, createdAt: '2026-08-31T07:36:00.000Z', completedAt: '2026-08-31T07:37:00.000Z'},
  {id: 'gai-demo-queued', submissionId: 'gsub-demo-queued', provider: 'unconfigured', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 16, result: {pointResults: [{pointId: 'civil-1-p1', suggestedScore: 6, status: 'hit', evidence: '识别买卖不破租赁'}], feedback: '规则识别基本准确。', needsHumanAttention: true}, createdAt: '2026-08-30T09:26:00.000Z', completedAt: '2026-08-30T09:26:02.000Z'},
  {id: 'gai-demo-claimed', submissionId: 'gsub-demo-claimed', provider: 'unconfigured', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 14, result: {pointResults: [{pointId: 'criminal-1-p1', suggestedScore: 6, status: 'partial', evidence: '提及共同故意但论证较简略'}], feedback: '需要人工核对中止成立条件。', needsHumanAttention: true}, createdAt: '2026-08-29T14:31:00.000Z', completedAt: '2026-08-29T14:31:02.000Z'},
  {id: 'gai-demo-published', submissionId: 'gsub-demo-published', provider: 'unconfigured', model: 'gpt-4.1-mini', status: 'completed', suggestedScore: 15, result: {pointResults: [{pointId: 'civil-2-p1', suggestedScore: 7, status: 'hit', evidence: '识别根本违约'}], feedback: '整体结构完整。', needsHumanAttention: false}, createdAt: '2026-08-27T10:31:00.000Z', completedAt: '2026-08-27T10:31:02.000Z'},
  {id: 'gai-demo-failed', submissionId: 'gsub-demo-failed', provider: 'unconfigured', model: 'gpt-4.1-mini', status: 'failed', failureReason: '开发环境未配置 AI Provider', createdAt: '2026-08-26T16:01:00.000Z'},
];
const demoReviews: GradingReview[] = [
  {id: 'greview-demo-published', submissionId: 'gsub-demo-published', assignmentId: 'gassign-demo-submitted', graderId: 'grader-demo', totalScore: 16, pointResults: [{pointId: 'civil-2-p1', score: 8, status: 'hit', comment: '解除条件判断准确'}, {pointId: 'civil-2-p2', score: 5, status: 'partial', comment: '赔偿范围还可展开'}, {pointId: 'civil-2-p3', score: 3, status: 'partial', comment: '结论清楚'}], answerAnnotations: [{id: 'annotation-demo-1', subQuestionId: 'sq-demo-2-1', start: 0, end: 18, quote: '承租人可以继续租赁', type: 'correct', comment: '结论识别准确'}, {id: 'annotation-demo-2', subQuestionId: 'sq-demo-2-1', start: 25, end: 37, quote: '但没有说明依据', type: 'error', comment: '需要补充法律依据'}], missedPointIds: [], feedback: '论点清晰，法条引用准确。', improvementAdvice: '加强对损失范围和减损义务的论证。', status: 'approved', createdAt: '2026-08-28T11:30:00.000Z', reviewedAt: '2026-08-28T12:00:00.000Z', reviewedBy: 'admin-demo'},
];
const demoReports: GradingReport[] = [
  {id: 'greport-demo-published', submissionId: 'gsub-demo-published', reviewId: 'greview-demo-published', version: 1, totalScore: 16, maxScore: 20, answers: [{subQuestionId: 'sq-demo-2-1', text: '承租人可以继续租赁，但没有说明依据。出租人应当承担相应责任。', attachments: []}], pointResults: [{pointId: 'civil-2-p1', title: '解除条件', score: 8, maxScore: 8, status: 'hit', comment: '解除条件判断准确'}, {pointId: 'civil-2-p2', title: '赔偿范围', score: 5, maxScore: 7, status: 'partial', comment: '赔偿范围还可展开'}, {pointId: 'civil-2-p3', title: '论证表达', score: 3, maxScore: 5, status: 'partial', comment: '结论清楚'}], answerAnnotations: [{id: 'annotation-demo-1', subQuestionId: 'sq-demo-2-1', start: 0, end: 18, quote: '承租人可以继续租赁', type: 'correct', comment: '结论识别准确'}, {id: 'annotation-demo-2', subQuestionId: 'sq-demo-2-1', start: 25, end: 37, quote: '没有说明依据', type: 'error', comment: '需要补充法律依据'}], missedPointIds: [], feedback: '论点清晰，法条引用准确。', improvementAdvice: '加强对损失范围和减损义务的论证。', publishedBy: 'admin-demo', publishedAt: '2026-08-28T12:00:00.000Z'},
];

const showcaseIds = new Set([
  'gsub-showcase-available-1', 'gsub-showcase-available-2', 'gsub-showcase-claimed', 'gsub-showcase-returned',
  'gassign-showcase-available-1', 'gassign-showcase-available-2', 'gassign-showcase-claimed', 'gassign-showcase-returned',
  'gai-showcase-available-1', 'gai-showcase-available-2', 'gai-showcase-claimed',
]);

export function restoreDevelopmentGradingShowcase(store: Store) {
  const replaceShowcase = <T extends {id: string}>(current: T[], source: T[]) => [
    ...source.filter(item => showcaseIds.has(item.id)).map(item => structuredClone(item)),
    ...current.filter(item => !showcaseIds.has(item.id)),
  ];
  store.gradingSubmissions = replaceShowcase(store.gradingSubmissions, demoSubmissions);
  store.gradingAssignments = replaceShowcase(store.gradingAssignments, demoAssignments);
  store.gradingAiRuns = replaceShowcase(store.gradingAiRuns, demoAiRuns);
}

export function createStore(withFixtures = false): Store {
  if (!withFixtures) {
    const empty = createStore(true);
    const collections = empty as unknown as Record<string, unknown>;
    for (const key of Object.keys(collections)) {
      const value = collections[key];
      if (Array.isArray(value)) collections[key] = [];
      else if (value instanceof Map) collections[key] = new Map();
      else if (value instanceof Set) collections[key] = new Set();
    }
    return empty;
  }
  return {
    profiles: new Map([['u-demo', {
      id: 'u-demo',
      name: '法考学习者',
      phone: '13800139190',
      examYear: '2026',
      studyDays: 126,
      avatarColor: '#4C4BEA',
    }]]),
    subjects: [
      {id: 'civil', name: '民法', questionCount: 2380, color: '#DDE9FF'},
      {id: 'criminal', name: '刑法', questionCount: 1860, color: '#FFE0D1'},
      {id: 'admin', name: '行政法', questionCount: 960, color: '#DDF3E4'},
      {id: 'civil-proc', name: '民事诉讼法', questionCount: 1280, color: '#D9F3EE'},
      {id: 'crim-proc', name: '刑事诉讼法', questionCount: 1420, color: '#FFF0C7'},
      {id: 'commercial', name: '商法', questionCount: 1160, color: '#F7DDE3'},
      {id: 'economic', name: '经济法', questionCount: 880, color: '#DCEFFF'},
      {id: 'theory', name: '理论法', questionCount: 720, color: '#DDE9FF'},
    ],
    courses: [
      {id: 'c1', title: '民法体系精讲', teacher: '张明远', type: 'video', progress: 68, lessons: 42, accent: '#5D7FE8', status: 'published', updatedAt: new Date().toISOString()},
      {id: 'c2', title: '刑法重点突破', teacher: '周子恒', type: 'audio', progress: 32, lessons: 36, accent: '#E27663'},
      {id: 'c3', title: '主观题每日带练', teacher: '王老师', type: 'live', progress: 12, lessons: 30, accent: '#56A878'},
      {id: 'c4', title: '行政法真题串讲', teacher: '陈思源', type: 'video', progress: 0, lessons: 24, accent: '#D59841'},
    ],
    courseSections: [],
    courseLessons: [],
    liveSessions: [],
    products: [
      {id: 'p1', name: '2026 法考全程班（主客一体）', category: '全程备考', price: 3980, originalPrice: 5200, sold: 2847, accent: '#5D7FE8', benefits: ['客观题全科精讲', '主观题批改 20 次', '班主任学习规划']},
      {id: 'p2', name: '主观题案例突破班', category: '主观题', price: 1680, originalPrice: 2280, sold: 1536, accent: '#E27663', benefits: ['80 个核心案例', '逐题人工批改', '考前模拟 6 套']},
      {id: 'p3', name: '法条音频随身课', category: '音频课', price: 299, originalPrice: 399, sold: 4203, accent: '#56A878', benefits: ['全科重点法条', '逐字稿配套', '离线能力待接入']},
      {id: 'deen-private-coach', name: '得恩私教', category: '个性化学习', price: 1999, originalPrice: 2699, sold: 0, accent: '#4C4BEA', benefits: ['首次学习诊断', '专属学习画像', '个性化学习计划'], status: 'on_sale'},
    ],
    productSkus: [
      {id: 'sku-p1-standard', productId: 'p1', name: '标准版', price: 3980, stock: 99999, status: 'active', attributes: {版本: '标准版'}, updatedAt: new Date().toISOString()},
      {id: 'sku-p2-standard', productId: 'p2', name: '标准版', price: 1680, stock: 99999, status: 'active', attributes: {版本: '标准版'}, updatedAt: new Date().toISOString()},
      {id: 'sku-p3-standard', productId: 'p3', name: '标准版', price: 299, stock: 99999, status: 'active', attributes: {版本: '标准版'}, updatedAt: new Date().toISOString()},
      {id: 'sku-deen-private-coach-standard', productId: 'deen-private-coach', name: '标准版', price: 1999, stock: 99999, status: 'active', attributes: {版本: '标准版'}, updatedAt: new Date().toISOString()},
    ] satisfies ProductSku[],
    coupons: [
      {code: 'DEBAO10', type: 'percentage', value: 10, minAmount: 100, maxDiscount: 500, startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2099-01-01T00:00:00.000Z', usageLimit: 10000, usedCount: 0, status: 'active'},
    ] satisfies Coupon[],
    orders: [
      {id: 'DB202608270001', userId: 'u-demo', productId: 'p1', productName: '2026 法考全程班（主客一体）', amount: 3980, status: 'paid', createdAt: '2026-08-27T20:18:00.000Z', paidAt: '2026-08-27T20:18:00.000Z'},
      {id: 'DB202608110016', userId: 'u-demo', productId: 'p3', productName: '法条音频随身课', amount: 299, status: 'paid', createdAt: '2026-08-11T09:42:00.000Z', paidAt: '2026-08-11T09:42:00.000Z'},
      {id: 'DB202609160001', userId: 'u-demo', productId: 'deen-private-coach', productName: '得恩私教', amount: 1999, status: 'paid', createdAt: '2026-09-16T08:00:00.000Z', paidAt: '2026-09-16T08:00:00.000Z'},
    ],
    orderEvents: [
      {id: 'oe-seed-1', orderId: 'DB202608270001', type: 'paid', actor: 'provider', metadata: {transactionId: 'SEED-1'}, createdAt: '2026-08-27T20:18:00.000Z'},
      {id: 'oe-seed-2', orderId: 'DB202608110016', type: 'paid', actor: 'provider', metadata: {transactionId: 'SEED-2'}, createdAt: '2026-08-11T09:42:00.000Z'},
    ],
    questions: [
      {id: 'oq1', subjectId: 'civil', stem: '关于民事法律行为的效力，下列哪一选项是正确的？', options: ['无民事行为能力人实施的行为一律无效', '限制民事行为能力人实施的纯获利益行为有效', '可撤销行为自始当然无效', '无权代理行为不得追认'], answer: 1, analysis: '限制民事行为能力人可以独立实施纯获利益的民事法律行为。', status: 'published', version: 1, updatedAt: new Date().toISOString()},
      {id: 'oq2', subjectId: 'civil', stem: '甲将自己的房屋出租给乙，租赁期间将房屋出售给丙。下列说法正确的是？', options: ['租赁合同自动终止', '乙必须立即搬离', '买卖不破租赁', '丙可以单方提高租金'], answer: 2, analysis: '租赁物在承租人占有期间发生所有权变动，不影响租赁合同效力。', status: 'published', version: 1, updatedAt: new Date().toISOString()},
    ],
    objectiveSessions: [],
    objectiveReports: [],
    learningInquiries: [],
    papers: [],
    drafts: new Map(),
    sessions: new Map([['demo-token', {userId: 'u-demo', refreshToken: 'demo-refresh-token', deviceId: 'demo-device', expiresAt: '2099-01-01T00:00:00.000Z'}]]),
    identities: [],
    bindingTickets: new Map(),
    verificationChallenges: [],
    deletionRequests: new Map(),
    devices: [{id: 'demo-device', userId: 'u-demo', platform: 'android', name: '本地演示设备', lastSeenAt: new Date().toISOString()}],
    submissions: [],
    learningPlans: [{id: 'plan-demo', userId: 'u-demo', title: '2026 法考冲刺计划', dailyMinutes: 120, startDate: demoDate(-30), endDate: demoDate(30), status: 'active', stageId: 'stage-foundation', version: 1, updatedAt: demoNow}],
    learningEarlyAccessRequests: [],
    learningAssessmentPapers: [],
    learningTasks: [
      {id: 'task-demo-course', planId: 'plan-demo', title: '完成民法体系精讲第 18 讲', dueDate: demoDate(0), minutes: 45, status: 'todo', contentType: 'course', contentId: 'course-lesson-civil-18'},
      {id: 'task-demo-card', planId: 'plan-demo', title: '完成民法精讲·物权变动背诵卡片', dueDate: demoDate(0), minutes: 15, status: 'todo', contentType: 'card', contentId: 'card-civil-18'},
      {id: 'task-demo-question', planId: 'plan-demo', title: '完成民法配套题组·第 18 讲', dueDate: demoDate(0), minutes: 35, status: 'todo', contentType: 'question', contentId: 'question-civil-18'},
    ],
    learningSubjectiveSubmissions: [],
    favorites: [],
    legalFavorites: [],
    mistakes: [],
    entitlements: [{userId: 'u-demo', courseId: 'c1', sourceOrderId: 'DB202608270001'}],
    courseProgress: [
      {userId: 'u-demo', courseId: 'c1', progress: 68, updatedAt: new Date().toISOString()},
      {userId: 'u-demo', courseId: 'c2', progress: 32, updatedAt: new Date().toISOString()},
      {userId: 'u-demo', courseId: 'c3', progress: 12, updatedAt: new Date().toISOString()},
    ],
    learningActivities: [],
    learningActivityKeys: new Set(),
    learningDiagnosticDimensions: [
      {code: 'foundation', label: '学习基础', description: '已有知识与备考经历', color: 'blue', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {code: 'time', label: '时间投入', description: '每天可稳定投入的时间', color: 'cyan', sortOrder: 20, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {code: 'discipline', label: '执行能力', description: '计划执行与拖延风险', color: 'purple', sortOrder: 30, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {code: 'comprehension', label: '理解能力', description: '理解复杂规则和案例的能力', color: 'geekblue', sortOrder: 40, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {code: 'memory', label: '记忆能力', description: '记忆与复习保持情况', color: 'gold', sortOrder: 50, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {code: 'practice', label: '练习习惯', description: '做题、复盘和错题整理习惯', color: 'green', sortOrder: 60, status: 'active', createdAt: demoNow, updatedAt: demoNow},
    ] as LearningDiagnosticDimensionDefinition[],
    learningDiagnosticForms: [{id: 'initial-assessment', title: '首次学习诊断', subtitle: '先了解你，再制定学习方案', description: '请按真实情况作答。答案没有对错之分，只用于生成你的初始学习画像。', estimatedMinutes: 5, submitLabel: '提交诊断', successTitle: '初始学习画像已生成', successDescription: '后续会结合你的学习数据持续调整学习方案。', status: 'published', version: 1, createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow}] as LearningDiagnosticForm[],
    learningDiagnosticQuestions: [
      {id: 'diagnostic-foundation', formId: 'initial-assessment', stem: '你目前的法考备考基础更接近哪种情况？', description: '请选择最符合当前真实状态的一项', type: 'single', dimension: 'foundation', required: true, sortOrder: 10, status: 'published', version: 1, options: [
        {id: 'foundation-0', label: '刚开始了解法考，还没有系统学习', score: 0, sortOrder: 10},
        {id: 'foundation-1', label: '学过部分科目，但知识体系不完整', score: 1, sortOrder: 20},
        {id: 'foundation-2', label: '已经完整学习过一轮', score: 2, sortOrder: 30},
        {id: 'foundation-3', label: '参加过考试，正在查漏补缺', score: 3, sortOrder: 40},
      ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString()},
      {id: 'diagnostic-time', formId: 'initial-assessment', stem: '你平均每天可以稳定投入多少学习时间？', type: 'single', dimension: 'time', required: true, sortOrder: 20, status: 'published', version: 1, options: [
        {id: 'time-0', label: '不到 1 小时', score: 0, sortOrder: 10},
        {id: 'time-1', label: '1～2 小时', score: 1, sortOrder: 20},
        {id: 'time-2', label: '2～4 小时', score: 2, sortOrder: 30},
        {id: 'time-3', label: '4 小时以上', score: 3, sortOrder: 40},
      ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString()},
      {id: 'diagnostic-discipline', formId: 'initial-assessment', stem: '过去一个月，你执行学习计划的情况怎么样？', type: 'single', dimension: 'discipline', required: true, sortOrder: 30, status: 'published', version: 1, options: [
        {id: 'discipline-0', label: '经常拖延，很难开始', score: 0, sortOrder: 10},
        {id: 'discipline-1', label: '偶尔学习，容易被打断', score: 1, sortOrder: 20},
        {id: 'discipline-2', label: '大多数时候能按计划完成', score: 2, sortOrder: 30},
        {id: 'discipline-3', label: '执行稳定，并会主动复盘', score: 3, sortOrder: 40},
      ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString()},
    ],
    learningDiagnosticAttempts: [],
    learningQuestionBankQuestions: [
      {id: 'lqb-demo-objective-1', category: 'objective', questionType: 'single', subject: '民法', subjectId: 'objective-subject-civil', columnName: '民事法律行为', chapterId: 'objective-chapter-civil-act', knowledgePoint: '民事法律行为的效力', pointId: 'objective-point-civil-act-effect', subKnowledgePoint: '限制民事行为能力', subPointId: 'objective-subpoint-civil-act-limited', difficulty: 2, stem: '关于限制民事行为能力人实施的民事法律行为，下列说法正确的是？', options: [{key: 'A', label: '实施的行为一律无效'}, {key: 'B', label: '纯获利益的行为有效'}, {key: 'C', label: '所有行为均须法定代理人事先同意'}, {key: 'D', label: '行为不能被追认'}], correctAnswers: ['B'], analysis: '限制民事行为能力人可以独立实施纯获利益的民事法律行为。', subQuestions: [], estimatedMinutes: 2, source: '示例题', usageScenes: ['diagnostic', 'daily_practice'], status: 'published', version: 1, createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow},
      {id: 'lqb-demo-subjective-1', category: 'subjective', questionType: 'case_analysis', subject: '民法', subjectId: 'subjective-subject-civil', columnName: '合同法', chapterId: 'subjective-chapter-contract', knowledgePoint: '合同解除与损害赔偿', pointId: 'subjective-point-contract-termination', difficulty: 4, stem: '请结合案情回答下列问题。', options: [], correctAnswers: [], analysis: '', caseMaterial: '甲与乙签订房屋租赁合同，履行过程中因房屋权属变化发生争议。', subQuestions: [{id: 'sq-1', prompt: '乙能否继续履行租赁合同？请说明理由。', referenceAnswer: '乙可以依据买卖不破租赁规则继续履行租赁合同。', analysis: '需写明结论、规则及其在本案中的适用。', score: 10}, {id: 'sq-2', prompt: '如合同解除，损失应如何承担？', referenceAnswer: '应结合违约责任、因果关系和减损义务确定赔偿范围。', analysis: '需覆盖责任基础和损失范围。', score: 10}], estimatedMinutes: 25, source: '示例题', usageScenes: ['stage_test'], status: 'published', version: 1, createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow},
    ],
    learningPlanVersions: [],
    learningCards: [{id: 'card-civil-18', title: '物权变动 · 背诵样例', description: '用于本地联调的两张演示卡片，正式内容请在学习中心后台配置。', contentType: 'image_gallery', recallItems: [{id: 'recall-civil-18-1', prompt: '物权变动应以一定方式向外界____。', answer: '展示', sortOrder: 0}, {id: 'recall-civil-18-2', prompt: '登记或占有形成的权利外观，在一定条件下值得____。', answer: '信赖', sortOrder: 1}], assets: [{id: 'deba0000-0000-4000-8000-000000000001', type: 'image', filename: '公示原则.png', reference: '/v1/learning-card-assets/deba0000-0000-4000-8000-000000000001.png', sizeBytes: 58676, sortOrder: 0},{id: 'deba0000-0000-4000-8000-000000000002', type: 'image', filename: '公信原则.png', reference: '/v1/learning-card-assets/deba0000-0000-4000-8000-000000000002.png', sizeBytes: 64045, sortOrder: 1}], sortOrder: 0, status: 'published', version: 1, createdAt: demoNow, updatedAt: demoNow, publishedAt: demoNow}],
    learningQuestionTaxonomyNodes: [
      {id: 'objective-subject-civil', category: 'objective', type: 'subject', code: 'civil', name: '民法', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'objective-chapter-civil-act', category: 'objective', type: 'chapter', parentId: 'objective-subject-civil', code: 'civil-act', name: '民事法律行为', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'objective-point-civil-act-effect', category: 'objective', type: 'point', parentId: 'objective-chapter-civil-act', code: 'civil-act-effect', name: '民事法律行为的效力', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'objective-subpoint-civil-act-limited', category: 'objective', type: 'subpoint', parentId: 'objective-point-civil-act-effect', code: 'limited-capacity', name: '限制民事行为能力', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'subjective-subject-civil', category: 'subjective', type: 'subject', code: 'civil', name: '民法', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'subjective-chapter-contract', category: 'subjective', type: 'chapter', parentId: 'subjective-subject-civil', code: 'contract', name: '合同法', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'subjective-point-contract-termination', category: 'subjective', type: 'point', parentId: 'subjective-chapter-contract', code: 'contract-termination', name: '合同解除与损害赔偿', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
    ],
    learningClassTypes: [
      {id: 'class-deen-private-coach', code: 'deen-private-coach', name: '得恩私教标准班', productId: 'deen-private-coach', description: '得恩私教标准班型', endDate: '2026-12-31', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
    ] as LearningClassType[],
    learningStages: [
      {id: 'stage-foundation', classTypeId: 'class-deen-private-coach', code: 'foundation', name: '入门期', description: '适合刚开始建立学习基础的用户', conditions: [{dimension: 'foundation', operator: 'lte', value: 40}], sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'stage-system', classTypeId: 'class-deen-private-coach', code: 'system', name: '基础期', description: '适合已经开始系统学习的用户', conditions: [{dimension: 'foundation', operator: 'between', value: 41, upperValue: 70}], sortOrder: 20, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'stage-intensive', classTypeId: 'class-deen-private-coach', code: 'intensive', name: '强化期', description: '适合需要集中强化和复盘的用户', conditions: [{dimension: 'foundation', operator: 'gte', value: 71}], sortOrder: 30, status: 'active', createdAt: demoNow, updatedAt: demoNow},
    ] as LearningStage[],
    learningTeachers: [
      {id: 'teacher-foundation-civil', stageId: 'stage-foundation', name: '张老师', subject: '民法', specialty: '擅长基础薄弱、零基础学员的体系入门', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'teacher-system-criminal', stageId: 'stage-system', name: '李老师', subject: '刑法', specialty: '擅长知识体系梳理和案例分析', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
      {id: 'teacher-intensive-general', stageId: 'stage-intensive', name: '王老师', subject: '综合', specialty: '擅长强化训练、错题复盘和考前提分', sortOrder: 10, status: 'active', createdAt: demoNow, updatedAt: demoNow},
    ] as LearningTeacher[],
    learningStagePlanConfigs: [{stageId: 'stage-foundation', totalMinutes: 100, dailyMinutes: 120, minDailyMinutes: 30, maxDailyMinutes: 180, weekdayMinMinutes: 30, weekdayMaxMinutes: 180, weekendMinMinutes: 60, weekendMaxMinutes: 240, holidayMinMinutes: 60, holidayMaxMinutes: 180, holidayDates: [], studyDays: [1, 2, 3, 4, 5, 6, 0], durationDays: 30, makeupPolicy: 'spread', cardUnlockRule: 'after_course_checkin', questionPushCount: 5, questionSelectionStrategy: 'profile', status: 'published', version: 1, publishedAt: demoNow, updatedAt: demoNow}],
    learningStagePlanItems: [
      {id: 'stage-plan-foundation-course', stageId: 'stage-foundation', contentType: 'course', contentId: 'c1', title: '观看民法体系精讲', minutes: 45, sortOrder: 10, required: true},
      {id: 'stage-plan-foundation-question', stageId: 'stage-foundation', contentType: 'question', contentId: 'lqb-demo-objective-1', title: '完成民法基础练习', minutes: 35, sortOrder: 20, required: true},
      {id: 'stage-plan-foundation-review', stageId: 'stage-foundation', contentType: 'task', title: '整理今日学习笔记', minutes: 20, sortOrder: 30, required: true},
    ],
    learningTeacherAssignments: [],
    notificationReceipts: new Set(),
    grading: [],
    gradingRubrics: demoRubrics,
    gradingPapers: demoPapers,
    gradingSubmissions: demoSubmissions,
    gradingAiRuns: demoAiRuns,
    gradingAssignments: demoAssignments,
    gradingReviews: demoReviews,
    gradingReports: demoReports,
    graderAccounts: [
      {id: 'grader-demo', username: 'grader', displayName: '示例民法批改老师', passwordHash: 'local:change-me-grader', status: 'active', subjectIds: ['civil'], createdAt: demoNow},
      {id: 'grader-criminal', username: 'grader-criminal', displayName: '示例刑法批改老师', passwordHash: 'local:change-me-criminal', status: 'active', subjectIds: ['criminal'], createdAt: demoNow},
      {id: 'grader-all', username: 'grader-all', displayName: '示例全科批改老师', passwordHash: 'local:change-me-all', status: 'active', subjectIds: [], createdAt: demoNow},
    ],
    graderSessions: new Map(),
    gradingEvents: [
      {id: 'gevent-demo-queued', submissionId: 'gsub-demo-queued', eventType: 'manual_queued', actorType: 'admin', actorId: 'admin-demo', metadata: {source: 'mock'}, createdAt: '2026-08-30T09:25:00.000Z'},
      {id: 'gevent-demo-claimed', submissionId: 'gsub-demo-claimed', eventType: 'manual_claimed', actorType: 'grader', actorId: 'grader-criminal', metadata: {source: 'mock'}, createdAt: '2026-08-29T14:35:00.000Z'},
      {id: 'gevent-demo-published', submissionId: 'gsub-demo-published', eventType: 'published', actorType: 'admin', actorId: 'admin-demo', metadata: {reportId: 'greport-demo-published'}, createdAt: '2026-08-28T12:00:00.000Z'},
      {id: 'gevent-demo-submitted', submissionId: 'gsub-demo-published', eventType: 'manual_submitted', actorType: 'grader', actorId: 'grader-demo', metadata: {}, createdAt: '2026-08-28T11:30:00.000Z'},
    ],
    gradingCredits: new Map([['u-demo', 10]]),
    gradingCreditLedger: [],
    announcements: [{id: 'a-demo', title: '2026 法考冲刺阶段安排', body: '请按学习计划完成本周课程与专项练习。', status: 'published', isPinned: false, audienceType: 'all', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdAt: new Date().toISOString()}],
    banners: [{id: 'banner-demo', title: '2026 法考全程班', imageUrl: 'https://cdn.example.invalid/debao/banner-demo.png', target: '/products/p1', startsAt: '2026-01-01T00:00:00.000Z'}],
    legalDocuments: [{id: 'civil-311', title: '善意取得', article: '《民法典》第三百一十一条', content: '无处分权人将不动产或者动产转让给受让人的，所有权人有权追回。', documentCode: 'CIVIL-CODE', effectiveFrom: '2021-01-01', status: 'published', version: 1, updatedAt: new Date().toISOString()}],
    appLegalDocuments: appLegalDocuments.map(item => structuredClone(item)),
    userSettings: new Map<string, UserSettings>(),
    forumPosts: [{id: 'post-demo', userId: 'u-demo', userName: '法考学习者', category: '经验分享', title: '民法物权复习方法分享', body: '整理请求权基础后再做真题，复习效率会更高。', likes: 128, status: 'published', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}],
    forumComments: [],
    forumLikes: new Set(),
    forumFavorites: new Set(),
    userRestrictions: new Map(),
    entitlementAdjustments: [],
    refunds: [],
    communityReports: [],
    attachmentUploads: [],
    aiSessions: [],
    aiMessages: [],
    aiSessionRequestKeys: new Map(),
    aiMessageRequestKeys: new Map(),
    aiQuotas: new Map(),
    aiUsage: [],
    aiRiskFlags: [],
    communityModerationActions: [],
    notificationClosures: new Set(),
  };
}

