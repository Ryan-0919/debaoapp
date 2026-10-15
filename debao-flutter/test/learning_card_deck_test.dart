import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/learning/learning_card_deck.dart';
import 'package:debao_flutter/features/learning/learning_task_screen.dart';

const task = <String, dynamic>{
  'id': 'deck-task',
  'planId': 'plan',
  'title': '卡片任务',
  'dueDate': '2026-10-12',
  'minutes': 15,
  'status': 'todo',
  'contentType': 'card',
  'contentId': 'deck'
};

class Transport implements ApiTransport {
  bool fail = true;
  int writes = 0;
  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    if (path == '/v1/learning/tasks') return [task];
    if (path == '/v1/learning/cards/deck')
      return {
        'id': 'deck',
        'title': '后台配置的卡片',
        'assets': [
          {'type': 'text', 'reference': '内容一'},
          {'type': 'text', 'reference': '内容二'},
        ]
      };
    return {};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    expect(path, '/v1/learning/tasks/deck-task/complete');
    writes++;
    if (fail) throw const ApiError('OFFLINE', '网络中断，请重试');
    return {...task, 'status': 'done'};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async => {};
  @override
  Future<dynamic> deleteData(String path, {Object? data}) async => {};
}

void main() {
  testWidgets('卡片使用上下翻页，阅读时可手动放大缩小和还原', (tester) async {
    await tester.pumpWidget(MaterialApp(
        home: Scaffold(
            body: LearningCardDeck(
      card: const LearningCard(
          id: 'zoom',
          title: '缩放测试',
          contentType: 'text',
          assets: [(type: 'text', reference: '需要阅读的实际内容', filename: '正文')]),
      onComplete: () {},
    ))));
    expect(tester.widget<PageView>(find.byType(PageView)).scrollDirection,
        Axis.vertical);
    await tester.tap(find.text('放大阅读'));
    await tester.pumpAndSettle();
    final viewer =
        tester.widget<InteractiveViewer>(find.byType(InteractiveViewer));
    expect(viewer.transformationController!.value.getMaxScaleOnAxis(), 1);
    await tester.tap(find.byKey(const ValueKey('card-zoom-in')));
    await tester.pump();
    expect(viewer.transformationController!.value.getMaxScaleOnAxis(),
        greaterThan(1));
    await tester.tap(find.byKey(const ValueKey('card-zoom-out')));
    await tester.pump();
    expect(viewer.transformationController!.value.getMaxScaleOnAxis(),
        closeTo(1, .001));
    await tester.tap(find.text('还原'));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
  testWidgets('一张素材多个挖空：先背诵、逐项核对、最后才提交', (tester) async {
    var writes = 0;
    Map<int, String> ratings = {};
    await tester.pumpWidget(MaterialApp(
        home: Scaffold(
            body: LearningCardDeck(
      card: const LearningCard(
          id: 'cloze',
          title: '回忆测试',
          contentType: 'image_gallery',
          assets: [
            (type: 'text', reference: '完整内容', filename: '正文')
          ],
          recallItems: [
            (prompt: '第一____', answer: '答案甲'),
            (prompt: '第二____', answer: '答案乙')
          ]),
      onComplete: () => writes++,
      onRatingsChanged: (value) => ratings = value,
    ))));
    await tester.tap(find.text('本张已背诵'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('开始主动回忆'));
    await tester.pumpAndSettle();
    expect(find.text('答案：答案甲'), findsNothing);
    await tester.tap(find.text('查看答案'));
    await tester.pumpAndSettle();
    expect(find.text('答案：答案甲'), findsOneWidget);
    expect(
        tester
            .widget<FilledButton>(
                find.byKey(const ValueKey('courses-card-complete')))
            .onPressed,
        isNull);
    await tester.tap(find.text('不熟悉').last);
    await tester.pumpAndSettle();
    expect(find.text('第 1 / 2 张'), findsOneWidget);
    expect(writes, 0);
    await tester.tap(find.text('核对完成，下一张'));
    await tester.pumpAndSettle();
    expect(find.text('第 2 / 2 张'), findsOneWidget);
    await tester.tap(find.text('查看答案'));
    await tester.pumpAndSettle();
    expect(find.text('答案：答案乙'), findsOneWidget);
    await tester.tap(find.text('记住了').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('核对完成，下一张'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('完成背诵并解锁题目'));
    await tester.pumpAndSettle();
    expect(writes, 0);
    await tester.tap(find.text('完成背诵并解锁题目'));
    await tester.pumpAndSettle();
    expect(writes, 1);
    expect(ratings, {0: 'uncertain', 1: 'remembered'});
    expect(tester.takeException(), isNull);
  });
  testWidgets('滑到末张不能跳过前面的背诵，失败重试保留进度并调用后端完成', (tester) async {
    final transport = Transport();
    await tester.pumpWidget(ProviderScope(
        overrides: [
          courseRepositoryProvider
              .overrideWithValue(CourseRepository(transport)),
        ],
        child: MaterialApp(
            home: LearningTaskScreen(task: LearningTask.fromJson(task)))));
    await tester.pumpAndSettle();
    expect(find.text('后台配置的卡片'), findsWidgets);
    await tester.drag(find.byType(PageView), const Offset(0, -600));
    await tester.pumpAndSettle();
    expect(find.text('第 2 / 2 张'), findsOneWidget);
    await tester.tap(find.text('本张已背诵'));
    await tester.pumpAndSettle();
    expect(find.text('第 1 / 2 张'), findsOneWidget);
    expect(transport.writes, 0);
    expect(find.text('完成背诵并解锁题目'), findsNothing);
    await tester.tap(find.text('本张已背诵'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('完成背诵并解锁题目'));
    await tester.pumpAndSettle();
    expect(find.text('网络中断，请重试'), findsOneWidget);
    expect(find.text('已背诵 2 张'), findsOneWidget);
    transport.fail = false;
    await tester.tap(find.text('完成背诵并解锁题目'));
    await tester.pumpAndSettle();
    expect(transport.writes, 2);
    expect(find.text('已完成学习任务'), findsOneWidget);
  });

  testWidgets('空素材不能完成；HTML 未阅读不能标记背诵', (tester) async {
    var completed = false;
    await tester.pumpWidget(MaterialApp(
        home: Scaffold(
            body: LearningCardDeck(
                card: const LearningCard(
                    id: 'empty',
                    title: '空卡片',
                    contentType: 'image_gallery',
                    assets: []),
                onComplete: () => completed = true))));
    expect(find.text('暂未配置卡片，请联系老师'), findsOneWidget);
    await tester.pumpWidget(MaterialApp(
        home: Scaffold(
            body: LearningCardDeck(
                key: const ValueKey('html'),
                card: const LearningCard(
                    id: 'html',
                    title: 'HTML 卡片',
                    contentType: 'html',
                    assets: [
                      (
                        type: 'html',
                        reference: '/v1/learning-card-assets/test.html',
                        filename: '讲义'
                      )
                    ]),
                onComplete: () => completed = true))));
    expect(
        tester
            .widget<FilledButton>(
                find.byKey(const ValueKey('courses-card-complete')))
            .onPressed,
        isNull);
    expect(completed, false);
  });
}
