import {useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Check, ChevronDown, ChevronRight, X} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {subjects} from '@/data/mock';
import {questionService} from '@/services';
import {environment} from '@/config/environment';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type QuestionMode = 'objective' | 'subjective';
type ExamVolume = '卷一' | '卷二';

const years = ['2023', '2022', '2021', '2020', '2019', '2018'] as const;

const objectiveChapters = [
  {subject: '民法', chapters: ['民法总则', '物权法', '合同法', '侵权责任法', '婚姻家庭法', '继承法'], done: [42, 28, 15, 8, 0, 0]},
  {subject: '刑法', chapters: ['刑法总论', '刑法分论'], done: [60, 22]},
  {subject: '行政法', chapters: ['行政许可', '行政处罚', '行政诉讼'], done: [30, 18, 5]},
  {subject: '民事诉讼法', chapters: ['诉讼当事人', '证据', '诉讼程序'], done: [12, 0, 0]},
  {subject: '刑事诉讼法', chapters: ['侦查程序', '审判程序', '执行程序'], done: [0, 0, 0]},
];

const subjectTextColors: Record<string, string> = {
  民法: colors.brand,
  刑法: '#D2691E',
  行政法: '#1A8B8B',
  民事诉讼法: '#3A7A46',
  刑事诉讼法: '#A87000',
  商法: '#C0385A',
};

export default function QuestionBankScreen() {
  const navigation = useNavigation<Navigation>();
  const [mode, setMode] = useState<QuestionMode>('objective');
  const [yearSheetVisible, setYearSheetVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<(typeof years)[number]>('2023');
  const [expandedSubject, setExpandedSubject] = useState<string | null>('民法');
  const [volume, setVolume] = useState<ExamVolume>('卷一');
  const [subjectList, setSubjectList] = useState(subjects);

  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    questionService.listSubjects().then(next => { if (active) setSubjectList(next); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <AppScreen scroll={false} testID="questions-screen">
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <View style={styles.topBarCenter}>
          <View accessibilityRole="tablist" style={styles.modeSwitch}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: mode === 'objective'}}
              hitSlop={10}
              onPress={() => setMode('objective')}
              style={[styles.modeButton, mode === 'objective' && styles.modeButtonActive]}
              testID="question-bank-mode-objective">
              <Text style={[styles.modeLabel, mode === 'objective' && styles.modeLabelActive]}>客观题</Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: mode === 'subjective'}}
              hitSlop={10}
              onPress={() => setMode('subjective')}
              style={[styles.modeButton, mode === 'subjective' && styles.modeButtonActive]}
              testID="question-bank-mode-subjective">
              <Text style={[styles.modeLabel, mode === 'subjective' && styles.modeLabelActive]}>主观题</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.topBarSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {mode === 'objective' ? (
          <View testID="question-bank-objective-content">
            <View style={[styles.panel, styles.firstPanel]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>历年真题</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>年份</Text>
                <Pressable
                  accessibilityLabel="选择年份"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setYearSheetVisible(true)}
                  style={styles.yearButton}
                  testID="question-bank-year-selector">
                  <Text style={styles.yearButtonText}>{selectedYear}</Text>
                  <ChevronDown size={14} color={colors.muted} />
                </Pressable>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>卷别</Text>
                <View style={styles.volumeRow}>
                  {(['卷一', '卷二'] as const).map(item => {
                    const selected = volume === item;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{selected}}
                        hitSlop={8}
                        key={item}
                        onPress={() => setVolume(item)}
                        style={[styles.volumeButton, selected && styles.volumeButtonActive]}>
                        <Text style={[styles.volumeText, selected && styles.volumeTextActive]}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={[styles.examRow, styles.lastBorderless]}>
                <View>
                  <Text style={styles.examTitle}>{selectedYear}年 {volume} · 50题</Text>
                  <Text style={styles.examMeta}>预计用时 90 分钟</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => navigation.navigate('ObjectiveAnswer', {
                    mode: 'exam',
                    title: `${selectedYear}真题${volume}`,
                  })}
                  style={({pressed}) => [styles.startButton, pressed && styles.pressed]}
                  testID="question-bank-start-objective-exam">
                  <Text style={styles.startButtonText}>开始做题</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>章节练习</Text>
              </View>
              {objectiveChapters.map(({subject, chapters, done}) => {
                const expanded = expandedSubject === subject;
                const subjectInfo = subjectList.find(item => item.name === subject);
                return (
                  <View key={subject}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{expanded}}
                      testID={`question-bank-subject-${subjectInfo?.id ?? subject}`}
                      onPress={() => setExpandedSubject(expanded ? null : subject)}
                      style={({pressed}) => [styles.subjectRow, pressed && styles.rowPressed]}>
                      <View style={[styles.subjectMark, {backgroundColor: subjectInfo?.color ?? colors.page}]}>
                        <Text style={[styles.subjectInitial, {color: subjectTextColors[subject]}]}>{subject.slice(0, 1)}</Text>
                      </View>
                      <Text style={styles.subjectName}>{subject}</Text>
                      <Text style={styles.chapterCount}>{chapters.length}章</Text>
                      <ChevronDown
                        color="#C0C5D0"
                        size={16}
                        style={expanded ? styles.chevronExpanded : undefined}
                      />
                    </Pressable>
                    {expanded ? chapters.map((chapter, index) => (
                      <Pressable
                        accessibilityRole="button"
                        key={chapter}
                        testID={`question-bank-chapter-${subjectInfo?.id ?? subject}-${index}`}
                        onPress={() => navigation.navigate('ObjectiveAnswer', {
                          mode: 'chapter',
                          title: chapter,
                          subjectId: subjectInfo?.id,
                        })}
                        style={({pressed}) => [styles.chapterRow, pressed && styles.rowPressed]}>
                        <Text style={styles.chapterName}>{chapter}</Text>
                        <Text style={[styles.chapterProgress, done[index] > 0 ? styles.chapterDone : styles.chapterPending]}>
                          {done[index] > 0 ? `已做${done[index]}题` : '未练习'}
                        </Text>
                        <ChevronRight color="#C0C5D0" size={14} />
                      </Pressable>
                    )) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View testID="question-bank-subjective-content">
            <View style={[styles.panel, styles.firstPanel]}>
              <View style={styles.subjectiveHeader}>
                <Text style={styles.panelTitle}>分科真题</Text>
                <Text style={styles.panelSubtitle}>选择科目查看题目，支持按年份和难度筛选</Text>
              </View>
              {subjectList.slice(0, 6).map(subject => (
                <Pressable
                  accessibilityRole="button"
                  key={subject.id}
                  onPress={() => navigation.navigate('SubjectiveSelect', {subject: subject.name})}
                  style={({pressed}) => [styles.subjectiveRow, pressed && styles.rowPressed]}>
                  <View style={[styles.subjectiveMark, {backgroundColor: subject.color}]}>
                    <Text style={[styles.subjectiveInitial, {color: subjectTextColors[subject.name]}]}>{subject.name.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.subjectiveCopy}>
                    <Text style={styles.subjectiveName}>{subject.name}</Text>
                    <Text style={styles.subjectiveMeta}>{subject.name === '民法' ? '32题 · 2018–2023' : '共若干题'}</Text>
                  </View>
                  <ChevronRight color="#C0C5D0" size={16} />
                </Pressable>
              ))}
            </View>

            <View style={styles.panel}>
              <View style={styles.subjectiveHeader}>
                <Text style={styles.panelTitle}>历年整卷</Text>
                <Text style={styles.panelSubtitle}>完整主观题卷，限时模拟考试体验</Text>
              </View>
              {years.slice(0, 4).map(year => (
                <Pressable
                  accessibilityRole="button"
                  key={year}
                  onPress={() => navigation.navigate('SubjectiveSelect')}
                  style={({pressed}) => [styles.subjectiveRow, pressed && styles.rowPressed]}>
                  <View style={styles.subjectiveMark}>
                    <Text style={styles.yearMarkText}>{year.slice(2)}</Text>
                  </View>
                  <View style={styles.subjectiveCopy}>
                    <Text style={styles.subjectiveName}>{year}年主观题</Text>
                    <Text style={styles.subjectiveMeta}>6题 · 建议240分钟</Text>
                  </View>
                  <ChevronRight color="#C0C5D0" size={16} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setYearSheetVisible(false)}
        transparent
        visible={yearSheetVisible}>
        <View style={styles.sheetRoot}>
          <Pressable
            accessibilityLabel="关闭年份选择"
            onPress={() => setYearSheetVisible(false)}
            style={styles.sheetBackdrop}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>选择年份</Text>
              <Pressable
                accessibilityLabel="关闭"
                accessibilityRole="button"
                onPress={() => setYearSheetVisible(false)}
                style={styles.sheetClose}>
                <X color={colors.muted} size={18} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetList}>
              {years.map(year => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{selected: selectedYear === year}}
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                    setYearSheetVisible(false);
                  }}
                  style={({pressed}) => [styles.sheetYearRow, pressed && styles.rowPressed]}>
                  <Text style={[styles.sheetYearText, selectedYear === year && styles.sheetYearTextActive]}>{year}年</Text>
                  {selectedYear === year ? <Check color={colors.brand} size={18} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarSide: {width: 40},
  topBarCenter: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  modeSwitch: {
    height: 32,
    padding: 2,
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.page,
    flexDirection: 'row',
  },
  modeButton: {height: 28, paddingHorizontal: spacing.lg, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center'},
  modeButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  modeLabel: {fontSize: 13, color: colors.muted, fontWeight: '600'},
  modeLabelActive: {color: colors.brand},
  scrollContent: {paddingBottom: spacing.xxl},
  panel: {marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden'},
  firstPanel: {marginTop: spacing.lg},
  panelHeader: {paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  panelTitle: {fontSize: 15, fontWeight: '600', color: colors.ink},
  settingRow: {minHeight: 47, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  settingLabel: {fontSize: 14, color: colors.body},
  yearButton: {flexDirection: 'row', alignItems: 'center', gap: 4},
  yearButtonText: {fontSize: 14, fontWeight: '500', color: colors.ink},
  volumeRow: {flexDirection: 'row', gap: 4},
  volumeButton: {height: 28, paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  volumeButtonActive: {backgroundColor: colors.brand},
  volumeText: {fontSize: 12, color: colors.body, fontWeight: '500'},
  volumeTextActive: {color: colors.surface},
  examRow: {minHeight: 69, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  examTitle: {fontSize: 13, color: colors.body},
  examMeta: {fontSize: 11, color: colors.muted, marginTop: 2},
  startButton: {height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  startButtonText: {fontSize: 13, fontWeight: '500', color: colors.surface},
  lastBorderless: {borderBottomWidth: 0},
  subjectRow: {minHeight: 61, paddingHorizontal: spacing.lg, paddingVertical: 14, gap: spacing.md, flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  subjectMark: {width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  subjectInitial: {fontSize: 12, fontWeight: '700'},
  subjectName: {flex: 1, fontSize: 14, fontWeight: '500', color: colors.ink},
  chapterCount: {fontSize: 12, color: colors.muted},
  chevronExpanded: {transform: [{rotate: '180deg'}]},
  chapterRow: {minHeight: 45, paddingLeft: 60, paddingRight: spacing.lg, paddingVertical: spacing.md, gap: spacing.md, flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  chapterName: {flex: 1, fontSize: 13, color: colors.body},
  chapterProgress: {fontSize: 12},
  chapterDone: {color: colors.success},
  chapterPending: {color: '#C0C5D0'},
  subjectiveHeader: {paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  panelSubtitle: {fontSize: 12, color: colors.muted, marginTop: 2},
  subjectiveRow: {minHeight: 65, paddingHorizontal: spacing.lg, paddingVertical: 14, gap: spacing.md, flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  subjectiveMark: {width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center'},
  subjectiveInitial: {fontSize: 13, fontWeight: '700'},
  subjectiveCopy: {flex: 1, minWidth: 0},
  subjectiveName: {fontSize: 14, fontWeight: '500', color: colors.ink},
  subjectiveMeta: {fontSize: 11, color: colors.muted, marginTop: 2},
  yearMarkText: {fontSize: 11, fontWeight: '700', color: colors.brand},
  pressed: {opacity: 0.7},
  rowPressed: {backgroundColor: colors.page},
  sheetRoot: {flex: 1, justifyContent: 'flex-end'},
  sheetBackdrop: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.overlay},
  sheet: {maxHeight: '70%', paddingBottom: spacing.lg, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.surface, overflow: 'hidden'},
  sheetHeader: {paddingLeft: spacing.xl, paddingRight: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  sheetTitle: {fontSize: 16, fontWeight: '600', color: colors.ink},
  sheetClose: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  sheetList: {paddingTop: spacing.sm},
  sheetYearRow: {minHeight: 52, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth},
  sheetYearText: {fontSize: 15, color: colors.ink},
  sheetYearTextActive: {fontWeight: '600', color: colors.brand},
});
