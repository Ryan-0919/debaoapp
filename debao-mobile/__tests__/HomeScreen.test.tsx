import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import HomeScreen from '../src/screens/tabs/HomeScreen';

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

test('home mode switch replaces shortcuts and keeps typed navigation working', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const findPressables = (testID: string) =>
    renderer!.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function');

  await act(() => {
    renderer = ReactTestRenderer.create(<HomeScreen />);
  });

  expect(findPressables('home-shortcut-错题本')).toHaveLength(1);
  expect(findPressables('home-shortcut-法条检索')).toHaveLength(0);

  await act(() => renderer!.root.findByProps({testID: 'home-mode-subjective'}).props.onPress());

  expect(findPressables('home-shortcut-错题本')).toHaveLength(0);
  expect(findPressables('home-shortcut-法条检索')).toHaveLength(1);
  expect(findPressables('home-shortcut-批改')).toHaveLength(1);
  expect(mockNavigate).not.toHaveBeenCalled();

  await act(() => findPressables('home-shortcut-法条检索')[0].props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('LawSearch');

  await act(() => renderer!.unmount());
});
