import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/features/commerce/commerce_detail_screens.dart';
import 'package:debao_flutter/features/courses/course_detail_screens.dart';

void main() {
  testWidgets('课程详情按章节进入视频播放器', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: CourseDetailScreen(courseId: 'c1'),
    ));

    expect(find.text('课程目录'), findsOneWidget);
    // The RC page opens the first chapter on initial render.
    expect(find.byKey(const ValueKey('course-lesson-l1')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('course-chapter-0')));
    await tester.pump();
    expect(find.byKey(const ValueKey('course-lesson-l1')), findsNothing);
    await tester.tap(find.byKey(const ValueKey('course-chapter-0')));
    await tester.pump();
    expect(find.byKey(const ValueKey('course-lesson-l1')), findsOneWidget);

    await tester.ensureVisible(find.byKey(const ValueKey('course-lesson-l1')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('course-lesson-l1')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('video-player-screen')), findsOneWidget);
    expect(find.byKey(const ValueKey('video-lesson-title')), findsOneWidget);
  });

  testWidgets('视频播放器支持播放、倍速、控件显隐和笔记', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: VideoPlayerScreen(courseId: 'c1'),
    ));

    expect(find.text('5:38 / 20:00'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('video-center-play')));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('5:39 / 20:00'), findsOneWidget);

    expect(find.byKey(const ValueKey('video-speed-button')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('video-speed-button')));
    await tester.pump();
    expect(find.byKey(const ValueKey('video-speed-menu')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('speed-option-1.5')));
    await tester.pump();
    expect(find.byKey(const ValueKey('video-speed-menu')), findsNothing);

    // Tap an uncovered part of the video surface so the controls toggle,
    // rather than activating the centered play button.
    await tester.tapAt(const Offset(700, 100));
    await tester.pump();
    expect(find.byKey(const ValueKey('video-center-play')), findsNothing);
    await tester.tapAt(const Offset(700, 100));
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('video-tab-_VideoTab.notes')));
    await tester.pump();
    await tester.enterText(
        find.byKey(const ValueKey('video-note-input')), '登记是物权变动的公示方法');
    await tester.tap(find.byKey(const ValueKey('video-note-save')));
    await tester.pump();
    expect(find.text('登记是物权变动的公示方法'), findsOneWidget);
  });

  testWidgets('商品详情大纲和评价保留 RC 的标签结构', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: ProductDetailScreen(
        name: '2024法考全程班（主客一体·视频精讲）',
        brief: '覆盖客观题和主观题',
        price: '3,980',
        originalPrice: '5,200',
        coverColor: Colors.indigo,
        icon: Icons.menu_book_outlined,
        productId: 'p1',
      ),
    ));
    await tester.pump();

    expect(find.text('4 项'), findsNothing);
    final list = find.byType(ListView).first;
    final syllabusTitle = find.text('民法总则与基本原则');
    for (var i = 0; i < 20 && syllabusTitle.evaluate().isEmpty; i++) {
      await tester.drag(list, const Offset(0, -700));
      await tester.pump();
    }
    expect(syllabusTitle, findsOneWidget);
    expect(find.text('18讲'), findsOneWidget);
    final reviewTag = find.text('全程班学员');
    for (var i = 0; i < 20 && reviewTag.evaluate().isEmpty; i++) {
      await tester.drag(list, const Offset(0, -700));
      await tester.pump();
    }
    expect(reviewTag, findsOneWidget);

    await tester.tap(find.text('立即购买'));
    await tester.pumpAndSettle();
    expect(find.text('视频课程'), findsOneWidget);
    expect(find.textContaining('如需发票'), findsOneWidget);
  });

  testWidgets('视频讲义展示 RC 的完整善意取得要件', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: VideoPlayerScreen(courseId: 'c1'),
    ));
    await tester.tap(find.byKey(const ValueKey('video-tab-_VideoTab.handout')));
    await tester.pump();

    expect(find.textContaining('未经登记，不发生效力，但是法律另有规定的除外'), findsOneWidget);
    expect(find.text('受让人受让该动产或不动产时是善意的'), findsOneWidget);
    expect(find.text('以合理的价格转让'), findsOneWidget);
    expect(find.textContaining('已经交付给受让人'), findsOneWidget);
  });

  testWidgets('音频播放器支持波形定位、逐字稿、循环和笔记', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: AudioPlayerScreen(courseId: 'c1'),
    ));

    expect(find.text('0:38'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('audio-play')));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('0:39'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('audio-skip-forward')));
    await tester.pump();
    expect(find.text('0:54'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('audio-loop')));
    await tester.pump();
    await tester
        .ensureVisible(find.byKey(const ValueKey('audio-transcript-40')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('audio-transcript-40')));
    await tester.pump();
    expect(
        tester.widget<Text>(find.byKey(const ValueKey('audio-elapsed'))).data,
        '0:40');

    await tester.tap(find.byKey(const ValueKey('audio-tab-_AudioTab.notes')));
    await tester.pump();
    await tester.enterText(
        find.byKey(const ValueKey('audio-note-input')), '重点回顾');
    await tester.tap(find.byKey(const ValueKey('audio-note-save')));
    await tester.pump();
    expect(find.text('重点回顾'), findsOneWidget);
  });

  testWidgets('直播页倒计时和预约状态可切换', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: LiveCourseScreen(courseId: 'c3', title: '刑法重点罪名串讲'),
    ));

    expect(find.text('刑法重点罪名串讲'), findsOneWidget);
    expect(find.byKey(const ValueKey('live-viewer-count')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('live-subscribe')));
    await tester.pump();
    expect(find.text('已预约开播提醒'), findsOneWidget);
    expect(find.textContaining('已预约 6,285 人'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('live-reserve-0')));
    await tester.pump();
    expect(find.text('已预约'), findsOneWidget);
  });

  testWidgets('订单详情按商品显示 RC 类型和封面', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: OrderDetailScreen(
        title: '法考直播冲刺班（考前30天）',
        amount: '¥680',
        productId: 'p4',
      ),
    ));

    expect(find.text('直播课程'), findsOneWidget);
    final image = tester.widget<Image>(find.byType(Image).first);
    expect((image.image as AssetImage).assetName,
        'assets/images/product-live.jpg');
  });

  testWidgets('媒体页面在 390x844 窄屏首屏不溢出', (tester) async {
    tester.view
      ..physicalSize = const Size(390, 844)
      ..devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const MaterialApp(
      home: VideoPlayerScreen(courseId: 'c1'),
    ));
    await tester.pump();
    expect(find.byKey(const ValueKey('video-player-screen')), findsOneWidget);
    expect(find.byKey(const ValueKey('video-center-play')), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.pumpWidget(const MaterialApp(
      home: AudioPlayerScreen(courseId: 'c1'),
    ));
    await tester.pump();
    expect(find.byKey(const ValueKey('audio-player-screen')), findsOneWidget);
    expect(find.byKey(const ValueKey('audio-waveform')), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.pumpWidget(const MaterialApp(
      home: LiveCourseScreen(courseId: 'c3'),
    ));
    await tester.pump();
    expect(find.byKey(const ValueKey('live-course-screen')), findsOneWidget);
    expect(find.byKey(const ValueKey('live-countdown')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
