import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/account/account_service_screens.dart';
import 'package:debao_flutter/features/tools/study_tools_screens.dart';

class _FakeTransport implements ApiTransport {
  final posts = <String>[];

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async => null;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      null;

  @override
  Future<dynamic> patchData(String path, {Object? data}) async => null;

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    posts.add(path);
    if (path == '/v1/learning/tasks/t1/complete') {
      return <String, dynamic>{
        'id': 't1',
        'planId': 'p1',
        'title': '服务端任务',
        'dueDate': '2026-09-02',
        'minutes': 30,
        'status': 'done',
      };
    }
    return null;
  }
}

void main() {
  testWidgets('本地做题记录行可进入答题报告', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: QuestionRecordsScreen(),
    ));

    final row = find.byKey(const ValueKey('local-record-民法·物权法'));
    await tester.tap(row);
    await tester.pumpAndSettle();

    expect(find.text('答题报告'), findsOneWidget);
  });

  testWidgets('本地收藏行可进入继续练习', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: FavoritesScreen(),
    ));

    final row = find.byKey(const ValueKey('local-favorite-善意取得——《民法典》第311条'));
    await tester.tap(row);
    await tester.pumpAndSettle();

    expect(find.text('收藏题目'), findsOneWidget);
    expect(find.text('1 / 4'), findsOneWidget);
  });

  testWidgets('远程通知点击后调用已读接口并隐藏未读标记', (tester) async {
    final transport = _FakeTransport();
    await tester.pumpWidget(ProviderScope(
      overrides: [
        notificationsProvider.overrideWith((ref) async => const [
              NotificationItem(
                id: 'n1',
                title: '学习提醒',
                body: '完成今日计划',
                createdAt: '刚刚',
              ),
            ]),
        communityRepositoryProvider
            .overrideWithValue(CommunityRepository(transport)),
      ],
      child: const MaterialApp(
        home: NotificationsScreen(remoteEnabled: true),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('notification-n1')), findsOneWidget);
    expect(find.byType(CircleAvatar), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('notification-n1')));
    await tester.pumpAndSettle();

    expect(transport.posts, contains('/v1/notifications/n1/read'));
    expect(find.byType(CircleAvatar), findsNothing);
  });

  testWidgets('远程学习计划任务完成调用服务端接口', (tester) async {
    final transport = _FakeTransport();
    await tester.pumpWidget(ProviderScope(
      overrides: [
        learningPlansProvider.overrideWith((ref) async => const [
              LearningPlan(
                id: 'p1',
                title: '服务端计划',
                dailyMinutes: 60,
                startDate: '2026-09-02',
                endDate: '2026-09-08',
                status: 'active',
              ),
            ]),
        learningTasksProvider.overrideWith((ref) async => const [
              LearningTask(
                id: 't1',
                planId: 'p1',
                title: '服务端任务',
                dueDate: '2026-09-02',
                minutes: 30,
                status: 'pending',
              ),
            ]),
        courseRepositoryProvider.overrideWithValue(CourseRepository(transport)),
      ],
      child: const MaterialApp(
        home: LearningPlanScreen(remoteEnabled: true),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.text('服务端计划（2026-09-02–2026-09-08）'), findsOneWidget);
    await tester
        .tap(find.byKey(const ValueKey('learning-plan-task-status-服务端任务')));
    await tester.pumpAndSettle();
    expect(transport.posts, contains('/v1/learning/tasks/t1/complete'));
  });
}
