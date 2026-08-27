import {Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {
  Bell,
  BookOpenCheck,
  Bot,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileSearch,
  Flame,
  Play,
  Target,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {Card, ProgressBar, SectionTitle} from '@/components/ui';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {useAppStore} from '@/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const shortcuts = [
  {label: '每日练习', icon: Target, color: colors.brand, route: 'ObjectiveAnswer' as const},
  {label: '主观题', icon: BookOpenCheck, color: colors.error, route: 'SubjectiveSelect' as const},
  {label: '法条检索', icon: FileSearch, color: colors.success, route: 'LawSearch' as const},
  {label: 'AI 助手', icon: Bot, color: colors.warning, route: 'AIChat' as const},
];

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const profile = useAppStore(state => state.profile);
  const {width} = useWindowDimensions();
  const compact = width < 360;

  return (
    <AppScreen testID="home-screen">
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>晚上好</Text>
          <Text style={styles.greeting}>{profile.name}</Text>
        </View>
        <Pressable
          accessibilityLabel="消息通知"
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}>
          <Bell size={21} color={colors.ink} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <View style={styles.streakRow}>
              <Flame size={16} color={colors.action} />
              <Text style={styles.streak}>连续学习 {profile.studyDays} 天</Text>
            </View>
            <Text style={styles.heroTitle}>今日计划已完成 2/4</Text>
            <Text style={styles.heroBody}>再学习 38 分钟，保持稳定节奏。</Text>
          </View>
          <View style={styles.scoreRing}>
            <Text style={styles.score}>62%</Text>
            <Text style={styles.scoreLabel}>今日</Text>
          </View>
        </View>

        <View style={[styles.shortcutGrid, compact && styles.shortcutGridCompact]}>
          {shortcuts.map(item => {
            const Icon = item.icon;
            return (
              <Pressable
                accessibilityRole="button"
                key={item.label}
                onPress={() => navigation.navigate(item.route as never)}
                style={({pressed}) => [styles.shortcut, pressed && styles.pressed]}>
                <View style={[styles.shortcutIcon, {backgroundColor: `${item.color}18`}]}>
                  <Icon size={22} color={item.color} />
                </View>
                <Text style={styles.shortcutLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle
          title="继续学习"
          action={<Text style={styles.link} onPress={() => navigation.navigate('LearningPlan')}>学习计划</Text>}
        />
        <Card>
          <View style={styles.courseTop}>
            <View style={styles.courseMark}><Play size={20} color="#FFFFFF" fill="#FFFFFF" /></View>
            <View style={styles.courseCopy}>
              <Text style={styles.courseTitle}>民法体系精讲</Text>
              <Text style={styles.meta}>第 18 讲 · 合同的履行</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('CourseDetail', {courseId: 'c1'})}>
              <ChevronRight size={20} color={colors.muted} />
            </Pressable>
          </View>
          <ProgressBar value={68} />
          <View style={styles.progressMeta}>
            <Text style={styles.meta}>已学习 28/42 课</Text>
            <Text style={styles.progressValue}>68%</Text>
          </View>
        </Card>

        <SectionTitle title="今日安排" />
        <Card>
          <View style={styles.planRow}>
            <View style={[styles.planIcon, {backgroundColor: colors.brandLight}]}><CalendarDays size={19} color={colors.brand} /></View>
            <View style={styles.planCopy}>
              <Text style={styles.planTitle}>客观题每日练习</Text>
              <Text style={styles.meta}>20 道 · 预计 25 分钟</Text>
            </View>
            <Text style={styles.done}>已完成</Text>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.planRow} onPress={() => navigation.navigate('LiveCourse', {courseId: 'c3'})}>
            <View style={[styles.planIcon, {backgroundColor: colors.rose}]}><Clock3 size={19} color={colors.error} /></View>
            <View style={styles.planCopy}>
              <Text style={styles.planTitle}>主观题直播带练</Text>
              <Text style={styles.meta}>20:00 开始 · 王老师</Text>
            </View>
            <Text style={styles.link}>进入</Text>
          </Pressable>
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 72, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  eyebrow: {fontSize: 12, color: colors.muted},
  greeting: {fontSize: 21, fontWeight: '800', color: colors.ink, marginTop: 2},
  notificationButton: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  dot: {position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error, right: 9, top: 8, borderWidth: 1, borderColor: colors.surface},
  content: {paddingHorizontal: spacing.lg},
  hero: {backgroundColor: colors.ink, borderRadius: radius.md, marginTop: spacing.lg, padding: spacing.xl, minHeight: 150, flexDirection: 'row', alignItems: 'center'},
  heroCopy: {flex: 1, paddingRight: spacing.md},
  streakRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  streak: {color: colors.action, fontSize: 12, fontWeight: '700'},
  heroTitle: {color: '#FFFFFF', fontWeight: '800', fontSize: 21, marginTop: spacing.md},
  heroBody: {color: '#C5C7D0', fontSize: 13, lineHeight: 20, marginTop: spacing.sm},
  scoreRing: {width: 74, height: 74, borderRadius: 37, borderWidth: 6, borderColor: colors.action, alignItems: 'center', justifyContent: 'center'},
  score: {color: '#FFFFFF', fontSize: 17, fontWeight: '800'},
  scoreLabel: {color: '#C5C7D0', fontSize: 10},
  shortcutGrid: {flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl},
  shortcutGridCompact: {flexWrap: 'wrap', gap: spacing.md},
  shortcut: {width: '23%', minWidth: 68, alignItems: 'center'},
  shortcutIcon: {width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  shortcutLabel: {fontSize: 12, color: colors.ink, marginTop: spacing.sm, fontWeight: '600'},
  pressed: {opacity: 0.55},
  link: {fontSize: 13, color: colors.brand, fontWeight: '700'},
  courseTop: {flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg},
  courseMark: {width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  courseCopy: {flex: 1, marginLeft: spacing.md},
  courseTitle: {fontSize: 16, fontWeight: '700', color: colors.ink},
  meta: {fontSize: 12, color: colors.muted, marginTop: 4},
  progressMeta: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 6},
  progressValue: {fontSize: 12, color: colors.brand, fontWeight: '700'},
  planRow: {flexDirection: 'row', alignItems: 'center', minHeight: 62},
  planIcon: {width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  planCopy: {flex: 1, marginLeft: spacing.md},
  planTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  done: {fontSize: 12, color: colors.success, fontWeight: '700'},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: colors.line},
});
