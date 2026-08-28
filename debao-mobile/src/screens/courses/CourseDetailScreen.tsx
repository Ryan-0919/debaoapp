import {useMemo, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {CheckCircle, ChevronDown, Circle, Play} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {findCourse, isCourseOwned, type CourseLesson} from '@/data/courses';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'CourseDetail'>;

function ProgressBar({value}: {value: number}) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, {width: `${value}%`}]} />
    </View>
  );
}

function LessonStatus({lesson}: {lesson: CourseLesson}) {
  if (lesson.done) {
    return <CheckCircle size={16} color={colors.success} />;
  }
  if (lesson.current) {
    return <Play size={16} color={colors.brand} fill={colors.brand} />;
  }
  return <Circle size={16} color="#C0C5D0" />;
}

export default function CourseDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const course = useMemo(() => findCourse(route.params.courseId), [route.params.courseId]);
  const [openChapter, setOpenChapter] = useState(0);
  const owned = isCourseOwned(course.id);

  const openLesson = (lessonId?: string) => {
    if (owned) {
      navigation.navigate('VideoPlayer', {courseId: course.id, lessonId});
    } else {
      navigation.navigate('ProductDetail', {productId: course.productId});
    }
  };

  return (
    <AppScreen testID="course-detail-screen">
      <PageHeader title={course.name} />
      <Image source={course.image} resizeMode="cover" style={styles.cover} testID="course-detail-cover" />

      <View style={styles.summary}>
        <View style={styles.metaRow}>
          <View style={styles.typeTag}><Text style={styles.typeText}>{course.type}</Text></View>
          <Text style={styles.teacher}>{course.teacher}主讲</Text>
        </View>
        <Text style={styles.title} testID="course-detail-name">{course.name}</Text>
        <View style={styles.progressRow}>
          <ProgressBar value={course.progress} />
          <Text style={styles.progressValue}>{course.progress}%</Text>
        </View>
        <Text style={styles.progressMeta}>
          {course.completedLessons}/{course.totalLessons} 课节 · 上次学习 {course.lastStudied}
        </Text>
      </View>

      <View style={styles.body}>
        {owned ? (
          <View style={styles.resumePanel} testID="course-owned-state">
            <View style={styles.resumeCopy}>
              <Text style={styles.resumeEyebrow}>当前学习</Text>
              <Text numberOfLines={2} style={styles.resumeTitle}>{course.currentLesson}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              testID="course-continue"
              onPress={() => openLesson()}
              style={({pressed}) => [styles.resumeButton, pressed && styles.pressed]}>
              <Play size={14} color={colors.ink} fill={colors.ink} />
              <Text style={styles.resumeButtonText}>继续</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.lockedPanel} testID="course-locked-state">
            <View style={styles.resumeCopy}>
              <Text style={styles.lockedEyebrow}>尚未开通权限</Text>
              <Text style={styles.lockedCopy}>购买课程后即可开始学习</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              testID="course-buy"
              onPress={() => navigation.navigate('ProductDetail', {productId: course.productId})}
              style={({pressed}) => [styles.buyButton, pressed && styles.pressed]}>
              <Text style={styles.buyButtonText}>去购买</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.catalogTitle}>课程目录</Text>
        <View style={styles.catalog}>
          {course.chapters.map((chapter, chapterIndex) => {
            const expanded = openChapter === chapterIndex;
            const completed = chapter.lessons.filter(lesson => lesson.done).length;
            return (
              <View key={chapter.title}>
                <Pressable
                  accessibilityRole="button"
                  testID={`course-chapter-${chapterIndex}`}
                  onPress={() => setOpenChapter(expanded ? -1 : chapterIndex)}
                  style={({pressed}) => [styles.chapterRow, pressed && styles.pressed]}>
                  <View style={styles.chapterCopy}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterMeta}>{completed}/{chapter.lessons.length} 课节</Text>
                  </View>
                  <ChevronDown
                    size={16}
                    color="#C0C5D0"
                    style={expanded ? styles.chevronOpen : undefined}
                  />
                </Pressable>
                {expanded ? chapter.lessons.map(lesson => (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.id}
                    testID={`course-lesson-${lesson.id}`}
                    onPress={() => openLesson(lesson.id)}
                    style={({pressed}) => [
                      styles.lessonRow,
                      lesson.current && styles.currentLesson,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.lessonIcon}><LessonStatus lesson={lesson} /></View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.lessonTitle,
                        lesson.done && styles.doneLessonTitle,
                        lesson.current && styles.currentLessonTitle,
                      ]}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.duration}>{lesson.duration}</Text>
                  </Pressable>
                )) : null}
              </View>
            );
          })}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cover: {width: '100%', height: 200, backgroundColor: colors.line},
  summary: {backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 17, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  metaRow: {height: 21, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7},
  typeTag: {height: 21, paddingHorizontal: 7, borderRadius: radius.sm, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  typeText: {fontSize: 11, color: colors.body},
  teacher: {fontSize: 12, color: colors.muted},
  title: {fontSize: 17, lineHeight: 24, fontWeight: '700', color: colors.ink},
  progressRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15},
  progressTrack: {height: 6, flex: 1, backgroundColor: colors.line, borderRadius: 3, overflow: 'hidden'},
  progressFill: {height: 6, borderRadius: 3, backgroundColor: colors.brand},
  progressValue: {fontSize: 13, lineHeight: 17, fontWeight: '600', color: colors.brand},
  progressMeta: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 10},
  body: {paddingHorizontal: 16, paddingTop: 13, paddingBottom: 24},
  resumePanel: {minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 11, backgroundColor: colors.brandLight},
  resumeCopy: {flex: 1},
  resumeEyebrow: {fontSize: 11, lineHeight: 15, fontWeight: '500', color: colors.brand, marginBottom: 2},
  resumeTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink},
  resumeButton: {width: 78, height: 36, borderRadius: radius.md, backgroundColor: colors.action, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'},
  resumeButtonText: {fontSize: 13, fontWeight: '600', color: colors.ink},
  lockedPanel: {minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 11, backgroundColor: colors.page, borderWidth: 1, borderColor: colors.line},
  lockedEyebrow: {fontSize: 11, lineHeight: 15, color: colors.muted, marginBottom: 3},
  lockedCopy: {fontSize: 13, lineHeight: 18, color: colors.body},
  buyButton: {width: 61, height: 32, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  buyButtonText: {fontSize: 12, fontWeight: '600', color: colors.surface},
  catalogTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink, marginTop: 14, marginBottom: 8},
  catalog: {borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden'},
  chapterRow: {minHeight: 66, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  chapterCopy: {flex: 1},
  chapterTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink},
  chapterMeta: {fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 3},
  chevronOpen: {transform: [{rotate: '180deg'}]},
  lessonRow: {height: 45, paddingLeft: 32, paddingRight: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  currentLesson: {backgroundColor: colors.brandLight},
  lessonIcon: {width: 28, alignItems: 'flex-start'},
  lessonTitle: {flex: 1, fontSize: 13, color: colors.body},
  doneLessonTitle: {color: colors.muted},
  currentLessonTitle: {fontWeight: '600', color: colors.brand},
  duration: {fontSize: 11, color: '#C0C5D0', marginLeft: 8},
  pressed: {opacity: 0.6},
});
