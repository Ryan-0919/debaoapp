import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import VideoPlayerScreen from '../src/screens/courses/VideoPlayerScreen';

const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const routeParams: {courseId: string; lessonId?: string} = {courseId: 'c1'};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, replace: mockReplace}),
  useRoute: () => ({params: routeParams}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

const renderPlayer = (lessonId?: string) => {
  routeParams.courseId = 'c1';
  routeParams.lessonId = lessonId;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<VideoPlayerScreen />);});
  return renderer!;
};

const press = (renderer: ReactTestRenderer.ReactTestRenderer, testID: string, event = {stopPropagation: jest.fn(), nativeEvent: {locationX: 0}}) => {
  const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
  expect(target).toBeTruthy();
  act(() => target.props.onPress(event));
};

beforeEach(() => {
  jest.useFakeTimers();
  mockGoBack.mockClear();
  mockReplace.mockClear();
});

afterEach(() => jest.useRealTimers());

test('video player controls playback visibility and speed', () => {
  const renderer = renderPlayer();
  expect(renderer.root.findByProps({testID: 'video-lesson-title'}).props.children).toBe('第18讲：物权变动的公示与公信原则');
  expect(renderer.root.findByProps({testID: 'video-time'}).props.children.join('')).toBe('5:38 / 20:00');

  press(renderer, 'video-center-play');
  act(() => jest.advanceTimersByTime(1000));
  expect(renderer.root.findByProps({testID: 'video-time'}).props.children.join('')).toBe('5:39 / 20:00');
  press(renderer, 'video-skip-forward');
  expect(renderer.root.findByProps({testID: 'video-time'}).props.children.join('')).toBe('5:49 / 20:00');

  press(renderer, 'video-speed-button');
  expect(renderer.root.findAllByProps({testID: 'video-speed-menu'}).length).toBeGreaterThan(0);
  press(renderer, 'video-speed-1.5');
  expect(renderer.root.findAllByProps({testID: 'video-speed-menu'})).toHaveLength(0);

  press(renderer, 'video-surface');
  expect(renderer.root.findAllByProps({testID: 'video-center-play'})).toHaveLength(0);
  expect(renderer.root.findAllByProps({testID: 'video-bottom-controls'})).toHaveLength(0);
  act(() => renderer.unmount());
});

test('video player switches tabs, saves notes and replaces the selected lesson', () => {
  const renderer = renderPlayer('l8');
  press(renderer, 'video-tab-handout');
  expect(renderer.root.findAllByProps({testID: 'video-handout'}).length).toBeGreaterThan(0);

  press(renderer, 'video-tab-notes');
  const input = renderer.root.findByProps({testID: 'video-note-input'});
  act(() => input.props.onChangeText('登记是物权变动的公示方法'));
  press(renderer, 'video-note-save');
  expect(renderer.root.findAll(node => node.props.children === '登记是物权变动的公示方法').length).toBeGreaterThan(0);

  press(renderer, 'video-tab-catalog');
  press(renderer, 'video-chapter-1');
  press(renderer, 'video-lesson-l9');
  expect(mockReplace).toHaveBeenCalledWith('VideoPlayer', {courseId: 'c1', lessonId: 'l9'});
  act(() => renderer.unmount());
});
