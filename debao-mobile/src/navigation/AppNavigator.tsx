import type {ComponentType} from 'react';
import {StyleSheet, Text} from 'react-native';
import {ClipboardCheck, GraduationCap, Home, ShoppingBag, UserRound} from 'lucide-react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {LucideProps} from 'lucide-react-native';
import {colors} from '@/theme';
import type {MainTabParamList, RootStackParamList} from '@/types/navigation';
import HomeScreen from '@/screens/tabs/HomeScreen';
import QuestionBankScreen from '@/screens/tabs/QuestionBankScreen';
import MallScreen from '@/screens/tabs/MallScreen';
import CoursesScreen from '@/screens/tabs/CoursesScreen';
import ProfileScreen from '@/screens/tabs/ProfileScreen';
import SubjectiveSelectScreen from '@/screens/questions/SubjectiveSelectScreen';
import SubjectiveAnswerScreen from '@/screens/questions/SubjectiveAnswerScreen';
import ObjectiveAnswerScreen from '@/screens/questions/ObjectiveAnswerScreen';
import ObjectiveReportScreen from '@/screens/questions/ObjectiveReportScreen';
import ProductDetailScreen from '@/screens/commerce/ProductDetailScreen';
import PurchaseSuccessScreen from '@/screens/commerce/PurchaseSuccessScreen';
import {OrderDetailScreen, OrderListScreen} from '@/screens/commerce/OrderScreens';
import CourseDetailScreen from '@/screens/courses/CourseDetailScreen';
import {AudioPlayerScreen, LiveCourseScreen, VideoPlayerScreen} from '@/screens/courses/MediaScreens';
import AIChatScreen from '@/screens/ai/AIChatScreen';
import {AccountSecurityScreen, AnnouncementDetailScreen, LegalDocumentScreen, NotificationsScreen, SettingsScreen, UserProfileScreen} from '@/screens/account/AccountScreens';
import {FavoritesScreen, ForumComposeScreen, ForumDetailScreen, GradingPaperDetailScreen, GradingReportScreen, GradingServiceScreen, GradingSubmitSuccessScreen, LawSearchScreen, LearningPlanScreen, LearningReportScreen, LearningTaskDetailScreen, MistakeBookScreen, QuestionRecordsScreen} from '@/screens/tools/ToolScreens';
import LearningCenterScreen from '@/screens/learning/LearningCenterScreen';
import LearningDiagnosticScreen from '@/screens/learning/LearningDiagnosticScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const tabMeta: Record<keyof MainTabParamList, {label: string; icon: ComponentType<LucideProps>}> = {
  Home: {label: '首页', icon: Home},
  Questions: {label: '题库', icon: ClipboardCheck},
  Mall: {label: '商城', icon: ShoppingBag},
  Courses: {label: '课程', icon: GraduationCap},
  Profile: {label: '我的', icon: UserRound},
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({route}) => {
        const meta = tabMeta[route.name];
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({color, focused}) => {
            const Icon = meta.icon;
            return <Icon size={focused ? 22 : 21} strokeWidth={focused ? 2.5 : 2} color={color} />;
          },
          tabBarLabel: ({color}) => <Text style={[styles.tabLabel, {color}]}>{meta.label}</Text>,
        };
      }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Questions" component={QuestionBankScreen} />
      <Tabs.Screen name="Mall" component={MallScreen} />
      <Tabs.Screen name="Courses" component={CoursesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, contentStyle: {backgroundColor: colors.page}}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="SubjectiveSelect" component={SubjectiveSelectScreen} />
      <Stack.Screen name="SubjectiveAnswer" component={SubjectiveAnswerScreen} />
      <Stack.Screen name="ObjectiveAnswer" component={ObjectiveAnswerScreen} />
      <Stack.Screen name="ObjectiveReport" component={ObjectiveReportScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="PurchaseSuccess" component={PurchaseSuccessScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen name="LiveCourse" component={LiveCourseScreen} />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
      <Stack.Screen name="LearningReport" component={LearningReportScreen} />
      <Stack.Screen name="LearningPlan" component={LearningPlanScreen} />
      <Stack.Screen name="LearningTaskDetail" component={LearningTaskDetailScreen} />
      <Stack.Screen name="LearningCenter" component={LearningCenterScreen} />
      <Stack.Screen name="LearningDiagnostic" component={LearningDiagnosticScreen} />
      <Stack.Screen name="MistakeBook" component={MistakeBookScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="LawSearch" component={LawSearchScreen} />
      <Stack.Screen name="ForumDetail" component={ForumDetailScreen} />
      <Stack.Screen name="ForumCompose" component={ForumComposeScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
      <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      <Stack.Screen name="Grading" component={GradingServiceScreen} />
      <Stack.Screen name="GradingPaperDetail" component={GradingPaperDetailScreen} />
      <Stack.Screen name="GradingSubmitSuccess" component={GradingSubmitSuccessScreen} />
      <Stack.Screen name="GradingReport" component={GradingReportScreen} />
      <Stack.Screen name="QuestionRecords" component={QuestionRecordsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {minHeight: 62, paddingTop: 7, paddingBottom: 7, backgroundColor: colors.surface, borderTopColor: colors.line},
  tabLabel: {fontSize: 10, fontWeight: '600', marginTop: 1},
});
