import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import GradingServiceScreen from '../src/screens/tools/GradingServiceScreen';

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

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  act(() => node.props.onPress());
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

describe('GradingServiceScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    mockNavigate.mockClear();
  });

  test('matches usage and both prototype grading records', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<GradingServiceScreen />);});
    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '批改服务', '批改次数', '剩余 8 次', '已使用 2 次 / 共 10 次（含课程权益）',
      '提交主观题答案批改', '选择题目后提交您的书面答案，24小时内反馈', '批改记录',
      '已批改', '2023年真题', '38/50', '民法·股权转让案例', '论点清晰，法条引用准确，建议加强对抗辩权的分析。',
      '待批改', '2022年真题', '合同解除与违约责任',
    ]));
    expect(renderer!.root.findByProps({testID: 'grading-record-g1'}).props.onPress).toBeUndefined();
    expect(renderer!.root.findByProps({testID: 'grading-record-g2'}).props.onPress).toBeUndefined();
    act(() => renderer!.unmount());
  });

  test('opens the first civil-law subjective question from the submit card', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<GradingServiceScreen />);});
    press(renderer!, 'grading-submit');
    expect(mockNavigate).toHaveBeenCalledWith('SubjectiveAnswer', {questionIndex: 0, subjectName: '民法'});
    act(() => renderer!.unmount());
  });
});
