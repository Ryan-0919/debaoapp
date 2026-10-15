import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/core/security/secure_token_store.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/auth/login_screen.dart';

class _Transport implements ApiTransport {
  final calls = <String>[];

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/auth/providers') {
      return {
        'sms': {'available': true},
        'wechat': {'available': false},
        'oneClick': {'available': false},
      };
    }
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    if (path == '/v1/auth/send-code') {
      return {'accepted': true, 'expiresIn': 300, 'developmentCode': '123456'};
    }
    if (path == '/v1/auth/login') {
      return {
        'accessToken': 'access-ui',
        'refreshToken': 'refresh-ui',
        'expiresIn': 604800,
      };
    }
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async => {};

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async => {};
}

class _Tokens implements TokenStore {
  String? access;
  String? refresh;

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
    access = null;
    refresh = null;
  }
}

void main() {
  testWidgets('remote login sends code, persists session and reports success',
      (tester) async {
    final transport = _Transport();
    final tokens = _Tokens();
    await tester.pumpWidget(ProviderScope(
      overrides: [
        authRepositoryProvider
            .overrideWithValue(AuthRepository(transport, tokens)),
      ],
      child: const MaterialApp(home: LoginScreen(remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 20));

    await tester.tap(find.text('我已阅读并同意用户协议和隐私政策'));
    await tester.pump();
    await tester.tap(find.text('手机号登录'));
    await tester.pump();
    await tester.enterText(find.byType(TextField).at(0), '13800138000');
    await tester.tap(find.byKey(const ValueKey('auth-send-code')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 20));

    expect(find.text('验证码已发送，请查收短信。'), findsOneWidget);
    expect(tester.widget<TextField>(find.byType(TextField).at(1)).controller!.text, isEmpty);
    await tester.enterText(find.byType(TextField).at(1), '123456');
    await tester.tap(find.text('手机号登录'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 20));

    expect(tokens.access, 'access-ui');
    expect(tokens.refresh, 'refresh-ui');
    expect(
        transport.calls,
        containsAll(<String>[
          'GET /v1/auth/providers',
          'POST /v1/auth/send-code',
          'POST /v1/auth/login'
        ]));
    expect(find.text('登录成功'), findsOneWidget);
  });
}
