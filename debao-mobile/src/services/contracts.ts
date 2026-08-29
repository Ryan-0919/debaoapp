import type {
  AppNotification,
  Course,
  Order,
  Product,
  Subject,
  UserProfile,
} from '@/types/domain';

export interface AuthService {
  login?(phone: string, code: string, deviceId?: string): Promise<AuthSession>;
  refresh?(refreshToken: string): Promise<AuthSession>;
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<UserProfile>;
  logout(): Promise<void>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  profile?: UserProfile;
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

export interface ProductService {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
}

export interface HomeService {
  get(): Promise<{banners: Array<{id: string; title: string; imageUrl: string; target: string}>; announcements: AppNotification[]; hotCourses: Course[]; exam: {year: string; daysRemaining: number}}>;
}

export interface LearningPlan { id: string; title: string; dailyMinutes: number; startDate: string; endDate: string; status: 'active' | 'completed' | 'archived'; }
export interface LearningTask { id: string; planId: string; title: string; dueDate: string; minutes: number; status: 'todo' | 'done' | 'overdue'; }
export interface LearningService {
  plans(): Promise<LearningPlan[]>;
  createPlan(input: Pick<LearningPlan, 'title' | 'dailyMinutes' | 'startDate' | 'endDate'>): Promise<LearningPlan>;
  tasks(): Promise<LearningTask[]>;
  completeTask(id: string): Promise<LearningTask>;
  report(period?: 'week' | 'month'): Promise<Record<string, unknown>>;
}

export interface GradingSubmission { id: string; questionId?: string; fileUrl?: string; status: 'queued' | 'processing' | 'completed' | 'rejected'; score?: number; feedback?: string; createdAt: string; }
export interface GradingService { list(): Promise<GradingSubmission[]>; submit(input: {questionId?: string; fileUrl?: string}): Promise<GradingSubmission>; get(id: string): Promise<GradingSubmission | null>; retry(id: string): Promise<GradingSubmission>; }

export interface DeviceService { list(): Promise<Array<{id: string; platform: 'android' | 'ios' | 'harmony'; name: string; pushToken?: string; lastSeenAt: string}>>; register(input: {deviceId: string; platform: 'android' | 'ios' | 'harmony'; name: string; pushToken?: string}): Promise<unknown>; remove(id: string): Promise<void>; }

export interface LegalService { search(query: string): Promise<{items: Array<Record<string, unknown>>; total: number; query: string}>; }

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
