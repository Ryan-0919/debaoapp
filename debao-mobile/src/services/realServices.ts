import type {AppNotification, Course, Order, Product, Subject, UserProfile} from '@/types/domain';
import {apiClient} from './apiClient';
import type {AIService, AuthService, CourseService, DeviceService, GradingService, HomeService, LegalService, LearningService, MediaService, NotificationService, OrderService, PaymentService, ProductService, QuestionService} from './contracts';

const token = 'demo-token';

export const apiAuthService: AuthService = {
  getProfile: () => apiClient.request<UserProfile>('/me', {token}),
  updateProfile: profile => apiClient.request<UserProfile>('/me', {method: 'PATCH', body: {name: profile.name, examYear: profile.examYear}, token}),
  logout: async () => { await apiClient.request('/auth/logout', {method: 'POST', token}); },
};

export const apiQuestionService: QuestionService = {
  listSubjects: () => apiClient.request<Subject[]>('/question-subjects', {token}),
  saveDraft: async submission => { await apiClient.request(`/question-drafts/${submission.questionId}`, {method: 'PUT', body: submission, token}); },
  submit: submission => apiClient.request<{submissionId: string}>('/question-submissions', {method: 'POST', body: submission, token}),
};

export const apiCourseService: CourseService = {
  list: () => apiClient.request<Course[]>('/courses', {token}),
  get: id => apiClient.request<Course | null>(`/courses/${id}`, {token}),
};

export const apiProductService: ProductService = {
  list: () => apiClient.request<Product[]>('/products', {token}),
  get: id => apiClient.request<Product | null>(`/products/${id}`, {token}),
};

export const apiHomeService: HomeService = {get: () => apiClient.request('/home', {token})};
export const apiLearningService: LearningService = {
  plans: () => apiClient.request('/learning/plans', {token}),
  createPlan: input => apiClient.request('/learning/plans', {method: 'POST', body: input, token}),
  tasks: () => apiClient.request('/learning/tasks', {token}),
  completeTask: id => apiClient.request(`/learning/tasks/${id}/complete`, {method: 'POST', token}),
  report: period => apiClient.request(`/learning/report${period ? `?period=${period}` : ''}`, {token}),
};
export const apiGradingService: GradingService = {
  list: () => apiClient.request('/grading/submissions', {token}),
  submit: input => apiClient.request('/grading/submissions', {method: 'POST', body: input, token}),
  get: id => apiClient.request(`/grading/submissions/${id}`, {token}),
  retry: id => apiClient.request(`/grading/submissions/${id}/retry`, {method: 'POST', token}),
};
export const apiDeviceService: DeviceService = {
  list: () => apiClient.request('/devices', {token}),
  register: input => apiClient.request('/devices', {method: 'POST', body: input, token}),
  remove: async id => { await apiClient.request(`/devices/${id}`, {method: 'DELETE', token}); },
};
export const apiLegalService: LegalService = {search: query => apiClient.request(`/law/search?q=${encodeURIComponent(query)}`, {token})};

export const apiOrderService: OrderService = {
  list: () => apiClient.request<Order[]>('/orders', {token}),
  get: id => apiClient.request<Order | null>(`/orders/${id}`, {token}),
  create: product => apiClient.request<Order>('/orders', {method: 'POST', body: {productId: product.id, clientRequestId: `mobile-${product.id}-${Date.now()}`}, token}),
};

export const apiPaymentService: PaymentService = {
  pay: order => apiClient.request<{status: 'paid' | 'pending'; transactionId: string}>(`/orders/${order.id}/pay`, {method: 'POST', token}),
};

export const apiAIService: AIService = {
  async streamReply(prompt, onChunk) {
    const result = await apiClient.request<{reply: string}>('/ai/reply', {method: 'POST', body: {prompt}, token});
    for (const chunk of result.reply.match(/.{1,8}/g) ?? []) onChunk(chunk);
  },
};

export const apiMediaService: MediaService = {
  prepare: (courseId, kind) => apiClient.request(`/media/prepare`, {method: 'POST', body: {courseId, kind}, token}),
};

export const apiNotificationService: NotificationService = {
  list: () => apiClient.request<AppNotification[]>('/notifications', {token}),
  requestPermission: () => apiClient.request<{granted: false; reason: string}>('/notifications/permission', {method: 'POST', token}),
};
