export type Tab = "home" | "questions" | "mall" | "courses" | "profile";

export type Page =
  | { type: "tab"; tab: Tab }
  | { type: "subjective-select"; subject?: string }
  | { type: "subjective-answer"; questionIndex: number; subjectName: string }
  | { type: "objective-answer"; mode: "chapter" | "exam"; title: string }
  | { type: "objective-report" }
  | { type: "product-detail"; productId: string }
  | { type: "purchase-success"; productName: string; productId?: string }
  | { type: "course-detail"; courseId: string }
  | { type: "video-player"; courseId: string; lessonId?: string }
  | { type: "live-course"; title?: string }
  | { type: "audio-player"; courseId: string; lessonId?: string }
  | { type: "learning-report" }
  | { type: "learning-plan" }
  | { type: "mistake-book" }
  | { type: "favorites" }
  | { type: "law-search" }
  | { type: "ai-chat" }
  | { type: "order-list" }
  | { type: "order-detail"; orderId: string }
  | { type: "user-profile" }
  | { type: "settings" }
  | { type: "notifications" }
  | { type: "grading" }
  | { type: "question-records" };

export interface NavContextType {
  navigate: (page: Page) => void;
  goBack: () => void;
  replace: (page: Page) => void;
  activeTab: Tab;
  switchTab: (tab: Tab) => void;
  pageStack: Page[];
}
