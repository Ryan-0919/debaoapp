import type {ReactNode} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing} from '@/theme';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export function PageHeader({title, subtitle, back = true, right}: Props) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {back && navigation.canGoBack() ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回"
            hitSlop={10}
            onPress={() => navigation.goBack()}
            style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}>
            <ArrowLeft size={22} color={colors.ink} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.titleArea}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  side: {width: 48, alignItems: 'flex-start'},
  right: {alignItems: 'flex-end'},
  titleArea: {flex: 1, alignItems: 'center'},
  title: {fontSize: 17, fontWeight: '700', color: colors.ink},
  subtitle: {fontSize: 11, color: colors.muted, marginTop: 2},
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.55},
});
