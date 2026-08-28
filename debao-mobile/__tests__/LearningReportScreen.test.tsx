import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import LearningReportScreen from '../src/screens/tools/LearningReportScreen';

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

test('learning report matches weekly, subject and practice data', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LearningReportScreen />);});

  expect(renderer!.root.findByProps({testID: 'learning-week-hours'}).props.children[0]).toBe('4.2 ');
  expect(renderer!.root.findAllByProps({testID: 'learning-week-chart'}).length).toBeGreaterThan(0);
  expect(renderer!.root.findAllByProps({testID: 'learning-subject-民事诉讼法'}).length).toBeGreaterThan(0);
  const weakSubject = renderer!.root.findByProps({testID: 'learning-subject-民事诉讼法'});
  const weakSubjectText = weakSubject.findAllByType(require('react-native').Text).map(node => Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children)).join('|');
  expect(weakSubjectText).toContain('53%');
  expect(renderer!.root.findAll(node => node.props.children === '2,847').length).toBeGreaterThan(0);
  expect(renderer!.root.findAll(node => node.props.children === '68%').length).toBeGreaterThan(0);
  expect(renderer!.root.findAll(node => node.props.children === '28').length).toBeGreaterThan(0);

  const practice = renderer!.root.findAll(node => node.props.testID === 'learning-report-practice' && typeof node.props.onPress === 'function')[0];
  act(() => practice.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveAnswer', {mode: 'chapter', title: '民事诉讼法专项'});
  act(() => renderer!.unmount());
});
