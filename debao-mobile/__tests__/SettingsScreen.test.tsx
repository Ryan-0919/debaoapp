import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import SettingsScreen from '../src/screens/account/SettingsScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({canGoBack: () => true, goBack: mockGoBack}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  act(() => node.props.onPress());
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

describe('SettingsScreen', () => {
  beforeEach(() => mockGoBack.mockClear());

  test('matches all three prototype groups without invented row interactions', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<SettingsScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '设置与隐私', '通知', '学习提醒', '每日学习计划提醒', '课程更新通知', '订单通知',
      '隐私', '账号与安全', '隐私政策', '关于', '版本信息', 'v2.4.1', '用户协议', '联系客服', '退出登录',
    ]));
    for (const label of ['学习提醒', '课程更新通知', '订单通知', '账号与安全', '隐私政策', '版本信息', '用户协议', '联系客服']) {
      expect(renderer!.root.findByProps({testID: `settings-row-${label}`}).props.onPress).toBeUndefined();
    }
    act(() => renderer!.unmount());
  });

  test('cancels the logout dialog without navigating', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<SettingsScreen />);});
    press(renderer!, 'settings-logout');
    expect(textValues(renderer!)).toEqual(expect.arrayContaining(['确认退出登录', '退出后需要重新登录才能访问您的学习数据。', '取消']));
    press(renderer!, 'settings-logout-cancel');
    expect(renderer!.root.findAll(node => node.props.testID === 'settings-logout-dialog')).toHaveLength(0);
    expect(mockGoBack).not.toHaveBeenCalled();
    act(() => renderer!.unmount());
  });

  test('returns to the previous page after logout confirmation', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<SettingsScreen />);});
    press(renderer!, 'settings-logout');
    press(renderer!, 'settings-logout-confirm');
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    act(() => renderer!.unmount());
  });
});
