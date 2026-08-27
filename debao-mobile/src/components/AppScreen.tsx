import type {PropsWithChildren, ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '@/theme';

interface Props extends PropsWithChildren {
  scroll?: boolean;
  footer?: ReactNode;
  keyboardAware?: boolean;
  backgroundColor?: string;
  testID?: string;
}

export function AppScreen({
  children,
  scroll = true,
  footer,
  keyboardAware = false,
  backgroundColor = colors.page,
  testID,
}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  const body = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safe, {backgroundColor}]}
      testID={testID}>
      {body}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  flex: {flex: 1},
  scrollContent: {paddingBottom: 32},
});
