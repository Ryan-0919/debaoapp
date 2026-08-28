import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import CoursesScreen from '../src/screens/tabs/CoursesScreen';

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

test('courses implements calendar states, sheets and all-course navigation', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(() => target.props.onPress());
  };

  await act(() => {
    renderer = ReactTestRenderer.create(<CoursesScreen />);
  });

  expect(renderer!.root.findAllByProps({testID: 'course-session-s5'}).length).toBeGreaterThan(0);
  await press('courses-week-previous');
  expect(renderer!.root.findAllByProps({testID: 'courses-day-17'}).length).toBeGreaterThan(0);
  await press('courses-week-next');
  await press('courses-day-30');
  expect(renderer!.root.findAllByProps({testID: 'courses-empty-state'}).length).toBeGreaterThan(0);

  await press('courses-filter-missed');
  expect(renderer!.root.findAllByProps({testID: 'courses-empty-state'})).toHaveLength(0);
  await press('courses-reschedule');
  expect(renderer!.root.findAll(node => node.props.children === '调整补课日期').length).toBeGreaterThan(0);
  await press('courses-sheet-confirm');
  await press('courses-open-month');
  await press('courses-month-day-28');
  expect(renderer!.root.findAllByProps({testID: 'course-session-s9'}).length).toBeGreaterThan(0);

  await press('courses-view-all');
  expect(renderer!.root.findAllByProps({testID: 'courses-recorded-c1'}).length).toBeGreaterThan(0);
  await press('courses-training-add-请求权基础答题训练');
  await press('courses-sheet-confirm');
  expect(renderer!.root.findAllByProps({testID: 'courses-training-add-请求权基础答题训练'})[0].findAllByType(require('react-native').Text).some(node => node.props.children === '✓ 已加入日历')).toBe(true);

  await press('courses-training-open-请求权基础答题训练');
  expect(mockNavigate).toHaveBeenCalledWith('CourseDetail', {courseId: 'c1'});
  await press('courses-media-audio-继续收听');
  expect(mockNavigate).toHaveBeenCalledWith('AudioPlayer', {courseId: 'c2'});
  await press('courses-media-live-进入直播间');
  expect(mockNavigate).toHaveBeenCalledWith('LiveCourse', {courseId: 'c3'});

  await act(() => renderer!.unmount());
});
