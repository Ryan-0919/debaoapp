import {useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, Heart, Share2, Users} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'LiveCourse'>;

const UPCOMING = [
  {time: '14:30', name: '民法精讲第19讲：用益物权', teacher: '张明远', viewers: '1,842'},
  {time: '16:00', name: '刑法体系第8讲：共同犯罪', teacher: '李东明', viewers: '2,137'},
  {time: '19:30', name: '主观题写作技巧专题', teacher: '王晓峰', viewers: '986'},
];

function countdownParts(seconds: number) {
  const values = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return values.map(value => String(value).padStart(2, '0'));
}

export default function LiveCourseScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [countdown, setCountdown] = useState(4 * 3600 + 28 * 60 + 17);
  const [subscribed, setSubscribed] = useState(false);
  const title = route.params.title ?? '民法精讲第18讲：物权变动的公示与公信原则';
  const count = subscribed ? 6285 : 6284;

  useEffect(() => {
    const timer = setInterval(() => setCountdown(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppScreen scroll={false} backgroundColor="#0A0A0F" testID="live-course-screen">
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="返回" hitSlop={8} onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
            <ChevronLeft size={18} color={colors.surface} />
          </Pressable>
          <Text style={styles.headerTitle}>即将直播</Text>
          <Pressable accessibilityLabel="分享直播" hitSlop={8} style={({pressed}) => [styles.shareButton, pressed && styles.pressed]}>
            <Share2 size={17} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Image source={require('@/assets/images/course-civil-law.png')} resizeMode="cover" style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>距开播</Text>
            </View>
            <View style={styles.countdown} testID="live-countdown">
              {countdownParts(countdown).map((part, index) => (
                <View key={index} style={styles.countdownPart}>
                  <View style={styles.timeBox}><Text style={styles.timeValue}>{part}</Text></View>
                  {index < 2 ? <Text style={styles.colon}>:</Text> : null}
                </View>
              ))}
            </View>
            <Text style={styles.startTime}>2026年08月27日  19:00 正式开播</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.courseTitle} testID="live-course-title">{title}</Text>
          <View style={styles.teacherRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>张</Text></View>
            <Text style={styles.teacher}>张明远老师</Text>
            <View style={styles.viewerRow}>
              <Users size={13} color="#C0C5D0" />
              <Text style={styles.viewerText} testID="live-viewer-count">已预约 {count.toLocaleString('en-US')} 人</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scheduleArea} contentContainerStyle={styles.scheduleContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.scheduleTitle}>今日直播安排</Text>
          {UPCOMING.map(item => (
            <View key={item.name} style={styles.scheduleCard}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <View style={styles.scheduleCopy}>
                <Text numberOfLines={1} style={styles.scheduleName}>{item.name}</Text>
                <Text style={styles.scheduleMeta}>{item.teacher} · 预约 {item.viewers}</Text>
              </View>
              <Pressable accessibilityLabel={`预约 ${item.name}`} style={({pressed}) => [styles.reserveSmall, pressed && styles.pressed]}>
                <Text style={styles.reserveSmallText}>预约</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{selected: subscribed}}
            testID="live-subscribe"
            onPress={() => setSubscribed(value => !value)}
            style={({pressed}) => [styles.subscribeButton, subscribed && styles.subscribeButtonActive, pressed && styles.pressed]}>
            <Heart size={16} color={subscribed ? colors.error : colors.surface} fill={subscribed ? colors.error : 'none'} />
            <Text style={[styles.subscribeText, subscribed && styles.subscribeTextActive]}>{subscribed ? '已预约开播提醒' : '预约开播提醒'}</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#0A0A0F'},
  header: {height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center'},
  backButton: {width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: colors.surface},
  shareButton: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  hero: {height: 184, position: 'relative'},
  heroImage: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.2},
  heroShade: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,15,0.32)'},
  heroContent: {...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center'},
  liveBadge: {height: 25, paddingHorizontal: 12, borderRadius: 13, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.error},
  liveDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface},
  liveBadgeText: {fontSize: 11, fontWeight: '600', color: colors.surface},
  countdown: {height: 58, flexDirection: 'row', alignItems: 'center', marginTop: 14},
  countdownPart: {flexDirection: 'row', alignItems: 'center'},
  timeBox: {width: 48, height: 56, borderRadius: radius.md, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center'},
  timeValue: {fontSize: 24, lineHeight: 31, fontWeight: '700', color: colors.surface},
  colon: {width: 24, textAlign: 'center', fontSize: 20, fontWeight: '300', color: 'rgba(255,255,255,0.6)'},
  startTime: {fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 12},
  info: {minHeight: 90, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#12121F', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)'},
  courseTitle: {fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.surface},
  teacherRow: {height: 30, flexDirection: 'row', alignItems: 'center', marginTop: 8},
  avatar: {width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 11, fontWeight: '700', color: colors.surface},
  teacher: {fontSize: 13, color: 'rgba(255,255,255,0.7)', marginLeft: 10},
  viewerRow: {marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5},
  viewerText: {fontSize: 12, color: 'rgba(255,255,255,0.5)'},
  scheduleArea: {flex: 1, backgroundColor: '#0A0A0F'},
  scheduleContent: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20},
  scheduleTitle: {fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 12},
  scheduleCard: {height: 66, borderRadius: 12, paddingHorizontal: 16, marginBottom: 10, backgroundColor: '#12121F', flexDirection: 'row', alignItems: 'center', gap: 12},
  scheduleTime: {width: 48, fontSize: 13, fontWeight: '700', color: colors.action},
  scheduleCopy: {flex: 1},
  scheduleName: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.surface},
  scheduleMeta: {fontSize: 11, lineHeight: 15, color: 'rgba(255,255,255,0.5)', marginTop: 3},
  reserveSmall: {height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(76,75,234,0.4)', backgroundColor: 'rgba(76,75,234,0.2)', alignItems: 'center', justifyContent: 'center'},
  reserveSmallText: {fontSize: 11, fontWeight: '600', color: '#8887F5'},
  footer: {paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#12121F', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)'},
  subscribeButton: {height: 48, borderRadius: 12, backgroundColor: colors.brand, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center'},
  subscribeButtonActive: {backgroundColor: 'rgba(255,114,82,0.2)', borderWidth: 1, borderColor: 'rgba(255,114,82,0.4)'},
  subscribeText: {fontSize: 15, fontWeight: '600', color: colors.surface},
  subscribeTextActive: {color: colors.error},
  pressed: {opacity: 0.7},
});
