import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/features/courses/course_detail_screens.dart';

void main() {
  const remoteCourse = Course(
    id: 'remote-1',
    title: '服务端民法课',
    teacher: '服务端讲师',
    type: 'video',
    progress: 27,
    lessons: 1,
    sections: [
      CourseSection(
        id: 'section-1',
        courseId: 'remote-1',
        title: '服务端章节',
        lessons: [
          CourseLesson(
            id: 'lesson-1',
            title: '服务端课时',
            mediaKind: 'video',
            durationSeconds: 90,
            current: true,
          ),
        ],
      ),
    ],
  );

  testWidgets('远端课程详情使用服务端目录且未授权不进入播放', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        courseProvider('remote-1').overrideWith((ref) async => remoteCourse),
        courseEntitlementProvider('remote-1').overrideWith(
            (ref) async => const CourseEntitlement(hasAccess: false)),
      ],
      child: const MaterialApp(
          home: CourseDetailScreen(courseId: 'remote-1', remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();

    expect(find.text('服务端民法课'), findsWidgets);
    expect(find.text('服务端章节'), findsOneWidget);
    expect(find.text('第一章 民法总则'), findsNothing);
    await tester
        .tap(find.byKey(const ValueKey('course-detail-primary-action')));
    await tester.pump();
    expect(find.byKey(const ValueKey('video-player-screen')), findsNothing);
    expect(find.text('请先购买课程'), findsOneWidget);
  });

  testWidgets('远端课程空详情显示缺失状态而不回退本地课程', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        courseProvider('missing').overrideWith((ref) async => null),
        courseEntitlementProvider('missing').overrideWith(
            (ref) async => const CourseEntitlement(hasAccess: false)),
      ],
      child: const MaterialApp(
          home: CourseDetailScreen(courseId: 'missing', remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();

    expect(find.text('课程不存在或已下架'), findsOneWidget);
    expect(find.text('民法精讲课（2024版）'), findsNothing);
  });

  testWidgets('远端课程授权后只提供真实媒体入口', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        courseProvider('remote-1').overrideWith((ref) async => remoteCourse),
        courseEntitlementProvider('remote-1').overrideWith(
            (ref) async => const CourseEntitlement(hasAccess: true)),
        mediaAvailabilityProvider('video:remote-1').overrideWith((ref) async =>
            const MediaAvailability(
                available: true, reason: '', url: 'https://cdn.example/video')),
      ],
      child: const MaterialApp(
          home: CourseDetailScreen(courseId: 'remote-1', remoteEnabled: true)),
    ));
    await tester.pumpAndSettle();
    await tester
        .tap(find.byKey(const ValueKey('course-detail-primary-action')));
    await tester.pumpAndSettle();
    expect(find.text('打开课程媒体'), findsOneWidget);
    expect(find.byKey(const ValueKey('video-player-screen')), findsNothing);
    expect(find.text('物权变动的生效要件：动产交付，不动产登记'), findsNothing);
  });

  testWidgets('远端课程没有章节时媒体页显示占位而不抛异常', (tester) async {
    const emptyCourse = Course(
      id: 'empty-course',
      title: '空目录课程',
      teacher: '服务端讲师',
      type: 'video',
      lessons: 0,
      sections: [],
    );
    await tester.pumpWidget(const MaterialApp(
      home: VideoPlayerScreen(
        courseId: 'empty-course',
        remoteCourse: emptyCourse,
        remoteEnabled: true,
        mediaResolved: true,
      ),
    ));
    await tester.pump();
    expect(find.text('尚未获取媒体授权'), findsOneWidget);
    expect(find.byKey(const ValueKey('video-player-screen')), findsNothing);
    expect(tester.takeException(), isNull);

    await tester.pumpWidget(const MaterialApp(
      home: AudioPlayerScreen(
        courseId: 'empty-course',
        remoteCourse: emptyCourse,
        remoteEnabled: true,
        mediaResolved: true,
      ),
    ));
    await tester.pump();
    expect(find.text('尚未获取媒体授权'), findsOneWidget);
    expect(find.byKey(const ValueKey('audio-player-screen')), findsNothing);
    expect(tester.takeException(), isNull);
  });
}
