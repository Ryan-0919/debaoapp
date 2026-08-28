import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import MallScreen from '../src/screens/tabs/MallScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('mall filters products, renders empty state and navigates with product id', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const findPressable = (testID: string) =>
    renderer!.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];

  await act(() => {
    renderer = ReactTestRenderer.create(<MallScreen />);
  });

  expect(findPressable('mall-product-p1')).toBeTruthy();
  expect(findPressable('mall-product-p6')).toBeTruthy();

  await act(() => findPressable('mall-category-主观题').props.onPress());
  expect(findPressable('mall-product-p3')).toBeTruthy();
  expect(findPressable('mall-product-p1')).toBeFalsy();

  await act(() => findPressable('mall-type-直播课程').props.onPress());
  expect(renderer!.root.findAllByProps({testID: 'mall-empty-state'}).length).toBeGreaterThan(0);

  await act(() => findPressable('mall-category-客观题').props.onPress());
  await act(() => findPressable('mall-product-p4').props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {productId: 'p4'});

  await act(() => renderer!.unmount());
});
