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
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Circle,
  Download,
  Expand,
  Pause,
  PenLine,
  Play,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {findCourse, type CourseLesson} from '@/data/courses';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'VideoPlayer'>;
type VideoTab = 'catalog' | 'handout' | 'notes';

interface Note {
  id: number;
  timestamp: string;
  text: string;
}

const TOTAL_SECONDS = 1200;
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const INITIAL_NOTES: Note[] = [
  {id: 1, timestamp: '05:32', text: '物权变动的生效要件：动产交付，不动产登记'},
  {id: 2, timestamp: '12:14', text: '善意取得的三个构成要件：无权处分、受让人善意、已交付或登记'},
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function LessonIcon({lesson, current}: {lesson: CourseLesson; current: boolean}) {
  if (lesson.done) {
    return <CheckCircle size={15} color={colors.success} />;
  }
  if (current) {
    return <Play size={15} color={colors.brand} fill={colors.brand} />;
  }
  return <Circle size={15} color="#C0C5D0" />;
}

export default function VideoPlayerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const course = useMemo(() => findCourse(route.params.courseId), [route.params.courseId]);
  const lessons = useMemo(() => course.chapters.flatMap(chapter => chapter.lessons), [course]);
  const currentLesson = route.params.lessonId
    ? lessons.find(lesson => lesson.id === route.params.lessonId)
    : lessons.find(lesson => lesson.current) ?? lessons[0];
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(338);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [tab, setTab] = useState<VideoTab>('catalog');
  const [openChapter, setOpenChapter] = useState(0);
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [progressWidth, setProgressWidth] = useState(1);
  const noteId = useRef(3);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = setInterval(() => {
      setElapsed(value => {
        const next = Math.min(value + 1, TOTAL_SECONDS);
        if (next === TOTAL_SECONDS) {
          setPlaying(false);
        }
        return next;
      });
    }, 1000 / speed);
    return () => clearInterval(timer);
  }, [playing, speed]);

  const progress = (elapsed / TOTAL_SECONDS) * 100;

  const stop = (event: GestureResponderEvent) => event.stopPropagation();
  const moveBy = (seconds: number) => {
    setElapsed(value => Math.max(0, Math.min(TOTAL_SECONDS, value + seconds)));
  };
  const seek = (event: GestureResponderEvent) => {
    stop(event);
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / progressWidth));
    setElapsed(Math.round(ratio * TOTAL_SECONDS));
  };
  const measureProgress = (event: LayoutChangeEvent) => {
    setProgressWidth(event.nativeEvent.layout.width || 1);
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
    <AppScreen scroll={false} backgroundColor={colors.surface} testID="video-player-screen">
      <View style={styles.screen}>
        <Pressable
          testID="video-surface"
          onPress={() => {
            setShowControls(value => !value);
            setShowSpeed(false);
          }}
          style={styles.video}>
          <Image source={require('@/assets/images/course-civil-law.png')} resizeMode="cover" style={styles.poster} />
          <View style={styles.posterShade} />

          <Pressable
            accessibilityLabel="返回"
            hitSlop={8}
            onPress={event => {stop(event); navigation.goBack();}}
            style={({pressed}) => [styles.roundControl, styles.backControl, pressed && styles.pressed]}>
            <ChevronLeft size={19} color={colors.surface} />
          </Pressable>

          <View style={styles.topControls}>
            <Pressable
              accessibilityRole="button"
              testID="video-speed-button"
              onPress={event => {stop(event); setShowSpeed(value => !value);}}
              style={({pressed}) => [styles.speedButton, pressed && styles.pressed]}>
              <Text style={styles.speedButtonText}>{speed === 1 ? '倍速' : `${speed}x`}</Text>
            </Pressable>
            <Pressable accessibilityLabel="播放设置" hitSlop={10} onPress={stop} style={({pressed}) => [styles.smallRoundControl, pressed && styles.pressed]}>
              <Settings size={14} color={colors.surface} />
            </Pressable>
            <Pressable accessibilityLabel="全屏播放" hitSlop={10} onPress={stop} style={({pressed}) => [styles.smallRoundControl, pressed && styles.pressed]}>
              <Expand size={14} color={colors.surface} />
            </Pressable>
          </View>

          {showControls ? (
            <Pressable
              accessibilityLabel={playing ? '暂停' : '播放'}
              testID="video-center-play"
              onPress={event => {stop(event); setPlaying(value => !value);}}
              style={({pressed}) => [styles.centerPlay, pressed && styles.pressed]}>
              {playing ? <Pause size={24} color={colors.surface} fill={colors.surface} /> : <Play size={24} color={colors.surface} fill={colors.surface} />}
            </Pressable>
          ) : null}

          {showControls ? (
            <View style={styles.bottomControls} testID="video-bottom-controls" onTouchEnd={stop}>
              <Pressable testID="video-progress" onLayout={measureProgress} onPress={seek} style={styles.progressTrack}>
                <View style={styles.progressBackground} />
                <View style={[styles.progressFill, {width: `${progress}%`}]} />
                <View style={[styles.progressThumb, {left: `${progress}%`}]} />
              </Pressable>
              <View style={styles.controlRow}>
                <View style={styles.playbackGroup}>
                  <Pressable accessibilityLabel="后退10秒" hitSlop={9} testID="video-skip-back" onPress={event => {stop(event); moveBy(-10);}}>
                    <SkipBack size={16} color={colors.surface} />
                  </Pressable>
                  <Pressable accessibilityLabel={playing ? '暂停' : '播放'} hitSlop={7} testID="video-bottom-play" onPress={event => {stop(event); setPlaying(value => !value);}} style={styles.smallPlay}>
                    {playing ? <Pause size={18} color={colors.surface} fill={colors.surface} /> : <Play size={18} color={colors.surface} fill={colors.surface} />}
                  </Pressable>
                  <Pressable accessibilityLabel="前进10秒" hitSlop={9} testID="video-skip-forward" onPress={event => {stop(event); moveBy(10);}}>
                    <SkipForward size={16} color={colors.surface} />
                  </Pressable>
                  <Text style={styles.timeText} testID="video-time">{formatTime(elapsed)} / {formatTime(TOTAL_SECONDS)}</Text>
                </View>
                <Pressable accessibilityLabel="下载视频" hitSlop={9} onPress={stop}>
                  <Download size={15} color={colors.surface} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </Pressable>

        {showSpeed ? (
          <View style={styles.speedMenu} testID="video-speed-menu">
            {SPEED_OPTIONS.map(option => {
              const selected = speed === option;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={option}
                  testID={`video-speed-${option}`}
                  onPress={() => {setSpeed(option); setShowSpeed(false);}}
                  style={({pressed}) => [styles.speedOption, selected && styles.speedOptionSelected, pressed && styles.speedOptionPressed]}>
                  <Text numberOfLines={1} style={[styles.speedOptionText, selected && styles.speedOptionTextSelected]}>
                    {option === 1 ? '正常' : `${option}x`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.lessonInfo}>
          <Text numberOfLines={1} style={styles.lessonInfoTitle} testID="video-lesson-title">
            {currentLesson?.title ?? course.currentLesson}
          </Text>
          <Text style={styles.lessonInfoMeta}>{course.teacher}主讲 · {course.name}</Text>
        </View>

        <View style={styles.tabs}>
          {(['catalog', 'handout', 'notes'] as VideoTab[]).map(item => {
            const selected = tab === item;
            const labels: Record<VideoTab, string> = {catalog: '目录', handout: '讲义', notes: '笔记'};
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{selected}}
                key={item}
                testID={`video-tab-${item}`}
                onPress={() => setTab(item)}
                style={styles.tab}>
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{labels[item]}</Text>
                {selected ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            );
          })}
        </View>

        {tab === 'catalog' ? (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.catalog}>
              {course.chapters.map((chapter, chapterIndex) => {
                const expanded = openChapter === chapterIndex;
                const completed = chapter.lessons.filter(lesson => lesson.done).length;
                return (
                  <View key={chapter.title}>
                    <Pressable
                      testID={`video-chapter-${chapterIndex}`}
                      onPress={() => setOpenChapter(expanded ? -1 : chapterIndex)}
                      style={({pressed}) => [styles.chapterRow, pressed && styles.pressed]}>
                      <View style={styles.grow}>
                        <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        <Text style={styles.chapterMeta}>{completed}/{chapter.lessons.length} 课节</Text>
                      </View>
                      <ChevronDown size={15} color="#C0C5D0" style={expanded ? styles.chevronOpen : undefined} />
                    </Pressable>
                    {expanded ? chapter.lessons.map(lesson => {
                      const current = lesson.id === currentLesson?.id;
                      return (
                        <Pressable
                          key={lesson.id}
                          testID={`video-lesson-${lesson.id}`}
                          onPress={() => navigation.replace('VideoPlayer', {courseId: course.id, lessonId: lesson.id})}
                          style={({pressed}) => [styles.lessonRow, current && styles.currentLesson, pressed && styles.pressed]}>
                          <View style={styles.lessonIcon}><LessonIcon lesson={lesson} current={current} /></View>
                          <Text numberOfLines={1} style={[styles.catalogLessonTitle, lesson.done && styles.doneLesson, current && styles.currentLessonText]}>{lesson.title}</Text>
                          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        </Pressable>
                      );
                    }) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : null}

        {tab === 'handout' ? (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.paddedContent} showsVerticalScrollIndicator={false} testID="video-handout">
            <View style={styles.handout}>
              <View style={styles.handoutHeader}>
                <BookOpen size={16} color={colors.surface} />
                <Text style={styles.handoutHeaderText}>讲义 · 第3章：物权变动</Text>
              </View>
              <View style={styles.handoutBody}>
                <Text style={styles.handoutTitle}>一、物权变动的概念</Text>
                <Text style={styles.handoutText}>物权变动是指物权的产生、变更和消灭。按照《民法典》第208条，不动产物权的设立、变更、转让和消灭，经依法登记，发生效力；未经登记，不发生效力，但是法律另有规定的除外。</Text>
                <Text style={styles.handoutTitle}>二、动产物权变动</Text>
                <Text style={styles.handoutText}>动产物权的设立和转让，自交付时发生效力，但是法律另有规定的除外。</Text>
                <View style={styles.memoryBox}>
                  <Text style={styles.memoryTitle}>重点记忆</Text>
                  <Text style={styles.memoryText}>动产：交付生效 / 不动产：登记生效</Text>
                </View>
                <Text style={styles.handoutTitle}>三、善意取得</Text>
                <Text style={styles.handoutText}>无处分权人将动产或不动产转让给受让人，符合下列情形的，受让人取得该动产或不动产的所有权：</Text>
                {['受让人受让该动产或不动产时是善意的', '以合理的价格转让', '转让的动产或不动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人'].map((item, index) => (
                  <View key={item} style={styles.bulletRow}>
                    <View style={styles.bullet}><Text style={styles.bulletText}>{index + 1}</Text></View>
                    <Text style={styles.bulletCopy}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.downloadArea}>
                <Pressable accessibilityLabel="下载讲义 PDF" style={({pressed}) => [styles.downloadButton, pressed && styles.pressed]}>
                  <Download size={14} color={colors.brand} />
                  <Text style={styles.downloadText}>下载讲义 PDF</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : null}

        {tab === 'notes' ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.tabContent}
            contentContainerStyle={styles.notesContent}
            showsVerticalScrollIndicator={false}
            testID="video-notes">
            <View style={styles.noteEditor}>
              <View style={styles.noteTimeRow}>
                <PenLine size={13} color={colors.brand} />
                <Text style={styles.noteTime}>{formatTime(elapsed)}</Text>
              </View>
              <TextInput
                multiline
                numberOfLines={3}
                value={noteInput}
                onChangeText={setNoteInput}
                placeholder="在这里记下当前时间点的笔记..."
                placeholderTextColor="#C0C5D0"
                style={styles.noteInput}
                testID="video-note-input"
              />
              <View style={styles.saveRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!noteInput.trim()}
                  testID="video-note-save"
                  onPress={addNote}
                  style={({pressed}) => [styles.saveButton, !noteInput.trim() && styles.saveButtonDisabled, pressed && styles.pressed]}>
                  <Text style={styles.saveText}>保存</Text>
                </Pressable>
              </View>
            </View>
            {notes.map(note => (
              <View key={note.id} style={styles.noteCard} testID={`video-note-${note.id}`}>
                <Text style={styles.noteTime}>{note.timestamp}</Text>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#0A0A0F'},
  video: {height: 219, flexShrink: 0, backgroundColor: '#0A0A0F', overflow: 'visible'},
  poster: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.4},
  posterShade: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,15,0.34)'},
  roundControl: {width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center'},
  smallRoundControl: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center'},
  backControl: {position: 'absolute', left: 12, top: 12, zIndex: 3},
  topControls: {position: 'absolute', right: 12, top: 12, zIndex: 4, flexDirection: 'row', gap: 8, alignItems: 'center'},
  speedButton: {height: 28, minWidth: 38, borderRadius: 4, paddingHorizontal: 8, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center'},
  speedButtonText: {fontSize: 11, fontWeight: '600', color: colors.surface},
  speedMenu: {position: 'absolute', zIndex: 8, top: 48, right: 12, width: 71, borderRadius: radius.md, backgroundColor: 'rgba(26,26,46,0.97)', overflow: 'hidden', elevation: 8},
  speedOption: {height: 40, paddingHorizontal: 12, justifyContent: 'center'},
  speedOptionSelected: {backgroundColor: 'rgba(255,255,255,0.1)'},
  speedOptionPressed: {backgroundColor: 'rgba(255,255,255,0.2)'},
  speedOptionText: {fontSize: 13, color: colors.surface},
  speedOptionTextSelected: {fontWeight: '600', color: colors.action},
  centerPlay: {position: 'absolute', left: '50%', top: '50%', width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center'},
  bottomControls: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 24, backgroundColor: 'rgba(0,0,0,0.28)'},
  progressTrack: {height: 12, justifyContent: 'center', marginTop: 8},
  progressBackground: {position: 'absolute', left: 0, right: 0, top: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)'},
  progressFill: {position: 'absolute', left: 0, top: 4, height: 4, borderRadius: 2, backgroundColor: colors.action},
  progressThumb: {position: 'absolute', width: 12, height: 12, borderRadius: 6, marginLeft: -6, backgroundColor: colors.surface},
  controlRow: {height: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  playbackGroup: {flexDirection: 'row', alignItems: 'center', gap: 13},
  smallPlay: {width: 25, height: 31, alignItems: 'center', justifyContent: 'center'},
  timeText: {fontSize: 11, color: 'rgba(255,255,255,0.8)', marginLeft: 2},
  lessonInfo: {height: 63, flexShrink: 0, paddingHorizontal: 16, paddingVertical: 11, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  lessonInfoTitle: {fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.ink},
  lessonInfoMeta: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 3},
  tabs: {height: 39, flexShrink: 0, flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tabText: {fontSize: 13, fontWeight: '500', color: colors.muted},
  tabTextSelected: {color: colors.brand},
  tabIndicator: {position: 'absolute', bottom: 0, width: 32, height: 2, borderRadius: 1, backgroundColor: colors.brand},
  tabContent: {flex: 1, backgroundColor: colors.page},
  catalog: {backgroundColor: colors.surface},
  chapterRow: {minHeight: 61, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  grow: {flex: 1},
  chapterTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink},
  chapterMeta: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 2},
  chevronOpen: {transform: [{rotate: '180deg'}]},
  lessonRow: {height: 45, paddingLeft: 32, paddingRight: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  currentLesson: {backgroundColor: colors.brandLight},
  lessonIcon: {width: 28},
  catalogLessonTitle: {flex: 1, fontSize: 13, color: colors.body},
  doneLesson: {color: colors.muted},
  currentLessonText: {fontWeight: '600', color: colors.brand},
  lessonDuration: {fontSize: 11, color: '#C0C5D0', marginLeft: 8},
  paddedContent: {padding: 16, paddingTop: 20, paddingBottom: 24},
  handout: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, elevation: 1},
  handoutHeader: {height: 44, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.brand},
  handoutHeaderText: {fontSize: 13, fontWeight: '600', color: colors.surface},
  handoutBody: {padding: 16},
  handoutTitle: {fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.ink, marginBottom: 8},
  handoutText: {fontSize: 13, lineHeight: 21, color: colors.body, marginBottom: 17},
  memoryBox: {borderRadius: 4, padding: 12, backgroundColor: colors.brandLight, marginTop: -7, marginBottom: 17},
  memoryTitle: {fontSize: 12, lineHeight: 17, fontWeight: '600', color: colors.brand, marginBottom: 4},
  memoryText: {fontSize: 12, lineHeight: 17, color: colors.body},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 7},
  bullet: {width: 16, height: 16, borderRadius: 8, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginTop: 2},
  bulletText: {fontSize: 10, fontWeight: '700', color: colors.surface},
  bulletCopy: {flex: 1, fontSize: 13, lineHeight: 20, color: colors.body},
  downloadArea: {padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  downloadButton: {height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center'},
  downloadText: {fontSize: 13, fontWeight: '600', color: colors.brand},
  notesContent: {padding: 16, paddingBottom: 24},
  noteEditor: {minHeight: 158, borderRadius: radius.md, padding: 12, marginBottom: 14, backgroundColor: colors.surface, elevation: 1},
  noteTimeRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6},
  noteTime: {fontSize: 11, lineHeight: 15, fontWeight: '500', color: colors.brand},
  noteInput: {height: 70, padding: 0, fontSize: 13, lineHeight: 20, color: colors.ink, textAlignVertical: 'top'},
  saveRow: {alignItems: 'flex-end', marginTop: 5},
  saveButton: {height: 32, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  saveButtonDisabled: {opacity: 0.4},
  saveText: {fontSize: 12, fontWeight: '600', color: colors.surface},
  noteCard: {minHeight: 67, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 10, backgroundColor: colors.surface, elevation: 1},
  noteText: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 4},
  pressed: {opacity: 0.65},
});
