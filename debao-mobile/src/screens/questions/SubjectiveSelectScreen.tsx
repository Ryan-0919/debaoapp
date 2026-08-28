import {useMemo, useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, ClipboardList, Filter, X} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {SUBJECTIVE_QUESTIONS} from '@/data/subjectiveQuestions';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'SubjectiveSelect'>;
type Difficulty = '易' | '中' | '难';
type Status = 'none' | 'draft' | 'done';

const QUESTIONS = SUBJECTIVE_QUESTIONS;

const DIFFICULTY_COLORS: Record<Difficulty, {background: string; foreground: string}> = {
  易: {background: colors.mint, foreground: '#3A7A46'},
  中: {background: colors.gold, foreground: '#A87000'},
  难: {background: colors.apricot, foreground: '#D2691E'},
};

const STATUS_LABEL: Record<Status, string> = {none: '未作答', draft: '草稿', done: '已完成'};
const STATUS_COLOR: Record<Status, string> = {none: colors.muted, draft: colors.warning, done: colors.success};

function FilterChoice({label, selected, onPress, testID}: {label: string; selected: boolean; onPress: () => void; testID: string}) {
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.filterChoice, selected && styles.filterChoiceSelected]}>
      <Text style={[styles.filterChoiceText, selected && styles.filterChoiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SubjectiveSelectScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const subject = route.params?.subject ?? '民法';
  const [filterVisible, setFilterVisible] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const filtered = useMemo(() => {
    if (subject !== '民法') {
      return [];
    }
    return QUESTIONS.filter(item => (!year || item.year === year) && (!difficulty || item.difficulty === difficulty));
  }, [difficulty, subject, year]);
  const activeFilter = !!year || !!difficulty;

  return (
    <AppScreen scroll={false} testID="subjective-select-screen">
      <PageHeader
        title={`${subject} · 主观题`}
        right={
          <Pressable accessibilityLabel="筛选" testID="subjective-open-filter" hitSlop={9} onPress={() => setFilterVisible(true)} style={styles.headerAction}>
            <Filter size={18} color={activeFilter ? colors.brand : colors.body} />
          </Pressable>
        }
      />

      <View style={styles.subjectHeader}>
        <View style={styles.subjectIcon}><Text style={styles.subjectIconText}>{subject[0]}</Text></View>
        <View style={styles.subjectCopy}>
          <Text style={styles.subjectName}>{subject}</Text>
          <Text style={styles.subjectMeta}>共{filtered.length}题 · 2018–2023真题{activeFilter ? ' · 已筛选' : ''}</Text>
        </View>
        {activeFilter ? <Pressable testID="subjective-clear-filter" onPress={() => {setYear(null); setDifficulty(null);}}><Text style={styles.clearText}>清除筛选</Text></Pressable> : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!filtered.length ? (
          <View testID="subjective-empty" style={styles.empty}>
            <View style={styles.emptyIcon}><ClipboardList size={25} color="#C0C5D0" /></View>
            <Text style={styles.emptyTitle}>{activeFilter ? '暂无符合条件的题目' : '暂无真题数据'}</Text>
            <Text style={styles.emptyText}>{activeFilter ? '请尝试调整筛选条件' : '演示数据仅包含民法科目，其他科目将在正式版本中提供'}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map(item => {
              const originalIndex = QUESTIONS.findIndex(question => question.id === item.id);
              const difficultyPalette = DIFFICULTY_COLORS[item.difficulty];
              return (
                <Pressable
                  key={item.id}
                  testID={`subjective-question-${item.id}`}
                  onPress={() => navigation.navigate('SubjectiveAnswer', {subjectName: subject, questionIndex: originalIndex})}
                  style={({pressed}) => [styles.questionRow, item !== filtered[filtered.length - 1] && styles.questionDivider, pressed && styles.pressed]}>
                  <View style={styles.questionTop}>
                    <View style={styles.yearBadge}><Text style={styles.yearText}>{item.year}年</Text></View>
                    <View style={[styles.difficultyBadge, {backgroundColor: difficultyPalette.background}]}><Text style={[styles.difficultyText, {color: difficultyPalette.foreground}]}>{item.difficulty}</Text></View>
                    <View style={styles.status}><View style={[styles.statusDot, {backgroundColor: STATUS_COLOR[item.status]}]} /><Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text></View>
                  </View>
                  <Text style={styles.questionTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.questionSummary}>{item.summary}</Text>
                  <View style={styles.questionFooter}>
                    <Text style={styles.questionMeta}>{item.subCount}个小问</Text>
                    <Text style={styles.questionMeta}>建议{item.suggestMinutes}分钟</Text>
                    <ChevronRight size={14} color="#C0C5D0" style={styles.chevron} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal transparent animationType="slide" visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.overlay}>
          <Pressable accessibilityLabel="关闭筛选" style={styles.dismiss} onPress={() => setFilterVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>筛选条件</Text><Pressable hitSlop={10} onPress={() => setFilterVisible(false)}><X size={21} color={colors.ink} /></Pressable></View>
            <Text style={styles.filterLabel}>年份</Text>
            <View style={styles.filterRow}>{['2023', '2022', '2021'].map(item => <FilterChoice key={item} testID={`subjective-filter-year-${item}`} label={`${item}年`} selected={year === item} onPress={() => setYear(value => value === item ? null : item)} />)}</View>
            <Text style={styles.filterLabel}>难度</Text>
            <View style={styles.filterRow}>{(['易', '中', '难'] as Difficulty[]).map(item => <FilterChoice key={item} testID={`subjective-filter-difficulty-${item}`} label={item} selected={difficulty === item} onPress={() => setDifficulty(value => value === item ? null : item)} />)}</View>
            <Pressable testID="subjective-filter-confirm" onPress={() => setFilterVisible(false)} style={styles.confirmButton}><Text style={styles.confirmText}>确认</Text></Pressable>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  subjectHeader: {height: 67, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center'},
  subjectIcon: {width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  subjectIconText: {fontSize: 15, fontWeight: '800', color: colors.brand},
  subjectCopy: {flex: 1, marginLeft: 12},
  subjectName: {fontSize: 14, fontWeight: '700', color: colors.ink},
  subjectMeta: {fontSize: 11, color: colors.muted, marginTop: 4},
  clearText: {fontSize: 11, color: colors.brand},
  scrollContent: {paddingBottom: 24},
  list: {marginHorizontal: 16, marginTop: 12, backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden'},
  questionRow: {paddingHorizontal: 16, paddingVertical: 15},
  questionDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  questionTop: {height: 21, flexDirection: 'row', alignItems: 'center', gap: 7},
  yearBadge: {paddingHorizontal: 6, height: 20, borderRadius: 4, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  yearText: {fontSize: 10, color: colors.muted},
  difficultyBadge: {width: 25, height: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center'},
  difficultyText: {fontSize: 10, fontWeight: '600'},
  status: {marginLeft: 'auto', flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  statusText: {fontSize: 10, color: colors.muted},
  questionTitle: {fontSize: 14, lineHeight: 19, fontWeight: '700', color: colors.ink, marginTop: 8},
  questionSummary: {fontSize: 11, lineHeight: 18, color: colors.body, marginTop: 5},
  questionFooter: {flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 9},
  questionMeta: {fontSize: 10, color: colors.muted},
  chevron: {marginLeft: 'auto'},
  pressed: {backgroundColor: colors.page},
  empty: {alignItems: 'center', paddingTop: 64, paddingHorizontal: 34},
  emptyIcon: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#ECEEF1', alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 13},
  emptyText: {fontSize: 11, lineHeight: 18, color: colors.muted, textAlign: 'center', marginTop: 5},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay},
  dismiss: {flex: 1},
  sheet: {backgroundColor: colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 20, paddingTop: 17, paddingBottom: 30},
  sheetHeader: {height: 31, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14},
  sheetTitle: {fontSize: 18, fontWeight: '700', color: colors.ink},
  filterLabel: {fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 10},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20},
  filterChoice: {height: 32, minWidth: 56, paddingHorizontal: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  filterChoiceSelected: {backgroundColor: colors.brand, borderColor: colors.brand},
  filterChoiceText: {fontSize: 12, color: colors.body},
  filterChoiceTextSelected: {color: colors.surface, fontWeight: '600'},
  confirmButton: {height: 44, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginTop: 2},
  confirmText: {fontSize: 14, fontWeight: '700', color: colors.surface},
});
