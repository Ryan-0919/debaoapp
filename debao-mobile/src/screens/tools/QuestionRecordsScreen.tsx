import {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {questionService} from '@/services';
import type {QuestionRecord} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const records = [
  {id: 'r1', date: '今天', time: '21:05', mode: '章节练习', title: '民法·物权法', count: 20, correct: 15},
  {id: 'r2', date: '昨天', time: '20:30', mode: '历年真题', title: '2023年卷一', count: 50, correct: 36},
  {id: 'r3', date: '8月24日', time: '19:15', mode: '章节练习', title: '刑法·总论', count: 15, correct: 12},
  {id: 'r4', date: '8月23日', time: '21:40', mode: '章节练习', title: '民法·合同法', count: 25, correct: 17},
];

function toUiRecord(item: QuestionRecord) {
  const date = new Date(item.createdAt);
  const validDate = !Number.isNaN(date.getTime());
  return {id: item.id, date: validDate ? date.toLocaleDateString('zh-CN', {month: 'numeric', day: 'numeric'}) : item.createdAt, time: validDate ? date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', hour12: false}) : '', mode: '在线练习', title: `题目 ${item.questionId}`, count: 1, correct: item.correct ? 1 : 0};
}

export default function QuestionRecordsScreen() {
  const navigation = useNavigation<Navigation>();
  const [recordList, setRecordList] = useState(records);
  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    questionService.listRecords().then(items => { if (active) setRecordList(items.map(toUiRecord)); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const totals = useMemo(() => {
    if (environment.useMocks) return {answered: 2847, correctRate: 68};
    const answered = recordList.reduce((sum, item) => sum + item.count, 0);
    const correct = recordList.reduce((sum, item) => sum + item.correct, 0);
    return {answered, correctRate: answered ? Math.round((correct / answered) * 100) : 0};
  }, [recordList]);

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="question-records-screen">
      <PageHeader title="做题记录" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totals.answered.toLocaleString()}</Text>
            <Text style={styles.statLabel}>累计做题</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totals.correctRate}%</Text>
            <Text style={styles.statLabel}>正确率</Text>
          </View>
        </View>

        <View style={styles.recordsCard}>
          {recordList.map((record, index) => {
            const rate = Math.round((record.correct / record.count) * 100);
            const successful = rate >= 70;
            const accessibilityLabel = `${record.mode} ${record.date} ${record.time} ${record.title} ${record.count}题 · 正确${record.correct}题 · 正确率${rate}%`;

            return (
              <Pressable
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                key={record.id}
                onPress={() => navigation.navigate('ObjectiveReport', environment.useMocks ? {correct: 3, total: 4} : {correct: record.correct, total: record.count})}
                style={({pressed}) => [
                  styles.record,
                  index < recordList.length - 1 && styles.recordDivider,
                  pressed && styles.pressed,
                ]}
                testID={`question-record-${record.id}`}>
                <View style={styles.recordCopy}>
                  <View style={styles.metaRow}>
                    <View style={styles.modeTag}><Text style={styles.modeText}>{record.mode}</Text></View>
                    <Text style={styles.dateText}>{record.date} {record.time}</Text>
                  </View>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.resultText}>
                    {record.count}题 · 正确{record.correct}题 · 正确率
                    <Text style={successful ? styles.successRate : styles.errorRate}>{rate}%</Text>
                  </Text>
                </View>
                <ChevronRight color="#C0C5D0" size={16} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 24},
  statsCard: {height: 76, marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'stretch'},
  stat: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  statDivider: {width: StyleSheet.hairlineWidth, marginVertical: 16, backgroundColor: colors.line},
  statValue: {fontSize: 20, lineHeight: 25, fontWeight: '700', color: colors.brand},
  statLabel: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 4},
  recordsCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  record: {minHeight: 88, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface},
  recordDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  recordCopy: {flex: 1, minWidth: 0},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
  modeTag: {borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.page},
  modeText: {fontSize: 11, lineHeight: 15, fontWeight: '500', color: colors.muted},
  dateText: {fontSize: 11, lineHeight: 15, color: colors.muted},
  recordTitle: {fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.ink},
  resultText: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2},
  successRate: {color: colors.success},
  errorRate: {color: colors.error},
  pressed: {backgroundColor: colors.page},
});
