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
}
