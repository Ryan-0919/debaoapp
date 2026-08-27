import type {ReactNode} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {X} from 'lucide-react-native';
import {colors, radius, spacing} from '@/theme';
import {AppButton} from './ui';

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  description,
  children,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="关闭弹窗" style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel="关闭" hitSlop={8} onPress={onClose}>
              <X size={22} color={colors.ink} />
            </Pressable>
          </View>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {children}
          <AppButton label={confirmLabel} loading={loading} onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end'},
  dismissArea: {flex: 1},
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: 32,
  },
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md},
  title: {fontSize: 19, fontWeight: '700', color: colors.ink},
  description: {fontSize: 14, lineHeight: 21, color: colors.body, marginBottom: spacing.xl},
});
