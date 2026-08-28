import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import SubjectiveSelectScreen from '../src/screens/questions/SubjectiveSelectScreen';

const mockNavigate = jest.fn();
let mockParams: {subject?: string} | undefined = {subject: '民法'};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, canGoBack: () => false}),
  useRoute: () => ({params: mockParams}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('subjective select filters, clears, navigates with question index and handles empty subjects', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(() => target.props.onPress());
  };

  await act(() => {renderer = ReactTestRenderer.create(<SubjectiveSelectScreen />);});
  expect(renderer!.root.findAllByProps({testID: 'subjective-question-q1'}).length).toBeGreaterThan(0);
  await press('subjective-question-q3');
  expect(mockNavigate).toHaveBeenLastCalledWith('SubjectiveAnswer', {subjectName: '民法', questionIndex: 2});

  await press('subjective-open-filter');
  await press('subjective-filter-year-2021');
  await press('subjective-filter-difficulty-易');
  await press('subjective-filter-confirm');
  expect(renderer!.root.findAllByProps({testID: 'subjective-empty'}).length).toBeGreaterThan(0);
  await press('subjective-clear-filter');
  expect(renderer!.root.findAllByProps({testID: 'subjective-question-q5'}).length).toBeGreaterThan(0);

  await act(() => renderer!.unmount());
  mockParams = {subject: '刑法'};
  await act(() => {renderer = ReactTestRenderer.create(<SubjectiveSelectScreen />);});
  expect(renderer!.root.findAllByProps({testID: 'subjective-empty'}).length).toBeGreaterThan(0);
  await act(() => renderer!.unmount());
});
