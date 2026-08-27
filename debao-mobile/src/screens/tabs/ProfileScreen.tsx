import {StyleSheet, Text, View} from 'react-native';
import {Bell, BookMarked, ChevronRight, FileText, Settings, ShoppingBag, Sparkles, UserRound} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {Card, ListRow} from '@/components/ui';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {useAppStore} from '@/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const profile = useAppStore(state => state.profile);
  const favoriteCount = useAppStore(state => state.favoriteIds.length);

  return (
    <AppScreen testID="profile-screen">
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile.name.slice(0, 1)}</Text></View>
        <View style={styles.userCopy}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.phone}>{profile.phone} · {profile.examYear} 法考</Text>
        </View>
        <ChevronRight size={20} color="#AEB1BE" onPress={() => navigation.navigate('UserProfile')} />
      </View>

      <View style={styles.content}>
        <View style={styles.stats}>
          <View><Text style={styles.statValue}>{profile.studyDays}</Text><Text style={styles.statLabel}>学习天数</Text></View>
          <View><Text style={styles.statValue}>1,286</Text><Text style={styles.statLabel}>累计做题</Text></View>
          <View><Text style={styles.statValue}>{favoriteCount}</Text><Text style={styles.statLabel}>收藏</Text></View>
        </View>

        <Card style={styles.aiCard}>
          <View style={styles.aiIcon}><Sparkles size={22} color={colors.brand} /></View>
          <View style={styles.aiCopy}><Text style={styles.aiTitle}>得宝 AI 学习助手</Text><Text style={styles.aiBody}>解析考点、生成练习、梳理答题思路</Text></View>
          <Text style={styles.aiLink} onPress={() => navigation.navigate('AIChat')}>去提问</Text>
        </Card>

        <Card style={styles.menu}>
          <ListRow title="学习报告" leading={<FileText size={20} color={colors.brand} />} onPress={() => navigation.navigate('LearningReport')} />
          <ListRow title="学习计划" leading={<BookMarked size={20} color={colors.success} />} onPress={() => navigation.navigate('LearningPlan')} />
          <ListRow title="订单与已购" leading={<ShoppingBag size={20} color={colors.error} />} onPress={() => navigation.navigate('OrderList')} />
          <ListRow title="消息通知" leading={<Bell size={20} color={colors.warning} />} onPress={() => navigation.navigate('Notifications')} />
        </Card>

        <Card style={styles.menu}>
          <ListRow title="个人资料" leading={<UserRound size={20} color={colors.body} />} onPress={() => navigation.navigate('UserProfile')} />
          <ListRow title="设置" leading={<Settings size={20} color={colors.body} />} onPress={() => navigation.navigate('Settings')} />
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {backgroundColor: colors.ink, padding: spacing.xl, minHeight: 122, flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 62, height: 62, borderRadius: 31, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 25, color: colors.ink, fontWeight: '900'},
  userCopy: {flex: 1, marginLeft: spacing.lg},
  name: {fontSize: 20, fontWeight: '800', color: '#FFFFFF'},
  phone: {fontSize: 12, color: '#B6B9C5', marginTop: 5},
  content: {paddingHorizontal: spacing.lg},
  stats: {backgroundColor: colors.surface, borderRadius: radius.md, marginTop: -16, paddingVertical: spacing.lg, flexDirection: 'row', justifyContent: 'space-around'},
  statValue: {fontSize: 18, fontWeight: '800', color: colors.ink, textAlign: 'center'},
  statLabel: {fontSize: 11, color: colors.muted, marginTop: 3},
  aiCard: {marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandLight},
  aiIcon: {width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
  aiCopy: {flex: 1, marginLeft: spacing.md},
  aiTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  aiBody: {fontSize: 10, color: colors.muted, marginTop: 3},
  aiLink: {fontSize: 12, color: colors.brand, fontWeight: '700'},
  menu: {marginTop: spacing.lg, paddingVertical: 0},
});
