import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

import 'package:debao_flutter/app/app.dart';
import 'package:debao_flutter/features/tools/study_tools_screens.dart';
import 'package:debao_flutter/features/account/account_service_screens.dart';
import 'package:debao_flutter/features/commerce/commerce_detail_screens.dart';
import 'package:debao_flutter/features/community/forum_screens.dart';
import 'package:debao_flutter/features/auth/login_screen.dart';
import 'package:debao_flutter/features/courses/courses_screen.dart';
import 'package:debao_flutter/features/commerce/mall_screen.dart';

void main() {
  testWidgets('首页可以切换到题库', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.tap(find.text('题库').last);
    await tester.pumpAndSettle();
    expect(find.text('按科目练习'), findsOneWidget);
    expect(find.text('民法'), findsOneWidget);
  });

  testWidgets('学习中心只展示学习日历', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: CoursesScreen()));
    expect(find.text('学习日历'), findsOneWidget);
    expect(find.text('全部课程'), findsNothing);
    expect(find.text('2026 法考主客一体系统班'), findsOneWidget);
    expect(find.text('今日学习'), findsOneWidget);
  });

  testWidgets('课程先打卡，后续卡片和练习按顺序解锁', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: CoursesScreen()));
    expect(find.text('听课打卡'), findsAtLeastNWidgets(2));
    await tester.drag(find.byKey(const ValueKey('courses-calendar-scroll')),
        const Offset(0, -500));
    await tester.pumpAndSettle();
    expect(
        find.byKey(const ValueKey('course-session-s8-card')), findsOneWidget);
    expect(find.text('待解锁'), findsAtLeastNWidgets(4));

    await tester.tap(find.byKey(const ValueKey('courses-action-s5')));
    await tester.pumpAndSettle();

    expect(
        find.byKey(const ValueKey('courses-checkin-dialog')), findsOneWidget);
    expect(find.text('听课打卡成功，卡片和后续练习已解锁'), findsNothing);
    await tester.tap(find.byKey(const ValueKey('courses-checkin-confirm')));
    await tester.pumpAndSettle();

    expect(find.text('听课打卡成功，卡片和后续练习已解锁'), findsOneWidget);
    expect(find.text('待解锁'), findsNWidgets(2));
    expect(find.text('已打卡'), findsOneWidget);
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('courses-action-s8-card')));
    await tester.pumpAndSettle();
    expect(
        find.byKey(const ValueKey('courses-card-study-page')), findsOneWidget);
    expect(find.text('卡片学习'), findsOneWidget);
    expect(find.text('后续题目已解锁'), findsNothing);
    expect(find.text('第 1 / 2 张'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    expect(find.text('第 2 / 2 张'), findsOneWidget);
    await tester.drag(
        find.byKey(const ValueKey('card-deck-pages')), const Offset(0, 500));
    await tester.pumpAndSettle();
    expect(find.text('第 1 / 2 张'), findsOneWidget);
    await tester.tap(find.byTooltip('下一张'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    expect(find.text('开始主动回忆'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    expect(find.text('主动回忆 · 挖空'), findsAtLeastNWidgets(1));
    await tester.tap(find.text('查看答案'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('记住了').last);
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('查看答案'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('没记住').last);
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    expect(find.text('完成背诵并解锁题目'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('courses-card-complete')).last);
    await tester.pumpAndSettle();

    expect(find.text('待解锁'), findsNothing);
    expect(find.text('已完成'), findsAtLeastNWidgets(1));
  });

  testWidgets('商城首屏使用商品封面和双层筛选', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: MallScreen()));
    expect(find.text('搜索课程、书籍…'), findsOneWidget);
    expect(find.text('主客一体'), findsAtLeastNWidgets(2));
    expect(find.text('视频课程'), findsAtLeastNWidgets(2));
    expect(find.byType(Image), findsAtLeastNWidgets(3));
  });

  testWidgets('题库可以进入客观题作答页', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.tap(find.text('题库').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('继续练习'));
    await tester.pumpAndSettle();
    expect(find.text('今日练习'), findsOneWidget);
    expect(find.text('分期付款买卖与法定解除权'), findsOneWidget);
    expect(find.text('下一题'), findsOneWidget);
  });

  testWidgets('主观题套卷可以进入完整法条检索页', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.tap(find.text('题库').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('主观题').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('民法'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('甲公司股权转让与债权人保护'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('查询法条'));
    await tester.pumpAndSettle();
    expect(find.text('法条检索'), findsOneWidget);
    expect(find.text('学习论坛'), findsNothing);
    expect(find.text('搜索法条、关键词、条文编号…'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byTooltip('查询法条'), findsOneWidget);
  });

  testWidgets('我的页面可以进入学习计划', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.tap(find.text('我的').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('学习计划'));
    await tester.pumpAndSettle();
    expect(find.text('本周完成进度'), findsOneWidget);
    expect(find.text('本周计划（8月26日–9月1日）'), findsOneWidget);
    expect(find.text('下周预计'), findsOneWidget);
    expect(find.text('完成民法·物权法章节练习'), findsOneWidget);
  });

  testWidgets('学习计划按 RC 分周任务卡展示并支持完成状态切换', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LearningPlanScreen()));
    expect(find.text('本周计划（8月26日–9月1日）'), findsOneWidget);
    expect(find.text('下周预计'), findsOneWidget);
    expect(find.text('完成民法·物权法章节练习'), findsOneWidget);
    expect(find.text('目标30题 · 已完成12题'), findsOneWidget);
    expect(find.byIcon(Icons.circle_outlined), findsNWidgets(5));

    await tester.tap(find.text('完成民法·物权法章节练习'));
    await tester.pump();
    expect(find.byKey(const ValueKey('learning-plan-task-status-完成民法·物权法章节练习')),
        findsOneWidget);
    expect(find.byIcon(Icons.check_circle_outline), findsNWidgets(2));
  });

  testWidgets('错题本按 RC 三道题卡和科目筛选展示', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: MistakeBookScreen()));
    expect(find.text('共 3 道错题待复习'), findsOneWidget);
    expect(find.text('关于诉讼时效的适用，下列说法错误的是：'), findsOneWidget);
    expect(find.text('答错2次'), findsOneWidget);
    expect(find.byKey(const ValueKey('mistake-question-oq1')), findsOneWidget);

    await tester.tap(find.text('刑法'));
    await tester.pump();
    expect(find.text('共 0 道错题待复习'), findsOneWidget);
    expect(find.text('暂无符合条件的错题'), findsOneWidget);

    await tester.tap(find.text('民法'));
    await tester.pump();
    expect(find.text('共 3 道错题待复习'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('mistake-question-oq1')));
    await tester.pumpAndSettle();
    expect(find.text('错题复习'), findsOneWidget);
  });

  testWidgets('收藏夹按 RC 四条列表展示并支持取消收藏', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: FavoritesScreen()));
    expect(find.text('共 4 条收藏'), findsOneWidget);
    expect(find.text('关于善意取得制度适用的判断（第2题）'), findsOneWidget);
    expect(find.text('善意取得——《民法典》第311条'), findsOneWidget);
    expect(find.text('关于诉讼时效适用规则的判断（第3题）'), findsOneWidget);
    expect(find.text('犯罪未完成形态的认定（第5题）'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('remove-favorite-favorite-1')));
    await tester.pump();
    expect(find.text('共 3 条收藏'), findsOneWidget);
    expect(find.text('关于善意取得制度适用的判断（第2题）'), findsNothing);

    await tester.tap(find.byKey(const ValueKey('favorite-2')));
    await tester.pumpAndSettle();
    expect(find.text('收藏题目'), findsOneWidget);
    expect(find.text('1 / 4'), findsOneWidget);
  });

  testWidgets('我的页面可以进入法条检索', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LawSearchScreen()));
    await tester.pumpAndSettle();
    expect(find.text('高频考点法条'), findsOneWidget);
    expect(find.text('搜索法条、关键词、条文编号…'), findsOneWidget);
  });

  testWidgets('个人资料按 RC 字段编辑并在编辑态保存', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: UserProfileScreen()));
    expect(find.text('保存修改'), findsNothing);
    expect(find.byType(TextField), findsNothing);

    await tester.tap(find.byKey(const ValueKey('profile-field-nickname')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('profile-edit-sheet')), findsOneWidget);
    await tester.enterText(
        find.byKey(const ValueKey('profile-edit-input')), '法考学员');
    await tester.tap(find.byKey(const ValueKey('profile-edit-save')));
    await tester.pumpAndSettle();
    expect(find.text('法考学员'), findsAtLeastNWidgets(1));
    expect(find.text('已保存修改'), findsOneWidget);
  });

  testWidgets('AI 答疑页面支持发送消息', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AIChatScreen()));
    await tester.enterText(find.byType(TextField), '善意取得的条件是什么？');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();
    expect(find.text('善意取得的条件是什么？'), findsOneWidget);
  });

  testWidgets('首页通知入口打开通知中心', (WidgetTester tester) async {
    await tester.pumpWidget(const DebaoApp());
    await tester.tap(find.byTooltip('通知'));
    await tester.pumpAndSettle();
    expect(find.text('消息通知'), findsOneWidget);
    expect(find.textContaining('课程通知'), findsOneWidget);
  });

  testWidgets('商品购买明确展示沙盒支付边界', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: ProductDetailScreen(
        name: '民法精讲课（2024版）',
        brief: '体系化讲解民法核心考点',
        price: '1,980',
        originalPrice: '2,480',
        coverColor: Color(0xFF1A5FA8),
        icon: Icons.menu_book,
      ),
    ));
    expect(find.textContaining('沙盒商品'), findsOneWidget);
    await tester.tap(find.text('立即购买'));
    await tester.pumpAndSettle();
    expect(find.text('沙盒支付'), findsOneWidget);
    expect(find.text('创建演示订单'), findsOneWidget);
  });

  testWidgets('批改套卷可进入报告状态页', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: GradingServiceScreen()));
    // The RC history row is titled by the question case; the year remains a
    // separate metadata label (`2023年真题`).
    await tester.tap(find.text('民法·股权转让案例'));
    await tester.pumpAndSettle();
    expect(find.text('套卷详情'), findsOneWidget);
    await tester.tap(find.text('上传答卷并提交'));
    await tester.pumpAndSettle();
    expect(find.text('批改报告'), findsOneWidget);
    expect(find.textContaining('等待批改'), findsOneWidget);
  });

  testWidgets('设置可进入账号安全和法律文档', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: SettingsScreen()));
    // Keep the Flutter screen aligned with the RC Settings.tsx surface.
    expect(find.text('清理缓存'), findsNothing);
    await tester.tap(find.text('账号与安全'));
    await tester.pumpAndSettle();
    expect(find.text('当前手机号'), findsOneWidget);
  });

  testWidgets('论坛支持发帖和评论', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: ForumComposeScreen()));
    await tester.enterText(find.byType(TextField).at(0), '备考经验分享');
    await tester.enterText(
        find.byType(TextField).at(1), '这是一个足够长的帖子正文，用来分享复习方法和时间安排。');
    await tester.tap(find.widgetWithText(FilledButton, '发布帖子'));
    await tester.pumpAndSettle();
    expect(find.text('帖子详情'), findsOneWidget);
    expect(find.text('备考经验分享'), findsOneWidget);
  });

  testWidgets('登录页需要同意协议后才能提交', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    expect(find.text('登录得宝'), findsOneWidget);
    final wechat = find.widgetWithText(FilledButton, '微信登录');
    expect(tester.widget<FilledButton>(wechat).onPressed, isNull);
    await tester.tap(find.text('我已阅读并同意用户协议和隐私政策'));
    await tester.pump();
    expect(tester.widget<FilledButton>(wechat).onPressed, isNotNull);
  });
}
