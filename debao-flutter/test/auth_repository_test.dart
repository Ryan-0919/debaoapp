import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/core/security/secure_token_store.dart';
import 'package:debao_flutter/data/repositories.dart';

class _FakeTransport implements ApiTransport {
  _FakeTransport(this.responses);

  final Map<String, dynamic> responses;
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
    final value = responses[path];
    if (value is Object && value is! Map<String, dynamic>) throw value;
    return value ?? <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      responses[path];

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      responses[path];
}

class _MemoryTokenStore implements TokenStore {
  String? access;
  String? refresh;
  bool cleared = false;

  @override
  Future<String?> readAccessToken() async => access;

  @override
  Future<String?> readRefreshToken() async => refresh;

  @override
  Future<void> writeTokens(
      {required String accessToken, required String refreshToken}) async {
    access = accessToken;
    refresh = refreshToken;
  }

  @override
  Future<void> clear() async {
    cleared = true;
    access = null;
    refresh = null;
  }
}

void main() {
  test('auth repository sends code and persists a real session', () async {
    final transport = _FakeTransport({
      '/v1/auth/providers': {
        'sms': {'available': true},
        'wechat': {'available': false},
        'oneClick': {'available': false},
      },
      '/v1/auth/send-code': {
        'accepted': true,
        'expiresIn': 300,
        'developmentCode': '123456',
      },
      '/v1/auth/login': {
        'accessToken': 'access-1',
        'refreshToken': 'refresh-1',
        'expiresIn': 604800,
        'profile': {'id': 'u1', 'name': '测试用户'},
      },
    });
    final tokens = _MemoryTokenStore();
    final repository = AuthRepository(transport, tokens);

    final providers = await repository.providers();
    final code =
        await repository.sendCode('13800138000', deviceId: 'flutter-test');
    final session = await repository.login('13800138000', '123456',
        deviceId: 'flutter-test');

    expect(providers.sms, isTrue);
    expect(providers.wechat, isFalse);
    expect(code.developmentCode, '123456');
    expect(session.profile?.name, '测试用户');
    expect(tokens.access, 'access-1');
    expect(tokens.refresh, 'refresh-1');
    expect(transport.payloads['/v1/auth/send-code'],
        containsPair('phone', '13800138000'));
    expect(
        transport.payloads['/v1/auth/login'], containsPair('code', '123456'));
  });

  test('logout clears persisted credentials even when server rejects it',
      () async {
    final transport = _FakeTransport({
      '/v1/auth/logout': StateError('offline'),
    });
    final tokens = _MemoryTokenStore()
      ..access = 'access-1'
      ..refresh = 'refresh-1';
    final repository = AuthRepository(transport, tokens);

    await expectLater(repository.logout(), throwsStateError);
    expect(tokens.cleared, isTrue);
    expect(tokens.access, isNull);
  });
}
