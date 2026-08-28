import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import OrderDetailScreen from '../src/screens/commerce/OrderDetailScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
let mockOrderId = 'o1';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
  useRoute: () => ({params: {orderId: mockOrderId}}),
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

describe('OrderDetailScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    mockNavigate.mockClear();
    mockOrderId = 'o1';
  });

  test('shows the completed order and both prototype actions', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<OrderDetailScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '订单详情', '已完成', '课程权限已自动开通', '2024法考全程班（主客一体·视频精讲）', '视频课程',
      '¥3,980', 'DB2024031200001', '2024-03-12 14:32', '微信支付', '查看商品', '进入课程',
    ]));
    press(renderer!, 'order-view-product');
    expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {productId: 'p1'});
    press(renderer!, 'order-enter-course');
    expect(mockNavigate).toHaveBeenCalledWith('CourseDetail', {courseId: 'c1'});
    act(() => renderer!.unmount());
  });

  test('shows the pending order without a course action', () => {
    mockOrderId = 'o2';
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<OrderDetailScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '待开课', '课程将于开课日自动激活', '法考直播冲刺班（考前30天）', '直播课程',
      '¥680', 'DB2024052800078', '2024-05-28 09:15', '微信支付', '查看商品',
    ]));
    expect(renderer!.root.findAll(node => node.props.testID === 'order-enter-course')).toHaveLength(0);
    press(renderer!, 'order-view-product');
    expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {productId: 'p4'});
    act(() => renderer!.unmount());
  });
});
