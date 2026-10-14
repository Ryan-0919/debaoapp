import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import ForumComposeScreen from '../src/screens/tools/ForumComposeScreen';
import ForumDetailScreen from '../src/screens/tools/ForumDetailScreen';

// The report affordance is intentionally remote-only so the default Mock
// frame remains the RC prototype.  Exercise the authenticated surface here.
jest.mock('@/config/environment', () => ({environment: {useMocks: false}}));

const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, replace: mockReplace, navigate: mockNavigate, canGoBack: () => true}),
  useRoute: () => ({params: {postId: 'forum-test'}}),
}));

jest.mock('@/services', () => ({forumService: {
  list: jest.fn(),
  get: jest.fn(async () => ({id: 'forum-test', authorId: 'u-demo', userName: '法考学习者', category: '经验分享', title: '民法复习方法交流', body: '先整理请求权基础，再结合历年真题反复练习。', likes: 2, comments: 1, liked: false, favorited: false, canDelete: true, createdAt: '2026-08-31T08:00:00.000Z', updatedAt: '2026-08-31T08:00:00.000Z'})),
  create: jest.fn(async (input: {category: string; title: string; body: string}) => ({id: 'created-post', authorId: 'u-demo', userName: '法考学习者', ...input, likes: 0, comments: 0, liked: false, favorited: false, canDelete: true, createdAt: '2026-08-31T08:00:00.000Z', updatedAt: '2026-08-31T08:00:00.000Z'})),
  remove: jest.fn(async () => undefined),
  toggleLike: jest.fn(async () => ({id: 'forum-test', authorId: 'u-demo', userName: '法考学习者', category: '经验分享', title: '民法复习方法交流', body: '先整理请求权基础，再结合历年真题反复练习。', likes: 3, comments: 1, liked: true, favorited: false, canDelete: true, createdAt: '2026-08-31T08:00:00.000Z', updatedAt: '2026-08-31T08:00:00.000Z'})),
  toggleFavorite: jest.fn(async () => ({id: 'forum-test', authorId: 'u-demo', userName: '法考学习者', category: '经验分享', title: '民法复习方法交流', body: '先整理请求权基础，再结合历年真题反复练习。', likes: 2, comments: 1, liked: false, favorited: true, canDelete: true, createdAt: '2026-08-31T08:00:00.000Z', updatedAt: '2026-08-31T08:00:00.000Z'})),
  listComments: jest.fn(async () => ({items: [{id: 'comment-test', postId: 'forum-test', authorId: 'u-2', userName: '备考同学', body: '这个方法很实用。', canDelete: false, createdAt: '2026-08-31T09:00:00.000Z'}]})),
  createComment: jest.fn(async (_postId: string, body: string) => ({id: 'new-comment', postId: 'forum-test', authorId: 'u-demo', userName: '法考学习者', body, canDelete: true, createdAt: '2026-08-31T09:30:00.000Z'})),
  removeComment: jest.fn(async () => undefined),
  report: jest.fn(async (_postId: string, reason: string) => ({id: 'report-test', postId: 'forum-test', reason, status: 'pending', createdAt: '2026-08-31T09:45:00.000Z'})),
}}));
const mockForumService = require('@/services').forumService as {
  create: jest.Mock; toggleLike: jest.Mock; createComment: jest.Mock;
  report: jest.Mock;
};

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  return act(async () => { await node.props.onPress(); });
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children));
}

test('forum detail loads content and handles reactions and comments', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ForumDetailScreen />); });
  expect(textValues(renderer!)).toEqual(expect.arrayContaining(['民法复习方法交流', '这个方法很实用。', '全部评论']));

  await press(renderer!, 'forum-toggle-like');
  expect(mockForumService.toggleLike).toHaveBeenCalledWith('forum-test');
  expect(textValues(renderer!)).toContain('3');
  await press(renderer!, 'forum-toggle-favorite');
  expect(textValues(renderer!)).toContain('已收藏');

  const input = renderer!.root.findAllByType(TextInput).find(node => node.props.testID === 'forum-comment-input')!;
  act(() => input.props.onChangeText('感谢分享，我也准备这样复习。'));
  await press(renderer!, 'forum-comment-submit');
  expect(mockForumService.createComment).toHaveBeenCalledWith('forum-test', '感谢分享，我也准备这样复习。');
  expect(textValues(renderer!)).toContain('感谢分享，我也准备这样复习。');
  act(() => renderer!.unmount());
});

test('remote forum detail validates and submits a pending report', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ForumDetailScreen />); });
  await press(renderer!, 'forum-report-post');

  const reason = renderer!.root.findAllByType(TextInput).find(node => node.props.testID === 'forum-report-reason')!;
  act(() => reason.props.onChangeText('x'));
  await press(renderer!, 'forum-report-submit');
  expect(textValues(renderer!)).toContain('举报理由至少需要 2 个字');

  act(() => reason.props.onChangeText('违反社区规则'));
  mockForumService.report.mockRejectedValueOnce(new Error('举报服务暂不可用'));
  await press(renderer!, 'forum-report-submit');
  expect(textValues(renderer!)).toContain('举报服务暂不可用');

  await press(renderer!, 'forum-report-submit');
  expect(mockForumService.report).toHaveBeenCalledWith('forum-test', '违反社区规则');
  expect(textValues(renderer!)).toContain('举报已提交，我们会尽快处理');
  act(() => renderer!.unmount());
});

test('forum compose validates fields and opens the created post', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => { renderer = ReactTestRenderer.create(<ForumComposeScreen />); });
  const title = renderer!.root.findAllByType(TextInput).find(node => node.props.testID === 'forum-compose-title')!;
  const body = renderer!.root.findAllByType(TextInput).find(node => node.props.testID === 'forum-compose-body')!;
  act(() => { title.props.onChangeText('行政法复习顺序'); body.props.onChangeText('想请教大家行政法应该按照什么顺序开始复习？'); });
  await press(renderer!, 'forum-compose-category-答疑求助');
  await press(renderer!, 'forum-compose-submit');
  expect(mockForumService.create).toHaveBeenCalledWith({category: '答疑求助', title: '行政法复习顺序', body: '想请教大家行政法应该按照什么顺序开始复习？'});
  expect(mockReplace).toHaveBeenCalledWith('ForumDetail', {postId: 'created-post'});
  act(() => renderer!.unmount());
});
