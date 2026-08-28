import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import FavoritesScreen from '../src/screens/tools/FavoritesScreen';

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

test('favorites matches the four-item prototype and opens saved questions', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<FavoritesScreen />);});

  const text = renderer!.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
  expect(text).toEqual(expect.arrayContaining([
    '共 4 条收藏',
    '关于善意取得制度适用的判断（第2题）',
    '善意取得——《民法典》第311条',
    '关于诉讼时效适用规则的判断（第3题）',
    '犯罪未完成形态的认定（第5题）',
  ]));

  const favoriteNodes = renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('favorite-'));
  expect(new Set(favoriteNodes.map(node => node.props.testID)).size).toBe(4);
  const firstFavorite = favoriteNodes.find(node => node.props.testID === 'favorite-1' && typeof node.props.onPress === 'function');
  act(() => firstFavorite!.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveAnswer', {mode: 'chapter', title: '收藏题目'});

  act(() => renderer!.unmount());
});
