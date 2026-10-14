import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/app/app.dart';

void main() {
  testWidgets('首页做题记录快捷入口打开做题记录列表', (tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.pumpAndSettle();

    final shortcut = find.text('做题记录');
    expect(shortcut, findsOneWidget);
    await tester.tap(shortcut);
    await tester.pumpAndSettle();

    expect(find.text('做题记录'), findsOneWidget);
    expect(find.text('民法·物权法'), findsOneWidget);
  });
}
