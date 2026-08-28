import {useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Bell, LogOut, Shield} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {ConfirmSheet} from '@/components/ConfirmSheet';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, EmptyState, ListRow, MockNotice, Pill} from '@/components/ui';
import {authService, notificationService} from '@/services';
import {useAppStore} from '@/store/useAppStore';
import {colors, radius, spacing} from '@/theme';
import type {AppNotification} from '@/types/domain';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export {default as UserProfileScreen} from './UserProfileScreen';

export function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const resetSession = useAppStore(state => state.resetSession);
  const [reminder, setReminder] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const logout = async () => {
    await authService.logout();
    resetSession();
    setLogoutVisible(false);
    navigation.navigate('MainTabs', {screen: 'Home'});
  };
  return (
    <AppScreen>
      <PageHeader title="设置" />
      <MockNotice text="账号、隐私协议和系统通知权限尚未接入正式服务。" />
      <View style={styles.content}>
        <Card style={styles.listCard}>
          <ListRow title="学习提醒" subtitle="仅保存本地开关，不会创建系统通知" leading={<Bell size={20} color={colors.brand} />} trailing={<Switch value={reminder} onValueChange={setReminder} trackColor={{false: colors.line, true: colors.brandLight}} thumbColor={reminder ? colors.brand : colors.muted} />} />
          <ListRow title="隐私与权限" subtitle="查看平台能力接入状态" leading={<Shield size={20} color={colors.success} />} />
          <ListRow title="当前版本" subtitle="0.1.0 · 第一阶段工程版" />
        </Card>
        <View style={styles.button}><AppButton label="退出登录" variant="danger" icon={<LogOut size={18} color={colors.error} />} onPress={() => setLogoutVisible(true)} /></View>
      </View>
      <ConfirmSheet visible={logoutVisible} title="确认退出" description="Mock 登录状态和本地学习数据将被重置。" confirmLabel="退出登录" onClose={() => setLogoutVisible(false)} onConfirm={logout} />
    </AppScreen>
  );
}

export function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  useEffect(() => { notificationService.list().then(setItems); }, []);
  return (
    <AppScreen>
      <PageHeader title="消息通知" />
      <MockNotice text="当前列表来自本地 Mock；未请求 APNs、FCM 或鸿蒙推送权限。" />
      <View style={styles.content}>
        {items.length === 0 ? <EmptyState title="正在读取消息" description="本地消息加载后会显示在这里。" /> : items.map(item => (
          <Card key={item.id} style={styles.notification}>
            <View style={[styles.notificationIcon, !item.read && styles.unread]}><Bell size={18} color={item.read ? colors.muted : colors.brand} /></View>
            <View style={styles.notificationCopy}><View style={styles.notificationTitleRow}><Text style={styles.notificationTitle}>{item.title}</Text>{!item.read ? <Pill label="未读" /> : null}</View><Text style={styles.notificationBody}>{item.body}</Text><Text style={styles.notificationTime}>{item.time}</Text></View>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  button: {marginTop: spacing.xl},
  listCard: {paddingVertical: 0},
  notification: {flexDirection: 'row', marginBottom: spacing.md},
  notificationIcon: {width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  unread: {backgroundColor: colors.brandLight},
  notificationCopy: {flex: 1, marginLeft: spacing.md},
  notificationTitleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  notificationTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  notificationBody: {fontSize: 12, lineHeight: 19, color: colors.body, marginTop: 5},
  notificationTime: {fontSize: 10, color: colors.muted, marginTop: spacing.sm},
});
