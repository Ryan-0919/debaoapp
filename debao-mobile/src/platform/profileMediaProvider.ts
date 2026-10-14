import {NativeModules} from 'react-native';

export interface PickedAvatar {
  uri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName: string;
  width: number;
  height: number;
  size: number;
}

type NativeProfileMedia = {
  pickAvatar?(): Promise<PickedAvatar>;
};

const nativeProvider = NativeModules.DebaoProfileMedia as NativeProfileMedia | undefined;

export class ProfileMediaUnavailableError extends Error {
  readonly code = 'PROFILE_MEDIA_UNAVAILABLE';
}

export const profileMediaProvider = {
  async pickAvatar() {
    if (!nativeProvider?.pickAvatar) throw new ProfileMediaUnavailableError('当前安装包未配置头像图片选择能力');
    return nativeProvider.pickAvatar();
  },
};
