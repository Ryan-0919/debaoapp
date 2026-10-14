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
  status?: 'draft' | 'on_sale' | 'off_sale' | 'archived';
  updatedAt?: string;
  skus?: ProductSku[];
}

export interface ProductSku {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'disabled';
  attributes: Record<string, string>;
  updatedAt: string;
}

export interface Order {
  id: string;
  productId?: string;
  productName: string;
  amount: number;
  status: 'paid' | 'pending' | 'closed' | 'cancelled' | 'refund_requested' | 'refunded';
  createdAt: string;
  clientRequestId?: string;
  skuId?: string;
  couponCode?: string;
  discountAmount?: number;
  expiresAt?: string;
  paidAt?: string;
  closedAt?: string;
  refundedAt?: string;
  timeline?: OrderEvent[];
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: 'created' | 'paid' | 'cancelled' | 'expired' | 'refund_requested' | 'refunded' | 'refund_rejected';
  actor: 'user' | 'system' | 'admin' | 'provider';
  metadata: Record<string, unknown>;
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
  type?: 'learning' | 'grading' | 'order' | 'announcement' | string;
  deepLink?: string;
  pinned?: boolean;
  isPinned?: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  examYear: string;
  studyDays: number;
  avatarColor?: string;
  avatarUrl?: string;
}
