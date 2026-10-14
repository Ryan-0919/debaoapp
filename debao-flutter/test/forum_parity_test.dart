import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/features/community/forum_screens.dart';
import 'package:debao_flutter/features/community/announcements_screen.dart';
import 'package:debao_flutter/features/tools/study_tools_screens.dart';

void main() {
  testWidgets('论坛列表按 RC fixture 展示并支持分类筛选/详情', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CommunityForumScreen()));
    expect(find.byKey(const ValueKey('forum-post-f1')), findsOneWidget);
    expect(find.byKey(const ValueKey('forum-post-f6')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('forum-tag-答疑求助')));
    await tester.pump();
    expect(find.byKey(const ValueKey('forum-post-f2')), findsOneWidget);
    expect(find.byKey(const ValueKey('forum-post-f4')), findsOneWidget);
    expect(find.byKey(const ValueKey('forum-post-f1')), findsNothing);
    await tester.tap(find.byKey(const ValueKey('forum-post-f2')));
    await tester.pumpAndSettle();
    expect(find.text('帖子详情'), findsOneWidget);
    expect(find.textContaining('善意取得中'), findsOneWidget);
  });

  testWidgets('论坛和公告使用独立页面，不再嵌入法条检索', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: LawSearchScreen()));
    expect(find.text('法条检索'), findsOneWidget);
    expect(find.text('学习论坛'), findsNothing);
    expect(find.text('官方公告'), findsNothing);

    await tester.pumpWidget(const MaterialApp(home: AnnouncementListScreen()));
    await tester.pump();
    expect(
        find.byKey(const ValueKey('announcement-list-screen')), findsOneWidget);
    expect(find.text('官方公告'), findsOneWidget);
  });
}
