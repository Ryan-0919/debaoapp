import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/learning/learning_center_screens.dart';

class _Transport implements ApiTransport {
  final calls = <String>[];
  Object? diagnosticResponse;
  Object? submitResponse;
  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/learning/diagnostic') return diagnosticResponse;
    if (path == '/v1/learning/tasks') return <dynamic>[];
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    if (path == '/v1/learning/diagnostic/submit') return submitResponse;
    return <String, dynamic>{'id': 't1', 'status': 'done'};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      <String, dynamic>{};
  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      <String, dynamic>{};
}

const _question = <String, dynamic>{
  'id': 'q1',
  'stem': '你每天能稳定学习多久？',
  'type': 'single',
  'required': true,
  'options': [
    {'id': 'o1', 'label': '两小时'}
  ],
};

void main() {
  test('diagnostic models retain dynamic form questions and scores', () {
    final state = LearningDiagnosticState.fromJson({
      'access': 'granted',
      'productId': 'deen-private-coach',
      'completed': true,
      'dimensions': [
        {'code': 'time', 'label': '时间投入'}
      ],
      'result': {
        'attemptId': 'a1',
        'scores': {'time': 80},
        'submittedAt': '2026-10-09T00:00:00Z'
      },
      'questions': [_question],
    });
    expect(state.questions.single.options.single.label, '两小时');
    expect(state.result!.scores['time'], 80);
  });

  testWidgets(
      'required diagnostic question blocks before selection and submits after selection',
      (tester) async {
    final transport = _Transport()
      ..submitResponse = <String, dynamic>{
        'attemptId': 'a1',
        'scores': {'time': 80},
        'submittedAt': '2026-10-09T00:00:00Z'
      };
    final state = LearningDiagnosticState.fromJson({
      'access': 'granted',
      'productId': 'p',
      'completed': false,
      'form': {'title': '首次诊断'},
      'questions': [_question]
    });
    await tester.pumpWidget(ProviderScope(
      overrides: [
        courseRepositoryProvider.overrideWithValue(CourseRepository(transport))
      ],
      child: MaterialApp(home: LearningDiagnosticScreen(state: state)),
    ));
    await tester.pumpAndSettle();
    await tester.tap(find.text('提交诊断'));
    await tester.pump();
    expect(find.text('请先完成本题'), findsOneWidget);
    await tester.tap(find.text('两小时'));
    await tester.tap(find.text('提交诊断'));
    await tester.pumpAndSettle();
    expect(transport.calls, contains('POST /v1/learning/diagnostic/submit'));
    expect(find.text('你的初始学习画像已生成'), findsOneWidget);
  });

  testWidgets('locked access shows purchase gate and does not render questions',
      (tester) async {
    final state = LearningDiagnosticState.fromJson({
      'access': 'locked',
      'productId': 'p',
      'completed': false,
      'questions': [_question]
    });
    await tester.pumpWidget(ProviderScope(
      overrides: [
        learningDiagnosticProvider.overrideWith((ref) async => state),
        learningTasksProvider
            .overrideWith((ref) async => const <LearningTask>[]),
      ],
      child: const MaterialApp(home: LearningCenterScreen(remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();
    expect(find.text('尚未开通学习中心'), findsOneWidget);
    expect(find.text('你每天能稳定学习多久？'), findsNothing);
  });
}
