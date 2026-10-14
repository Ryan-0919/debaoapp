import {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import {Camera, Check, ChevronRight, X} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {colors, radius, shadows} from '@/theme';
import {environment} from '@/config/environment';
import {authService} from '@/services';
import type {UserProfile} from '@/types/domain';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type FieldKey = 'nickname' | 'phone' | 'goal' | 'stage' | 'school';

interface Field {
  key: FieldKey;
  label: string;
  editable: boolean;
  inputType?: 'text' | 'select';
  options?: string[];
}

const fields: Field[] = [
  {key: 'nickname', label: '昵称', editable: true, inputType: 'text'},
  {key: 'phone', label: '手机号', editable: false},
  {key: 'goal', label: '备考目标', editable: true, inputType: 'text'},
  {
    key: 'stage',
    label: '备考阶段',
    editable: true,
    inputType: 'select',
    options: ['客观题备考阶段', '客观题精讲阶段', '客观题冲刺阶段', '主观题备考阶段', '主观题冲刺阶段'],
  },
  {key: 'school', label: '学校/单位', editable: true, inputType: 'text'},
];

const avatarColors = ['#4C4BEA', '#C0385A', '#3A7A46', '#A87000', '#1A5FA8', '#1A8B8B'];

const initialValues: Record<FieldKey, string> = {
  nickname: '李明远',
  phone: '138****8888',
  goal: '2024年法律职业资格考试',
  stage: '客观题精讲阶段',
  school: '未填写',
};

function SheetHeader({title, onClose}: {title: string; onClose: () => void}) {
  return (
    <View style={styles.sheetHeader}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <Pressable accessibilityLabel="关闭" hitSlop={8} onPress={onClose} style={styles.closeButton}>
        <X color={colors.body} size={20} />
      </Pressable>
    </View>
  );
}

function SheetButtons({onCancel, onSave}: {onCancel: () => void; onSave: () => void}) {
  return (
    <View style={styles.sheetButtons}>
      <Pressable accessibilityRole="button" onPress={onCancel} style={({pressed}) => [styles.sheetButton, styles.cancelButton, pressed && styles.pressed]} testID="profile-edit-cancel">
        <Text style={styles.cancelText}>取消</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onSave} style={({pressed}) => [styles.sheetButton, styles.saveButton, pressed && styles.pressed]} testID="profile-edit-save">
        <Text style={styles.saveText}>保存</Text>
      </Pressable>
    </View>
  );
}

export default function UserProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const [values, setValues] = useState(initialValues);
  const [editing, setEditing] = useState<Field | null>(null);
  const [draft, setDraft] = useState('');
  const [avatarColor, setAvatarColor] = useState(avatarColors[0]);
  const [avatarVisible, setAvatarVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverProfile, setServerProfile] = useState<UserProfile | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    authService.getProfile().then(profile => {
      if (!active) return;
      setServerProfile(profile);
      setValues(current => ({...current, nickname: profile.name, phone: profile.phone, goal: `${profile.examYear}年法律职业资格考试`}));
      if (profile.avatarColor) setAvatarColor(profile.avatarColor);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  const openEdit = (field: Field) => {
    if (!field.editable) return;
    setDraft(values[field.key]);
    setEditing(field);
  };

  const confirmEdit = () => {
    if (!editing) return;
    const value = draft.trim();
    const nextValues = {...values, [editing.key]: value || values[editing.key]};
    setValues(nextValues);
    setSaveError('');
    if (!environment.useMocks && serverProfile && (editing.key === 'nickname' || editing.key === 'goal')) {
      const year = editing.key === 'goal' ? nextValues.goal.match(/20\d{2}/)?.[0] ?? serverProfile.examYear : serverProfile.examYear;
      const nextProfile = {...serverProfile, name: nextValues.nickname, examYear: year};
      authService.updateProfile(nextProfile).then(setServerProfile).catch(error => {
        setValues(values);
        setSaveError(error instanceof Error ? error.message : '保存失败，请稍后重试。');
      });
    }
    setEditing(null);
    setSaved(true);
  };

  const confirmAvatar = () => {
    setSaveError('');
    if (!environment.useMocks && serverProfile) {
      authService.updateProfile({...serverProfile, avatarColor}).then(setServerProfile).catch(error => {
          setAvatarColor(serverProfile.avatarColor ?? avatarColors[0]);
          setSaveError(error instanceof Error ? error.message : '头像保存失败，请稍后重试。');
        });
    }
    setAvatarVisible(false);
    setSaved(true);
  };

  const nicknameInitial = values.nickname[0] ?? '我';

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="user-profile-screen">
      <PageHeader title="账号资料" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {saved ? (
          <View style={styles.savedBanner} testID="profile-saved-banner">
            <View style={styles.savedIcon}><Check color={colors.surface} size={10} strokeWidth={3} /></View>
            <Text style={styles.savedText}>已保存修改</Text>
          </View>
        ) : null}
        {saveError ? <View style={styles.errorBanner} testID="profile-save-error"><Text style={styles.errorText}>{saveError}</Text></View> : null}

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, {backgroundColor: avatarColor}]} testID="profile-avatar">{serverProfile?.avatarUrl ? <Image source={{uri: serverProfile.avatarUrl}} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{nicknameInitial}</Text>}</View>
            <Pressable accessibilityLabel="更换头像颜色" hitSlop={6} onPress={() => setAvatarVisible(true)} style={({pressed}) => [styles.cameraButton, pressed && styles.pressed]} testID="profile-avatar-camera">
              <Camera color={colors.surface} size={11} />
            </Pressable>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{values.nickname}</Text>
            <Text style={styles.profileGoal}>{values.goal}</Text>
            <Pressable accessibilityRole="button" onPress={() => setAvatarVisible(true)} testID="profile-avatar-link">
              <Text style={styles.avatarLink}>更换头像颜色</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldCard}>
          {fields.map((field, index) => (
            <Pressable
              accessibilityRole={field.editable ? 'button' : undefined}
              disabled={!field.editable}
              key={field.key}
              onPress={() => openEdit(field)}
              style={({pressed}) => [styles.fieldRow, index < fields.length - 1 && styles.divider, pressed && field.editable && styles.rowPressed]}
              testID={`profile-field-${field.key}`}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Text numberOfLines={1} style={[styles.fieldValue, values[field.key] === '未填写' && styles.placeholder]}>{values[field.key]}</Text>
              {field.editable ? <ChevronRight color="#C0C5D0" size={16} /> : <Text style={styles.locked}>不可修改</Text>}
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>账号安全</Text>
        <View style={styles.securityCard}>
            {[
            {label: '修改密码', description: '上次修改：90天前'},
            {label: '绑定微信', description: '已绑定'},
            {label: '注销账号', description: '删除所有数据', danger: true},
            ].map((item, index, items) => (
            <Pressable accessibilityRole="button" key={item.label} onPress={() => navigation.navigate('AccountSecurity')} style={({pressed}) => [styles.securityRow, index < items.length - 1 && styles.divider, pressed && styles.rowPressed]} testID={`profile-security-${index}`}>
              <View style={styles.securityCopy}>
                <Text style={[styles.securityTitle, item.danger && styles.danger]}>{item.label}</Text>
                <Text style={styles.securityDescription}>{item.description}</Text>
              </View>
              <ChevronRight color="#C0C5D0" size={16} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setEditing(null)} transparent visible={editing !== null}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <Pressable accessibilityLabel="关闭编辑" onPress={() => setEditing(null)} style={styles.dismissArea} />
          <View style={styles.sheet} testID="profile-edit-sheet">
            <SheetHeader onClose={() => setEditing(null)} title={`修改${editing?.label ?? ''}`} />
            {editing?.inputType === 'select' ? (
              <View style={styles.optionList}>
                {editing.options?.map(option => {
                  const selected = draft === option;
                  return (
                    <Pressable key={option} onPress={() => setDraft(option)} style={({pressed}) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]} testID={`profile-stage-${option}`}>
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      {selected ? <Check color={colors.brand} size={17} strokeWidth={2.5} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.inputArea}>
                <TextInput
                  autoFocus
                  maxLength={30}
                  onChangeText={setDraft}
                  selectionColor={colors.brand}
                  style={styles.input}
                  testID="profile-edit-input"
                  value={draft}
                />
                <Text style={styles.counter}>{draft.length} / 30</Text>
              </View>
            )}
            <SheetButtons onCancel={() => setEditing(null)} onSave={confirmEdit} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setAvatarVisible(false)} transparent visible={avatarVisible}>
        <View style={styles.overlay}>
          <Pressable accessibilityLabel="关闭头像选择" onPress={() => setAvatarVisible(false)} style={styles.dismissArea} />
          <View style={styles.sheet} testID="profile-avatar-sheet">
            <SheetHeader onClose={() => setAvatarVisible(false)} title="选择头像颜色" />
            <View style={styles.avatarPreviewRow}>
              <View style={[styles.avatarPreview, {backgroundColor: avatarColor}]}><Text style={styles.avatarText}>{nicknameInitial}</Text></View>
              <View>
                <Text style={styles.previewName}>{values.nickname}</Text>
                <Text style={styles.previewDescription}>选择你喜欢的颜色</Text>
              </View>
            </View>
            <View style={styles.colorRow}>
              {avatarColors.map((color, index) => {
                const selected = avatarColor === color;
                return (
                  <Pressable accessibilityLabel={`头像颜色${index + 1}`} key={color} onPress={() => setAvatarColor(color)} style={[styles.colorOutline, selected && {borderColor: color}]} testID={`profile-avatar-color-${index}`}>
                    <View style={[styles.colorSwatch, {backgroundColor: color}]}>{selected ? <Check color={colors.surface} size={16} strokeWidth={2.5} /> : null}</View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable accessibilityRole="button" onPress={confirmAvatar} style={({pressed}) => [styles.confirmButton, pressed && styles.pressed]} testID="profile-avatar-confirm">
              <Text style={styles.saveText}>确认</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 32},
  savedBanner: {height: 42, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(93, 167, 101, 0.3)', backgroundColor: colors.mint, flexDirection: 'row', alignItems: 'center', gap: 8},
  savedIcon: {width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success},
  savedText: {fontSize: 13, fontWeight: '500', color: '#3A7A46'},
  errorBanner: {minHeight: 42, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: '#FFF1EE', justifyContent: 'center'},
  errorText: {fontSize: 12, lineHeight: 18, color: '#B13B25'},
  profileCard: {minHeight: 102, marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center'},
  avatarWrap: {width: 68, height: 68},
  avatar: {width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...shadows.card},
  avatarText: {fontSize: 24, fontWeight: '700', color: colors.surface},
  avatarImage: {width: '100%', height: '100%'},
  cameraButton: {position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', ...shadows.card},
  profileCopy: {flex: 1, marginLeft: 16},
  profileName: {fontSize: 16, fontWeight: '700', color: colors.ink},
  profileGoal: {fontSize: 12, color: colors.muted, marginTop: 2},
  avatarLink: {fontSize: 12, color: colors.brand, marginTop: 6},
  fieldCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface},
  fieldRow: {minHeight: 56, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  rowPressed: {backgroundColor: colors.page},
  fieldLabel: {width: 96, flexShrink: 0, fontSize: 14, color: colors.muted},
  fieldValue: {flex: 1, fontSize: 14, color: colors.ink},
  placeholder: {color: '#C0C5D0'},
  locked: {fontSize: 11, color: '#C0C5D0'},
  sectionLabel: {fontSize: 12, color: colors.muted, marginHorizontal: 16, marginTop: 12, marginBottom: 6},
  securityCard: {marginHorizontal: 16, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface},
  securityRow: {minHeight: 68, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  securityCopy: {flex: 1},
  securityTitle: {fontSize: 14, color: colors.ink},
  securityDescription: {fontSize: 11, color: colors.muted, marginTop: 2},
  danger: {color: colors.error},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay},
  dismissArea: {flex: 1},
  sheet: {borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, paddingBottom: 24},
  sheetHeader: {height: 56, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sheetTitle: {fontSize: 16, fontWeight: '700', color: colors.ink},
  closeButton: {width: 28, height: 40, alignItems: 'flex-end', justifyContent: 'center'},
  inputArea: {paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20},
  input: {height: 50, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.brand, backgroundColor: colors.page, paddingHorizontal: 16, fontSize: 15, color: colors.ink},
  counter: {fontSize: 11, color: '#C0C5D0', textAlign: 'right', marginTop: 6},
  sheetButtons: {height: 48, paddingHorizontal: 20, flexDirection: 'row', gap: 8},
  sheetButton: {flex: 1, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center'},
  cancelButton: {borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface},
  cancelText: {fontSize: 14, color: colors.body},
  saveButton: {backgroundColor: colors.brand},
  saveText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  optionList: {paddingHorizontal: 20, paddingTop: 2, paddingBottom: 18, gap: 8},
  option: {height: 52, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  optionSelected: {borderColor: colors.brand, backgroundColor: colors.brandLight},
  optionText: {fontSize: 14, color: colors.body},
  optionTextSelected: {fontWeight: '600', color: colors.brand},
  avatarPreviewRow: {height: 88, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12},
  avatarPreview: {width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...shadows.card},
  previewName: {fontSize: 14, fontWeight: '600', color: colors.ink},
  previewDescription: {fontSize: 12, color: colors.muted, marginTop: 2},
  colorRow: {height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  colorOutline: {width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center'},
  colorSwatch: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'},
  confirmButton: {height: 48, marginHorizontal: 20, marginTop: 12, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand},
  pressed: {opacity: 0.78},
});
