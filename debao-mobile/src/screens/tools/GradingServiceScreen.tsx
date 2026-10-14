import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {BookOpenText, ChevronRight, History, RefreshCw, Upload} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {RemoteState} from '@/components/ui';
import {colors, radius, shadows} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {gradingService} from '@/services';
import type {GradingPaper, GradingSubmission} from '@/services';
import {environment} from '@/config/environment';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * The mock state intentionally mirrors the RC prototype.  The prototype has
 * a direct answer-upload entry and two history rows; it does not expose the
 * newer paper catalog.  The catalog is still available in real API mode
 * below, where it is needed to start a paper-based grading flow.
 */
const prototypeRecords = [
  {
    id: 'g1',
    title: '民法·股权转让案例',
    year: '2023',
    status: '已批改',
    score: '38/50',
    feedback: '论点清晰，法条引用准确，建议加强对抗辩权的分析。',
  },
  {
    id: 'g2',
    title: '合同解除与违约责任',
    year: '2022',
    status: '待批改',
    score: undefined,
    feedback: undefined,
  },
] as const;

const statusLabels: Record<string, string> = {
  submitted: '已提交',
  ai_queued: '等待 AI',
  ai_processing: 'AI 批改中',
  ai_completed: 'AI 已完成',
  ai_failed: 'AI 异常',
  manual_queued: '等待人工',
  manual_claimed: '人工批改中',
  manual_submitted: '等待发布',
  supervisor_review: '主管复核',
  manual_returned: '需要补充',
  manual_expired: '重新分配',
  published: '已批改',
  appealed: '申诉中',
  cancelled: '已取消',
  completed: '已批改',
  rejected: '已拒绝',
  queued: '待批改',
  processing: '批改中',
};

function subjectName(id: string) {
  return id === 'civil' ? '民法' : id === 'criminal' ? '刑法' : id;
}

const demoPaperFallback: GradingPaper[] = [
  {
    id: 'grading-paper-civil',
    title: '2026 民法主观题专项套卷（一）',
    subjectId: 'civil',
    year: '2026',
    totalScore: 40,
    questionIds: ['subjective-demo-1', 'subjective-demo-2'],
    questionCount: 2,
  },
  {
    id: 'grading-paper-criminal',
    title: '2026 刑法主观题专项套卷（一）',
    subjectId: 'criminal',
    year: '2026',
    totalScore: 20,
    questionIds: ['subjective-demo-3'],
    questionCount: 1,
  },
];

const demoRecordFallback: GradingSubmission[] = [
  {
    id: 'gsub-demo-queued',
    paperId: 'grading-paper-civil',
    paperTitle: '2026 民法主观题专项套卷（一）',
    questionTitle: '民法案例分析：房屋买卖与租赁',
    status: 'manual_queued',
    createdAt: '2026-08-30T09:20:00.000Z',
  },
  {
    id: 'gsub-demo-published',
    paperId: 'grading-paper-civil',
    paperTitle: '2026 民法主观题专项套卷（一）',
    questionTitle: '民法案例分析：合同解除与违约责任',
    status: 'published',
    score: 16,
    maxScore: 20,
    feedback: '论点清晰，法条引用准确。',
    latestReportId: 'greport-demo-published',
    createdAt: '2026-08-27T10:00:00.000Z',
  },
];

export default function GradingServiceScreen() {
  const navigation = useNavigation<Navigation>();
  const [papers, setPapers] = useState<GradingPaper[]>(environment.useMocks ? demoPaperFallback : []);
  const [records, setRecords] = useState<GradingSubmission[]>(environment.useMocks ? demoRecordFallback : []);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    try {
      const [paperItems, recordItems] = await Promise.all([
        gradingService.papers ? gradingService.papers() : Promise.resolve([]),
        gradingService.list(),
      ]);
      setPapers(paperItems);
      setRecords(recordItems);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '批改服务加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const hasData = papers.length > 0 || records.length > 0;
  const usedCount = environment.useMocks ? 2 : records.length;

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="grading-service-screen">
      <PageHeader title="批改服务" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading || (error && !hasData) ? (
          <RemoteState
            testID="grading-service-state"
            loading={loading}
            error={error}
            loadingLabel="正在加载批改服务..."
            emptyTitle="暂无批改内容"
            emptyDescription="可批改套卷和历史记录会显示在这里。"
            onRetry={load}
          />
        ) : (
          <>
            {error ? (
              <View testID="grading-service-inline-error" style={styles.inlineError}>
                <Text accessibilityRole="alert" style={styles.inlineErrorText}>{error}</Text>
                <Pressable testID="grading-service-retry" onPress={load} style={styles.retry}>
                  <RefreshCw size={14} color={colors.brand} />
                  <Text style={styles.retryText}>重新加载</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageTitle}>批改次数</Text>
                <Text style={styles.remaining}>剩余 {Math.max(0, 10 - usedCount)} 次</Text>
              </View>
              <View style={styles.progressTrack} testID="grading-progress-track">
                <View testID="grading-progress-fill" style={[styles.progressFill, {width: `${Math.min(100, usedCount * 10)}%`}]} />
              </View>
              <Text style={styles.usageMeta}>已使用 {usedCount} 次 / 共 10 次（含课程权益）</Text>
            </View>

            {environment.useMocks ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('SubjectiveAnswer', {questionIndex: 0, subjectName: '民法'})}
                style={({pressed}) => [styles.submitCard, pressed && styles.pressed]}
                testID="grading-submit">
                <Upload color={colors.brand} size={22} />
                <Text style={styles.submitTitle}>提交主观题答案批改</Text>
                <Text style={styles.submitDescription}>选择题目后提交您的书面答案，24小时内反馈</Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionLabel}>可批改套卷</Text>
                  <Text style={styles.sectionHint}>先选套卷，再逐题作答</Text>
                </View>
                {papers.length ? papers.map(paper => (
                  <Pressable
                    key={paper.id}
                    testID={`grading-paper-${paper.id}`}
                    onPress={() => navigation.navigate('GradingPaperDetail', {paperId: paper.id})}
                    style={({pressed}) => [styles.paperCard, pressed && styles.pressed]}>
                    <View style={styles.paperIcon}><BookOpenText color={colors.brand} size={21} /></View>
                    <View style={styles.paperBody}>
                      <Text style={styles.paperTitle}>{paper.title}</Text>
                      <Text style={styles.paperMeta}>{subjectName(paper.subjectId)} · {paper.questionCount} 道题 · 满分 {paper.totalScore} 分</Text>
                    </View>
                    <ChevronRight size={18} color={colors.muted} />
                  </Pressable>
                )) : (
                  <View testID="grading-paper-empty" style={styles.empty}><Text style={styles.muted}>暂无可批改套卷</Text></View>
                )}
              </>
            )}

            <View style={styles.historySection}>
              <View style={styles.historyHeading}>
                <Text style={styles.sectionLabel}>批改记录</Text>
                {!environment.useMocks ? <History size={16} color={colors.muted} /> : null}
              </View>
              <View style={styles.historyCard}>
                {environment.useMocks ? prototypeRecords.map((record, index) => (
                  <View
                    key={record.id}
                    style={[styles.record, index < prototypeRecords.length - 1 && styles.divider]}
                    testID={`grading-record-${record.id}`}>
                    <View style={styles.recordMetaRow}>
                      <View style={[styles.status, record.status === '已批改' ? styles.completedStatus : styles.pendingStatus]}>
                        <Text style={[styles.statusText, record.status === '已批改' ? styles.completedText : styles.pendingText]}>{record.status}</Text>
                      </View>
                      <Text style={styles.year}>{record.year}年真题</Text>
                      {record.score ? <Text style={styles.score}>{record.score}</Text> : null}
                    </View>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    {record.feedback ? <Text style={styles.feedback}>{record.feedback}</Text> : null}
                  </View>
                )) : records.length ? records.map((record, index) => {
                  const published = record.status === 'published';
                  return (
                    <Pressable
                      key={record.id}
                      disabled={!published}
                      onPress={() => navigation.navigate('GradingReport', {submissionId: record.id})}
                      style={({pressed}) => [styles.record, index < records.length - 1 && styles.divider, pressed && styles.pressed]}
                      testID={`grading-record-${record.id}`}>
                      <View style={styles.recordMetaRow}>
                        <View style={[styles.status, published ? styles.completedStatus : styles.pendingStatus]}>
                          <Text style={[styles.statusText, published ? styles.completedText : styles.pendingText]}>{statusLabels[record.status] ?? record.status}</Text>
                        </View>
                        <Text style={styles.year}>{new Date(record.createdAt).getFullYear()}年真题</Text>
                        {record.score !== undefined ? <Text style={styles.score}>{record.score}/{record.maxScore ?? ''}</Text> : null}
                        {published ? <ChevronRight size={16} color={colors.muted} /> : null}
                      </View>
                      <Text style={styles.recordTitle}>{record.questionTitle ?? record.paperTitle ?? record.questionId ?? '文件答案批改'}</Text>
                      {record.feedback ? <Text style={styles.feedback}>{record.feedback}</Text> : null}
                    </Pressable>
                  );
                }) : (
                  <View testID="grading-record-empty" style={styles.emptyHistory}><Text style={styles.muted}>完成套卷后，批改记录会显示在这里</Text></View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 24},
  usageCard: {marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, padding: 16, backgroundColor: colors.surface, ...shadows.card},
  usageHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  usageTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  remaining: {fontSize: 13, fontWeight: '600', color: colors.brand},
  progressTrack: {height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8, backgroundColor: colors.line},
  progressFill: {height: '100%', borderRadius: 3, backgroundColor: colors.brand},
  usageMeta: {fontSize: 11, color: colors.muted, marginTop: 6},
  submitCard: {minHeight: 110, marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.brand, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surface},
  submitTitle: {fontSize: 14, fontWeight: '600', color: colors.brand},
  submitDescription: {fontSize: 12, color: colors.muted, textAlign: 'center'},
  historySection: {marginHorizontal: 16, marginTop: 12},
  historyHeading: {height: 18, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sectionHead: {marginHorizontal: 16, marginTop: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 7},
  sectionLabel: {fontSize: 12, color: colors.muted},
  sectionHint: {fontSize: 11, color: colors.muted, marginLeft: 'auto'},
  paperCard: {minHeight: 78, marginHorizontal: 16, marginBottom: 8, borderRadius: radius.md, padding: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12},
  paperIcon: {width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight},
  paperBody: {flex: 1, gap: 5},
  paperTitle: {fontSize: 14, color: colors.ink, fontWeight: '600'},
  paperMeta: {fontSize: 11, color: colors.muted},
  historyCard: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  record: {padding: 16},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  recordMetaRow: {minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  status: {borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2},
  completedStatus: {backgroundColor: colors.mint},
  pendingStatus: {backgroundColor: colors.gold},
  statusText: {fontSize: 11, fontWeight: '500'},
  completedText: {color: colors.success},
  pendingText: {color: '#A87000'},
  year: {fontSize: 11, color: colors.muted},
  score: {fontSize: 13, fontWeight: '700', color: colors.brand, marginLeft: 'auto'},
  recordTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  feedback: {fontSize: 12, lineHeight: 19, color: colors.body, marginTop: 8, borderRadius: radius.sm, padding: 10, backgroundColor: colors.page},
  inlineError: {marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: radius.md, backgroundColor: colors.apricot, gap: 8},
  inlineErrorText: {fontSize: 12, lineHeight: 18, color: colors.error},
  retry: {height: 36, alignSelf: 'flex-start', paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface},
  retryText: {fontSize: 12, fontWeight: '700', color: colors.brand},
  empty: {marginHorizontal: 16, padding: 28, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md},
  emptyHistory: {padding: 26, alignItems: 'center'},
  muted: {fontSize: 13, color: colors.muted},
  pressed: {opacity: 0.72},
});
