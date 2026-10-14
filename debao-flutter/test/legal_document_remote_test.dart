import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/account/account_service_screens.dart';
import 'package:debao_flutter/features/account/security_screens.dart';

class _FakeTransport implements ApiTransport {
  _FakeTransport(this.responses);
  final Map<String, dynamic> responses;
  final List<String> calls = [];

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    final response = responses[path];
    if (response is Exception) throw response;
    return response;
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    return responses[path] ?? <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    calls.add('PATCH $path');
    return responses[path] ?? <String, dynamic>{};
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async => {};
}

Map<String, dynamic> _privacy() => {
      'key': 'privacy',
      'title': '服务端隐私政策',
      'version': 3,
      'status': 'published',
      'updatedAt': '2026-09-01T00:00:00.000Z',
      'sections': [
        {'title': '服务端章节', 'body': '服务端正文'},
      ],
    };

void main() {
  test('legal repository reads versioned document sections', () async {
    final fake = _FakeTransport({'/v1/legal-documents/privacy': _privacy()});
    final document = await LegalRepository(fake).document('privacy');
    expect(document.title, '服务端隐私政策');
    expect(document.version, 3);
    expect(document.sections.single.body, '服务端正文');
    expect(fake.calls, contains('GET /v1/legal-documents/privacy'));
  });

  test('legal repository rejects malformed or unsupported documents', () async {
    final empty = _FakeTransport({
      '/v1/legal-documents/privacy': {
        ..._privacy(),
        'sections': <dynamic>[],
      },
    });
    await expectLater(
        LegalRepository(empty).document('privacy'), throwsA(isA<ApiError>()));
    await expectLater(
        LegalRepository(empty).document('other'), throwsA(isA<ApiError>()));
  });

  testWidgets('remote legal document renders server content and metadata',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        legalDocumentProvider('privacy').overrideWith((ref) async =>
            const AppLegalDocument(
                key: 'privacy',
                title: '服务端隐私政策',
                version: 3,
                updatedAt: '2026-09-01T00:00:00.000Z',
                sections: [AppLegalSection(title: '服务端章节', body: '服务端正文')])),
      ],
      child: const MaterialApp(
          home: LegalDocumentScreen(document: 'privacy', remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();
    expect(find.text('服务端隐私政策'), findsOneWidget);
    expect(find.text('服务端章节'), findsOneWidget);
    expect(find.text('服务端正文'), findsOneWidget);
    expect(find.text('版本 3 · 更新日期：2026-09-01'), findsOneWidget);
    expect(find.text('隐私政策'), findsNothing);
  });

  testWidgets('remote legal document failure does not render fixture content',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        legalDocumentProvider('terms')
            .overrideWith((ref) async => throw StateError('offline')),
      ],
      child: const MaterialApp(
          home: LegalDocumentScreen(document: 'terms', remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('legal-document-error')), findsOneWidget);
    expect(find.text('法律文档暂时不可用'), findsOneWidget);
    expect(find.text('服务说明'), findsNothing);
  });

  testWidgets('remote settings reads persisted notification preference',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        userSettingsProvider.overrideWith((ref) async => const UserSettings(
            userId: 'u1',
            learningReminders: false,
            courseUpdates: true,
            orderNotifications: true,
            updatedAt: '2026-09-01T00:00:00.000Z')),
      ],
      child: const MaterialApp(home: SettingsScreen(remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();
    final tile = tester.widget<SwitchListTile>(find.byType(SwitchListTile));
    expect(tile.value, false);
    expect(find.text('设置与隐私'), findsOneWidget);
  });
}
