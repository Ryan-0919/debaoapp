import {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {BookOpenCheck, ChevronRight, ClipboardCheck, GraduationCap, LockKeyhole, Target} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, RemoteState} from '@/components/ui';
import {learningService} from '@/services';
import type {LearningDiagnosticState} from '@/services/contracts';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function LearningCenterScreen() {
  const navigation = useNavigation<Navigation>();
  const [state, setState] = useState<LearningDiagnosticState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    learningService.diagnostic().then(setState).catch(reason => setError(reason instanceof Error ? reason.message : '学习中心加载失败')).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <AppScreen testID="learning-center-screen">
      <PageHeader title="得恩私教" subtitle="你的个性化法考学习方案" />
      {loading || error ? <RemoteState testID="learning-center-state" loading={loading} error={error} onRetry={load} /> : (
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Target color={colors.surface} size={27} /></View>
            <Text style={styles.eyebrow}>{state?.form?.title ?? '得恩私教'} · 第一步</Text>
            <Text style={styles.title}>{state?.completed ? state.form?.successTitle ?? '已完成首次学习诊断' : state?.form?.subtitle ?? '先了解你，再制定学习方案'}</Text>
            <Text style={styles.description}>{state?.completed ? state.form?.successDescription ?? '你的初始学习画像已经生成。后续将结合学习数据持续调整。' : state?.form?.description ?? '通过一组选择题了解你的基础、时间和学习习惯，预计 5 分钟完成。'}</Text>
          </View>

          {state?.access === 'locked' ? (
            <View style={styles.lockedCard}>
              <LockKeyhole color={colors.brand} size={22} />
              <View style={styles.flex}><Text style={styles.cardTitle}>尚未开通得恩私教</Text><Text style={styles.cardText}>购买后可进行首次诊断，并逐步获得专属学习画像和计划。</Text></View>
              <AppButton label="查看产品" onPress={() => navigation.navigate('ProductDetail', {productId: state.productId})} />
            </View>
          ) : state?.completed && state.result ? (
            <>
              <View style={styles.resultCard}>
                <View style={styles.resultHeading}><BookOpenCheck color={colors.success} size={22} /><Text style={styles.cardTitle}>初始画像已生成</Text></View>
                {Object.entries(state.result.scores).filter(([, value]) => value > 0).map(([key, value]) => <View key={key} style={styles.scoreRow}><Text style={styles.scoreName}>{state.dimensions?.find(item => item.code === key)?.label ?? dimensionLabels[key] ?? key}</Text><View style={styles.track}><View style={[styles.fill, {width: `${value}%`}]} /></View><Text style={styles.score}>{value}</Text></View>)}
                <Text style={styles.timestamp}>完成时间：{new Date(state.result.submittedAt).toLocaleString()}</Text>
              </View>
              {state.result.assignment ? (
                <View style={styles.coachCard}>
                  <View style={styles.coachIcon}><GraduationCap color={colors.brand} size={22} /></View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{state.result.assignment.status === 'assigned' ? '你的专属学习老师' : '老师分配处理中'}</Text>
                    {state.classType ? <Text style={styles.coachStage}>当前班型：{state.classType.name}</Text> : null}
                    {state.result.assignment.stage ? <Text style={styles.coachStage}>当前阶段：{state.result.assignment.stage.name}</Text> : null}
                    {state.result.assignment.teacher ? <><Text style={styles.coachName}>{state.result.assignment.teacher.name} · {state.result.assignment.teacher.subject}</Text><Text style={styles.cardText}>{state.result.assignment.teacher.specialty}</Text></> : <Text style={styles.cardText}>当前阶段暂未配置老师，管理员完成配置后会自动分配。</Text>}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LearningDiagnostic')} style={({pressed}) => [styles.startCard, pressed && styles.pressed]}>
              <View style={styles.stepIcon}><ClipboardCheck color={colors.brand} size={22} /></View>
              <View style={styles.flex}><Text style={styles.cardTitle}>首次学习诊断</Text><Text style={styles.cardText}>{state?.questions.length ?? 0} 道画像选择题 · 完成后生成初始画像</Text></View>
              <ChevronRight color={colors.muted} size={20} />
            </Pressable>
          )}

          <View style={styles.note}><Text style={styles.noteTitle}>诊断说明</Text><Text style={styles.noteText}>请按真实情况作答。答案没有对错之分，只用于为你安排合适的学习节奏。提交后，首次诊断结果会保留，避免学习方案反复变化。</Text></View>
        </View>
      )}
    </AppScreen>
  );
}

const dimensionLabels: Record<string, string> = {foundation: '学习基础', time: '时间投入', discipline: '执行能力', comprehension: '理解能力', memory: '记忆能力', practice: '练习习惯'};
const styles = StyleSheet.create({
  content: {padding: spacing.lg, gap: spacing.md},
  hero: {backgroundColor: '#26236F', borderRadius: radius.md, padding: spacing.xxl, minHeight: 210},
  heroIcon: {width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg},
  eyebrow: {color: '#C9C8FF', fontSize: 12, fontWeight: '700'},
  title: {color: colors.surface, fontSize: 24, lineHeight: 32, fontWeight: '800', marginTop: spacing.sm},
  description: {color: '#D8D8EE', fontSize: 14, lineHeight: 22, marginTop: spacing.md},
  lockedCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md},
  startCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  stepIcon: {width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  flex: {flex: 1, minWidth: 0},
  cardTitle: {color: colors.ink, fontSize: 16, fontWeight: '800'},
  cardText: {color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 5},
  resultCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg},
  coachCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md},
  coachIcon: {width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  coachStage: {color: colors.brand, fontSize: 12, fontWeight: '700', marginTop: spacing.sm},
  coachName: {color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: spacing.sm},
  resultHeading: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg},
  scoreRow: {height: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  scoreName: {width: 64, color: colors.body, fontSize: 12},
  track: {flex: 1, height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.line},
  fill: {height: '100%', backgroundColor: colors.brand, borderRadius: 4},
  score: {width: 24, textAlign: 'right', color: colors.ink, fontWeight: '700', fontSize: 12},
  timestamp: {color: colors.muted, fontSize: 11, marginTop: spacing.md},
  note: {padding: spacing.lg},
  noteTitle: {color: colors.ink, fontSize: 13, fontWeight: '700'},
  noteText: {color: colors.muted, fontSize: 12, lineHeight: 20, marginTop: spacing.sm},
  pressed: {opacity: 0.68},
});
