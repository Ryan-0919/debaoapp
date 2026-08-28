import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Upload} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const gradingRecords = [
  {
    id: 'g1',
    title: '民法·股权转让案例',
    year: '2023',
    status: '已批改',
    score: '38/50',
    feedback: '论点清晰，法条引用准确，建议加强对抗辩权的分析。',
  },
  {
    id: 'g2',
    title: '合同解除与违约责任',
    year: '2022',
    status: '待批改',
  },
];

export default function GradingServiceScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="grading-service-screen">
      <PageHeader title="批改服务" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>批改次数</Text>
            <Text style={styles.remaining}>剩余 8 次</Text>
          </View>
          <View style={styles.progressTrack} testID="grading-progress-track"><View style={styles.progressFill} testID="grading-progress-fill" /></View>
          <Text style={styles.usageMeta}>已使用 2 次 / 共 10 次（含课程权益）</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('SubjectiveAnswer', {questionIndex: 0, subjectName: '民法'})}
          style={({pressed}) => [styles.submitCard, pressed && styles.pressed]}
          testID="grading-submit">
          <Upload color={colors.brand} size={22} />
          <Text style={styles.submitTitle}>提交主观题答案批改</Text>
          <Text style={styles.submitDescription}>选择题目后提交您的书面答案，24小时内反馈</Text>
        </Pressable>

        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>批改记录</Text>
          <View style={styles.historyCard}>
            {gradingRecords.map((record, index) => {
              const completed = record.status === '已批改';
              return (
                <View key={record.id} style={[styles.record, index < gradingRecords.length - 1 && styles.divider]} testID={`grading-record-${record.id}`}>
                  <View style={styles.recordMetaRow}>
                    <View style={[styles.status, completed ? styles.completedStatus : styles.pendingStatus]}>
                      <Text style={[styles.statusText, completed ? styles.completedText : styles.pendingText]}>{record.status}</Text>
                    </View>
                    <Text style={styles.year}>{record.year}年真题</Text>
                    {record.score ? <Text style={styles.score}>{record.score}</Text> : null}
                  </View>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  {record.feedback ? <Text style={styles.feedback}>{record.feedback}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 24},
  usageCard: {marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, padding: 16, backgroundColor: colors.surface},
  usageHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  usageTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  remaining: {fontSize: 13, fontWeight: '600', color: colors.brand},
  progressTrack: {height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8, backgroundColor: colors.line},
  progressFill: {width: '20%', height: '100%', borderRadius: 3, backgroundColor: colors.brand},
  usageMeta: {fontSize: 11, color: colors.muted, marginTop: 6},
  submitCard: {minHeight: 110, marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.brand, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surface},
  pressed: {opacity: 0.8},
  submitTitle: {fontSize: 14, fontWeight: '600', color: colors.brand},
  submitDescription: {fontSize: 12, color: colors.muted, textAlign: 'center'},
  historySection: {marginHorizontal: 16, marginTop: 12},
  sectionLabel: {fontSize: 12, color: colors.muted, marginBottom: 6},
  historyCard: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  record: {padding: 16},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  recordMetaRow: {minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  status: {borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2},
  completedStatus: {backgroundColor: colors.mint},
  pendingStatus: {backgroundColor: colors.gold},
  statusText: {fontSize: 11, fontWeight: '500'},
  completedText: {color: colors.success},
  pendingText: {color: '#A87000'},
  year: {fontSize: 11, color: colors.muted},
  score: {fontSize: 13, fontWeight: '700', color: colors.brand, marginLeft: 'auto'},
  recordTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  feedback: {fontSize: 12, lineHeight: 19, color: colors.body, marginTop: 8, borderRadius: radius.sm, padding: 10, backgroundColor: colors.page},
});
