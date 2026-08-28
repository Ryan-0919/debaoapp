import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, ChevronLeft, XCircle} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {OBJECTIVE_QUESTIONS} from '@/data/objectiveQuestions';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ObjectiveReport'>;

const REVIEW_ANSWERS = ['D', 'B', 'A', 'A'];

export default function ObjectiveReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const total = route.params.total;
  const correct = Math.min(route.params.correct, total);
  const wrong = Math.max(0, total - correct);
  const score = total ? Math.round((correct / total) * 100) : 0;

  return (
    <AppScreen scroll={false} testID="objective-report-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" testID="objective-report-back" hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerSide}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>答题报告</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <SubjectProgress name="民法" value="2/3" progress={2 / 3} color={colors.error} />
          <SubjectProgress name="刑法" value="1/1" progress={1} color={colors.success} last />
        </View>

        <Text style={[styles.sectionTitle, styles.reviewTitle]}>逐题解析</Text>
        {OBJECTIVE_QUESTIONS.map((question, index) => {
          const userAnswer = REVIEW_ANSWERS[index];
          const isRight = userAnswer === question.answer;
          return (
            <View key={question.id} testID={`objective-review-${index}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {isRight ? <CheckCircle2 size={16} color={colors.success} /> : <XCircle size={16} color={colors.error} />}
                <Text numberOfLines={2} style={styles.reviewStem}>{question.stem}</Text>
              </View>
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>你的答案：<Text style={[styles.answerValue, isRight ? styles.answerRight : styles.answerWrong]}>{userAnswer}</Text></Text>
                <Text style={styles.answerLabel}>正确答案：<Text style={styles.answerCorrect}>{question.answer}</Text></Text>
              </View>
              <View style={styles.explanationBox}>
                <Text numberOfLines={3} style={styles.explanation}>{question.explanation}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

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
  explanation: {fontSize: 12, lineHeight: 19, color: colors.muted},
  footer: {height: 68, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', gap: 8},
  footerSecondary: {height: 44, flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  footerPrimary: {height: 44, flex: 1, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  footerSecondaryText: {fontSize: 14, color: colors.body},
  footerPrimaryText: {fontSize: 14, fontWeight: '700', color: colors.surface},
  pressed: {opacity: 0.62},
  primaryPressed: {backgroundColor: colors.brandDark},
});
