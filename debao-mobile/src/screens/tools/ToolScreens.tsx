import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {BookMarked, CheckCircle2, FileSearch, Search, Upload} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, EmptyState, ListRow, MockNotice, Pill} from '@/components/ui';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export {default as LearningReportScreen} from './LearningReportScreen';
export {default as LearningPlanScreen} from './LearningPlanScreen';
export {default as MistakeBookScreen} from './MistakeBookScreen';


export function FavoritesScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen>
      <PageHeader title="我的收藏" />
      <View style={styles.content}>
        <Card style={styles.listCard}><ListRow title="民事法律行为的效力" subtitle="客观题 · 民法" leading={<BookMarked size={20} color={colors.brand} />} onPress={() => navigation.navigate('ObjectiveAnswer', {title: '收藏练习'})} /><ListRow title="合同解除与违约责任" subtitle="主观题 · 民法" leading={<BookMarked size={20} color={colors.brand} />} onPress={() => navigation.navigate('SubjectiveAnswer', {subjectName: '民法'})} /></Card>
      </View>
    </AppScreen>
  );
}

const laws = [
  {title: '民法典 第五百九十五条', body: '买卖合同是出卖人转移标的物的所有权于买受人，买受人支付价款的合同。'},
  {title: '民法典 第七百二十五条', body: '租赁物在承租人按照租赁合同占有期限内发生所有权变动的，不影响租赁合同的效力。'},
  {title: '民法典 第一百四十三条', body: '具备相应民事行为能力、意思表示真实且不违反强制性规定的民事法律行为有效。'},
];

export function LawSearchScreen() {
  const [query, setQuery] = useState('');
  const results = laws.filter(item => `${item.title}${item.body}`.includes(query.trim()));
  return (
    <AppScreen keyboardAware>
      <PageHeader title="法条检索" />
      <View style={styles.searchBox}><Search size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="输入法条、关键词或条文号" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      <MockNotice text="当前仅检索本地示例法条，不代表完整或最新的法律法规数据库。" />
      <View style={styles.content}>
        {results.length === 0 ? <EmptyState title="没有匹配结果" description="尝试搜索“买卖”“租赁”或“民事法律行为”。" /> : results.map(item => <Card key={item.title} style={styles.lawCard}><View style={styles.lawTitleRow}><FileSearch size={19} color={colors.brand} /><Text style={styles.itemTitle}>{item.title}</Text></View><Text style={styles.lawBody}>{item.body}</Text></Card>)}
      </View>
    </AppScreen>
  );
}

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
  metricRow: {flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.lg, marginTop: spacing.lg},
  metric: {alignItems: 'center'},
  metricValue: {fontSize: 18, fontWeight: '800', color: colors.ink},
  metricLabel: {fontSize: 10, color: colors.muted, marginTop: 4},
  itemTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  itemMeta: {fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4},
  listCard: {paddingVertical: 0},
  searchBox: {height: 52, margin: spacing.lg, marginBottom: 0, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center'},
  searchInput: {flex: 1, marginLeft: spacing.sm, fontSize: 14, color: colors.ink},
  lawCard: {marginBottom: spacing.md},
  lawTitleRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
  lawBody: {fontSize: 13, lineHeight: 22, color: colors.body, marginTop: spacing.md},
  label: {fontSize: 12, fontWeight: '700', color: colors.body, marginBottom: spacing.sm, marginTop: spacing.lg},
  answerInput: {minHeight: 200, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md, fontSize: 14, lineHeight: 22, color: colors.ink},
  upload: {height: 54, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md},
  successCard: {alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm},
  successTitle: {fontSize: 17, fontWeight: '800', color: colors.ink},
});
