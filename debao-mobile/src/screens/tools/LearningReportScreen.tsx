import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {AlertCircle, ChevronLeft} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const WEEK = [
  {day: '一', bar: 'short'},
  {day: '二', bar: 'tall'},
  {day: '三', bar: 'empty'},
  {day: '四', bar: 'medium'},
  {day: '五', bar: 'tall'},
  {day: '六', bar: 'short'},
  {day: '日', bar: 'empty'},
] as const;

const SUBJECTS = [
  {name: '民法', correct: 78, total: 100, rank: '中等'},
  {name: '刑法', correct: 82, total: 90, rank: '良好'},
  {name: '行政法', correct: 55, total: 80, rank: '较弱'},
  {name: '民事诉讼法', correct: 40, total: 75, rank: '薄弱'},
  {name: '刑事诉讼法', correct: 60, total: 70, rank: '中等'},
  {name: '商法', correct: 25, total: 40, rank: '中等'},
];

function subjectTone(rate: number) {
  if (rate >= 75) {
    return {color: colors.success, backgroundColor: colors.mint};
  }
  if (rate >= 60) {
    return {color: colors.brand, backgroundColor: colors.brandLight};
  }
  return {color: colors.error, backgroundColor: colors.apricot};
}

export default function LearningReportScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="learning-report-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" hitSlop={6} onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>学习报告</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="learning-report-scroll">
        <View style={styles.overview}>
          <Text style={styles.overviewLabel}>本周学习时长</Text>
          <Text style={styles.overviewValue} testID="learning-week-hours">4.2 <Text style={styles.overviewUnit}>小时</Text></Text>
          <View style={styles.chart} testID="learning-week-chart">
            {WEEK.map(item => (
              <View key={item.day} style={styles.chartColumn}>
                <View style={styles.barArea}>
                  <View style={[styles.bar, barStyles[item.bar]]} />
                </View>
                <Text style={styles.day}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.alert}>
          <AlertCircle size={15} color="#D2691E" style={styles.alertIcon} />
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>民事诉讼法需要重点关注</Text>
            <Text style={styles.alertText}>正确率仅 53%，建议本周加强练习</Text>
            <Pressable testID="learning-report-practice" onPress={() => navigation.navigate('ObjectiveAnswer', {mode: 'chapter', title: '民事诉讼法专项'})} style={({pressed}) => [styles.practiceButton, pressed && styles.pressed]}>
              <Text style={styles.practiceText}>进入专项练习 →</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.subjectCard}>
          <Text style={styles.sectionTitle}>各科正确率</Text>
          {SUBJECTS.map(subject => {
            const rate = Math.round((subject.correct / subject.total) * 100);
            const tone = subjectTone(rate);
            return (
              <View key={subject.name} style={styles.subject} testID={`learning-subject-${subject.name}`}>
                <View style={styles.subjectTop}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View style={styles.subjectResult}>
                    <View style={[styles.rank, {backgroundColor: tone.backgroundColor}]}><Text style={[styles.rankText, {color: tone.color}]}>{subject.rank}</Text></View>
                    <Text style={styles.rate}>{rate}%</Text>
                  </View>
                </View>
                <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${rate}%`, backgroundColor: tone.color}]} /></View>
              </View>
            );
          })}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>做题统计</Text>
          <View style={styles.statsRow}>
            {[
              {label: '累计做题', value: '2,847'},
              {label: '正确率', value: '68%'},
              {label: '错题待复习', value: '28'},
            ].map(item => (
              <View key={item.label} style={styles.stat}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 56, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.ink},
  headerSide: {width: 44},
  content: {paddingBottom: 24},
  overview: {height: 169, marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, padding: 16, backgroundColor: colors.surface},
  overviewLabel: {fontSize: 13, lineHeight: 18, color: colors.muted, marginBottom: 1},
  overviewValue: {fontSize: 28, lineHeight: 37, fontWeight: '700', color: colors.ink},
  overviewUnit: {fontSize: 16, fontWeight: '500', color: colors.muted},
  chart: {height: 59, flexDirection: 'row', gap: 4, marginTop: 12},
  chartColumn: {flex: 1, alignItems: 'center'},
  barArea: {width: '100%', height: 40, justifyContent: 'flex-end'},
  bar: {width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4},
  day: {fontSize: 10, lineHeight: 14, color: colors.muted, marginTop: 5},
  alert: {minHeight: 90, marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.apricot},
  alertIcon: {marginTop: 2},
  alertCopy: {flex: 1, marginLeft: 8},
  alertTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: '#D2691E'},
  alertText: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2},
  practiceButton: {minHeight: 26, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 3},
  practiceText: {fontSize: 12, lineHeight: 17, fontWeight: '500', color: colors.brand},
  subjectCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, padding: 16, backgroundColor: colors.surface},
  sectionTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink, marginBottom: 14},
  subject: {height: 49},
  subjectTop: {height: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  subjectName: {fontSize: 13, lineHeight: 18, color: colors.body},
  subjectResult: {flexDirection: 'row', alignItems: 'center', gap: 8},
  rank: {height: 20, borderRadius: radius.sm, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center'},
  rankText: {fontSize: 11, lineHeight: 15, fontWeight: '500'},
  rate: {minWidth: 31, textAlign: 'right', fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink},
  progressTrack: {height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.line, marginTop: 6},
  progressFill: {height: 5, borderRadius: 3},
  statsCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, padding: 16, backgroundColor: colors.surface},
  statsRow: {height: 72, flexDirection: 'row', gap: 12},
  stat: {flex: 1, borderRadius: radius.md, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  statValue: {fontSize: 18, lineHeight: 24, fontWeight: '700', color: colors.ink},
  statLabel: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 4, textAlign: 'center'},
  pressed: {opacity: 0.65},
});

const barStyles = StyleSheet.create({
  empty: {height: 2, backgroundColor: colors.line},
  short: {height: '33.333%', backgroundColor: colors.brand},
  medium: {height: '53.333%', backgroundColor: colors.brand},
  tall: {height: '80%', backgroundColor: colors.brand},
});
