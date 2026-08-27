import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Headphones, Play, Radio} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {Card, Pill, ProgressBar} from '@/components/ui';
import {courses} from '@/data/mock';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function CoursesScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen testID="courses-screen">
      <View style={styles.header}>
        <Text style={styles.title}>我的课程</Text>
        <Text style={styles.subtitle}>4 门课程 · 本周学习 6.8 小时</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.summary}>
          <View><Text style={styles.summaryValue}>126</Text><Text style={styles.summaryLabel}>累计学习天数</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={styles.summaryValue}>83.5h</Text><Text style={styles.summaryLabel}>累计时长</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={styles.summaryValue}>68%</Text><Text style={styles.summaryLabel}>最高进度</Text></View>
        </View>

        {courses.map(course => {
          const Icon = course.type === 'audio' ? Headphones : course.type === 'live' ? Radio : Play;
          return (
            <Pressable key={course.id} onPress={() => navigation.navigate('CourseDetail', {courseId: course.id})}>
              <Card style={styles.course}>
                <View style={[styles.art, {backgroundColor: course.accent}]}><Icon size={28} color="#FFFFFF" /></View>
                <View style={styles.copy}>
                  <View style={styles.tagRow}>
                    <Pill label={course.type === 'video' ? '视频' : course.type === 'audio' ? '音频' : '直播'} tone={course.type === 'live' ? 'success' : 'brand'} />
                    <Text style={styles.lessons}>{course.lessons} 课时</Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.teacher}>{course.teacher}</Text>
                  <ProgressBar value={course.progress} color={course.accent} />
                  <Text style={styles.progress}>{course.progress ? `已完成 ${course.progress}%` : '尚未开始'}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {padding: spacing.lg, paddingBottom: spacing.xl, backgroundColor: colors.surface},
  title: {fontSize: 24, fontWeight: '800', color: colors.ink},
  subtitle: {fontSize: 13, color: colors.muted, marginTop: 5},
  content: {paddingHorizontal: spacing.lg},
  summary: {marginVertical: spacing.lg, paddingVertical: spacing.lg, backgroundColor: colors.ink, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'},
  summaryValue: {fontSize: 17, fontWeight: '800', color: '#FFFFFF', textAlign: 'center'},
  summaryLabel: {fontSize: 10, color: '#B6B9C5', marginTop: 4},
  summaryDivider: {width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#444652'},
  course: {flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md},
  art: {width: 88, minHeight: 116, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1, marginLeft: spacing.md},
  tagRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  lessons: {fontSize: 10, color: colors.muted},
  courseTitle: {fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: spacing.sm},
  teacher: {fontSize: 11, color: colors.muted, marginTop: 3, marginBottom: spacing.md},
  progress: {fontSize: 10, color: colors.muted, marginTop: 5},
});
