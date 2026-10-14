import {useCallback, useEffect, useState} from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, ChevronLeft, Headphones, PlayCircle, XCircle} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {RemoteState} from '@/components/ui';
import {OBJECTIVE_QUESTIONS} from '@/data/objectiveQuestions';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {questionService} from '@/services';
import type {ObjectiveReport, QuestionSubmissionReport} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ObjectiveReport'>;

const REVIEW_ANSWERS = ['D', 'B', 'A', 'A'];
const mediaUrl = (reference: string) => /^https?:\/\//i.test(reference) ? reference : `${environment.apiBaseUrl.replace(/\/v1\/?$/, '')}${reference}`;

function submissionReportToObjectiveReport(snapshot: QuestionSubmissionReport): ObjectiveReport {
  const correctAnswers = snapshot.correctAnswers ?? [];
  const answers = snapshot.answers ?? [];
  return {
    id: `submission-report:${snapshot.id}`,
    sessionId: snapshot.id,
    mode: 'chapter',
    title: `题目 ${snapshot.questionId}`,
    total: 1,
    answered: answers.length ? 1 : 0,
    correct: snapshot.correct ? 1 : 0,
    score: snapshot.correct ? 100 : 0,
    maxScore: 100,
    results: [{
      questionId: snapshot.questionId,
      ...(snapshot.subjectId ? {subjectId: snapshot.subjectId} : {}),
      stem: snapshot.stem,
      options: snapshot.options,
      ...(snapshot.questionType ? {questionType: snapshot.questionType} : {}),
      version: snapshot.version,
      answers,
      correctAnswers,
      correct: snapshot.correct,
      analysis: snapshot.analysis,
    }],
    subjectStats: snapshot.subjectId ? [{subjectId: snapshot.subjectId, total: 1, correct: snapshot.correct ? 1 : 0, correctRate: snapshot.correct ? 100 : 0}] : [],
    submittedAt: snapshot.createdAt,
  };
}

export default function ObjectiveReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const sessionId = route.params?.sessionId;
  const submissionId = route.params?.submissionId;
  const remoteMode = !environment.useMocks && (
    (Boolean(sessionId) && typeof questionService.getSessionReport === 'function')
    || (Boolean(submissionId) && typeof questionService.getSubmissionReport === 'function')
  );
  const [report, setReport] = useState<ObjectiveReport | null>(null);
  const [loading, setLoading] = useState(remoteMode);
  const [error, setError] = useState('');
  const loadReport = useCallback(async () => {
    if (!remoteMode) return;
    setLoading(true);
    setError('');
    try {
      if (sessionId && questionService.getSessionReport) {
        setReport(await questionService.getSessionReport(sessionId));
      } else if (submissionId && questionService.getSubmissionReport) {
        const snapshot = await questionService.getSubmissionReport(submissionId);
        setReport(submissionReportToObjectiveReport(snapshot));
      }
    } catch (reason) {
      setReport(null);
      setError(reason instanceof Error ? reason.message : '答题报告加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [remoteMode, sessionId, submissionId]);
  useEffect(() => { loadReport().catch(() => undefined); }, [loadReport]);

  const total = report?.total ?? route.params?.total ?? 0;
  const correct = report?.correct ?? Math.min(route.params?.correct ?? 0, total);
  const wrong = Math.max(0, total - correct);
  const score = report?.score ?? (total ? Math.round((correct / total) * 100) : 0);
  const remoteEmpty = remoteMode && !loading && !error && !report;

  return (
    <AppScreen scroll={false} testID="objective-report-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" testID="objective-report-back" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerSide}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>答题报告</Text>
        <View style={styles.headerSide} />
      </View>

      {remoteMode && (loading || error || remoteEmpty) ? (
        <RemoteState
          testID="objective-report-state"
          loading={loading}
          error={error}
          empty={remoteEmpty}
          loadingLabel="正在加载答题报告..."
          emptyTitle="暂无答题报告"
          emptyDescription="交卷完成后，报告会显示在这里。"
          onRetry={loadReport}
        />
      ) : <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreRing}>
            <Text testID="objective-report-score" style={styles.score}>{score}</Text>
            <Text style={styles.scoreUnit}>分</Text>
          </View>
          <Text style={styles.scoreLabel}>本次得分</Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, styles.correct]}>{correct}</Text>
              <Text style={styles.metricLabel}>答对</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, styles.wrong]}>{wrong}</Text>
              <Text style={styles.metricLabel}>答错</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{total}</Text>
              <Text style={styles.metricLabel}>总题数</Text>
            </View>
          </View>
        </View>

        <View style={styles.subjectCard}>
          <Text style={styles.sectionTitle}>科目分析</Text>
          {report?.subjectStats?.length ? report.subjectStats.map((item, index) => (
            <SubjectProgress key={item.subjectId} name={item.subjectId} value={`${item.correct}/${item.total}`} progress={item.total ? item.correct / item.total : 0} color={item.correctRate >= 60 ? colors.success : colors.error} last={index === report.subjectStats.length - 1} />
          )) : <>
            <SubjectProgress name="民法" value="2/3" progress={2 / 3} color={colors.error} />
            <SubjectProgress name="刑法" value="1/1" progress={1} color={colors.success} last />
          </>}
        </View>

        <Text style={[styles.sectionTitle, styles.reviewTitle]}>逐题解析</Text>
        {(report?.results ?? OBJECTIVE_QUESTIONS.map((question, index) => ({
          questionId: question.id,
          stem: question.stem,
          options: question.options.map(item => item.text),
          answers: [String(question.answer.charCodeAt(0) - 65)],
          correctAnswers: [String(question.answer.charCodeAt(0) - 65)],
          correct: REVIEW_ANSWERS[index] === question.answer,
          analysis: question.explanation,
          explanationMediaType: undefined as 'audio' | 'video' | undefined,
          explanationMediaReference: undefined as string | undefined,
        }))).map((question, index) => {
          const userAnswer = report ? question.answers.map(value => String.fromCharCode(65 + Number(value))).join(', ') : REVIEW_ANSWERS[index];
          const correctAnswer = report ? question.correctAnswers.map(value => String.fromCharCode(65 + Number(value))).join(', ') : OBJECTIVE_QUESTIONS[index].answer;
          const isRight = report ? question.correct : userAnswer === correctAnswer;
          return (
            <View key={question.questionId} testID={`objective-review-${index}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {isRight ? <CheckCircle2 size={16} color={colors.success} /> : <XCircle size={16} color={colors.error} />}
                <Text numberOfLines={2} style={styles.reviewStem}>{question.stem}</Text>
              </View>
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>你的答案：<Text style={[styles.answerValue, isRight ? styles.answerRight : styles.answerWrong]}>{userAnswer}</Text></Text>
                <Text style={styles.answerLabel}>正确答案：<Text style={styles.answerCorrect}>{correctAnswer}</Text></Text>
              </View>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>答案解析</Text>
                <Text style={styles.explanation}>{question.analysis}</Text>
                {question.explanationMediaReference ? <Pressable accessibilityRole="button" testID={`objective-explanation-media-${index}`} onPress={() => void Linking.openURL(mediaUrl(question.explanationMediaReference as string))} style={styles.mediaButton}>{question.explanationMediaType === 'audio' ? <Headphones size={16} color={colors.brand} /> : <PlayCircle size={16} color={colors.brand} />}<Text style={styles.mediaButtonText}>{question.explanationMediaType === 'audio' ? '收听音频讲解' : '观看视频讲解'}</Text></Pressable> : null}
              </View>
            </View>
          );
        })}
      </ScrollView>}

      <View style={styles.footer}>
        <Pressable testID="objective-report-mistakes" onPress={() => navigation.navigate('MistakeBook')} style={({pressed}) => [styles.footerSecondary, pressed && styles.pressed]}>
          <Text style={styles.footerSecondaryText}>加入错题本</Text>
        </Pressable>
        <Pressable testID="objective-report-return" onPress={() => navigation.goBack()} style={({pressed}) => [styles.footerPrimary, pressed && styles.primaryPressed]}>
          <Text style={styles.footerPrimaryText}>返回题库</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function SubjectProgress({name, value, progress, color, last = false}: {name: string; value: string; progress: number; color: string; last?: boolean}) {
  return (
    <View style={!last ? styles.subjectItem : undefined}>
      <View style={styles.subjectRow}><Text style={styles.subjectName}>{name}</Text><Text style={styles.subjectValue}>{value}</Text></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${progress * 100}%`, backgroundColor: color}]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center'},
  headerSide: {width: 32, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.ink},
  scroll: {flex: 1, backgroundColor: colors.page},
  content: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24},
  scoreCard: {height: 236, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', paddingTop: 20},
  scoreRing: {width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: colors.brand, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  score: {fontSize: 24, lineHeight: 29, fontWeight: '800', color: colors.brand},
  scoreUnit: {fontSize: 10, lineHeight: 13, color: colors.brand},
  scoreLabel: {fontSize: 14, color: colors.body, marginTop: 10},
  metricRow: {height: 72, marginTop: 17, marginHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  metric: {width: 86, alignItems: 'center'},
  metricDivider: {width: StyleSheet.hairlineWidth, height: 50, backgroundColor: colors.line},
  metricValue: {fontSize: 20, lineHeight: 26, fontWeight: '800', color: colors.ink},
  metricLabel: {fontSize: 12, lineHeight: 18, color: colors.muted},
  correct: {color: colors.success},
  wrong: {color: colors.error},
  subjectCard: {borderRadius: radius.md, backgroundColor: colors.surface, marginTop: 12, padding: 16},
  sectionTitle: {fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.ink},
  subjectItem: {marginBottom: 14},
  subjectRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 7},
  subjectName: {fontSize: 13, color: colors.body},
  subjectValue: {fontSize: 12, color: colors.muted},
  progressTrack: {height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden'},
  progressFill: {height: 6, borderRadius: 3},
  reviewTitle: {marginTop: 17, marginBottom: 10},
  reviewCard: {borderRadius: radius.md, backgroundColor: colors.surface, padding: 16, marginBottom: 8},
  reviewHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  reviewStem: {flex: 1, fontSize: 13, lineHeight: 20, color: colors.ink},
  answerRow: {flexDirection: 'row', gap: 18, marginLeft: 24, marginTop: 8, marginBottom: 8},
  answerLabel: {fontSize: 12, color: colors.body},
  answerValue: {fontWeight: '700'},
  answerRight: {color: colors.success},
  answerWrong: {color: colors.error},
  answerCorrect: {color: colors.success, fontWeight: '700'},
  explanationBox: {marginLeft: 24, borderRadius: radius.sm, backgroundColor: colors.page, padding: 10},
  explanationTitle: {fontSize: 12, lineHeight: 18, fontWeight: '700', color: colors.ink, marginBottom: 4},
  explanation: {fontSize: 12, lineHeight: 19, color: colors.body},
  mediaButton: {height: 38, marginTop: 10, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.brandLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  mediaButtonText: {fontSize: 12, fontWeight: '700', color: colors.brand},
  footer: {height: 68, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', gap: 8},
  footerSecondary: {height: 44, flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  footerPrimary: {height: 44, flex: 1, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  footerSecondaryText: {fontSize: 14, color: colors.body},
  footerPrimaryText: {fontSize: 14, fontWeight: '700', color: colors.surface},
  pressed: {opacity: 0.62},
  primaryPressed: {backgroundColor: colors.brandDark},
});
