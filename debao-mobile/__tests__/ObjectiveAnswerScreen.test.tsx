import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import ObjectiveAnswerScreen from '../src/screens/questions/ObjectiveAnswerScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: mockGoBack}),
  useRoute: () => ({params: {mode: 'chapter', title: '民法总则'}}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

test('objective answer implements navigation, answer card and submit confirmation', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(() => target.props.onPress());
  };

  await act(() => {renderer = ReactTestRenderer.create(<ObjectiveAnswerScreen />);});
  expect(renderer!.root.findAll(node => node.props.children === '民法总则').length).toBeGreaterThan(0);
  expect(renderer!.root.findByProps({testID: 'objective-progress-text'}).props.children.join('')).toBe('1 / 4');

  await press('objective-next');
  expect(renderer!.root.findByProps({testID: 'objective-progress-text'}).props.children.join('')).toBe('2 / 4');
  await press('objective-previous');
  await press('objective-option-D');
  expect(renderer!.root.findAllByProps({testID: 'objective-option-D'})[0].props.accessibilityState).toEqual({selected: true});

  await press('objective-open-card');
  expect(renderer!.root.findAllByProps({testID: 'objective-card-sheet'}).length).toBeGreaterThan(0);
  expect(renderer!.root.findByProps({testID: 'objective-card-summary'}).props.children.join('')).toBe('已作答 1 / 4，未作答 3 题');
  await press('objective-card-question-1');
  expect(renderer!.root.findAllByProps({testID: 'objective-card-sheet'})).toHaveLength(0);
  await press('objective-option-A');

  await press('objective-open-card');
  await press('objective-card-question-3');
  expect(renderer!.root.findByProps({testID: 'objective-progress-text'}).props.children.join('')).toBe('4 / 4');
  await press('objective-submit-open');
  expect(renderer!.root.findAllByProps({testID: 'objective-submit-dialog'}).length).toBeGreaterThan(0);
  await press('objective-submit-cancel');
  expect(renderer!.root.findAllByProps({testID: 'objective-submit-dialog'})).toHaveLength(0);

  await press('objective-open-card');
  await press('objective-card-submit');
  await press('objective-submit-confirm');
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveReport', {correct: 2, total: 4});

  await act(() => renderer!.unmount());
});
