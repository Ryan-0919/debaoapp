import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Megaphone, Pin} from 'lucide-react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {RemoteState} from '@/components/ui';
import {notificationService} from '@/services';
import type {Announcement} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type ScreenRoute = RouteProp<RootStackParamList, 'AnnouncementDetail'>;
type AnnouncementDetail = Announcement & {deepLink: string; read: boolean; closed: boolean};

function formatPublishedAt(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function AnnouncementDetailScreen() {
  const route = useRoute<ScreenRoute>();
  const {announcementId} = route.params;
  const [announcement, setAnnouncement] = useState<AnnouncementDetail>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!notificationService.getAnnouncement) throw new Error('公告服务暂不可用，请稍后重试。');
      const result = await notificationService.getAnnouncement(announcementId);
      setAnnouncement(result);
      notificationService.markAnnouncementRead?.(announcementId).catch(() => undefined);
    } catch (reason) {
      setAnnouncement(undefined);
      setError(reason instanceof Error ? reason.message : '公告加载失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }, [announcementId]);

  useEffect(() => { load().catch(() => undefined); }, [load]);

  return (
    <AppScreen backgroundColor={colors.page} testID="announcement-detail-screen">
      <PageHeader title="公告详情" />
      {loading || error || !announcement ? (
        <RemoteState
          testID="announcement-detail-state"
          loading={loading}
          error={error}
          empty={!loading && !error && !announcement}
          loadingLabel="正在加载公告..."
          emptyTitle="公告不存在"
          emptyDescription="公告可能已撤回或超过展示时间。"
          onRetry={load}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.icon}><Megaphone size={22} color={colors.brand} /></View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{announcement.title}</Text>
            {announcement.isPinned ? <View style={styles.pinned}><Pin size={12} color={colors.error} /><Text style={styles.pinnedText}>置顶</Text></View> : null}
          </View>
          <Text style={styles.time}>{formatPublishedAt(announcement.publishedAt ?? announcement.startsAt ?? announcement.createdAt)}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{announcement.body}</Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {margin: spacing.lg, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.surface},
  icon: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight, marginBottom: spacing.lg},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm},
  title: {flex: 1, fontSize: 22, lineHeight: 31, fontWeight: '700', color: colors.ink},
  pinned: {marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.rose},
  pinnedText: {fontSize: 11, fontWeight: '600', color: colors.error},
  time: {marginTop: spacing.sm, fontSize: 12, color: colors.muted},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: spacing.xl},
  body: {fontSize: 16, lineHeight: 28, color: colors.body},
});
