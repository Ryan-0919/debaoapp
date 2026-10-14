import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import AnnouncementDetailScreen from '../src/screens/account/AnnouncementDetailScreen';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({params: {announcementId: 'announcement-1'}}),
  useNavigation: () => ({canGoBack: () => true, goBack: jest.fn()}),
}));

jest.mock('@/services', () => ({
  notificationService: {getAnnouncement: jest.fn(), markAnnouncementRead: jest.fn()},
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View} = require('react-native');
    return ReactRuntime.createElement(View, {testID}, children);
  },
}));

const notificationServiceMock = jest.requireMock('@/services').notificationService as {
  getAnnouncement: jest.Mock;
  markAnnouncementRead: jest.Mock;
};

describe('AnnouncementDetailScreen', () => {
  beforeEach(() => {
    notificationServiceMock.getAnnouncement.mockReset();
    notificationServiceMock.markAnnouncementRead.mockReset();
  });

  test('loads the full announcement and marks it as read', async () => {
    notificationServiceMock.getAnnouncement.mockResolvedValue({
      id: 'announcement-1',
      title: '法考报名提醒',
      body: '请在规定时间内完成报名。',
      status: 'published',
      isPinned: true,
      deepLink: '/announcements/announcement-1',
      read: false,
      closed: false,
      publishedAt: '2026-09-16T08:00:00.000Z',
      createdAt: '2026-09-16T08:00:00.000Z',
    });
    notificationServiceMock.markAnnouncementRead.mockResolvedValue({id: 'announcement-1', read: true});

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => { renderer = ReactTestRenderer.create(<AnnouncementDetailScreen />); });
    const texts = renderer!.root.findAllByType(Text).map(node => String(node.props.children));
    expect(texts).toEqual(expect.arrayContaining(['公告详情', '法考报名提醒', '请在规定时间内完成报名。', '置顶']));
    expect(notificationServiceMock.getAnnouncement).toHaveBeenCalledWith('announcement-1');
    expect(notificationServiceMock.markAnnouncementRead).toHaveBeenCalledWith('announcement-1');
    act(() => renderer!.unmount());
  });
});
