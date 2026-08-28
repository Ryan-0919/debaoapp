import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import ProfileScreen from '../src/screens/tabs/ProfileScreen';

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

test('profile matches prototype content and connects every menu route', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(() => target.props.onPress());
  };

  await act(() => {
    renderer = ReactTestRenderer.create(<ProfileScreen />);
  });

  await press('profile-avatar');
  expect(mockNavigate).toHaveBeenLastCalledWith('UserProfile');
  await press('profile-continue-course');
  expect(mockNavigate).toHaveBeenLastCalledWith('CourseDetail', {courseId: 'c1'});
  await press('profile-view-report');
  expect(mockNavigate).toHaveBeenLastCalledWith('LearningReport');

  const routes = [
    ['学习计划', 'LearningPlan'], ['学习报告', 'LearningReport'], ['做题记录', 'QuestionRecords'],
    ['错题本', 'MistakeBook'], ['收藏夹', 'Favorites'], ['订单与已购', 'OrderList'],
    ['批改服务', 'Grading'], ['消息通知', 'Notifications'], ['设置与隐私', 'Settings'],
  ] as const;
  for (const [label, route] of routes) {
    await press(`profile-menu-${label}`);
    expect(mockNavigate).toHaveBeenLastCalledWith(route);
  }
  await press('profile-menu-我的课程');
  expect(mockNavigate).toHaveBeenLastCalledWith('MainTabs', {screen: 'Courses'});

  await act(() => renderer!.unmount());
});
