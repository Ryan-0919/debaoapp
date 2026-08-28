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
  SubjectiveAnswer: {subjectName: string; questionIndex?: number};
  ObjectiveAnswer: {mode?: 'practice' | 'exam' | 'chapter'; title?: string} | undefined;
  ObjectiveReport: {correct: number; total: number};
  ProductDetail: {productId: string};
  PurchaseSuccess: {productName: string; orderId: string};
  CourseDetail: {courseId: string};
  VideoPlayer: {courseId: string};
  LiveCourse: {courseId: string};
  AudioPlayer: {courseId: string};
  LearningReport: undefined;
  LearningPlan: undefined;
  MistakeBook: undefined;
  Favorites: undefined;
  LawSearch: undefined;
  AIChat: undefined;
  OrderList: undefined;
  OrderDetail: {orderId: string};
  UserProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Grading: undefined;
  QuestionRecords: undefined;
};
