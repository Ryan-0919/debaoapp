import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import ProductDetailScreen from '../src/screens/commerce/ProductDetailScreen';

const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockCreate = jest.fn(async (_product: unknown) => ({
  id: 'DB-TEST-001',
  productName: '测试商品',
  amount: 3980,
  status: 'pending' as const,
  createdAt: '2026-08-28',
}));
const mockPay = jest.fn(async (_order: unknown) => ({status: 'mock-paid' as const, transactionId: 'PAY-001'}));
const routeParams = {productId: 'p1'};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, replace: mockReplace}),
  useRoute: () => ({params: routeParams}),
}));

jest.mock('@/services', () => ({
  orderService: {create: (product: unknown) => mockCreate(product)},
  paymentService: {pay: (order: unknown) => mockPay(order)},
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

const renderProduct = async (productId: string) => {
  routeParams.productId = productId;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(() => {renderer = ReactTestRenderer.create(<ProductDetailScreen />);});
  return renderer!;
};

const press = async (renderer: ReactTestRenderer.ReactTestRenderer, testID: string) => {
  const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
  expect(target).toBeTruthy();
  await act(async () => {await target.props.onPress();});
};

test('product detail expands the full syllabus and completes purchase', async () => {
  const renderer = await renderProduct('p1');
  expect(renderer.root.findByProps({testID: 'product-detail-name'}).props.children).toBe('2024法考全程班（主客一体·视频精讲）');
  expect(renderer.root.findAllByProps({testID: 'product-syllabus-item-4'})).toHaveLength(0);

  await press(renderer, 'product-syllabus-toggle');
  expect(renderer.root.findAllByProps({testID: 'product-syllabus-item-4'}).length).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({testID: 'product-syllabus-item-5'}).length).toBeGreaterThan(0);

  await press(renderer, 'product-buy');
  expect(renderer.root.findAllByProps({testID: 'product-purchase-sheet'}).length).toBeGreaterThan(0);
  await press(renderer, 'product-purchase-cancel');
  expect(renderer.root.findAllByProps({testID: 'product-purchase-sheet'})).toHaveLength(0);

  await press(renderer, 'product-buy');
  await press(renderer, 'product-purchase-confirm');
  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({id: 'p1', price: 3980}));
  expect(mockPay).toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith('PurchaseSuccess', {
    productName: '2024法考全程班（主客一体·视频精讲）',
    productId: 'p1',
    orderId: 'DB-TEST-001',
  });
  await act(() => renderer.unmount());
});

test('product detail adapts cover state and content for live and audio products', async () => {
  const liveRenderer = await renderProduct('p4');
  expect(liveRenderer.root.findByProps({testID: 'product-detail-type'}).props.children).toBe('直播课程');
  expect(liveRenderer.root.findAllByProps({testID: 'product-live-badge'}).length).toBeGreaterThan(0);
  expect(liveRenderer.root.findAllByProps({testID: 'product-audio-overlay'})).toHaveLength(0);
  expect(liveRenderer.root.findAll(node => node.props.children === '直播课程安排').length).toBeGreaterThan(0);
  await act(() => liveRenderer.unmount());

  const audioRenderer = await renderProduct('p5');
  expect(audioRenderer.root.findByProps({testID: 'product-detail-type'}).props.children).toBe('音频课程');
  expect(audioRenderer.root.findAllByProps({testID: 'product-audio-overlay'}).length).toBeGreaterThan(0);
  expect(audioRenderer.root.findAll(node => node.props.children === '音频目录（节选）').length).toBeGreaterThan(0);
  await act(() => audioRenderer.unmount());
});
