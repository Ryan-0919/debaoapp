import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, ChevronLeft, Circle, Clock3} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const PLAN = [
  {
    week: '本周计划（8月26日–9月1日）',
    tasks: [
      {title: '完成民法·物权法章节练习', detail: '目标30题 · 已完成12题', done: false, time: '45分钟'},
      {title: '观看刑法第8讲', detail: '犯罪的未完成形态 · 约55分钟', done: true, time: '55分钟'},
      {title: '复习错题（民法）', detail: '28道待复习', done: false, time: '30分钟'},
      {title: '完成行政法章节测验', detail: '行政许可 · 15题', done: false, time: '20分钟'},
    ],
  },
  {
    week: '下周预计',
    tasks: [
      {title: '民事诉讼法专项练习', detail: '强化薄弱科目', done: false, time: '60分钟'},
      {title: '2022年真题卷二精练', detail: '历年真题模拟', done: false, time: '90分钟'},
    ],
  },
] as const;

export default function LearningPlanScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="learning-plan-screen">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => navigation.goBack()}
          style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>学习计划</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="learning-plan-scroll">
        <View style={styles.progressCard}>
          <View style={styles.progressHeading}>
            <Text style={styles.progressTitle}>本周完成进度</Text>
            <Text style={styles.progressValue} testID="learning-plan-progress-value">1 / 4</Text>
          </View>
          <View style={styles.progressTrack} testID="learning-plan-progress-track">
            <View style={styles.progressFill} testID="learning-plan-progress-fill" />
          </View>
          <Text style={styles.progressDetail}>预计本周学习时长 3.5 小时，已完成 0.9 小时</Text>
        </View>

        {PLAN.map(section => (
          <View key={section.week} style={styles.section} testID={`learning-plan-section-${section.week}`}>
            <Text style={styles.sectionLabel}>{section.week}</Text>
            <View style={styles.taskCard}>
              {section.tasks.map((task, index) => (
                <View
                  key={task.title}
                  style={[styles.task, index < section.tasks.length - 1 && styles.taskDivider]}
                  testID={`learning-plan-task-${task.title}`}>
                  {task.done ? (
                    <CheckCircle2 size={18} color={colors.success} style={styles.statusIcon} />
                  ) : (
                    <Circle size={18} color="#C0C5D0" style={styles.statusIcon} />
                  )}
                  <View style={styles.taskCopy}>
                    <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
                    <Text style={styles.taskDetail}>{task.detail}</Text>
                  </View>
                  <View style={styles.time}>
                    <Clock3 size={11} color="#C0C5D0" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, lineHeight: 22, fontWeight: '600', color: colors.ink},
  headerSide: {width: 44},
  content: {paddingBottom: 24},
  progressCard: {
    height: 92,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  progressHeading: {height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  progressTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink},
  progressValue: {fontSize: 13, lineHeight: 18, fontWeight: '500', color: colors.brand},
  progressTrack: {height: 8, marginTop: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.line},
  progressFill: {width: '25%', height: 8, borderRadius: 4, backgroundColor: colors.brand},
  progressDetail: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 6},
  section: {marginHorizontal: 16, marginTop: 12},
  sectionLabel: {fontSize: 12, lineHeight: 17, color: colors.muted, marginBottom: 6},
  taskCard: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  task: {height: 70, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'flex-start'},
  taskDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  statusIcon: {marginTop: 2},
  taskCopy: {flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8},
  taskTitle: {fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.ink},
  taskDone: {color: colors.muted, textDecorationLine: 'line-through'},
  taskDetail: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 1},
  time: {height: 20, flexDirection: 'row', alignItems: 'center', marginTop: 1},
  timeText: {fontSize: 11, lineHeight: 15, color: colors.muted, marginLeft: 2},
  pressed: {opacity: 0.65},
});
