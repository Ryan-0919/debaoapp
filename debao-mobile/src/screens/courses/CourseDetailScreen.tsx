import {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, Clock3, Headphones, Play, Radio, UserRound} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, MockNotice, Pill, ProgressBar, SectionTitle} from '@/components/ui';
import {courses} from '@/data/mock';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const course = useMemo(() => courses.find(item => item.id === route.params.courseId) ?? courses[0], [route.params.courseId]);
  const routeName = course.type === 'audio' ? 'AudioPlayer' : course.type === 'live' ? 'LiveCourse' : 'VideoPlayer';
  const Icon = course.type === 'audio' ? Headphones : course.type === 'live' ? Radio : Play;
  return (
    <AppScreen footer={<View style={styles.footer}><AppButton label={course.progress ? '继续学习' : '开始学习'} icon={<Icon size={18} color="#FFFFFF" />} onPress={() => navigation.navigate(routeName, {courseId: course.id})} /></View>}>
      <PageHeader title="课程详情" />
      <View style={[styles.hero, {backgroundColor: course.accent}]}>
        <Icon size={42} color="#FFFFFF" />
        <Pill label={course.type === 'audio' ? '音频课程' : course.type === 'live' ? '直播课程' : '视频课程'} tone="neutral" />
        <Text style={styles.heroTitle}>{course.title}</Text>
        <View style={styles.teacherRow}><UserRound size={14} color="#FFFFFF" /><Text style={styles.teacher}>{course.teacher}</Text></View>
      </View>
      <View style={styles.content}>
        <Card>
          <View style={styles.progressTop}><Text style={styles.progressTitle}>课程进度</Text><Text style={styles.progressValue}>{course.progress}%</Text></View>
          <ProgressBar value={course.progress} color={course.accent} />
          <Text style={styles.progressMeta}>共 {course.lessons} 课时 · 学习记录保存在本机</Text>
        </Card>
        <MockNotice text="媒体播放、直播信令、离线下载及 DRM 均为接口占位，尚未接入真实内容平台。" />
        <SectionTitle title="课程目录" />
        <Card style={styles.lessonCard}>
          {['课程导学与学习方法', '核心知识体系梳理', '真题中的高频考点', '易错问题集中突破'].map((lesson, index) => (
            <Pressable key={lesson} style={styles.lesson} onPress={() => navigation.navigate(routeName, {courseId: course.id})}>
              <View style={[styles.lessonNumber, index === 0 && {backgroundColor: course.accent}]}><Text style={[styles.lessonNumberText, index === 0 && styles.activeLessonNumberText]}>{index + 1}</Text></View>
              <View style={styles.lessonCopy}><Text style={styles.lessonTitle}>{lesson}</Text><View style={styles.duration}><Clock3 size={12} color={colors.muted} /><Text style={styles.lessonMeta}>{28 + index * 7} 分钟</Text></View></View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {minHeight: 224, padding: spacing.xl, justifyContent: 'flex-end', alignItems: 'flex-start', gap: spacing.sm},
  heroTitle: {fontSize: 25, fontWeight: '900', lineHeight: 33, color: '#FFFFFF'},
  teacherRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
  teacher: {fontSize: 12, color: '#FFFFFF'},
  content: {padding: spacing.lg},
  progressTop: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  progressTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  progressValue: {fontSize: 13, fontWeight: '800', color: colors.brand},
  progressMeta: {fontSize: 11, color: colors.muted, marginTop: spacing.sm},
  lessonCard: {paddingVertical: 0},
  lesson: {minHeight: 72, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  lessonNumber: {width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  lessonNumberText: {fontSize: 12, fontWeight: '800', color: colors.body},
  activeLessonNumberText: {color: '#FFFFFF'},
  lessonCopy: {flex: 1, marginLeft: spacing.md},
  lessonTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  duration: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5},
  lessonMeta: {fontSize: 10, color: colors.muted},
  footer: {padding: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth},
});
