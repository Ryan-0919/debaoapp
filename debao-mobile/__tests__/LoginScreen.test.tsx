import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import LoginScreen from '../src/screens/auth/LoginScreen';

const mockWechatLogin = jest.fn(async (_code?: string, _deviceId?: string) => ({status: 'binding_required' as const, bindingToken: 'bind-test', expiresIn: 600, wechatProfile: {nickname: '微信学员'}}));
const mockOneClickLogin = jest.fn(async (_providerToken?: string, _deviceId?: string, _bindingToken?: string) => ({accessToken: 'access', refreshToken: 'refresh', expiresIn: 604800}));

jest.mock('@/services', () => ({
  authService: {
    providers: async () => ({sms: {available: true}, wechat: {available: true}, oneClick: {available: true}}),
    sendCode: async () => ({accepted: true, expiresIn: 300, developmentCode: '123456'}),
    login: async () => ({accessToken: 'access', refreshToken: 'refresh', expiresIn: 604800}),
    oneClickLogin: (providerToken: string, deviceId?: string, bindingToken?: string) => mockOneClickLogin(providerToken, deviceId, bindingToken),
    wechatLogin: (code: string, deviceId?: string) => mockWechatLogin(code, deviceId),
    bindWechatPhone: async () => ({accessToken: 'access', refreshToken: 'refresh', expiresIn: 604800}),
  },
}));

jest.mock('@/platform/authProvider', () => ({
  authProvider: {
    deviceId: 'test-device',
    capabilities: async () => ({wechat: true, oneClick: true}),
    authorizeWechat: async () => ({code: 'wechat-code'}),
    getCarrierToken: async () => ({providerToken: 'carrier-token', maskedPhone: '138****9190'}),
  },
}));

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children));
}

async function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  expect(node).toBeTruthy();
  await act(async () => { await node.props.onPress(); });
}

test('requires consent and sends first-time WeChat users to phone binding', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<LoginScreen />); });
  expect(textValues(renderer!)).toEqual(expect.arrayContaining(['得宝', '登录得宝', '本机号码一键登录', '微信登录', '使用手机号验证码登录']));

  await press(renderer!, 'auth-wechat');
  expect(textValues(renderer!)).toContain('请先阅读并同意用户协议和隐私政策。');
  expect(mockWechatLogin).not.toHaveBeenCalled();

  await press(renderer!, 'auth-consent');
  await press(renderer!, 'auth-wechat');
  expect(mockWechatLogin).toHaveBeenCalledWith('wechat-code', 'test-device');
  expect(textValues(renderer!)).toEqual(expect.arrayContaining(['绑定手机号', '本机号码一键绑定', '或使用短信验证码', '绑定并登录']));
  await act(() => renderer!.unmount());
});

test('uses the carrier token for one-click login', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<LoginScreen />); });
  await press(renderer!, 'auth-consent');
  await press(renderer!, 'auth-one-click');
  expect(mockOneClickLogin).toHaveBeenCalledWith('carrier-token', 'test-device', undefined);
  await act(() => renderer!.unmount());
});
