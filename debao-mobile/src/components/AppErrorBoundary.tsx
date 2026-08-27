import {Component, type ErrorInfo, type PropsWithChildren} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AlertTriangle} from 'lucide-react-native';
import {colors, spacing} from '@/theme';
import {AppButton} from './ui';

interface State {
  error?: Error;
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with the platform monitoring adapter when a provider is selected.
    console.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <AlertTriangle size={42} color={colors.error} />
        <Text style={styles.title}>页面暂时无法显示</Text>
        <Text style={styles.description}>应用捕获到未处理错误。当前工程尚未接入正式错误监控平台。</Text>
        <View style={styles.action}>
          <AppButton label="重新加载页面" onPress={() => this.setState({error: undefined})} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  title: {fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: spacing.lg},
  description: {fontSize: 13, lineHeight: 21, color: colors.body, textAlign: 'center', marginTop: spacing.sm},
  action: {alignSelf: 'stretch', marginTop: spacing.xl},
});
