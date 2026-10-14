import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/account/account_service_screens.dart';

class _FakeTransport implements ApiTransport {
  _FakeTransport(this.handler);

  final Future<dynamic> Function(String path, Object? data) handler;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      throw UnimplementedError();

  @override
  Future<dynamic> postData(String path, {Object? data}) => handler(path, data);

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      throw UnimplementedError();

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      throw UnimplementedError();
}

Future<void> _settleLocalReply(WidgetTester tester) async {
  await tester.pump(const Duration(milliseconds: 1000));
  await tester.pump();
}

void main() {
  testWidgets('AI 对话按 RC 快捷问题、思考态、回答态和重置流程运行', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: AIChatScreen()));
    await tester.pump();

    expect(find.text('AI 答疑'), findsOneWidget);
    expect(
        find.byTooltip('本地演示模式：未连接真实 AI Provider、流式输出与内容审核'), findsOneWidget);
    expect(find.text('你好！我是得宝法考AI助手，可以帮你解答法考相关问题。'), findsOneWidget);
    expect(find.text('常见问题快速提问'), findsOneWidget);
    expect(
        find.byKey(const ValueKey('ai-quick-善意取得的三个要件是什么？')), findsOneWidget);
    expect(
        find.byKey(const ValueKey('ai-quick-合同无效与合同被撤销的区别？')), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('ai-quick-善意取得的三个要件是什么？')));
    await tester.pump();
    expect(find.byKey(const ValueKey('ai-thinking')), findsOneWidget);
    expect(find.text('常见问题快速提问'), findsNothing);
    expect(find.text('善意取得的三个要件是什么？'), findsOneWidget);

    await _settleLocalReply(tester);
    expect(find.text('善意取得的三个构成要件（《民法典》第311条）：'), findsOneWidget);
    expect(find.text('口诀：善意 + 合价 + 公示 → 善意取得成立。'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('ai-chat-reset')));
    await tester.pump();
    expect(find.text('常见问题快速提问'), findsOneWidget);
    expect(find.byKey(const ValueKey('ai-message-user-2')), findsNothing);
  });

  testWidgets('AI 输入支持回车、连续对话和通用三步回答', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: AIChatScreen()));
    await tester.pump();

    final input = find.byKey(const ValueKey('ai-chat-input'));
    await tester.enterText(input, '侵权责任怎么分析？');
    await tester.testTextInput.receiveAction(TextInputAction.send);
    await tester.pump();
    expect(find.byKey(const ValueKey('ai-thinking')), findsOneWidget);
    await _settleLocalReply(tester);

    expect(find.text('侵权责任怎么分析？'), findsOneWidget);
    expect(find.text('关于「侵权责任怎么分析？」的分析思路：'), findsOneWidget);
    expect(find.text('第一步：定性'), findsOneWidget);
    expect(find.text('第三步：结合案情得结论'), findsOneWidget);

    // Sending a second question keeps the first user/assistant pair visible.
    await tester.enterText(input, '诉讼时效有什么特点？');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();
    await _settleLocalReply(tester);
    expect(find.text('侵权责任怎么分析？'), findsOneWidget);
    expect(find.text('诉讼时效有什么特点？'), findsOneWidget);
    expect(find.text('诉讼时效 vs 除斥期间对比：'), findsOneWidget);
  });

  testWidgets('AI 远端不可用展示离线边界并支持重试', (tester) async {
    var calls = 0;
    final repository = AiRepository(_FakeTransport((path, data) async {
      expect(path, '/v1/ai/reply');
      calls++;
      if (calls == 1) {
        throw const ApiError('ADAPTER_UNAVAILABLE', 'Provider 未配置');
      }
      return <String, dynamic>{'reply': '**远端回答**：已恢复连接'};
    }));

    await tester.pumpWidget(MaterialApp(
        home: AIChatScreen(remoteEnabled: true, repository: repository)));
    await tester.pump();
    await tester.enterText(find.byKey(const ValueKey('ai-chat-input')), '远端问题');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();
    await tester.pump();

    expect(calls, 1);
    expect(find.byKey(const ValueKey('ai-offline-banner')), findsOneWidget);
    expect(find.text('AI 服务暂不可用，已保留本地草稿；请稍后重试'), findsOneWidget);
    expect(find.byKey(const ValueKey('ai-chat-retry')), findsOneWidget);
    expect(find.textContaining('AI 服务暂时不可用，请稍后重试'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('ai-chat-retry')));
    await tester.pump();
    await tester.pump();
    expect(calls, 2);
    expect(find.byKey(const ValueKey('ai-offline-banner')), findsNothing);
    expect(find.text('远端回答：已恢复连接'), findsOneWidget);
  });
}
