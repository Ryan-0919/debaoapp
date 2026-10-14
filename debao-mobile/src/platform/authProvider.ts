import {NativeModules, Platform} from 'react-native';
import {environment} from '@/config/environment';

type NativeAuthProvider = {
  getCapabilities?(): Promise<{wechat: boolean; oneClick: boolean}>;
  authorizeWechat?(): Promise<{code: string}>;
  getCarrierToken?(): Promise<{providerToken: string; maskedPhone?: string}>;
};

const nativeProvider = NativeModules.DebaoAuthProvider as NativeAuthProvider | undefined;

export class NativeAuthUnavailableError extends Error {
  readonly code = 'NATIVE_AUTH_UNAVAILABLE';
}

export const authProvider = {
  async capabilities() {
    if (environment.authProviderMode === 'local') return {wechat: true, oneClick: true};
    return nativeProvider?.getCapabilities?.() ?? {wechat: false, oneClick: false};
  },
  async authorizeWechat() {
    if (environment.authProviderMode === 'local') return {code: 'local-wechat-mobile'};
    if (!nativeProvider?.authorizeWechat) throw new NativeAuthUnavailableError('当前安装包未配置微信登录');
    return nativeProvider.authorizeWechat();
  },
  async getCarrierToken() {
    if (environment.authProviderMode === 'local') return {providerToken: 'local-one-click:13800139190', maskedPhone: '138****9190'};
    if (!nativeProvider?.getCarrierToken) throw new NativeAuthUnavailableError('当前安装包未配置手机号一键登录');
    return nativeProvider.getCarrierToken();
  },
  deviceId: `${Platform.OS}-debao-app`,
};
