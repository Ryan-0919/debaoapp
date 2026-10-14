import {Linking} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = Exclude<keyof RootStackParamList, 'MainTabs'>;

const tabRoutes: Record<string, keyof MainTabParamList> = {
  '/home': 'Home',
  '/questions': 'Questions',
  '/mall': 'Mall',
  '/courses': 'Courses',
  '/profile': 'Profile',
};

const screenRoutes: Record<string, ScreenRoute> = {
  '/learning/records': 'QuestionRecords',
  '/learning/plan': 'LearningPlan',
  '/learning/plans': 'LearningPlan',
  '/grading': 'Grading',
  '/notifications': 'Notifications',
  '/orders': 'OrderList',
  '/law-search': 'LawSearch',
  '/mistakes': 'MistakeBook',
  '/favorites': 'Favorites',
  '/ai-chat': 'AIChat',
};

export function openAppTarget(navigation: Navigation, target?: string) {
  if (!target) return;
  if (/^https?:\/\//i.test(target)) {
    Linking.openURL(target).catch(() => undefined);
    return;
  }
  const announcementMatch = target.match(/^\/announcements\/([^/?#]+)$/);
  if (announcementMatch) {
    navigation.navigate('AnnouncementDetail', {announcementId: decodeURIComponent(announcementMatch[1])});
    return;
  }
  const productMatch = target.match(/^\/(?:products|commerce\/products)\/([^/?#]+)$/);
  if (productMatch) {
    navigation.navigate('ProductDetail', {productId: decodeURIComponent(productMatch[1])});
    return;
  }
  const courseMatch = target.match(/^\/courses\/([^/?#]+)$/);
  if (courseMatch) {
    navigation.navigate('CourseDetail', {courseId: decodeURIComponent(courseMatch[1])});
    return;
  }
  const postMatch = target.match(/^\/(?:forum\/posts|community\/posts)\/([^/?#]+)$/);
  if (postMatch) {
    navigation.navigate('ForumDetail', {postId: decodeURIComponent(postMatch[1])});
    return;
  }
  const gradingReportMatch = target.match(/^\/grading\/([^/?#]+)\/report$/);
  if (gradingReportMatch) {
    navigation.navigate('GradingReport', {submissionId: decodeURIComponent(gradingReportMatch[1])});
    return;
  }
  const orderMatch = target.match(/^\/orders\/([^/?#]+)$/);
  if (orderMatch) {
    navigation.navigate('OrderDetail', {orderId: decodeURIComponent(orderMatch[1])});
    return;
  }
  const tab = tabRoutes[target];
  if (tab) {
    navigation.navigate('MainTabs', {screen: tab});
    return;
  }
  const route = screenRoutes[target];
  if (route) navigation.navigate(route as never);
}
