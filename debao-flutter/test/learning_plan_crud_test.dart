import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/tools/study_tools_screens.dart';

const _planJson = <String, dynamic>{
  'id': 'p1',
  'title': '服务端计划',
  'dailyMinutes': 60,
  'startDate': '2026-09-02',
  'endDate': '2026-09-08',
  'status': 'active',
};

const _taskJson = <String, dynamic>{
  'id': 't1',
  'planId': 'p1',
  'title': '服务端任务',
  'dueDate': '2026-09-02',
  'minutes': 30,
  'status': 'pending',
};

class _LearningTransport implements ApiTransport {
  final calls = <String>[];
  final payloads = <String, Object?>{};
  bool failCompletion = false;
  Completer<void>? completionGate;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/learning/plans') return <dynamic>[_planJson];
    if (path == '/v1/learning/tasks') return <dynamic>[_taskJson];
    return const <dynamic>[];
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    payloads[path] = data;
    if (path == '/v1/learning/plans') {
      return <String, dynamic>{
        ..._planJson,
        'id': 'p-created',
        'title': (data as Map<String, dynamic>)['title'],
        'dailyMinutes': (data)['dailyMinutes'],
        'startDate': (data)['startDate'],
        'endDate': (data)['endDate'],
      };
    }
    if (path == '/v1/learning/tasks/t1/complete') {
      if (failCompletion) {
        throw const ApiError('REQUEST_FAILED', '完成失败');
      }
      final gate = completionGate;
      if (gate != null) await gate.future;
      return <String, dynamic>{..._taskJson, 'status': 'done'};
    }
    return const <String, dynamic>{};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    calls.add('PATCH $path');
    payloads[path] = data;
    final input =
        data is Map<String, dynamic> ? data : const <String, dynamic>{};
    final id = path.split('/').last;
    return <String, dynamic>{
      ..._planJson,
      'id': id,
      'title': input['title'] ?? _planJson['title'],
      'dailyMinutes': input['dailyMinutes'] ?? _planJson['dailyMinutes'],
      'startDate': input['startDate'] ?? _planJson['startDate'],
      'endDate': input['endDate'] ?? _planJson['endDate'],
      'status': input['status'] ?? _planJson['status'],
    };
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    payloads[path] = data;
    return const <String, dynamic>{'deleted': true};
  }
}

Future<void> _pumpRemotePlan(
  WidgetTester tester,
  _LearningTransport transport, {
  List<LearningPlan>? plans,
  List<LearningTask>? tasks,
}) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        learningPlansProvider.overrideWith(
          (ref) async => plans ?? [LearningPlan.fromJson(_planJson)],
        ),
        learningTasksProvider.overrideWith(
          (ref) async => tasks ?? [LearningTask.fromJson(_taskJson)],
        ),
        courseRepositoryProvider.overrideWithValue(CourseRepository(transport)),
      ],
      child: const MaterialApp(home: LearningPlanScreen(remoteEnabled: true)),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  test('learning plan repository validates payloads before transport',
      () async {
    final transport = _LearningTransport();
    final repository = CourseRepository(transport);

    await repository.createPlan(
      title: '  新计划  ',
      dailyMinutes: 90,
      startDate: '2026-09-02',
      endDate: '2026-09-08',
    );
    expect(transport.payloads['/v1/learning/plans'], {
      'title': '新计划',
      'dailyMinutes': 90,
      'startDate': '2026-09-02',
      'endDate': '2026-09-08',
    });

    await expectLater(
      repository.createPlan(title: ' ', dailyMinutes: 60),
      throwsA(isA<ApiError>()),
    );
    await expectLater(
      repository.updatePlan('p1'),
      throwsA(isA<ApiError>()),
    );
    await expectLater(
      repository.updatePlan('p1', status: 'unknown'),
      throwsA(isA<ApiError>()),
    );
    await expectLater(
      repository.deletePlan(' '),
      throwsA(isA<ApiError>()),
    );
    expect(transport.calls.where((call) => call == 'POST /v1/learning/plans'),
        hasLength(1));
  });

  testWidgets('远程任务快速重复点击只提交一次并保持完成状态', (tester) async {
    final transport = _LearningTransport()..completionGate = Completer<void>();
    await _pumpRemotePlan(tester, transport);

    final taskText = find.text('服务端任务');
    await tester.tap(taskText);
    await tester.pump();
    await tester.tap(taskText);
    await tester.pump();

    expect(
      transport.calls
          .where((call) => call == 'POST /v1/learning/tasks/t1/complete'),
      hasLength(1),
    );
    expect(find.byKey(const ValueKey('learning-plan-task-busy-服务端任务')),
        findsOneWidget);

    transport.completionGate!.complete();
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('learning-plan-task-status-服务端任务')),
        findsOneWidget);
    expect(find.text('1 / 1'), findsOneWidget);
  });

  testWidgets('远程任务失败后显示错误并允许再次提交', (tester) async {
    final transport = _LearningTransport()..failCompletion = true;
    await _pumpRemotePlan(tester, transport);

    await tester.tap(find.text('服务端任务'));
    await tester.pumpAndSettle();
    expect(find.text('完成失败'), findsOneWidget);

    transport.failCompletion = false;
    await tester.tap(find.text('服务端任务'));
    await tester.pumpAndSettle();
    expect(
      transport.calls
          .where((call) => call == 'POST /v1/learning/tasks/t1/complete'),
      hasLength(2),
    );
  });

  testWidgets('有计划但无任务仍显示创建计划入口', (tester) async {
    final transport = _LearningTransport();
    await _pumpRemotePlan(
      tester,
      transport,
      tasks: const <LearningTask>[],
    );
    expect(find.byKey(const ValueKey('learning-plan-no-task-add')),
        findsOneWidget);
    expect(find.byKey(const ValueKey('learning-plan-add')), findsOneWidget);
  });

  testWidgets('远程学习计划创建、编辑、状态更新和删除走对应接口', (tester) async {
    final transport = _LearningTransport();
    await _pumpRemotePlan(tester, transport);

    await tester.tap(find.byKey(const ValueKey('learning-plan-add')));
    await tester.pumpAndSettle();
    await tester.enterText(
        find.byKey(const ValueKey('learning-plan-title-input')), '新建计划');
    await tester.tap(find.byKey(const ValueKey('learning-plan-save')));
    await tester.pumpAndSettle();
    expect(transport.calls, contains('POST /v1/learning/plans'));
    expect(
        (transport.payloads['/v1/learning/plans']
            as Map<String, dynamic>)['title'],
        '新建计划');

    await tester.tap(find.byKey(const ValueKey('learning-plan-actions')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('编辑计划'));
    await tester.pumpAndSettle();
    await tester.enterText(
        find.byKey(const ValueKey('learning-plan-title-input')), '更新计划');
    await tester.tap(find.byKey(const ValueKey('learning-plan-save')));
    await tester.pumpAndSettle();
    expect(transport.calls, contains('PATCH /v1/learning/plans/p-created'));
    expect(
        (transport.payloads['/v1/learning/plans/p-created']
            as Map<String, dynamic>)['title'],
        '更新计划');

    await tester.tap(find.byKey(const ValueKey('learning-plan-actions')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('标记为已完成'));
    await tester.pumpAndSettle();
    expect(transport.calls, contains('PATCH /v1/learning/plans/p-created'));
    expect(
        (transport.payloads['/v1/learning/plans/p-created']
            as Map<String, dynamic>)['status'],
        'completed');

    await tester.tap(find.byKey(const ValueKey('learning-plan-actions')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('删除计划'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, '删除'));
    await tester.pumpAndSettle();
    expect(transport.calls, contains('DELETE /v1/learning/plans/p-created'));
  });
}
