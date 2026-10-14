import type {NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Questions: undefined;
  Mall: undefined;
  Courses: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  SubjectiveSelect: {subject?: string} | undefined;
  SubjectiveAnswer: {subjectName: string; questionIndex?: number; gradingPaperId?: string; gradingQuestionId?: string; learningTaskId?: string; learningQuestionId?: string};
  ObjectiveAnswer: {mode?: 'practice' | 'exam' | 'chapter' | 'random'; title?: string; subjectId?: string; paperId?: string; sessionId?: string; learningTaskId?: string; questionIds?: string[]} | undefined;
  /**
   * `correct`/`total` remain for historical record navigation. New reports
   * should pass `sessionId` so the screen can load the server snapshot.
   */
  ObjectiveReport: {correct?: number; total?: number; sessionId?: string; submissionId?: string};
  ProductDetail: {productId: string};
  PurchaseSuccess: {productName: string; productId: string; orderId: string};
  CourseDetail: {courseId: string};
  VideoPlayer: {courseId: string; lessonId?: string};
  LiveCourse: {courseId: string; title?: string};
  AudioPlayer: {courseId: string; lessonId?: string};
  LearningReport: undefined;
  LearningPlan: undefined;
  LearningTaskDetail: {taskId: string};
  LearningCenter: undefined;
  LearningDiagnostic: undefined;
  MistakeBook: undefined;
  Favorites: undefined;
  LawSearch: {source?: 'subjective-answer'; subject?: string} | undefined;
  ForumDetail: {postId: string};
  ForumCompose: undefined;
  AIChat: undefined;
  OrderList: undefined;
  OrderDetail: {orderId: string};
  UserProfile: undefined;
  Settings: undefined;
  AccountSecurity: undefined;
  LegalDocument: {document: 'privacy' | 'terms' | 'sdk-list' | 'account-deletion'};
  Notifications: undefined;
  AnnouncementDetail: {announcementId: string};
  Grading: undefined;
  GradingPaperDetail: {paperId: string};
  GradingSubmitSuccess: {submissionId: string; paperId?: string; questionTitle: string};
  GradingReport: {submissionId: string};
  QuestionRecords: undefined;
};
