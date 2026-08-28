import {useState, type ComponentType} from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {
  AlertCircle,
  Bell,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  PenLine,
  Pin,
  PlayCircle,
  Scale,
  Star,
  ThumbsUp,
  X,
  type LucideProps,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {AppScreen} from '@/components/AppScreen';
import {colors} from '@/theme';
import type {MainTabParamList, RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Channel = 'objective' | 'subjective';
type ScreenRoute = Exclude<keyof RootStackParamList, 'MainTabs'>;

interface Shortcut {
  label: string;
  icon: ComponentType<LucideProps>;
  backgroundColor: string;
  iconColor: string;
  action: {kind: 'tab'; tab: keyof MainTabParamList} | {kind: 'screen'; route: ScreenRoute};
}

interface Course {
  name: string;
  teacher: string;
  price: string;
  productId: string;
  image: ImageSourcePropType;
}

const banners = [
  require('@/assets/images/home-library.png'),
  require('@/assets/images/home-office.png'),
] as ImageSourcePropType[];

const objectiveShortcuts: Shortcut[] = [
  {label: '我的课程', icon: PlayCircle, backgroundColor: '#F0F0FF', iconColor: '#4C4BEA', action: {kind: 'tab', tab: 'Courses'}},
  {label: '做题记录', icon: ClipboardList, backgroundColor: '#EDF5FF', iconColor: '#1A5FA8', action: {kind: 'screen', route: 'QuestionRecords'}},
  {label: '错题本', icon: AlertCircle, backgroundColor: '#FFF1E8', iconColor: '#D2691E', action: {kind: 'screen', route: 'MistakeBook'}},
  {label: '收藏夹', icon: Star, backgroundColor: '#FFF5DD', iconColor: '#A87000', action: {kind: 'screen', route: 'Favorites'}},
  {label: 'AI答疑', icon: MessageCircle, backgroundColor: '#EAF6EF', iconColor: '#1A8B8B', action: {kind: 'screen', route: 'AIChat'}},
];

const subjectiveShortcuts: Shortcut[] = [
  {label: '课程', icon: PlayCircle, backgroundColor: '#F0F0FF', iconColor: '#4C4BEA', action: {kind: 'tab', tab: 'Courses'}},
  {label: '法条检索', icon: Scale, backgroundColor: '#EAF7F7', iconColor: '#1A8B8B', action: {kind: 'screen', route: 'LawSearch'}},
  {label: '做题记录', icon: ClipboardList, backgroundColor: '#EDF5FF', iconColor: '#1A5FA8', action: {kind: 'screen', route: 'QuestionRecords'}},
  {label: '收藏夹', icon: Star, backgroundColor: '#FFF5DD', iconColor: '#A87000', action: {kind: 'screen', route: 'Favorites'}},
  {label: '批改', icon: PenLine, backgroundColor: '#FFF1E8', iconColor: '#D2691E', action: {kind: 'screen', route: 'Grading'}},
  {label: 'AI答疑', icon: MessageCircle, backgroundColor: '#EAF6EF', iconColor: '#1A8B8B', action: {kind: 'screen', route: 'AIChat'}},
];

const courses: Course[] = [
  {name: '民法精讲课', teacher: '张明远', price: '¥1,980', productId: 'p2', image: require('@/assets/images/course-civil-law.png')},
  {name: '刑法体系课', teacher: '李东明', price: '¥2,280', productId: 'p1', image: require('@/assets/images/course-criminal-law.png')},
  {name: '主观题冲刺', teacher: '王晓峰', price: '¥1,280', productId: 'p3', image: require('@/assets/images/course-subjective.png')},
];

const announcements = [
  {type: '考试', text: '2024年法律职业资格考试客观题考试时间定于9月14日、15日举行，请提前做好准备。', important: true},
  {type: '课程', text: '民法精讲课第19-22讲已更新上线，已购学员可直接进入课程观看。', important: false},
];

const hotPosts = [
  {tag: '经验分享', title: '三战上岸经验分享：客观题从108到213的蜕变之路', likes: 342, replies: 87, pinned: true},
  {tag: '知识整理', title: '共同犯罪8大考点汇总，附真题解析（2019-2023）', likes: 186, replies: 43, pinned: false},
  {tag: '答疑求助', title: '善意取得中「合理价格」如何认定？有没有具体标准？', likes: 28, replies: 15, pinned: false},
];

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const [channel, setChannel] = useState<Channel>('objective');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const shortcuts = channel === 'objective' ? objectiveShortcuts : subjectiveShortcuts;

  const openShortcut = (shortcut: Shortcut) => {
    if (shortcut.action.kind === 'tab') {
      navigation.navigate('MainTabs', {screen: shortcut.action.tab});
      return;
    }
    navigation.navigate(shortcut.action.route as never);
  };

  return (
    <AppScreen testID="home-screen">
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>得宝法考</Text>
          <Text style={styles.demoBadge}>演示数据</Text>
        </View>
        <View style={styles.headerActions}>
          <View accessibilityRole="tablist" style={styles.modeSwitch}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: channel === 'objective'}}
              hitSlop={6}
              onPress={() => setChannel('objective')}
              style={[styles.modeButton, channel === 'objective' && styles.modeButtonActive]}
              testID="home-mode-objective">
              <Text style={[styles.modeLabel, channel === 'objective' && styles.modeLabelActive]}>客观题</Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: channel === 'subjective'}}
              hitSlop={6}
              onPress={() => setChannel('subjective')}
              style={[styles.modeButton, channel === 'subjective' && styles.modeButtonActive]}
              testID="home-mode-subjective">
              <Text style={[styles.modeLabel, channel === 'subjective' && styles.modeLabelActive]}>主观题</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityLabel="消息通知"
            hitSlop={8}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}>
            <Bell color="#5F6574" size={19} strokeWidth={1.8} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      <View style={styles.pageBody}>
        <ImageBackground imageStyle={styles.bannerImage} source={banners[bannerIndex]} style={styles.banner}>
          <View style={styles.bannerShade} />
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>{channel === 'objective' ? '2024客观题精英班' : '2024主观题冲刺班'}</Text>
            <Text style={styles.bannerMeta}>{channel === 'objective' ? '限时特惠 · 已有5312人报名' : '批改服务 · 已有1893人报名'}</Text>
          </View>
          <View style={styles.bannerDots}>
            {banners.map((_, index) => (
              <Pressable
                accessibilityLabel={`显示第${index + 1}张横幅`}
                hitSlop={8}
                key={index}
                onPress={() => setBannerIndex(index)}
                style={[styles.bannerDot, index === bannerIndex && styles.bannerDotActive]}
              />
            ))}
          </View>
        </ImageBackground>

        <View style={styles.shortcutPanel}>
          <ScrollView
            contentContainerStyle={styles.shortcutContent}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {shortcuts.map(shortcut => {
              const Icon = shortcut.icon;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={shortcut.label}
                  onPress={() => openShortcut(shortcut)}
                  style={({pressed}) => [styles.shortcut, pressed && styles.pressed]}
                  testID={`home-shortcut-${shortcut.label}`}>
                  <View style={[styles.shortcutIcon, {backgroundColor: shortcut.backgroundColor}]}>
                    <Icon color={shortcut.iconColor} size={22} strokeWidth={1.8} />
                  </View>
                  <Text numberOfLines={1} style={styles.shortcutLabel}>{shortcut.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ProductDetail', {productId: 'p1'})}
          style={({pressed}) => [styles.promo, pressed && styles.pressed]}>
          <ImageBackground imageStyle={styles.promoImage} source={banners[0]} style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
              <Defs>
                <LinearGradient id="promo-gradient" x1="0" x2="1" y1="0" y2="0">
                  <Stop offset="0" stopColor="#4C4BEA" stopOpacity="0.93" />
                  <Stop offset="0.62" stopColor="#4C4BEA" stopOpacity="0.55" />
                  <Stop offset="1" stopColor="#4C4BEA" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect fill="url(#promo-gradient)" height="100%" width="100%" />
            </Svg>
          </ImageBackground>
          <View style={styles.promoContent}>
            <View style={styles.promoCopy}>
              <Text style={styles.promoKicker}>限时特惠 · 倒计时 3 天</Text>
              <Text style={styles.promoTitle}>2024法考全程班</Text>
              <Text style={styles.promoMeta}>主客一体 · 名师精讲 · 含批改服务</Text>
            </View>
            <View style={styles.promoOffer}>
              <Text style={styles.promoPrice}>¥3,980</Text>
              <Text style={styles.promoOldPrice}>¥5,200</Text>
              <View style={styles.enrollButton}><Text style={styles.enrollLabel}>立即报名</Text></View>
            </View>
          </View>
        </Pressable>

        <View style={styles.countdown}>
          <View>
            <Text style={styles.countdownExam}>{channel === 'objective' ? '2024客观题考试' : '2024主观题考试'}</Text>
            <Text style={styles.countdownLabel}>距今还有</Text>
          </View>
          <View style={styles.daysRow}>
            <Text style={styles.days}>{channel === 'objective' ? '42' : '98'}</Text>
            <Text style={styles.daysUnit}>天</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>热门课程</Text>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('MainTabs', {screen: 'Mall'})}
            style={styles.sectionAction}>
            <Text style={styles.sectionActionLabel}>查看更多</Text>
            <ChevronRight color={colors.brand} size={14} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.courseList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {courses.map(course => (
            <Pressable
              accessibilityRole="button"
              key={course.name}
              onPress={() => navigation.navigate('ProductDetail', {productId: course.productId})}
              style={({pressed}) => [styles.courseCard, pressed && styles.pressed]}>
              <ImageBackground imageStyle={styles.courseImage} source={course.image} style={styles.courseImageFrame} />
              <View style={styles.courseCopy}>
                <Text numberOfLines={1} style={styles.courseTitle}>{course.name}</Text>
                <Text style={styles.courseTeacher}>{course.teacher}主讲</Text>
                <Text style={styles.coursePrice}>{course.price}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {!noticeDismissed && (
          <View style={styles.notice}>
            <View style={styles.noticeMain}>
              <Text style={[styles.noticeType, announcements[noticeIndex].important ? styles.noticeTypeImportant : styles.noticeTypeCourse]}>
                {announcements[noticeIndex].type}
              </Text>
              <Text numberOfLines={2} style={styles.noticeText}>{announcements[noticeIndex].text}</Text>
              <Pressable accessibilityLabel="关闭公告" hitSlop={8} onPress={() => setNoticeDismissed(true)}>
                <X color="#C0C5D0" size={13} />
              </Pressable>
            </View>
            <View style={styles.noticeFooter}>
              <View style={styles.noticeDots}>
                {announcements.map((_, index) => (
                  <Pressable
                    accessibilityLabel={`显示第${index + 1}条公告`}
                    hitSlop={7}
                    key={index}
                    onPress={() => setNoticeIndex(index)}
                    style={[styles.noticeDot, index === noticeIndex && styles.noticeDotActive]}
                  />
                ))}
              </View>
              <Pressable hitSlop={7} onPress={() => navigation.navigate('LawSearch')}>
                <Text style={styles.noticeLink}>查看全部公告 →</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.communityHeader}>
          <Text style={styles.sectionTitle}>社区热帖</Text>
          <Pressable hitSlop={8} onPress={() => navigation.navigate('LawSearch')} style={styles.sectionAction}>
            <Text style={styles.sectionActionLabel}>进入论坛</Text>
            <ChevronRight color={colors.brand} size={14} />
          </Pressable>
        </View>
        <View style={styles.posts}>
          {hotPosts.map((post, index) => (
            <Pressable
              key={post.title}
              onPress={() => navigation.navigate('LawSearch')}
              style={({pressed}) => [styles.post, index < hotPosts.length - 1 && styles.postDivider, pressed && styles.postPressed]}>
              <View style={styles.postCopy}>
                <View style={styles.postTagRow}>
                  <Text style={[styles.postTag, post.tag === '答疑求助' ? styles.postTagQuestion : post.tag === '经验分享' ? styles.postTagExperience : styles.postTagKnowledge]}>{post.tag}</Text>
                  {post.pinned && <Pin color="#FF7252" size={11} />}
                </View>
                <Text numberOfLines={1} style={styles.postTitle}>{post.title}</Text>
              </View>
              <View style={styles.postStats}>
                <View style={styles.likesRow}>
                  <ThumbsUp color="#C0C5D0" size={11} />
                  <Text style={styles.postStat}>{post.likes}</Text>
                </View>
                <Text style={styles.postStat}>{post.replies} 回复</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  brand: {fontSize: 18, lineHeight: 24, fontWeight: '800', color: colors.brand},
  demoBadge: {fontSize: 11, lineHeight: 17, color: colors.muted, backgroundColor: colors.page, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 6},
  modeSwitch: {height: 32, padding: 2, borderRadius: 8, backgroundColor: colors.page, flexDirection: 'row', alignItems: 'center'},
  modeButton: {width: 55, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center'},
  modeButtonActive: {backgroundColor: colors.surface, elevation: 2, shadowColor: colors.ink, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 3},
  modeLabel: {fontSize: 12, color: colors.muted, fontWeight: '600'},
  modeLabelActive: {color: colors.brand, fontWeight: '700'},
  notificationButton: {width: 30, height: 32, alignItems: 'center', justifyContent: 'center'},
  notificationDot: {position: 'absolute', top: 5, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error, borderWidth: 1, borderColor: colors.surface},
  pageBody: {paddingBottom: 16},
  banner: {height: 140, marginHorizontal: 16, marginTop: 12, overflow: 'hidden', borderRadius: 8, justifyContent: 'flex-end'},
  bannerImage: {borderRadius: 8},
  bannerShade: {position: 'absolute', left: 0, top: 0, bottom: 0, width: '68%', backgroundColor: 'rgba(23,25,37,0.38)'},
  bannerCopy: {paddingLeft: 16, paddingBottom: 13},
  bannerTitle: {fontSize: 13, lineHeight: 18, color: '#FFFFFF', fontWeight: '600'},
  bannerMeta: {fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.82)', marginTop: 2},
  bannerDots: {position: 'absolute', right: 10, bottom: 8, flexDirection: 'row', gap: 4, alignItems: 'center'},
  bannerDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)'},
  bannerDotActive: {width: 16, backgroundColor: '#FFFFFF'},
  shortcutPanel: {marginHorizontal: 16, marginTop: 12, borderRadius: 8, backgroundColor: colors.surface, paddingVertical: 16, overflow: 'hidden'},
  shortcutContent: {paddingHorizontal: 12, flexGrow: 1, justifyContent: 'center', gap: 4},
  shortcut: {width: 60, alignItems: 'center', gap: 6},
  shortcutIcon: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  shortcutLabel: {fontSize: 11, lineHeight: 16, color: colors.body},
  pressed: {opacity: 0.72},
  promo: {height: 100, marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden'},
  promoImage: {borderRadius: 12},
  promoContent: {flex: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12},
  promoCopy: {flex: 1},
  promoKicker: {fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.82)', fontWeight: '500'},
  promoTitle: {fontSize: 15, lineHeight: 21, color: '#FFFFFF', fontWeight: '800'},
  promoMeta: {fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.74)', marginTop: 1},
  promoOffer: {alignItems: 'flex-end'},
  promoPrice: {fontSize: 18, lineHeight: 21, color: colors.action, fontWeight: '800'},
  promoOldPrice: {fontSize: 11, lineHeight: 14, color: 'rgba(255,255,255,0.52)', textDecorationLine: 'line-through'},
  enrollButton: {height: 24, marginTop: 5, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center'},
  enrollLabel: {fontSize: 12, color: colors.ink, fontWeight: '800'},
  countdown: {minHeight: 68, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  countdownExam: {fontSize: 11, lineHeight: 16, color: colors.muted},
  countdownLabel: {fontSize: 13, lineHeight: 18, color: colors.ink, fontWeight: '500', marginTop: 2},
  daysRow: {flexDirection: 'row', alignItems: 'baseline', gap: 4},
  days: {fontSize: 28, lineHeight: 34, color: colors.brand, fontWeight: '800'},
  daysUnit: {fontSize: 13, color: colors.body},
  sectionHeader: {height: 42, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sectionTitle: {fontSize: 15, lineHeight: 21, color: colors.ink, fontWeight: '700'},
  sectionAction: {flexDirection: 'row', alignItems: 'center'},
  sectionActionLabel: {fontSize: 13, lineHeight: 18, color: colors.brand},
  courseList: {paddingHorizontal: 16, paddingBottom: 2, gap: 12},
  courseCard: {width: 148, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden'},
  courseImageFrame: {width: 148, height: 88},
  courseImage: {backgroundColor: colors.line},
  courseCopy: {paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10},
  courseTitle: {fontSize: 12, lineHeight: 17, color: colors.ink, fontWeight: '700'},
  courseTeacher: {fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 1},
  coursePrice: {fontSize: 13, lineHeight: 18, color: colors.brand, fontWeight: '800', marginTop: 5},
  notice: {marginHorizontal: 16, marginTop: 12, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: colors.brand},
  noticeMain: {paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  noticeType: {fontSize: 10, lineHeight: 16, fontWeight: '700', borderRadius: 4, paddingHorizontal: 6},
  noticeTypeImportant: {backgroundColor: colors.apricot, color: '#D2691E'},
  noticeTypeCourse: {backgroundColor: colors.mint, color: '#3A7A46'},
  noticeText: {flex: 1, fontSize: 12, lineHeight: 19, color: colors.body},
  noticeFooter: {height: 31, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  noticeDots: {flexDirection: 'row', alignItems: 'center', gap: 4},
  noticeDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: colors.line},
  noticeDotActive: {width: 16, backgroundColor: colors.brand},
  noticeLink: {fontSize: 11, lineHeight: 16, color: colors.brand, fontWeight: '600'},
  communityHeader: {height: 41, marginHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  posts: {marginHorizontal: 16, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden'},
  post: {minHeight: 66, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  postDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  postPressed: {backgroundColor: colors.page},
  postCopy: {flex: 1, minWidth: 0},
  postTagRow: {height: 18, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3},
  postTag: {fontSize: 10, lineHeight: 16, fontWeight: '600', paddingHorizontal: 6, borderRadius: 8},
  postTagQuestion: {backgroundColor: colors.gold, color: '#A87000'},
  postTagExperience: {backgroundColor: colors.mint, color: '#3A7A46'},
  postTagKnowledge: {backgroundColor: colors.brandLight, color: colors.brand},
  postTitle: {fontSize: 13, lineHeight: 18, color: colors.ink},
  postStats: {alignItems: 'flex-end', gap: 4},
  likesRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  postStat: {fontSize: 11, lineHeight: 15, color: '#C0C5D0'},
});
