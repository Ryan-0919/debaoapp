import {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Bell, BookOpen, ShoppingBag} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {colors, radius} from '@/theme';
import {environment} from '@/config/environment';
import {notificationService} from '@/services';

type NotificationIcon = 'study' | 'course' | 'order';

const prototypeNotifications: Array<{
  id: string;
  icon: NotificationIcon;
  title: string;
  body: string;
  time: string;
  read: boolean;
}> = [
  {id: 'n1', icon: 'study', title: '学习提醒', body: '您已连续3天未完成今日学习计划，距考试还有42天，继续加油！', time: '10分钟前', read: false},
  {id: 'n2', icon: 'course', title: '课程更新', body: '民法精讲课第19讲「不动产登记」已上线，点击继续学习。', time: '1小时前', read: false},
  {id: 'n3', icon: 'order', title: '订单通知', body: '您的订单 DB2024031200001 已支付成功，课程权限已自动开通。', time: '2024年3月12日', read: true},
  {id: 'n4', icon: 'study', title: '错题复习提醒', body: '您有28道错题待复习，建议今天完成民法错题巩固。', time: '昨天 09:00', read: true},
];

const iconPalette: Record<NotificationIcon, {background: string; foreground: string}> = {
  study: {background: colors.brandLight, foreground: colors.brand},
  course: {background: colors.mint, foreground: '#3A7A46'},
  order: {background: colors.rose, foreground: '#C0385A'},
};

function NotificationGlyph({icon, color}: {icon: NotificationIcon; color: string}) {
  if (icon === 'course') return <BookOpen color={color} size={18} />;
  if (icon === 'order') return <ShoppingBag color={color} size={18} />;
  return <Bell color={color} size={18} />;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(prototypeNotifications);
  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    notificationService.list().then(items => {
      if (!active) return;
      setNotifications(items.map(item => ({...item, icon: item.title.includes('订单') ? 'order' as const : item.title.includes('课程') ? 'course' as const : 'study' as const})));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="notifications-screen">
      <PageHeader title="消息通知" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {notifications.map((notification, index) => {
            const palette = iconPalette[notification.icon];
            return (
              <View
                key={notification.id}
                style={[styles.row, !notification.read && styles.unreadRow, index < notifications.length - 1 && styles.divider]}
                testID={`notification-row-${notification.id}`}>
                <View style={[styles.icon, {backgroundColor: palette.background}]} testID={`notification-icon-${notification.icon}`}>
                  <NotificationGlyph color={palette.foreground} icon={notification.icon} />
                </View>
                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, notification.read && styles.readTitle]}>{notification.title}</Text>
                    <Text style={styles.time}>{notification.time}</Text>
                  </View>
                  <Text style={styles.body}>{notification.body}</Text>
                </View>
                {!notification.read ? <View style={styles.unreadDot} testID={`notification-unread-${notification.id}`} /> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 24},
  card: {marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  row: {minHeight: 88, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surface},
  unreadRow: {backgroundColor: '#FAFAFE'},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  icon: {width: 36, height: 36, borderRadius: radius.md, marginTop: 2, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1, minWidth: 0},
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2},
  title: {fontSize: 13, fontWeight: '600', color: colors.ink},
  readTitle: {color: colors.body},
  time: {fontSize: 10, color: '#C0C5D0', marginLeft: 8},
  body: {fontSize: 12, lineHeight: 19, color: colors.muted},
  unreadDot: {width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: colors.brand},
});
