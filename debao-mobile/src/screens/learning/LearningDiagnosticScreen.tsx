import {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Check, ChevronLeft, ChevronRight} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, ProgressBar, RemoteState} from '@/components/ui';
import {learningService} from '@/services';
import type {LearningDiagnosticForm, LearningDiagnosticQuestion, LearningDiagnosticResult} from '@/services/contracts';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function LearningDiagnosticScreen() {
  const navigation = useNavigation<Navigation>();
  const [questions, setQuestions] = useState<LearningDiagnosticQuestion[]>([]);
  const [formConfig, setFormConfig] = useState<LearningDiagnosticForm | undefined>();
  const [dimensions, setDimensions] = useState<Array<{code: string; label: string}>>([]);
  const [result, setResult] = useState<LearningDiagnosticResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, {optionIds: string[]; value?: string | number}>>({});
  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    learningService.diagnostic().then(result => {
      if (result.access !== 'granted') throw new Error('请先购买得恩私教');
      setFormConfig(result.form);
      setDimensions(result.dimensions ?? []);
      if (result.completed) {
        if (result.result) setResult(result.result);
        else throw new Error('诊断结果暂时不可用，请稍后重试');
        return;
      }
      setQuestions(result.questions);
    }).catch(reason => setError(reason instanceof Error ? reason.message : '诊断题加载失败')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const question = questions[index];
  const currentAnswer = question ? answers[question.id] ?? {optionIds: []} : {optionIds: []};
  const selected = currentAnswer.optionIds;
  const hasAnswer = selected.length > 0 || (currentAnswer.value !== undefined && String(currentAnswer.value).trim().length > 0);
  const answeredCount = useMemo(() => questions.filter(item => (answers[item.id]?.optionIds.length ?? 0) > 0 || answers[item.id]?.value !== undefined && String(answers[item.id]?.value).trim().length > 0).length, [answers, questions]);
  const select = (optionId: string) => {
    if (!question) return;
    setAnswers(current => {
      const values = current[question.id]?.optionIds ?? [];
      return {...current, [question.id]: {...current[question.id], optionIds: question.type === 'single' || question.type === 'scale' ? [optionId] : values.includes(optionId) ? values.filter(id => id !== optionId) : [...values, optionId]}};
    });
  };
  const setValue = (value: string) => { if (!question) return; setAnswers(current => ({...current, [question.id]: {...current[question.id], optionIds: current[question.id]?.optionIds ?? [], value: question.type === 'number' && value ? Number(value) : value}})); };

  const next = async () => {
    if (!question || (question.required && !hasAnswer)) return;
    if (index < questions.length - 1) { setIndex(value => value + 1); return; }
    setSubmitting(true);
    setError('');
    try {
      const submitted = await learningService.submitDiagnostic({startedAt, answers: questions.map(item => ({questionId: item.id, optionIds: answers[item.id]?.optionIds ?? [], ...(answers[item.id]?.value !== undefined ? {value: answers[item.id]?.value} : {})}))});
      setResult(submitted);
      setQuestions([]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '诊断提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <AppScreen testID="learning-diagnostic-result-screen">
        <PageHeader title={formConfig?.successTitle ?? '首次学习诊断完成'} subtitle="你的初始学习画像" />
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHero}>
            <Text style={styles.resultTitle}>{formConfig?.successTitle ?? '初始学习画像已生成'}</Text>
            <Text style={styles.resultDescription}>{formConfig?.successDescription ?? '后续学习计划会结合这份画像持续调整。'}</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultSectionTitle}>画像维度</Text>
            {Object.entries(result.scores).map(([code, score]) => (
              <View key={code} style={styles.scoreRow}>
                <Text style={styles.scoreName}>{dimensions.find(item => item.code === code)?.label ?? code}</Text>
                <View style={styles.scoreTrack}><View style={[styles.scoreFill, {width: `${Math.max(0, Math.min(100, score))}%`}]} /></View>
                <Text style={styles.scoreValue}>{score}</Text>
              </View>
            ))}
            <Text style={styles.timestamp}>完成时间：{new Date(result.submittedAt).toLocaleString()}</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultSectionTitle}>{result.assignment?.status === 'assigned' ? '已分配学习老师' : '老师分配处理中'}</Text>
            {result.assignment?.teacher ? <>
              <Text style={styles.teacherName}>{result.assignment.teacher.name} · {result.assignment.teacher.subject}</Text>
              <Text style={styles.teacherSpecialty}>{result.assignment.teacher.specialty}</Text>
              {result.assignment.stage ? <Text style={styles.assignmentMeta}>当前阶段：{result.assignment.stage.name}</Text> : null}
            </> : <Text style={styles.teacherSpecialty}>当前阶段暂未配置老师，管理员完成配置后会自动分配。</Text>}
          </View>
          <AppButton label="进入学习中心" onPress={() => navigation.replace('LearningCenter')} />
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false} testID="learning-diagnostic-screen">
      <PageHeader title={formConfig?.title ?? '首次学习诊断'} subtitle={questions.length ? `${index + 1} / ${questions.length}` : undefined} />
      {loading || (error && !question) ? <RemoteState testID="learning-diagnostic-state" loading={loading} error={error} onRetry={load} /> : question ? (
        <View style={styles.page}>
          {formConfig?.description ? <View style={styles.intro}><Text style={styles.introText}>{formConfig.description}</Text><Text style={styles.introMeta}>预计用时 {formConfig.estimatedMinutes} 分钟 · 请按真实情况作答</Text></View> : null}
          <View style={styles.progress}><ProgressBar value={(index + 1) / questions.length * 100} /><Text style={styles.progressText}>已完成 {answeredCount} 题</Text></View>
          <ScrollView contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false} style={styles.questionArea}>
            <View style={styles.questionHeader}><Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text><Text style={styles.type}>{({single: '单选题', multiple: '多选题', scale: '量表题', text: '文本题', number: '数字题'} as Record<string, string>)[question.type]}{question.required ? ' · 必答' : ''}</Text></View>
            <Text style={styles.stem}>{question.stem}</Text>
            {question.description ? <Text style={styles.description}>{question.description}</Text> : null}
            {question.type === 'text' ? <TextInput multiline value={currentAnswer.value === undefined ? '' : String(currentAnswer.value)} onChangeText={setValue} placeholder={question.placeholder ?? '请输入你的回答'} maxLength={question.validation?.maxLength} style={styles.textInput} /> : null}
            {question.type === 'number' ? <TextInput keyboardType="numeric" value={currentAnswer.value === undefined ? '' : String(currentAnswer.value)} onChangeText={setValue} placeholder={question.placeholder ?? '请输入数字'} style={styles.textInput} /> : null}
            {['single', 'multiple', 'scale'].includes(question.type) ? <View style={styles.options}>{question.options.map((option, optionIndex) => {
              const active = selected.includes(option.id);
              return <Pressable accessibilityRole={question.type === 'single' ? 'radio' : 'checkbox'} accessibilityState={{checked: active}} key={option.id} onPress={() => select(option.id)} style={({pressed}) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}>
                <View style={[styles.optionMark, active && styles.optionMarkActive]}>{active ? <Check color={colors.surface} size={15} /> : <Text style={styles.optionLetter}>{String.fromCharCode(65 + optionIndex)}</Text>}</View>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
              </Pressable>;
            })}</View> : null}
          </ScrollView>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <View style={styles.footer}>
            <Pressable accessibilityRole="button" disabled={index === 0 || submitting} onPress={() => setIndex(value => Math.max(0, value - 1))} style={[styles.previous, index === 0 && styles.disabled]}><ChevronLeft color={colors.brand} size={18} /><Text style={styles.previousText}>上一题</Text></Pressable>
            <View style={styles.next}><AppButton label={index === questions.length - 1 ? (formConfig?.submitLabel ?? '提交诊断') : '下一题'} disabled={question.required && !hasAnswer} loading={submitting} onPress={() => void next()} icon={index === questions.length - 1 ? undefined : <ChevronRight color={colors.surface} size={18} />} /></View>
          </View>
        </View>
      ) : <RemoteState testID="learning-diagnostic-empty" empty emptyTitle="暂无诊断题" emptyDescription="学习中心正在准备诊断内容，请稍后再试。" />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: {flex: 1},
  intro: {marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.brandLight},
  introText: {color: colors.ink, fontSize: 13, lineHeight: 20},
  introMeta: {color: colors.muted, fontSize: 11, marginTop: spacing.xs},
  progress: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg},
  progressText: {color: colors.muted, fontSize: 11, marginTop: spacing.sm, textAlign: 'right'},
  questionArea: {flex: 1},
  questionContent: {paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl},
  questionHeader: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  number: {color: colors.brand, fontSize: 28, fontWeight: '800'},
  type: {color: colors.muted, fontSize: 12},
  stem: {color: colors.ink, fontSize: 21, lineHeight: 30, fontWeight: '800', marginTop: spacing.md},
  description: {color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.sm},
  textInput: {minHeight: 120, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, color: colors.ink, fontSize: 15, lineHeight: 23, padding: spacing.lg, marginTop: spacing.xxl, textAlignVertical: 'top'},
  options: {gap: spacing.md, marginTop: spacing.xxl},
  option: {minHeight: 64, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  optionActive: {borderColor: colors.brand, backgroundColor: colors.brandLight},
  optionMark: {width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  optionMarkActive: {backgroundColor: colors.brand, borderColor: colors.brand},
  optionLetter: {color: colors.muted, fontSize: 12, fontWeight: '700'},
  optionText: {flex: 1, color: colors.body, fontSize: 14, lineHeight: 21},
  optionTextActive: {color: colors.ink, fontWeight: '600'},
  error: {color: colors.error, fontSize: 12, textAlign: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  footer: {padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  previous: {height: 48, minWidth: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  previousText: {color: colors.brand, fontSize: 14, fontWeight: '700'},
  next: {flex: 1},
  disabled: {opacity: 0.35},
  pressed: {opacity: 0.68},
  resultContent: {padding: spacing.lg, gap: spacing.md},
  resultHero: {backgroundColor: colors.brandLight, borderRadius: radius.md, padding: spacing.xl},
  resultTitle: {color: colors.ink, fontSize: 22, lineHeight: 30, fontWeight: '800'},
  resultDescription: {color: colors.body, fontSize: 14, lineHeight: 22, marginTop: spacing.sm},
  resultCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg},
  resultSectionTitle: {color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: spacing.md},
  scoreRow: {height: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  scoreName: {width: 76, color: colors.body, fontSize: 12},
  scoreTrack: {flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.line},
  scoreFill: {height: '100%', borderRadius: 4, backgroundColor: colors.brand},
  scoreValue: {width: 30, textAlign: 'right', color: colors.ink, fontSize: 12, fontWeight: '700'},
  timestamp: {color: colors.muted, fontSize: 11, marginTop: spacing.md},
  teacherName: {color: colors.ink, fontSize: 16, fontWeight: '800'},
  teacherSpecialty: {color: colors.body, fontSize: 13, lineHeight: 20, marginTop: spacing.sm},
  assignmentMeta: {color: colors.brand, fontSize: 12, fontWeight: '700', marginTop: spacing.md},
});
