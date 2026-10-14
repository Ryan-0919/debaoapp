import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, Clock3, FileText} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {RemoteState} from '@/components/ui';
import {colors, radius} from '@/theme';
import {gradingService} from '@/services';
import type {GradingPaper} from '@/services';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'GradingPaperDetail'>;

export default function GradingPaperDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [paper, setPaper] = useState<GradingPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!gradingService.paper) throw new Error('当前服务暂不支持加载套卷');
      const value = await gradingService.paper(route.params.paperId);
      setPaper(value);
    } catch (reason) {
      setPaper(null);
      setError(reason instanceof Error ? reason.message : '套卷加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [route.params.paperId]);
  useEffect(() => { load().catch(() => undefined); }, [load]);
  return <AppScreen backgroundColor={colors.page} scroll={false} testID="grading-paper-detail-screen">
    <PageHeader title="套卷详情" />
    {loading || error ? <RemoteState testID="grading-paper-detail-state" loading={loading} error={error} loadingLabel="正在加载套卷..." emptyTitle="套卷不存在或已下架" emptyDescription="请返回批改服务重新选择套卷。" onRetry={load} /> : !paper ? <RemoteState testID="grading-paper-detail-state" empty emptyTitle="套卷不存在或已下架" emptyDescription="请返回批改服务重新选择套卷。" onRetry={load} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}><Text style={styles.subject}>{paper.subjectId === 'civil' ? '民法' : paper.subjectId === 'criminal' ? '刑法' : paper.subjectId}</Text><Text style={styles.title}>{paper.title}</Text><Text style={styles.meta}>{paper.year ?? '专项'} · {paper.questions?.length ?? paper.questionCount} 道题 · 满分 {paper.totalScore} 分</Text></View>
      <Text style={styles.section}>题目列表</Text>
      {(paper.questions ?? []).length ? (paper.questions ?? []).map((question, index) => <Pressable key={question.id} testID={`grading-paper-question-${question.id}`} onPress={() => navigation.navigate('SubjectiveAnswer', {subjectName: question.subjectId === 'civil' ? '民法' : question.subjectId === 'criminal' ? '刑法' : question.subjectId, gradingPaperId: paper.id, gradingQuestionId: question.id, questionIndex: 0})} style={({pressed}) => [styles.question, pressed && styles.pressed]}>
        <View style={styles.questionNo}><Text style={styles.questionNoText}>{index + 1}</Text></View><View style={styles.questionBody}><Text style={styles.questionTitle}>{question.title}</Text><View style={styles.questionMeta}><Clock3 size={12} color={colors.muted} /><Text style={styles.questionMetaText}> {question.suggestedMinutes} 分钟 · {question.totalScore} 分</Text></View></View><ChevronRight size={18} color={colors.muted} />
      </Pressable>) : <View testID="grading-paper-question-empty" style={styles.empty}><Text style={styles.muted}>该套卷暂未配置题目</Text></View>}
      <View style={styles.tip}><FileText size={16} color={colors.brand} /><Text style={styles.tipText}>每道题独立提交批改，不会重复扣除未提交题目的次数。作答时可随时查询法条。</Text></View>
    </ScrollView>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  content: {padding: 16, paddingBottom: 28},
  hero: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 18},
  subject: {fontSize: 12, color: colors.brand, fontWeight: '700', marginBottom: 8},
  title: {fontSize: 20, lineHeight: 28, color: colors.ink, fontWeight: '700'},
  meta: {fontSize: 12, color: colors.muted, marginTop: 10},
  section: {fontSize: 13, color: colors.muted, marginTop: 20, marginBottom: 8},
  question: {minHeight: 76, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8},
  questionNo: {width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  questionNoText: {fontSize: 14, fontWeight: '700', color: colors.brand},
  questionBody: {flex: 1, gap: 6}, questionTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  questionMeta: {flexDirection: 'row', alignItems: 'center'}, questionMetaText: {fontSize: 11, color: colors.muted},
  tip: {marginTop: 12, padding: 12, borderRadius: radius.sm, backgroundColor: colors.brandLight, flexDirection: 'row', gap: 8}, tipText: {flex: 1, fontSize: 12, lineHeight: 18, color: colors.body},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'}, empty: {padding: 24, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center'}, muted: {fontSize: 14, color: colors.muted}, pressed: {opacity: 0.7},
});
