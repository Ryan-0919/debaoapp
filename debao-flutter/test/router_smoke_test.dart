import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/app/app.dart';
import 'package:debao_flutter/shared/route_back_button.dart';

void main() {
  final cases = <String>[
    '/login',
    '/',
    '/questions/subjective?subject=%E6%B0%91%E6%B3%95',
    '/questions/subjective/answer?subject=%E6%B0%91%E6%B3%95&paperTitle=%E4%B8%BB%E8%A7%82%E9%A2%98',
    '/questions/subjective/answer?subjectName=%E6%B0%91%E6%B3%95&questionIndex=2&gradingPaperId=paper-1&gradingQuestionId=question-1',
    '/questions/subjective/success?submissionId=sub-1',
    '/questions/objective?title=%E6%B0%91%E6%B3%95%E6%80%BB%E5%88%99',
    '/questions/objective/report?answers=0,1,2',
    '/commerce/product/p1',
    '/commerce/purchase/success?productName=%E6%B0%91%E6%B3%95%E8%AF%BE%E7%A8%8B&productId=p3&orderId=order-1',
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

  testWidgets('all registered deep links resolve to a page', (tester) async {
    for (final location in cases) {
      final router = createAppRouter();
      addTearDown(router.dispose);
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      router.go(location);
      // A single frame is enough to build the route while avoiding waits for
      // page-specific timers or remote providers.
      await tester.pump(const Duration(milliseconds: 100));
      expect(router.routerDelegate.currentConfiguration.uri.toString(),
          startsWith(location.split('?').first),
          reason: location);
      expect(find.text('Page not found'), findsNothing, reason: location);
    }
  });

  testWidgets('standalone deep links expose a working back affordance',
      (tester) async {
    final router = createAppRouter();
    addTearDown(router.dispose);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));

    // A browser refresh/deep link starts with an empty navigation stack. The
    // explicit button must still be visible and provide a safe home fallback.
    router.go('/courses/c1');
    await tester.pumpAndSettle();
    expect(find.byType(BackButton), findsOneWidget);
    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(router.routerDelegate.currentConfiguration.uri.path, '/');

    // When entered through the app router, normal pop semantics are retained.
    router.push('/courses/c1');
    await tester.pumpAndSettle();
    expect(find.byType(BackButton), findsOneWidget);
    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(router.routerDelegate.currentConfiguration.uri.path, '/');

    // Media pages use an overlay back affordance instead of an AppBar.
    router.go('/courses/c1/video?lessonId=l1');
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('video-back')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('video-back')));
    await tester.pumpAndSettle();
    expect(router.routerDelegate.currentConfiguration.uri.path, '/');

    // The shell itself remains a root surface and must not gain a back arrow.
    expect(find.byType(DebaoRouteBackButton), findsNothing);
  });

  testWidgets('parameterized product and forum deep links resolve local fixtures',
      (tester) async {
    final router = createAppRouter();
    addTearDown(router.dispose);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));

    router.go('/commerce/product/p1');
    await tester.pumpAndSettle();
    expect(find.text('2024法考全程班（主客一体·视频精讲）'), findsOneWidget);

    router.go('/community/forum/f1');
    await tester.pumpAndSettle();
    expect(find.text('三战上岸经验分享：客观题从108到213的蜕变之路'), findsOneWidget);
  });
}
