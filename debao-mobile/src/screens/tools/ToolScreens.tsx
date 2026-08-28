import {StyleSheet, View} from 'react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, ListRow, Pill} from '@/components/ui';
import {spacing} from '@/theme';

export {default as LearningReportScreen} from './LearningReportScreen';
export {default as LearningPlanScreen} from './LearningPlanScreen';
export {default as MistakeBookScreen} from './MistakeBookScreen';
export {default as FavoritesScreen} from './FavoritesScreen';
export {default as LawSearchScreen} from './LawSearchScreen';
export {default as GradingServiceScreen} from './GradingServiceScreen';

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
  listCard: {paddingVertical: 0},
});
