import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, Clock3, FileText} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, Pill} from '@/components/ui';
import {colors, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const cases = [
  {id: 'sq1', year: '2025', title: '股权转让与债权人保护', subject: '民法', questions: 4, minutes: 45, status: '未作答'},
  {id: 'sq2', year: '2024', title: '合同解除与违约责任', subject: '民法', questions: 3, minutes: 35, status: '草稿'},
  {id: 'sq3', year: '2023', title: '共同犯罪与罪数判断', subject: '刑法', questions: 4, minutes: 50, status: '已完成'},
];

export default function SubjectiveSelectScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen>
      <PageHeader title="主观题案例" subtitle="结构化作答训练" />
      <View style={styles.content}>
        <View style={styles.summary}>
          <FileText size={25} color={colors.brand} />
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>案例分析专项</Text>
            <Text style={styles.summaryBody}>先读题、列请求权基础，再完成分问作答。</Text>
          </View>
        </View>
        {cases.map(item => (
          <Pressable key={item.id} onPress={() => navigation.navigate('SubjectiveAnswer', {subjectName: item.subject})}>
            <Card style={styles.caseCard}>
              <View style={styles.topRow}>
                <View style={styles.tagRow}><Pill label={item.subject} /><Text style={styles.year}>{item.year} 年</Text></View>
                <Pill label={item.status} tone={item.status === '已完成' ? 'success' : item.status === '草稿' ? 'warning' : 'neutral'} />
              </View>
              <Text style={styles.caseTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{item.questions} 个小问</Text>
                <Clock3 size={13} color={colors.muted} />
                <Text style={styles.meta}>建议 {item.minutes} 分钟</Text>
                <ChevronRight size={18} color={colors.muted} style={styles.chevron} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  summary: {backgroundColor: colors.brandLight, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', borderRadius: 8, marginBottom: spacing.lg},
  summaryCopy: {flex: 1, marginLeft: spacing.md},
  summaryTitle: {fontSize: 16, fontWeight: '700', color: colors.ink},
  summaryBody: {fontSize: 12, lineHeight: 18, color: colors.body, marginTop: 4},
  caseCard: {marginBottom: spacing.md},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  tagRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  year: {fontSize: 11, color: colors.muted},
  caseTitle: {fontSize: 16, lineHeight: 23, fontWeight: '700', color: colors.ink, marginTop: spacing.md},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md},
  meta: {fontSize: 11, color: colors.muted, marginRight: spacing.sm},
  chevron: {marginLeft: 'auto'},
});
