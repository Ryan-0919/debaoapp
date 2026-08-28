import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const groups = [
  {
    title: '通知',
    items: [
      {label: '学习提醒', description: '每日学习计划提醒'},
      {label: '课程更新通知'},
      {label: '订单通知'},
    ],
  },
  {
    title: '隐私',
    items: [{label: '账号与安全'}, {label: '隐私政策'}],
  },
  {
    title: '关于',
    items: [
      {label: '版本信息', description: 'v2.4.1'},
      {label: '用户协议'},
      {label: '联系客服'},
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const confirmLogout = () => {
    setLogoutVisible(false);
    navigation.goBack();
  };

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="settings-screen">
      <PageHeader title="设置与隐私" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {groups.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.card}>
              {group.items.map((item, index) => (
                <View key={item.label} style={[styles.row, index < group.items.length - 1 && styles.divider]} testID={`settings-row-${item.label}`}>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{item.label}</Text>
                    {item.description ? <Text style={styles.rowDescription}>{item.description}</Text> : null}
                  </View>
                  <ChevronRight color="#C0C5D0" size={16} />
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.logoutWrap}>
          <Pressable accessibilityRole="button" onPress={() => setLogoutVisible(true)} style={({pressed}) => [styles.logoutButton, pressed && styles.logoutPressed]} testID="settings-logout">
            <Text style={styles.logoutText}>退出登录</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal animationType="fade" onRequestClose={() => setLogoutVisible(false)} transparent visible={logoutVisible}>
        <View style={styles.overlay}>
          <Pressable accessibilityLabel="关闭退出确认" onPress={() => setLogoutVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.dialog} testID="settings-logout-dialog">
            <View style={styles.dialogCopy}>
              <Text style={styles.dialogTitle}>确认退出登录</Text>
              <Text style={styles.dialogDescription}>退出后需要重新登录才能访问您的学习数据。</Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable accessibilityRole="button" onPress={() => setLogoutVisible(false)} style={({pressed}) => [styles.dialogButton, pressed && styles.actionPressed]} testID="settings-logout-cancel">
                <Text style={styles.cancelText}>取消</Text>
              </Pressable>
              <View style={styles.verticalDivider} />
              <Pressable accessibilityRole="button" onPress={confirmLogout} style={({pressed}) => [styles.dialogButton, pressed && styles.actionPressed]} testID="settings-logout-confirm">
                <Text style={styles.confirmText}>退出登录</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 24},
  group: {marginHorizontal: 16, marginTop: 12},
  groupTitle: {fontSize: 12, color: colors.muted, marginBottom: 6},
  card: {borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  row: {minHeight: 56, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  rowCopy: {flex: 1},
  rowTitle: {fontSize: 14, color: colors.ink},
  rowDescription: {fontSize: 12, color: colors.muted, marginTop: 2},
  logoutWrap: {marginHorizontal: 16, marginTop: 16},
  logoutButton: {height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  logoutPressed: {backgroundColor: '#FFF5F5'},
  logoutText: {fontSize: 15, fontWeight: '500', color: colors.error},
  overlay: {flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)'},
  dialog: {width: '100%', maxWidth: 320, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface},
  dialogCopy: {padding: 24},
  dialogTitle: {fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 8},
  dialogDescription: {fontSize: 14, lineHeight: 22, color: colors.body},
  dialogActions: {height: 49, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row'},
  dialogButton: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  actionPressed: {backgroundColor: colors.page},
  verticalDivider: {width: StyleSheet.hairlineWidth, backgroundColor: colors.line},
  cancelText: {fontSize: 15, fontWeight: '500', color: colors.body},
  confirmText: {fontSize: 15, fontWeight: '600', color: colors.error},
});
