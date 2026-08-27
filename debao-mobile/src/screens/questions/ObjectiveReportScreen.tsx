import {StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, Clock3, Target, TrendingUp} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, ListRow, SectionTitle} from '@/components/ui';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ObjectiveReport'>;

export default function ObjectiveReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const rate = Math.round((route.params.correct / route.params.total) * 100);
  return (
    <AppScreen>
      <PageHeader title="练习报告" />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>本次正确率</Text>
          <Text style={styles.score}>{rate}<Text style={styles.percent}>%</Text></Text>
          <Text style={styles.heroBody}>{rate >= 80 ? '掌握得不错，继续保持。' : '基础已经建立，建议结合解析再练一组。'}</Text>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}><CheckCircle2 size={20} color={colors.success} /><Text style={styles.metricValue}>{route.params.correct}/{route.params.total}</Text><Text style={styles.metricLabel}>答对</Text></View>
          <View style={styles.metric}><Clock3 size={20} color={colors.warning} /><Text style={styles.metricValue}>03:42</Text><Text style={styles.metricLabel}>用时</Text></View>
          <View style={styles.metric}><TrendingUp size={20} color={colors.brand} /><Text style={styles.metricValue}>+6%</Text><Text style={styles.metricLabel}>较上次</Text></View>
        </View>
        <SectionTitle title="能力分析" />
        <Card style={styles.analysis}>
          <ListRow title="民事法律行为" subtitle="掌握良好 · 继续保持" leading={<Target size={20} color={colors.success} />} />
          <ListRow title="合同履行" subtitle="建议重看买卖不破租赁相关规则" leading={<Target size={20} color={colors.warning} />} />
        </Card>
        <View style={styles.actions}>
          <AppButton label="再练一组" onPress={() => navigation.replace('ObjectiveAnswer', {mode: 'practice'})} />
          <AppButton label="返回题库" variant="secondary" onPress={() => navigation.navigate('MainTabs', {screen: 'Questions'})} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  hero: {backgroundColor: colors.ink, borderRadius: radius.md, alignItems: 'center', padding: spacing.xxl},
  heroLabel: {fontSize: 12, color: '#B6B9C5'},
  score: {fontSize: 58, fontWeight: '900', color: colors.action, marginTop: spacing.sm},
  percent: {fontSize: 22},
  heroBody: {fontSize: 12, color: '#D6D8DF', marginTop: spacing.sm, textAlign: 'center'},
  metrics: {backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg, paddingVertical: spacing.lg},
  metric: {alignItems: 'center', gap: 4},
  metricValue: {fontSize: 15, fontWeight: '800', color: colors.ink},
  metricLabel: {fontSize: 10, color: colors.muted},
  analysis: {paddingVertical: 0},
  actions: {gap: spacing.md, marginTop: spacing.xl},
});
