import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/features/account/account_service_screens.dart';

void main() {
  testWidgets('remote profile failure does not render fixture profile',
      (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        currentUserProvider
            .overrideWith((ref) async => throw StateError('offline')),
      ],
      child: const MaterialApp(home: UserProfileScreen(remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('user-profile-retry')), findsOneWidget);
    expect(find.text('账号资料暂时无法加载'), findsOneWidget);
    expect(find.text('李明远'), findsNothing);
    expect(find.text('138****8888'), findsNothing);
  });

  testWidgets('remote profile renders server fields instead of placeholders',
      (tester) async {
    const profile = UserProfile(
      id: 'u-remote',
      name: '服务端用户',
      phone: '13900112233',
      examYear: '2027',
      avatarColor: '#3A7A46',
    );
    await tester.pumpWidget(ProviderScope(
      overrides: [
        currentUserProvider.overrideWith((ref) async => profile),
      ],
      child: const MaterialApp(home: UserProfileScreen(remoteEnabled: true)),
    ));
    await tester.pump();
    await tester.pumpAndSettle();

    // Normal state mirrors RC: fields are read-only rows. Editing opens a
    // bottom sheet instead of rendering a permanent TextField or save button.
    expect(find.text('服务端用户'), findsAtLeastNWidgets(2));
    expect(find.byType(TextField), findsNothing);
    expect(find.text('保存修改'), findsNothing);
    expect(find.text('2027年法律职业资格考试'), findsNWidgets(2));
    expect(find.text('139****2233'), findsOneWidget);
    expect(find.text('138****8888'), findsNothing);
    expect(find.text('2024年法律职业资格考试'), findsNothing);
  });
}
