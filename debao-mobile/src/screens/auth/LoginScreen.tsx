import {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ArrowLeft, Check, LockKeyhole, MessageCircle, Scale, ShieldCheck, Smartphone} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {authService} from '@/services';
import {authProvider} from '@/platform/authProvider';
import {colors, radius, spacing} from '@/theme';

type Mode = 'options' | 'sms' | 'bind';

const validPhone = (value: string) => /^1\d{10}$/.test(value);

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : '登录失败，请稍后重试。';
}

export function AuthLoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingScreen} testID="auth-loading-screen">
      <View style={styles.loadingMark}><Scale size={28} color={colors.surface} strokeWidth={2.3} /></View>
      <ActivityIndicator color={colors.brand} style={styles.loadingIndicator} />
      <Text style={styles.loadingText}>正在恢复登录状态</Text>
    </SafeAreaView>
  );
}

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('options');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [bindingToken, setBindingToken] = useState<string>();
  const [wechatName, setWechatName] = useState('微信用户');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState<'wechat' | 'oneClick' | 'sms' | 'sendCode'>();
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({wechat: true, oneClick: true, sms: true});

  useEffect(() => {
    let active = true;
    Promise.all([authService.providers(), authProvider.capabilities()])
      .then(([server, native]) => {
        if (active) setAvailability({sms: server.sms.available, wechat: server.wechat.available && native.wechat, oneClick: server.oneClick.available && native.oneClick});
      })
      .catch(() => { if (active) setAvailability(current => ({...current, wechat: false, oneClick: false})); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const isBinding = mode === 'bind';
  const phoneReady = validPhone(phone);
  const canSubmitSms = phoneReady && code.length === 6 && availability.sms;
  const title = isBinding ? '绑定手机号' : mode === 'sms' ? '手机号登录' : '登录得宝';
  const description = isBinding
    ? `${wechatName}已完成微信授权，为保障学习资产安全，请绑定本人手机号。`
    : mode === 'sms'
      ? '输入手机号和验证码，登录后学习记录会自动同步。'
      : '登录后同步课程、题库记录和学习进度。';

  const ensureAgreement = () => {
    if (agreed) return true;
    setError('请先阅读并同意用户协议和隐私政策。');
    return false;
  };

  const startOneClick = async () => {
    if (!ensureAgreement()) return;
    setBusy('oneClick'); setError('');
    try {
      const result = await authProvider.getCarrierToken();
      await authService.oneClickLogin(result.providerToken, authProvider.deviceId, bindingToken);
    } catch (nextError) {
      setError(`${messageFor(nextError)} 可改用短信验证码。`);
      if (!isBinding) setMode('sms');
    } finally { setBusy(undefined); }
  };

  const startWechat = async () => {
    if (!ensureAgreement()) return;
    setBusy('wechat'); setError('');
    try {
      const {code: wechatCode} = await authProvider.authorizeWechat();
      const result = await authService.wechatLogin(wechatCode, authProvider.deviceId);
      if (result.status === 'binding_required') {
        setBindingToken(result.bindingToken);
        setWechatName(result.wechatProfile?.nickname || '微信用户');
        setMode('bind'); setPhone(''); setCode('');
      }
    } catch (nextError) { setError(messageFor(nextError)); }
    finally { setBusy(undefined); }
  };

  const sendCode = async () => {
    if (!phoneReady) { setError('请输入正确的 11 位手机号。'); return; }
    if (!ensureAgreement()) return;
    setBusy('sendCode'); setError('');
    try {
      const result = await authService.sendCode(phone, isBinding ? 'bind_phone' : 'login', authProvider.deviceId);
      if (!result.accepted) throw new Error('验证码暂时无法发送，请稍后重试。');
      setCountdown(60);
      if (result.developmentCode) setCode(result.developmentCode);
    } catch (nextError) { setError(messageFor(nextError)); }
    finally { setBusy(undefined); }
  };

  const submitSms = async () => {
    if (!ensureAgreement() || !canSubmitSms) return;
    setBusy('sms'); setError('');
    try {
      if (isBinding && bindingToken) await authService.bindWechatPhone(bindingToken, phone, code, authProvider.deviceId);
      else await authService.login(phone, code, authProvider.deviceId);
    } catch (nextError) { setError(messageFor(nextError)); }
    finally { setBusy(undefined); }
  };

  const goBack = () => {
    setError(''); setPhone(''); setCode('');
    if (isBinding) { setBindingToken(undefined); setMode('options'); }
    else setMode('options');
  };

  const consent = useMemo(() => (
    <Pressable accessibilityRole="checkbox" accessibilityState={{checked: agreed}} onPress={() => { setAgreed(value => !value); setError(''); }} style={styles.consent} testID="auth-consent">
      <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>{agreed ? <Check size={13} color={colors.surface} strokeWidth={3} /> : null}</View>
      <Text style={styles.consentText}>我已阅读并同意《用户协议》和《隐私政策》，并授权得宝进行必要的账号安全验证。</Text>
    </Pressable>
  ), [agreed]);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandArea}>
            {mode !== 'options' ? (
              <Pressable accessibilityLabel="返回登录方式" hitSlop={10} onPress={goBack} style={styles.backButton} testID="auth-back">
                <ArrowLeft size={22} color={colors.ink} />
              </Pressable>
            ) : null}
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><Scale size={27} color={colors.surface} strokeWidth={2.3} /></View>
              <View><Text style={styles.brandName}>得宝</Text><Text style={styles.brandCaption}>法律职业资格考试学习平台</Text></View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.actions}>
            {mode === 'options' ? (
              <>
                <Pressable disabled={busy !== undefined || !availability.oneClick} onPress={startOneClick} style={({pressed}) => [styles.primaryButton, (!availability.oneClick || busy !== undefined) && styles.disabled, pressed && styles.pressed]} testID="auth-one-click">
                  {busy === 'oneClick' ? <ActivityIndicator color={colors.surface} /> : <Smartphone size={20} color={colors.surface} />}
                  <Text style={styles.primaryButtonText}>本机号码一键登录</Text>
                </Pressable>
                <Pressable disabled={busy !== undefined || !availability.wechat} onPress={startWechat} style={({pressed}) => [styles.wechatButton, (!availability.wechat || busy !== undefined) && styles.disabled, pressed && styles.pressed]} testID="auth-wechat">
                  {busy === 'wechat' ? <ActivityIndicator color="#FFFFFF" /> : <MessageCircle size={20} color="#FFFFFF" fill="#FFFFFF" />}
                  <Text style={styles.wechatButtonText}>微信登录</Text>
                </Pressable>
                <Pressable disabled={busy !== undefined || !availability.sms} onPress={() => { setMode('sms'); setError(''); }} style={styles.smsEntry} testID="auth-sms-entry">
                  <Text style={styles.smsEntryText}>使用手机号验证码登录</Text>
                </Pressable>
                {(!availability.oneClick || !availability.wechat) ? <Text style={styles.capabilityNote}>当前安装包未配置的登录方式已停用，仍可使用短信验证码。</Text> : null}
              </>
            ) : (
              <>
                {isBinding && availability.oneClick ? (
                  <Pressable disabled={busy !== undefined} onPress={startOneClick} style={({pressed}) => [styles.primaryButton, busy !== undefined && styles.disabled, pressed && styles.pressed]} testID="auth-bind-one-click">
                    {busy === 'oneClick' ? <ActivityIndicator color={colors.surface} /> : <Smartphone size={20} color={colors.surface} />}
                    <Text style={styles.primaryButtonText}>本机号码一键绑定</Text>
                  </Pressable>
                ) : null}
                {isBinding && availability.oneClick ? <View style={styles.separator}><View style={styles.separatorLine} /><Text style={styles.separatorText}>或使用短信验证码</Text><View style={styles.separatorLine} /></View> : null}
                <View style={styles.field}>
                  <Smartphone size={18} color={colors.muted} />
                  <TextInput autoComplete="tel" keyboardType="phone-pad" maxLength={11} onChangeText={value => { setPhone(value.replace(/\D/g, '')); setError(''); }} placeholder="请输入手机号" placeholderTextColor="#9DA2AE" style={styles.input} testID="auth-phone-input" value={phone} />
                </View>
                <View style={styles.field}>
                  <LockKeyhole size={18} color={colors.muted} />
                  <TextInput autoComplete="sms-otp" keyboardType="number-pad" maxLength={6} onChangeText={value => { setCode(value.replace(/\D/g, '')); setError(''); }} placeholder="请输入验证码" placeholderTextColor="#9DA2AE" style={styles.input} testID="auth-code-input" value={code} />
                  <Pressable disabled={!phoneReady || countdown > 0 || busy !== undefined || !availability.sms} onPress={sendCode} style={styles.codeButton} testID="auth-send-code">
                    {busy === 'sendCode' ? <ActivityIndicator color={colors.brand} size="small" /> : <Text style={[styles.codeButtonText, (!phoneReady || countdown > 0) && styles.codeButtonDisabled]}>{countdown > 0 ? `${countdown}s` : '获取验证码'}</Text>}
                  </Pressable>
                </View>
                <Pressable disabled={!canSubmitSms || busy !== undefined} onPress={submitSms} style={({pressed}) => [styles.primaryButton, (!canSubmitSms || busy !== undefined) && styles.disabled, pressed && styles.pressed]} testID="auth-sms-submit">
                  {busy === 'sms' ? <ActivityIndicator color={colors.surface} /> : <ShieldCheck size={20} color={colors.surface} />}
                  <Text style={styles.primaryButtonText}>{isBinding ? '绑定并登录' : '登录'}</Text>
                </Pressable>
              </>
            )}

            {error ? <View accessibilityLiveRegion="polite" style={styles.errorBox} testID="auth-error"><Text style={styles.errorText}>{error}</Text></View> : null}
            {consent}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.surface},
  flex: {flex: 1},
  content: {flexGrow: 1, paddingBottom: 24},
  brandArea: {minHeight: 310, paddingHorizontal: 24, paddingTop: 36, paddingBottom: 28, justifyContent: 'flex-end', backgroundColor: colors.brandLight},
  backButton: {position: 'absolute', top: 18, left: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  brandRow: {position: 'absolute', top: 42, left: 24, flexDirection: 'row', alignItems: 'center', gap: 12},
  brandMark: {width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand},
  brandName: {fontSize: 21, fontWeight: '800', color: colors.ink},
  brandCaption: {fontSize: 11, color: colors.body, marginTop: 3},
  title: {fontSize: 30, lineHeight: 38, fontWeight: '800', color: colors.ink},
  description: {maxWidth: 330, marginTop: 10, fontSize: 14, lineHeight: 22, color: colors.body},
  actions: {paddingHorizontal: 24, paddingTop: 30, gap: 14},
  primaryButton: {height: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: colors.brand},
  primaryButtonText: {fontSize: 16, fontWeight: '700', color: colors.surface},
  wechatButton: {height: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#07A847'},
  wechatButtonText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
  smsEntry: {height: 42, alignItems: 'center', justifyContent: 'center'},
  smsEntryText: {fontSize: 14, fontWeight: '600', color: colors.brand},
  capabilityNote: {fontSize: 12, lineHeight: 19, textAlign: 'center', color: colors.muted},
  field: {height: 52, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface},
  input: {flex: 1, height: '100%', padding: 0, fontSize: 15, color: colors.ink},
  codeButton: {minWidth: 92, height: 38, alignItems: 'flex-end', justifyContent: 'center'},
  codeButtonText: {fontSize: 13, fontWeight: '600', color: colors.brand},
  codeButtonDisabled: {color: '#A7ABB5'},
  separator: {height: 28, flexDirection: 'row', alignItems: 'center', gap: 10},
  separatorLine: {height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: colors.line},
  separatorText: {fontSize: 11, color: colors.muted},
  errorBox: {padding: 12, borderRadius: radius.md, backgroundColor: '#FFF1EE'},
  errorText: {fontSize: 12, lineHeight: 18, color: '#B13B25'},
  consent: {marginTop: 2, flexDirection: 'row', alignItems: 'flex-start', gap: 9},
  checkbox: {width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#A7ABB5', alignItems: 'center', justifyContent: 'center'},
  checkboxChecked: {borderColor: colors.brand, backgroundColor: colors.brand},
  consentText: {flex: 1, fontSize: 11, lineHeight: 18, color: colors.muted},
  disabled: {opacity: 0.42},
  pressed: {opacity: 0.75},
  loadingScreen: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  loadingMark: {width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand},
  loadingIndicator: {marginTop: spacing.xl},
  loadingText: {marginTop: spacing.md, fontSize: 13, color: colors.muted},
});
