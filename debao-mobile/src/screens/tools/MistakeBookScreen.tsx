import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, ChevronRight, CircleAlert, RefreshCw} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {OBJECTIVE_QUESTIONS} from '@/data/objectiveQuestions';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SUBJECTS = ['全部', '民法', '刑法', '行政法', '民事诉讼法', '刑事诉讼法'];
const MISTAKE_QUESTIONS = OBJECTIVE_QUESTIONS.slice(0, 3).map((question, index) => ({
  ...question,
  wrongCount: [2, 1, 3][index],
  userAnswer: ['B', 'C', 'B'][index],
}));

export default function MistakeBookScreen() {
  const navigation = useNavigation<Navigation>();
  const [filter, setFilter] = useState('全部');

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="mistake-book-screen">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => navigation.goBack()}
          style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>错题本</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.filters}
          showsHorizontalScrollIndicator={false}
          testID="mistake-book-filters">
          {SUBJECTS.map(subject => {
            const selected = filter === subject;
            return (
              <Pressable
                key={subject}
                accessibilityRole="button"
                accessibilityState={{selected}}
                accessibilityLabel={subject}
                testID={`mistake-filter-${subject}`}
                onPress={() => setFilter(subject)}
                style={({pressed}) => [styles.filter, selected && styles.filterSelected, pressed && styles.pressed]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{subject}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="mistake-book-scroll">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>共 3 道错题待复习</Text>
          <View style={styles.redoAction} testID="mistake-redo-action">
            <RefreshCw size={12} color={colors.brand} />
            <Text style={styles.redoText}>一键重做</Text>
          </View>
        </View>

        <View style={styles.cards}>
          {MISTAKE_QUESTIONS.map(question => (
            <Pressable
              key={question.id}
              accessibilityRole="button"
              accessibilityLabel={`${question.subject} ${question.year}年 答错${question.wrongCount}次 ${question.stem} 我的答案：${question.userAnswer} 正确答案：${question.answer}`}
              testID={`mistake-question-${question.id}`}
              onPress={() => navigation.navigate('ObjectiveAnswer', {mode: 'chapter', title: '错题复习'})}
              style={({pressed}) => [styles.questionCard, pressed && styles.cardPressed]}>
              <View style={styles.metaRow}>
                <View style={styles.tag}><Text style={styles.tagText}>{question.subject}</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{question.year}年</Text></View>
                <View style={styles.wrongMeta}>
                  <CircleAlert size={9} color={colors.error} fill={colors.error} />
                  <Text style={styles.wrongText}>答错{question.wrongCount}次</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.stem}>{question.stem}</Text>
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>我的答案：<Text style={styles.wrongAnswer}>{question.userAnswer}</Text></Text>
                <Text style={styles.answerLabel}>正确答案：<Text style={styles.correctAnswer}>{question.answer}</Text></Text>
                <ChevronRight size={14} color="#C0C5D0" style={styles.chevron} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  backButton: {width: 32, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 14, lineHeight: 19, fontWeight: '700', color: colors.ink},
  headerSide: {width: 32},
  filterBar: {height: 43, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  filters: {paddingHorizontal: 16, paddingVertical: 8, gap: 8},
  filter: {height: 27, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  filterSelected: {borderColor: colors.brand, backgroundColor: colors.brand},
  filterText: {fontSize: 12, lineHeight: 16, color: colors.body},
  filterTextSelected: {color: colors.surface, fontWeight: '600'},
  content: {paddingHorizontal: 16, paddingBottom: 24},
  summaryRow: {height: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  summaryText: {fontSize: 12, lineHeight: 17, color: colors.muted},
  redoAction: {height: 32, flexDirection: 'row', alignItems: 'center', gap: 3},
  redoText: {fontSize: 12, lineHeight: 17, color: colors.brand},
  cards: {gap: 8},
  questionCard: {minHeight: 119, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface},
  cardPressed: {opacity: 0.72},
  metaRow: {height: 22, flexDirection: 'row', alignItems: 'center', gap: 8},
  tag: {height: 21, paddingHorizontal: 8, borderRadius: 3, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  tagText: {fontSize: 10, lineHeight: 14, color: colors.body},
  wrongMeta: {marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3},
  wrongText: {fontSize: 11, lineHeight: 15, color: colors.error},
  stem: {fontSize: 13, lineHeight: 20, color: colors.ink, marginTop: 7},
  answerRow: {height: 20, marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 12},
  answerLabel: {fontSize: 12, lineHeight: 17, color: colors.muted},
  wrongAnswer: {color: colors.error, fontWeight: '500'},
  correctAnswer: {color: colors.success, fontWeight: '500'},
  chevron: {marginLeft: 'auto'},
  pressed: {opacity: 0.65},
});
