import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/app/app.dart';

/// Covers the first frame of every public deep link at the product's mobile
/// logical viewport. This is intentionally a smoke/layout check, not a
/// golden comparison: RC screenshot parity is tracked separately.
void main() {
  final cases = <String>[
    '/login',
    '/',
    '/questions/subjective?subject=%E6%B0%91%E6%B3%95',
    '/questions/subjective/answer?subject=%E6%B0%91%E6%B3%95',
    '/questions/subjective/success?submissionId=sub-1',
    '/questions/objective?title=%E6%B0%91%E6%B3%95%E6%80%BB%E5%88%99',
    '/questions/objective/report?answers=0,1,2',
    '/commerce/product/p1',
    '/commerce/purchase/success?productName=%E6%B0%91%E6%B3%95%E8%AF%BE%E7%A8%8B',
    '/commerce/purchase/pending?orderId=order-1',
    '/commerce/orders',
    '/commerce/orders/order-1',
    '/courses/c1',
    '/courses/c1/video?lessonId=l1',
    '/courses/c1/audio?lessonId=l1',
    '/courses/c3/live',
    '/tools/learning-report',
    '/tools/learning-plan',
    '/tools/mistakes',
    '/tools/favorites',
    '/tools/law',
    '/tools/question-records',
    '/tools/question-records/record-1?questionId=q1',
    '/community/forum',
    '/community/forum/compose',
    '/community/forum/post-1?title=%E5%B8%96%E5%AD%90',
    '/account/ai',
    '/account/profile',
    '/account/settings',
    '/account/security',
    '/account/legal/privacy',
    '/account/notifications',
    '/grading',
    '/grading/paper/paper-1',
    '/grading/success?submissionId=sub-1',
    '/grading/report/sub-1',
  ];

  testWidgets('all deep links render a first frame at 390x844', (tester) async {
    tester.view
      ..physicalSize = const Size(390, 844)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    for (final location in cases) {
      final router = createAppRouter();
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      router.go(location);
      await tester.pump(const Duration(milliseconds: 250));
      expect(tester.takeException(), isNull, reason: location);
      expect(find.byType(ErrorWidget), findsNothing, reason: location);
      router.dispose();
    }
  });
}
