import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import QuestionRecordsScreen from '../src/screens/tools/QuestionRecordsScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({canGoBack: () => true, goBack: mockGoBack, navigate: mockNavigate}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  act(() => node.props.onPress());
}

describe('QuestionRecordsScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    mockNavigate.mockClear();
  });

  test('matches the prototype totals and four records', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<QuestionRecordsScreen />);});

    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '做题记录', '2,847', '累计做题', '68%', '正确率',
      '今天 21:05', '民法·物权法', '昨天 20:30', '2023年卷一',
      '8月24日 19:15', '刑法·总论', '8月23日 21:40', '民法·合同法',
      '75%', '72%', '80%', '68%',
    ]));
    expect(renderer!.root.findAll(item =>
      /^question-record-r\d$/.test(item.props.testID ?? '') && typeof item.props.onPress === 'function',
    )).toHaveLength(4);
    act(() => renderer!.unmount());
  });

  test('opens the four-question report from every record', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<QuestionRecordsScreen />);});

    ['r1', 'r2', 'r3', 'r4'].forEach(id => press(renderer!, `question-record-${id}`));
    expect(mockNavigate).toHaveBeenCalledTimes(4);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'ObjectiveReport', {correct: 3, total: 4});
    expect(mockNavigate).toHaveBeenNthCalledWith(4, 'ObjectiveReport', {correct: 3, total: 4});
    act(() => renderer!.unmount());
  });
});
