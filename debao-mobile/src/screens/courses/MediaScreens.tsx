import {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Headphones, MessageCircle, Pause, Play, Radio, RotateCcw, RotateCw, Send} from 'lucide-react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, MockNotice, Pill, ProgressBar, SectionTitle} from '@/components/ui';
import {mediaService} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type MediaKind = 'video' | 'audio' | 'live';

function Player({kind, courseId}: {kind: MediaKind; courseId: string}) {
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState('正在检查媒体能力……');
  const Icon = kind === 'audio' ? Headphones : kind === 'live' ? Radio : Play;
  useEffect(() => { mediaService.prepare(courseId, kind).then(result => setNotice(result.reason)); }, [courseId, kind]);
  return (
    <>
      <View style={[styles.player, kind === 'audio' && styles.audioPlayer]}>
        <View style={styles.playerBrand}><Icon size={40} color={colors.action} /><Text style={styles.playerBrandText}>得宝法考</Text></View>
        <View style={styles.controls}>
          {kind !== 'live' ? <RotateCcw size={22} color="#FFFFFF" /> : null}
          <Pressable accessibilityLabel={playing ? '暂停' : '播放'} onPress={() => setPlaying(value => !value)} style={styles.playButton}>
            {playing ? <Pause size={28} color={colors.ink} fill={colors.ink} /> : <Play size={28} color={colors.ink} fill={colors.ink} />}
          </Pressable>
          {kind !== 'live' ? <RotateCw size={22} color="#FFFFFF" /> : null}
        </View>
        {kind === 'live' ? <Pill label="直播信令未连接" tone="warning" /> : <View style={styles.timeline}><ProgressBar value={playing ? 38 : 24} color={colors.action} /><Text style={styles.timelineText}>12:18 / 48:30</Text></View>}
      </View>
      <MockNotice text={notice} />
    </>
  );
}

export {default as VideoPlayerScreen} from './VideoPlayerScreen';

type AudioRoute = RouteProp<RootStackParamList, 'AudioPlayer'>;
export function AudioPlayerScreen() {
  const route = useRoute<AudioRoute>();
  return (
    <AppScreen>
      <PageHeader title="音频课程" subtitle="第 6 讲" />
      <Player kind="audio" courseId={route.params.courseId} />
      <View style={styles.content}>
        <Text style={styles.title}>刑法中的因果关系</Text>
        <Text style={styles.subtitle}>刑法重点突破 · 周子恒</Text>
        <SectionTitle title="逐字稿节选" />
        <Card><Text style={styles.body}>判断刑法上的因果关系，应先确认行为是否制造了法所不允许的风险，再判断该风险是否在结果中实现。</Text></Card>
      </View>
    </AppScreen>
  );
}

type LiveRoute = RouteProp<RootStackParamList, 'LiveCourse'>;
export function LiveCourseScreen() {
  const route = useRoute<LiveRoute>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(['老师：今晚训练合同法案例的答题结构。']);
  const send = () => {
    if (!message.trim()) return;
    setMessages(items => [...items, `我：${message.trim()}`]);
    setMessage('');
  };
  return (
    <AppScreen keyboardAware>
      <PageHeader title="直播课堂" subtitle="Mock 房间" />
      <Player kind="live" courseId={route.params.courseId} />
      <View style={styles.content}>
        <Text style={styles.title}>主观题每日带练</Text>
        <Text style={styles.subtitle}>王老师 · 20:00-21:30</Text>
        <SectionTitle title="课堂讨论" />
        <Card>
          {messages.map(item => <Text key={item} style={styles.message}>{item}</Text>)}
          <View style={styles.chatRow}>
            <MessageCircle size={18} color={colors.muted} />
            <TextInput value={message} onChangeText={setMessage} placeholder="输入本地模拟消息" placeholderTextColor={colors.muted} style={styles.chatInput} onSubmitEditing={send} />
            <Pressable accessibilityLabel="发送" onPress={send}><Send size={20} color={colors.brand} /></Pressable>
          </View>
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  player: {minHeight: 238, backgroundColor: colors.ink, padding: spacing.xl, alignItems: 'center', justifyContent: 'space-between'},
  audioPlayer: {minHeight: 310},
  playerBrand: {alignItems: 'center', marginTop: spacing.xl},
  playerBrandText: {fontSize: 13, color: '#FFFFFF', fontWeight: '700', marginTop: spacing.sm},
  controls: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xxl},
  playButton: {width: 62, height: 62, borderRadius: 31, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center'},
  timeline: {width: '100%'},
  timelineText: {fontSize: 10, color: '#B6B9C5', textAlign: 'right', marginTop: 6},
  content: {padding: spacing.lg},
  title: {fontSize: 20, fontWeight: '800', color: colors.ink},
  subtitle: {fontSize: 12, color: colors.muted, marginTop: 5},
  body: {fontSize: 14, lineHeight: 23, color: colors.body},
  message: {fontSize: 13, lineHeight: 20, color: colors.body, marginBottom: spacing.sm},
  chatRow: {height: 48, borderRadius: radius.md, backgroundColor: colors.page, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', marginTop: spacing.md},
  chatInput: {flex: 1, fontSize: 13, color: colors.ink, paddingHorizontal: spacing.sm},
});
