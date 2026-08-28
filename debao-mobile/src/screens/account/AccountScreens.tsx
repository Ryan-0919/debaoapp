import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Bell} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, EmptyState, MockNotice, Pill} from '@/components/ui';
import {notificationService} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {AppNotification} from '@/types/domain';

export {default as UserProfileScreen} from './UserProfileScreen';
export {default as SettingsScreen} from './SettingsScreen';

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
  notification: {flexDirection: 'row', marginBottom: spacing.md},
  notificationIcon: {width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  unread: {backgroundColor: colors.brandLight},
  notificationCopy: {flex: 1, marginLeft: spacing.md},
  notificationTitleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  notificationTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  notificationBody: {fontSize: 12, lineHeight: 19, color: colors.body, marginTop: 5},
  notificationTime: {fontSize: 10, color: colors.muted, marginTop: spacing.sm},
});
