import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import LearningPlanScreen from '../src/screens/tools/LearningPlanScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('learning plan matches the weekly prototype and remains read-only', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LearningPlanScreen />);});

  expect(renderer!.root.findByProps({testID: 'learning-plan-progress-value'}).props.children).toBe('1 / 4');
  expect(renderer!.root.findByProps({testID: 'learning-plan-progress-fill'}).props.style.width).toBe('25%');

  const text = renderer!.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
  expect(text).toEqual(expect.arrayContaining([
    '预计本周学习时长 3.5 小时，已完成 0.9 小时',
    '本周计划（8月26日–9月1日）',
    '观看刑法第8讲',
    '民事诉讼法专项练习',
    '2022年真题卷二精练',
  ]));

  const taskNodes = renderer!.root.findAll(node =>
    String(node.props.testID ?? '').startsWith('learning-plan-task-'),
  );
  const taskIDs = new Set(taskNodes.map(node => node.props.testID));
  expect(taskIDs.size).toBe(6);
  expect(taskNodes.every(node => node.props.onPress === undefined)).toBe(true);

  const backButton = renderer!.root.findAll(node =>
    node.props.accessibilityLabel === '返回' && typeof node.props.onPress === 'function',
  )[0];
  act(() => backButton.props.onPress());
  expect(mockGoBack).toHaveBeenCalledTimes(1);

  act(() => renderer!.unmount());
});
