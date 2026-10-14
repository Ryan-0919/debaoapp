import type {PropsWithChildren, ReactNode} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AlertCircle, ChevronRight, Inbox, RefreshCw} from 'lucide-react-native';
import {colors, radius, shadows, spacing} from '@/theme';

export function Card({children, style}: PropsWithChildren<{style?: object}>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({title, action}: {title: string; action?: ReactNode}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function Pill({label, tone = 'brand'}: {label: string; tone?: 'brand' | 'success' | 'warning' | 'neutral'}) {
  const palette = {
    brand: [colors.brandLight, colors.brand],
    success: [colors.mint, colors.success],
    warning: [colors.gold, colors.warning],
    neutral: [colors.page, colors.body],
  }[tone];
  return (
    <View style={[styles.pill, {backgroundColor: palette[0]}]}>
      <Text style={[styles.pillText, {color: palette[1]}]}>{label}</Text>
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
  testID?: string;
}

export function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  testID,
}: ButtonProps) {
  const palette = {
    primary: {background: colors.brand, foreground: '#FFFFFF', border: colors.brand},
    secondary: {background: colors.surface, foreground: colors.brand, border: colors.brand},
    danger: {background: colors.surface, foreground: colors.error, border: colors.error},
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {backgroundColor: palette.background, borderColor: palette.border},
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? <ActivityIndicator color={palette.foreground} /> : icon}
      <Text style={[styles.buttonText, {color: palette.foreground}]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({value, color = colors.brand}: {value: number; color?: string}) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <View accessibilityRole="progressbar" style={styles.progressTrack}>
      <View style={[styles.progressFill, {width: `${normalized}%`, backgroundColor: color}]} />
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  leading,
  onPress,
  trailing,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const body = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ?? (onPress ? <ChevronRight size={18} color={colors.muted} /> : null)}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({pressed}) => [styles.row, pressed && styles.rowPressed]}>{body}</Pressable>
  ) : (
    <View style={styles.row}>{body}</View>
  );
}

export function MockNotice({text}: {text: string}) {
  return (
    <View style={styles.notice}>
      <AlertCircle size={16} color={colors.warning} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

export function EmptyState({title, description}: {title: string; description: string}) {
  return (
    <View style={styles.empty}>
      <Inbox size={36} color={colors.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function RemoteState({
  testID,
  loading = false,
  error,
  empty = false,
  loadingLabel = '正在加载...',
  emptyTitle = '暂无数据',
  emptyDescription = '完成操作后，相关内容会显示在这里。',
  onRetry,
}: {
  testID: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <View testID={`${testID}-loading`} style={styles.remoteState}>
        <ActivityIndicator color={colors.brand} />
        <Text style={styles.remoteStateText}>{loadingLabel}</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View testID={`${testID}-error`} style={styles.remoteState}>
        <AlertCircle size={30} color={colors.error} />
        <Text accessibilityRole="alert" style={styles.remoteStateError}>{error}</Text>
        {onRetry ? (
          <Pressable testID={`${testID}-retry`} onPress={onRetry} style={({pressed}) => [styles.remoteRetry, pressed && styles.pressed]}>
            <RefreshCw size={14} color={colors.brand} />
            <Text style={styles.remoteRetryText}>重新加载</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View testID={`${testID}-empty`} style={styles.remoteState}>
        <Inbox size={30} color={colors.muted} />
        <Text style={styles.remoteStateTitle}>{emptyTitle}</Text>
        <Text style={styles.remoteStateText}>{emptyDescription}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionTitleRow: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.ink},
  pill: {paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill},
  pillText: {fontSize: 11, fontWeight: '600'},
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {fontSize: 15, fontWeight: '700'},
  disabled: {opacity: 0.45},
  pressed: {opacity: 0.72},
  progressTrack: {height: 7, borderRadius: radius.pill, backgroundColor: colors.line, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: radius.pill},
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowPressed: {opacity: 0.55},
  leading: {marginRight: spacing.md},
  rowText: {flex: 1},
  rowTitle: {fontSize: 15, fontWeight: '600', color: colors.ink},
  rowSubtitle: {fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18},
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  noticeText: {flex: 1, color: colors.body, fontSize: 12, lineHeight: 18},
  empty: {padding: 40, alignItems: 'center'},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: spacing.md},
  emptyDescription: {fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20},
  remoteState: {flex: 1, minHeight: 180, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.sm},
  remoteStateTitle: {fontSize: 14, fontWeight: '700', color: colors.ink, textAlign: 'center'},
  remoteStateText: {fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center'},
  remoteStateError: {maxWidth: 300, fontSize: 13, lineHeight: 20, color: colors.error, textAlign: 'center'},
  remoteRetry: {height: 40, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface},
  remoteRetryText: {fontSize: 13, fontWeight: '700', color: colors.brand},
});
