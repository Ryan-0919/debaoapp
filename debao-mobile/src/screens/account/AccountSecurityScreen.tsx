import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ChevronRight, CircleAlert, MessageCircle, MonitorSmartphone, Phone, ShieldCheck} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {authProvider} from '@/platform/authProvider';
import {authService, deviceService} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import type {UserProfile} from '@/types/domain';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Identity = {provider: 'wechat'; nickname?: string; boundAt: string};
type Device = {id: string; platform: 'android' | 'ios' | 'harmony'; name: string; lastSeenAt: string; current?: boolean};
type Deletion = {status: 'none' | 'scheduled'; requestedAt?: string; executeAfter?: string; coolingOffDays?: number};
type WechatAction = 'link' | 'unlink';

const validPhone = (value: string) => /^1\d{10}$/.test(value);
const validCode = (value: string) => /^\d{6}$/.test(value);
const messageFor = (error: unknown) => error instanceof Error ? error.message : '操作失败，请稍后重试。';
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}).format(new Date(value)) : '';

function SectionHeader({title, description}: {title: string; description?: string}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    </View>
  );
}

function CodeInput({label, value, onChangeText}: {label: string; value: string; onChangeText: (value: string) => void}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        autoComplete="sms-otp"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={text => onChangeText(text.replace(/\D/g, ''))}
        placeholder="请输入 6 位验证码"
        placeholderTextColor="#9DA2AE"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export default function AccountSecurityScreen() {
  const navigation = useNavigation<Navigation>();
  const [profile, setProfile] = useState<UserProfile>();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deletion, setDeletion] = useState<Deletion>({status: 'none'});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneForm, setPhoneForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [wechatAction, setWechatAction] = useState<WechatAction>();
  const [wechatAuthCode, setWechatAuthCode] = useState('');
  const [wechatSmsCode, setWechatSmsCode] = useState('');
  const [deletionForm, setDeletionForm] = useState(false);
  const [deletionCode, setDeletionCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [nextProfile, nextIdentities, nextDevices, nextDeletion] = await Promise.all([
        authService.getProfile(), authService.identities(), deviceService.list(), authService.deletionStatus(),
      ]);
      setProfile(nextProfile); setIdentities(nextIdentities); setDevices(nextDevices); setDeletion(nextDeletion);
    } catch (nextError) { setError(messageFor(nextError)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load().catch(() => undefined); }, [load]);

  const run = async (key: string, action: () => Promise<void>) => {
    if (busy) return;
    setBusy(key); setError(''); setSuccess('');
    try { await action(); } catch (nextError) { setError(messageFor(nextError)); }
    finally { setBusy(''); }
  };

  const sendCurrentPhoneCode = () => run('phone-old-code', async () => {
    const result = await authService.sendPhoneChangeCode('current');
    if (result.developmentCode) setOldCode(result.developmentCode);
    setSuccess('验证码已发送至当前手机号。');
  });

  const sendNewPhoneCode = () => {
    if (!validPhone(newPhone)) { setError('请输入正确的 11 位新手机号。'); return; }
    return run('phone-new-code', async () => {
      const result = await authService.sendPhoneChangeCode('new', newPhone);
      if (result.developmentCode) setNewCode(result.developmentCode);
      setSuccess('验证码已发送至新手机号。');
    });
  };

  const changePhone = () => {
    if (!validPhone(newPhone) || !validCode(oldCode) || !validCode(newCode)) { setError('请完整填写新手机号和两组 6 位验证码。'); return; }
    return run('phone-change', async () => {
      const next = await authService.phoneChange(newPhone, oldCode, newCode);
      setProfile(next); setPhoneForm(false); setNewPhone(''); setOldCode(''); setNewCode('');
      setSuccess('手机号已更换。');
    });
  };

  const prepareWechat = (action: WechatAction) => run(`wechat-${action}-prepare`, async () => {
    if (action === 'link') {
      const authorization = await authProvider.authorizeWechat();
      const result = await authService.sendIdentityLinkCode();
      setWechatAuthCode(authorization.code);
      if (result.developmentCode) setWechatSmsCode(result.developmentCode);
    } else {
      const result = await authService.sendIdentityUnlinkCode();
      if (result.developmentCode) setWechatSmsCode(result.developmentCode);
    }
    setWechatAction(action);
    setSuccess('验证码已发送至当前手机号。');
  });

  const confirmWechat = () => {
    if (!wechatAction || !validCode(wechatSmsCode)) { setError('请输入 6 位短信验证码。'); return; }
    return run(`wechat-${wechatAction}`, async () => {
      if (wechatAction === 'link') {
        const identity = await authService.bindWechatToCurrent(wechatAuthCode, wechatSmsCode);
        setIdentities([identity]); setSuccess('微信账号已绑定。');
      } else {
        await authService.unbindWechat(wechatSmsCode);
        setIdentities([]); setSuccess('微信账号已解绑。');
      }
      setWechatAction(undefined); setWechatSmsCode(''); setWechatAuthCode('');
    });
  };

  const removeDevice = (device: Device) => run(`device-${device.id}`, async () => {
    await deviceService.remove(device.id);
    setDevices(current => current.filter(item => item.id !== device.id));
    setSuccess('设备已移除，对应登录会话已失效。');
  });

  const prepareDeletion = () => run('deletion-code', async () => {
    const result = await authService.sendDeletionCode();
    if (result.developmentCode) setDeletionCode(result.developmentCode);
    setDeletionForm(true); setSuccess('注销验证码已发送至当前手机号。');
  });

  const requestDeletion = () => {
    if (!validCode(deletionCode)) { setError('请输入 6 位短信验证码。'); return; }
    return run('deletion-request', async () => {
      const next = await authService.requestDeletion(deletionCode);
      setDeletion(next); setDeletionForm(false); setDeletionCode('');
      setSuccess('注销申请已提交，可在冷静期内撤销。');
    });
  };

  const cancelDeletion = () => run('deletion-cancel', async () => {
    await authService.cancelDeletion();
    setDeletion({status: 'none'}); setSuccess('注销申请已撤销。');
  });

  const wechat = identities.find(item => item.provider === 'wechat');

  return (
    <AppScreen backgroundColor={colors.page} keyboardAware testID="account-security-screen">
      <PageHeader title="账号与安全" />
      {loading ? (
        <View style={styles.loading} testID="account-security-loading">
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>正在加载账号安全信息</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {error ? <View accessibilityLiveRegion="polite" style={styles.errorBox} testID="account-security-error"><CircleAlert color="#B13B25" size={17} /><Text style={styles.errorText}>{error}</Text><Pressable onPress={load}><Text style={styles.retryText}>重试</Text></Pressable></View> : null}
          {success ? <View accessibilityLiveRegion="polite" style={styles.successBox}><ShieldCheck color="#3A7A46" size={17} /><Text style={styles.successText}>{success}</Text></View> : null}

          <SectionHeader description="用于登录、找回账号和安全验证" title="手机号" />
          <View style={styles.panel}>
            <View style={styles.summaryRow}>
              <View style={styles.iconSurface}><Phone color={colors.brand} size={19} /></View>
              <View style={styles.summaryCopy}><Text style={styles.rowTitle}>当前手机号</Text><Text style={styles.rowDescription}>{profile?.phone ?? '未获取'}</Text></View>
              <Pressable disabled={Boolean(busy)} onPress={() => setPhoneForm(value => !value)} testID="security-phone-toggle"><Text style={styles.actionText}>{phoneForm ? '收起' : '更换'}</Text></Pressable>
            </View>
            {phoneForm ? <View style={styles.form} testID="security-phone-form">
              <Pressable disabled={Boolean(busy)} onPress={sendCurrentPhoneCode} style={styles.outlineButton} testID="security-phone-old-send"><Text style={styles.outlineButtonText}>{busy === 'phone-old-code' ? '发送中...' : '验证当前手机号'}</Text></Pressable>
              <CodeInput label="当前手机号验证码" onChangeText={setOldCode} value={oldCode} />
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>新手机号</Text><TextInput autoComplete="tel" keyboardType="phone-pad" maxLength={11} onChangeText={text => setNewPhone(text.replace(/\D/g, ''))} placeholder="请输入 11 位手机号" placeholderTextColor="#9DA2AE" style={styles.input} testID="security-new-phone" value={newPhone} /></View>
              <Pressable disabled={Boolean(busy) || !validPhone(newPhone)} onPress={sendNewPhoneCode} style={[styles.outlineButton, !validPhone(newPhone) && styles.disabled]} testID="security-phone-new-send"><Text style={styles.outlineButtonText}>{busy === 'phone-new-code' ? '发送中...' : '获取新号码验证码'}</Text></Pressable>
              <CodeInput label="新手机号验证码" onChangeText={setNewCode} value={newCode} />
              <Pressable disabled={Boolean(busy)} onPress={changePhone} style={styles.primaryButton} testID="security-phone-submit"><Text style={styles.primaryButtonText}>{busy === 'phone-change' ? '更换中...' : '确认更换手机号'}</Text></Pressable>
            </View> : null}
          </View>

          <SectionHeader description="微信登录仍需绑定本人手机号" title="第三方账号" />
          <View style={styles.panel}>
            <View style={styles.summaryRow}>
              <View style={[styles.iconSurface, styles.wechatSurface]}><MessageCircle color="#078C3D" size={19} /></View>
              <View style={styles.summaryCopy}><Text style={styles.rowTitle}>微信</Text><Text style={styles.rowDescription}>{wechat ? `已绑定${wechat.nickname ? ` · ${wechat.nickname}` : ''}` : '未绑定'}</Text></View>
              <Pressable disabled={Boolean(busy)} onPress={() => prepareWechat(wechat ? 'unlink' : 'link')} testID="security-wechat-action"><Text style={[styles.actionText, wechat && styles.dangerText]}>{wechat ? '解绑' : '绑定'}</Text></Pressable>
            </View>
            {wechatAction ? <View style={styles.form} testID="security-wechat-form">
              <Text style={styles.formHint}>{wechatAction === 'link' ? '微信授权已完成，请验证当前手机号后绑定。' : '解绑后将不能使用该微信账号登录。'}</Text>
              <CodeInput label="当前手机号验证码" onChangeText={setWechatSmsCode} value={wechatSmsCode} />
              <Pressable disabled={Boolean(busy)} onPress={confirmWechat} style={wechatAction === 'unlink' ? styles.dangerButton : styles.primaryButton} testID="security-wechat-confirm"><Text style={wechatAction === 'unlink' ? styles.dangerButtonText : styles.primaryButtonText}>{busy === `wechat-${wechatAction}` ? '处理中...' : wechatAction === 'link' ? '确认绑定' : '确认解绑'}</Text></Pressable>
            </View> : null}
          </View>

          <SectionHeader description="移除设备后，该设备需要重新登录" title="登录设备" />
          <View style={styles.panel} testID="security-device-list">
            {devices.length ? devices.map((device, index) => (
              <View key={device.id} style={[styles.deviceRow, index < devices.length - 1 && styles.divider]}>
                <MonitorSmartphone color={colors.body} size={20} />
                <View style={styles.summaryCopy}><View style={styles.deviceTitleRow}><Text numberOfLines={1} style={styles.rowTitle}>{device.name}</Text>{device.current ? <Text style={styles.currentTag}>当前设备</Text> : null}</View><Text style={styles.rowDescription}>{device.platform.toUpperCase()} · 最近使用 {formatDate(device.lastSeenAt)}</Text></View>
                {!device.current ? <Pressable disabled={Boolean(busy)} onPress={() => removeDevice(device)} testID={`security-device-remove-${device.id}`}><Text style={styles.dangerText}>{busy === `device-${device.id}` ? '移除中' : '移除'}</Text></Pressable> : null}
              </View>
            )) : <Text style={styles.emptyText}>暂无已登记的登录设备</Text>}
          </View>

          <SectionHeader description="注销申请提交后有 7 天冷静期" title="账号注销" />
          <View style={styles.panel}>
            {deletion.status === 'scheduled' ? <View style={styles.deletionState} testID="security-deletion-scheduled"><Text style={styles.rowTitle}>注销申请等待执行</Text><Text style={styles.formHint}>预计于 {formatDate(deletion.executeAfter)} 执行。冷静期内可撤销，执行后将退出所有设备并解除第三方账号绑定。</Text><Pressable disabled={Boolean(busy)} onPress={cancelDeletion} style={styles.outlineButton} testID="security-deletion-cancel"><Text style={styles.outlineButtonText}>{busy === 'deletion-cancel' ? '撤销中...' : '撤销注销申请'}</Text></Pressable></View> : <View style={styles.deletionState}><Text style={styles.formHint}>为保障账号安全，申请前需要验证当前手机号。依法需要保留的交易记录将按协议处理。</Text><Pressable disabled={Boolean(busy)} onPress={prepareDeletion} style={styles.dangerButton} testID="security-deletion-start"><Text style={styles.dangerButtonText}>{busy === 'deletion-code' ? '发送中...' : '申请注销账号'}</Text></Pressable></View>}
            {deletionForm ? <View style={styles.form} testID="security-deletion-form"><CodeInput label="当前手机号验证码" onChangeText={setDeletionCode} value={deletionCode} /><Pressable disabled={Boolean(busy)} onPress={requestDeletion} style={styles.dangerButton} testID="security-deletion-confirm"><Text style={styles.dangerButtonText}>{busy === 'deletion-request' ? '提交中...' : '确认提交注销申请'}</Text></Pressable></View> : null}
          </View>

          <View style={styles.legalLinks}>
            <Pressable onPress={() => navigation.navigate('LegalDocument', {document: 'sdk-list'})} style={styles.legalRow}><Text style={styles.legalText}>第三方 SDK 清单</Text><ChevronRight color={colors.muted} size={16} /></Pressable>
            <Pressable onPress={() => navigation.navigate('LegalDocument', {document: 'account-deletion'})} style={styles.legalRow}><Text style={styles.legalText}>账号注销说明</Text><ChevronRight color={colors.muted} size={16} /></Pressable>
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: spacing.lg, paddingBottom: spacing.section},
  loading: {paddingVertical: 72, alignItems: 'center'},
  loadingText: {marginTop: spacing.md, fontSize: 13, color: colors.muted},
  errorBox: {marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#FFF1EE'},
  errorText: {flex: 1, fontSize: 12, lineHeight: 18, color: '#B13B25'},
  retryText: {fontSize: 12, fontWeight: '700', color: '#B13B25'},
  successBox: {marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.mint},
  successText: {flex: 1, fontSize: 12, lineHeight: 18, color: '#3A7A46'},
  sectionHeader: {marginTop: spacing.xl, marginBottom: spacing.sm},
  sectionTitle: {fontSize: 14, fontWeight: '700', color: colors.ink},
  sectionDescription: {marginTop: 3, fontSize: 11, lineHeight: 17, color: colors.muted},
  panel: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  summaryRow: {minHeight: 68, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  iconSurface: {width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight},
  wechatSurface: {backgroundColor: colors.mint},
  summaryCopy: {flex: 1, minWidth: 0},
  rowTitle: {fontSize: 14, fontWeight: '600', color: colors.ink},
  rowDescription: {marginTop: 3, fontSize: 11, lineHeight: 17, color: colors.muted},
  actionText: {fontSize: 13, fontWeight: '700', color: colors.brand},
  dangerText: {fontSize: 13, fontWeight: '700', color: colors.error},
  form: {padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, gap: spacing.md},
  formHint: {fontSize: 12, lineHeight: 19, color: colors.body},
  inputGroup: {gap: 6},
  inputLabel: {fontSize: 12, color: colors.body},
  input: {height: 46, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 16, color: colors.ink, backgroundColor: colors.page},
  primaryButton: {minHeight: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand},
  primaryButtonText: {fontSize: 14, fontWeight: '700', color: colors.surface},
  outlineButton: {minHeight: 44, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.surface},
  outlineButtonText: {fontSize: 13, fontWeight: '700', color: colors.brand},
  dangerButton: {minHeight: 46, borderWidth: 1, borderColor: colors.error, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.surface},
  dangerButtonText: {fontSize: 14, fontWeight: '700', color: colors.error},
  disabled: {opacity: 0.45},
  deviceRow: {minHeight: 70, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  deviceTitleRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  currentTag: {paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden', fontSize: 10, fontWeight: '600', color: colors.brand, backgroundColor: colors.brandLight},
  emptyText: {padding: spacing.xl, textAlign: 'center', fontSize: 12, color: colors.muted},
  deletionState: {padding: spacing.lg, gap: spacing.md},
  legalLinks: {marginTop: spacing.xl, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  legalRow: {minHeight: 52, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  legalText: {fontSize: 13, color: colors.body},
});
