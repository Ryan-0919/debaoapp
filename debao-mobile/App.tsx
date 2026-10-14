import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from '@/navigation/AppNavigator';
import {colors} from '@/theme';
import {AppErrorBoundary} from '@/components/AppErrorBoundary';
import LoginScreen, {AuthLoadingScreen} from '@/screens/auth/LoginScreen';
import {useEffect} from 'react';
import {useAuthStatus} from '@/auth/authState';
import {initializeStoredSession} from '@/services/realServices';

function AppContent() {
  const authStatus = useAuthStatus();
  useEffect(() => { initializeStoredSession().catch(() => undefined); }, []);
  if (authStatus === 'loading') return <AuthLoadingScreen />;
  if (authStatus === 'anonymous') return <LoginScreen />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AppErrorBoundary>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
