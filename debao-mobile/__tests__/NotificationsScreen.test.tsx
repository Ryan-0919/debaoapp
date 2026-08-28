import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, View} from 'react-native';
import NotificationsScreen from '../src/screens/account/NotificationsScreen';

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

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

describe('NotificationsScreen', () => {
  beforeEach(() => mockGoBack.mockClear());

  test('renders all four prototype notifications in source order', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<NotificationsScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '消息通知', '学习提醒', '您已连续3天未完成今日学习计划，距考试还有42天，继续加油！', '10分钟前',
      '课程更新', '民法精讲课第19讲「不动产登记」已上线，点击继续学习。', '1小时前',
      '订单通知', '您的订单 DB2024031200001 已支付成功，课程权限已自动开通。', '2024年3月12日',
      '错题复习提醒', '您有28道错题待复习，建议今天完成民法错题巩固。', '昨天 09:00',
    ]));
    const rows = ['n1', 'n2', 'n3', 'n4'].map(id => renderer!.root.findByProps({testID: `notification-row-${id}`}));
    expect(rows.every(row => row.props.onPress === undefined)).toBe(true);
    act(() => renderer!.unmount());
  });

  test('marks only the first two notifications unread and uses all icon categories', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<NotificationsScreen />);});
    expect(renderer!.root.findAll(node => node.type === View && typeof node.props.testID === 'string' && node.props.testID.startsWith('notification-unread-'))).toHaveLength(2);
    expect(renderer!.root.findAll(node => node.type === View && node.props.testID === 'notification-icon-study')).toHaveLength(2);
    expect(renderer!.root.findAll(node => node.type === View && node.props.testID === 'notification-icon-course')).toHaveLength(1);
    expect(renderer!.root.findAll(node => node.type === View && node.props.testID === 'notification-icon-order')).toHaveLength(1);
    expect(textValues(renderer!)).not.toContain('未读');
    act(() => renderer!.unmount());
  });
});
