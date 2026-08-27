import {Platform} from 'react-native';

export type RuntimePlatform = 'android' | 'ios' | 'harmony' | 'unknown';

function resolvePlatform(): RuntimePlatform {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return Platform.OS;
  }
  if ((Platform.OS as string) === 'harmony') {
    return 'harmony';
  }
  return 'unknown';
}

export const platformCapabilities = {
  platform: resolvePlatform(),
  payment: {implemented: false, adapter: 'PaymentService'},
  push: {implemented: false, adapter: 'NotificationService'},
  media: {implemented: false, adapter: 'MediaService'},
  download: {implemented: false, adapter: 'DownloadService'},
} as const;
