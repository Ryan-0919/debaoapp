import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import ObjectiveReportScreen from '../src/screens/questions/ObjectiveReportScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: mockGoBack}),
  useRoute: () => ({params: {correct: 3, total: 4}}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('objective report renders score, all reviews and both routes', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(() => target.props.onPress());
  };

  await act(() => {renderer = ReactTestRenderer.create(<ObjectiveReportScreen />);});
  expect(renderer!.root.findByProps({testID: 'objective-report-score'}).props.children).toBe(75);
  expect(renderer!.root.findAllByProps({testID: 'objective-review-0'}).length).toBeGreaterThan(0);
  expect(renderer!.root.findAllByProps({testID: 'objective-review-3'}).length).toBeGreaterThan(0);
  await press('objective-report-mistakes');
  expect(mockNavigate).toHaveBeenCalledWith('MistakeBook');
  await press('objective-report-return');
  expect(mockGoBack).toHaveBeenCalled();
  await act(() => renderer!.unmount());
});
