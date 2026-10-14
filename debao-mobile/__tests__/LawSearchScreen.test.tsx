import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import LawSearchScreen from '../src/screens/tools/LawSearchScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
let mockRouteParams: {source?: 'subjective-answer'; subject?: string} | undefined;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
  useRoute: () => ({params: mockRouteParams}),
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

beforeEach(() => {
  mockRouteParams = undefined;
  mockGoBack.mockClear();
  mockNavigate.mockClear();
});

test('law search covers search, forum, article sheet and practice navigation', () => {
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
  press(renderer!, 'forum-post-f2');
  expect(mockNavigate).toHaveBeenCalledWith('ForumDetail', {postId: 'f2'});
  press(renderer!, 'forum-compose');
  expect(mockNavigate).toHaveBeenCalledWith('ForumCompose');

  expect(renderer!.root.findAll(node => node.props.testID === 'law-main-tab-notices')).toHaveLength(0);

  act(() => renderer!.unmount());
});

test('law search keeps the subjective answer context and presets its subject', () => {
  mockRouteParams = {source: 'subjective-answer', subject: '民法'};
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LawSearchScreen />);});

  expect(renderer!.root.findByProps({testID: 'law-answer-context'})).toBeTruthy();
  expect(textValues(renderer!)).toContain('正在作答：民法主观题，查询后可返回继续作答');
  const subjectButton = renderer!.root.findAll(node => node.props.testID === 'law-subject-民法' && node.props.accessibilityState)[0];
  expect(subjectButton.props.accessibilityState).toEqual({selected: true});
  press(renderer!, 'law-return-to-subjective');
  expect(mockGoBack).toHaveBeenCalledTimes(1);

  act(() => renderer!.unmount());
});

test('law search exposes the RC empty state for an unmatched query', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {renderer = ReactTestRenderer.create(<LawSearchScreen />);});
  const input = renderer!.root.findByType(TextInput);
  act(() => input.props.onChangeText('不存在的法条'));
  press(renderer!, 'law-search-submit');
  expect(textValues(renderer!)).toEqual(expect.arrayContaining([
    '未找到「不存在的法条」相关法条',
    '返回浏览',
  ]));
  expect(renderer!.root.findByProps({testID: 'law-search-empty-action'})).toBeTruthy();
  act(() => renderer!.unmount());
});
