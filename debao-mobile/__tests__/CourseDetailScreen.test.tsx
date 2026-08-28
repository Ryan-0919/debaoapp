import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import CourseDetailScreen from '../src/screens/courses/CourseDetailScreen';

const mockNavigate = jest.fn();
const routeParams = {courseId: 'c1'};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, canGoBack: () => true, goBack: jest.fn()}),
  useRoute: () => ({params: routeParams}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

const renderCourse = (courseId: string) => {
  routeParams.courseId = courseId;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<CourseDetailScreen />);});
  return renderer!;
};

const press = (renderer: ReactTestRenderer.ReactTestRenderer, testID: string) => {
  const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
  expect(target).toBeTruthy();
  act(() => target.props.onPress());
};

beforeEach(() => mockNavigate.mockClear());

test('owned course opens chapters and passes the selected lesson to video player', () => {
  const renderer = renderCourse('c1');
  expect(renderer.root.findByProps({testID: 'course-detail-name'}).props.children).toBe('民法精讲课（2024版）');
  expect(renderer.root.findAllByProps({testID: 'course-owned-state'}).length).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({testID: 'course-lesson-l1'}).length).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({testID: 'course-lesson-l8'})).toHaveLength(0);

  press(renderer, 'course-continue');
  expect(mockNavigate).toHaveBeenCalledWith('VideoPlayer', {courseId: 'c1', lessonId: undefined});

  press(renderer, 'course-chapter-1');
  expect(renderer.root.findAllByProps({testID: 'course-lesson-l1'})).toHaveLength(0);
  expect(renderer.root.findAllByProps({testID: 'course-lesson-l8'}).length).toBeGreaterThan(0);
  press(renderer, 'course-lesson-l8');
  expect(mockNavigate).toHaveBeenLastCalledWith('VideoPlayer', {courseId: 'c1', lessonId: 'l8'});
  act(() => renderer.unmount());
});

test('locked course sends purchase actions and lessons to its product', () => {
  const renderer = renderCourse('c2');
  expect(renderer.root.findByProps({testID: 'course-detail-name'}).props.children).toBe('刑法体系课（2024版）');
  expect(renderer.root.findAllByProps({testID: 'course-locked-state'}).length).toBeGreaterThan(0);

  press(renderer, 'course-buy');
  expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {productId: 'p1'});
  press(renderer, 'course-lesson-l22');
  expect(mockNavigate).toHaveBeenLastCalledWith('ProductDetail', {productId: 'p1'});
  act(() => renderer.unmount());
});
