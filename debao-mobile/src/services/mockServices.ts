import {courses, notifications, orders, products, subjects} from '@/data/mock';
import type {Order, Product, UserProfile} from '@/types/domain';
import type {
  AIConversation,
  AIConversationDetail,
  AIMessage,
  AIService,
  AttachmentService,
  LearningActivity,
  AuthService,
  CourseService,
  MediaService,
  NotificationService,
  OrderService,
  PaymentService,
  QuestionService,
  ProductService,
  HomeService,
  LearningService,
  GradingService,
  GradingPaper,
  GradingQuestion,
  GradingSubmission,
  GradingReport,
  DeviceService,
  ForumComment,
  ForumPost,
  ForumReport,
  ForumService,
  LegalService,
  OrderEvent,
  RefundRequest,
} from './contracts';

const delay = (milliseconds = 220) =>
  new Promise<void>(resolve => setTimeout(resolve, milliseconds));

let mockProfile: UserProfile = {
  id: 'u-demo',
  name: '法考学习者',
  phone: '138****9190',
  examYear: '2026',
  studyDays: 126,
};

const createdOrders: Order[] = [];
const mockActivities: LearningActivity[] = [];
const mockConversations: AIConversationDetail[] = [];
const mockConversationRequestIds = new Map<string, string>();
const mockAttachments: Array<import('./contracts').AttachmentUpload> = [];
const mockRefunds: RefundRequest[] = [];

function mockConversationSummary(session: AIConversationDetail): AIConversation {
  const last = session.messages.at(-1);
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    ...(last ? {lastMessage: {role: last.role, content: last.content.slice(0, 200), createdAt: last.createdAt}} : {}),
  };
}

export const mockAuthService: AuthService = {
  async providers() { await delay(80); return {sms: {available: true}, wechat: {available: true}, oneClick: {available: true}}; },
  async sendCode() { await delay(80); return {accepted: true, expiresIn: 300, developmentCode: '123456'}; },
  async login(phone, _code) { await delay(); return {accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresIn: 604800, profile: {...mockProfile, phone: `${phone.slice(0, 3)}****${phone.slice(-4)}`}}; },
  async oneClickLogin() { await delay(); return {accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresIn: 604800, profile: {...mockProfile}}; },
  async wechatLogin() { await delay(); return {status: 'binding_required', bindingToken: 'mock-binding-token', expiresIn: 600, wechatProfile: {nickname: '微信用户'}}; },
  async bindWechatPhone(_bindingToken, phone) { await delay(); return {accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresIn: 604800, profile: {...mockProfile, phone: `${phone.slice(0, 3)}****${phone.slice(-4)}`}}; },
  async refresh(refreshToken) { await delay(); return {accessToken: 'mock-access-token', refreshToken, expiresIn: 604800}; },
  async getProfile() {
    await delay();
    return {...mockProfile};
  },
  async updateProfile(profile) {
    await delay();
    mockProfile = {...profile};
    return {...mockProfile};
  },
  async identities() { await delay(60); return [{provider: 'wechat' as const, nickname: '微信用户', boundAt: '2026-08-31T00:00:00.000Z'}]; },
  async sendIdentityLinkCode() { await delay(60); return {accepted: true, expiresIn: 300, developmentCode: '123456'}; },
  async bindWechatToCurrent() { await delay(100); return {provider: 'wechat' as const, nickname: '微信用户', boundAt: new Date().toISOString()}; },
  async sendIdentityUnlinkCode() { await delay(60); return {accepted: true, expiresIn: 300, developmentCode: '123456'}; },
  async unbindWechat() { await delay(100); return {removed: true}; },
  async sendPhoneChangeCode() { await delay(60); return {accepted: true, expiresIn: 300, developmentCode: '123456'}; },
  async phoneChange(newPhone) { await delay(100); mockProfile = {...mockProfile, phone: `${newPhone.slice(0, 3)}****${newPhone.slice(-4)}`}; return {...mockProfile}; },
  async deletionStatus() { await delay(60); return {status: 'none' as const}; },
  async sendDeletionCode() { await delay(60); return {accepted: true, expiresIn: 300, developmentCode: '123456'}; },
  async requestDeletion() { await delay(100); return {status: 'scheduled' as const, requestedAt: new Date().toISOString(), executeAfter: new Date(Date.now() + 7 * 86400000).toISOString(), coolingOffDays: 7}; },
  async cancelDeletion() { await delay(100); return {status: 'cancelled' as const, cancelledAt: new Date().toISOString()}; },
  async logout() {
    await delay(120);
  },
};

export const mockQuestionService: QuestionService = {
  async listSubjects() {
    await delay();
    return subjects;
  },
  async listQuestions() { await delay(); return {items: [], page: 1, pageSize: 50, total: 0}; },
  async getQuestion(id) { await delay(); throw new Error(`Mock question ${id} is provided by the prototype data layer.`); },
  async saveDraft() {
    await delay(140);
  },
  async submit() {
    await delay(350);
    return {submissionId: `SUB-${Date.now()}`};
  },
  async listRecords() { await delay(); return []; },
  async getSubmissionReport(id) { await delay(); throw new Error(`Mock submission report ${id} is provided by the prototype data layer.`); },
  async getRecordReport(id) { await delay(); throw new Error(`Mock submission report ${id} is provided by the prototype data layer.`); },
  async listMistakes() { await delay(); return []; },
  async resolveMistake() { await delay(); },
  async listFavorites() { await delay(); return []; },
  async addFavorite(questionId) { await delay(); return {id: `favorite-${Date.now()}`, questionId, createdAt: new Date().toISOString()}; },
  async removeFavorite() { await delay(); },
};

export const mockCourseService: CourseService = {
  async list() {
    await delay();
    return courses;
  },
  async get(id) {
    await delay();
    return courses.find(course => course.id === id) ?? null;
  },
  async entitlement(id) { await delay(); return {hasAccess: id === 'c1', sourceOrderId: id === 'c1' ? 'DB202608270001' : undefined}; },
  async updateProgress(id, progress) { await delay(); return {courseId: id, progress, updatedAt: new Date().toISOString()}; },
};

export const mockProductService: ProductService = {
  async list() { await delay(); return products; },
  async get(id) { await delay(); return products.find(product => product.id === id) ?? null; },
};

export const mockHomeService: HomeService = {async get() { await delay(); return {banners: [], announcements: notifications, hotCourses: courses, exam: {year: '2026', daysRemaining: 42}}; }};
export const mockLearningService: LearningService = {
  async plans() { await delay(); return [{id: 'plan-demo', title: '2026 法考冲刺计划', dailyMinutes: 120, startDate: '2026-08-01', endDate: '2026-10-31', status: 'active'}]; },
  async createPlan(input) { await delay(); return {id: `plan-${Date.now()}`, ...input, status: 'active'}; },
  async tasks() { await delay(); return []; },
  async completeTask(id) { await delay(); return {id, planId: 'plan-demo', title: '', dueDate: '', minutes: 0, status: 'done'}; },
  async card(id) { await delay(); return {id, title: '示例学习卡片', description: '完成卡片背诵后确认完成。', contentType: 'image_gallery', assets: [], status: 'published', version: 1, updatedAt: new Date().toISOString()}; },
  async subjectiveQuestion(id) { await delay(); return {id, title: '示例主观题', subjectId: 'civil', stem: '请结合案情作答。', caseMaterial: '示例案例材料。', subQuestions: [{id: 'sq-1', prompt: '请分析本案法律关系。', score: 10}], estimatedMinutes: 30, difficulty: 3}; },
  async submitSubjectiveTask(id) { await delay(); return {id, planId: 'plan-demo', title: '主观题训练', dueDate: new Date().toISOString().slice(0, 10), minutes: 30, status: 'done', contentType: 'subjective'}; },
  async pausePlan(id, days, reason) { await delay(); return {id, title: '2026 法考冲刺计划', dailyMinutes: 120, startDate: '2026-08-01', endDate: '2026-10-31', status: 'active', pausedAt: new Date().toISOString(), pausedUntil: new Date(Date.now() + days * 86400000).toISOString().slice(0, 10), pauseReason: reason}; },
  async resumePlan(id, reason) { await delay(); return {id, title: '2026 法考冲刺计划', dailyMinutes: 120, startDate: '2026-08-01', endDate: '2026-10-31', status: 'active', changeReason: reason}; },
  async report(period = 'week') { await delay(); return {period, minutes: 0, taskMinutes: 0, durationSeconds: 0, activities: 0, activityQuantity: 0, answered: 0, correctRate: 0, subjects: [], weakSubjects: [], dailyTrend: []}; },
  async recordActivity(input) {
    await delay(100);
    const existing = input.idempotencyKey ? mockActivities.find(item => item.idempotencyKey === input.idempotencyKey) : undefined;
    if (existing) return {...existing};
    const activity: LearningActivity = {id: `activity-${Date.now()}`, kind: input.kind, ...(input.subjectId ? {subjectId: input.subjectId} : {}), ...(input.questionId ? {questionId: input.questionId} : {}), ...(input.courseId ? {courseId: input.courseId} : {}), ...(input.taskId ? {taskId: input.taskId} : {}), durationSeconds: input.durationSeconds ?? 0, quantity: input.quantity ?? 1, ...(input.idempotencyKey ? {idempotencyKey: input.idempotencyKey} : {}), occurredAt: input.occurredAt ?? new Date().toISOString()};
    mockActivities.unshift(activity);
    return {...activity};
  },
  async activities(input) {
    await delay(100);
    const kind = input?.kind;
    const filtered = mockActivities.filter(item => !kind || item.kind === kind);
    const offset = Number(input?.cursor ?? 0); const limit = input?.limit ?? 50; const items = filtered.slice(offset, offset + limit).map(item => ({...item}));
    return {items, total: filtered.length, durationSeconds: filtered.reduce((sum, item) => sum + item.durationSeconds, 0), quantity: filtered.reduce((sum, item) => sum + item.quantity, 0), ...(offset + limit < filtered.length ? {nextCursor: String(offset + limit)} : {})};
  },
  async diagnostic() {
    await delay();
    return {access: 'granted', productId: 'deen-private-coach', completed: false, form: {id: 'initial-assessment', title: '首次学习诊断', subtitle: '先了解你，再制定学习方案', description: '请按真实情况作答。答案没有对错之分，只用于生成你的初始学习画像。', estimatedMinutes: 5, submitLabel: '提交诊断', successTitle: '初始学习画像已生成', successDescription: '后续会结合你的学习数据持续调整学习方案。', version: 1}, dimensions: [{code: 'foundation', label: '学习基础'}, {code: 'time', label: '时间投入'}, {code: 'discipline', label: '执行能力'}], questions: [
      {id: 'diagnostic-foundation', formId: 'initial-assessment', stem: '你目前的法考备考基础更接近哪种情况？', description: '请选择最符合当前真实状态的一项', type: 'single', required: true, sortOrder: 10, version: 1, options: [
        {id: 'foundation-0', label: '刚开始了解法考，还没有系统学习', sortOrder: 10},
        {id: 'foundation-1', label: '学过部分科目，但知识体系不完整', sortOrder: 20},
        {id: 'foundation-2', label: '已经完整学习过一轮', sortOrder: 30},
        {id: 'foundation-3', label: '参加过考试，正在查漏补缺', sortOrder: 40},
      ]},
      {id: 'diagnostic-time', formId: 'initial-assessment', stem: '你平均每天可以稳定投入多少学习时间？', type: 'single', required: true, sortOrder: 20, version: 1, options: [
        {id: 'time-0', label: '不到 1 小时', sortOrder: 10}, {id: 'time-1', label: '1～2 小时', sortOrder: 20}, {id: 'time-2', label: '2～4 小时', sortOrder: 30}, {id: 'time-3', label: '4 小时以上', sortOrder: 40},
      ]},
    ]};
  },
  async submitDiagnostic() { await delay(); return {attemptId: `diagnostic-${Date.now()}`, scores: {foundation: 67, time: 67, discipline: 0, comprehension: 0, memory: 0, practice: 0}, submittedAt: new Date().toISOString()}; },
};
const mockGradingQuestions: GradingQuestion[] = [
  {id: 'subjective-demo-1', rubricId: 'rubric-demo-civil-1', version: 1, title: '民法案例分析：房屋买卖与租赁', subjectId: 'civil', caseMaterial: '甲将房屋出租给乙，租赁期间又将房屋出售给丙。丙要求乙立即搬离，乙主张买卖不破租赁。请结合民法典分析各方权利义务。', subQuestions: [{id: 'civil-1-a', prompt: '分析租赁合同对丙是否继续有效，并说明法律依据。', maxScore: 12}, {id: 'civil-1-b', prompt: '分析乙可主张的救济方式及丙的义务。', maxScore: 8}], totalScore: 20, suggestedMinutes: 45, allowedAnswerTypes: ['text', 'image', 'pdf']},
  {id: 'subjective-demo-2', rubricId: 'rubric-demo-civil-2', version: 1, title: '民法案例分析：合同解除与违约责任', subjectId: 'civil', caseMaterial: '甲乙签订设备买卖合同，乙迟延交付且设备存在质量瑕疵。甲催告后乙仍未修复，甲遂解除合同并主张损失。', subQuestions: [{id: 'civil-2-a', prompt: '分析甲是否有权解除合同。', maxScore: 10}, {id: 'civil-2-b', prompt: '分析甲可主张的违约责任范围。', maxScore: 10}], totalScore: 20, suggestedMinutes: 40, allowedAnswerTypes: ['text', 'image']},
  {id: 'subjective-demo-3', rubricId: 'rubric-demo-criminal-1', version: 1, title: '刑法案例分析：共同犯罪与犯罪中止', subjectId: 'criminal', caseMaterial: '甲邀约乙盗窃，乙进入现场后因害怕主动停止并返还工具，甲独自完成盗窃。请分析甲乙的刑事责任。', subQuestions: [{id: 'criminal-1-a', prompt: '分析甲、乙是否构成共同犯罪及各自责任。', maxScore: 12}, {id: 'criminal-1-b', prompt: '分析乙主动退出行为的法律性质。', maxScore: 8}], totalScore: 20, suggestedMinutes: 45, allowedAnswerTypes: ['text', 'image', 'pdf']},
];
const mockGradingPapers: GradingPaper[] = [
  {id: 'grading-paper-civil', title: '2026 民法主观题专项套卷（一）', subjectId: 'civil', year: '2026', totalScore: 40, questionIds: ['subjective-demo-1', 'subjective-demo-2'], questionCount: 2},
  {id: 'grading-paper-criminal', title: '2026 刑法主观题专项套卷（一）', subjectId: 'criminal', year: '2026', totalScore: 20, questionIds: ['subjective-demo-3'], questionCount: 1},
];
let mockGradingSubmissions: GradingSubmission[] = [
  {id: 'gsub-demo-queued', paperId: 'grading-paper-civil', paperTitle: mockGradingPapers[0].title, questionId: 'subjective-demo-1', questionTitle: mockGradingQuestions[0].title, rubricId: 'rubric-demo-civil-1', questionVersion: 1, status: 'manual_queued', createdAt: '2026-08-30T09:20:00.000Z'},
  {id: 'gsub-demo-published', paperId: 'grading-paper-civil', paperTitle: mockGradingPapers[0].title, questionId: 'subjective-demo-2', questionTitle: mockGradingQuestions[1].title, rubricId: 'rubric-demo-civil-2', questionVersion: 1, status: 'published', score: 16, maxScore: 20, feedback: '论点清晰，法条引用准确。', latestReportId: 'greport-demo-published', createdAt: '2026-08-27T10:00:00.000Z'},
];
const mockGradingReport: GradingReport = {id: 'greport-demo-published', submissionId: 'gsub-demo-published', version: 1, totalScore: 13, maxScore: 20, answers: [{subQuestionId: 'civil-2-a', text: '乙构成根本违约，甲可解除合同。', attachments: []}, {subQuestionId: 'civil-2-b', text: '甲可请求实际损失及可预见的可得利益。', attachments: []}], pointResults: [{pointId: 'civil-2-p1', title: '解除条件', score: 8, maxScore: 8, status: 'hit', comment: '解除条件判断准确'}, {pointId: 'civil-2-p2', title: '赔偿范围', score: 5, maxScore: 7, status: 'partial', comment: '赔偿范围还可展开'}, {pointId: 'civil-2-p3', title: '论证表达', score: 0, maxScore: 5, status: 'missed', comment: '遗漏对减损义务的论证'}], answerAnnotations: [{id: 'annotation-demo-1', subQuestionId: 'civil-2-a', start: 0, end: 7, quote: '乙构成根本违约', type: 'correct', scoreDelta: 0, comment: '结论识别准确'}, {id: 'annotation-demo-score', subQuestionId: 'civil-2-a', start: 8, end: 14, quote: '甲可解除合同', type: 'score', scoreDelta: 1, comment: '解除请求成立，加 1 分'}, {id: 'annotation-demo-2', subQuestionId: 'civil-2-b', start: 0, end: 8, quote: '甲可请求实际损失', type: 'comment', comment: '请求范围表述准确'}, {id: 'annotation-demo-error', subQuestionId: 'civil-2-b', start: 8, end: 18, quote: '及可预见的可得利益。', type: 'error', scoreDelta: -2, comment: '可得利益论证不足，扣 2 分'}], missedPointIds: ['civil-2-p3'], feedback: '论点清晰，法条引用准确。', improvementAdvice: '加强对损失范围和减损义务的论证。', publishedAt: '2026-08-28T12:00:00.000Z'};
export const mockGradingService: GradingService = {
  async list() { await delay(); return mockGradingSubmissions.map(item => ({...item})); },
  async questions() { await delay(); return mockGradingQuestions.map(item => ({...item})); },
  async papers() { await delay(); return mockGradingPapers.map(item => ({...item})); },
  async paper(id) { await delay(); const paper = mockGradingPapers.find(item => item.id === id); return paper ? {...paper, questions: paper.questionIds.map(questionId => mockGradingQuestions.find(item => item.id === questionId)).filter(Boolean) as GradingQuestion[]} : null; },
  async submit(input) { await delay(); const question = mockGradingQuestions.find(item => item.id === input.questionId); const paper = mockGradingPapers.find(item => item.id === input.paperId); const item: GradingSubmission = {id: `gsub-${Date.now()}`, paperId: paper?.id, paperTitle: paper?.title, questionId: input.questionId, questionTitle: question?.title, rubricId: question?.rubricId, questionVersion: question?.version, status: 'ai_failed', aiFailureReason: '演示环境未配置 AI Provider', createdAt: new Date().toISOString()}; mockGradingSubmissions = [item, ...mockGradingSubmissions]; return {...item}; },
  async get(id) { await delay(); return mockGradingSubmissions.find(item => item.id === id) ?? null; },
  async report(id) { await delay(); return id === mockGradingReport.submissionId ? {...mockGradingReport} : null; },
  async retry(id) { await delay(); const item = mockGradingSubmissions.find(entry => entry.id === id); if (!item) throw new Error('批改记录不存在'); item.status = 'manual_queued'; item.aiFailureReason = undefined; return {...item}; },
};
export const mockDeviceService: DeviceService = {async list() { await delay(); return [{id: 'mock-device', platform: 'android', name: '当前 Android 设备', lastSeenAt: new Date().toISOString(), current: true}]; }, async register(input) { await delay(); return input; }, async remove() { await delay(); }};
export const mockLegalService: LegalService = {async search(query) { await delay(); return {items: [], total: 0, query}; }, async listFavorites() { await delay(); return []; }, async addFavorite(documentId) { await delay(); return {id: `legal-favorite-${Date.now()}`, legalDocumentId: documentId, documentVersion: 1, article: documentId, title: '', content: '', createdAt: new Date().toISOString()}; }, async removeFavorite() { await delay(); }, async listAnnouncements() { await delay(); return []; }};

const mockForumPosts: ForumPost[] = [
  {id: 'f1', authorId: 'u-demo', userName: '法考老鸟', category: '经验分享', title: '三战上岸经验分享：客观题从108到213的蜕变之路', body: '分享一下我三年备考的心路历程。先搭建每一科的知识框架，再用真题定位薄弱点，最后阶段只复盘错题和高频法条。希望能帮到还在坚持的同学们。', likes: 342, comments: 2, liked: false, favorited: false, canDelete: false, createdAt: '2026-08-31T08:00:00.000Z', updatedAt: '2026-08-31T08:00:00.000Z'},
  {id: 'f2', authorId: 'u-2', userName: '民法小白', category: '答疑求助', title: '善意取得中「合理价格」如何认定？有没有具体标准？', body: '老师说合理价格不低于市价70%，但这个比例是哪里来的？有没有具体法条或司法解释依据？', likes: 28, comments: 1, liked: false, favorited: false, canDelete: false, createdAt: '2026-08-31T06:00:00.000Z', updatedAt: '2026-08-31T06:00:00.000Z'},
  {id: 'f3', authorId: 'u-3', userName: '刑法爱好者', category: '知识整理', title: '共同犯罪8大考点汇总，附真题解析（2019-2023）', body: '整理了近五年关于共同犯罪的考点，包括主从犯认定、帮助犯、片面共犯和共犯脱离。', likes: 186, comments: 43, liked: false, favorited: true, canDelete: false, createdAt: '2026-08-30T10:00:00.000Z', updatedAt: '2026-08-30T10:00:00.000Z'},
  {id: 'f4', authorId: 'u-4', userName: '诉讼法研究', category: '答疑求助', title: '行政诉讼起诉期限6个月和2年的区别，一直搞不清楚', body: '请问直接起诉是6个月，但经过复议的是多久？两者起算点具体有什么不同？', likes: 54, comments: 22, liked: false, favorited: false, canDelete: false, createdAt: '2026-08-30T08:00:00.000Z', updatedAt: '2026-08-30T08:00:00.000Z'},
  {id: 'f5', authorId: 'u-5', userName: '主观题达人', category: '技巧方法', title: '主观题答题模板分享：合同纠纷类案例万能框架', body: '做了大量主观题后总结的答题框架，按照请求权基础逐层展开，能明显减少遗漏。', likes: 271, comments: 61, liked: true, favorited: false, canDelete: false, createdAt: '2026-08-28T08:00:00.000Z', updatedAt: '2026-08-28T08:00:00.000Z'},
  {id: 'f6', authorId: 'u-6', userName: '行政法控', category: '知识整理', title: '行政许可vs行政审批vs行政确认，三者区别一表搞定', body: '每次做题都被这三个概念绕晕，今天专门整理了适用对象、法律效果和典型例子的对比。', likes: 93, comments: 19, liked: false, favorited: false, canDelete: false, createdAt: '2026-08-27T08:00:00.000Z', updatedAt: '2026-08-27T08:00:00.000Z'},
];
let mockForumComments: ForumComment[] = [
  {id: 'fc1', postId: 'f1', authorId: 'u-7', userName: '备考进行时', body: '知识框架和错题复盘这两点很实用，谢谢分享。', canDelete: false, createdAt: '2026-08-31T09:00:00.000Z'},
  {id: 'fc2', postId: 'f1', authorId: 'u-demo', userName: '法考学习者', body: '想问一下最后一个月每天大概做多少道真题？', canDelete: true, createdAt: '2026-08-31T09:30:00.000Z'},
];
const mockForumReports: ForumReport[] = [];
function mockForumPost(id: string) {
  const post = mockForumPosts.find(item => item.id === id);
  if (!post) throw new Error('帖子不存在或已删除');
  return post;
}
export const mockForumService: ForumService = {
  async list(input) { await delay(); const offset = Number(input?.cursor ?? 0); const limit = input?.limit ?? 20; const filtered = mockForumPosts.filter(item => !input?.category || item.category === input.category).filter(item => input?.scope !== 'mine' || item.canDelete).filter(item => input?.scope !== 'favorites' || item.favorited); return {items: filtered.slice(offset, offset + limit).map(item => ({...item})), ...(offset + limit < filtered.length ? {nextCursor: String(offset + limit)} : {})}; },
  async get(id) { await delay(); return {...mockForumPost(id), comments: mockForumComments.filter(item => item.postId === id).length}; },
  async create(input) { await delay(); const now = new Date().toISOString(); const post: ForumPost = {id: `f-${Date.now()}`, authorId: 'u-demo', userName: mockProfile.name, ...input, likes: 0, comments: 0, liked: false, favorited: false, canDelete: true, createdAt: now, updatedAt: now}; mockForumPosts.unshift(post); return {...post}; },
  async remove(id) { await delay(); const index = mockForumPosts.findIndex(item => item.id === id); if (index < 0 || !mockForumPosts[index].canDelete) throw new Error('只能删除自己发布的帖子'); mockForumPosts.splice(index, 1); mockForumComments = mockForumComments.filter(item => item.postId !== id); },
  async toggleLike(id) { await delay(); const post = mockForumPost(id); post.liked = !post.liked; post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1)); return {...post}; },
  async toggleFavorite(id) { await delay(); const post = mockForumPost(id); post.favorited = !post.favorited; return {...post}; },
  async listComments(postId, input) { await delay(); mockForumPost(postId); const offset = Number(input?.cursor ?? 0); const limit = input?.limit ?? 20; const items = mockForumComments.filter(item => item.postId === postId); return {items: items.slice(offset, offset + limit).map(item => ({...item})), ...(offset + limit < items.length ? {nextCursor: String(offset + limit)} : {})}; },
  async createComment(postId, body) { await delay(); const post = mockForumPost(postId); const comment: ForumComment = {id: `fc-${Date.now()}`, postId, authorId: 'u-demo', userName: mockProfile.name, body: body.trim(), canDelete: true, createdAt: new Date().toISOString()}; mockForumComments.push(comment); post.comments += 1; return {...comment}; },
  async removeComment(id) { await delay(); const comment = mockForumComments.find(item => item.id === id); if (!comment?.canDelete) throw new Error('只能删除自己的评论'); mockForumComments = mockForumComments.filter(item => item.id !== id); const post = mockForumPosts.find(item => item.id === comment.postId); if (post) post.comments = Math.max(0, post.comments - 1); },
  async report(postId, reason) { await delay(); mockForumPost(postId); const normalizedReason = reason.trim(); if (normalizedReason.length < 2 || normalizedReason.length > 200) throw new Error('举报理由需为 2 到 200 个字'); const duplicate = mockForumReports.find(item => item.postId === postId && item.status === 'pending'); if (duplicate) return {...duplicate}; const report: ForumReport = {id: `fr-${Date.now()}`, postId, reason: normalizedReason, status: 'pending', createdAt: new Date().toISOString()}; mockForumReports.unshift(report); return {...report}; },
};

export const mockOrderService: OrderService = {
  async list() {
    await delay();
    return [...createdOrders, ...orders];
  },
  async get(id) {
    await delay();
    return [...createdOrders, ...orders].find(order => order.id === id) ?? null;
  },
  async create(product: Product, options = {}) {
    await delay(280);
    const order: Order = {
      id: `DB${Date.now()}`,
      productId: product.id,
      productName: product.name,
      amount: product.skus?.find(item => item.id === options.skuId)?.price ?? product.price,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
      ...(options.skuId ? {skuId: options.skuId} : {}),
      ...(options.couponCode ? {couponCode: options.couponCode} : {}),
    };
    createdOrders.unshift(order);
    return order;
  },
  async cancel(id) {
    await delay(100);
    const order = [...createdOrders, ...orders].find(item => item.id === id);
    if (!order) throw new Error('订单不存在');
    if (order.status !== 'pending') throw new Error('当前订单状态不可取消');
    order.status = 'cancelled'; order.closedAt = new Date().toISOString();
    return {...order};
  },
  async requestRefund(id, reason) {
    await delay(120);
    const order = [...createdOrders, ...orders].find(item => item.id === id);
    if (!order) throw new Error('订单不存在');
    const existing = mockRefunds.find(item => item.orderId === id && ['requested', 'reviewing', 'completed'].includes(item.status));
    if (existing) return {...existing};
    if (order.status !== 'paid') throw new Error('只有已支付订单可以申请退款');
    const refund: RefundRequest = {id: `refund-${Date.now()}`, orderId: id, reason, amount: order.amount, status: 'requested', createdAt: new Date().toISOString()};
    mockRefunds.unshift(refund); order.status = 'refund_requested';
    return {...refund};
  },
  async listRefunds() { await delay(80); return {items: mockRefunds.map(item => ({...item})), total: mockRefunds.length}; },
  async events(id) {
    await delay(80);
    const order = [...createdOrders, ...orders].find(item => item.id === id);
    if (!order) throw new Error('订单不存在');
    const event: OrderEvent = {id: `event-${id}`, orderId: id, type: order.status === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'created', actor: order.status === 'paid' ? 'provider' : 'user', metadata: {}, createdAt: order.createdAt};
    return {items: [event], total: 1};
  },
};

export const mockPaymentService: PaymentService = {
  async pay() {
    await delay(480);
    return {status: 'mock-paid', transactionId: `MOCK-${Date.now()}`};
  },
};

export const mockAIService: AIService = {
  async streamReply(prompt, onChunk) {
    const reply = `这是本地 Mock 回答：针对“${prompt}”，建议先确认法律关系、请求权基础和构成要件，再结合题干事实逐项论证。正式版本将由后端 AI 网关返回内容。`;
    for (const chunk of reply.match(/.{1,8}/g) ?? []) {
      await delay(45);
      onChunk(chunk);
    }
  },
  async listConversations(input) {
    await delay(80);
    const offset = Number(input?.cursor ?? 0); const limit = input?.limit ?? 20; const items = mockConversations.slice(offset, offset + limit).map(mockConversationSummary);
    return {items, total: mockConversations.length, ...(offset + limit < mockConversations.length ? {nextCursor: String(offset + limit)} : {})};
  },
  async createConversation(title = '新对话', clientRequestId) {
    await delay(80);
    const existingId = clientRequestId ? mockConversationRequestIds.get(clientRequestId) : undefined;
    const existing = existingId ? mockConversations.find(item => item.id === existingId) : undefined;
    if (existing) return mockConversationSummary(existing);
    const now = new Date().toISOString(); const session: AIConversationDetail = {id: `ai-session-${Date.now()}`, title, createdAt: now, updatedAt: now, messageCount: 0, messages: []};
    mockConversations.unshift(session); if (clientRequestId) mockConversationRequestIds.set(clientRequestId, session.id); return mockConversationSummary(session);
  },
  async getConversation(id) { await delay(80); const session = mockConversations.find(item => item.id === id); if (!session) throw new Error('AI 会话不存在'); return {...mockConversationSummary(session), messages: session.messages.map(item => ({...item}))}; },
  async renameConversation(id, title) { await delay(80); const session = mockConversations.find(item => item.id === id); if (!session) throw new Error('AI 会话不存在'); session.title = title; session.updatedAt = new Date().toISOString(); return mockConversationSummary(session); },
  async deleteConversation(id) { await delay(80); const index = mockConversations.findIndex(item => item.id === id); if (index < 0) throw new Error('AI 会话不存在'); mockConversations.splice(index, 1); for (const [key, value] of mockConversationRequestIds) if (value === id) mockConversationRequestIds.delete(key); return {deleted: true, id}; },
  async listMessages(id) { await delay(80); const session = mockConversations.find(item => item.id === id); if (!session) throw new Error('AI 会话不存在'); return {items: session.messages.map(item => ({...item})), total: session.messages.length}; },
  async sendMessage(id, content, clientRequestId) {
    await delay(150); const session = mockConversations.find(item => item.id === id); if (!session) throw new Error('AI 会话不存在');
    const previous = clientRequestId ? session.messages.find(item => item.clientRequestId === `${clientRequestId}:assistant`) : undefined;
    if (previous) { const userMessage = session.messages.find(item => item.clientRequestId === clientRequestId && item.role === 'user'); if (!userMessage) throw new Error('AI 消息幂等记录不完整'); return {session: mockConversationSummary(session), userMessage: {...userMessage}, assistantMessage: {...previous}}; }
    const now = new Date().toISOString(); const userMessage: AIMessage = {id: `ai-message-${Date.now()}-u`, sessionId: id, role: 'user', content, ...(clientRequestId ? {clientRequestId} : {}), createdAt: now}; const assistantMessage: AIMessage = {id: `ai-message-${Date.now()}-a`, sessionId: id, role: 'assistant', content: `本地 Mock 回答：${content}`, ...(clientRequestId ? {clientRequestId: `${clientRequestId}:assistant`} : {}), createdAt: new Date(Date.now() + 1).toISOString()}; session.messages.push(userMessage, assistantMessage); session.messageCount = session.messages.length; session.updatedAt = assistantMessage.createdAt;
    return {session: mockConversationSummary(session), userMessage, assistantMessage};
  },
};

export const mockMediaService: MediaService = {
  async prepare(_courseId, kind) {
    await delay();
    return {
      available: false,
      reason: `${kind} 当前为界面与状态机演示，尚未配置真实媒体源。`,
    };
  },
};

export const mockNotificationService: NotificationService = {
  async list() {
    await delay();
    return notifications;
  },
  async listPage(input) {
    await delay(80);
    const filtered = input?.unreadOnly ? notifications.filter(item => !item.read) : notifications;
    const offset = Number(input?.cursor ?? ((input?.page ? input.page - 1 : 0) * (input?.pageSize ?? 20))); const limit = input?.pageSize ?? 20;
    return {items: filtered.slice(offset, offset + limit).map(item => ({...item})), total: filtered.length, unreadCount: notifications.filter(item => !item.read).length, ...(offset + limit < filtered.length ? {nextCursor: String(offset + limit)} : {})};
  },
  async requestPermission() {
    await delay();
    return {granted: false, reason: 'Mock 模式不会请求系统通知权限。'};
  },
  async markRead() {
    await delay(80);
  },
  async readAll() { await delay(80); notifications.forEach(item => { item.read = true; }); return {read: notifications.length, readAt: new Date().toISOString()}; },
  async getAnnouncement(id) { await delay(80); const item = notifications.find(entry => entry.id === id); if (!item) throw new Error('公告不存在'); return {id: item.id, title: item.title, body: item.body, status: 'published' as const, createdAt: new Date().toISOString(), deepLink: `/announcements/${id}`, read: item.read, closed: false}; },
  async markAnnouncementRead(id) { await delay(80); const item = notifications.find(entry => entry.id === id); if (!item) throw new Error('公告不存在'); item.read = true; return {id, read: true as const}; },
  async closeAnnouncement(id) { await delay(80); const item = notifications.find(entry => entry.id === id); if (!item) throw new Error('公告不存在'); item.read = true; return {id, read: true as const, closed: true as const}; },
};

export const mockAttachmentService: AttachmentService = {
  async preflight(input) {
    await delay(80); const now = new Date().toISOString(); const upload = {id: `upload-${Date.now()}`, filename: input.filename, contentType: input.contentType, sizeBytes: input.sizeBytes, ...(input.sha256 ? {sha256: input.sha256} : {}), status: 'pending' as const, uploadToken: `upload-token-${Date.now()}`, uploadUrl: `local://debao/uploads/${Date.now()}`, method: 'PUT' as const, headers: {}, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(), createdAt: now}; mockAttachments.unshift(upload); return {...upload};
  },
  async get(id) { await delay(60); const upload = mockAttachments.find(item => item.id === id); if (!upload) throw new Error('附件不存在'); return {...upload}; },
  async complete(id, uploadToken, sha256) { await delay(80); const upload = mockAttachments.find(item => item.id === id); if (!upload) throw new Error('附件不存在'); if (upload.uploadToken !== uploadToken) throw new Error('附件凭证无效'); if (sha256 && upload.sha256 && sha256 !== upload.sha256) throw new Error('附件校验值不一致'); upload.status = 'completed'; upload.completedAt = new Date().toISOString(); return {...upload}; },
  async remove(id) { await delay(60); const index = mockAttachments.findIndex(item => item.id === id); if (index < 0) throw new Error('附件不存在'); mockAttachments.splice(index, 1); return {deleted: true, id}; },
};
