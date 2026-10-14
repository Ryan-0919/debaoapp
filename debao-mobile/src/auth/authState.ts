import {useSyncExternalStore} from 'react';
import {environment} from '@/config/environment';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

let status: AuthStatus = environment.useMocks ? 'authenticated' : 'loading';
const listeners = new Set<() => void>();

export function setAuthStatus(next: AuthStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach(listener => listener());
}

export function useAuthStatus() {
  return useSyncExternalStore(
    listener => { listeners.add(listener); return () => listeners.delete(listener); },
    () => status,
    () => status,
  );
}
