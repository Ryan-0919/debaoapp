import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import {
  BookOpen,
  ChevronLeft,
  Download,
  List,
  Pause,
  PenLine,
  Play,
  Repeat,
  Share2,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {findCourse} from '@/data/courses';
import {colors, radius, shadows} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {MediaAvailabilityNotice} from './MediaAvailabilityNotice';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'AudioPlayer'>;
type AudioTab = 'transcript' | 'notes' | 'catalog';

interface TranscriptSegment {
  timestamp: number;
  text: string;
}

interface Note {
  id: number;
  timestamp: string;
  text: string;
}

const TOTAL_SECONDS = 720;
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const TRANSCRIPT: TranscriptSegment[] = [
  {timestamp: 0, text: '同学们好，今天我们学习物权法中一个非常重要的概念——物权变动。'},
  {timestamp: 12, text: '物权变动，就是物权的产生、变更和消灭。听起来抽象，但实际上你每天都在经历它。'},
  {timestamp: 26, text: '比如你买了一支笔，那支笔所有权就发生了变动，从卖家转移到你。'},
  {timestamp: 40, text: '民法典第208条明确规定：不动产物权的变动，以登记为生效要件。'},
  {timestamp: 58, text: '这意味着，哪怕你签了合同、付了钱，只要没办理过户登记，法律上你还不是房子的主人。'},
  {timestamp: 75, text: '这和我们的生活直觉不一样，所以很多同学在这里出错。记住：不动产=登记。'},
  {timestamp: 92, text: '动产就简单多了，动产物权自交付时发生效力。给你了，就是你的。'},
  {timestamp: 108, text: '好，接下来我们讲善意取得制度，这是客观题的高频考点……'},
  {timestamp: 124, text: '善意取得的三个要件：第一，无权处分；第二，受让人善意；第三，已完成交付或登记。'},
  {timestamp: 145, text: '三个条件缺一不可。缺了任何一个，善意取得就不成立。'},
];
const INITIAL_NOTES: Note[] = [
  {id: 1, timestamp: '00:40', text: '民法典第208条：不动产登记生效'},
  {id: 2, timestamp: '02:04', text: '善意取得三要件：无权处分、善意、交付/登记'},
];
const WAVEFORM = Array.from({length: 48}, (_, index) => 0.15 + (Math.sin(index * 1.7) * 0.5 + 0.5) * 0.85);

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export default function AudioPlayerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const course = useMemo(() => findCourse(route.params.courseId), [route.params.courseId]);
  const lessons = useMemo(() => course.chapters.flatMap(chapter => chapter.lessons), [course]);
  const currentLesson = route.params.lessonId
    ? lessons.find(lesson => lesson.id === route.params.lessonId)
    : lessons.find(lesson => lesson.current) ?? lessons[0];
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(38);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [loop, setLoop] = useState(false);
  const [tab, setTab] = useState<AudioTab>('transcript');
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [waveformWidth, setWaveformWidth] = useState(1);
  const noteId = useRef(3);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = setInterval(() => {
      setElapsed(value => {
        const next = value + 1;
        if (next >= TOTAL_SECONDS) {
          if (loop) {
            return 0;
          }
          setPlaying(false);
          return TOTAL_SECONDS;
        }
        return next;
      });
    }, 1000 / speed);
    return () => clearInterval(timer);
  }, [loop, playing, speed]);

  const activeBars = Math.round((elapsed / TOTAL_SECONDS) * WAVEFORM.length);
  const currentTranscriptIndex = TRANSCRIPT.reduce(
    (result, segment, index) => segment.timestamp <= elapsed ? index : result,
    0,
  );

  const moveBy = (seconds: number) => {
    setElapsed(value => Math.max(0, Math.min(TOTAL_SECONDS, value + seconds)));
  };
  const measureWaveform = (event: LayoutChangeEvent) => {
    setWaveformWidth(event.nativeEvent.layout.width || 1);
  };
  const seekWaveform = (event: GestureResponderEvent) => {
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / waveformWidth));
    setElapsed(Math.round(ratio * TOTAL_SECONDS));
  };
  const addNote = () => {
    const text = noteInput.trim();
    if (!text) {
      return;
    }
    setNotes(items => [{id: noteId.current++, timestamp: formatTime(elapsed), text}, ...items]);
    setNoteInput('');
  };

  return (
    <AppScreen scroll={false} keyboardAware backgroundColor={colors.page} testID="audio-player-screen">
      <View style={styles.screen}>
        <MediaAvailabilityNotice courseId={route.params.courseId} kind="audio" />
        <View style={styles.header}>
          <Pressable accessibilityLabel="返回" hitSlop={6} onPress={() => navigation.goBack()} style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}>
            <ChevronLeft size={20} color={colors.body} />
          </Pressable>
          <Text style={styles.headerTitle}>音频课程</Text>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="分享音频" hitSlop={6} style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}>
              <Share2 size={17} color={colors.body} />
            </Pressable>
            <Pressable accessibilityLabel="下载音频" hitSlop={6} style={({pressed}) => [styles.headerButton, pressed && styles.pressed]}>
              <Download size={17} color={colors.body} />
            </Pressable>
          </View>
        </View>

        <View style={styles.playerCard}>
          <View style={styles.courseRow}>
            <View style={[styles.coverFrame, playing && styles.coverFramePlaying]}>
              <Image source={course.image} resizeMode="cover" style={styles.cover} />
              {playing ? (
                <View style={styles.playingBadge} testID="audio-playing-badge">
                  {[7, 11, 8].map((height, index) => <View key={index} style={[styles.playingBar, {height}]} />)}
                </View>
              ) : null}
            </View>
            <View style={styles.courseCopy}>
              <Text numberOfLines={2} style={styles.lessonTitle} testID="audio-lesson-title">{currentLesson?.title ?? course.currentLesson}</Text>
              <Text style={styles.teacher}>{course.teacher}主讲</Text>
              <Text numberOfLines={1} style={styles.courseName}>{course.name}</Text>
            </View>
          </View>

          <Pressable accessibilityLabel="音频进度" testID="audio-waveform" onLayout={measureWaveform} onPress={seekWaveform} style={styles.waveform}>
            {WAVEFORM.map((height, index) => (
              <View key={index} style={[styles.waveBar, {height: `${height * 100}%`}, index < activeBars ? styles.waveBarActive : undefined]} />
            ))}
          </Pressable>
          <View style={styles.timeRow}>
            <Text style={styles.timeText} testID="audio-elapsed">{formatTime(elapsed)}</Text>
            <Text style={styles.timeText}>{formatTime(TOTAL_SECONDS)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable accessibilityLabel="循环播放" accessibilityState={{selected: loop}} testID="audio-loop" onPress={() => setLoop(value => !value)} style={({pressed}) => [styles.controlTouch, loop && styles.loopActive, pressed && styles.pressed]}>
              <Repeat size={18} color={loop ? colors.brand : '#C0C5D0'} />
            </Pressable>
            <Pressable accessibilityLabel="后退15秒" testID="audio-skip-back" onPress={() => moveBy(-15)} style={({pressed}) => [styles.skipControl, pressed && styles.pressed]}>
              <SkipBack size={22} color={colors.body} />
              <Text style={styles.skipText}>15s</Text>
            </Pressable>
            <Pressable accessibilityLabel={playing ? '暂停' : '播放'} testID="audio-play" onPress={() => setPlaying(value => !value)} style={({pressed}) => [styles.playButton, pressed && styles.playButtonPressed]}>
              {playing ? <Pause size={24} color={colors.surface} fill={colors.surface} /> : <Play size={24} color={colors.surface} fill={colors.surface} style={styles.playIcon} />}
            </Pressable>
            <Pressable accessibilityLabel="前进15秒" testID="audio-skip-forward" onPress={() => moveBy(15)} style={({pressed}) => [styles.skipControl, pressed && styles.pressed]}>
              <SkipForward size={22} color={colors.body} />
              <Text style={styles.skipText}>15s</Text>
            </Pressable>
            <Pressable accessibilityLabel="播放倍速" testID="audio-speed-button" onPress={() => setShowSpeed(value => !value)} style={({pressed}) => [styles.speedButton, pressed && styles.pressed]}>
              <Text numberOfLines={1} style={styles.speedButtonText}>{speed}x</Text>
            </Pressable>
          </View>

          {showSpeed ? (
            <View style={styles.speedMenu} testID="audio-speed-menu">
              {SPEED_OPTIONS.map(option => {
                const selected = speed === option;
                return (
                  <Pressable key={option} testID={`audio-speed-${option}`} onPress={() => {setSpeed(option); setShowSpeed(false);}} style={({pressed}) => [styles.speedOption, selected && styles.speedOptionSelected, pressed && styles.speedOptionPressed]}>
                    <Text numberOfLines={1} style={[styles.speedOptionText, selected && styles.speedOptionTextSelected]}>{option === 1 ? '正常' : `${option}x`}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.tabs}>
          {(['transcript', 'notes', 'catalog'] as AudioTab[]).map(item => {
            const selected = tab === item;
            const labels: Record<AudioTab, string> = {transcript: '字幕', notes: '笔记', catalog: '目录'};
            const icons = {transcript: BookOpen, notes: PenLine, catalog: List};
            const Icon = icons[item];
            return (
              <Pressable accessibilityRole="tab" accessibilityState={{selected}} key={item} testID={`audio-tab-${item}`} onPress={() => {setTab(item); setShowSpeed(false);}} style={[styles.tab, selected && styles.tabSelected]}>
                <Icon size={13} color={selected ? colors.surface : colors.muted} />
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{labels[item]}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'transcript' ? (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.transcriptContent} showsVerticalScrollIndicator={false} testID="audio-transcript">
            {TRANSCRIPT.map((segment, index) => {
              const selected = index === currentTranscriptIndex;
              return (
                <Pressable key={segment.timestamp} testID={`audio-transcript-${segment.timestamp}`} onPress={() => setElapsed(segment.timestamp)} style={({pressed}) => [styles.transcriptCard, selected && styles.transcriptCardCurrent, pressed && styles.pressed]}>
                  <Text style={[styles.transcriptTime, selected && styles.transcriptTimeCurrent]}>{formatTime(segment.timestamp)}</Text>
                  <Text style={[styles.transcriptText, selected && styles.transcriptTextCurrent]}>{segment.text}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {tab === 'notes' ? (
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.tabContent} contentContainerStyle={styles.notesContent} showsVerticalScrollIndicator={false} testID="audio-notes">
            <View style={styles.noteEditor}>
              <View style={styles.noteTimeRow}>
                <PenLine size={13} color={colors.brand} />
                <Text style={styles.noteTime}>{formatTime(elapsed)}</Text>
              </View>
              <TextInput multiline numberOfLines={2} value={noteInput} onChangeText={setNoteInput} placeholder="记下这个时间点的重点..." placeholderTextColor="#C0C5D0" style={styles.noteInput} testID="audio-note-input" />
              <View style={styles.saveRow}>
                <Pressable accessibilityRole="button" disabled={!noteInput.trim()} testID="audio-note-save" onPress={addNote} style={({pressed}) => [styles.saveButton, !noteInput.trim() && styles.saveButtonDisabled, pressed && styles.pressed]}>
                  <Text style={styles.saveText}>保存</Text>
                </Pressable>
              </View>
            </View>
            {notes.map(note => (
              <View key={note.id} style={styles.noteCard} testID={`audio-note-${note.id}`}>
                <Text style={styles.noteTime}>{note.timestamp}</Text>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {tab === 'catalog' ? (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.catalogContent} showsVerticalScrollIndicator={false} testID="audio-catalog">
            <View style={styles.catalogCard}>
              {lessons.map((lesson, index) => {
                const selected = lesson.id === currentLesson?.id;
                return (
                  <Pressable key={lesson.id} testID={`audio-lesson-${lesson.id}`} onPress={() => navigation.replace('AudioPlayer', {courseId: course.id, lessonId: lesson.id})} style={({pressed}) => [styles.catalogRow, selected && styles.catalogRowCurrent, pressed && styles.pressed]}>
                    <Text style={[styles.catalogIndex, selected && styles.catalogCurrent]}>{index + 1}</Text>
                    <Text numberOfLines={1} style={[styles.catalogTitle, lesson.done && styles.catalogDone, selected && styles.catalogCurrent]}>{lesson.title}</Text>
                    <Text style={styles.catalogDuration}>{lesson.duration}</Text>
                    {selected && playing ? <View style={styles.catalogPlaying}>{[8, 13, 10].map((height, barIndex) => <View key={barIndex} style={[styles.catalogPlayingBar, {height}]} />)}</View> : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.page},
  header: {height: 56, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.ink},
  headerActions: {width: 88, flexDirection: 'row'},
  playerCard: {height: 282, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20, backgroundColor: colors.surface, ...shadows.card},
  courseRow: {height: 80, flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  coverFrame: {width: 80, height: 80, borderRadius: 12, borderWidth: 0, borderColor: colors.brand},
  coverFramePlaying: {borderWidth: 2},
  cover: {width: '100%', height: '100%', borderRadius: 10},
  playingBadge: {position: 'absolute', right: -5, bottom: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand, flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center'},
  playingBar: {width: 2, borderRadius: 1, backgroundColor: colors.surface},
  courseCopy: {flex: 1, minWidth: 0, marginLeft: 16},
  lessonTitle: {fontSize: 15, lineHeight: 20, fontWeight: '700', color: colors.ink},
  teacher: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 4},
  courseName: {fontSize: 11, lineHeight: 15, color: '#C0C5D0', marginTop: 1},
  waveform: {height: 40, flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 8},
  waveBar: {flex: 1, minWidth: 2, borderRadius: 2, backgroundColor: colors.line},
  waveBarActive: {backgroundColor: colors.brand},
  timeRow: {height: 15, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  timeText: {fontSize: 11, lineHeight: 15, color: '#C0C5D0'},
  controls: {height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  controlTouch: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  loopActive: {backgroundColor: colors.brandLight},
  skipControl: {width: 44, height: 48, alignItems: 'center', justifyContent: 'center'},
  skipText: {fontSize: 9, lineHeight: 11, color: '#C0C5D0', marginTop: 1},
  playButton: {width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: colors.brand, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.28, shadowRadius: 8},
  playButtonPressed: {opacity: 0.84, transform: [{scale: 0.96}]},
  playIcon: {marginLeft: 3},
  speedButton: {width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  speedButtonText: {fontSize: 11, lineHeight: 15, fontWeight: '700', color: colors.body},
  speedMenu: {...shadows.card, position: 'absolute', zIndex: 10, elevation: 10, right: 20, bottom: 72, width: 96, borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.surface},
  speedOption: {height: 40, paddingHorizontal: 12, justifyContent: 'center'},
  speedOptionSelected: {backgroundColor: colors.brandLight},
  speedOptionPressed: {backgroundColor: colors.page},
  speedOptionText: {fontSize: 13, lineHeight: 18, color: colors.body},
  speedOptionTextSelected: {fontWeight: '600', color: colors.brand},
  tabs: {height: 39, marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, flexDirection: 'row', backgroundColor: colors.surface},
  tab: {flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center'},
  tabSelected: {backgroundColor: colors.brand},
  tabText: {fontSize: 12, lineHeight: 17, fontWeight: '500', color: colors.muted},
  tabTextSelected: {color: colors.surface},
  tabContent: {flex: 1, marginTop: 12},
  transcriptContent: {paddingHorizontal: 16, paddingBottom: 24},
  transcriptCard: {minHeight: 76, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, backgroundColor: colors.surface},
  transcriptCardCurrent: {borderLeftWidth: 2, borderLeftColor: colors.brand, backgroundColor: colors.brandLight},
  transcriptTime: {fontSize: 11, lineHeight: 15, fontWeight: '500', color: '#C0C5D0', marginBottom: 3},
  transcriptTimeCurrent: {color: colors.brand},
  transcriptText: {fontSize: 13, lineHeight: 21, color: colors.body},
  transcriptTextCurrent: {fontWeight: '500', color: colors.ink},
  notesContent: {paddingHorizontal: 16, paddingBottom: 24},
  noteEditor: {minHeight: 137, borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: colors.surface, elevation: 1},
  noteTimeRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6},
  noteTime: {fontSize: 11, lineHeight: 15, fontWeight: '500', color: colors.brand},
  noteInput: {height: 50, padding: 0, fontSize: 13, lineHeight: 20, color: colors.ink, textAlignVertical: 'top'},
  saveRow: {alignItems: 'flex-end', marginTop: 2},
  saveButton: {height: 32, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  saveButtonDisabled: {opacity: 0.4},
  saveText: {fontSize: 12, lineHeight: 17, fontWeight: '600', color: colors.surface},
  noteCard: {minHeight: 67, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8, backgroundColor: colors.surface, elevation: 1},
  noteText: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 4},
  catalogContent: {paddingHorizontal: 16, paddingBottom: 24},
  catalogCard: {borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, elevation: 1},
  catalogRow: {height: 49, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center'},
  catalogRowCurrent: {backgroundColor: colors.brandLight},
  catalogIndex: {width: 20, marginRight: 12, textAlign: 'right', fontSize: 11, color: '#C0C5D0'},
  catalogTitle: {flex: 1, fontSize: 13, color: colors.body},
  catalogDone: {color: colors.muted},
  catalogCurrent: {fontWeight: '600', color: colors.brand},
  catalogDuration: {fontSize: 11, color: '#C0C5D0', marginLeft: 10},
  catalogPlaying: {width: 17, height: 14, marginLeft: 8, flexDirection: 'row', gap: 2, alignItems: 'flex-end'},
  catalogPlayingBar: {width: 2, borderRadius: 1, backgroundColor: colors.brand},
  pressed: {opacity: 0.68},
});
