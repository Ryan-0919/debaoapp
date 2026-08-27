import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Save} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {ConfirmSheet} from '@/components/ConfirmSheet';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, MockNotice, Pill} from '@/components/ui';
import {questionService} from '@/services';
import {useAppStore} from '@/store/useAppStore';
import {colors, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'SubjectiveAnswer'>;

export default function SubjectiveAnswerScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const draft = useAppStore(state => state.drafts.sq1 ?? '');
  const saveLocalDraft = useAppStore(state => state.saveDraft);
  const [answer, setAnswer] = useState(draft);
  const [savedAt, setSavedAt] = useState<string>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const saveDraft = async () => {
    saveLocalDraft('sq1', answer);
    await questionService.saveDraft({questionId: 'sq1', answers: [answer]});
    setSavedAt(new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}));
  };

  const submit = async () => {
    setSubmitting(true);
    await questionService.submit({questionId: 'sq1', answers: [answer]});
    setSubmitting(false);
    setConfirmVisible(false);
    navigation.replace('QuestionRecords');
  };

  return (
    <AppScreen keyboardAware footer={
      <View style={styles.footer}>
        <AppButton label="保存草稿" variant="secondary" icon={<Save size={17} color={colors.brand} />} onPress={saveDraft} />
        <View style={styles.footerPrimary}><AppButton label="提交作答" disabled={!answer.trim()} onPress={() => setConfirmVisible(true)} /></View>
      </View>
    }>
      <PageHeader title="主观题作答" subtitle={route.params.subjectName} />
      <MockNotice text="草稿保存在本机；服务端同步和人工批改接口尚未接入。" />
      <View style={styles.content}>
        <Card>
          <View style={styles.tagRow}><Pill label={route.params.subjectName} /><Pill label="40 分" tone="warning" /></View>
          <Text style={styles.caseTitle}>甲公司股权转让与债权人保护</Text>
          <Text style={styles.caseBody}>甲公司股东乙拟将其持有的股权转让给公司外部的丙，其他股东已明确放弃优先购买权。公司同时存在到期债务及低价处分资产的行为。</Text>
        </Card>
        <Text style={styles.question}>1. 乙主张股权转让协议无效的理由是否成立？请说明理由。</Text>
        <TextInput
          multiline
          value={answer}
          onChangeText={setAnswer}
          placeholder="请按照结论、法律依据、事实涵摄的结构作答……"
          placeholderTextColor={colors.muted}
          style={styles.input}
          textAlignVertical="top"
        />
        <Text style={styles.saveState}>{savedAt ? `草稿已保存 ${savedAt}` : answer ? '内容尚未保存' : '尚未作答'}</Text>
      </View>
      <ConfirmSheet
        visible={confirmVisible}
        title="确认提交"
        description="提交后将进入答题记录。当前批改结果为 Mock 状态，不会发送给真实老师。"
        confirmLabel="确认提交"
        loading={submitting}
        onClose={() => setConfirmVisible(false)}
        onConfirm={submit}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  tagRow: {flexDirection: 'row', gap: spacing.sm},
  caseTitle: {fontSize: 17, lineHeight: 24, fontWeight: '800', color: colors.ink, marginTop: spacing.md},
  caseBody: {fontSize: 13, lineHeight: 22, color: colors.body, marginTop: spacing.md},
  question: {fontSize: 15, lineHeight: 23, fontWeight: '700', color: colors.ink, marginTop: spacing.xl},
  input: {minHeight: 210, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.line, padding: spacing.lg, fontSize: 14, lineHeight: 22, color: colors.ink},
  saveState: {fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: spacing.sm},
  footer: {padding: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', gap: spacing.md},
  footerPrimary: {flex: 1},
});
