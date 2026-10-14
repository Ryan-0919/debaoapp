import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/repositories.dart';

class _FakeTransport implements ApiTransport {
  _FakeTransport(this.responses, {this.deleteResponses = const {}});

  final Map<String, dynamic> responses;
  final Map<String, dynamic> deleteResponses;
  final calls = <String>[];
  final payloads = <String, Object?>{};

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    return responses[path];
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    payloads[path] = data;
    return responses[path] ?? <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      responses[path];

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    payloads[path] = data;
    return deleteResponses[path] ?? responses[path] ?? <String, dynamic>{};
  }
}

void main() {
  test('account security repository maps reads and writes to server contracts',
      () async {
    final transport = _FakeTransport({
      '/v1/me/identities': [
        {'provider': 'wechat', 'nickname': '学习者', 'boundAt': '2026-09-01'},
      ],
      '/v1/devices': [
        {
          'id': 'android-1',
          'platform': 'android',
          'name': 'Pixel',
          'lastSeenAt': '2026-09-01T10:00:00Z',
          'current': true,
        },
      ],
      '/v1/account/deletion': {
        'status': 'scheduled',
        'requestedAt': '2026-09-01T10:00:00Z',
        'executeAfter': '2026-09-08T10:00:00Z',
        'coolingOffDays': 7,
      },
      '/v1/account/phone/code': {
        'accepted': true,
        'expiresIn': 300,
        'developmentCode': '123456',
      },
      '/v1/account/phone/change': {
        'id': 'u1',
        'name': '用户',
        'phone': '13900112233',
        'examYear': '2027',
      },
      '/v1/me/identities/wechat': {
        'provider': 'wechat',
        'nickname': '新微信',
        'boundAt': '2026-09-02',
      },
      '/v1/account/deletion/cancel': {
        'status': 'none',
      },
      '/v1/devices/android-1': {
        'removed': true,
        'revokedSessions': 1,
      },
    }, deleteResponses: {
      '/v1/me/identities/wechat': {'removed': true},
    });
    final repository = AccountSecurityRepository(transport);

    expect((await repository.identities()).single.nickname, '学习者');
    expect((await repository.devices()).single.current, isTrue);
    expect((await repository.deletionStatus()).scheduled, isTrue);
    expect((await repository.sendPhoneCode(stage: 'current')).accepted, isTrue);
    expect(
        (await repository.changePhone(
                newPhone: '13900112233', oldCode: '123456', newCode: '123456'))
            .phone,
        '13900112233');
    expect(
        (await repository.bindWechat(
                authorizationCode: 'ticket', smsCode: '123456'))
            .provider,
        'wechat');
    expect(await repository.unlinkWechat('123456'), isTrue);
    expect((await repository.cancelDeletion()).status, 'none');
    expect((await repository.removeDevice('android-1')).revokedSessions, 1);
    expect(
        transport.payloads['/v1/account/phone/change'],
        allOf(
            isA<Map<String, dynamic>>(),
            containsPair('newPhone', '13900112233'),
            containsPair('oldCode', '123456'),
            containsPair('newCode', '123456')));
    expect(transport.calls, contains('DELETE /v1/me/identities/wechat'));
  });
}
