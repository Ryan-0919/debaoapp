import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/features/tools/study_tools_screens.dart';

void main() {
  testWidgets('历史做题记录优先使用服务端快照，不依赖已下线的当前题目', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          questionRecordReportProvider('submission-1').overrideWith(
            (ref) async => <String, dynamic>{
              'id': 'submission-1',
              'questionId': 'archived-question',
              'answers': ['1'],
              'correctAnswers': ['2'],
              'correct': false,
              'stem': '存档题目原题干仍应显示',
              'options': ['甲选项', '乙选项', '丙选项'],
              'analysis': '这是存档解析内容',
            },
          ),
          questionProvider('archived-question').overrideWith(
            (ref) async => throw StateError('题目已下线'),
          ),
        ],
        child: const MaterialApp(
          home: QuestionRecordDetailScreen(
            recordId: 'submission-1',
            questionId: 'archived-question',
            title: '旧记录',
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('存档题目原题干仍应显示'), findsOneWidget);
    expect(find.text('你的答案: '), findsOneWidget);
    expect(find.text('正确答案: '), findsOneWidget);
    expect(find.text('B'), findsOneWidget);
    expect(find.text('C'), findsOneWidget);
    expect(find.text('解析：这是存档解析内容'), findsOneWidget);
    expect(find.text('旧记录'), findsOneWidget);
  });
}
