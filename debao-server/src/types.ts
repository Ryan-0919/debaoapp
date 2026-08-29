export type OrderStatus = 'paid' | 'pending' | 'closed';

export interface Subject {
  id: string;
  name: string;
  questionCount: number;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  teacher: string;
  type: 'video' | 'audio' | 'live';
  progress: number;
  lessons: number;
  accent: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  sold: number;
  accent: string;
  benefits: string[];
}

export interface Order {
  id: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  productId: string;
  clientRequestId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  examYear: string;
  studyDays: number;
}

export interface Question {
  id: string;
  stem: string;
  options: string[];
  answer: number;
  analysis: string;
}

export interface Store {
  profile: UserProfile;
  subjects: Subject[];
  courses: Course[];
  products: Product[];
  orders: Order[];
  questions: Question[];
  drafts: Map<string, {questionId: string; answers: string[]; updatedAt: string}>;
  sessions: Map<string, {userId: string; refreshToken: string; deviceId: string; expiresAt: string; revokedAt?: string}>;
  devices: Array<{id: string; userId: string; platform: 'android' | 'ios' | 'harmony'; name: string; pushToken?: string; lastSeenAt: string}>;
  submissions: Array<{id: string; userId: string; questionId: string; answers: string[]; correct: boolean; createdAt: string}>;
  learningPlans: Array<{id: string; userId: string; title: string; dailyMinutes: number; startDate: string; endDate: string; status: 'active' | 'completed' | 'archived'}>;
  learningTasks: Array<{id: string; planId: string; title: string; dueDate: string; minutes: number; status: 'todo' | 'done' | 'overdue'}>;
  favorites: Array<{id: string; userId: string; questionId: string; createdAt: string}>;
  mistakes: Array<{id: string; userId: string; questionId: string; wrongCount: number; lastAnswer: string; resolved: boolean}>;
  entitlements: Array<{userId: string; courseId: string; sourceOrderId: string; expiresAt?: string}>;
  grading: Array<{id: string; userId: string; questionId?: string; fileUrl?: string; status: 'queued' | 'processing' | 'completed' | 'rejected'; score?: number; feedback?: string; createdAt: string}>;
  announcements: Array<{id: string; title: string; body: string; status: 'draft' | 'published'; startsAt?: string; endsAt?: string; createdAt: string}>;
  banners: Array<{id: string; title: string; imageUrl: string; target: string; startsAt: string; endsAt?: string}>;
  legalDocuments: Array<{id: string; title: string; article: string; content: string; effectiveFrom: string; effectiveTo?: string}>;
  forumPosts: Array<{id: string; userName: string; title: string; body: string; likes: number; createdAt: string}>;
}
