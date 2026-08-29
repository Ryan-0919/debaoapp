export * from './contracts';
import {environment} from '@/config/environment';
import {
  mockAIService,
  mockAuthService,
  mockCourseService,
  mockMediaService,
  mockNotificationService,
  mockOrderService,
  mockPaymentService,
  mockQuestionService,
} from './mockServices';
import {
  apiAIService,
  apiAuthService,
  apiCourseService,
  apiMediaService,
  apiNotificationService,
  apiOrderService,
  apiPaymentService,
  apiQuestionService,
} from './realServices';

export const aiService = environment.useMocks ? mockAIService : apiAIService;
export const authService = environment.useMocks ? mockAuthService : apiAuthService;
export const courseService = environment.useMocks ? mockCourseService : apiCourseService;
export const mediaService = environment.useMocks ? mockMediaService : apiMediaService;
export const notificationService = environment.useMocks ? mockNotificationService : apiNotificationService;
export const orderService = environment.useMocks ? mockOrderService : apiOrderService;
export const paymentService = environment.useMocks ? mockPaymentService : apiPaymentService;
export const questionService = environment.useMocks ? mockQuestionService : apiQuestionService;
