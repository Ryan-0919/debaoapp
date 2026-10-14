import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AlertCircle} from 'lucide-react-native';
import {environment} from '@/config/environment';
import {mediaService} from '@/services';
import {colors, radius} from '@/theme';

export function MediaAvailabilityNotice({courseId, kind}: {courseId: string; kind: 'video' | 'audio' | 'live'}) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    mediaService.prepare(courseId, kind)
      .then(result => { if (active && !result.available) setMessage(result.reason); })
      .catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Media service is unavailable.'); });
    return () => { active = false; };
  }, [courseId, kind]);

  if (!message) return null;
  return (
    <View style={styles.notice} testID={`media-unavailable-${kind}`}>
      <AlertCircle size={16} color={colors.action} />
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {marginHorizontal: 16, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF4D6'},
  noticeText: {flex: 1, fontSize: 11, lineHeight: 16, color: '#8A5A00'},
});
