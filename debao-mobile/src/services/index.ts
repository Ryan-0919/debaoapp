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
  mockProductService,
  mockHomeService,
  mockLearningService,
  mockGradingService,
  mockDeviceService,
  mockLegalService,
  mockForumService,
  mockQuestionService,
  mockAttachmentService,
} from './mockServices';
import {
  apiAIService,
  apiAuthService,
  apiCourseService,
  apiMediaService,
  apiNotificationService,
  apiOrderService,
  apiPaymentService,
  apiProductService,
  apiHomeService,
  apiLearningService,
  apiGradingService,
  apiDeviceService,
  apiLegalService,
  apiForumService,
  apiQuestionService,
  apiAttachmentService,
} from './realServices';

export const aiService = environment.useMocks ? mockAIService : apiAIService;
export const authService = environment.useMocks ? mockAuthService : apiAuthService;
export const courseService = environment.useMocks ? mockCourseService : apiCourseService;
export const mediaService = environment.useMocks ? mockMediaService : apiMediaService;
export const notificationService = environment.useMocks ? mockNotificationService : apiNotificationService;
export const orderService = environment.useMocks ? mockOrderService : apiOrderService;
export const paymentService = environment.useMocks ? mockPaymentService : apiPaymentService;
export const productService = environment.useMocks ? mockProductService : apiProductService;
export const homeService = environment.useMocks ? mockHomeService : apiHomeService;
export const learningService = environment.useMocks ? mockLearningService : apiLearningService;
export const gradingService = environment.useMocks ? mockGradingService : apiGradingService;
export const deviceService = environment.useMocks ? mockDeviceService : apiDeviceService;
export const legalService = environment.useMocks ? mockLegalService : apiLegalService;
export const forumService = environment.useMocks ? mockForumService : apiForumService;
export const questionService = environment.useMocks ? mockQuestionService : apiQuestionService;
export const attachmentService = environment.useMocks ? mockAttachmentService : apiAttachmentService;
