import type {AppNotification, Course, Order, Product, Subject, UserProfile} from '@/types/domain';
import {environment} from '@/config/environment';
import {apiClient} from './apiClient';
import type {AIConversation, AIConversationDetail, AIMessage, AIService, AppLegalDocument, AttachmentService, AuthService, CourseService, DeviceService, ForumService, GradingService, HomeService, LegalService, LearningActivity, LearningActivityPage, LearningDiagnosticResult, LearningDiagnosticState, LearningService, MediaService, NotificationService, OrderEvent, OrderService, PaymentService, ProductService, QuestionService, ObjectiveReport, ObjectiveSession, QuestionSubmissionReport, LegalFavorite, RefundRequest, LearningCard, LearningSubjectiveQuestion, LearningTask} from './contracts';
import type {AuthSession, WechatLoginResult} from './contracts';
import {setAuthStatus} from '@/auth/authState';

const SESSION_KEY = 'debao.auth.session';
let token = 'demo-token';
let refreshTokenValue: string | undefined;
type StorageLike = {getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem(key: string): Promise<void>};
let storagePromise: Promise<StorageLike> | undefined;
function getStorage() {
  storagePromise ??= import('@react-native-async-storage/async-storage').then(module => module.default as unknown as StorageLike);
  return storagePromise;
}
export const sessionReady: Promise<void> = environment.useMocks ? Promise.resolve() : getStorage().then(storage => storage.getItem(SESSION_KEY)).then(value => {
    if (!value) return;
    try { const session = JSON.parse(value) as {accessToken?: string; refreshToken?: string}; if (session.accessToken) token = session.accessToken; if (session.refreshToken) refreshTokenValue = session.refreshToken; } catch { /* corrupted local session is ignored */ }
  }).catch(() => undefined);

async function saveSession(session: {accessToken: string; refreshToken: string}) {
  token = session.accessToken; refreshTokenValue = session.refreshToken;
  await (await getStorage()).setItem(SESSION_KEY, JSON.stringify(session));
  setAuthStatus('authenticated');
}

type ApiRequestOptions = {method?: string; body?: unknown; token?: string; headers?: Record<string, string>};
let refreshInFlight: Promise<boolean> | undefined;
async function refreshAccessToken() {
  if (!refreshTokenValue) return false;
  try {
    const session = await apiClient.request<{accessToken: string; refreshToken: string; expiresIn: number}>('/auth/refresh', {method: 'POST', body: {refreshToken: refreshTokenValue}});
    await saveSession(session); return true;
  } catch { return false; }
}
async function request<T>(path: string, options: ApiRequestOptions = {}, retry = true): Promise<T> {
  await sessionReady;
  const anonymous = path === '/auth/login' || path === '/auth/refresh' || path === '/auth/send-code' || path === '/auth/providers' || path === '/auth/wechat' || path === '/auth/one-click' || path === '/auth/wechat/bind-phone' || path.startsWith('/legal-documents/');
  const authenticatedOptions = anonymous ? options : {...options, token};
  try {
    return await apiClient.request<T>(path, authenticatedOptions);
  } catch (error) {
    if (retry && path !== '/auth/login' && path !== '/auth/refresh' && error instanceof Error && 'status' in error && (error as {status?: number}).status === 401 && refreshTokenValue) {
      refreshInFlight ??= refreshAccessToken().finally(() => { refreshInFlight = undefined; });
      if (await refreshInFlight) return request<T>(path, {...authenticatedOptions, token}, false);
    }
    throw error;
  }
}

export const apiAuthService: AuthService = {
  providers: () => request('/auth/providers'),
  sendCode: (phone, purpose = 'login', deviceId) => request('/auth/send-code', {method: 'POST', body: {phone, purpose, deviceId}}),
  async login(phone, code, deviceId) {
    const session = await request<{accessToken: string; refreshToken: string; expiresIn: number; profile?: UserProfile}>('/auth/login', {method: 'POST', body: {phone, code, deviceId}});
    await saveSession(session); return session;
  },
  async oneClickLogin(providerToken, deviceId, bindingToken) {
    const session = await request<AuthSession>('/auth/one-click', {method: 'POST', body: {providerToken, deviceId, bindingToken}});
    await saveSession(session); return session;
  },
  async wechatLogin(code, deviceId) {
    const result = await request<WechatLoginResult>('/auth/wechat', {method: 'POST', body: {code, deviceId}});
    if (result.status === 'authenticated') await saveSession(result.session);
    return result;
  },
  async bindWechatPhone(bindingToken, phone, code, deviceId) {
    const session = await request<AuthSession>('/auth/wechat/bind-phone', {method: 'POST', body: {bindingToken, phone, code, deviceId}});
    await saveSession(session); return session;
  },
  async refresh(refreshToken) {
    const session = await request<{accessToken: string; refreshToken: string; expiresIn: number}>('/auth/refresh', {method: 'POST', body: {refreshToken}});
    await saveSession(session); return session;
  },
  getProfile: () => request<UserProfile>('/me', {token}),
  updateProfile: profile => request<UserProfile>('/me', {method: 'PATCH', body: {name: profile.name, examYear: profile.examYear, avatarColor: profile.avatarColor, avatarUrl: profile.avatarUrl}, token}),
  identities: () => request('/me/identities', {token}),
  sendIdentityLinkCode: () => request('/account/identity/link-code', {method: 'POST', token}),
  bindWechatToCurrent: (code, smsCode) => request('/me/identities/wechat', {method: 'POST', body: {code, smsCode}, token}),
  sendIdentityUnlinkCode: () => request('/account/identity/code', {method: 'POST', token}),
  unbindWechat: code => request('/me/identities/wechat', {method: 'DELETE', body: {code}, token}),
  sendPhoneChangeCode: (stage, phone) => request('/account/phone/code', {method: 'POST', body: {stage, phone}, token}),
  phoneChange: (newPhone, oldCode, newCode) => request<UserProfile>('/account/phone/change', {method: 'POST', body: {newPhone, oldCode, newCode}, token}),
  deletionStatus: () => request('/account/deletion', {token}),
  sendDeletionCode: () => request('/account/deletion/code', {method: 'POST', token}),
  requestDeletion: code => request('/account/deletion', {method: 'POST', body: {code}, token}),
  cancelDeletion: () => request('/account/deletion/cancel', {method: 'POST', token}),
  logout: async () => { try { await request('/auth/logout', {method: 'POST', token}); } finally { token = 'demo-token'; refreshTokenValue = undefined; await (await getStorage()).removeItem(SESSION_KEY); setAuthStatus('anonymous'); } },
};

export async function refreshStoredSession() {
  if (!refreshTokenValue) return false;
  try { await apiAuthService.refresh?.(refreshTokenValue); return true; } catch { return false; }
}

export async function initializeStoredSession() {
  if (environment.useMocks) { setAuthStatus('authenticated'); return; }
  await sessionReady;
  if (!refreshTokenValue) { setAuthStatus('anonymous'); return; }
  if (await refreshStoredSession()) return;
  token = 'demo-token'; refreshTokenValue = undefined;
  await (await getStorage()).removeItem(SESSION_KEY).catch(() => undefined);
  setAuthStatus('anonymous');
}

export const apiQuestionService: QuestionService = {
  listSubjects: () => request<Subject[]>('/question-subjects', {token}),
  listQuestions: subjectId => request(`/questions?pageSize=50${subjectId ? `&subjectId=${encodeURIComponent(subjectId)}` : ''}`, {token}),
  getQuestion: id => request(`/questions/${id}`, {token}),
  createSession: input => request<ObjectiveSession>('/question-sessions', {method: 'POST', body: input, token, headers: input.idempotencyKey ? {'Idempotency-Key': input.idempotencyKey} : undefined}),
  getSession: id => request<ObjectiveSession>(`/question-sessions/${encodeURIComponent(id)}`, {token}),
  listSessions: status => request<{items: ObjectiveSession[]; total: number}>(`/question-sessions${status ? `?status=${encodeURIComponent(status)}` : ''}`, {token}),
  saveSessionAnswer: (sessionId, questionId, answers) => request(`/question-sessions/${encodeURIComponent(sessionId)}/answers/${encodeURIComponent(questionId)}`, {method: 'PUT', body: {questionId, answers}, token}),
  submitSession: (sessionId, idempotencyKey) => request<ObjectiveReport>(`/question-sessions/${encodeURIComponent(sessionId)}/submit`, {method: 'POST', body: {idempotencyKey}, token, headers: {'Idempotency-Key': idempotencyKey}}),
  getSessionReport: sessionId => request<ObjectiveReport>(`/question-sessions/${encodeURIComponent(sessionId)}/report`, {token}),
  saveDraft: async submission => { await request(`/question-drafts/${submission.questionId}`, {method: 'PUT', body: submission, token}); },
  submit: submission => request<{submissionId: string}>('/question-submissions', {method: 'POST', body: submission, token}),
  listRecords: () => request('/question-records', {token}),
  getSubmissionReport: id => request<QuestionSubmissionReport>(`/question-submissions/${encodeURIComponent(id)}/report`, {token}),
  getRecordReport: id => request<QuestionSubmissionReport>(`/question-submissions/${encodeURIComponent(id)}/report`, {token}),
  listMistakes: () => request('/mistakes', {token}),
  resolveMistake: async id => { await request(`/mistakes/${id}`, {method: 'DELETE', token}); },
  listFavorites: () => request('/favorites', {token}),
  addFavorite: questionId => request('/favorites', {method: 'POST', body: {questionId}, token}),
  removeFavorite: async id => { await request(`/favorites/${id}`, {method: 'DELETE', token}); },
};

export const apiCourseService: CourseService = {
  list: () => request<Course[]>('/courses', {token}),
  get: id => request<Course | null>(`/courses/${id}`, {token}),
  entitlement: id => request(`/courses/${id}/entitlement`, {token}),
  updateProgress: (id, progress) => request(`/courses/${id}/progress`, {method: 'POST', body: {progress}, token}),
};

export const apiProductService: ProductService = {
  list: () => request<Product[]>('/products', {token}),
  get: id => request<Product | null>(`/products/${id}`, {token}),
};

export const apiHomeService: HomeService = {get: () => request('/home', {token})};
export const apiLearningService: LearningService = {
  plans: () => request('/learning/plans', {token}),
  createPlan: input => request('/learning/plans', {method: 'POST', body: input, token}),
  tasks: () => request('/learning/tasks', {token}),
  completeTask: id => request(`/learning/tasks/${id}/complete`, {method: 'POST', token}),
  card: id => request<LearningCard | null>(`/learning/cards/${encodeURIComponent(id)}`, {token}),
  subjectiveQuestion: id => request<LearningSubjectiveQuestion | null>(`/learning/questions/subjective/${encodeURIComponent(id)}`, {token}),
  submitSubjectiveTask: (id, answers) => request<LearningTask>(`/learning/tasks/${encodeURIComponent(id)}/subjective-submit`, {method: 'POST', body: {answers}, token}),
  pausePlan: (id, days, reason) => request(`/learning/plans/${id}/pause`, {method: 'POST', body: {days, reason}, token}),
  resumePlan: (id, reason) => request(`/learning/plans/${id}/resume`, {method: 'POST', body: {reason}, token}),
  report: period => request(`/learning/report${period ? `?period=${period}` : ''}`, {token}),
  recordActivity: input => request<LearningActivity>('/learning/activities', {method: 'POST', body: input, token, headers: input.idempotencyKey ? {'Idempotency-Key': input.idempotencyKey} : undefined}),
  activities: input => {
    const search = new URLSearchParams();
    if (input?.period) search.set('period', input.period);
    if (input?.kind) search.set('kind', input.kind);
    if (input?.cursor) search.set('cursor', input.cursor);
    if (input?.limit) search.set('limit', String(input.limit));
    const query = search.toString();
    return request<LearningActivityPage>(`/learning/activities${query ? `?${query}` : ''}`, {token});
  },
  diagnostic: () => request<LearningDiagnosticState>('/learning/diagnostic', {token}),
  submitDiagnostic: input => request<LearningDiagnosticResult>('/learning/diagnostic/submit', {method: 'POST', body: input, token}),
};
export const apiGradingService: GradingService = {
  list: () => request('/grading/submissions', {token}),
  questions: async () => { const result = await request<{items: import('./contracts').GradingQuestion[]}>('/grading/questions', {token}); return result.items; },
  papers: async () => { const result = await request<{items: import('./contracts').GradingPaper[]}>('/grading/papers', {token}); return result.items; },
  paper: id => request<import('./contracts').GradingPaper>(`/grading/papers/${encodeURIComponent(id)}`, {token}),
  submit: input => request('/grading/submissions', {method: 'POST', body: input, token, headers: input.idempotencyKey ? {'Idempotency-Key': input.idempotencyKey} : undefined}),
  get: id => request(`/grading/submissions/${id}`, {token}),
  report: id => request(`/grading/submissions/${id}/report`, {token}),
  retry: id => request(`/grading/submissions/${id}/retry`, {method: 'POST', token}),
};
export const apiDeviceService: DeviceService = {
  list: () => request('/devices', {token}),
  register: input => request('/devices', {method: 'POST', body: input, token}),
  remove: async id => { await request(`/devices/${id}`, {method: 'DELETE', token}); },
};
export const apiLegalService: LegalService = {
  search: query => request(`/law/search?q=${encodeURIComponent(query)}`, {token}),
  listFavorites: () => request<LegalFavorite[]>('/legal-favorites', {token}),
  addFavorite: documentId => request<LegalFavorite>('/legal-favorites', {method: 'POST', body: {documentId}, token}),
  removeFavorite: async id => { await request(`/legal-favorites/${encodeURIComponent(id)}`, {method: 'DELETE', token}); },
  getDocument: key => request<AppLegalDocument>(`/legal-documents/${encodeURIComponent(key)}`),
  listAnnouncements: () => request('/announcements', {token}),
};

export const apiForumService: ForumService = {
  list: input => {
    const search = new URLSearchParams();
    if (input?.category) search.set('category', input.category);
    if (input?.scope) search.set('scope', input.scope);
    if (input?.cursor) search.set('cursor', input.cursor);
    if (input?.limit) search.set('limit', String(input.limit));
    const query = search.toString();
    return request(`/forum/posts${query ? `?${query}` : ''}`, {token});
  },
  get: id => request(`/forum/posts/${encodeURIComponent(id)}`, {token}),
  create: input => request('/forum/posts', {method: 'POST', body: input, token}),
  remove: async id => { await request(`/forum/posts/${encodeURIComponent(id)}`, {method: 'DELETE', token}); },
  toggleLike: id => request(`/forum/posts/${encodeURIComponent(id)}/like`, {method: 'POST', token}),
  toggleFavorite: id => request(`/forum/posts/${encodeURIComponent(id)}/favorite`, {method: 'POST', token}),
  listComments: (postId, input) => {
    const search = new URLSearchParams();
    if (input?.cursor) search.set('cursor', input.cursor);
    if (input?.limit) search.set('limit', String(input.limit));
    const query = search.toString();
    return request(`/forum/posts/${encodeURIComponent(postId)}/comments${query ? `?${query}` : ''}`, {token});
  },
  createComment: (postId, commentBody) => request(`/forum/posts/${encodeURIComponent(postId)}/comments`, {method: 'POST', body: {body: commentBody}, token}),
  removeComment: async id => { await request(`/forum/comments/${encodeURIComponent(id)}`, {method: 'DELETE', token}); },
  report: (postId, reason) => request(`/forum/posts/${encodeURIComponent(postId)}/report`, {method: 'POST', body: {reason: reason.trim()}, token}),
};

export const apiOrderService: OrderService = {
  list: () => request<Order[]>('/orders', {token}),
  get: id => request<Order | null>(`/orders/${id}`, {token}),
  create: (product, options = {}) => {
    const clientRequestId = options.clientRequestId ?? `mobile-${product.id}-${Date.now()}`;
    return request<Order>('/orders', {method: 'POST', body: {productId: product.id, clientRequestId, ...(options.skuId ? {skuId: options.skuId} : {}), ...(options.couponCode ? {couponCode: options.couponCode} : {})}, token, headers: {'Idempotency-Key': clientRequestId}});
  },
  cancel: id => request<Order>(`/orders/${encodeURIComponent(id)}/cancel`, {method: 'POST', token}),
  requestRefund: (id, reason) => request<RefundRequest>(`/orders/${encodeURIComponent(id)}/refund`, {method: 'POST', body: {reason}, token}),
  listRefunds: () => request<{items: RefundRequest[]; total: number}>('/refunds', {token}),
  events: id => request<{items: OrderEvent[]; total: number}>(`/orders/${encodeURIComponent(id)}/events`, {token}),
};

export const apiPaymentService: PaymentService = {
  pay: order => request<{status: 'paid' | 'pending'; transactionId: string}>(`/orders/${order.id}/pay`, {method: 'POST', token}),
};

export const apiAIService: AIService = {
  async streamReply(prompt, onChunk) {
    const result = await request<{reply: string}>('/ai/reply', {method: 'POST', body: {prompt}, token});
    for (const chunk of result.reply.match(/.{1,8}/g) ?? []) onChunk(chunk);
  },
  listConversations: input => {
    const search = new URLSearchParams();
    if (input?.cursor) search.set('cursor', input.cursor);
    if (input?.limit) search.set('limit', String(input.limit));
    const query = search.toString();
    return request<{items: AIConversation[]; total: number; nextCursor?: string}>(`/ai/conversations${query ? `?${query}` : ''}`, {token});
  },
  createConversation: (title, clientRequestId) => request<AIConversation>('/ai/conversations', {method: 'POST', body: { ...(title ? {title} : {}), ...(clientRequestId ? {clientRequestId} : {})}, token, headers: clientRequestId ? {'Idempotency-Key': clientRequestId} : undefined}),
  getConversation: id => request<AIConversationDetail>(`/ai/conversations/${encodeURIComponent(id)}`, {token}),
  renameConversation: (id, title) => request<AIConversation>(`/ai/conversations/${encodeURIComponent(id)}`, {method: 'PATCH', body: {title}, token}),
  deleteConversation: id => request<{deleted: boolean; id: string}>(`/ai/conversations/${encodeURIComponent(id)}`, {method: 'DELETE', token}),
  listMessages: id => request<{items: AIMessage[]; total: number}>(`/ai/conversations/${encodeURIComponent(id)}/messages`, {token}),
  sendMessage: (id, content, clientRequestId) => request<{session: AIConversation; userMessage: AIMessage; assistantMessage: AIMessage}>(`/ai/conversations/${encodeURIComponent(id)}/messages`, {method: 'POST', body: {content, ...(clientRequestId ? {clientRequestId} : {})}, token, headers: clientRequestId ? {'Idempotency-Key': clientRequestId} : undefined}),
};

export const apiMediaService: MediaService = {
  prepare: (courseId, kind) => request(`/media/prepare`, {method: 'POST', body: {courseId, kind}, token}),
};

export const apiNotificationService: NotificationService = {
  list: () => request<AppNotification[]>('/notifications', {token}),
  listPage: input => {
    const search = new URLSearchParams();
    if (input?.cursor) search.set('cursor', input.cursor);
    if (input?.page) search.set('page', String(input.page));
    if (input?.pageSize) search.set('pageSize', String(input.pageSize));
    if (input?.unreadOnly !== undefined) search.set('unreadOnly', String(input.unreadOnly));
    const query = search.toString();
    return request<{items: AppNotification[]; total: number; unreadCount: number; nextCursor?: string}>(`/notifications${query ? `?${query}` : ''}`, {token});
  },
  markRead: async id => { await request(`/notifications/${encodeURIComponent(id)}/read`, {method: 'POST', token}); },
  readAll: () => request<{read: number; readAt: string}>('/notifications/read-all', {method: 'POST', token}),
  getAnnouncement: id => request(`/announcements/${encodeURIComponent(id)}`, {token}),
  markAnnouncementRead: id => request(`/announcements/${encodeURIComponent(id)}/read`, {method: 'POST', token}),
  closeAnnouncement: id => request(`/announcements/${encodeURIComponent(id)}/close`, {method: 'POST', token}),
  requestPermission: () => request<{granted: false; reason: string}>('/notifications/permission', {method: 'POST', token}),
};

export const apiAttachmentService: AttachmentService = {
  preflight: input => request('/attachments/preflight', {method: 'POST', body: input, token}),
  get: id => request(`/attachments/${encodeURIComponent(id)}`, {token}),
  complete: (id, uploadToken, sha256) => request(`/attachments/${encodeURIComponent(id)}/complete`, {method: 'POST', body: {uploadToken, ...(sha256 ? {sha256} : {})}, token, headers: {'x-upload-token': uploadToken}}),
  remove: id => request(`/attachments/${encodeURIComponent(id)}`, {method: 'DELETE', token}),
};
