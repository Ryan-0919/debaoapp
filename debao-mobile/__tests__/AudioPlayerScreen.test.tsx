import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import AudioPlayerScreen from '../src/screens/courses/AudioPlayerScreen';

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
  act(() => {renderer = ReactTestRenderer.create(<AudioPlayerScreen />);});
  return renderer!;
};

const press = (renderer: ReactTestRenderer.ReactTestRenderer, testID: string, event?: unknown) => {
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

test('audio player controls playback, seeking, looping and speed', () => {
  const renderer = renderPlayer();
  expect(renderer.root.findByProps({testID: 'audio-lesson-title'}).props.children).toBe('第18讲：物权变动的公示与公信原则');
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('0:38');

  press(renderer, 'audio-play');
  expect(renderer.root.findAllByProps({testID: 'audio-playing-badge'}).length).toBeGreaterThan(0);
  act(() => jest.advanceTimersByTime(1000));
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('0:39');
  press(renderer, 'audio-skip-forward');
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('0:54');
  press(renderer, 'audio-skip-back');
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('0:39');

  press(renderer, 'audio-loop');
  expect(renderer.root.findByProps({testID: 'audio-loop'}).props.accessibilityState.selected).toBe(true);
  press(renderer, 'audio-speed-button');
  expect(renderer.root.findAllByProps({testID: 'audio-speed-menu'}).length).toBeGreaterThan(0);
  press(renderer, 'audio-speed-1.5');
  expect(renderer.root.findAllByProps({testID: 'audio-speed-menu'})).toHaveLength(0);

  const waveform = renderer.root.findByProps({testID: 'audio-waveform'});
  act(() => waveform.props.onLayout({nativeEvent: {layout: {width: 300}}}));
  press(renderer, 'audio-waveform', {nativeEvent: {locationX: 150}});
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('6:00');
  act(() => renderer.unmount());
});

test('audio player switches transcript, notes and catalog lessons', () => {
  const renderer = renderPlayer('l8');
  press(renderer, 'audio-transcript-40');
  expect(renderer.root.findByProps({testID: 'audio-elapsed'}).props.children).toBe('0:40');

  press(renderer, 'audio-tab-notes');
  const input = renderer.root.findByProps({testID: 'audio-note-input'});
  act(() => input.props.onChangeText('登记是物权变动的公示方法'));
  press(renderer, 'audio-note-save');
  expect(renderer.root.findAll(node => node.props.children === '登记是物权变动的公示方法').length).toBeGreaterThan(0);

  press(renderer, 'audio-tab-catalog');
  press(renderer, 'audio-lesson-l9');
  expect(mockReplace).toHaveBeenCalledWith('AudioPlayer', {courseId: 'c1', lessonId: 'l9'});
  act(() => renderer.unmount());
});
