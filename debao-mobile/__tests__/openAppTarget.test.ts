import {openAppTarget} from '../src/navigation/openAppTarget';

describe('openAppTarget', () => {
  test('opens an announcement on its dedicated detail screen', () => {
    const navigate = jest.fn();
    openAppTarget({navigate} as never, '/announcements/a%20notice');
    expect(navigate).toHaveBeenCalledWith('AnnouncementDetail', {announcementId: 'a notice'});
  });
});
