import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/providers.dart';
import 'package:debao_flutter/features/courses/course_detail_screens.dart';

void main() {
  testWidgets('远端视频未配置时显示服务端原因且不渲染播放器', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        mediaAvailabilityProvider('video:c1').overrideWith((ref) async =>
            const MediaAvailability(
                available: false, reason: 'VIDEO_PROVIDER_NOT_CONFIGURED')),
      ],
      child: const MaterialApp(
        home: VideoPlayerScreen(courseId: 'c1', remoteEnabled: true),
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('媒体播放暂不可用'), findsOneWidget);
    expect(find.text('VIDEO_PROVIDER_NOT_CONFIGURED'), findsOneWidget);
    expect(find.byKey(const ValueKey('video-player-screen')), findsNothing);
    expect(find.byKey(const ValueKey('video-media-retry')), findsOneWidget);
  });

  testWidgets('远端音频重试成功后提供真实地址且不展示模拟播放器', (tester) async {
    var available = false;
    await tester.pumpWidget(ProviderScope(
      overrides: [
        mediaAvailabilityProvider('audio:c1').overrideWith((ref) async =>
            MediaAvailability(
                available: available,
                reason: available ? '' : 'AUDIO_PROVIDER_NOT_CONFIGURED',
                url: available ? 'https://cdn.example/audio' : null)),
      ],
      child: const MaterialApp(
        home: AudioPlayerScreen(courseId: 'c1', remoteEnabled: true),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.text('AUDIO_PROVIDER_NOT_CONFIGURED'), findsOneWidget);

    available = true;
    await tester.tap(find.byKey(const ValueKey('audio-media-retry')));
    await tester.pumpAndSettle();
    expect(find.text('已获取真实媒体授权'), findsOneWidget);
    expect(find.text('打开课程媒体'), findsOneWidget);
    expect(find.byKey(const ValueKey('audio-player-screen')), findsNothing);
    expect(find.text('民法典第208条：不动产登记生效'), findsNothing);
  });

  testWidgets('远端直播未配置时显示服务端原因且倒计时不继续运行', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [
        mediaAvailabilityProvider('live:c3').overrideWith((ref) async =>
            const MediaAvailability(
                available: false, reason: 'LIVE_PROVIDER_NOT_CONFIGURED')),
      ],
      child: const MaterialApp(
        home: LiveCourseScreen(
          courseId: 'c3',
          title: '远端直播课程',
          remoteEnabled: true,
        ),
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('媒体播放暂不可用'), findsOneWidget);
    expect(find.text('LIVE_PROVIDER_NOT_CONFIGURED'), findsOneWidget);
    expect(find.byKey(const ValueKey('live-course-screen')), findsNothing);
    expect(find.byKey(const ValueKey('live-media-retry')), findsOneWidget);
  });
}
