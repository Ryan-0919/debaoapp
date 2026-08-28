import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import LiveCourseScreen from '../src/screens/courses/LiveCourseScreen';

const mockGoBack = jest.fn();
const routeParams = {courseId: 'c3', title: '刑法重点罪名串讲'};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack}),
  useRoute: () => ({params: routeParams}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('live countdown uses route title and toggles subscription', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LiveCourseScreen />);});
  expect(renderer!.root.findByProps({testID: 'live-course-title'}).props.children).toBe('刑法重点罪名串讲');
  expect(renderer!.root.findByProps({testID: 'live-viewer-count'}).props.children).toEqual(['已预约 ', '6,284', ' 人']);

  const subscribe = renderer!.root.findAll(node => node.props.testID === 'live-subscribe' && typeof node.props.onPress === 'function')[0];
  act(() => subscribe.props.onPress());
  expect(renderer!.root.findByProps({testID: 'live-viewer-count'}).props.children).toEqual(['已预约 ', '6,285', ' 人']);
  expect(renderer!.root.findAll(node => node.props.children === '已预约开播提醒').length).toBeGreaterThan(0);

  const before = renderer!.root.findByProps({testID: 'live-countdown'}).findAllByType(require('react-native').Text).map(node => node.props.children).join('');
  act(() => jest.advanceTimersByTime(1000));
  const after = renderer!.root.findByProps({testID: 'live-countdown'}).findAllByType(require('react-native').Text).map(node => node.props.children).join('');
  expect(after).not.toBe(before);
  act(() => renderer!.unmount());
});
