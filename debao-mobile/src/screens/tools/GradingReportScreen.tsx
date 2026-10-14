import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {AlertCircle, CheckCircle2, CircleDot, XCircle} from 'lucide-react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {RemoteState} from '@/components/ui';
import {colors, radius} from '@/theme';
import {gradingService} from '@/services';
import type {GradingAnswerAnnotation, GradingReport} from '@/services';
import type {RootStackParamList} from '@/types/navigation';

type ScreenRoute = RouteProp<RootStackParamList, 'GradingReport'>;
const statusMeta = {
  hit: {label: '命中', color: colors.success, Icon: CheckCircle2},
  partial: {label: '部分命中', color: colors.warning, Icon: CircleDot},
  missed: {label: '遗漏', color: colors.error, Icon: XCircle},
} as const;

function AnnotatedAnswer({text, annotations, onSelect}: {text: string; annotations: GradingAnswerAnnotation[]; onSelect: (item: GradingAnswerAnnotation) => void}) {
  const sorted = [...annotations].sort((left, right) => left.start - right.start);
  const pieces: React.ReactNode[] = []; let cursor = 0;
  sorted.forEach(item => {
    if (item.start < cursor || item.end > text.length) return;
    if (item.start > cursor) pieces.push(<Text key={`plain-${cursor}`}>{text.slice(cursor, item.start)}</Text>);
    const markStyle = item.type === 'error' ? styles.errorMark : item.type === 'highlight' ? styles.highlightMark : item.type === 'comment' ? styles.commentMark : styles.correctMark;
    const marker = item.type === 'correct' && item.scoreDelta === 0 ? <Text style={[styles.annotationSymbol, styles.correctSymbol]}>✓</Text> : item.type === 'score' ? <Text style={[styles.annotationSymbol, styles.correctSymbol]}>+{Math.abs(item.scoreDelta ?? 0)}</Text> : item.type === 'error' ? <Text style={[styles.annotationSymbol, styles.errorSymbol]}>-{Math.abs(item.scoreDelta ?? 0)}</Text> : null;
    pieces.push(<Text key={item.id} style={markStyle} onPress={() => onSelect(item)}>{marker}{marker ? ' ' : ''}{text.slice(item.start, item.end)}</Text>); cursor = item.end;
  });
  if (cursor < text.length) pieces.push(<Text key={`plain-${cursor}`}>{text.slice(cursor)}</Text>);
  return <Text style={styles.answerText}>{pieces}</Text>;
}

export default function GradingReportScreen() {
  const route = useRoute<ScreenRoute>(); const [report, setReport] = useState<GradingReport | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selectedAnnotation, setSelectedAnnotation] = useState<GradingAnswerAnnotation | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!gradingService.report) throw new Error('当前服务暂不支持加载批改报告');
      setReport(await gradingService.report(route.params.submissionId));
    } catch (reason) {
      setReport(null);
      setError(reason instanceof Error ? reason.message : '报告加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [route.params.submissionId]);
  useEffect(() => { load().catch(() => undefined); }, [load]);
  return <AppScreen backgroundColor={colors.page} scroll={false} testID="grading-report-screen"><PageHeader title="批改报告" />{loading || error ? <RemoteState testID="grading-report-state" loading={loading} error={error} loadingLabel="正在加载报告..." emptyTitle="报告尚未发布" emptyDescription="报告发布后会显示在这里，请稍后再查看。" onRetry={load} /> : !report ? <RemoteState testID="grading-report-state" empty emptyTitle="报告尚未发布" emptyDescription="报告发布后会显示在这里，请稍后再查看。" onRetry={load} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.scoreCard}><Text style={styles.scoreLabel}>最终得分</Text><Text style={styles.score}>{report.totalScore}<Text style={styles.max}> / {report.maxScore}</Text></Text><Text style={styles.published}>报告发布时间：{new Date(report.publishedAt).toLocaleString('zh-CN', {hour12: false})}</Text></View>
    {report.answers.length > 0 ? <><Text style={styles.section}>老师原文批注</Text><View style={styles.legend}><View style={styles.legendItem}><View style={[styles.legendLine, {backgroundColor: colors.brand}]} /><Text style={styles.legendText}>划线</Text></View><View style={styles.legendItem}><Text style={[styles.legendSymbol, {color: colors.brand}]}>✓</Text><Text style={styles.legendText}>正确</Text></View><View style={styles.legendItem}><Text style={[styles.legendSymbol, {color: colors.brand}]}>+N</Text><Text style={styles.legendText}>加分</Text></View><View style={styles.legendItem}><Text style={[styles.legendSymbol, {color: colors.error}]}>-N</Text><Text style={styles.legendText}>错误扣分</Text></View><View style={styles.legendItem}><View style={[styles.legendSwatch, {backgroundColor: colors.gold}]} /><Text style={styles.legendText}>重点</Text></View></View>{report.answers.map((answer, index) => { const answerAnnotations = report.answerAnnotations.filter(item => item.subQuestionId === answer.subQuestionId); return <View key={answer.subQuestionId} style={styles.answerBlock}><Text style={styles.answerTitle}>第 {index + 1} 问</Text><AnnotatedAnswer text={answer.text} annotations={answerAnnotations} onSelect={setSelectedAnnotation} />{answerAnnotations.filter(item => item.comment).map((item, noteIndex) => <Pressable key={item.id} onPress={() => setSelectedAnnotation(item)} style={styles.annotationNote}><Text style={styles.noteIndex}>{noteIndex + 1}</Text><Text style={styles.noteText}>{item.comment}</Text></Pressable>)}</View>; })}{selectedAnnotation?.comment ? <View style={styles.selectedComment}><Text style={styles.selectedQuote}>“{selectedAnnotation.quote}”</Text>{selectedAnnotation.type === 'error' && selectedAnnotation.scoreDelta ? <Text style={styles.selectedPenalty}>扣分 {Math.abs(selectedAnnotation.scoreDelta)} 分</Text> : null}{selectedAnnotation.type === 'score' && selectedAnnotation.scoreDelta ? <Text style={styles.selectedReward}>加分 {Math.abs(selectedAnnotation.scoreDelta)} 分</Text> : null}<Text style={styles.selectedText}>{selectedAnnotation.comment}</Text></View> : null}</> : null}
    {report.missedPointIds.length > 0 ? <View style={styles.missedSummary}><AlertCircle size={18} color={colors.error} /><View style={styles.missedCopy}><Text style={styles.missedTitle}>遗漏 {report.missedPointIds.length} 个采分点</Text><Text style={styles.missedText}>{report.pointResults.filter(point => report.missedPointIds.includes(point.pointId)).map(point => point.title).join('、')}</Text></View></View> : null}
    <Text style={styles.section}>采分点明细</Text>{report.pointResults.map(point => { const meta = statusMeta[point.status]; const Icon = meta.Icon; return <View key={point.pointId} style={[styles.point, point.status === 'missed' && styles.missedPoint]}><View style={styles.pointHeader}><Icon size={17} color={meta.color} /><Text style={styles.pointTitle}>{point.title}</Text><View style={[styles.statusBadge, {borderColor: meta.color}]}><Text style={[styles.statusText, {color: meta.color}]}>{meta.label}</Text></View><Text style={styles.pointScore}>{point.score}/{point.maxScore}</Text></View>{point.comment ? <Text style={styles.comment}>{point.comment}</Text> : null}{point.evidence ? <Text style={styles.evidence}>依据：{point.evidence}</Text> : null}</View>; })}
    <View style={styles.block}><Text style={styles.blockTitle}>老师评语</Text><Text style={styles.blockText}>{report.feedback}</Text></View><View style={styles.block}><Text style={styles.blockTitle}>改进建议</Text><Text style={styles.blockText}>{report.improvementAdvice}</Text></View>
  </ScrollView>}</AppScreen>;
}

const styles = StyleSheet.create({content: {padding: 16, paddingBottom: 30}, scoreCard: {backgroundColor: colors.brand, borderRadius: radius.md, padding: 20}, scoreLabel: {fontSize: 12, color: 'rgba(255,255,255,0.78)'}, score: {fontSize: 42, lineHeight: 52, color: colors.surface, fontWeight: '800', marginTop: 4}, max: {fontSize: 18, fontWeight: '600'}, published: {fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 8}, section: {fontSize: 13, color: colors.muted, marginTop: 20, marginBottom: 8}, legend: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8}, legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5}, legendLine: {width: 14, height: 2}, legendSwatch: {width: 14, height: 8}, legendSymbol: {fontSize: 12, fontWeight: '800'}, legendText: {fontSize: 11, color: colors.muted}, answerBlock: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 8}, answerTitle: {fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 7}, answerText: {fontSize: 14, lineHeight: 25, color: colors.ink}, annotationSymbol: {position: 'relative', top: -5, fontSize: 10, lineHeight: 11, fontWeight: '800'}, correctSymbol: {color: colors.brand}, errorSymbol: {color: colors.error}, correctMark: {color: colors.brand, textDecorationLine: 'underline'}, errorMark: {color: colors.error, textDecorationLine: 'underline'}, highlightMark: {backgroundColor: colors.gold}, commentMark: {color: colors.error, textDecorationLine: 'underline'}, annotationNote: {flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 9, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, noteIndex: {width: 18, height: 18, borderRadius: 9, textAlign: 'center', lineHeight: 18, fontSize: 10, color: colors.surface, backgroundColor: colors.brand, fontWeight: '700'}, noteText: {flex: 1, fontSize: 12, lineHeight: 18, color: colors.body}, selectedComment: {padding: 12, backgroundColor: colors.brandLight, borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: colors.brand}, selectedQuote: {fontSize: 12, color: colors.brand, fontWeight: '700'}, selectedPenalty: {fontSize: 12, color: colors.error, fontWeight: '700', marginTop: 4}, selectedReward: {fontSize: 12, color: colors.success, fontWeight: '700', marginTop: 4}, selectedText: {fontSize: 13, color: colors.ink, lineHeight: 20, marginTop: 4}, missedSummary: {flexDirection: 'row', gap: 10, padding: 14, backgroundColor: colors.apricot, borderRadius: radius.md, marginTop: 16}, missedCopy: {flex: 1}, missedTitle: {fontSize: 14, color: colors.error, fontWeight: '700'}, missedText: {fontSize: 12, color: colors.body, lineHeight: 18, marginTop: 3}, point: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 8}, missedPoint: {backgroundColor: colors.apricot}, pointHeader: {flexDirection: 'row', alignItems: 'center', gap: 7}, pointTitle: {flex: 1, fontSize: 14, color: colors.ink, fontWeight: '600'}, pointScore: {fontSize: 14, color: colors.brand, fontWeight: '700'}, statusBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, borderWidth: 1}, statusText: {fontSize: 10, fontWeight: '700'}, comment: {fontSize: 12, color: colors.body, lineHeight: 19, marginTop: 8, paddingLeft: 24}, evidence: {fontSize: 11, color: colors.muted, lineHeight: 18, marginTop: 4, paddingLeft: 24}, block: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginTop: 8}, blockTitle: {fontSize: 14, color: colors.ink, fontWeight: '700', marginBottom: 8}, blockText: {fontSize: 13, lineHeight: 21, color: colors.body}, center: {flex: 1, alignItems: 'center', justifyContent: 'center'}, muted: {fontSize: 14, color: colors.muted}});
