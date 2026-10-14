import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/app/app.dart';
import 'package:debao_flutter/features/questions/subjective_screens.dart';

void main() {
  testWidgets(
      'remote objective report deep link requires a server session instead of fixture score',
      (tester) async {
    final router = createAppRouter(remoteEnabled: true);
    addTearDown(router.dispose);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));

    router.go('/questions/objective/report?answers=0,1,2');
    await tester.pumpAndSettle();

    expect(find.text('答题会话编号缺失'), findsOneWidget);
    expect(find.text('本次得分'), findsNothing);
  });

  testWidgets('subjective answer law search keeps context and returns to draft',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: SubjectiveAnswerScreen(
        subject: '民法',
        paperTitle: '民法案例分析',
      ),
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('查询法条'));
    await tester.pumpAndSettle();

    expect(
        find.byKey(const ValueKey('law-return-to-subjective')), findsOneWidget);
    expect(find.byKey(const ValueKey('law-answer-context')), findsOneWidget);
    expect(find.text('正在作答：民法主观题，查询后可返回继续作答'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('law-return-to-subjective')));
    await tester.pumpAndSettle();
    expect(find.byTooltip('查询法条'), findsOneWidget);
  });

  testWidgets('grading success route carries paper id and exposes RN links',
      (tester) async {
    final router = createAppRouter();
    addTearDown(router.dispose);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));

    router.go(
        '/grading/success?submissionId=sub-1&paperId=paper-1&questionTitle=%E6%B0%91%E6%B3%95%E6%A1%88%E4%BE%8B');
    await tester.pumpAndSettle();

    expect(
        find.byKey(const ValueKey('grading-success-records')), findsOneWidget);
    expect(find.byKey(const ValueKey('grading-success-paper')), findsOneWidget);
    expect(
        find.byKey(const ValueKey('grading-success-report')), findsOneWidget);
    expect(find.byKey(const ValueKey('grading-success-home')), findsOneWidget);

    await tester.tap(
        find.byKey(const ValueKey('grading-success-question-bank')));
    await tester.pumpAndSettle();
    expect(router.routerDelegate.currentConfiguration.uri.path, '/');
    expect(
        router.routerDelegate.currentConfiguration.uri.queryParameters['tab'],
        'questions');
  });
}
