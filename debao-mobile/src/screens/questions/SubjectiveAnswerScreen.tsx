import {useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BookOpen, ChevronLeft, Save} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {
  SUBJECTIVE_QUESTIONS,
  type SubjectiveDifficulty,
} from '@/data/subjectiveQuestions';
import {questionService} from '@/services';
import {useAppStore} from '@/store/useAppStore';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'SubjectiveAnswer'>;

const SUB_QUESTION_LABELS = ['一', '二', '三', '四'];
const DIFFICULTY_COLORS: Record<SubjectiveDifficulty, string> = {
  易: '#3A7A46',
  中: '#A87000',
  难: '#D2691E',
};

const formatDraftTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function SubjectiveAnswerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const subjectName = route.params.subjectName;
  const questions = useMemo(
    () => SUBJECTIVE_QUESTIONS.filter(item => item.subject === subjectName),
    [subjectName],
  );
  const storedDrafts = useAppStore(state => state.drafts);
  const saveLocalDraft = useAppStore(state => state.saveDraft);
  const requestedIndex = route.params.questionIndex ?? 0;
  const initialIndex = questions.length
    ? Math.max(0, Math.min(requestedIndex, questions.length - 1))
    : 0;
  const [qIdx, setQIdx] = useState(initialIndex);
  const [activeSubQ, setActiveSubQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const restored: Record<string, string> = {};
    questions.forEach(question => {
      question.questions.forEach((_, index) => {
        const answerKey = `${question.id}-${index}`;
        const draft = storedDrafts[`subjective-${answerKey}`];
        if (draft) {
          restored[answerKey] = draft;
        }
      });
    });
    return restored;
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[qIdx];
  const subQ = q?.questions[activeSubQ];
  const answerKey = q ? `${q.id}-${activeSubQ}` : '';
  const currentAnswer = answers[answerKey] ?? '';

  if (!q) {
    return (
      <AppScreen scroll={false} testID="subjective-answer-empty">
        <View style={styles.topHeader}>
          <Pressable accessibilityLabel="返回" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerSide}>
            <ChevronLeft size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>{subjectName} · 分科真题</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.emptyState}><Text style={styles.emptyText}>暂无该科目的主观题</Text></View>
      </AppScreen>
    );
  }

  const setAnswer = (value: string) => {
    setAnswers(current => ({...current, [answerKey]: value}));
    setSavedAt(null);
  };

  const hasAnswer = (questionId: string, index: number) =>
    (answers[`${questionId}-${index}`] ?? '').trim().length > 0;

  const selectQuestion = (index: number) => {
    setQIdx(index);
    setActiveSubQ(0);
  };

  const saveNow = async () => {
    saveLocalDraft(`subjective-${answerKey}`, currentAnswer);
    await questionService.saveDraft({
      questionId: q.id,
      answers: q.questions.map((_, index) => answers[`${q.id}-${index}`] ?? ''),
    });
    setSavedAt(formatDraftTime(new Date()));
  };

  const goPrevious = () => {
    if (activeSubQ > 0) {
      setActiveSubQ(activeSubQ - 1);
    } else if (qIdx > 0) {
      setQIdx(qIdx - 1);
      setActiveSubQ(0);
    }
  };

  const goNext = () => {
    if (activeSubQ < q.questions.length - 1) {
      setActiveSubQ(activeSubQ + 1);
    } else if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
      setActiveSubQ(0);
    } else {
      setSubmitDialog(true);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    await questionService.submit({
      questionId: `subjective-${subjectName}`,
      answers: questions.flatMap(question =>
        question.questions.map((_, index) => answers[`${question.id}-${index}`] ?? ''),
      ),
    });
    setSubmitting(false);
    setSubmitDialog(false);
    navigation.goBack();
  };

  const isLast = qIdx === questions.length - 1 && activeSubQ === q.questions.length - 1;
  const answeredCount = Object.values(answers).filter(answer => answer.trim()).length;

  return (
    <AppScreen scroll={false} keyboardAware testID="subjective-answer-screen">
      <View style={styles.headerBlock}>
        <View style={styles.topHeader}>
          <Pressable accessibilityLabel="返回" testID="subjective-answer-back" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerSide}>
            <ChevronLeft size={22} color={colors.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.headerTitle}>{subjectName} · 分科真题</Text>
            <Text style={styles.headerProgress}>{qIdx + 1} / {questions.length}</Text>
          </View>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <Pressable accessibilityLabel="法条检索" testID="subjective-open-law-search" hitSlop={8} onPress={() => navigation.navigate('LawSearch')} style={styles.lawButton}>
              <BookOpen size={15} color={colors.brand} />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questionNavigator}>
          {questions.map((question, index) => {
            const answered = question.questions.some((_, subIndex) => hasAnswer(question.id, subIndex));
            const active = index === qIdx;
            return (
              <Pressable
                key={question.id}
                accessibilityLabel={`第${index + 1}题`}
                testID={`subjective-answer-question-${index}`}
                onPress={() => selectQuestion(index)}
                style={[styles.questionButton, active && styles.questionButtonActive, !active && answered && styles.questionButtonAnswered]}>
                <Text style={[styles.questionButtonText, active && styles.questionButtonTextActive, !active && answered && styles.questionButtonTextAnswered]}>{index + 1}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.readingArea} contentContainerStyle={styles.readingContent} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          <View style={styles.yearBadge}><Text style={styles.yearText}>{q.year}年</Text></View>
          <Text style={[styles.difficultyText, {color: DIFFICULTY_COLORS[q.difficulty]}]}>{q.difficulty}</Text>
          <Text style={styles.minutesText}>建议{q.suggestMinutes}分钟</Text>
        </View>
        <Text style={styles.caseTitle}>{q.title}</Text>
        <View style={styles.caseCard}>
          <Text style={styles.caseBody}>{q.content}</Text>
          {q.questions.map((question, index) => (
            <Text key={question.id} style={styles.caseQuestion}>{index + 1}. {question.text}</Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.answerWorkspace}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subQuestionScroller} contentContainerStyle={styles.subQuestionTabs}>
          {q.questions.map((question, index) => {
            const active = index === activeSubQ;
            const filled = hasAnswer(q.id, index);
            return (
              <Pressable
                key={question.id}
                accessibilityLabel={`第${SUB_QUESTION_LABELS[index]}问`}
                testID={`subjective-answer-subquestion-${index}`}
                onPress={() => setActiveSubQ(index)}
                style={[styles.subQuestionTab, active && styles.subQuestionTabActive]}>
                <View style={[styles.answerDot, filled && styles.answerDotFilled, active && styles.answerDotActive]} />
                <Text style={[styles.subQuestionText, active && styles.subQuestionTextActive]}>第{SUB_QUESTION_LABELS[index]}问</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.currentQuestion}>
          <Text numberOfLines={2} style={styles.currentQuestionText}>{subQ?.text}</Text>
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            accessibilityLabel="主观题答案"
            testID="subjective-answer-input"
            multiline
            value={currentAnswer}
            onChangeText={setAnswer}
            placeholder="在此输入您的回答…"
            placeholderTextColor="#C0C5D0"
            style={styles.input}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.saveStateRow}>
          <Text testID="subjective-answer-save-state" style={styles.saveState}>{savedAt ? `草稿已保存 ${savedAt}` : currentAnswer ? '未保存' : ''}</Text>
          <Text style={styles.characterCount}>{currentAnswer.length} 字</Text>
        </View>
        <View style={styles.actionBar}>
          <Pressable accessibilityLabel="保存" testID="subjective-answer-save" hitSlop={4} onPress={saveNow} style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Save size={14} color={colors.muted} />
            <Text style={styles.secondaryButtonText}>保存</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="上一题"
            testID="subjective-answer-previous"
            disabled={qIdx === 0 && activeSubQ === 0}
            onPress={goPrevious}
            style={({pressed}) => [styles.secondaryButton, styles.previousButton, (qIdx === 0 && activeSubQ === 0) && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>上一题</Text>
          </Pressable>
          <Pressable accessibilityLabel={isLast ? '提交作答' : '下一步'} testID="subjective-answer-next" onPress={goNext} style={({pressed}) => [styles.primaryButton, pressed && styles.primaryPressed]}>
            <Text style={styles.primaryButtonText}>{isLast ? '提交作答' : activeSubQ < q.questions.length - 1 ? '下一问' : '下一题'}</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={submitDialog} onRequestClose={() => setSubmitDialog(false)}>
        <View style={styles.dialogOverlay}>
          <Pressable accessibilityLabel="关闭提交确认" style={StyleSheet.absoluteFill} onPress={() => setSubmitDialog(false)} />
          <View accessibilityViewIsModal testID="subjective-submit-dialog" style={styles.dialogCard}>
            <View style={styles.dialogBody}>
              <Text style={styles.dialogTitle}>确认提交</Text>
              <Text style={styles.dialogDescription}>您已完成本次练习。共{questions.length}道题，{answeredCount}个小问已作答。提交后无法修改答案。</Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable testID="subjective-submit-cancel" disabled={submitting} onPress={() => setSubmitDialog(false)} style={({pressed}) => [styles.dialogButton, pressed && styles.pressed]}>
                <Text style={styles.dialogCancelText}>继续修改</Text>
              </Pressable>
              <View style={styles.dialogDivider} />
              <Pressable testID="subjective-submit-confirm" disabled={submitting} onPress={submit} style={({pressed}) => [styles.dialogButton, pressed && styles.pressed]}>
                <Text style={styles.dialogConfirmText}>{submitting ? '提交中…' : '提交作答'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  topHeader: {height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center'},
  headerSide: {width: 32, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerSideRight: {alignItems: 'flex-end'},
  headerCopy: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 13, lineHeight: 18, fontWeight: '700', color: colors.ink},
  headerProgress: {fontSize: 10, lineHeight: 14, color: colors.muted},
  lawButton: {width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  questionNavigator: {height: 36, paddingHorizontal: 16, paddingBottom: 8, gap: 6},
  questionButton: {width: 32, height: 28, borderRadius: radius.sm, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  questionButtonActive: {backgroundColor: colors.brand},
  questionButtonAnswered: {backgroundColor: colors.mint},
  questionButtonText: {fontSize: 12, fontWeight: '600', color: colors.muted},
  questionButtonTextActive: {color: colors.surface},
  questionButtonTextAnswered: {color: colors.success},
  readingArea: {flex: 1, backgroundColor: colors.page},
  readingContent: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12},
  metaRow: {height: 20, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10},
  yearBadge: {height: 20, paddingHorizontal: 7, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  yearText: {fontSize: 10, color: colors.muted},
  difficultyText: {fontSize: 10, fontWeight: '600'},
  minutesText: {fontSize: 10, color: colors.muted},
  caseTitle: {fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.ink, marginBottom: 11},
  caseCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 16},
  caseBody: {fontSize: 13, lineHeight: 23, color: colors.body},
  caseQuestion: {fontSize: 13, lineHeight: 23, color: colors.ink, marginTop: 8},
  answerWorkspace: {height: 274, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  subQuestionScroller: {height: 39, flexGrow: 0, flexShrink: 0},
  subQuestionTabs: {height: 39, paddingHorizontal: 16, paddingTop: 11, gap: 6},
  subQuestionTab: {height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.page, flexDirection: 'row', alignItems: 'center', gap: 5},
  subQuestionTabActive: {backgroundColor: colors.brand},
  answerDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#D5D8E0'},
  answerDotFilled: {backgroundColor: colors.success},
  answerDotActive: {backgroundColor: colors.surface},
  subQuestionText: {fontSize: 12, fontWeight: '600', color: colors.muted},
  subQuestionTextActive: {color: colors.surface},
  currentQuestion: {height: 50, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 5},
  currentQuestionText: {fontSize: 12, lineHeight: 18, color: colors.body},
  inputWrap: {height: 101, paddingHorizontal: 16},
  input: {height: 101, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: '#F8F9FA', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, fontSize: 13, lineHeight: 19, color: colors.ink},
  saveStateRow: {height: 26, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center'},
  saveState: {fontSize: 10, color: colors.muted},
  characterCount: {marginLeft: 'auto', fontSize: 10, color: colors.muted},
  actionBar: {height: 50, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', gap: 8},
  secondaryButton: {height: 40, minWidth: 64, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  previousButton: {paddingHorizontal: 11},
  secondaryButtonText: {fontSize: 13, color: colors.body},
  primaryButton: {height: 40, flex: 1, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  primaryButtonText: {fontSize: 13, fontWeight: '700', color: colors.surface},
  primaryPressed: {backgroundColor: colors.brandDark},
  disabled: {opacity: 0.4},
  pressed: {opacity: 0.62},
  dialogOverlay: {flex: 1, padding: 24, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center'},
  dialogCard: {width: '100%', maxWidth: 320, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden'},
  dialogBody: {padding: 24},
  dialogTitle: {fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.ink, marginBottom: 8},
  dialogDescription: {fontSize: 14, lineHeight: 22, color: colors.body},
  dialogActions: {height: 49, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  dialogButton: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  dialogDivider: {width: StyleSheet.hairlineWidth, backgroundColor: colors.line},
  dialogCancelText: {fontSize: 15, fontWeight: '600', color: colors.body},
  dialogConfirmText: {fontSize: 15, fontWeight: '700', color: colors.brand},
  emptyState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 14, color: colors.muted},
});
