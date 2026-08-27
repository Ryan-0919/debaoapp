declare module 'react-native-safe-area-context' {
  import type {ComponentType, PropsWithChildren} from 'react';
  import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export type Edge = 'top' | 'right' | 'bottom' | 'left';
  export interface SafeAreaViewProps extends ViewProps {
    edges?: readonly Edge[];
    style?: StyleProp<ViewStyle>;
  }

  export const SafeAreaProvider: ComponentType<PropsWithChildren>;
  export const SafeAreaView: ComponentType<PropsWithChildren<SafeAreaViewProps>>;
  export function useSafeAreaInsets(): EdgeInsets;
}
