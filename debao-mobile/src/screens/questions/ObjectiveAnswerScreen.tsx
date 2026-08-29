import {useMemo, useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ChevronLeft, ChevronRight, Grid3x3, X} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {OBJECTIVE_QUESTIONS} from '@/data/objectiveQuestions';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {questionService} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ObjectiveAnswer'>;

export default function ObjectiveAnswerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cardVisible, setCardVisible] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const question = OBJECTIVE_QUESTIONS[currentIdx];
  const userAnswer = answers[question.id];
  const title = route.params?.title ?? (route.params?.mode === 'exam' ? '客观题考试' : '客观题练习');
  const answered = Object.values(answers).filter(Boolean).length;
  const correct = useMemo(
    () => OBJECTIVE_QUESTIONS.filter(item => answers[item.id] === item.answer).length,
    [answers],
  );

  const selectAnswer = (key: string) => {
    setAnswers(current => ({...current, [question.id]: key}));
  };

  const openQuestion = (index: number) => {
    setCurrentIdx(index);
    setCardVisible(false);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitVisible(false);
    if (!environment.useMocks) {
      setSubmitting(true);
      try {
        await Promise.all(Object.entries(answers).filter(([, value]) => value).map(([questionId, value]) => questionService.submit({questionId, answers: [String(value.charCodeAt(0) - 65)]})));
      } catch {
        // Keep the local report available when the API is temporarily unavailable.
      } finally {
        setSubmitting(false);
      }
    }
    navigation.navigate('ObjectiveReport', {correct, total: OBJECTIVE_QUESTIONS.length});
  };

  return (
    <AppScreen scroll={false} testID="objective-answer-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" testID="objective-answer-back" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerSide}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
          <Text testID="objective-progress-text" style={styles.headerProgress}>{currentIdx + 1} / {OBJECTIVE_QUESTIONS.length}</Text>
        </View>
        <View style={[styles.headerSide, styles.headerRight]}>
          <Pressable accessibilityLabel="答题卡" testID="objective-open-card" hitSlop={9} onPress={() => setCardVisible(true)} style={styles.headerAction}>
            <Grid3x3 size={18} color={colors.body} />
          </Pressable>
        </View>
      </View>
      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${((currentIdx + 1) / OBJECTIVE_QUESTIONS.length) * 100}%`}]} />
        </View>
      </View>

      <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{question.subject}</Text>
            <Text style={styles.metaText}>{question.year}年</Text>
            <View style={styles.pointTag}><Text numberOfLines={1} style={styles.pointText}>{question.point}</Text></View>
          </View>
          <Text style={styles.stem}>{question.stem}</Text>
        </View>

        <View style={styles.options}>
          {question.options.map(option => {
            const selected = userAnswer === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityLabel={`${option.key} ${option.text}`}
                accessibilityState={{selected}}
                testID={`objective-option-${option.key}`}
                onPress={() => selectAnswer(option.key)}
                style={({pressed}) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
                <View style={[styles.optionKey, selected && styles.optionKeySelected]}>
                  <Text style={[styles.optionKeyText, selected && styles.optionKeyTextSelected]}>{option.key}</Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, (cardVisible || submitVisible) && styles.bottomBarBehindModal]}>
        <Pressable
          accessibilityLabel="上一题"
          testID="objective-previous"
          disabled={currentIdx === 0}
          onPress={() => setCurrentIdx(index => Math.max(0, index - 1))}
          style={({pressed}) => [styles.previousButton, currentIdx === 0 && styles.disabled, pressed && styles.pressed]}>
          <ChevronLeft size={16} color={colors.body} />
          <Text style={styles.previousText}>上一题</Text>
        </Pressable>
        {currentIdx < OBJECTIVE_QUESTIONS.length - 1 ? (
          <Pressable accessibilityLabel="下一题" testID="objective-next" onPress={() => setCurrentIdx(index => index + 1)} style={({pressed}) => [styles.nextButton, pressed && styles.primaryPressed]}>
            <Text style={styles.nextText}>下一题</Text>
            <ChevronRight size={16} color={colors.surface} />
          </Pressable>
        ) : (
          <Pressable accessibilityLabel="交卷" testID="objective-submit-open" onPress={() => setSubmitVisible(true)} style={({pressed}) => [styles.nextButton, pressed && styles.primaryPressed]}>
            <Text style={styles.nextText}>交卷</Text>
          </Pressable>
        )}
      </View>

      <Modal transparent navigationBarTranslucent animationType="slide" visible={cardVisible} onRequestClose={() => setCardVisible(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable accessibilityLabel="关闭答题卡" style={styles.sheetDismiss} onPress={() => setCardVisible(false)} />
          <View accessibilityViewIsModal testID="objective-card-sheet" style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>答题卡</Text>
              <Pressable accessibilityLabel="关闭" hitSlop={9} onPress={() => setCardVisible(false)} style={styles.closeButton}>
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.sheetBody}>
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendAnswered]} /><Text style={styles.legendText}>已答</Text></View>
                <View style={styles.legendItem}><View style={styles.legendDot} /><Text style={styles.legendText}>未答</Text></View>
              </View>
              <View style={styles.cardGrid}>
                {OBJECTIVE_QUESTIONS.map((item, index) => {
                  const active = index === currentIdx;
                  const hasAnswer = !!answers[item.id];
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityLabel={`答题卡第${index + 1}题`}
                      testID={`objective-card-question-${index}`}
                      onPress={() => openQuestion(index)}
                      style={[styles.cardQuestion, hasAnswer && styles.cardQuestionAnswered, active && styles.cardQuestionActive]}>
                      <Text style={[styles.cardQuestionText, hasAnswer && styles.cardQuestionTextAnswered, active && styles.cardQuestionTextActive]}>{index + 1}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text testID="objective-card-summary" style={styles.cardSummary}>已作答 {answered} / {OBJECTIVE_QUESTIONS.length}，未作答 {OBJECTIVE_QUESTIONS.length - answered} 题</Text>
              <Pressable testID="objective-card-submit" onPress={() => {setCardVisible(false); setSubmitVisible(true);}} style={({pressed}) => [styles.sheetSubmit, pressed && styles.primaryPressed]}>
                <Text style={styles.sheetSubmitText}>交卷</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent navigationBarTranslucent animationType="fade" visible={submitVisible} onRequestClose={() => setSubmitVisible(false)}>
        <View style={styles.dialogOverlay}>
          <Pressable accessibilityLabel="关闭交卷确认" style={StyleSheet.absoluteFill} onPress={() => setSubmitVisible(false)} />
          <View accessibilityViewIsModal testID="objective-submit-dialog" style={styles.dialogCard}>
            <View style={styles.dialogBody}>
              <Text style={styles.dialogTitle}>确认交卷</Text>
              <Text style={styles.dialogDescription}>已作答 {answered} 题，{OBJECTIVE_QUESTIONS.length - answered} 题未作答，交卷后不可修改。</Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable testID="objective-submit-cancel" onPress={() => setSubmitVisible(false)} style={({pressed}) => [styles.dialogButton, pressed && styles.pressed]}>
                <Text style={styles.dialogCancelText}>继续作答</Text>
              </Pressable>
              <View style={styles.dialogDivider} />
              <Pressable disabled={submitting} testID="objective-submit-confirm" onPress={submit} style={({pressed}) => [styles.dialogButton, pressed && styles.pressed]}>
                <Text style={styles.dialogConfirmText}>确认交卷</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center'},
  headerSide: {width: 32, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerRight: {alignItems: 'flex-end'},
  headerCopy: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 14, lineHeight: 19, fontWeight: '700', color: colors.ink},
  headerProgress: {fontSize: 10, lineHeight: 14, color: colors.muted},
  headerAction: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  progressArea: {height: 17, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  progressTrack: {height: 3, borderRadius: 2, backgroundColor: colors.line, overflow: 'hidden'},
  progressFill: {height: 3, borderRadius: 2, backgroundColor: colors.brand},
  questionScroll: {flex: 1, backgroundColor: colors.page},
  questionContent: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16},
  questionCard: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 12},
  metaRow: {height: 21, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11},
  metaText: {fontSize: 11, color: colors.muted},
  pointTag: {maxWidth: 220, height: 21, borderRadius: radius.sm, backgroundColor: colors.page, paddingHorizontal: 8, justifyContent: 'center'},
  pointText: {fontSize: 10, color: colors.body},
  stem: {fontSize: 14, lineHeight: 25, color: colors.ink},
  options: {gap: 8},
  option: {minHeight: 60, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', backgroundColor: colors.surface, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  optionSelected: {borderColor: colors.brand, backgroundColor: colors.brandLight},
  optionKey: {width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#C0C5D0', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  optionKeySelected: {borderColor: colors.brand, backgroundColor: colors.brand},
  optionKeyText: {fontSize: 13, fontWeight: '700', color: colors.muted},
  optionKeyTextSelected: {color: colors.surface},
  optionText: {flex: 1, fontSize: 14, lineHeight: 22, color: colors.ink},
  bottomBar: {height: 68, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', gap: 8},
  bottomBarBehindModal: {opacity: 0},
  previousButton: {height: 44, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  previousText: {fontSize: 14, color: colors.body},
  nextButton: {height: 44, flex: 1, borderRadius: radius.md, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  nextText: {fontSize: 14, fontWeight: '700', color: colors.surface},
  disabled: {opacity: 0.4},
  pressed: {opacity: 0.62},
  primaryPressed: {backgroundColor: colors.brandDark},
  sheetOverlay: {flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end'},
  sheetDismiss: {flex: 1},
  sheet: {backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden'},
  sheetHeader: {height: 68, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sheetTitle: {fontSize: 16, fontWeight: '700', color: colors.ink},
  closeButton: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  sheetBody: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28},
  legend: {flexDirection: 'row', gap: 14, marginBottom: 16},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendDot: {width: 12, height: 12, borderRadius: 6, backgroundColor: colors.line},
  legendAnswered: {backgroundColor: colors.brand},
  legendText: {fontSize: 12, color: colors.body},
  cardGrid: {flexDirection: 'row', gap: 8, marginBottom: 18},
  cardQuestion: {width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  cardQuestionAnswered: {backgroundColor: colors.brandLight},
  cardQuestionActive: {backgroundColor: colors.brand, borderWidth: 2, borderColor: colors.surface, outlineColor: colors.brand},
  cardQuestionText: {fontSize: 13, fontWeight: '600', color: colors.muted},
  cardQuestionTextAnswered: {color: colors.brand},
  cardQuestionTextActive: {color: colors.surface},
  cardSummary: {fontSize: 12, color: colors.muted, marginBottom: 16},
  sheetSubmit: {height: 44, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  sheetSubmitText: {fontSize: 14, fontWeight: '700', color: colors.surface},
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
});
