import type {ReactNode} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  AlertCircle,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  Pen,
  Play,
  Settings,
  ShoppingBag,
  Star,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  label: string;
  icon: ReactNode;
  iconBackground: string;
  onPress: () => void;
}

function MiniProgress({value}: {value: number}) {
  return <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${value}%`}]} /></View>;
}

function SectionGroup({title, items}: {title: string; items: MenuItem[]}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {items.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            key={item.label}
            testID={`profile-menu-${item.label}`}
            onPress={item.onPress}
            style={({pressed}) => [styles.menuRow, index < items.length - 1 && styles.menuDivider, pressed && styles.pressed]}>
            <View style={[styles.menuIcon, {backgroundColor: item.iconBackground}]}>{item.icon}</View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <ChevronRight size={16} color="#C0C5D0" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const go = <T extends keyof RootStackParamList>(route: T) => navigation.navigate(route as never);

  const studyItems: MenuItem[] = [
    {label: '学习计划', icon: <ClipboardList size={18} color={colors.brand} />, iconBackground: colors.brandLight, onPress: () => go('LearningPlan')},
    {label: '学习报告', icon: <FileText size={18} color="#3A7A46" />, iconBackground: colors.mint, onPress: () => go('LearningReport')},
    {label: '做题记录', icon: <BookOpen size={18} color="#1A5FA8" />, iconBackground: colors.sky, onPress: () => go('QuestionRecords')},
    {label: '错题本', icon: <AlertCircle size={18} color="#D2691E" />, iconBackground: colors.apricot, onPress: () => go('MistakeBook')},
    {label: '收藏夹', icon: <Star size={18} color="#A87000" />, iconBackground: colors.gold, onPress: () => go('Favorites')},
  ];
  const serviceItems: MenuItem[] = [
    {label: '我的课程', icon: <Play size={18} color={colors.brand} />, iconBackground: colors.brandLight, onPress: () => navigation.navigate('MainTabs', {screen: 'Courses'})},
    {label: '订单与已购', icon: <ShoppingBag size={18} color="#C0385A" />, iconBackground: colors.rose, onPress: () => go('OrderList')},
    {label: '批改服务', icon: <Pen size={18} color="#1A8B8B" />, iconBackground: colors.celadon, onPress: () => go('Grading')},
  ];
  const appItems: MenuItem[] = [
    {label: '消息通知', icon: <Bell size={18} color="#A87000" />, iconBackground: colors.gold, onPress: () => go('Notifications')},
    {label: '设置与隐私', icon: <Settings size={18} color={colors.muted} />, iconBackground: colors.page, onPress: () => go('Settings')},
  ];

  return (
    <AppScreen testID="profile-screen">
      <View style={styles.account}>
        <Pressable testID="profile-avatar" onPress={() => go('UserProfile')} style={styles.avatar}><Text style={styles.avatarText}>李</Text></Pressable>
        <View style={styles.accountCopy}>
          <Text style={styles.name}>李明远</Text>
          <Text style={styles.examStatus}>备考中  ·  2024客观题</Text>
        </View>
        <Pressable testID="profile-edit" onPress={() => go('UserProfile')} style={styles.editButton}><Text style={styles.editText}>编辑资料</Text></Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.continueCard}>
          <Image source={require('@/assets/images/course-civil-law.png')} style={styles.courseImage} />
          <View style={styles.courseCopy}>
            <Text numberOfLines={1} style={styles.courseTitle}>民法精讲课（2024版）</Text>
            <Text numberOfLines={1} style={styles.lesson}>第18讲：物权变动的公示与公信原则</Text>
            <MiniProgress value={42} />
          </View>
          <Pressable testID="profile-continue-course" onPress={() => navigation.navigate('CourseDetail', {courseId: 'c1'})} style={styles.continueButton}>
            <Play size={11} color={colors.ink} fill={colors.ink} /><Text style={styles.continueText}>继续</Text>
          </Pressable>
        </View>

        <View style={styles.assets}>
          {[['2', '已开课程'], ['4.2h', '本周学习'], ['42%', '当前进度']].map(([value, label], index) => (
            <View key={label} style={[styles.asset, index > 0 && styles.assetDivider]}>
              <Text style={styles.assetValue}>{value}</Text><Text style={styles.assetLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>本周重点</Text>
            <Text style={styles.focusLine}>当前薄弱学科：<Text style={styles.weak}>民事诉讼法</Text></Text>
            <Text style={styles.focusLine}>待复习错题：<Text style={styles.focusStrong}>28</Text> 道</Text>
          </View>
          <Pressable testID="profile-view-report" onPress={() => go('LearningReport')} style={styles.reportLink}><Text style={styles.reportText}>查看报告</Text><ChevronRight size={13} color={colors.brand} /></Pressable>
        </View>

        <SectionGroup title="学习与内容" items={studyItems} />
        <SectionGroup title="课程与服务" items={serviceItems} />
        <SectionGroup title="应用管理" items={appItems} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  account: {height: 94, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 18, fontWeight: '800', color: colors.surface},
  accountCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  name: {fontSize: 16, fontWeight: '800', color: colors.ink},
  examStatus: {fontSize: 11, color: colors.muted, marginTop: 4},
  editButton: {height: 29, paddingHorizontal: 13, borderRadius: 15, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  editText: {fontSize: 11, color: colors.brand},
  body: {paddingHorizontal: 16, paddingTop: 12},
  continueCard: {height: 74, borderRadius: radius.md, backgroundColor: colors.surface, padding: 15, flexDirection: 'row', alignItems: 'center'},
  courseImage: {width: 72, height: 48, borderRadius: 4, backgroundColor: colors.line},
  courseCopy: {flex: 1, minWidth: 0, marginHorizontal: 11},
  courseTitle: {fontSize: 13, fontWeight: '700', color: colors.ink},
  lesson: {fontSize: 10, color: colors.muted, marginTop: 3},
  progressTrack: {height: 5, backgroundColor: colors.line, borderRadius: 99, overflow: 'hidden', marginTop: 7},
  progressFill: {height: '100%', backgroundColor: colors.brand, borderRadius: 99},
  continueButton: {height: 32, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.action, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5},
  continueText: {fontSize: 12, fontWeight: '700', color: colors.ink},
  assets: {height: 76, marginTop: 12, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', overflow: 'hidden'},
  asset: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  assetDivider: {borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.line},
  assetValue: {fontSize: 20, fontWeight: '800', color: colors.brand},
  assetLabel: {fontSize: 10, color: colors.muted, marginTop: 5},
  focusCard: {minHeight: 89, marginTop: 12, borderRadius: radius.md, backgroundColor: colors.surface, padding: 15, flexDirection: 'row', alignItems: 'flex-start'},
  focusCopy: {flex: 1},
  focusTitle: {fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 6},
  focusLine: {fontSize: 11, color: colors.muted, lineHeight: 18},
  weak: {color: colors.error, fontWeight: '600'},
  focusStrong: {color: colors.ink, fontWeight: '700'},
  reportLink: {height: 24, flexDirection: 'row', alignItems: 'center', marginTop: -2},
  reportText: {fontSize: 11, color: colors.brand, marginRight: 1},
  section: {marginTop: 12},
  sectionTitle: {fontSize: 11, color: colors.muted, marginLeft: 4, marginBottom: 7},
  sectionBody: {borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden'},
  menuRow: {height: 56, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center'},
  menuDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  menuIcon: {width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  menuLabel: {flex: 1, marginLeft: 12, fontSize: 14, color: colors.ink},
  pressed: {backgroundColor: colors.page},
});
