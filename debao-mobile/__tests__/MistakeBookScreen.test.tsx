import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import MistakeBookScreen from '../src/screens/tools/MistakeBookScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('mistake book matches the three-question prototype and review navigation', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<MistakeBookScreen />);});

  const text = renderer!.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
  expect(text).toEqual(expect.arrayContaining([
    '共 3 道错题待复习',
    '一键重做',
    '答错2次',
    '答错1次',
    '答错3次',
    '关于诉讼时效的适用，下列说法错误的是：',
  ]));

  const questionIDs = new Set(
    renderer!.root
      .findAll(node => String(node.props.testID ?? '').startsWith('mistake-question-'))
      .map(node => node.props.testID),
  );
  expect(questionIDs.size).toBe(3);
  expect(renderer!.root.findAll(node => node.props.testID === 'mistake-redo-action').every(node => node.props.onPress === undefined)).toBe(true);

  const civilFilter = renderer!.root.findAll(node =>
    node.props.testID === 'mistake-filter-民法' && typeof node.props.onPress === 'function',
  )[0];
  act(() => civilFilter.props.onPress());
  const selectedCivilFilter = renderer!.root.findAll(node =>
    node.props.testID === 'mistake-filter-民法' && node.props.accessibilityState?.selected === true,
  );
  expect(selectedCivilFilter.length).toBeGreaterThan(0);
  expect(questionIDs.size).toBe(3);

  const firstQuestion = renderer!.root.findAll(node =>
    node.props.testID === 'mistake-question-oq1' && typeof node.props.onPress === 'function',
  )[0];
  act(() => firstQuestion.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveAnswer', {mode: 'chapter', title: '错题复习'});

  act(() => renderer!.unmount());
});
