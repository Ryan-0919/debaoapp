import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:polyv_live_scenes/polyv_live_scenes.dart';

import '../../core/design_tokens.dart';
import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../commerce/commerce_detail_screens.dart';
import '../../shared/route_back_button.dart';

const _brand = DebaoColors.brand;
const _page = DebaoColors.page;
const _ink = DebaoColors.ink;
const _body = DebaoColors.body;
const _muted = DebaoColors.muted;
const _line = DebaoColors.line;
const _headingStyle =
    TextStyle(color: _ink, fontSize: 14, fontWeight: FontWeight.w700);
const _paragraphStyle = TextStyle(color: _body, fontSize: 13, height: 1.65);
const _polyvAppId = String.fromEnvironment('POLYV_APP_ID');
const _polyvAppSecret = String.fromEnvironment('POLYV_APP_SECRET');
const _polyvAccountUserId = String.fromEnvironment('POLYV_USER_ID');

/// The RC has a stable, local course catalog.  Keeping this small catalog in
/// the screen lets the media pages remain useful in local/mock mode while the
/// repository-backed course list is unavailable.
class _CourseData {
  const _CourseData({
    required this.id,
    required this.name,
    required this.teacher,
    required this.progress,
    required this.completed,
    required this.total,
    required this.lastStudied,
    required this.currentLesson,
    required this.cover,
    required this.chapters,
  });

  final String id;
  final String name;
  final String teacher;
  final int progress;
  final int completed;
  final int total;
  final String lastStudied;
  final String currentLesson;
  final String cover;
  final List<_ChapterData> chapters;
}

class _ChapterData {
  const _ChapterData(this.title, this.lessons);
  final String title;
  final List<_LessonData> lessons;
}

class _LessonData {
  const _LessonData(this.id, this.title, this.duration,
      {this.done = false,
      this.current = false,
      this.mediaKind = 'video',
      this.liveSession});
  final String id;
  final String title;
  final String duration;
  final bool done;
  final bool current;
  final String mediaKind;
  final LiveSession? liveSession;
}

const _civilCourse = _CourseData(
  id: 'c1',
  name: '民法精讲课（2024版）',
  teacher: '张明远',
  progress: 42,
  completed: 28,
  total: 68,
  lastStudied: '昨天 21:30',
  currentLesson: '第18讲：物权变动的公示与公信原则',
  cover: 'assets/images/course-civil-law.jpg',
  chapters: [
    _ChapterData('第一章 民法总则', [
      _LessonData('l1', '第1讲：民法的性质与体系', '42:30', done: true),
      _LessonData('l2', '第2讲：民事法律关系', '38:15', done: true),
      _LessonData('l3', '第3讲：民事主体——自然人', '55:20', done: true),
      _LessonData('l4', '第4讲：民事主体——法人', '48:00', done: true),
    ]),
    _ChapterData('第二章 物权法', [
      _LessonData('l5', '第15讲：物权概述与分类', '44:10', done: true),
      _LessonData('l6', '第16讲：物权的效力', '39:45', done: true),
      _LessonData('l7', '第17讲：物权变动总论', '51:30', done: true),
      _LessonData('l8', '第18讲：物权变动的公示与公信原则', '58:00', current: true),
      _LessonData('l9', '第19讲：不动产登记', '46:20'),
      _LessonData('l10', '第20讲：动产交付', '35:00'),
    ]),
    _ChapterData('第三章 合同法', [
      _LessonData('l11', '第28讲：合同的成立', '52:15'),
      _LessonData('l12', '第29讲：合同的效力', '48:30'),
      _LessonData('l13', '第30讲：合同的履行', '44:00'),
    ]),
  ],
);

const _criminalCourse = _CourseData(
  id: 'c2',
  name: '刑法体系课（2024版）',
  teacher: '李东明',
  progress: 18,
  completed: 13,
  total: 72,
  lastStudied: '3天前',
  currentLesson: '第8讲：犯罪的未完成形态',
  cover: 'assets/images/course-criminal-law.png',
  chapters: [
    _ChapterData('第一章 刑法总论', [
      _LessonData('l20', '第1讲：刑法的概念与原则', '38:00', done: true),
      _LessonData('l21', '第2讲：犯罪构成理论', '62:30', done: true),
      _LessonData('l22', '第8讲：犯罪的未完成形态', '55:00', current: true),
    ]),
    _ChapterData('第二章 刑法分论', [
      _LessonData('l23', '第9讲：故意犯罪形态', '48:00'),
      _LessonData('l24', '第10讲：共同犯罪', '52:10'),
    ]),
  ],
);

_CourseData _courseFor(String id, String? title) {
  if (id == 'c2' || (title?.contains('刑法') ?? false)) return _criminalCourse;
  return _civilCourse;
}

String _lessonTitle(_CourseData course, String? lessonId, String? title) {
  if (title != null && title.trim().isNotEmpty) return title;
  final lessons = course.chapters.expand((chapter) => chapter.lessons);
  if (lessons.isEmpty) return '暂无可学习课时';
  return lessons
      .firstWhere((lesson) => lesson.id == lessonId,
          orElse: () => lessons.firstWhere((lesson) => lesson.current,
              orElse: () => lessons.first))
      .title;
}

String _coverFor(String title) {
  if (title.contains('刑法')) return _criminalCourse.cover;
  if (title.contains('主观')) return 'assets/images/course-subjective.jpg';
  return _civilCourse.cover;
}

String _durationText(int seconds) {
  if (seconds <= 0) return '--:--';
  final minutes = seconds ~/ 60;
  final remainder = seconds % 60;
  return '$minutes:${remainder.toString().padLeft(2, '0')}';
}

_CourseData _localCourseFromRemote(Course remote) {
  final sections = remote.sections
      .map((section) => _ChapterData(
            section.title,
            section.lessons
                .map((lesson) => _LessonData(
                      lesson.id,
                      lesson.title,
                      _durationText(lesson.durationSeconds),
                      done: lesson.done,
                      current: lesson.current,
                      mediaKind: lesson.mediaKind,
                      liveSession: lesson.liveSession,
                    ))
                .toList(growable: false),
          ))
      .toList(growable: false);
  final lessons = sections.expand((section) => section.lessons).toList();
  final total = remote.lessons > 0 ? remote.lessons : lessons.length;
  final progress = remote.progress.clamp(0, 100).round();
  final completed = lessons.isEmpty
      ? (progress / 100 * total).round()
      : lessons.where((lesson) => lesson.done).length;
  return _CourseData(
    id: remote.id,
    name: remote.title,
    teacher: remote.teacher,
    progress: progress,
    completed: completed.clamp(0, total),
    total: total,
    lastStudied: '最近学习',
    currentLesson: lessons
        .firstWhere((lesson) => lesson.current,
            orElse: () => lessons.isNotEmpty
                ? lessons.firstWhere((lesson) => !lesson.done,
                    orElse: () => lessons.first)
                : const _LessonData('', '暂无可学习课时', '--:--'))
        .title,
    cover: _coverFor(remote.title),
    chapters: sections,
  );
}

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({
    super.key,
    this.courseId = 'c1',
    this.title,
    this.audio = false,
    this.remoteEnabled = false,
    this.remoteCourse,
    this.remoteEntitlement,
    this.resolved = false,
  });

  final String courseId;
  final String? title;
  final bool audio;
  final bool remoteEnabled;
  final Course? remoteCourse;
  final CourseEntitlement? remoteEntitlement;
  final bool resolved;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  // RC opens the first chapter on initial render so the first lesson is
  // immediately discoverable without an extra tap.
  int openChapter = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled && !widget.resolved) {
      final id = widget.courseId.trim();
      if (id.isEmpty) return _courseStatusScaffold(const _CourseMissingState());
      return ProviderScope(
          child: _RemoteCourseDetailBody(courseId: id, audio: widget.audio));
    }

    final course = widget.remoteCourse == null
        ? _courseFor(widget.courseId, widget.title)
        : _localCourseFromRemote(widget.remoteCourse!);
    final title = widget.remoteCourse != null
        ? course.name
        : (widget.title?.trim().isNotEmpty == true
            ? widget.title!
            : course.name);
    final owned = widget.remoteEntitlement?.hasAccess ?? course.id == 'c1';
    final allLessons = course.chapters.expand((chapter) => chapter.lessons);
    final current = allLessons.isEmpty
        ? null
        : allLessons.firstWhere((lesson) => lesson.current,
            orElse: () => allLessons.firstWhere((lesson) => !lesson.done,
                orElse: () => allLessons.first));

    return Scaffold(
      key: const ValueKey('course-detail-screen'),
      backgroundColor: _page,
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: Text(title),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(_coverFor(title), fit: BoxFit.cover),
          ),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 17),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _Tag(widget.audio ? '音频课程' : '录播'),
                    const SizedBox(width: 8),
                    Text('${course.teacher}主讲',
                        style: const TextStyle(color: _muted, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(title,
                    style: const TextStyle(
                        color: _ink,
                        fontSize: 17,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(
                          value: course.progress / 100,
                          minHeight: 6,
                          backgroundColor: _line,
                          valueColor:
                              const AlwaysStoppedAnimation<Color>(_brand),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('${course.progress}%',
                        style: const TextStyle(
                            color: _brand,
                            fontSize: 13,
                            fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 9),
                Text(
                  '${course.completed}/${course.total} 课节 · 上次学习 ${course.lastStudied}',
                  style: const TextStyle(color: _muted, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            margin: const EdgeInsets.fromLTRB(16, 13, 16, 0),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: owned ? DebaoColors.brandLight : _page,
              borderRadius: BorderRadius.circular(8),
              border: owned ? null : Border.all(color: _line),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(owned ? '当前学习' : '尚未开通权限',
                          style: TextStyle(
                              color: owned ? _brand : _muted,
                              fontSize: 11,
                              fontWeight: FontWeight.w500)),
                      const SizedBox(height: 3),
                      Text(
                          owned ? (current?.title ?? '暂无可学习课时') : '购买课程后即可开始学习',
                          style: const TextStyle(
                              color: _ink,
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                SizedBox(
                  height: 36,
                  child: FilledButton.icon(
                    key: const ValueKey('course-detail-primary-action'),
                    onPressed: owned && current != null
                        ? () => _openLesson(context, course, current)
                        : owned
                            ? () => ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('暂无可学习课时')))
                            : () => _openProduct(context, course,
                                showHint: widget.remoteEnabled),
                    icon: Icon(
                        owned && current != null
                            ? Icons.play_arrow
                            : Icons.lock_outline,
                        size: 15),
                    label: Text(owned && current != null ? '继续' : '去购买'),
                    style: FilledButton.styleFrom(
                        backgroundColor: owned ? DebaoColors.action : _brand,
                        foregroundColor: owned ? _ink : Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Text('课程目录',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(
              children: course.chapters.isEmpty
                  ? const [
                      Padding(
                          padding: EdgeInsets.all(22),
                          child: Center(
                              child: Text('暂无课程目录',
                                  key: ValueKey('course-catalog-empty'),
                                  style:
                                      TextStyle(color: _muted, fontSize: 13))))
                    ]
                  : course.chapters.asMap().entries.map((entry) {
                      final chapterIndex = entry.key;
                      final chapter = entry.value;
                      final expanded = openChapter == chapterIndex;
                      final completed =
                          chapter.lessons.where((lesson) => lesson.done).length;
                      return Column(
                        children: [
                          InkWell(
                            key: ValueKey('course-chapter-$chapterIndex'),
                            onTap: () => setState(() =>
                                openChapter = expanded ? -1 : chapterIndex),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              decoration: const BoxDecoration(
                                  border:
                                      Border(bottom: BorderSide(color: _line))),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(chapter.title,
                                            style: const TextStyle(
                                                color: _ink,
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 3),
                                        Text(
                                            '$completed/${chapter.lessons.length} 课节',
                                            style: const TextStyle(
                                                color: _muted, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    expanded
                                        ? Icons.keyboard_arrow_up
                                        : Icons.keyboard_arrow_down,
                                    color: const Color(0xFFC0C5D0),
                                    size: 18,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (expanded)
                            ...chapter.lessons.map((lesson) => InkWell(
                                  key: ValueKey('course-lesson-${lesson.id}'),
                                  onTap: owned
                                      ? () =>
                                          _openLesson(context, course, lesson)
                                      : () => _openProduct(context, course,
                                          showHint: widget.remoteEnabled),
                                  child: Container(
                                    color: lesson.current
                                        ? DebaoColors.brandLight
                                        : Colors.white,
                                    padding: const EdgeInsets.fromLTRB(
                                        32, 11, 16, 11),
                                    child: Row(
                                      children: [
                                        Icon(
                                          lesson.done
                                              ? Icons.check_circle
                                              : lesson.current
                                                  ? Icons.play_circle
                                                  : Icons.circle_outlined,
                                          color: lesson.done
                                              ? DebaoColors.success
                                              : lesson.current
                                                  ? _brand
                                                  : const Color(0xFFC0C5D0),
                                          size: 17,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(lesson.title,
                                              style: TextStyle(
                                                  color: lesson.current
                                                      ? _brand
                                                      : lesson.done
                                                          ? _muted
                                                          : _body,
                                                  fontSize: 13,
                                                  fontWeight: lesson.current
                                                      ? FontWeight.w600
                                                      : FontWeight.w400)),
                                        ),
                                        Text(lesson.duration,
                                            style: const TextStyle(
                                                color: Color(0xFFC0C5D0),
                                                fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                )),
                        ],
                      );
                    }).toList(),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _openLesson(
      BuildContext context, _CourseData course, _LessonData lesson) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => lesson.mediaKind == 'live'
            ? LiveCourseScreen(
                courseId: course.id,
                title: lesson.title,
                session: lesson.liveSession,
                remoteEnabled: widget.remoteEnabled,
              )
            : widget.audio
                ? AudioPlayerScreen(
                    courseId: course.id,
                    lessonId: lesson.id,
                    title: lesson.title,
                    remoteEnabled: widget.remoteEnabled,
                    remoteCourse: widget.remoteCourse,
                  )
                : VideoPlayerScreen(
                    courseId: course.id,
                    lessonId: lesson.id,
                    title: lesson.title,
                    remoteEnabled: widget.remoteEnabled,
                    remoteCourse: widget.remoteCourse,
                  ),
      ),
    );
  }

  void _openProduct(BuildContext context, _CourseData course,
      {bool showHint = false}) {
    if (showHint) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('请先购买课程')));
    }
    final productId = course.id == 'c2' ? 'p1' : 'p2';
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetailScreen(
          name:
              productId == 'p1' ? '2024法考全程班（主客一体·视频精讲）' : '2024客观题精英班（视频+直播）',
          brief: productId == 'p1'
              ? '覆盖客观题全科+主观题冲刺，名师全程讲授，配套题库、模拟卷和主观题批改服务。'
              : '系统精讲客观题全科知识点，覆盖卷一卷二，配套章节练习和历年真题解析。',
          price: productId == 'p1' ? '3,980' : '1,980',
          originalPrice: productId == 'p1' ? '5,200' : '2,800',
          coverColor: _brand,
          icon: Icons.menu_book_outlined,
          productId: productId,
        ),
      ),
    );
  }
}

Widget _courseStatusScaffold(Widget body) => Scaffold(
      backgroundColor: _page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('课程详情'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0),
      body: body,
    );

class _CourseMissingState extends StatelessWidget {
  const _CourseMissingState();

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.menu_book_outlined, color: _muted, size: 34),
            SizedBox(height: 10),
            Text('课程不存在或已下架',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            SizedBox(height: 5),
            Text('请返回课程列表选择其他课程。',
                textAlign: TextAlign.center,
                style: TextStyle(color: _muted, fontSize: 12)),
          ]),
        ),
      );
}

class _RemoteCourseDetailBody extends ConsumerWidget {
  const _RemoteCourseDetailBody({required this.courseId, required this.audio});

  final String courseId;
  final bool audio;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final course = ref.watch(courseProvider(courseId));
    final entitlement = ref.watch(courseEntitlementProvider(courseId));
    final loading = (course.isLoading && !course.hasValue) ||
        (entitlement.isLoading && !entitlement.hasValue);
    if (loading) {
      return _courseStatusScaffold(const Center(
          child: CircularProgressIndicator(
              key: ValueKey('course-detail-loading'))));
    }
    if (course.hasError && !course.hasValue) {
      return _courseStatusScaffold(_CourseRemoteError(
        message: '课程详情暂不可用',
        error: course.error,
        onRetry: () {
          ref.invalidate(courseProvider(courseId));
          ref.invalidate(courseEntitlementProvider(courseId));
        },
      ));
    }
    if (entitlement.hasError && !entitlement.hasValue) {
      return _courseStatusScaffold(_CourseRemoteError(
        message: '课程权益暂不可用',
        error: entitlement.error,
        onRetry: () => ref.invalidate(courseEntitlementProvider(courseId)),
      ));
    }
    final value = course.valueOrNull;
    if (value == null ||
        value.id.trim().isEmpty ||
        value.title.trim().isEmpty) {
      return _courseStatusScaffold(const _CourseMissingState());
    }
    final access =
        entitlement.valueOrNull ?? const CourseEntitlement(hasAccess: false);
    return CourseDetailScreen(
      courseId: value.id,
      audio: audio,
      remoteEnabled: true,
      resolved: true,
      remoteCourse: value,
      remoteEntitlement: access,
    );
  }
}

class _CourseRemoteError extends StatelessWidget {
  const _CourseRemoteError({
    required this.message,
    required this.error,
    required this.onRetry,
  });

  final String message;
  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, color: _muted, size: 32),
            const SizedBox(height: 10),
            Text(message,
                style: const TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 5),
            Text('$error',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(color: _muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('course-detail-retry'),
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 15),
                label: const Text('重试')),
          ]),
        ),
      );
}

/// Resolves a server-side media authorization before rendering a media page.
///
/// The media provider is intentionally separate from the native player. This
/// keeps the UI honest when a CDN/signing provider is configured but the
/// platform playback SDK is still unavailable.
class _RemoteMediaBody extends ConsumerWidget {
  const _RemoteMediaBody({
    required this.courseId,
    required this.kind,
    required this.pageTitle,
    required this.retryKey,
    required this.builder,
    this.dark = false,
  });

  final String courseId;
  final String kind;
  final String pageTitle;
  final String retryKey;
  final bool dark;
  final Widget Function(MediaAvailability media) builder;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providerKey = mediaAvailabilityKey(courseId, kind);
    final remote = ref.watch(mediaAvailabilityProvider(providerKey));
    if (remote.isLoading && !remote.hasValue) {
      return _mediaStatusScaffold(
        pageTitle,
        dark,
        Center(
            child:
                CircularProgressIndicator(key: ValueKey('$retryKey-loading'))),
      );
    }
    if (remote.hasError && !remote.hasValue) {
      return _mediaErrorScaffold(
        pageTitle: pageTitle,
        dark: dark,
        message: '媒体服务暂不可用',
        detail: '${remote.error}',
        retryKey: retryKey,
        onRetry: () => ref.invalidate(mediaAvailabilityProvider(providerKey)),
      );
    }
    final media = remote.valueOrNull;
    if (media == null || !media.available) {
      return _mediaErrorScaffold(
        pageTitle: pageTitle,
        dark: dark,
        message: '媒体播放暂不可用',
        detail: (media?.reason.trim().isNotEmpty ?? false)
            ? media!.reason
            : '服务端未返回播放授权，请稍后重试',
        retryKey: retryKey,
        onRetry: () => ref.invalidate(mediaAvailabilityProvider(providerKey)),
      );
    }
    return builder(media);
  }
}

Widget _mediaStatusScaffold(String title, bool dark, Widget body) => Scaffold(
      backgroundColor: dark ? const Color(0xFF0A0A0F) : _page,
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: Text(title),
        foregroundColor: dark ? Colors.white : _ink,
        backgroundColor: dark ? const Color(0xFF0A0A0F) : Colors.white,
        surfaceTintColor: dark ? Colors.transparent : Colors.white,
        elevation: 0,
      ),
      body: body,
    );

Widget _mediaErrorScaffold({
  required String pageTitle,
  required bool dark,
  required String message,
  required String detail,
  required String retryKey,
  required VoidCallback onRetry,
}) =>
    _mediaStatusScaffold(
      pageTitle,
      dark,
      Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.cloud_off_outlined,
                color: dark ? Colors.white54 : _muted, size: 34),
            const SizedBox(height: 10),
            Text(message,
                style: TextStyle(
                    color: dark ? Colors.white : _ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(detail,
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: dark ? Colors.white60 : _muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              key: ValueKey(retryKey),
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 15),
              label: const Text('重试'),
            ),
          ]),
        ),
      ),
    );

Widget _mediaAuthorizedNotice({required bool dark, required String? url}) =>
    Container(
      key: const ValueKey('media-authorized-notice'),
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: dark ? const Color(0xFF202030) : DebaoColors.brandLight,
      child: Row(
        children: [
          Icon(Icons.verified_outlined,
              size: 15, color: dark ? Colors.white70 : _brand),
          const SizedBox(width: 7),
          Expanded(
            child: Text(
              url?.trim().isNotEmpty == true
                  ? '服务端已返回播放授权，原生播放器 SDK 待配置'
                  : '服务端已确认媒体可用，原生播放器 SDK 待配置',
              style: TextStyle(
                  color: dark ? Colors.white70 : _body,
                  fontSize: 11,
                  height: 1.35),
            ),
          ),
        ],
      ),
    );

class _Tag extends StatelessWidget {
  const _Tag(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration:
            BoxDecoration(color: _page, borderRadius: BorderRadius.circular(4)),
        child: Text(text, style: const TextStyle(color: _muted, fontSize: 11)),
      );
}

enum _VideoTab { catalog, handout, notes }

class VideoPlayerScreen extends StatefulWidget {
  const VideoPlayerScreen({
    super.key,
    this.courseId = 'c1',
    this.lessonId,
    this.title,
    this.remoteCourse,
    this.remoteEnabled = false,
    this.mediaAvailability,
    this.mediaResolved = false,
  });

  final String courseId;
  final String? lessonId;
  final String? title;
  final Course? remoteCourse;
  final bool remoteEnabled;
  final MediaAvailability? mediaAvailability;
  final bool mediaResolved;

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerState();
}

class _VideoPlayerState extends State<VideoPlayerScreen> {
  static const totalSeconds = 1200;
  static const speeds = <double>[0.75, 1, 1.25, 1.5, 1.75, 2];
  static const initialNotes = <({String timestamp, String text})>[
    (timestamp: '05:32', text: '物权变动的生效要件：动产交付，不动产登记'),
    (timestamp: '12:14', text: '善意取得的三个构成要件：无权处分、受让人善意、已交付或登记'),
  ];

  bool playing = false;
  int elapsed = 338;
  double speed = 1;
  bool showSpeed = false;
  bool showControls = true;
  _VideoTab tab = _VideoTab.catalog;
  int openChapter = 0;
  String noteInput = '';
  final notes = <({String timestamp, String text})>[...initialNotes];
  Timer? timer;

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  _CourseData get course => widget.remoteCourse == null
      ? _courseFor(widget.courseId, widget.title)
      : _localCourseFromRemote(widget.remoteCourse!);
  List<_LessonData> get lessons =>
      course.chapters.expand((chapter) => chapter.lessons).toList();
  _LessonData get currentLesson => lessons.firstWhere(
        (lesson) => lesson.id == widget.lessonId,
        orElse: () => lessons.firstWhere((lesson) => lesson.current,
            orElse: () => lessons.isEmpty
                ? const _LessonData('', '暂无可学习课时', '--:--')
                : lessons.first),
      );

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled && !widget.mediaResolved) {
      return ProviderScope(
        child: _RemoteMediaBody(
          courseId: widget.courseId,
          kind: 'video',
          pageTitle: '视频课程',
          retryKey: 'video-media-retry',
          builder: (media) => VideoPlayerScreen(
            courseId: widget.courseId,
            lessonId: widget.lessonId,
            title: widget.title,
            remoteCourse: widget.remoteCourse,
            remoteEnabled: true,
            mediaAvailability: media,
            mediaResolved: true,
          ),
        ),
      );
    }
    final title = _lessonTitle(course, widget.lessonId, widget.title);
    return Scaffold(
      key: const ValueKey('video-player-screen'),
      backgroundColor: _page,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            SizedBox(
              key: const ValueKey('video-surface'),
              height: 219,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: GestureDetector(
                      onTap: () => setState(() {
                        showControls = !showControls;
                        showSpeed = false;
                      }),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.asset(course.cover, fit: BoxFit.cover),
                          const ColoredBox(color: Color(0x660A0A0F)),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 8,
                    top: 8,
                    child: IconButton(
                      key: const ValueKey('video-back'),
                      onPressed: () => debaoPopOrFallback(context),
                      icon: const Icon(Icons.chevron_left,
                          color: Colors.white, size: 23),
                    ),
                  ),
                  Positioned(
                    right: 12,
                    top: 12,
                    child: Row(
                      children: [
                        _OverlayButton(
                          key: const ValueKey('video-speed-button'),
                          label: speed == 1 ? '倍速' : '${speed}x',
                          onTap: () {
                            setState(() => showSpeed = !showSpeed);
                          },
                        ),
                        const SizedBox(width: 8),
                        _OverlayIconButton(
                            icon: Icons.settings_outlined,
                            label: '播放设置',
                            onTap: () =>
                                _showUnavailable(context, '播放设置暂在本地演示模式中不可用')),
                        const SizedBox(width: 8),
                        _OverlayIconButton(
                            icon: Icons.fullscreen,
                            label: '全屏播放',
                            onTap: () =>
                                _showUnavailable(context, '全屏播放将在原生播放器中启用')),
                      ],
                    ),
                  ),
                  if (showControls)
                    Center(
                      child: IconButton(
                        key: const ValueKey('video-center-play'),
                        onPressed: _togglePlaying,
                        icon: Icon(
                            playing
                                ? Icons.pause_circle_filled
                                : Icons.play_circle_fill,
                            color: Colors.white,
                            size: 58),
                      ),
                    ),
                  if (showControls)
                    Positioned(
                      left: 12,
                      right: 12,
                      bottom: 8,
                      child: Column(
                        children: [
                          Slider(
                            key: const ValueKey('video-progress'),
                            value: elapsed / totalSeconds,
                            onChanged: (value) => setState(() => elapsed =
                                (value * totalSeconds)
                                    .round()
                                    .clamp(0, totalSeconds)
                                    .toInt()),
                            activeColor: DebaoColors.action,
                            inactiveColor: Colors.white38,
                            thumbColor: Colors.white,
                          ),
                          Row(
                            children: [
                              IconButton(
                                key: const ValueKey('video-skip-back'),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => _moveBy(-10),
                                icon: const Icon(Icons.replay_10,
                                    color: Colors.white, size: 18),
                              ),
                              const SizedBox(width: 10),
                              IconButton(
                                key: const ValueKey('video-bottom-play'),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: _togglePlaying,
                                icon: Icon(
                                    playing ? Icons.pause : Icons.play_arrow,
                                    color: Colors.white,
                                    size: 20),
                              ),
                              const SizedBox(width: 10),
                              IconButton(
                                key: const ValueKey('video-skip-forward'),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => _moveBy(10),
                                icon: const Icon(Icons.forward_10,
                                    color: Colors.white, size: 18),
                              ),
                              const SizedBox(width: 8),
                              Text('${_formatTime(elapsed)} / 20:00',
                                  key: const ValueKey('video-time'),
                                  style: const TextStyle(
                                      color: Colors.white70, fontSize: 11)),
                              const Spacer(),
                              IconButton(
                                key: const ValueKey('video-download'),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () =>
                                    _showUnavailable(context, '视频下载需要媒体服务配置'),
                                icon: const Icon(Icons.download_outlined,
                                    color: Colors.white, size: 17),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  if (showSpeed)
                    Positioned(
                      top: 44,
                      right: 12,
                      child: _InlineSpeedMenu(
                        key: const ValueKey('video-speed-menu'),
                        value: speed,
                        options: speeds,
                        dark: true,
                        onChanged: (value) => setState(() {
                          speed = value;
                          showSpeed = false;
                        }),
                      ),
                    ),
                ],
              ),
            ),
            if (widget.remoteEnabled && widget.mediaAvailability != null)
              _mediaAuthorizedNotice(
                  dark: false, url: widget.mediaAvailability!.url),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 11, 16, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      key: const ValueKey('video-lesson-title'),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: _ink,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 3),
                  Text('${course.teacher}主讲 · ${course.name}',
                      style: const TextStyle(color: _muted, fontSize: 11)),
                ],
              ),
            ),
            _PlayerTabs<_VideoTab>(
              tabs: const [
                (_VideoTab.catalog, '目录'),
                (_VideoTab.handout, '讲义'),
                (_VideoTab.notes, '笔记'),
              ],
              selected: tab,
              onChanged: (value) => setState(() {
                tab = value;
                showSpeed = false;
              }),
              keyPrefix: 'video-tab',
            ),
            Expanded(child: _videoContent()),
          ],
        ),
      ),
    );
  }

  Widget _videoContent() {
    switch (tab) {
      case _VideoTab.catalog:
        return ListView(
          key: const ValueKey('video-catalog'),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          children: course.chapters.asMap().entries.map((entry) {
            final chapterIndex = entry.key;
            final chapter = entry.value;
            final expanded = openChapter == chapterIndex;
            final complete =
                chapter.lessons.where((lesson) => lesson.done).length;
            return Column(
              children: [
                InkWell(
                  key: ValueKey('video-chapter-$chapterIndex'),
                  onTap: () => setState(
                      () => openChapter = expanded ? -1 : chapterIndex),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(chapter.title,
                                  style: const TextStyle(
                                      color: _ink,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600)),
                              const SizedBox(height: 3),
                              Text('$complete/${chapter.lessons.length} 课节',
                                  style: const TextStyle(
                                      color: _muted, fontSize: 11)),
                            ],
                          ),
                        ),
                        Icon(expanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down),
                      ],
                    ),
                  ),
                ),
                if (expanded)
                  ...chapter.lessons.map((lesson) => InkWell(
                        key: ValueKey('video-lesson-${lesson.id}'),
                        onTap: () => _selectLesson(lesson),
                        child: Container(
                          color: lesson.id == currentLesson.id
                              ? DebaoColors.brandLight
                              : Colors.white,
                          padding: const EdgeInsets.fromLTRB(8, 11, 8, 11),
                          child: Row(
                            children: [
                              Icon(
                                lesson.done
                                    ? Icons.check_circle
                                    : lesson.id == currentLesson.id
                                        ? Icons.play_circle
                                        : Icons.circle_outlined,
                                color: lesson.done
                                    ? DebaoColors.success
                                    : lesson.id == currentLesson.id
                                        ? _brand
                                        : const Color(0xFFC0C5D0),
                                size: 17,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(lesson.title,
                                    style: TextStyle(
                                        color: lesson.id == currentLesson.id
                                            ? _brand
                                            : lesson.done
                                                ? _muted
                                                : _body,
                                        fontSize: 13,
                                        fontWeight:
                                            lesson.id == currentLesson.id
                                                ? FontWeight.w600
                                                : FontWeight.w400)),
                              ),
                              Text(lesson.duration,
                                  style: const TextStyle(
                                      color: Color(0xFFC0C5D0), fontSize: 11)),
                            ],
                          ),
                        ),
                      )),
                const Divider(height: 1, color: _line),
              ],
            );
          }).toList(),
        );
      case _VideoTab.handout:
        return ListView(
          key: const ValueKey('video-handout'),
          padding: const EdgeInsets.all(16),
          children: [
            _InfoPanel(
              title: '讲义 · 第3章：物权变动',
              icon: Icons.menu_book_outlined,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('一、物权变动的概念', style: _headingStyle),
                  SizedBox(height: 8),
                  Text(
                      '物权变动是指物权的产生、变更和消灭。按照《民法典》第208条，不动产物权的设立、变更、转让和消灭，经依法登记，发生效力；未经登记，不发生效力，但是法律另有规定的除外。',
                      style: _paragraphStyle),
                  SizedBox(height: 14),
                  Text('二、动产物权变动', style: _headingStyle),
                  SizedBox(height: 8),
                  Text('动产物权的设立和转让，自交付时发生效力，但是法律另有规定的除外。',
                      style: _paragraphStyle),
                  SizedBox(height: 10),
                  DecoratedBox(
                    decoration: BoxDecoration(
                        color: DebaoColors.brandLight,
                        borderRadius: BorderRadius.all(Radius.circular(6))),
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Text('重点记忆\n动产：交付生效 / 不动产：登记生效',
                          style: TextStyle(
                              color: _brand, fontSize: 12, height: 1.5)),
                    ),
                  ),
                  SizedBox(height: 14),
                  Text('三、善意取得', style: _headingStyle),
                  SizedBox(height: 8),
                  Text('无处分权人将动产或不动产转让给受让人，符合下列情形的，受让人取得该动产或不动产的所有权：',
                      style: _paragraphStyle),
                  SizedBox(height: 8),
                  ...[
                    '受让人受让该动产或不动产时是善意的',
                    '以合理的价格转让',
                    '转让的动产或不动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人',
                  ].asMap().entries.map((entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 16,
                              height: 16,
                              margin: const EdgeInsets.only(top: 2),
                              alignment: Alignment.center,
                              decoration: const BoxDecoration(
                                  color: _brand, shape: BoxShape.circle),
                              child: Text('${entry.key + 1}',
                                  style: const TextStyle(
                                      color: Colors.white, fontSize: 10)),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                                child:
                                    Text(entry.value, style: _paragraphStyle)),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              key: const ValueKey('video-handout-download'),
              onPressed: () => _showUnavailable(context, '讲义下载需要文件服务配置'),
              icon: const Icon(Icons.download_outlined, size: 15),
              label: const Text('下载讲义 PDF'),
            ),
          ],
        );
      case _VideoTab.notes:
        return ListView(
          key: const ValueKey('video-notes'),
          padding: const EdgeInsets.all(16),
          children: [
            _NoteEditor(
              time: _formatTime(elapsed),
              value: noteInput,
              onChanged: (value) => setState(() => noteInput = value),
              onSave: noteInput.trim().isEmpty
                  ? null
                  : () => setState(() {
                        notes.insert(0, (
                          timestamp: _formatTime(elapsed),
                          text: noteInput.trim()
                        ));
                        noteInput = '';
                      }),
              inputKey: const ValueKey('video-note-input'),
              saveKey: const ValueKey('video-note-save'),
            ),
            const SizedBox(height: 10),
            if (notes.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 28),
                child: Center(
                    child: Text('暂无笔记',
                        style: TextStyle(color: _muted, fontSize: 13))),
              )
            else
              ...notes.asMap().entries.map((entry) => Container(
                    key: ValueKey('video-note-${entry.key}'),
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(entry.value.timestamp,
                              style: const TextStyle(
                                  color: _brand,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(entry.value.text,
                              style: const TextStyle(
                                  color: _body, fontSize: 13, height: 1.45)),
                        ]),
                  )),
          ],
        );
    }
  }

  void _selectLesson(_LessonData lesson) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => VideoPlayerScreen(
            courseId: course.id,
            lessonId: lesson.id,
            title: lesson.title,
            remoteEnabled: widget.remoteEnabled,
            remoteCourse: widget.remoteCourse,
            mediaAvailability: widget.mediaAvailability,
            mediaResolved: widget.mediaResolved),
      ),
    );
  }

  void _togglePlaying() {
    setState(() => playing = !playing);
    if (playing) {
      timer?.cancel();
      timer =
          Timer.periodic(Duration(milliseconds: (1000 / speed).round()), (_) {
        if (!mounted) return;
        setState(() {
          if (elapsed >= totalSeconds) {
            elapsed = totalSeconds;
            playing = false;
            timer?.cancel();
          } else {
            elapsed += 1;
          }
        });
      });
    } else {
      timer?.cancel();
    }
  }

  void _moveBy(int amount) => setState(
      () => elapsed = (elapsed + amount).clamp(0, totalSeconds).toInt());
}

enum _AudioTab { transcript, notes, catalog }

class _TranscriptSegment {
  const _TranscriptSegment(this.timestamp, this.text);
  final int timestamp;
  final String text;
}

class AudioPlayerScreen extends StatefulWidget {
  const AudioPlayerScreen({
    super.key,
    this.courseId = 'c1',
    this.lessonId,
    this.title,
    this.remoteCourse,
    this.remoteEnabled = false,
    this.mediaAvailability,
    this.mediaResolved = false,
  });

  final String courseId;
  final String? lessonId;
  final String? title;
  final Course? remoteCourse;
  final bool remoteEnabled;
  final MediaAvailability? mediaAvailability;
  final bool mediaResolved;

  @override
  State<AudioPlayerScreen> createState() => _AudioPlayerState();
}

class _AudioPlayerState extends State<AudioPlayerScreen> {
  static const totalSeconds = 720;
  static const speeds = <double>[0.75, 1, 1.25, 1.5, 1.75, 2];
  static const transcript = <_TranscriptSegment>[
    _TranscriptSegment(0, '同学们好，今天我们学习物权法中一个非常重要的概念——物权变动。'),
    _TranscriptSegment(12, '物权变动，就是物权的产生、变更和消灭。听起来抽象，但实际上你每天都在经历它。'),
    _TranscriptSegment(26, '比如你买了一支笔，那支笔所有权就发生了变动，从卖家转移到你。'),
    _TranscriptSegment(40, '民法典第208条明确规定：不动产物权的变动，以登记为生效要件。'),
    _TranscriptSegment(58, '这意味着，哪怕你签了合同、付了钱，只要没办理过户登记，法律上你还不是房子的主人。'),
    _TranscriptSegment(75, '这和我们的生活直觉不一样，所以很多同学在这里出错。记住：不动产=登记。'),
    _TranscriptSegment(92, '动产就简单多了，动产物权自交付时发生效力。给你了，就是你的。'),
    _TranscriptSegment(108, '接下来我们讲善意取得制度，这是客观题的高频考点。'),
    _TranscriptSegment(124, '善意取得的三个要件：无权处分、受让人善意、已完成交付或登记。'),
  ];

  bool playing = false;
  int elapsed = 38;
  double speed = 1;
  bool showSpeed = false;
  bool loop = false;
  _AudioTab tab = _AudioTab.transcript;
  String noteInput = '';
  final notes = <({String timestamp, String text})>[
    (timestamp: '00:40', text: '民法典第208条：不动产登记生效'),
    (timestamp: '02:04', text: '善意取得三要件：无权处分、善意、交付/登记'),
  ];
  Timer? timer;

  _CourseData get course => widget.remoteCourse == null
      ? _courseFor(widget.courseId, widget.title)
      : _localCourseFromRemote(widget.remoteCourse!);
  List<_LessonData> get lessons =>
      course.chapters.expand((chapter) => chapter.lessons).toList();
  _LessonData get currentLesson => lessons.firstWhere(
        (lesson) => lesson.id == widget.lessonId,
        orElse: () => lessons.firstWhere((lesson) => lesson.current,
            orElse: () => lessons.isEmpty
                ? const _LessonData('', '暂无可学习课时', '--:--')
                : lessons.first),
      );

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled && !widget.mediaResolved) {
      return ProviderScope(
        child: _RemoteMediaBody(
          courseId: widget.courseId,
          kind: 'audio',
          pageTitle: '音频课程',
          retryKey: 'audio-media-retry',
          builder: (media) => AudioPlayerScreen(
            courseId: widget.courseId,
            lessonId: widget.lessonId,
            title: widget.title,
            remoteCourse: widget.remoteCourse,
            remoteEnabled: true,
            mediaAvailability: media,
            mediaResolved: true,
          ),
        ),
      );
    }
    return Scaffold(
      key: const ValueKey('audio-player-screen'),
      backgroundColor: _page,
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: const Text('音频课程'),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          IconButton(
              key: const ValueKey('audio-share'),
              tooltip: '分享音频',
              onPressed: () => _showUnavailable(context, '分享功能将在登录后启用'),
              icon: const Icon(Icons.share_outlined, size: 18)),
          IconButton(
              key: const ValueKey('audio-download'),
              tooltip: '下载音频',
              onPressed: () => _showUnavailable(context, '音频下载需要媒体服务配置'),
              icon: const Icon(Icons.download_outlined, size: 18)),
        ],
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                    color: Color(0x0C000000),
                    blurRadius: 5,
                    offset: Offset(0, 1))
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.asset(course.cover,
                              width: 80, height: 80, fit: BoxFit.cover),
                        ),
                        if (playing)
                          Positioned(
                            right: -5,
                            bottom: -5,
                            child: Container(
                              key: const ValueKey('audio-playing-badge'),
                              width: 22,
                              height: 22,
                              decoration: const BoxDecoration(
                                  color: _brand, shape: BoxShape.circle),
                              child: const Icon(Icons.equalizer,
                                  color: Colors.white, size: 14),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                              _lessonTitle(
                                  course, widget.lessonId, widget.title),
                              key: const ValueKey('audio-lesson-title'),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: _ink,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text('${course.teacher}主讲',
                              style:
                                  const TextStyle(color: _muted, fontSize: 12)),
                          const SizedBox(height: 1),
                          Text(course.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: Color(0xFFC0C5D0), fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _Waveform(
                  key: const ValueKey('audio-waveform'),
                  elapsed: elapsed,
                  total: totalSeconds,
                  onSeek: (value) => setState(() => elapsed = value),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_formatTime(elapsed),
                        key: const ValueKey('audio-elapsed'),
                        style: const TextStyle(color: _muted, fontSize: 11)),
                    const Text('12:00',
                        style: TextStyle(color: _muted, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Semantics(
                      button: true,
                      label: '循环播放',
                      selected: loop,
                      child: IconButton(
                        key: const ValueKey('audio-loop'),
                        tooltip: '循环播放',
                        color: loop ? _brand : const Color(0xFFC0C5D0),
                        onPressed: () => setState(() => loop = !loop),
                        icon: const Icon(Icons.repeat, size: 19),
                      ),
                    ),
                    _SkipButton(
                        key: const ValueKey('audio-skip-back'),
                        icon: Icons.replay_10,
                        label: '15s',
                        onTap: () => _moveBy(-15)),
                    IconButton(
                      key: const ValueKey('audio-play'),
                      onPressed: _togglePlaying,
                      icon: Icon(
                          playing
                              ? Icons.pause_circle_filled
                              : Icons.play_circle_fill,
                          color: _brand,
                          size: 58),
                    ),
                    _SkipButton(
                        key: const ValueKey('audio-skip-forward'),
                        icon: Icons.forward_10,
                        label: '15s',
                        onTap: () => _moveBy(15)),
                    IconButton(
                      key: const ValueKey('audio-speed-button'),
                      tooltip: '播放倍速',
                      onPressed: () => setState(() => showSpeed = !showSpeed),
                      icon: Container(
                        width: 42,
                        height: 34,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                            color: _page,
                            borderRadius: BorderRadius.circular(7)),
                        child: Text('${speed}x',
                            style: const TextStyle(
                                color: _body,
                                fontSize: 11,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
                if (showSpeed)
                  _InlineSpeedMenu(
                    key: const ValueKey('audio-speed-menu'),
                    value: speed,
                    options: speeds,
                    onChanged: (value) => setState(() {
                      speed = value;
                      showSpeed = false;
                    }),
                  ),
              ],
            ),
          ),
          if (widget.remoteEnabled && widget.mediaAvailability != null)
            _mediaAuthorizedNotice(
                dark: false, url: widget.mediaAvailability!.url),
          const SizedBox(height: 12),
          _AudioTabs(
            selected: tab,
            onChanged: (value) => setState(() {
              tab = value;
              showSpeed = false;
            }),
          ),
          Expanded(child: _audioContent()),
        ],
      ),
    );
  }

  Widget _audioContent() {
    switch (tab) {
      case _AudioTab.transcript:
        final currentIndex = transcript
            .lastIndexWhere((segment) => segment.timestamp <= elapsed);
        return SingleChildScrollView(
          key: const ValueKey('audio-transcript'),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            children: transcript.asMap().entries.map((entry) {
              final segment = entry.value;
              final selected = entry.key == currentIndex;
              return InkWell(
                key: ValueKey('audio-transcript-${segment.timestamp}'),
                onTap: () => setState(() => elapsed = segment.timestamp),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  decoration: BoxDecoration(
                      color: selected ? DebaoColors.brandLight : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: selected
                          ? const Border(
                              left: BorderSide(color: _brand, width: 2))
                          : null),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_formatTime(segment.timestamp),
                          style: TextStyle(
                              color:
                                  selected ? _brand : const Color(0xFFC0C5D0),
                              fontSize: 11,
                              fontWeight: FontWeight.w500)),
                      const SizedBox(height: 3),
                      Text(segment.text,
                          style: TextStyle(
                              color: selected ? _ink : _body,
                              fontSize: 13,
                              height: 1.5,
                              fontWeight: selected
                                  ? FontWeight.w500
                                  : FontWeight.w400)),
                    ],
                  ),
                ),
              );
            }).toList(growable: false),
          ),
        );
      case _AudioTab.notes:
        return ListView(
          key: const ValueKey('audio-notes'),
          padding: const EdgeInsets.all(16),
          children: [
            _NoteEditor(
              time: _formatTime(elapsed),
              value: noteInput,
              onChanged: (value) => setState(() => noteInput = value),
              onSave: noteInput.trim().isEmpty
                  ? null
                  : () => setState(() {
                        notes.insert(0, (
                          timestamp: _formatTime(elapsed),
                          text: noteInput.trim()
                        ));
                        noteInput = '';
                      }),
              inputKey: const ValueKey('audio-note-input'),
              saveKey: const ValueKey('audio-note-save'),
            ),
            const SizedBox(height: 10),
            if (notes.isEmpty)
              const Padding(
                  padding: EdgeInsets.only(top: 28),
                  child: Center(
                      child: Text('暂无笔记',
                          style: TextStyle(color: _muted, fontSize: 13))))
            else
              ...notes.asMap().entries.map((entry) => Container(
                    key: ValueKey('audio-note-${entry.key}'),
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(entry.value.timestamp,
                              style: const TextStyle(
                                  color: _brand,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(entry.value.text,
                              style: const TextStyle(
                                  color: _body, fontSize: 13, height: 1.45)),
                        ]),
                  )),
          ],
        );
      case _AudioTab.catalog:
        return ListView(
          key: const ValueKey('audio-catalog'),
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: lessons.asMap().entries.map((entry) {
            final lesson = entry.value;
            final selected = lesson.id == currentLesson.id;
            return InkWell(
              key: ValueKey('audio-lesson-${lesson.id}'),
              onTap: () => Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => AudioPlayerScreen(
                        courseId: course.id,
                        lessonId: lesson.id,
                        title: lesson.title,
                        remoteEnabled: widget.remoteEnabled,
                        remoteCourse: widget.remoteCourse,
                        mediaAvailability: widget.mediaAvailability,
                        mediaResolved: widget.mediaResolved)),
              ),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 13),
                decoration: BoxDecoration(
                    color: selected ? DebaoColors.brandLight : Colors.white,
                    border: const Border(
                        bottom: BorderSide(color: _line, width: .5))),
                child: Row(
                  children: [
                    SizedBox(
                        width: 24,
                        child: Text('${entry.key + 1}',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                                color:
                                    selected ? _brand : const Color(0xFFC0C5D0),
                                fontSize: 11,
                                fontWeight: selected
                                    ? FontWeight.w600
                                    : FontWeight.w400))),
                    const SizedBox(width: 10),
                    Expanded(
                        child: Text(lesson.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: selected
                                    ? _brand
                                    : lesson.done
                                        ? _muted
                                        : _body,
                                fontSize: 13,
                                fontWeight: selected
                                    ? FontWeight.w600
                                    : FontWeight.w400))),
                    Text(lesson.duration,
                        style: const TextStyle(
                            color: Color(0xFFC0C5D0), fontSize: 11)),
                    if (selected && playing)
                      const Padding(
                          padding: EdgeInsets.only(left: 8),
                          child:
                              Icon(Icons.equalizer, color: _brand, size: 16)),
                  ],
                ),
              ),
            );
          }).toList(),
        );
    }
  }

  void _togglePlaying() {
    setState(() => playing = !playing);
    if (playing) {
      timer?.cancel();
      timer =
          Timer.periodic(Duration(milliseconds: (1000 / speed).round()), (_) {
        if (!mounted) return;
        setState(() {
          if (elapsed >= totalSeconds) {
            if (loop) {
              elapsed = 0;
            } else {
              elapsed = totalSeconds;
              playing = false;
              timer?.cancel();
            }
          } else {
            elapsed += 1;
          }
        });
      });
    } else {
      timer?.cancel();
    }
  }

  void _moveBy(int amount) => setState(
      () => elapsed = (elapsed + amount).clamp(0, totalSeconds).toInt());
}

class LiveCourseScreen extends StatefulWidget {
  const LiveCourseScreen({
    super.key,
    this.courseId = 'c3',
    this.title,
    this.session,
    this.remoteEnabled = false,
    this.mediaAvailability,
    this.mediaResolved = false,
  });

  final String courseId;
  final String? title;
  final LiveSession? session;
  final bool remoteEnabled;
  final MediaAvailability? mediaAvailability;
  final bool mediaResolved;

  @override
  State<LiveCourseScreen> createState() => _LiveCourseScreenState();
}

class _LiveCourseStateItem {
  const _LiveCourseStateItem(this.time, this.title, this.teacher, this.viewers);
  final String time;
  final String title;
  final String teacher;
  final String viewers;
}

class _LiveCourseScreenState extends State<LiveCourseScreen> {
  static const schedule = <_LiveCourseStateItem>[
    _LiveCourseStateItem('14:30', '民法精讲第19讲：用益物权', '张明远', '1,842'),
    _LiveCourseStateItem('16:00', '刑法体系第8讲：共同犯罪', '李东明', '2,137'),
    _LiveCourseStateItem('19:30', '主观题写作技巧专题', '王晓峰', '986'),
  ];

  Timer? timer;
  int seconds = 4 * 3600 + 28 * 60 + 17;
  bool reserved = false;
  bool joining = false;
  final reservedSchedule = <int>{};

  String get title => widget.session?.title.trim().isNotEmpty == true
      ? widget.session!.title
      : widget.title?.trim().isNotEmpty == true
          ? widget.title!
          : '民法精讲第18讲：物权变动的公示与公信原则';

  @override
  void initState() {
    super.initState();
    if (widget.remoteEnabled && !widget.mediaResolved) return;
    if (widget.session != null) {
      final session = widget.session!;
      seconds = session.status == 'scheduled'
          ? session.startsAt.difference(DateTime.now()).inSeconds.clamp(
                0,
                24 * 3600,
              )
          : 0;
    }
    _startCountdown();
  }

  void _startCountdown() {
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => seconds = seconds > 0 ? seconds - 1 : 0);
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled && !widget.mediaResolved) {
      return ProviderScope(
        child: _RemoteMediaBody(
          courseId: widget.courseId,
          kind: 'live',
          pageTitle: '直播课程',
          retryKey: 'live-media-retry',
          dark: true,
          builder: (media) => LiveCourseScreen(
            courseId: widget.courseId,
            title: widget.title,
            session: widget.session,
            remoteEnabled: true,
            mediaAvailability: media,
            mediaResolved: true,
          ),
        ),
      );
    }
    final h = (seconds ~/ 3600).toString().padLeft(2, '0');
    final m = ((seconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    final count = 6284 + (reserved ? 1 : 0);
    final session = widget.session;
    final sessionStatus = session?.status ?? 'scheduled';
    final sessionTime = session == null
        ? '2026年08月27日 19:00 正式开播'
        : '${_formatLiveDate(session.startsAt)} 正式开播';
    final scheduleItems = session == null
        ? schedule
        : [
            _LiveCourseStateItem(
              _formatLiveTime(session.startsAt),
              session.title,
              session.teacher,
              '课程权限内',
            ),
          ];
    return Scaffold(
      key: const ValueKey('live-course-screen'),
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: const Text('即将直播'),
        foregroundColor: Colors.white,
        backgroundColor: const Color(0xFF0A0A0F),
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
              key: const ValueKey('live-share'),
              tooltip: '分享直播',
              onPressed: () => _showUnavailable(context, '分享功能将在登录后启用'),
              icon: const Icon(Icons.share_outlined, size: 18)),
        ],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 184,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Opacity(
                    opacity: .2,
                    child: Image.asset(_civilCourse.cover, fit: BoxFit.cover)),
                const ColoredBox(color: Color(0x520A0A0F)),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                          color: DebaoColors.error,
                          borderRadius: BorderRadius.circular(14)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.circle, color: Colors.white, size: 6),
                          SizedBox(width: 6),
                          Text(
                              sessionStatus == 'live'
                                  ? '直播中'
                                  : sessionStatus == 'completed'
                                      ? '已结束'
                                      : '距开播',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                        sessionStatus == 'live'
                            ? '正在直播'
                            : sessionStatus == 'completed'
                                ? '回放可用'
                                : '$h:$m:$s',
                        key: const ValueKey('live-countdown'),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 38,
                            fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(sessionTime,
                        style: TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          Container(
            color: const Color(0xFF12121F),
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    key: const ValueKey('live-course-title'),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        height: 1.4,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const CircleAvatar(
                        radius: 14,
                        backgroundColor: _brand,
                        child: Text('张',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700))),
                    const SizedBox(width: 10),
                    Text('${session?.teacher ?? '张明远'}老师',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                    const Spacer(),
                    const Icon(Icons.people_outline,
                        color: Color(0xFFC0C5D0), size: 14),
                    const SizedBox(width: 5),
                    Text(
                        '已预约 ${count.toString().replaceAllMapped(RegExp(r'(?<=\d)(?=(\d{3})+$)'), (_) => ',')} 人',
                        key: const ValueKey('live-viewer-count'),
                        style: const TextStyle(
                            color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          if (widget.remoteEnabled && widget.mediaAvailability != null)
            _mediaAuthorizedNotice(
                dark: true, url: widget.mediaAvailability!.url),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
              children: [
                const Text('今日直播安排',
                    style: TextStyle(color: Colors.white60, fontSize: 13)),
                const SizedBox(height: 10),
                ...scheduleItems.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  final active = reservedSchedule.contains(index);
                  return Container(
                    key: ValueKey('live-schedule-$index'),
                    height: 66,
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                        color: const Color(0xFF12121F),
                        borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        Text(item.time,
                            style: const TextStyle(
                                color: DebaoColors.action,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600)),
                              const SizedBox(height: 3),
                              Text('${item.teacher} · 预约 ${item.viewers}',
                                  style: const TextStyle(
                                      color: Colors.white54, fontSize: 11)),
                            ],
                          ),
                        ),
                        TextButton(
                          key: ValueKey('live-reserve-$index'),
                          onPressed: () => setState(() => active
                              ? reservedSchedule.remove(index)
                              : reservedSchedule.add(index)),
                          child: Text(active ? '已预约' : '预约',
                              style: const TextStyle(
                                  color: Color(0xFF8887F5), fontSize: 11)),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          if (session != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: SizedBox(
                width: double.infinity,
                height: 46,
                child: FilledButton.icon(
                  key: const ValueKey('live-enter-room'),
                  onPressed: joining ? null : _enterLiveRoom,
                  icon: joining
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : Icon(sessionStatus == 'completed'
                          ? Icons.replay
                          : Icons.play_arrow),
                  label: Text(joining
                      ? '正在进入…'
                      : sessionStatus == 'completed'
                          ? '观看回放'
                          : '进入直播间'),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                key: const ValueKey('live-subscribe'),
                onPressed: () => setState(() => reserved = !reserved),
                icon: Icon(reserved
                    ? Icons.notifications_active
                    : Icons.notifications_none),
                label: Text(reserved ? '已预约开播提醒' : '预约开播提醒'),
                style: FilledButton.styleFrom(
                    backgroundColor:
                        reserved ? const Color(0xFF3A7A46) : DebaoColors.brand),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _enterLiveRoom() async {
    final session = widget.session;
    if (session == null) return;
    if (_polyvAppId.isEmpty ||
        _polyvAppSecret.isEmpty ||
        _polyvAccountUserId.isEmpty) {
      _showUnavailable(context, '客户端未配置保利威参数，请用 dart-define 启动');
      return;
    }
    setState(() => joining = true);
    try {
      final repository =
          ProviderScope.containerOf(context).read(courseRepositoryProvider);
      final mode = session.status == 'completed' ? 'replay' : 'live';
      final authorization =
          await repository.joinLiveSession(session.id, mode: mode);
      if (authorization.provider != 'polyv' ||
          authorization.channelId.isEmpty) {
        throw const ApiError('LIVE_PROVIDER_INVALID', '直播平台返回信息不完整');
      }
      await PolyvLiveScenes().loginLiveRoom(
        channelType: 0,
        channelId: authorization.channelId,
        userId: _polyvAccountUserId,
        appId: _polyvAppId,
        appSecret: _polyvAppSecret,
        viewerName: '得宝学员',
      );
    } on PlatformException catch (error) {
      if (mounted) {
        _showUnavailable(context, error.message ?? '保利威直播间打开失败');
      }
    } on ApiError catch (error) {
      if (mounted) _showUnavailable(context, error.message);
    } catch (_) {
      if (mounted) _showUnavailable(context, '直播间暂时无法打开，请稍后重试');
    } finally {
      if (mounted) setState(() => joining = false);
    }
  }

  String _formatLiveTime(DateTime value) =>
      '${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';

  String _formatLiveDate(DateTime value) =>
      '${value.year}年${value.month.toString().padLeft(2, '0')}月${value.day.toString().padLeft(2, '0')}日 ${_formatLiveTime(value)}';
}

class _OverlayButton extends StatelessWidget {
  const _OverlayButton({super.key, required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () {
          onTap();
        },
        child: Container(
          height: 28,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
              color: const Color(0x66000000),
              borderRadius: BorderRadius.circular(4)),
          child: Text(label,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w600)),
        ),
      );
}

class _OverlayIconButton extends StatelessWidget {
  const _OverlayIconButton(
      {required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Semantics(
        label: label,
        button: true,
        child: InkWell(
          onTap: onTap,
          child: CircleAvatar(
              radius: 14,
              backgroundColor: const Color(0x66000000),
              child: Icon(icon, color: Colors.white, size: 15)),
        ),
      );
}

class _InlineSpeedMenu extends StatelessWidget {
  const _InlineSpeedMenu({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
    this.dark = false,
  });
  final double value;
  final List<double> options;
  final ValueChanged<double> onChanged;
  final bool dark;
  @override
  Widget build(BuildContext context) => Container(
        width: dark ? 96 : null,
        margin: dark ? EdgeInsets.zero : const EdgeInsets.only(top: 6),
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
            color: dark ? const Color(0xF21A1A2E) : Colors.white,
            border: dark ? null : Border.all(color: _line),
            borderRadius: BorderRadius.circular(8)),
        child: dark
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: options
                    .map((option) => _speedOption(option))
                    .toList(growable: false),
              )
            : Wrap(
                alignment: WrapAlignment.end,
                spacing: 4,
                children: options
                    .map((option) => _speedOption(option))
                    .toList(growable: false),
              ),
      );

  Widget _speedOption(double option) => InkWell(
        key: ValueKey('speed-option-$option'),
        onTap: () => onChanged(option),
        child: Container(
          width: dark ? double.infinity : null,
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
          decoration: BoxDecoration(
              color: value == option
                  ? (dark
                      ? Colors.white.withValues(alpha: .1)
                      : DebaoColors.brandLight)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(5)),
          child: Text(option == 1 ? '正常' : '${option}x',
              style: TextStyle(
                  color: dark
                      ? (value == option ? DebaoColors.action : Colors.white)
                      : (value == option ? _brand : _body),
                  fontSize: 11,
                  fontWeight:
                      value == option ? FontWeight.w600 : FontWeight.w400)),
        ),
      );
}

class _PlayerTabs<T> extends StatelessWidget {
  const _PlayerTabs({
    super.key,
    required this.tabs,
    required this.selected,
    required this.onChanged,
    required this.keyPrefix,
  });
  final List<(T, String)> tabs;
  final T selected;
  final ValueChanged<T> onChanged;
  final String keyPrefix;
  @override
  Widget build(BuildContext context) => Container(
        height: 42,
        color: Colors.white,
        child: Row(
          children: tabs
              .map((entry) => Expanded(
                    child: InkWell(
                      key: ValueKey<String>(
                          keyPrefix + '-' + entry.$1.toString()),
                      onTap: () => onChanged(entry.$1),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text(entry.$2,
                              style: TextStyle(
                                  fontSize: 13,
                                  color: selected == entry.$1 ? _brand : _muted,
                                  fontWeight: selected == entry.$1
                                      ? FontWeight.w600
                                      : FontWeight.w400)),
                          const SizedBox(height: 7),
                          Container(
                              width: 32,
                              height: 2,
                              color: selected == entry.$1
                                  ? _brand
                                  : Colors.transparent),
                        ],
                      ),
                    ),
                  ))
              .toList(),
        ),
      );
}

/// Audio uses the filled segmented tab treatment from the RC player, while
/// video keeps the simpler underline tabs above. Keeping this separate avoids
/// coupling the two players' visual contracts.
class _AudioTabs extends StatelessWidget {
  const _AudioTabs({required this.selected, required this.onChanged});

  final _AudioTab selected;
  final ValueChanged<_AudioTab> onChanged;

  static const _items = <(_AudioTab, String, IconData)>[
    (_AudioTab.transcript, '字幕', Icons.menu_book_outlined),
    (_AudioTab.notes, '笔记', Icons.edit_note_outlined),
    (_AudioTab.catalog, '目录', Icons.list_alt_outlined),
  ];

  @override
  Widget build(BuildContext context) => Container(
        key: const ValueKey('audio-tabs'),
        height: 42,
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: _line),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: _items
              .map((entry) => Expanded(
                    child: InkWell(
                      key: ValueKey('audio-tab-${entry.$1}'),
                      borderRadius: BorderRadius.circular(8),
                      onTap: () => onChanged(entry.$1),
                      child: Container(
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: selected == entry.$1
                              ? _brand
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(entry.$3,
                                size: 13,
                                color: selected == entry.$1
                                    ? Colors.white
                                    : _muted),
                            const SizedBox(width: 4),
                            Text(entry.$2,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: selected == entry.$1
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                  color: selected == entry.$1
                                      ? Colors.white
                                      : _muted,
                                )),
                          ],
                        ),
                      ),
                    ),
                  ))
              .toList(growable: false),
        ),
      );
}

class _Waveform extends StatelessWidget {
  const _Waveform({
    super.key,
    required this.elapsed,
    required this.total,
    required this.onSeek,
  });
  final int elapsed;
  final int total;
  final ValueChanged<int> onSeek;
  @override
  Widget build(BuildContext context) {
    const count = 48;
    return LayoutBuilder(
      builder: (context, constraints) => GestureDetector(
        onTapDown: (details) {
          final width = constraints.maxWidth <= 0 ? 1 : constraints.maxWidth;
          onSeek((details.localPosition.dx / width * total)
              .round()
              .clamp(0, total)
              .toInt());
        },
        child: SizedBox(
          key: const ValueKey('audio-waveform-bars'),
          height: 40,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(count, (index) {
              final height = 8 + ((index * 17) % 28);
              final active = index < (elapsed / total * count).round();
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: .7),
                  child: FractionallySizedBox(
                    heightFactor: (height / 40).clamp(.2, 1).toDouble(),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                          color: active ? _brand : _line,
                          borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _SkipButton extends StatelessWidget {
  const _SkipButton(
      {super.key,
      required this.icon,
      required this.label,
      required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 44,
          height: 48,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: _body, size: 22),
              Text(label,
                  style:
                      const TextStyle(color: Color(0xFFC0C5D0), fontSize: 9)),
            ],
          ),
        ),
      );
}

class _NoteEditor extends StatefulWidget {
  const _NoteEditor({
    required this.time,
    required this.value,
    required this.onChanged,
    required this.onSave,
    required this.inputKey,
    required this.saveKey,
  });
  final String time;
  final String value;
  final ValueChanged<String> onChanged;
  final VoidCallback? onSave;
  final Key inputKey;
  final Key saveKey;

  @override
  State<_NoteEditor> createState() => _NoteEditorState();
}

class _NoteEditorState extends State<_NoteEditor> {
  late final TextEditingController controller;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(covariant _NoteEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != controller.text && widget.value.isEmpty) {
      controller.clear();
    }
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.edit_note_outlined, color: _brand, size: 15),
                const SizedBox(width: 5),
                Text(widget.time,
                    style: const TextStyle(
                        color: _brand,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ],
            ),
            TextField(
              key: widget.inputKey,
              controller: controller,
              onChanged: widget.onChanged,
              minLines: 2,
              maxLines: 4,
              decoration: const InputDecoration(
                  hintText: '记下这个时间点的重点...',
                  border: InputBorder.none,
                  isDense: true),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton(
                key: widget.saveKey,
                onPressed: widget.onSave,
                style: FilledButton.styleFrom(
                    minimumSize: const Size(58, 32),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    backgroundColor: _brand),
                child: const Text('保存', style: TextStyle(fontSize: 12)),
              ),
            ),
          ],
        ),
      );
}

class _InfoPanel extends StatelessWidget {
  const _InfoPanel(
      {required this.title, required this.icon, required this.child});
  final String title;
  final IconData icon;
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: const BoxDecoration(
                  color: _brand,
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(8),
                      topRight: Radius.circular(8))),
              child: Row(
                children: [
                  Icon(icon, color: Colors.white, size: 16),
                  const SizedBox(width: 7),
                  Text(title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            Padding(padding: const EdgeInsets.all(14), child: child),
          ],
        ),
      );
}

String _formatTime(int seconds) {
  final minutes = seconds ~/ 60;
  final remainder = seconds % 60;
  return '$minutes:${remainder.toString().padLeft(2, '0')}';
}

void _showUnavailable(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}
