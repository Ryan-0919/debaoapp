import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Check, ChevronRight, Clock3} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'GradingSubmitSuccess'>;
const steps = ['答案已提交', 'AI 首轮批改', '老师人工复核', '报告发布'];

export default function GradingSubmitSuccessScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const {submissionId, paperId, questionTitle} = route.params;
  return <AppScreen backgroundColor={colors.page} scroll={false} testID="grading-submit-success-screen">
    <View style={styles.content}>
      <View style={styles.successIcon}><Check size={34} strokeWidth={3} color={colors.surface} /></View>
      <Text style={styles.title}>答案提交成功</Text>
      <Text style={styles.description}>AI 将先依据采分点完成初评，随后由批改老师人工复核。报告发布后可在批改记录中查看。</Text>
      <View style={styles.summary}>
        <Text style={styles.question} numberOfLines={2}>{questionTitle}</Text>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>提交编号</Text><Text selectable style={styles.metaValue}>{submissionId}</Text></View>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>预计反馈</Text><View style={styles.time}><Clock3 size={13} color={colors.brand} /><Text style={styles.timeText}>24 小时内</Text></View></View>
      </View>
      <View style={styles.flow}>
        {steps.map((step, index) => <View key={step} style={styles.step}><View style={[styles.stepDot, index === 0 && styles.stepDotActive]}>{index === 0 ? <Check size={12} strokeWidth={3} color={colors.surface} /> : <Text style={styles.stepNumber}>{index + 1}</Text>}</View><Text style={[styles.stepText, index === 0 && styles.stepTextActive]}>{step}</Text>{index < steps.length - 1 ? <View style={styles.stepLine} /> : null}</View>)}
      </View>
      <Pressable testID="grading-success-records" onPress={() => navigation.navigate('Grading')} style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>查看批改记录</Text><ChevronRight size={18} color={colors.surface} /></Pressable>
      {paperId ? <Pressable testID="grading-success-paper" onPress={() => navigation.navigate('GradingPaperDetail', {paperId})} style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>返回套卷</Text></Pressable> : null}
      <Pressable testID="grading-success-home" onPress={() => navigation.navigate('MainTabs', {screen: 'Home'})} style={({pressed}) => [styles.textButton, pressed && styles.pressed]}><Text style={styles.textButtonText}>返回首页</Text></Pressable>
    </View>
  </AppScreen>;
}

const styles = StyleSheet.create({
  content: {flex: 1, paddingHorizontal: 24, paddingTop: 52, alignItems: 'center'},
  successIcon: {width: 68, height: 68, borderRadius: 34, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.ink, marginTop: 20},
  description: {maxWidth: 340, fontSize: 13, lineHeight: 21, color: colors.body, textAlign: 'center', marginTop: 9},
  summary: {width: '100%', marginTop: 28, padding: 16, borderRadius: radius.md, backgroundColor: colors.surface},
  question: {fontSize: 15, lineHeight: 22, fontWeight: '600', color: colors.ink, paddingBottom: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  metaRow: {minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16},
  metaLabel: {fontSize: 12, color: colors.muted}, metaValue: {flex: 1, textAlign: 'right', fontSize: 11, color: colors.body},
  time: {flexDirection: 'row', alignItems: 'center', gap: 5}, timeText: {fontSize: 12, fontWeight: '600', color: colors.brand},
  flow: {width: '100%', paddingVertical: 24, paddingHorizontal: 4, flexDirection: 'row'},
  step: {flex: 1, alignItems: 'center', position: 'relative'},
  stepDot: {zIndex: 1, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  stepDotActive: {backgroundColor: colors.success, borderColor: colors.success}, stepNumber: {fontSize: 10, color: colors.muted},
  stepText: {fontSize: 10, lineHeight: 15, color: colors.muted, textAlign: 'center', marginTop: 7}, stepTextActive: {color: colors.success, fontWeight: '600'},
  stepLine: {position: 'absolute', left: '62%', right: '-38%', top: 12, height: 1, backgroundColor: colors.line},
  primaryButton: {width: '100%', height: 46, borderRadius: radius.md, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6},
  primaryText: {fontSize: 15, fontWeight: '700', color: colors.surface},
  secondaryButton: {width: '100%', height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 10},
  secondaryText: {fontSize: 14, fontWeight: '600', color: colors.body},
  textButton: {height: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'}, textButtonText: {fontSize: 13, color: colors.muted},
  pressed: {opacity: 0.68},
});
