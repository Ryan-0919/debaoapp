import type {
  AppNotification,
  Course,
  Order,
  Product,
  Subject,
  UserProfile,
} from '@/types/domain';

export interface AuthService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<UserProfile>;
  logout(): Promise<void>;
}

export interface QuestionSubmission {
  questionId: string;
  answers: string[];
}

export interface QuestionService {
  listSubjects(): Promise<Subject[]>;
  saveDraft(submission: QuestionSubmission): Promise<void>;
  submit(submission: QuestionSubmission): Promise<{submissionId: string}>;
}

export interface CourseService {
  list(): Promise<Course[]>;
  get(id: string): Promise<Course | null>;
}

export interface OrderService {
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  create(product: Product): Promise<Order>;
}

export interface PaymentService {
  pay(order: Order): Promise<{status: 'mock-paid' | 'paid' | 'pending'; transactionId: string}>;
}

export interface AIService {
  streamReply(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
}

export interface MediaService {
  prepare(courseId: string, kind: 'video' | 'audio' | 'live'): Promise<{
    available: false;
    reason: string;
  }>;
}

export interface NotificationService {
  list(): Promise<AppNotification[]>;
  requestPermission(): Promise<{granted: false; reason: string}>;
}
