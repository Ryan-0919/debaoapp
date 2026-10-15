import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/features/questions/objective_answer_screen.dart';

void main() {
  testWidgets('底部安全区不会挤压上一题下一题，支持来回切换', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    tester.view.padding = const FakeViewPadding(bottom: 34);
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.view.resetPadding();
    });
    final session = ObjectiveSession.fromJson({
      'id': 'nav-session',
      'title': '导航测试',
      'mode': 'chapter',
      'status': 'in_progress',
      'durationSeconds': 600,
      'expiresAt': '2099-01-01T00:00:00Z',
      'questionIds': ['q1', 'q2'],
      'questions': [
        {
          'id': 'q1',
          'stem': '第一题完整题干',
          'options': ['甲选项', '乙选项']
        },
        {
          'id': 'q2',
          'stem': '第二题完整题干',
          'options': ['丙选项', '丁选项']
        },
      ],
    });
    const request = ObjectiveSessionRequest(
        mode: 'chapter',
        title: '导航测试',
        sessionId: 'nav-session',
        idempotencyKey: 'nav-key');
    await tester.pumpWidget(ProviderScope(
      overrides: [
        objectiveSessionProvider(request).overrideWith((ref) async => session),
      ],
      child: const MaterialApp(
          home: ObjectiveAnswerScreen(
              title: '导航测试',
              remoteEnabled: true,
              sessionId: 'nav-session',
              idempotencyKey: 'nav-key')),
    ));
    await tester.pumpAndSettle();
    expect(find.text('第一题完整题干'), findsOneWidget);
    final next = find.byKey(const ValueKey('objective-next'));
    final previous = find.byKey(const ValueKey('objective-previous'));
    expect(tester.getSize(next).height, greaterThanOrEqualTo(44));
    expect(tester.widget<OutlinedButton>(previous).onPressed, isNull);
    await tester.tap(next);
    await tester.pump();
    expect(find.text('第二题完整题干'), findsOneWidget);
    expect(find.text('交卷'), findsOneWidget);
    await tester.tap(previous);
    await tester.pump();
    expect(find.text('第一题完整题干'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
