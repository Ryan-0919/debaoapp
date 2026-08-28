import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckCircle2, Upload} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, ListRow, MockNotice, Pill} from '@/components/ui';
import {colors, radius, spacing} from '@/theme';

export {default as LearningReportScreen} from './LearningReportScreen';
export {default as LearningPlanScreen} from './LearningPlanScreen';
export {default as MistakeBookScreen} from './MistakeBookScreen';
export {default as FavoritesScreen} from './FavoritesScreen';
export {default as LawSearchScreen} from './LawSearchScreen';

export function GradingServiceScreen() {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <AppScreen keyboardAware>
      <PageHeader title="批改服务" />
      <MockNotice text="文件上传和人工批改尚未接入；提交仅改变当前页面的 Mock 状态。" />
      <View style={styles.content}>
        {submitted ? <Card style={styles.successCard}><CheckCircle2 size={34} color={colors.success} /><Text style={styles.successTitle}>Mock 作业已提交</Text><Text style={styles.itemMeta}>服务端接入后，这里将显示批改进度和老师反馈。</Text></Card> : <><Text style={styles.label}>选择题目</Text><Card><Text style={styles.itemTitle}>股权转让与债权人保护</Text><Text style={styles.itemMeta}>民法 · 2025 年案例</Text></Card><Text style={styles.label}>作答内容</Text><TextInput multiline value={answer} onChangeText={setAnswer} placeholder="粘贴或输入答案" placeholderTextColor={colors.muted} style={styles.answerInput} textAlignVertical="top" /><View style={styles.upload}><Upload size={20} color={colors.muted} /><Text style={styles.itemMeta}>图片/PDF 上传能力待接入</Text></View><AppButton label="提交 Mock 批改" disabled={!answer.trim()} onPress={() => setSubmitted(true)} /></>}
      </View>
    </AppScreen>
  );
}

export function QuestionRecordsScreen() {
  return (
    <AppScreen>
      <PageHeader title="答题记录" />
      <View style={styles.content}>
        <Card style={styles.listCard}><ListRow title="股权转让与债权人保护" subtitle="今天 21:42 · Mock 批改中" trailing={<Pill label="批改中" tone="warning" />} /><ListRow title="客观题每日练习" subtitle="今天 20:16 · 正确率 50%" trailing={<Pill label="已完成" tone="success" />} /><ListRow title="合同效力专项练习" subtitle="8 月 26 日 · 正确率 82%" trailing={<Pill label="已完成" tone="success" />} /></Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  itemTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  itemMeta: {fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4},
  listCard: {paddingVertical: 0},
  label: {fontSize: 12, fontWeight: '700', color: colors.body, marginBottom: spacing.sm, marginTop: spacing.lg},
  answerInput: {minHeight: 200, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md, fontSize: 14, lineHeight: 22, color: colors.ink},
  upload: {height: 54, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md},
  successCard: {alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm},
  successTitle: {fontSize: 17, fontWeight: '800', color: colors.ink},
});
