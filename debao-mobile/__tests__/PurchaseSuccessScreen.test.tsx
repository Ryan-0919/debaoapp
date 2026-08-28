import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import PurchaseSuccessScreen from '../src/screens/commerce/PurchaseSuccessScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const routeParams = {
  productName: '2024法考全程班（主客一体·视频精讲）',
  productId: 'p1',
  orderId: 'DB-TEST-001',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, replace: mockReplace}),
  useRoute: () => ({params: routeParams}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

const renderSuccess = async (productId: string, productName: string) => {
  routeParams.productId = productId;
  routeParams.productName = productName;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(() => {renderer = ReactTestRenderer.create(<PurchaseSuccessScreen />);});
  return renderer!;
};

const press = async (renderer: ReactTestRenderer.ReactTestRenderer, testID: string) => {
  const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
  expect(target).toBeTruthy();
  await act(() => target.props.onPress());
};

test('auto-start purchase opens its associated course and common destinations', async () => {
  const renderer = await renderSuccess('p1', '2024法考全程班（主客一体·视频精讲）');
  expect(renderer.root.findByProps({testID: 'purchase-success-status'}).props.children).toBe('课程权限已自动开通');
  expect(renderer.root.findAll(node => node.props.children === '进入课程').length).toBeGreaterThan(0);

  await press(renderer, 'purchase-success-course');
  expect(mockNavigate).toHaveBeenCalledWith('CourseDetail', {courseId: 'c2'});
  await press(renderer, 'purchase-success-orders');
  expect(mockNavigate).toHaveBeenCalledWith('OrderList');
  await press(renderer, 'purchase-success-home');
  expect(mockReplace).toHaveBeenCalledWith('MainTabs', {screen: 'Home'});
  await act(() => renderer.unmount());
});

test('scheduled purchase shows activation timing and routes to the courses tab', async () => {
  const renderer = await renderSuccess('p4', '法考直播冲刺班（考前30天）');
  expect(renderer.root.findByProps({testID: 'purchase-success-status'}).props.children).toBe('课程将于开课日自动激活');
  expect(renderer.root.findAll(node => node.props.children === '开课后将收到通知，届时可进入课程').length).toBeGreaterThan(0);
  expect(renderer.root.findAll(node => node.props.children === '查看我的课程').length).toBeGreaterThan(0);
  await press(renderer, 'purchase-success-course');
  expect(mockReplace).toHaveBeenCalledWith('MainTabs', {screen: 'Courses'});
  await act(() => renderer.unmount());
});
