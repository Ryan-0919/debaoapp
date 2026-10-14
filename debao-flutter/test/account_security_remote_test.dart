import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/account/security_screens.dart';

class _Transport implements ApiTransport {
  final calls = <String>[];

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/me/identities') return <JsonMap>[];
    if (path == '/v1/devices') {
      return <JsonMap>[
        {
          'id': 'web-1',
          'platform': 'ios',
          'name': 'Safari',
          'lastSeenAt': DateTime.now().toIso8601String(),
          'current': false,
        },
      ];
    }
    if (path == '/v1/account/deletion') return {'status': 'none'};
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    if (path == '/v1/account/phone/code' ||
        path == '/v1/account/identity/link-code' ||
        path == '/v1/account/deletion/code') {
      return {'accepted': true, 'expiresIn': 300, 'developmentCode': '123456'};
    }
    if (path == '/v1/account/deletion') return {'status': 'scheduled'};
    if (path == '/v1/account/deletion/cancel') return {'status': 'none'};
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    return {'removed': true, 'revokedSessions': 1};
  }
}

void main() {
  const profile = UserProfile(
    id: 'u1',
    name: '远程用户',
    phone: '13800138000',
    examYear: '2027',
  );

  testWidgets('remote security screen renders server state and device action',
      (tester) async {
    final transport = _Transport();
    await tester.pumpWidget(ProviderScope(
      overrides: [
        currentUserProvider.overrideWith((ref) async => profile),
        accountIdentitiesProvider
            .overrideWith((ref) async => const <AccountIdentity>[]),
        accountDevicesProvider.overrideWith((ref) async => const <UserDevice>[
              UserDevice(
                  id: 'web-1',
                  platform: 'ios',
                  name: 'Safari',
                  lastSeenAt: '2026-09-02T01:00:00Z'),
            ]),
        accountDeletionProvider.overrideWith(
            (ref) async => const AccountDeletionStatus(status: 'none')),
        accountSecurityRepositoryProvider
            .overrideWithValue(AccountSecurityRepository(transport)),
      ],
      child:
          const MaterialApp(home: AccountSecurityScreen(remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.text('138****8000'), findsOneWidget);
    expect(find.text('未绑定'), findsOneWidget);
    expect(find.text('Safari'), findsOneWidget);
    expect(find.text('移除'), findsOneWidget);

    await tester.tap(find.text('更换'));
    await tester.pumpAndSettle();
    expect(find.text('新手机号'), findsOneWidget);
    expect(find.text('当前号码验证码'), findsOneWidget);
    expect(find.text('新号码验证码'), findsOneWidget);
  });

  testWidgets('remote identity failure is explicit and does not look unbound',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        currentUserProvider.overrideWith((ref) async => profile),
        accountIdentitiesProvider
            .overrideWith((ref) async => throw StateError('identity offline')),
        accountDevicesProvider
            .overrideWith((ref) async => const <UserDevice>[]),
        accountDeletionProvider.overrideWith(
            (ref) async => const AccountDeletionStatus(status: 'none')),
      ],
      child:
          const MaterialApp(home: AccountSecurityScreen(remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();

    expect(find.text('第三方账号信息暂时无法加载'), findsOneWidget);
    expect(find.text('未绑定'), findsNothing);
  });

  testWidgets('remote deletion failure is explicit and does not offer action',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        currentUserProvider.overrideWith((ref) async => profile),
        accountIdentitiesProvider
            .overrideWith((ref) async => const <AccountIdentity>[]),
        accountDevicesProvider
            .overrideWith((ref) async => const <UserDevice>[]),
        accountDeletionProvider
            .overrideWith((ref) async => throw StateError('deletion offline')),
      ],
      child:
          const MaterialApp(home: AccountSecurityScreen(remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();

    expect(find.text('注销状态暂时无法加载'), findsOneWidget);
    expect(find.text('申请注销账号'), findsNothing);
  });
}
