import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/data/repositories.dart';
import 'package:debao_flutter/features/community/forum_screens.dart';

/// Minimal transport used to exercise the remote forum actions without
/// starting a server.  The widget still goes through the production
/// repository, so URL encoding, payload shape and error handling are covered
/// by the test rather than bypassed with a fake screen callback.
class _ForumTransport implements ApiTransport {
  final calls = <String>[];
  final payloads = <String, Object?>{};

  static const post = <String, dynamic>{
    'id': 'post-moderation',
    'title': '需要核实的帖子',
    'body': '这是一篇用于验证社区处理操作的帖子正文。',
    'category': '经验分享',
    'userName': '其他用户',
    'likes': 3,
    'comments': 1,
    'createdAt': '2026-09-02T08:00:00Z',
    'liked': false,
    'favorited': false,
    'canDelete': false,
  };

  static final ownPost = <String, dynamic>{
    ...post,
    'id': 'post-own',
    'userName': '当前用户',
    'canDelete': true,
  };

  static const comment = <String, dynamic>{
    'id': 'comment-own',
    'postId': 'post-own',
    'body': '这是自己的评论。',
    'userName': '当前用户',
    'createdAt': '2026-09-02T08:01:00Z',
    'canDelete': true,
  };

  _ForumTransport({required this.own}) : postFixture = own ? ownPost : post;

  final bool own;
  final Map<String, dynamic> postFixture;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/forum/posts/post-moderation' ||
        path == '/v1/forum/posts/post-own') {
      return postFixture;
    }
    if (path.endsWith('/comments')) {
      return <String, dynamic>{
        'items':
            own ? <Map<String, dynamic>>[comment] : <Map<String, dynamic>>[],
      };
    }
    return <String, dynamic>{'items': <dynamic>[]};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    payloads[path] = data;
    if (path.endsWith('/report')) {
      return <String, dynamic>{
        'id': 'report-1',
        'postId': 'post-moderation',
        'reason': (data as Map<String, dynamic>)['reason'],
        'status': 'pending',
      };
    }
    return postFixture;
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    calls.add('PATCH $path');
    payloads[path] = data;
    return postFixture;
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    payloads[path] = data;
    return <String, dynamic>{'deleted': true};
  }
}

Widget _remoteDetail(_ForumTransport transport, {required bool own}) {
  final id = own ? 'post-own' : 'post-moderation';
  return ProviderScope(
    overrides: [
      communityRepositoryProvider
          .overrideWithValue(CommunityRepository(transport)),
    ],
    child: MaterialApp(
      home: ForumDetailScreen(
        postId: id,
        initialPost: ForumPost.fromJson(transport.postFixture),
        title: '占位标题',
        body: '占位正文',
        category: '经验分享',
        remoteEnabled: true,
      ),
    ),
  );
}

void main() {
  testWidgets('远端帖子支持填写理由并提交举报', (tester) async {
    final transport = _ForumTransport(own: false);
    await tester.pumpWidget(_remoteDetail(transport, own: false));
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('forum-report-post')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('forum-report-post')));
    await tester.pumpAndSettle();
    expect(find.text('举报帖子'), findsOneWidget);
    expect(find.byKey(const ValueKey('forum-report-reason')), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('forum-report-submit')));
    await tester.pump();
    expect(find.text('举报理由至少需要 2 个字'), findsOneWidget);

    await tester.enterText(
        find.byKey(const ValueKey('forum-report-reason')), '内容与学习无关');
    await tester.tap(find.byKey(const ValueKey('forum-report-submit')));
    await tester.pumpAndSettle();

    expect(find.text('举报已提交，我们会尽快处理'), findsOneWidget);
    expect(transport.calls,
        contains('POST /v1/forum/posts/post-moderation/report'));
    expect(
        (transport.payloads['/v1/forum/posts/post-moderation/report']
            as Map<String, dynamic>)['reason'],
        '内容与学习无关');
  });

  testWidgets('作者可确认删除自己的帖子', (tester) async {
    final transport = _ForumTransport(own: true);
    await tester.pumpWidget(_remoteDetail(transport, own: true));
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('forum-delete-post')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('forum-delete-post')));
    await tester.pumpAndSettle();
    expect(find.text('删除帖子'), findsOneWidget);
    expect(find.text('删除后帖子和全部评论将不再展示，此操作无法撤销。'), findsOneWidget);
    await tester.tap(find.text('确认删除'));
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('forum-detail-screen')), findsNothing);
    expect(transport.calls, contains('DELETE /v1/forum/posts/post-own'));
  });

  testWidgets('作者可确认删除自己的评论', (tester) async {
    final transport = _ForumTransport(own: true);
    await tester.pumpWidget(_remoteDetail(transport, own: true));
    await tester.pumpAndSettle();

    final deleteComment =
        find.byKey(const ValueKey('forum-delete-comment-comment-own'));
    expect(deleteComment, findsOneWidget);
    await tester.tap(deleteComment);
    await tester.pumpAndSettle();
    expect(find.text('删除评论'), findsOneWidget);
    await tester.tap(find.text('确认删除'));
    await tester.pumpAndSettle();

    expect(
        find.byKey(const ValueKey('forum-comment-comment-own')), findsNothing);
    expect(transport.calls, contains('DELETE /v1/forum/comments/comment-own'));
  });
}
