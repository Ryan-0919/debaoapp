import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, ChevronLeft, Circle, Clock3} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {RemoteState} from '@/components/ui';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {learningService} from '@/services';

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

type PlanTask = {id?: string; title: string; detail: string; description?: string; done: boolean; locked?: boolean; time: string; dueDate?: string; status?: 'todo' | 'done' | 'overdue'; contentType?: 'course' | 'question' | 'subjective' | 'assessment' | 'card' | 'task'};
type PlanSection = {week: string; date?: string; tasks: ReadonlyArray<PlanTask>};
type ViewMode = 'today' | 'week' | 'all';
const contentTypeLabels: Record<NonNullable<PlanTask['contentType']>, string> = {course: '站外课程', card: '学习卡片', question: '客观题训练', subjective: '主观题训练', assessment: '周考/阶段测验', task: '学习任务'};

export default function LearningPlanScreen() {
  const navigation = useNavigation<Navigation>();
  const [sections, setSections] = useState<PlanSection[]>(environment.useMocks ? [...PLAN] : []);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [planMeta, setPlanMeta] = useState<{id?: string; version?: number; changeReason?: string; pausedUntil?: string; generatedThrough?: string}>({});
  const load = useCallback(() => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    let active = true;
    Promise.all([learningService.plans(), learningService.tasks()]).then(([plans, tasks]) => {
      if (!active) return;
      const plan = plans[0];
      setPlanMeta(plan ? {id: plan.id, version: plan.version, changeReason: plan.changeReason, pausedUntil: plan.pausedUntil, generatedThrough: plan.generatedThrough} : {});
      const planTasks = plan ? tasks.filter(task => task.planId === plan.id) : tasks;
      const grouped = planTasks.reduce<Record<string, PlanTask[]>>((result, task) => {
        const date = task.dueDate || '待安排';
        (result[date] ??= []).push({
          id: task.id,
          title: task.title,
          detail: `${task.status === 'done' ? '已完成' : task.status === 'overdue' ? '已逾期' : '待完成'} · ${task.description || (date === '待安排' ? '等待安排' : '当天完成')}`,
          description: task.description,
          done: task.status === 'done',
          locked: task.locked,
          time: task.minutes > 0 ? `${task.minutes}分钟` : '团队安排',
          dueDate: date,
          status: task.status,
          contentType: task.contentType,
        });
        return result;
      }, {});
      const dates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
      setSections(dates.map(date => ({week: date === '待安排' ? date : `${date} 学习安排`, date: date === '待安排' ? undefined : date, tasks: grouped[date]})));
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : '学习计划加载失败'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => load(), [load]);
  const openTask = (task: PlanTask) => {
    if (!task.id || task.done || task.locked) return;
    navigation.navigate('LearningTaskDetail', {taskId: task.id});
  };
  const togglePause = () => {
    if (environment.useMocks || !planMeta.id) return;
    if (planMeta.pausedUntil) {
      learningService.resumePlan(planMeta.id, '用户恢复学习').then(() => load()).catch(() => Alert.alert('操作失败', '暂时无法恢复学习计划'));
    } else {
      Alert.alert('暂停学习', '请选择暂停时长', [
        {text: '1 天', onPress: () => pauseFor(1)},
        {text: '3 天', onPress: () => pauseFor(3)},
        {text: '7 天', onPress: () => pauseFor(7)},
        {text: '取消', style: 'cancel'},
      ]);
    }
  };
  const pauseFor = (days: number) => {
    if (!planMeta.id) return;
    Alert.prompt?.('暂停原因', '可选填写暂停原因', reason => learningService.pausePlan(planMeta.id as string, days, reason.trim() || `用户申请暂停${days}天`).then(() => load()).catch(() => Alert.alert('操作失败', '暂时无法暂停学习计划')), 'plain-text', '', '确定');
    if (!Alert.prompt) learningService.pausePlan(planMeta.id, days, `用户申请暂停${days}天`).then(() => load()).catch(() => Alert.alert('操作失败', '暂时无法暂停学习计划'));
  };
  const progress = useMemo(() => {
    const tasks = sections.flatMap(section => section.tasks);
    const done = tasks.filter(task => task.done).length;
    const minutes = tasks.filter(task => task.done).reduce((sum, task) => { const value = Number.parseInt(task.time, 10); return sum + (Number.isFinite(value) ? value : 0); }, 0);
    return {done, total: tasks.length, minutes};
  }, [sections]);
  const today = new Date().toISOString().slice(0, 10);
  const visibleSections = useMemo(() => viewMode === 'all' ? sections : sections.filter(section => viewMode === 'week' || section.date === today), [sections, today, viewMode]);
  const todaySummary = useMemo(() => {
    const tasks = sections.filter(section => section.date === today).flatMap(section => section.tasks);
    return {total: tasks.length, done: tasks.filter(task => task.done).length, minutes: tasks.reduce((sum, task) => sum + (Number.parseInt(task.time, 10) || 0), 0)};
  }, [sections, today]);

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
<Text style={styles.progressTitle}>本周完成进度{planMeta.generatedThrough ? ` · 已排至 ${planMeta.generatedThrough}` : ''}</Text>
            <Text style={styles.progressValue} testID="learning-plan-progress-value">{environment.useMocks ? '1 / 4' : `${progress.done} / ${progress.total}`}</Text>
          </View>
          <View style={styles.progressTrack} testID="learning-plan-progress-track">
            <View style={environment.useMocks ? styles.progressFill : [styles.progressFill, {width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`}]} testID="learning-plan-progress-fill" />
          </View>
          <Text style={styles.progressDetail}>{environment.useMocks ? '预计本周学习时长 3.5 小时，已完成 0.9 小时' : `已完成学习时长 ${(progress.minutes / 60).toFixed(1)} 小时`}</Text>
        </View>
        <View style={styles.todaySummary} testID="learning-plan-today-summary"><View><Text style={styles.summaryLabel}>今日安排</Text><Text style={styles.summaryValue}>{todaySummary.total ? `${todaySummary.done} / ${todaySummary.total} 项` : '暂无任务'}</Text></View><View><Text style={styles.summaryLabel}>预计时长</Text><Text style={styles.summaryValue}>{todaySummary.minutes ? `${todaySummary.minutes} 分钟` : '—'}</Text></View></View>
        <View style={styles.modeTabs} testID="learning-plan-view-tabs">{([['today', '今日'], ['week', '本周'], ['all', '全部']] as const).map(([mode, label]) => <Pressable key={mode} accessibilityRole="button" accessibilityState={{selected: viewMode === mode}} onPress={() => setViewMode(mode)} style={[styles.modeTab, viewMode === mode && styles.modeTabActive]}><Text style={[styles.modeTabText, viewMode === mode && styles.modeTabTextActive]}>{label}</Text></Pressable>)}</View>
        {!environment.useMocks && planMeta.id ? <Pressable style={styles.pauseButton} onPress={togglePause} testID="learning-plan-pause-button"><Text style={styles.pauseButtonText}>{planMeta.pausedUntil ? `恢复学习（暂停至 ${planMeta.pausedUntil}）` : '暂停学习'}</Text></Pressable> : null}
        {!environment.useMocks && planMeta.version && planMeta.version > 1 ? <View style={styles.updateNotice} testID="learning-plan-update-notice"><Text style={styles.updateNoticeTitle}>学习计划已更新 · v{planMeta.version}</Text><Text style={styles.updateNoticeText}>{planMeta.changeReason || '管理员根据你的学习情况调整了安排'}</Text></View> : null}

        {loading || error ? <RemoteState testID="learning-plan-state" loading={loading} error={error} onRetry={load} /> : visibleSections.length ? visibleSections.map(section => (
          <View key={section.week} style={styles.section} testID={`learning-plan-section-${section.week}`}>
            <Text style={styles.sectionLabel}>{section.week}</Text>
            <View style={styles.taskCard}>
              {section.tasks.map((task, index) => (
                <Pressable
                  key={task.id ?? task.title}
                  style={[styles.task, index < section.tasks.length - 1 && styles.taskDivider]}
                  onPress={task.id && !task.done && !task.locked ? () => openTask(task) : undefined}
                  testID={`learning-plan-task-${task.title}`}>
                  {task.done ? (
                    <CheckCircle2 size={18} color={colors.success} style={styles.statusIcon} />
                  ) : (
                    <Circle size={18} color="#C0C5D0" style={styles.statusIcon} />
                  )}
                  <View style={styles.taskCopy}>
                    <View style={styles.taskTitleRow}>{task.contentType ? <Text style={styles.typeLabel}>{contentTypeLabels[task.contentType]}</Text> : null}<Text style={[styles.taskTitle, task.done && styles.taskDone]} numberOfLines={1}>{task.title}</Text></View>
                    <Text style={styles.taskDetail}>{task.locked ? '完成前置内容后解锁' : task.detail}</Text>
                  </View>
                  <View style={styles.time}>
                    <Clock3 size={11} color="#C0C5D0" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )) : <RemoteState testID="learning-plan-empty" empty emptyTitle={viewMode === 'today' ? '今天暂无安排' : '暂无学习计划'} emptyDescription={viewMode === 'today' ? '可以切换到“本周”查看后续学习任务。' : '完成首次学习诊断并完成报班后，系统会按阶段为你生成学习安排。'} />}
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
  todaySummary: {marginHorizontal: 16, marginTop: 10, paddingHorizontal: 16, paddingVertical: 11, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between'},
  summaryLabel: {fontSize: 11, lineHeight: 15, color: colors.muted},
  summaryValue: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink, marginTop: 2},
  modeTabs: {marginHorizontal: 16, marginTop: 12, padding: 3, borderRadius: radius.md, backgroundColor: colors.line, flexDirection: 'row'},
  modeTab: {flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm},
  modeTabActive: {backgroundColor: colors.surface},
  modeTabText: {fontSize: 12, color: colors.muted},
  modeTabTextActive: {fontWeight: '600', color: colors.brand},
  updateNotice: {marginHorizontal: 16, marginTop: 10, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#EEF2FF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#C7D2FE'},
  updateNoticeTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.brand},
  updateNoticeText: {fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 2},
  pauseButton: {marginHorizontal: 16, marginTop: 10, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand},
  pauseButtonText: {fontSize: 12, color: colors.brand, fontWeight: '600'},
  section: {marginHorizontal: 16, marginTop: 12},
  sectionLabel: {fontSize: 12, lineHeight: 17, color: colors.muted, marginBottom: 6},
  taskCard: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  task: {minHeight: 76, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'flex-start'},
  taskDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  statusIcon: {marginTop: 2},
  taskCopy: {flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8},
  taskTitleRow: {flexDirection: 'row', alignItems: 'center', minWidth: 0},
  typeLabel: {fontSize: 10, lineHeight: 16, color: colors.brand, backgroundColor: '#EEF2FF', borderRadius: 4, paddingHorizontal: 5, marginRight: 6},
  taskTitle: {flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.ink},
  taskDone: {color: colors.muted, textDecorationLine: 'line-through'},
  taskDetail: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 1},
  time: {height: 20, flexDirection: 'row', alignItems: 'center', marginTop: 1},
  timeText: {fontSize: 11, lineHeight: 15, color: colors.muted, marginLeft: 2},
  pressed: {opacity: 0.65},
});
