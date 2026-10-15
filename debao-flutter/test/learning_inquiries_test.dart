import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/questions/objective_answer_screen.dart';
import 'package:debao_flutter/features/learning/learning_inquiries_screen.dart';

class _InquiryTransport implements ApiTransport {
  final items = <Map<String, dynamic>>[];
  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      items;
  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    expect(path, '/v1/learning/inquiries');
    final body = data as Map<String, dynamic>;
    expect(body['reportId'], 'report-1');
    expect(body['questionId'], 'q1');
    final item = <String, dynamic>{
      ...body,
      'id': 'inquiry-1',
      'status': 'pending',
      'createdAt': '2026-10-14',
      'question': {
        'questionId': 'q1',
        'stem': '完整题干',
        'options': ['甲', '乙'],
        'analysis': '服务端完整解析'
      },
    };
    items.add(item);
    return item;
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async => {};
  @override
  Future<dynamic> deleteData(String path, {Object? data}) async => {};
}

void main() {
  testWidgets('逐题解析可以打开，未上传不显示微课，提交错因并查看真实返回的回复', (tester) async {
    final transport = _InquiryTransport();
    final report = ObjectiveReport.fromJson({
      'id': 'report-1',
      'sessionId': 's1',
      'title': '配套练习',
      'total': 1,
      'answered': 1,
      'correct': 0,
      'results': [
        {
          'questionId': 'q1',
          'stem': '完整题干',
          'options': ['甲', '乙'],
          'version': 1,
          'answers': ['0'],
          'correctAnswers': ['1'],
          'correct': false,
          'analysis': '服务端完整解析'
        },
      ],
    });
    await tester.pumpWidget(ProviderScope(
        overrides: [
          questionRepositoryProvider
              .overrideWithValue(QuestionRepository(transport)),
        ],
        child: MaterialApp(
            home: ObjectiveReportScreen(answers: const [], report: report))));
    await tester.pumpAndSettle();
    await tester.drag(find.byType(ListView), const Offset(0, -350));
    await tester.pumpAndSettle();
    await tester.tap(find.text('完整题干'));
    await tester.pumpAndSettle();
    expect(find.text('题目解析'), findsOneWidget);
    expect(find.text('服务端完整解析'), findsOneWidget);
    expect(find.byKey(const ValueKey('question-micro-lesson')), findsNothing);
    await tester.enterText(
        find.byKey(const ValueKey('inquiry-reason')), '我把成立与生效混淆了');
    await tester.ensureVisible(find.text('提交错因'));
    await tester.tap(find.text('提交错因'));
    await tester.pumpAndSettle();
    expect(transport.items.single['reason'], '我把成立与生效混淆了');
    expect(find.text('已提交，老师回复后可在“我的答疑”中查看。'), findsOneWidget);
    transport.items[0].addAll({
      'status': 'answered',
      'teacherName': '李老师',
      'reply': '应分别审查成立要件和生效要件。'
    });
    await tester.ensureVisible(find.text('查看我的答疑'));
    await tester.tap(find.text('查看我的答疑'));
    await tester.pumpAndSettle();
    expect(find.text('李老师的回复'), findsOneWidget);
    expect(find.text('应分别审查成立要件和生效要件。'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('上传的语音微课提供播放入口', (tester) async {
    await tester.pumpWidget(const MaterialApp(
        home: Scaffold(
            body: QuestionMicroLesson(
                type: 'audio',
                reference: '/v1/learning-question-media/real.mp3'))));
    expect(find.text('播放语音微课'), findsOneWidget);
  });
}
