import {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Heart} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, ProgressBar} from '@/components/ui';
import {objectiveQuestions} from '@/data/mock';
import {useAppStore} from '@/store/useAppStore';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ObjectiveAnswer'>;

export default function ObjectiveAnswerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const question = objectiveQuestions[index];
  const selected = answers[question.id];
  const favoriteIds = useAppStore(state => state.favoriteIds);
  const toggleFavorite = useAppStore(state => state.toggleFavorite);
  const completeQuestion = useAppStore(state => state.completeQuestion);
  const title = route.params?.title ?? '客观题练习';
  const correctCount = useMemo(
    () => objectiveQuestions.filter(item => answers[item.id] === item.answer).length,
    [answers],
  );

  const next = () => {
    completeQuestion(question.id);
    if (index === objectiveQuestions.length - 1) {
      navigation.replace('ObjectiveReport', {correct: correctCount, total: objectiveQuestions.length});
      return;
    }
    setIndex(value => value + 1);
  };

  return (
    <AppScreen footer={
      <View style={styles.footer}>
        <AppButton label={index === objectiveQuestions.length - 1 ? '查看报告' : '下一题'} disabled={selected === undefined} onPress={next} />
      </View>
    }>
      <PageHeader
        title={title}
        subtitle={`${index + 1}/${objectiveQuestions.length}`}
        right={
          <Pressable accessibilityLabel="收藏题目" onPress={() => toggleFavorite(question.id)}>
            <Heart size={21} color={colors.error} fill={favoriteIds.includes(question.id) ? colors.error : 'transparent'} />
          </Pressable>
        }
      />
      <View style={styles.progress}><ProgressBar value={((index + 1) / objectiveQuestions.length) * 100} /></View>
      <View style={styles.content}>
        <Text style={styles.type}>单项选择题</Text>
        <Text style={styles.stem}>{question.stem}</Text>
        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const active = selected === optionIndex;
            return (
              <Pressable
                key={option}
                onPress={() => setAnswers(current => ({...current, [question.id]: optionIndex}))}
                style={[styles.option, active && styles.optionActive]}>
                <View style={[styles.optionIndex, active && styles.optionIndexActive]}>
                  <Text style={[styles.optionIndexText, active && styles.optionIndexTextActive]}>{String.fromCharCode(65 + optionIndex)}</Text>
                </View>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        {selected !== undefined ? (
          <Card style={styles.analysis}>
            <Text style={styles.analysisTitle}>{selected === question.answer ? '回答正确' : '答案解析'}</Text>
            <Text style={styles.analysisText}>正确答案：{String.fromCharCode(65 + question.answer)}。{question.analysis}</Text>
          </Card>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  progress: {paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface},
  content: {padding: spacing.lg},
  type: {fontSize: 12, color: colors.brand, fontWeight: '700'},
  stem: {fontSize: 18, lineHeight: 29, fontWeight: '700', color: colors.ink, marginTop: spacing.md},
  options: {marginTop: spacing.xl, gap: spacing.md},
  option: {minHeight: 64, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md},
  optionActive: {borderColor: colors.brand, backgroundColor: colors.brandLight},
  optionIndex: {width: 34, height: 34, borderRadius: 17, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  optionIndexActive: {backgroundColor: colors.brand},
  optionIndexText: {fontSize: 13, fontWeight: '700', color: colors.body},
  optionIndexTextActive: {color: '#FFFFFF'},
  optionText: {flex: 1, marginLeft: spacing.md, fontSize: 14, lineHeight: 21, color: colors.body},
  optionTextActive: {color: colors.ink, fontWeight: '600'},
  analysis: {marginTop: spacing.xl, backgroundColor: colors.mint},
  analysisTitle: {fontSize: 14, fontWeight: '800', color: colors.success},
  analysisText: {fontSize: 13, lineHeight: 21, color: colors.body, marginTop: spacing.sm},
  footer: {padding: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
});
