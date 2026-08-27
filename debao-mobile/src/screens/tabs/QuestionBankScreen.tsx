import {Pressable, StyleSheet, Text, View} from 'react-native';
import {BookMarked, ChevronRight, FileCheck2, Library, PenLine} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {Card, SectionTitle} from '@/components/ui';
import {subjects} from '@/data/mock';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function QuestionBankScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen testID="questions-screen">
      <View style={styles.header}>
        <Text style={styles.title}>题库</Text>
        <Text style={styles.subtitle}>用练习建立稳定的得分能力</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.modeRow}>
          <Pressable style={[styles.mode, styles.objective]} onPress={() => navigation.navigate('ObjectiveAnswer', {mode: 'practice', title: '每日练习'})}>
            <FileCheck2 size={26} color={colors.brand} />
            <Text style={styles.modeTitle}>客观题</Text>
            <Text style={styles.modeBody}>章节练习 · 历年真题</Text>
          </Pressable>
          <Pressable style={[styles.mode, styles.subjective]} onPress={() => navigation.navigate('SubjectiveSelect')}>
            <PenLine size={26} color={colors.error} />
            <Text style={styles.modeTitle}>主观题</Text>
            <Text style={styles.modeBody}>案例分析 · 智能批改</Text>
          </Pressable>
        </View>

        <View style={styles.toolRow}>
          {[
            {label: '错题本', icon: BookMarked, route: 'MistakeBook' as const},
            {label: '我的收藏', icon: Library, route: 'Favorites' as const},
            {label: '答题记录', icon: FileCheck2, route: 'QuestionRecords' as const},
          ].map(item => {
            const Icon = item.icon;
            return (
              <Pressable key={item.label} style={styles.tool} onPress={() => navigation.navigate(item.route)}>
                <Icon size={20} color={colors.body} />
                <Text style={styles.toolText}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle title="按科目练习" />
        <Card style={styles.subjectCard}>
          {subjects.map((subject, index) => (
            <Pressable
              key={subject.id}
              onPress={() => navigation.navigate('ObjectiveAnswer', {mode: 'practice', title: subject.name})}
              style={[styles.subjectRow, index === subjects.length - 1 && styles.lastRow]}>
              <View style={[styles.subjectMark, {backgroundColor: subject.color}]}>
                <Text style={styles.subjectInitial}>{subject.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.subjectCopy}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectCount}>{subject.questionCount.toLocaleString()} 道题</Text>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl, backgroundColor: colors.surface},
  title: {fontSize: 25, fontWeight: '800', color: colors.ink},
  subtitle: {fontSize: 13, color: colors.muted, marginTop: 5},
  content: {paddingHorizontal: spacing.lg},
  modeRow: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg},
  mode: {flex: 1, minHeight: 132, borderRadius: radius.md, padding: spacing.lg},
  objective: {backgroundColor: colors.brandLight},
  subjective: {backgroundColor: colors.rose},
  modeTitle: {fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: spacing.md},
  modeBody: {fontSize: 11, color: colors.body, marginTop: 4},
  toolRow: {flexDirection: 'row', marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md},
  tool: {flex: 1, alignItems: 'center', gap: 7},
  toolText: {fontSize: 12, fontWeight: '600', color: colors.body},
  subjectCard: {paddingVertical: 0},
  subjectRow: {minHeight: 70, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  lastRow: {borderBottomWidth: 0},
  subjectMark: {width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  subjectInitial: {fontSize: 16, fontWeight: '800', color: colors.ink},
  subjectCopy: {flex: 1, marginLeft: spacing.md},
  subjectName: {fontSize: 15, fontWeight: '700', color: colors.ink},
  subjectCount: {fontSize: 11, color: colors.muted, marginTop: 3},
});
