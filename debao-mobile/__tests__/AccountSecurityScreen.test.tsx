import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import AccountSecurityScreen from '../src/screens/account/AccountSecurityScreen';

const mockNavigate = jest.fn();
const mockGetProfile = jest.fn();
const mockIdentities = jest.fn();
const mockDeviceList = jest.fn();
const mockDeviceRemove = jest.fn();
const mockDeletionStatus = jest.fn();
const mockSendPhoneChangeCode = jest.fn();
const mockPhoneChange = jest.fn();
const mockSendIdentityUnlinkCode = jest.fn();
const mockUnbindWechat = jest.fn();
const mockSendDeletionCode = jest.fn();
const mockRequestDeletion = jest.fn();
const mockCancelDeletion = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({canGoBack: () => true, goBack: jest.fn(), navigate: mockNavigate}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

jest.mock('@/services', () => ({
  authService: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    identities: (...args: unknown[]) => mockIdentities(...args),
    deletionStatus: (...args: unknown[]) => mockDeletionStatus(...args),
    sendPhoneChangeCode: (...args: unknown[]) => mockSendPhoneChangeCode(...args),
    phoneChange: (...args: unknown[]) => mockPhoneChange(...args),
    sendIdentityLinkCode: jest.fn(),
    bindWechatToCurrent: jest.fn(),
    sendIdentityUnlinkCode: (...args: unknown[]) => mockSendIdentityUnlinkCode(...args),
    unbindWechat: (...args: unknown[]) => mockUnbindWechat(...args),
    sendDeletionCode: (...args: unknown[]) => mockSendDeletionCode(...args),
    requestDeletion: (...args: unknown[]) => mockRequestDeletion(...args),
    cancelDeletion: (...args: unknown[]) => mockCancelDeletion(...args),
  },
  deviceService: {
    list: (...args: unknown[]) => mockDeviceList(...args),
    remove: (...args: unknown[]) => mockDeviceRemove(...args),
  },
}));

jest.mock('@/platform/authProvider', () => ({authProvider: {authorizeWechat: jest.fn()}}));

function texts(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children));
}

async function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  await act(async () => { await node.props.onPress(); });
}

async function renderScreen() {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<AccountSecurityScreen />); });
  return renderer!;
}

describe('AccountSecurityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue({id: 'u1', name: '用户', phone: '138****9190', examYear: '2026', studyDays: 1});
    mockIdentities.mockResolvedValue([{provider: 'wechat', nickname: '微信用户', boundAt: '2026-08-31T00:00:00.000Z'}]);
    mockDeviceList.mockResolvedValue([
      {id: 'current', platform: 'android', name: '当前设备', lastSeenAt: '2026-08-31T00:00:00.000Z', current: true},
      {id: 'old', platform: 'ios', name: '旧 iPhone', lastSeenAt: '2026-08-20T00:00:00.000Z'},
    ]);
    mockDeletionStatus.mockResolvedValue({status: 'none'});
    mockDeviceRemove.mockResolvedValue(undefined);
    mockSendPhoneChangeCode.mockResolvedValue({accepted: true, expiresIn: 300, developmentCode: '123456'});
    mockPhoneChange.mockResolvedValue({id: 'u1', name: '用户', phone: '139****0000', examYear: '2026', studyDays: 1});
    mockSendIdentityUnlinkCode.mockResolvedValue({accepted: true, expiresIn: 300, developmentCode: '123456'});
    mockUnbindWechat.mockResolvedValue({removed: true});
    mockSendDeletionCode.mockResolvedValue({accepted: true, expiresIn: 300, developmentCode: '123456'});
    mockRequestDeletion.mockResolvedValue({status: 'scheduled', requestedAt: '2026-08-31T00:00:00.000Z', executeAfter: '2026-09-07T00:00:00.000Z', coolingOffDays: 7});
    mockCancelDeletion.mockResolvedValue({status: 'cancelled', cancelledAt: '2026-08-31T01:00:00.000Z'});
  });

  test('loads identity, devices and account status', async () => {
    const renderer = await renderScreen();
    expect(texts(renderer)).toEqual(expect.arrayContaining(['账号与安全', '138****9190', '已绑定 · 微信用户', '当前设备', '旧 iPhone', '申请注销账号']));
    expect(renderer.root.findAll(node => node.props.testID === 'account-security-loading')).toHaveLength(0);
    act(() => renderer.unmount());
  });

  test('changes phone after verifying both numbers', async () => {
    const renderer = await renderScreen();
    await press(renderer, 'security-phone-toggle');
    await press(renderer, 'security-phone-old-send');
    act(() => renderer.root.findByProps({testID: 'security-new-phone'}).props.onChangeText('13900000000'));
    await press(renderer, 'security-phone-new-send');
    await press(renderer, 'security-phone-submit');
    expect(mockSendPhoneChangeCode).toHaveBeenNthCalledWith(1, 'current');
    expect(mockSendPhoneChangeCode).toHaveBeenNthCalledWith(2, 'new', '13900000000');
    expect(mockPhoneChange).toHaveBeenCalledWith('13900000000', '123456', '123456');
    expect(texts(renderer)).toContain('手机号已更换。');
    act(() => renderer.unmount());
  });

  test('unlinks WeChat, removes another device and completes deletion lifecycle', async () => {
    const renderer = await renderScreen();
    await press(renderer, 'security-wechat-action');
    expect(renderer.root.findByProps({testID: 'security-wechat-form'})).toBeTruthy();
    await press(renderer, 'security-wechat-confirm');
    expect(mockUnbindWechat).toHaveBeenCalledWith('123456');

    await press(renderer, 'security-device-remove-old');
    expect(mockDeviceRemove).toHaveBeenCalledWith('old');
    expect(texts(renderer)).not.toContain('旧 iPhone');

    await press(renderer, 'security-deletion-start');
    const codeInput = renderer.root.findAllByType(TextInput).find(node => node.props.value === '123456');
    expect(codeInput).toBeTruthy();
    await press(renderer, 'security-deletion-confirm');
    expect(renderer.root.findByProps({testID: 'security-deletion-scheduled'})).toBeTruthy();
    await press(renderer, 'security-deletion-cancel');
    expect(mockCancelDeletion).toHaveBeenCalledTimes(1);
    expect(texts(renderer)).toContain('注销申请已撤销。');
    act(() => renderer.unmount());
  });
});
