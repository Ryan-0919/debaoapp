import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import UserProfileScreen from '../src/screens/account/UserProfileScreen';

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

describe('UserProfileScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('matches the complete prototype profile and keeps display-only rows inert', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<UserProfileScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '账号资料', '李明远', '2024年法律职业资格考试', '更换头像颜色', '昵称', '手机号',
      '138****8888', '不可修改', '备考目标', '备考阶段', '客观题精讲阶段', '学校/单位',
      '未填写', '账号安全', '修改密码', '上次修改：90天前', '绑定微信', '已绑定', '注销账号', '删除所有数据',
    ]));
    expect(renderer!.root.findByProps({testID: 'profile-field-phone'}).props.disabled).toBe(true);
    for (const index of [0, 1, 2]) {
      expect(renderer!.root.findByProps({testID: `profile-security-${index}`}).props.onPress).toBeUndefined();
    }
    act(() => renderer!.unmount());
  });

  test('edits text fields, preserves blank values, and shows the timed saved banner', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<UserProfileScreen />);});
    press(renderer!, 'profile-field-nickname');
    const input = renderer!.root.findByProps({testID: 'profile-edit-input'}) as ReactTestRenderer.ReactTestInstance;
    expect(input.type).toBe(TextInput);
    act(() => input.props.onChangeText('法考学员'));
    expect(textValues(renderer!)).toContain('4 / 30');
    press(renderer!, 'profile-edit-save');
    expect(textValues(renderer!)).toEqual(expect.arrayContaining(['法考学员', '已保存修改']));

    press(renderer!, 'profile-field-school');
    act(() => renderer!.root.findByProps({testID: 'profile-edit-input'}).props.onChangeText('   '));
    press(renderer!, 'profile-edit-save');
    expect(textValues(renderer!)).toContain('未填写');
    act(() => jest.advanceTimersByTime(2000));
    expect(textValues(renderer!)).not.toContain('已保存修改');
    act(() => renderer!.unmount());
  });

  test('selects a preparation stage and one of the six avatar colors', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<UserProfileScreen />);});
    press(renderer!, 'profile-field-stage');
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '修改备考阶段', '客观题备考阶段', '客观题精讲阶段', '客观题冲刺阶段', '主观题备考阶段', '主观题冲刺阶段',
    ]));
    press(renderer!, 'profile-stage-主观题冲刺阶段');
    press(renderer!, 'profile-edit-save');
    expect(textValues(renderer!)).toContain('主观题冲刺阶段');

    press(renderer!, 'profile-avatar-link');
    expect(textValues(renderer!)).toEqual(expect.arrayContaining(['选择头像颜色', '选择你喜欢的颜色', '确认']));
    expect(renderer!.root.findAll(node => typeof node.props.testID === 'string' && node.props.testID.startsWith('profile-avatar-color-') && typeof node.props.onPress === 'function')).toHaveLength(6);
    press(renderer!, 'profile-avatar-color-2');
    press(renderer!, 'profile-avatar-confirm');
    expect(renderer!.root.findAll(node => node.props.testID === 'profile-avatar-sheet')).toHaveLength(0);
    act(() => renderer!.unmount());
  });
});
