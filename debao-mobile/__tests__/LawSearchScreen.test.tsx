import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import LawSearchScreen from '../src/screens/tools/LawSearchScreen';

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

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  act(() => node.props.onPress());
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

test('law search covers search, forum, notices, article sheet and practice navigation', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LawSearchScreen />);});

  expect(textValues(renderer!)).toEqual(expect.arrayContaining(['高频考点法条', '第311条　善意取得', '按科目浏览']));

  const input = renderer!.root.findByType(TextInput);
  act(() => input.props.onChangeText('善意取得'));
  press(renderer!, 'law-search-submit');
  expect(textValues(renderer!)).toContain('找到 1 条结果');

  press(renderer!, 'law-article-第311条');
  expect(renderer!.root.findAll(node => node.props.testID === 'law-article-sheet').length).toBeGreaterThan(0);
  press(renderer!, 'law-sheet-star');
  expect(textValues(renderer!)).toContain('已收藏');
  press(renderer!, 'law-related-practice');
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveAnswer', {mode: 'chapter', title: '第311条相关练习'});

  press(renderer!, 'law-main-tab-forum');
  const postIDs = new Set(renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('forum-post-')).map(node => node.props.testID));
  expect(postIDs.size).toBe(6);
  press(renderer!, 'forum-tag-答疑求助');
  const filteredPostIDs = new Set(renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('forum-post-')).map(node => node.props.testID));
  expect(filteredPostIDs.size).toBe(2);

  press(renderer!, 'law-main-tab-notices');
  expect(new Set(renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('notice-')).map(node => node.props.testID)).size).toBe(6);
  press(renderer!, 'notice-a1');
  const firstNoticeBody = renderer!.root.findAllByType(Text).find(node => String(node.props.children).startsWith('根据司法部统一部署'));
  expect(firstNoticeBody?.props.numberOfLines).toBeUndefined();

  act(() => renderer!.unmount());
});
