import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import OrderListScreen from '../src/screens/commerce/OrderListScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
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

test('order list matches the two prototype orders and opens details', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<OrderListScreen />);});

  expect(textValues(renderer!)).toEqual(expect.arrayContaining([
    '订单与已购', '已完成', '2024法考全程班（主客一体·视频精讲）', '2024-03-12 14:32', '¥3,980',
    '待开课', '法考直播冲刺班（考前30天）', '2024-05-28 09:15', '¥680',
  ]));
  expect(new Set(renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('order-row-')).map(node => node.props.testID)).size).toBe(2);

  const second = renderer!.root.findAll(node => node.props.testID === 'order-row-o2' && typeof node.props.onPress === 'function')[0];
  act(() => second.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('OrderDetail', {orderId: 'o2'});

  const back = renderer!.root.find(node => node.props.accessibilityLabel === '返回');
  act(() => back.props.onPress());
  expect(mockGoBack).toHaveBeenCalledTimes(1);
  act(() => renderer!.unmount());
});
