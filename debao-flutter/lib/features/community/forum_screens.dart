import '../../core/config/app_environment.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';

const _brand = Color(0xFF4C4BEA);
const _brandLight = Color(0xFFF0F0FF);
const _page = Color(0xFFF4F5F7);
const _ink = Color(0xFF171925);
const _body = Color(0xFF5F6574);
const _muted = Color(0xFF707684);
const _line = Color(0xFFE5E7ED);
const _errorColor = Color(0xFFD04A3A);

const forumCategories = <String>[
  '经验分享',
  '答疑求助',
  '知识整理',
  '技巧方法',
];

/// The forum is an independent community surface reached from the home-page
/// community section or its public route.
class CommunityForumScreen extends StatelessWidget {
  const CommunityForumScreen({super.key, this.remoteEnabled = remoteDataDefault});

  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _CommunityForumBody(remoteEnabled: remoteEnabled),
      );
}

/// Deterministic forum rows used by mock/local previews.
const localForumFixtures = <ForumPost>[
  ForumPost(
    id: 'f1',
    author: '法考老鸟',
    category: '经验分享',
    title: '三战上岸经验分享：客观题从108到213的蜕变之路',
    body: '分享一下我三年备考的心路历程，希望能帮到还在坚持的同学们……',
    likeCount: 342,
    commentCount: 87,
    createdAt: '2026-09-02T08:00:00+08:00',
  ),
  ForumPost(
    id: 'f2',
    author: '民法小白',
    category: '答疑求助',
    title: '善意取得中「合理价格」如何认定？有没有具体标准？',
    body: '老师说合理价格不低于市价70%，但这个比例是哪里来的？有没有法条依据……',
    likeCount: 28,
    commentCount: 15,
    createdAt: '2026-09-02T06:00:00+08:00',
  ),
  ForumPost(
    id: 'f3',
    author: '刑法爱好者',
    category: '知识整理',
    title: '共同犯罪8大考点汇总，附真题解析（2019-2023）',
    body: '整理了近五年关于共同犯罪的考点，包括主从犯认定、帮助犯、片面共犯……',
    likeCount: 186,
    commentCount: 43,
    createdAt: '2026-09-01T09:00:00+08:00',
  ),
  ForumPost(
    id: 'f4',
    author: '诉讼法研究',
    category: '答疑求助',
    title: '行政诉讼起诉期限6个月和2年的区别，一直搞不清楚',
    body: '请问直接起诉是6个月，但经过复议的是多久？两者起算点有何不同……',
    likeCount: 54,
    commentCount: 22,
    createdAt: '2026-09-01T07:00:00+08:00',
  ),
  ForumPost(
    id: 'f5',
    author: '主观题达人',
    category: '技巧方法',
    title: '主观题答题模板分享：合同纠纷类案例万能框架',
    body: '做了大量主观题后总结的答题框架，按照这个模板写基本不会跑偏……',
    likeCount: 271,
    commentCount: 61,
    createdAt: '2026-08-30T10:00:00+08:00',
  ),
  ForumPost(
    id: 'f6',
    author: '行政法控',
    category: '知识整理',
    title: '行政许可vs行政审批vs行政确认，三者区别一表搞定',
    body: '每次做题都被这三个概念绕晕，今天专门整理了对比表……',
    likeCount: 93,
    commentCount: 19,
    createdAt: '2026-08-29T10:00:00+08:00',
  ),
];

class _CommunityForumBody extends ConsumerStatefulWidget {
  const _CommunityForumBody({required this.remoteEnabled});

  final bool remoteEnabled;

  @override
  ConsumerState<_CommunityForumBody> createState() => _CommunityForumState();
}

class _CommunityForumState extends ConsumerState<_CommunityForumBody> {
  String selectedCategory = '全部';
  List<ForumPost> remotePosts = const <ForumPost>[];
  String? nextCursor;
  Object? loadError;
  bool loading = false;
  bool loadingMore = false;

  @override
  void initState() {
    super.initState();
    if (widget.remoteEnabled) {
      // Start the request after the first frame so a route opened from a
      // deep-link can render its loading state immediately.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _load();
      });
    }
  }

  Future<void> _load({bool append = false}) async {
    if (!widget.remoteEnabled || (append ? loadingMore : loading)) return;
    if (append && (nextCursor == null || nextCursor!.isEmpty)) return;
    setState(() {
      if (append) {
        loadingMore = true;
      } else {
        loading = true;
        loadError = null;
      }
    });
    try {
      final page = await ref.read(communityRepositoryProvider).postPage(
            category: selectedCategory == '全部' ? null : selectedCategory,
            cursor: append ? nextCursor : null,
            limit: 20,
          );
      if (!mounted) return;
      setState(() {
        if (append) {
          final known = remotePosts.map((item) => item.id).toSet();
          remotePosts = <ForumPost>[
            ...remotePosts,
            ...page.items.where((item) => !known.contains(item.id)),
          ];
        } else {
          remotePosts = page.items;
        }
        nextCursor = page.nextCursor;
        loadError = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => loadError = error);
    } finally {
      if (mounted) {
        setState(() {
          loading = false;
          loadingMore = false;
        });
      }
    }
  }

  void _selectCategory(String value) {
    if (selectedCategory == value) return;
    setState(() {
      selectedCategory = value;
      remotePosts = const <ForumPost>[];
      nextCursor = null;
      loadError = null;
    });
    if (widget.remoteEnabled) _load();
  }

  Future<void> _openCompose() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => ForumComposeScreen(remoteEnabled: widget.remoteEnabled),
      ),
    );
    if (mounted && widget.remoteEnabled) _load();
  }

  @override
  Widget build(BuildContext context) {
    final sourcePosts = widget.remoteEnabled ? remotePosts : localForumFixtures;
    final posts = selectedCategory == '全部'
        ? sourcePosts
        : sourcePosts
            .where((post) => post.category == selectedCategory)
            .toList(growable: false);
    final initialLoading = widget.remoteEnabled && loading && posts.isEmpty;
    final initialError =
        widget.remoteEnabled && loadError != null && posts.isEmpty;
    return Scaffold(
      key: const ValueKey('forum-screen'),
      backgroundColor: _page,
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: const Text('学习论坛'),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
      ),
      body: Column(
        children: [
          _categoryBar(),
          Expanded(
            child: initialLoading
                ? const _ForumLoadingState()
                : initialError
                    ? _ForumErrorState(
                        error: loadError!, onRetry: () => _load())
                    : _postList(posts),
          ),
          _composeBar(),
        ],
      ),
    );
  }

  Widget _categoryBar() => Container(
        height: 48,
        color: Colors.white,
        child: ListView.separated(
          key: const ValueKey('forum-category-scroll'),
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          itemCount: forumCategories.length + 1,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final value = index == 0 ? '全部' : forumCategories[index - 1];
            final selected = selectedCategory == value;
            // ChoiceChip applies a tight minimum width on web when the
            // surrounding horizontal viewport is constrained.  The longer
            // Chinese labels ("经验分享", "答疑求助", …) were consequently
            // clipped in the standalone forum route even though the embedded
            // law/forum tab rendered them correctly.  Keep the RC chip
            // geometry explicit so every label gets its intrinsic width plus
            // the same 12dp horizontal inset used by the law surface.
            return _ForumFilterChip(
              key: ValueKey('forum-tag-$value'),
              label: value,
              selected: selected,
              onTap: () => _selectCategory(value),
            );
          },
        ),
      );

  Widget _postList(List<ForumPost> posts) {
    final hasInlineError =
        widget.remoteEnabled && loadError != null && posts.isNotEmpty;
    final children = <Widget>[
      if (hasInlineError)
        _InlineErrorBanner(
          message: _errorMessage(loadError!),
          onRetry: () => _load(),
        ),
      if (posts.isEmpty)
        const _ForumEmptyState()
      else ...[
        ...posts.map(_postCard),
        if (widget.remoteEnabled && nextCursor != null)
          Center(
            child: TextButton(
              key: const ValueKey('forum-list-more'),
              onPressed: loadingMore ? null : () => _load(append: true),
              child: loadingMore
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('加载更多'),
            ),
          ),
      ],
    ];
    // The RC mock ScrollView renders all six deterministic rows in the first
    // frame.  A non-lazy column preserves that behaviour for screenshot and
    // widget parity; real/remote data keeps the lazy ListView path.
    if (!widget.remoteEnabled) {
      return SingleChildScrollView(
        key: const ValueKey('forum-post-list'),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        child: Column(children: children),
      );
    }
    return RefreshIndicator(
      color: _brand,
      onRefresh: () => _load(),
      child: ListView(
        key: const ValueKey('forum-post-list'),
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        children: children,
      ),
    );
  }

  Widget _postCard(ForumPost post) {
    final author = (post.author ?? '').trim().isEmpty ? '得宝用户' : post.author!;
    final category = post.category ?? '学习交流';
    return Card(
      key: ValueKey('forum-post-${post.id}'),
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute(
            builder: (_) => ForumDetailScreen(
              postId: widget.remoteEnabled ? post.id : null,
              initialPost: widget.remoteEnabled ? post : null,
              title: post.title,
              body: post.body,
              category: category,
              remoteEnabled: widget.remoteEnabled,
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: _brand,
                    child: Text(
                      author.characters.first,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(author,
                        style: const TextStyle(
                            color: _body,
                            fontSize: 12,
                            fontWeight: FontWeight.w500)),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                        color: _brandLight,
                        borderRadius: BorderRadius.circular(10)),
                    child: Text(category,
                        style: const TextStyle(
                            color: _brand,
                            fontSize: 10,
                            fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(post.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: _ink,
                      fontSize: 14,
                      height: 1.45,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(post.body,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: _muted, fontSize: 12, height: 1.55)),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.thumb_up_outlined, size: 13, color: _muted),
                  const SizedBox(width: 4),
                  Text('${post.likeCount}',
                      style: const TextStyle(color: _muted, fontSize: 11)),
                  const SizedBox(width: 16),
                  const Icon(Icons.chat_bubble_outline,
                      size: 13, color: _muted),
                  const SizedBox(width: 4),
                  Text('${post.commentCount} 回复',
                      style: const TextStyle(color: _muted, fontSize: 11)),
                  const Spacer(),
                  Text(_forumTime(post.createdAt),
                      style: const TextStyle(
                          color: Color(0xFFC0C5D0), fontSize: 11)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _composeBar() => Container(
        height: 68,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: _line)),
        ),
        child: SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            key: const ValueKey('forum-compose'),
            onPressed: _openCompose,
            icon: const Icon(Icons.chat_bubble_outline, size: 17),
            label: const Text('发布帖子'),
            style: FilledButton.styleFrom(
              backgroundColor: _brand,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      );
}

class ForumComposeScreen extends StatelessWidget {
  const ForumComposeScreen({super.key, this.remoteEnabled = remoteDataDefault});

  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _ForumComposeBody(remoteEnabled: remoteEnabled),
      );
}

class _ForumComposeBody extends ConsumerStatefulWidget {
  const _ForumComposeBody({required this.remoteEnabled});

  final bool remoteEnabled;

  @override
  ConsumerState<_ForumComposeBody> createState() => _ForumComposeState();
}

class _ForumComposeState extends ConsumerState<_ForumComposeBody> {
  String category = forumCategories.first;
  final title = TextEditingController();
  final body = TextEditingController();
  bool submitting = false;
  String? errorMessage;

  bool get valid {
    final titleLength = title.text.trim().length;
    final bodyLength = body.text.trim().length;
    return titleLength >= 4 &&
        titleLength <= 80 &&
        bodyLength >= 10 &&
        bodyLength <= 5000;
  }

  @override
  void dispose() {
    title.dispose();
    body.dispose();
    super.dispose();
  }

  String _errorText(Object error) =>
      error is ApiError ? error.message : '帖子发布失败，请检查网络后重试';

  Future<void> _submit() async {
    final nextTitle = title.text.trim();
    final nextBody = body.text.trim();
    if (!valid) {
      setState(() => errorMessage = '标题至少 4 个字，正文至少 10 个字');
      return;
    }
    if (!widget.remoteEnabled) {
      await Navigator.of(context).pushReplacement<void, void>(
        MaterialPageRoute(
          builder: (_) => ForumDetailScreen(
            title: nextTitle,
            body: nextBody,
            category: category,
          ),
        ),
      );
      return;
    }
    setState(() {
      submitting = true;
      errorMessage = null;
    });
    try {
      final post = await ref.read(communityRepositoryProvider).createPost(
            title: nextTitle,
            body: nextBody,
            category: category,
          );
      if (!mounted) return;
      await Navigator.of(context).pushReplacement<void, void>(
        MaterialPageRoute(
          builder: (_) => ForumDetailScreen(
            postId: post.id,
            initialPost: post,
            title: post.title,
            body: post.body,
            category: post.category ?? category,
            remoteEnabled: true,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => errorMessage = _errorText(error));
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        key: const ValueKey('forum-compose-screen'),
        backgroundColor: _page,
        appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('发布帖子'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
          children: [
            const Text('帖子分类',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: forumCategories
                  .map((item) => ChoiceChip(
                        key: ValueKey('forum-compose-category-$item'),
                        label: Text(item),
                        selected: category == item,
                        onSelected: submitting
                            ? null
                            : (_) => setState(() => category = item),
                        showCheckmark: false,
                        side: BorderSide(
                            color: category == item ? _brand : _line),
                        selectedColor: _brand,
                        backgroundColor: Colors.white,
                        labelStyle: TextStyle(
                            color: category == item ? Colors.white : _body,
                            fontSize: 12,
                            fontWeight: category == item
                                ? FontWeight.w600
                                : FontWeight.w400),
                      ))
                  .toList(growable: false),
            ),
            const SizedBox(height: 22),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('标题',
                    style: TextStyle(
                        color: _ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w700)),
                Text('${title.text.length}/80',
                    key: const ValueKey('forum-compose-title-counter'),
                    style: const TextStyle(color: _muted, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              key: const ValueKey('forum-compose-title'),
              controller: title,
              enabled: !submitting,
              maxLength: 80,
              onChanged: (_) => setState(() => errorMessage = null),
              decoration: const InputDecoration(
                counterText: '',
                filled: true,
                fillColor: Colors.white,
                hintText: '清晰描述你想分享或讨论的内容',
                border: OutlineInputBorder(),
              ),
            ),
            if (title.text.isNotEmpty && title.text.trim().length < 4)
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text('标题至少需要 4 个字',
                    style: TextStyle(color: Color(0xFFA87000), fontSize: 11)),
              ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('正文',
                    style: TextStyle(
                        color: _ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w700)),
                Text('${body.text.length}/5000',
                    key: const ValueKey('forum-compose-body-counter'),
                    style: const TextStyle(color: _muted, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              key: const ValueKey('forum-compose-body'),
              controller: body,
              enabled: !submitting,
              minLines: 8,
              maxLines: 12,
              maxLength: 5000,
              onChanged: (_) => setState(() => errorMessage = null),
              textAlignVertical: TextAlignVertical.top,
              decoration: const InputDecoration(
                counterText: '',
                filled: true,
                fillColor: Colors.white,
                hintText: '补充背景、你的思考或具体问题',
                alignLabelWithHint: true,
                border: OutlineInputBorder(),
              ),
            ),
            if (body.text.isNotEmpty && body.text.trim().length < 10)
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text('正文至少需要 10 个字',
                    style: TextStyle(color: Color(0xFFA87000), fontSize: 11)),
              ),
            if (errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(errorMessage!,
                    key: const ValueKey('forum-compose-error'),
                    style: const TextStyle(color: _errorColor, fontSize: 12)),
              ),
            const SizedBox(height: 18),
            SizedBox(
              height: 46,
              child: FilledButton.icon(
                key: const ValueKey('forum-compose-submit'),
                onPressed: submitting ? null : _submit,
                icon: submitting
                    ? const SizedBox(
                        width: 17,
                        height: 17,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.send_outlined, size: 17),
                label: Text(submitting ? '发布中…' : '发布帖子'),
              ),
            ),
          ],
        ),
      );
}

class ForumDetailScreen extends ConsumerStatefulWidget {
  const ForumDetailScreen({
    super.key,
    required this.title,
    required this.body,
    required this.category,
    this.postId,
    this.remoteEnabled = remoteDataDefault,
    this.initialPost,
  });

  final String title;
  final String body;
  final String category;
  final String? postId;
  final bool remoteEnabled;
  final ForumPost? initialPost;

  @override
  ConsumerState<ForumDetailScreen> createState() => _ForumDetailState();
}

class _ForumDetailState extends ConsumerState<ForumDetailScreen> {
  bool liked = false;
  bool favorited = false;
  bool actionBusy = false;
  bool commentBusy = false;
  bool loadingMore = false;
  final comment = TextEditingController();
  final localComments = <String>[];
  final remoteAddedComments = <ForumComment>[];
  final deletedCommentIds = <String>{};
  ForumPost? actionPost;
  Object? commentsError;
  String? commentsCursor;

  @override
  void dispose() {
    comment.dispose();
    super.dispose();
  }

  String _errorText(Object error) =>
      error is ApiError ? error.message : '社区操作失败，请检查网络后重试';

  Future<void> _toggleLike() async {
    if (!widget.remoteEnabled || widget.postId == null) {
      setState(() => liked = !liked);
      return;
    }
    await _runPostAction(
        () => ref.read(communityRepositoryProvider).toggleLike(widget.postId!));
  }

  Future<void> _toggleFavorite() async {
    if (!widget.remoteEnabled || widget.postId == null) {
      setState(() => favorited = !favorited);
      return;
    }
    await _runPostAction(() =>
        ref.read(communityRepositoryProvider).toggleFavorite(widget.postId!));
  }

  Future<void> _runPostAction(Future<ForumPost> Function() action) async {
    if (actionBusy) return;
    setState(() => actionBusy = true);
    try {
      final next = await action();
      if (!mounted) return;
      setState(() {
        actionPost = next;
        liked = next.liked;
        favorited = next.favorited;
      });
      if (widget.postId != null) {
        ref.invalidate(forumPostProvider(widget.postId!));
        ref.invalidate(forumPostsProvider('all'));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(_errorText(error))));
      }
    } finally {
      if (mounted) setState(() => actionBusy = false);
    }
  }

  Future<void> _submitComment() async {
    final text = comment.text.trim();
    if (text.isEmpty || commentBusy) return;
    if (!widget.remoteEnabled || widget.postId == null) {
      setState(() {
        localComments.add(text);
        comment.clear();
      });
      return;
    }
    setState(() => commentBusy = true);
    try {
      final created = await ref
          .read(communityRepositoryProvider)
          .createComment(widget.postId!, text);
      if (!mounted) return;
      setState(() {
        remoteAddedComments.add(created);
        comment.clear();
      });
      ref.invalidate(forumCommentsProvider(widget.postId!));
      ref.invalidate(forumPostProvider(widget.postId!));
      ref.invalidate(forumPostsProvider('all'));
    } catch (error) {
      if (mounted) {
        setState(() => commentsError = error);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(_errorText(error))));
      }
    } finally {
      if (mounted) setState(() => commentBusy = false);
    }
  }

  Future<void> _loadMoreComments() async {
    final postId = widget.postId;
    final cursor = commentsCursor;
    if (!widget.remoteEnabled ||
        postId == null ||
        cursor == null ||
        loadingMore) {
      return;
    }
    setState(() => loadingMore = true);
    try {
      final page = await ref
          .read(communityRepositoryProvider)
          .commentPage(postId, cursor: cursor, limit: 20);
      if (!mounted) return;
      setState(() {
        final known = remoteAddedComments.map((item) => item.id).toSet();
        remoteAddedComments
            .addAll(page.items.where((item) => !known.contains(item.id)));
        commentsCursor = page.nextCursor;
        commentsError = null;
      });
    } catch (error) {
      if (mounted) setState(() => commentsError = error);
    } finally {
      if (mounted) setState(() => loadingMore = false);
    }
  }

  Future<void> _deletePost() async {
    final postId = widget.postId;
    if (!widget.remoteEnabled || postId == null || actionBusy) return;
    setState(() => actionBusy = true);
    try {
      await ref.read(communityRepositoryProvider).deletePost(postId);
      if (!mounted) return;
      ref.invalidate(forumPostsProvider('all'));
      Navigator.of(context).pop(true);
    } catch (error) {
      if (mounted) {
        setState(() => actionBusy = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(_errorText(error))));
      }
    }
  }

  Future<void> _deleteComment(ForumComment item) async {
    if (!widget.remoteEnabled || !item.canDelete || actionBusy) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('删除评论'),
        content: const Text('删除后评论将不再展示，此操作无法撤销。'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('取消')),
          FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('确认删除')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => actionBusy = true);
    try {
      await ref.read(communityRepositoryProvider).deleteComment(item.id);
      if (!mounted) return;
      setState(() {
        deletedCommentIds.add(item.id);
        actionBusy = false;
      });
      ref.invalidate(forumCommentsProvider(widget.postId!));
      ref.invalidate(forumPostProvider(widget.postId!));
    } catch (error) {
      if (mounted) {
        setState(() => actionBusy = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(_errorText(error))));
      }
    }
  }

  Future<void> _confirmDeletePost() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('删除帖子'),
        content: const Text('删除后帖子和全部评论将不再展示，此操作无法撤销。'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('取消')),
          FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              style: FilledButton.styleFrom(backgroundColor: _errorColor),
              child: const Text('确认删除')),
        ],
      ),
    );
    if (confirmed == true) await _deletePost();
  }

  /// Open the user-facing report form and submit a pending moderation report.
  ///
  /// Reporting is intentionally kept separate from the delete flow: users can
  /// report someone else's post, while only the author can soft-delete their
  /// own post.  The server owns moderation and de-duplication; the client
  /// only reports the request result and never presents it as resolved.
  Future<void> _reportPost() async {
    final postId = widget.postId;
    if (!widget.remoteEnabled || postId == null || actionBusy) return;

    // Keep the draft as a plain string so the dialog owns no controller that
    // could be disposed while its closing transition is still rebuilding.
    var reasonDraft = '';
    String? validationError;
    final reason = await showDialog<String>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('举报帖子'),
          content: TextField(
            key: const ValueKey('forum-report-reason'),
            autofocus: true,
            maxLength: 200,
            maxLines: 4,
            decoration: InputDecoration(
              labelText: '举报理由',
              hintText: '请填写举报理由',
              alignLabelWithHint: true,
              errorText: validationError,
            ),
            onChanged: (value) {
              reasonDraft = value;
              if (validationError != null) {
                setDialogState(() => validationError = null);
              }
            },
          ),
          actions: [
            TextButton(
              key: const ValueKey('forum-report-cancel'),
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('取消'),
            ),
            FilledButton(
              key: const ValueKey('forum-report-submit'),
              onPressed: () {
                final value = reasonDraft.trim();
                if (value.length < 2) {
                  setDialogState(() => validationError = '举报理由至少需要 2 个字');
                  return;
                }
                Navigator.pop(dialogContext, value);
              },
              child: const Text('提交举报'),
            ),
          ],
        ),
      ),
    );
    final normalizedReason = reason?.trim();
    if (!mounted || normalizedReason == null || normalizedReason.isEmpty) {
      return;
    }

    setState(() => actionBusy = true);
    try {
      await ref
          .read(communityRepositoryProvider)
          .reportPost(postId, normalizedReason);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('举报已提交，我们会尽快处理')),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(_errorText(error))));
      }
    } finally {
      if (mounted) setState(() => actionBusy = false);
    }
  }

  Widget _errorState(Object error) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, color: _muted, size: 32),
            const SizedBox(height: 10),
            const Text('帖子内容暂时不可用',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(_errorText(error),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(color: _muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('forum-detail-retry'),
                onPressed: () {
                  if (widget.postId != null) {
                    ref.invalidate(forumPostProvider(widget.postId!));
                    ref.invalidate(forumCommentsProvider(widget.postId!));
                  }
                },
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重新加载')),
          ]),
        ),
      );

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled &&
        (widget.postId == null || widget.postId!.trim().isEmpty)) {
      return Scaffold(
        key: const ValueKey('forum-detail-screen'),
        backgroundColor: _page,
        appBar: _detailAppBar(),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(28),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.link_off_outlined, color: _muted, size: 34),
              SizedBox(height: 10),
              Text('帖子编号缺失',
                  style: TextStyle(
                      color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
              SizedBox(height: 6),
              Text('请从社区列表重新打开该帖子。',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: _muted, fontSize: 12)),
            ]),
          ),
        ),
      );
    }
    final postAsync = widget.remoteEnabled && widget.postId != null
        ? ref.watch(forumPostProvider(widget.postId!))
        : null;
    final commentsAsync = widget.remoteEnabled && widget.postId != null
        ? ref.watch(forumCommentsProvider(widget.postId!))
        : null;
    if (widget.remoteEnabled &&
        postAsync != null &&
        postAsync.isLoading &&
        !postAsync.hasValue &&
        widget.initialPost == null) {
      return Scaffold(
          key: const ValueKey('forum-detail-screen'),
          backgroundColor: _page,
          appBar: _detailAppBar(),
          body: const Center(
              child: CircularProgressIndicator(
                  key: ValueKey('forum-detail-loading'), color: _brand)));
    }
    if (widget.remoteEnabled &&
        postAsync != null &&
        postAsync.hasError &&
        !postAsync.hasValue &&
        widget.initialPost == null) {
      return Scaffold(
          key: const ValueKey('forum-detail-screen'),
          backgroundColor: _page,
          appBar: _detailAppBar(),
          body: _errorState(postAsync.error!));
    }

    final post = actionPost ?? postAsync?.valueOrNull ?? widget.initialPost;
    final title = post?.title ?? widget.title;
    final body = post?.body ?? widget.body;
    final category = post?.category ?? widget.category;
    final loadedComments =
        (commentsAsync?.valueOrNull ?? const <ForumComment>[])
            .where((item) => !deletedCommentIds.contains(item.id))
            .toList(growable: false);
    final comments = <ForumComment>[
      ...loadedComments,
      ...remoteAddedComments.where((item) =>
          !deletedCommentIds.contains(item.id) &&
          !loadedComments.any((loaded) => loaded.id == item.id)),
    ];
    final commentCount = widget.remoteEnabled
        ? (post?.commentCount ?? comments.length)
        : localComments.length;
    final currentLiked = widget.remoteEnabled ? (post?.liked ?? liked) : liked;
    final currentFavorited =
        widget.remoteEnabled ? (post?.favorited ?? favorited) : favorited;
    // CommunityRepository caches the cursor when the initial list is loaded;
    // this keeps the legacy list provider API while still enabling RC-style
    // cursor pagination on the detail screen.
    if (widget.remoteEnabled &&
        widget.postId != null &&
        commentsCursor == null) {
      commentsCursor = ref
          .read(communityRepositoryProvider)
          .nextCommentCursor(widget.postId!);
    }

    return Scaffold(
      key: const ValueKey('forum-detail-screen'),
      backgroundColor: _page,
      appBar: _detailAppBar(post: post),
      body: Column(
        children: [
          if (widget.remoteEnabled && postAsync?.hasError == true)
            _InlineErrorBanner(
              message: '帖子更新失败，当前保留已加载内容',
              onRetry: () => ref.invalidate(forumPostProvider(widget.postId!)),
            ),
          Expanded(
            child: ListView(
              key: const ValueKey('forum-detail-scroll'),
              padding: const EdgeInsets.only(bottom: 16),
              children: [
                _postContent(
                    post: post,
                    title: title,
                    body: body,
                    category: category,
                    liked: currentLiked,
                    favorited: currentFavorited),
                const SizedBox(height: 14),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      const Text('全部评论',
                          style: TextStyle(
                              color: _ink,
                              fontSize: 14,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(width: 8),
                      Text('$commentCount 条',
                          style: const TextStyle(color: _muted, fontSize: 11)),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                if (commentsAsync?.hasError == true)
                  _InlineErrorBanner(
                    message: '评论加载失败，已保留当前帖子内容',
                    onRetry: () =>
                        ref.invalidate(forumCommentsProvider(widget.postId!)),
                  ),
                if (comments.isEmpty)
                  const _DetailEmptyComments()
                else
                  ...comments.map(_commentCard),
                if (commentsCursor != null)
                  Center(
                    child: TextButton(
                      key: const ValueKey('forum-comments-more'),
                      onPressed: loadingMore ? null : _loadMoreComments,
                      child: loadingMore
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('加载更多评论'),
                    ),
                  ),
                if (commentsError != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(_errorText(commentsError!),
                        key: const ValueKey('forum-comments-error'),
                        textAlign: TextAlign.center,
                        style:
                            const TextStyle(color: _errorColor, fontSize: 12)),
                  ),
              ],
            ),
          ),
          _commentComposer(),
        ],
      ),
    );
  }

  PreferredSizeWidget _detailAppBar({ForumPost? post}) => AppBar(
        leading: const DebaoRouteBackButton(),
        title: const Text('帖子详情'),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          if (widget.remoteEnabled && post != null)
            IconButton(
              key: const ValueKey('forum-report-post'),
              tooltip: '举报帖子',
              onPressed: actionBusy ? null : _reportPost,
              icon: const Icon(Icons.flag_outlined, color: _muted, size: 20),
            ),
          if (widget.remoteEnabled && post?.canDelete == true)
            IconButton(
              key: const ValueKey('forum-delete-post'),
              tooltip: '删除帖子',
              onPressed: actionBusy ? null : _confirmDeletePost,
              icon: const Icon(Icons.delete_outline,
                  color: _errorColor, size: 20),
            )
          else
            const SizedBox(width: 8),
        ],
      );

  Widget _postContent({
    required ForumPost? post,
    required String title,
    required String body,
    required String category,
    required bool liked,
    required bool favorited,
  }) {
    final author = (post?.author ?? '').trim().isEmpty ? '得宝用户' : post!.author!;
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          CircleAvatar(
            radius: 19,
            backgroundColor: _brand,
            child: Text(author.characters.first,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(author,
                    style: const TextStyle(
                        color: _body,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text(_forumTime(post?.createdAt),
                    style: const TextStyle(color: _muted, fontSize: 10)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
                color: _brandLight, borderRadius: BorderRadius.circular(10)),
            child: Text(category,
                style: const TextStyle(
                    color: _brand, fontSize: 10, fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 18),
        Text(title,
            style: const TextStyle(
                color: _ink,
                fontSize: 19,
                height: 1.45,
                fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Text(body,
            style: const TextStyle(color: _body, fontSize: 14, height: 1.8)),
        const SizedBox(height: 16),
        const Divider(height: 1, color: _line),
        const SizedBox(height: 8),
        Row(children: [
          TextButton.icon(
            key: const ValueKey('forum-toggle-like'),
            onPressed: actionBusy ? null : _toggleLike,
            icon: Icon(liked ? Icons.thumb_up : Icons.thumb_up_outlined,
                size: 16, color: liked ? _brand : _muted),
            label: Text('${post?.likeCount ?? 0}',
                style: TextStyle(color: liked ? _brand : _muted, fontSize: 12)),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chat_bubble_outline, size: 16, color: _muted),
          const SizedBox(width: 5),
          Text('${post?.commentCount ?? localComments.length}',
              style: const TextStyle(color: _muted, fontSize: 12)),
          const Spacer(),
          TextButton.icon(
            key: const ValueKey('forum-toggle-favorite'),
            onPressed: actionBusy ? null : _toggleFavorite,
            icon: Icon(favorited ? Icons.bookmark : Icons.bookmark_border,
                size: 16, color: favorited ? _brand : _muted),
            label: Text(favorited ? '已收藏' : '收藏',
                style: TextStyle(
                    color: favorited ? _brand : _muted, fontSize: 12)),
          ),
        ]),
      ]),
    );
  }

  Widget _commentCard(ForumComment item) => Container(
        key: ValueKey('forum-comment-${item.id}'),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(10)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            CircleAvatar(
              radius: 13,
              backgroundColor: _brandLight,
              child: Text(
                ((item.author ?? '得').trim().isEmpty
                        ? '得'
                        : item.author!.trim())
                    .characters
                    .first,
                style: const TextStyle(
                    color: _brand, fontSize: 10, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 8),
            Text(item.author ?? '得宝用户',
                style: const TextStyle(
                    color: _body, fontSize: 12, fontWeight: FontWeight.w600)),
            const Spacer(),
            Text(_forumTime(item.createdAt),
                style: const TextStyle(color: _muted, fontSize: 10)),
            if (widget.remoteEnabled && item.canDelete)
              IconButton(
                key: ValueKey('forum-delete-comment-${item.id}'),
                tooltip: '删除评论',
                visualDensity: VisualDensity.compact,
                onPressed: actionBusy ? null : () => _deleteComment(item),
                icon: const Icon(Icons.delete_outline, size: 15, color: _muted),
              ),
          ]),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 34),
            child: Text(item.body,
                style: const TextStyle(color: _ink, fontSize: 13, height: 1.6)),
          ),
        ]),
      );

  Widget _commentComposer() => Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Expanded(
            child: TextField(
              key: const ValueKey('forum-comment-input'),
              controller: comment,
              enabled: !commentBusy,
              maxLength: 1000,
              minLines: 1,
              maxLines: 4,
              decoration: const InputDecoration(
                  counterText: '',
                  hintText: '友善交流，说说你的看法',
                  filled: true,
                  fillColor: _page,
                  border: OutlineInputBorder()),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            key: const ValueKey('forum-comment-submit'),
            tooltip: '发表评论',
            onPressed: commentBusy ? null : _submitComment,
            icon: commentBusy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send, color: _brand),
          ),
        ]),
      );
}

class _ForumLoadingState extends StatelessWidget {
  const _ForumLoadingState();

  @override
  Widget build(BuildContext context) => const Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          CircularProgressIndicator(
              key: ValueKey('forum-list-loading'), color: _brand),
          SizedBox(height: 12),
          Text('正在加载帖子...', style: TextStyle(color: _muted, fontSize: 12)),
        ]),
      );
}

/// Filter chip used by the standalone forum route.
///
/// This mirrors the chip used by the RC law/forum surface, but keeps the
/// implementation local to this file so the standalone route does not depend
/// on a private widget from another feature library. An explicit height and
/// horizontal padding preserve the full intrinsic width of Chinese labels on
/// Flutter Web (Material's ChoiceChip can otherwise compress them).
class _ForumFilterChip extends StatelessWidget {
  const _ForumFilterChip({
    Key? key,
    required this.label,
    required this.selected,
    required this.onTap,
  }) : chipKey = key;

  final Key? chipKey;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          // Keep the public route test id on a hit-testable widget. This also
          // makes keyboard/semantics activation behave like the old chip.
          key: chipKey,
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            height: 28,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? _brand : Colors.white,
              border: Border.all(
                color: selected ? _brand : _line,
                width: 1,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              label,
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.visible,
              style: TextStyle(
                color: selected ? Colors.white : _body,
                fontSize: 12,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
        ),
      );
}

class _ForumErrorState extends StatelessWidget {
  const _ForumErrorState({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, color: _muted, size: 30),
            const SizedBox(height: 10),
            const Text('论坛暂时不可用',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(_errorMessage(error),
                textAlign: TextAlign.center,
                style: const TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('forum-list-retry'),
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重新加载')),
          ]),
        ),
      );
}

class _ForumEmptyState extends StatelessWidget {
  const _ForumEmptyState();

  @override
  Widget build(BuildContext context) => const Padding(
        padding: EdgeInsets.symmetric(vertical: 60),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.forum_outlined, color: _muted, size: 30),
          SizedBox(height: 10),
          Text('暂无相关帖子',
              style: TextStyle(
                  color: _ink, fontSize: 14, fontWeight: FontWeight.w700)),
          SizedBox(height: 5),
          Text('换个分类看看，或发布第一篇帖子。',
              textAlign: TextAlign.center,
              style: TextStyle(color: _muted, fontSize: 12)),
        ]),
      );
}

class _DetailEmptyComments extends StatelessWidget {
  const _DetailEmptyComments();

  @override
  Widget build(BuildContext context) => const Padding(
        padding: EdgeInsets.symmetric(vertical: 34),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.chat_bubble_outline, color: _muted, size: 26),
          SizedBox(height: 8),
          Text('还没有评论',
              style: TextStyle(
                  color: _ink, fontSize: 13, fontWeight: FontWeight.w600)),
          SizedBox(height: 4),
          Text('说说你的看法，成为第一个参与讨论的人。',
              style: TextStyle(color: _muted, fontSize: 11)),
        ]),
      );
}

class _InlineErrorBanner extends StatelessWidget {
  const _InlineErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
            color: const Color(0xFFFFF4F1),
            borderRadius: BorderRadius.circular(8)),
        child: Row(children: [
          const Icon(Icons.cloud_off_outlined, color: _errorColor, size: 16),
          const SizedBox(width: 7),
          Expanded(
              child: Text(message,
                  style: const TextStyle(color: _errorColor, fontSize: 11))),
          TextButton(onPressed: onRetry, child: const Text('重试')),
        ]),
      );
}

String _errorMessage(Object error) {
  if (error is ApiError && error.message.isNotEmpty) return error.message;
  return error.toString().replaceFirst('Exception: ', '');
}

String _forumTime(String? value) {
  if (value == null || value.trim().isEmpty) return '刚刚';
  final date = DateTime.tryParse(value);
  if (date == null) return value;
  final difference = DateTime.now().difference(date.toLocal());
  if (difference.isNegative || difference.inMinutes < 1) return '刚刚';
  if (difference.inMinutes < 60) return '${difference.inMinutes}分钟前';
  if (difference.inHours < 24) return '${difference.inHours}小时前';
  if (difference.inDays < 7) return '${difference.inDays}天前';
  final local = date.toLocal();
  return '${local.month}月${local.day}日';
}
