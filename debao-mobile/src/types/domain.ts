export type LoadState = 'idle' | 'loading' | 'success' | 'error';

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
  status: 'paid' | 'pending' | 'closed';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  examYear: string;
  studyDays: number;
}
