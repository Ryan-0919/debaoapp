import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import QuestionBankScreen from '../src/screens/tabs/QuestionBankScreen';

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

test('question bank mode switch replaces content without navigating away', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await act(() => {
    renderer = ReactTestRenderer.create(<QuestionBankScreen />);
  });

  expect(renderer!.root.findAllByProps({testID: 'question-bank-objective-content'}).length).toBeGreaterThan(0);
  expect(renderer!.root.findAllByProps({testID: 'question-bank-subjective-content'})).toHaveLength(0);

  const subjectiveTab = renderer!.root.findByProps({testID: 'question-bank-mode-subjective'});
  await act(() => subjectiveTab.props.onPress());

  expect(renderer!.root.findAllByProps({testID: 'question-bank-objective-content'})).toHaveLength(0);
  expect(renderer!.root.findAllByProps({testID: 'question-bank-subjective-content'}).length).toBeGreaterThan(0);
  expect(mockNavigate).not.toHaveBeenCalled();

  await act(() => renderer!.unmount());
}, 15000);
