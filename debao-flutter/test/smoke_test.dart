import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/app/app.dart';

void main() {
  testWidgets('首页展示主客观题切换和底部导航', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    expect(find.text('得宝法考'), findsOneWidget);
    expect(find.text('客观题'), findsOneWidget);
    expect(find.text('主观题'), findsOneWidget);
    expect(find.text('题库'), findsOneWidget);
  });
}
