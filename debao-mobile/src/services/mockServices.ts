import {courses, notifications, orders, subjects} from '@/data/mock';
import type {Order, Product, UserProfile} from '@/types/domain';
import type {
  AIService,
  AuthService,
  CourseService,
  MediaService,
  NotificationService,
  OrderService,
  PaymentService,
  QuestionService,
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

export const mockAuthService: AuthService = {
  async getProfile() {
    await delay();
    return {...mockProfile};
  },
  async updateProfile(profile) {
    await delay();
    mockProfile = {...profile};
    return {...mockProfile};
  },
  async logout() {
    await delay(120);
  },
};

export const mockQuestionService: QuestionService = {
  async listSubjects() {
    await delay();
    return subjects;
  },
  async saveDraft() {
    await delay(140);
  },
  async submit() {
    await delay(350);
    return {submissionId: `SUB-${Date.now()}`};
  },
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
  async create(product: Product) {
    await delay(280);
    const order: Order = {
      id: `DB${Date.now()}`,
      productName: product.name,
      amount: product.price,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    createdOrders.unshift(order);
    return order;
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
  async requestPermission() {
    await delay();
    return {granted: false, reason: 'Mock 模式不会请求系统通知权限。'};
  },
};
