import {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, ChevronLeft, Clock3, LockKeyhole, PlayCircle} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {RemoteState} from '@/components/ui';
import {environment} from '@/config/environment';
import {learningService} from '@/services';
import type {LearningCard, LearningTask} from '@/services';
import type {RootStackParamList} from '@/types/navigation';
import {colors, radius} from '@/theme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'LearningTaskDetail'>;
const typeLabels: Record<NonNullable<LearningTask['contentType']>, string> = {course: '站外课程', card: '学习卡片', question: '客观题训练', subjective: '主观题训练', assessment: '周考/阶段测验', task: '学习任务'};
const assetUrl = (reference: string) => /^https?:\/\//i.test(reference) ? reference : `${environment.apiBaseUrl.replace(/\/v1\/?$/, '')}${reference}`;

export default function LearningTaskDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [task, setTask] = useState<LearningTask | null>(null);
  const [card, setCard] = useState<LearningCard | null>(null);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const load = useCallback(async () => {
    if (environment.useMocks) {
      setTask({id: route.params.taskId, planId: 'plan-demo', title: '观看刑法第8讲', description: '请在外部平台完成课程后回来打卡。', dueDate: new Date().toISOString().slice(0, 10), minutes: 55, status: 'todo', contentType: 'course'});
      setLoading(false);
      return;
    }
    setLoading(true); setError('');
    try {
      const tasks = await learningService.tasks();
      const found = tasks.find(item => item.id === route.params.taskId);
      if (!found) throw new Error('学习任务不存在');
      setTask(found);
      setCard(null);
      if (!found.locked && found.contentType === 'card' && found.contentId && learningService.card) setCard(await learningService.card(found.contentId));
    } catch (reason) { setError(reason instanceof Error ? reason.message : '学习任务加载失败'); }
    finally { setLoading(false); }
  }, [route.params.taskId]);
  useEffect(() => { void load(); }, [load]);
  const complete = async () => {
    if (!task || task.status === 'done' || task.locked || submitting) return;
    if (environment.useMocks) { setTask({...task, status: 'done'}); return; }
    setSubmitting(true);
    try { const updated = await learningService.completeTask(task.id); setTask(updated); Alert.alert('已完成', '这项学习任务已完成。', [{text: '返回学习计划', onPress: () => navigation.goBack()}]); }
    catch (reason) { Alert.alert('暂时无法完成', reason instanceof Error ? reason.message : '请稍后重试'); }
    finally { setSubmitting(false); }
  };
  const startQuestion = () => {
    if (!task) return;
    navigation.navigate('ObjectiveAnswer', {mode: 'practice', title: task.title, subjectId: task.subjectId, questionIds: task.contentId ? [task.contentId] : undefined, learningTaskId: task.id});
  };
  const startSubjective = () => {
    if (!task || !task.contentId) return;
    navigation.navigate('SubjectiveAnswer', {subjectName: task.subjectId ?? '主观题', learningTaskId: task.id, learningQuestionId: task.contentId});
  };
  const startAssessment = () => {
    if (!task || !task.contentId) return;
    navigation.navigate('ObjectiveAnswer', {mode: 'exam', title: task.title, paperId: task.contentId, learningTaskId: task.id});
  };
  if (loading || error || !task) return <AppScreen scroll={false} testID="learning-task-detail-screen"><View style={styles.header}><Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={styles.headerSide}><ChevronLeft size={22} color={colors.ink} /></Pressable><Text style={styles.headerTitle}>学习任务</Text><View style={styles.headerSide} /></View><RemoteState testID="learning-task-detail-state" loading={loading} error={error} empty={!loading && !error && !task} emptyTitle="任务不存在" emptyDescription="请返回学习计划重新加载。" onRetry={load} /></AppScreen>;
  const type = task.contentType ?? 'task';
  const isDone = task.status === 'done';
  return <AppScreen scroll={false} backgroundColor={colors.page} testID="learning-task-detail-screen"><View style={styles.header}><Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={styles.headerSide}><ChevronLeft size={22} color={colors.ink} /></Pressable><Text numberOfLines={1} style={styles.headerTitle}>任务详情</Text><View style={styles.headerSide} /></View><ScrollView contentContainerStyle={styles.content}><View style={styles.hero}><View style={styles.heroIcon}>{isDone ? <CheckCircle2 size={26} color={colors.success} /> : <PlayCircle size={28} color={colors.brand} />}</View><Text style={styles.title}>{task.title}</Text><View style={styles.metaRow}><Text style={styles.typeBadge}>{typeLabels[type]}</Text><Text style={styles.meta}><Clock3 size={13} color={colors.muted} /> {task.minutes > 0 ? `${task.minutes} 分钟` : '按团队安排'}</Text></View></View>{task.locked ? <View style={styles.locked}><LockKeyhole size={18} color={colors.muted} /><Text style={styles.lockedText}>完成前置学习内容后解锁</Text></View> : null}<View style={styles.card}><Text style={styles.sectionTitle}>{type === 'course' ? '课程说明' : type === 'card' ? '卡片学习' : type === 'question' ? '客观题训练' : type === 'subjective' ? '主观题训练' : type === 'assessment' ? '周考/阶段测验' : '任务说明'}</Text><Text style={styles.description}>{card?.description || task.description || (type === 'course' ? '请在外部平台完成课程，完成后回到这里进行打卡。' : type === 'card' ? '请完成卡片背诵，确认记忆后再提交完成。' : type === 'question' ? '完成客观题训练并提交答案后，这项任务才会完成。' : type === 'subjective' ? '完成主观题作答并提交后，这项任务才会完成。' : type === 'assessment' ? '完成限时周考并交卷后，这项任务才会完成。' : '按团队安排完成这项学习任务。')}</Text>{type === 'card' && card?.contentType === 'image_gallery' ? <View style={styles.assetList}>{card.assets.map(asset => <Image key={asset.id} accessibilityLabel={asset.filename} source={{uri: assetUrl(asset.reference)}} style={styles.assetImage} resizeMode="contain" />)}</View> : null}{type === 'card' && card?.contentType === 'html' && card.assets[0] ? <Pressable style={styles.htmlLink} onPress={() => void Linking.openURL(assetUrl(card.assets[0].reference))}><Text style={styles.htmlLinkText}>打开卡片 HTML 内容</Text></Pressable> : null}</View>{!isDone && !task.locked ? type === 'question' ? <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]} onPress={startQuestion}><PlayCircle size={18} color={colors.surface} /><Text style={styles.primaryText}>开始客观题</Text></Pressable> : type === 'subjective' ? <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]} onPress={startSubjective}><PlayCircle size={18} color={colors.surface} /><Text style={styles.primaryText}>开始主观题</Text></Pressable> : type === 'assessment' ? <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]} onPress={startAssessment}><PlayCircle size={18} color={colors.surface} /><Text style={styles.primaryText}>开始周考</Text></Pressable> : <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => void complete()} disabled={submitting}><CheckCircle2 size={18} color={colors.surface} /><Text style={styles.primaryText}>{submitting ? '提交中...' : type === 'course' ? '听完课程，完成打卡' : type === 'card' ? '完成背诵并确认' : '标记为完成'}</Text></Pressable> : isDone ? <View style={styles.done}><CheckCircle2 size={18} color={colors.success} /><Text style={styles.doneText}>已完成</Text></View> : null}</ScrollView></AppScreen>;
}

const styles = StyleSheet.create({
  header: {height: 56, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerSide: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}, headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.ink},
  content: {padding: 16, paddingBottom: 32}, hero: {borderRadius: radius.lg, padding: 20, backgroundColor: colors.surface, alignItems: 'center'}, heroIcon: {width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight}, title: {fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.ink, textAlign: 'center', marginTop: 12},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10}, typeBadge: {fontSize: 11, color: colors.brand, backgroundColor: colors.brandLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5}, meta: {fontSize: 12, color: colors.muted}, card: {borderRadius: radius.md, padding: 16, marginTop: 12, backgroundColor: colors.surface}, sectionTitle: {fontSize: 14, fontWeight: '700', color: colors.ink}, description: {fontSize: 14, lineHeight: 23, color: colors.body, marginTop: 8},
  assetList: {marginTop: 12, gap: 12}, assetImage: {width: '100%', height: 220, borderRadius: radius.md, backgroundColor: colors.page}, htmlLink: {marginTop: 14, paddingVertical: 12, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.brandLight}, htmlLinkText: {fontSize: 14, fontWeight: '700', color: colors.brand}, locked: {marginTop: 12, padding: 13, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.line}, lockedText: {fontSize: 12, color: colors.muted},
  primaryButton: {height: 48, marginTop: 20, borderRadius: radius.md, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}, primaryText: {fontSize: 14, fontWeight: '700', color: colors.surface}, done: {height: 48, marginTop: 20, borderRadius: radius.md, backgroundColor: '#EAF8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}, doneText: {fontSize: 14, fontWeight: '700', color: colors.success}, pressed: {opacity: 0.75},
});
