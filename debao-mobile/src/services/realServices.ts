import type {AppNotification, Course, Order, Product, Subject, UserProfile} from '@/types/domain';
import {environment} from '@/config/environment';
import {apiClient} from './apiClient';
import type {AIService, AuthService, CourseService, DeviceService, GradingService, HomeService, LegalService, LearningService, MediaService, NotificationService, OrderService, PaymentService, ProductService, QuestionService} from './contracts';

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
}

type ApiRequestOptions = {method?: string; body?: unknown; token?: string};
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
  const anonymous = path === '/auth/login' || path === '/auth/refresh' || path === '/auth/send-code';
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
  async login(phone, code, deviceId) {
    const session = await request<{accessToken: string; refreshToken: string; expiresIn: number; profile?: UserProfile}>('/auth/login', {method: 'POST', body: {phone, code, deviceId}});
    await saveSession(session); return session;
  },
  async refresh(refreshToken) {
    const session = await request<{accessToken: string; refreshToken: string; expiresIn: number}>('/auth/refresh', {method: 'POST', body: {refreshToken}});
    await saveSession(session); return session;
  },
  getProfile: () => request<UserProfile>('/me', {token}),
  updateProfile: profile => request<UserProfile>('/me', {method: 'PATCH', body: {name: profile.name, examYear: profile.examYear}, token}),
  logout: async () => { await request('/auth/logout', {method: 'POST', token}); token = 'demo-token'; refreshTokenValue = undefined; await (await getStorage()).removeItem(SESSION_KEY); },
};

export async function refreshStoredSession() {
  if (!refreshTokenValue) return false;
  try { await apiAuthService.refresh?.(refreshTokenValue); return true; } catch { return false; }
}

export const apiQuestionService: QuestionService = {
  listSubjects: () => request<Subject[]>('/question-subjects', {token}),
  saveDraft: async submission => { await request(`/question-drafts/${submission.questionId}`, {method: 'PUT', body: submission, token}); },
  submit: submission => request<{submissionId: string}>('/question-submissions', {method: 'POST', body: submission, token}),
  listRecords: () => request('/question-records', {token}),
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
  report: period => request(`/learning/report${period ? `?period=${period}` : ''}`, {token}),
};
export const apiGradingService: GradingService = {
  list: () => request('/grading/submissions', {token}),
  submit: input => request('/grading/submissions', {method: 'POST', body: input, token}),
  get: id => request(`/grading/submissions/${id}`, {token}),
  retry: id => request(`/grading/submissions/${id}/retry`, {method: 'POST', token}),
};
export const apiDeviceService: DeviceService = {
  list: () => request('/devices', {token}),
  register: input => request('/devices', {method: 'POST', body: input, token}),
  remove: async id => { await request(`/devices/${id}`, {method: 'DELETE', token}); },
};
export const apiLegalService: LegalService = {search: query => request(`/law/search?q=${encodeURIComponent(query)}`, {token})};

export const apiOrderService: OrderService = {
  list: () => request<Order[]>('/orders', {token}),
  get: id => request<Order | null>(`/orders/${id}`, {token}),
  create: product => request<Order>('/orders', {method: 'POST', body: {productId: product.id, clientRequestId: `mobile-${product.id}-${Date.now()}`}, token}),
};

export const apiPaymentService: PaymentService = {
  pay: order => request<{status: 'paid' | 'pending'; transactionId: string}>(`/orders/${order.id}/pay`, {method: 'POST', token}),
};

export const apiAIService: AIService = {
  async streamReply(prompt, onChunk) {
    const result = await request<{reply: string}>('/ai/reply', {method: 'POST', body: {prompt}, token});
    for (const chunk of result.reply.match(/.{1,8}/g) ?? []) onChunk(chunk);
  },
};

export const apiMediaService: MediaService = {
  prepare: (courseId, kind) => request(`/media/prepare`, {method: 'POST', body: {courseId, kind}, token}),
};

export const apiNotificationService: NotificationService = {
  list: () => request<AppNotification[]>('/notifications', {token}),
  requestPermission: () => request<{granted: false; reason: string}>('/notifications/permission', {method: 'POST', token}),
};
