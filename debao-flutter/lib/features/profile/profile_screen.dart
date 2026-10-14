import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/design_tokens.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../commerce/commerce_detail_screens.dart';
import '../tools/study_tools_screens.dart';
import '../learning/learning_center_screens.dart';
import '../account/account_service_screens.dart';
import '../courses/courses_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, this.remoteEnabled = false});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => remoteEnabled
      ? const ProviderScope(child: _RemoteProfileBody())
      : const _ProfileContent(remoteEnabled: false);
}

class _RemoteProfileBody extends ConsumerWidget {
  const _RemoteProfileBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final courses = ref.watch(coursesProvider);
    final orders = ref.watch(ordersProvider);
    final report = ref.watch(learningReportProvider('week'));
    final mistakes = ref.watch(typedMistakesProvider);
    final states = [user, courses, orders, report, mistakes];
    if (states.any((state) => state.isLoading && !state.hasValue)) {
      return const _ProfileStatusScaffold(
          body: Center(
              child:
                  CircularProgressIndicator(key: ValueKey('profile-loading'))));
    }
    final failed = states.where((state) => state.hasError && !state.hasValue);
    if (failed.isNotEmpty) {
      final error = failed.first.error!;
      return _ProfileStatusScaffold(
          body: _ProfileErrorState(
        error: error,
        onRetry: () {
          ref.invalidate(currentUserProvider);
          ref.invalidate(coursesProvider);
          ref.invalidate(ordersProvider);
          ref.invalidate(learningReportProvider('week'));
          ref.invalidate(typedMistakesProvider);
        },
      ));
    }
    return _ProfileContent(
      remoteEnabled: true,
      user: user.valueOrNull,
      courses: courses.valueOrNull ?? const <Course>[],
      orders: orders.valueOrNull ?? const <Order>[],
      report: report.valueOrNull,
      mistakes: mistakes.valueOrNull ?? const <MistakeItem>[],
    );
  }
}

class _ProfileStatusScaffold extends StatelessWidget {
  const _ProfileStatusScaffold({required this.body});
  final Widget body;

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: DebaoColors.page,
        body: SafeArea(child: body),
      );
}

class _ProfileErrorState extends StatelessWidget {
  const _ProfileErrorState({required this.error, required this.onRetry});
  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined,
                color: DebaoColors.muted, size: 32),
            const SizedBox(height: 10),
            const Text('个人资料暂时无法加载',
                style: TextStyle(
                    color: DebaoColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text('$error',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(color: DebaoColors.muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('profile-retry'),
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重试')),
          ]),
        ),
      );
}

class _ProfileContent extends StatelessWidget {
  const _ProfileContent({
    required this.remoteEnabled,
    this.user,
    this.courses = const <Course>[],
    this.orders = const <Order>[],
    this.report,
    this.mistakes = const <MistakeItem>[],
  });
  final bool remoteEnabled;
  final UserProfile? user;
  final List<Course> courses;
  final List<Order> orders;
  final LearningReport? report;
  final List<MistakeItem> mistakes;

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: DebaoColors.page,
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(bottom: 20),
            children: [
              _header(context),
              _continueLearning(context),
              _stats(),
              _weekly(context),
              _Group(
                  '学习与内容',
                  [
                    _ProfileItem(Icons.event_note_outlined, '学习计划',
                        Color(0xFFF0F0FF), Color(0xFF4C4BEA)),
                    _ProfileItem(Icons.auto_awesome_outlined, '得恩私教',
                        Color(0xFFF0F0FF), Color(0xFF4C4BEA)),
                    _ProfileItem(Icons.description_outlined, '学习报告',
                        Color(0xFFEAF6EF), Color(0xFF3A7A46)),
                    _ProfileItem(Icons.menu_book_outlined, '做题记录',
                        Color(0xFFEDF5FF), Color(0xFF1A5FA8)),
                    _ProfileItem(Icons.error_outline, '错题本', Color(0xFFFFF1E8),
                        Color(0xFFD2691E)),
                    _ProfileItem(Icons.star_border, '收藏夹', Color(0xFFFFF5DD),
                        Color(0xFFA87000)),
                  ],
                  remoteEnabled: remoteEnabled),
              _Group(
                  '课程与服务',
                  [
                    _ProfileItem(Icons.play_circle_outline, '我的课程',
                        Color(0xFFF0F0FF), Color(0xFF4C4BEA)),
                    _ProfileItem(Icons.shopping_bag_outlined, '订单与已购',
                        Color(0xFFFFF0F5), Color(0xFFC0385A)),
                    _ProfileItem(Icons.edit_note_outlined, '批改服务',
                        Color(0xFFEAF7F7), Color(0xFF1A8B8B)),
                  ],
                  remoteEnabled: remoteEnabled),
              _Group(
                  '应用管理',
                  [
                    _ProfileItem(Icons.notifications_none, '消息通知',
                        Color(0xFFFFF5DD), Color(0xFFA87000)),
                    _ProfileItem(Icons.settings_outlined, '设置与隐私',
                        Color(0xFFF4F5F7), Color(0xFF707684)),
                  ],
                  remoteEnabled: remoteEnabled),
            ],
          ),
        ),
      );

  String get _displayName {
    if (!remoteEnabled) return '李明远';
    final name = user?.name.trim() ?? '';
    return name.isEmpty ? '未设置昵称' : name;
  }

  String get _avatarLabel {
    final name = _displayName;
    return name.isEmpty ? '?' : name.substring(0, 1);
  }

  String get _examSummary {
    if (!remoteEnabled) return '备考中 · 2024客观题';
    final year = user?.examYear?.trim() ?? '';
    return year.isEmpty ? '备考信息未设置' : '备考中 · ${year}客观题';
  }

  Course? get _continueCourse {
    if (!remoteEnabled || courses.isEmpty) return null;
    final sorted = [...courses]
      ..sort((a, b) => b.progress.compareTo(a.progress));
    return sorted.first;
  }

  double _progressFraction(double value) =>
      (value > 1 ? value / 100 : value).clamp(0, 1).toDouble();

  String _progressLabel(double value) =>
      '${(_progressFraction(value) * 100).round()}%';

  Color _accent(String? value) {
    if (value == null) return const Color(0xFF4C4BEA);
    final parsed = int.tryParse(value.replaceFirst('#', ''), radix: 16);
    return parsed == null
        ? const Color(0xFF4C4BEA)
        : Color(0xFF000000 | parsed);
  }

  Widget _header(BuildContext context) => Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
        child: Row(children: [
          Container(
            width: 52,
            height: 52,
            alignment: Alignment.center,
            decoration: BoxDecoration(
                color: _accent(user?.avatarColor), shape: BoxShape.circle),
            child: Text(_avatarLabel,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 19,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_displayName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: Color(0xFF171925),
                      fontSize: 17,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text(_examSummary,
                  style:
                      const TextStyle(color: Color(0xFF707684), fontSize: 12)),
            ]),
          ),
          OutlinedButton(
            onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) =>
                        UserProfileScreen(remoteEnabled: remoteEnabled))),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFE5E7ED)),
              foregroundColor: const Color(0xFF4C4BEA),
              minimumSize: const Size(76, 32),
            ),
            child: const Text('编辑资料', style: TextStyle(fontSize: 12)),
          ),
        ]),
      );

  Widget _continueLearning(BuildContext context) {
    final course = _continueCourse;
    if (remoteEnabled && course == null) {
      return _card(
          child: const Row(children: [
        Icon(Icons.menu_book_outlined, color: Color(0xFF707684), size: 28),
        SizedBox(width: 10),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('暂无已开通课程',
              style: TextStyle(
                  color: Color(0xFF171925),
                  fontSize: 13,
                  fontWeight: FontWeight.w600)),
          SizedBox(height: 3),
          Text('购买课程后，学习进度会显示在这里。',
              style: TextStyle(color: Color(0xFF707684), fontSize: 11)),
        ]))
      ]));
    }
    final title = course?.title ?? '民法精讲课（2024版）';
    final progress = course?.progress ?? 42;
    final teacher = course?.teacher ?? '张明远';
    return _card(
      child: Row(children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(5),
          child: Image.asset(
              course == null || course.type == 'video'
                  ? 'assets/images/course-civil-law.jpg'
                  : 'assets/images/course-subjective.jpg',
              width: 72,
              height: 48,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  const ColoredBox(color: Color(0xFFE1E5F4))),
        ),
        const SizedBox(width: 10),
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    color: Color(0xFF171925),
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 3),
            Text(
                remoteEnabled
                    ? '$teacher · ${_progressLabel(progress)}'
                    : '第18讲：物权变动的公示与公信原则',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Color(0xFF707684), fontSize: 11)),
            const SizedBox(height: 7),
            LinearProgressIndicator(
                value: _progressFraction(progress),
                minHeight: 4,
                backgroundColor: const Color(0xFFE5E7ED),
                valueColor: const AlwaysStoppedAnimation(Color(0xFF4C4BEA))),
          ]),
        ),
        const SizedBox(width: 10),
        FilledButton(
          onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => CoursesScreen(remoteEnabled: remoteEnabled))),
          style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFC9F456),
              foregroundColor: const Color(0xFF171925),
              minimumSize: const Size(56, 32),
              padding: EdgeInsets.zero),
          child: const Text('继续',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ]),
    );
  }

  Widget _stats() {
    if (!remoteEnabled) {
      return _card(
          child: const Row(children: [
        Expanded(child: _Stat('2', '已开课程')),
        Expanded(child: _Stat('4.2h', '本周学习')),
        Expanded(child: _Stat('42%', '当前进度')),
      ]));
    }
    final minutes = report?.minutes ?? 0;
    final double average = courses.isEmpty
        ? 0
        : courses
                .map((item) => _progressFraction(item.progress))
                .reduce((a, b) => a + b) /
            courses.length;
    return _card(
        child: Row(children: [
      Expanded(child: _Stat('${courses.length}', '已开课程')),
      Expanded(child: _Stat(_hoursLabel(minutes), '本周学习')),
      Expanded(child: _Stat(_progressLabel(average), '当前进度')),
    ]));
  }

  String _hoursLabel(int minutes) {
    if (minutes < 60) return '${minutes}m';
    final hours = minutes / 60;
    return '${hours.toStringAsFixed(hours == hours.roundToDouble() ? 0 : 1)}h';
  }

  Widget _weekly(BuildContext context) {
    final focus = remoteEnabled
        ? (report?.subjects.isNotEmpty == true
            ? report!.subjects
                // The weekly focus is the weakest subject, not the one with
                // the most study time. Keep the recommendation aligned with
                // the report's accuracy metric.
                .reduce((a, b) => a.correctRate <= b.correctRate ? a : b)
                .subjectId
            : '暂无重点学科')
        : '民事诉讼法';
    final mistakeLabel =
        remoteEnabled ? '待复习错题：${mistakes.length} 道' : '待复习错题：28 道';
    return _card(
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('本周重点',
                style: TextStyle(
                    color: Color(0xFF171925),
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 7),
            Text('当前薄弱学科：$focus',
                style: const TextStyle(color: Color(0xFF707684), fontSize: 12)),
            const SizedBox(height: 3),
            Text(mistakeLabel,
                style: const TextStyle(color: Color(0xFF707684), fontSize: 12)),
          ]),
        ),
        InkWell(
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) =>
                        LearningReportScreen(remoteEnabled: remoteEnabled))),
            child: const Text('查看报告 ›',
                style: TextStyle(color: Color(0xFF4C4BEA), fontSize: 12))),
      ]),
    );
  }

  Widget _card({required Widget child}) => Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: child,
      );
}

class _Stat extends StatelessWidget {
  const _Stat(this.value, this.label);
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) => Column(children: [
        Text(value,
            style: const TextStyle(
                color: Color(0xFF4C4BEA),
                fontSize: 19,
                fontWeight: FontWeight.w700)),
        const SizedBox(height: 5),
        Text(label,
            style: const TextStyle(color: Color(0xFF707684), fontSize: 11)),
      ]);
}

class _ProfileItem {
  const _ProfileItem(this.icon, this.label, this.background, this.color);
  final IconData icon;
  final String label;
  final Color background;
  final Color color;
}

class _Group extends StatelessWidget {
  const _Group(this.title, this.items, {required this.remoteEnabled});
  final String title;
  final List<_ProfileItem> items;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 6),
            child: Text(title,
                style: const TextStyle(color: Color(0xFF707684), fontSize: 12)),
          ),
          Container(
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(
              children: items.asMap().entries.map((entry) {
                final item = entry.value;
                return InkWell(
                  onTap: () {
                    final Widget? tool = switch (item.icon) {
                      Icons.event_note_outlined =>
                        LearningPlanScreen(remoteEnabled: remoteEnabled),
                      Icons.auto_awesome_outlined =>
                        LearningCenterScreen(remoteEnabled: remoteEnabled),
                      Icons.description_outlined =>
                        LearningReportScreen(remoteEnabled: remoteEnabled),
                      Icons.menu_book_outlined =>
                        QuestionRecordsScreen(remoteEnabled: remoteEnabled),
                      Icons.error_outline =>
                        MistakeBookScreen(remoteEnabled: remoteEnabled),
                      Icons.star_border =>
                        FavoritesScreen(remoteEnabled: remoteEnabled),
                      Icons.shopping_bag_outlined =>
                        OrderListScreen(remoteEnabled: remoteEnabled),
                      Icons.balance_outlined =>
                        LawSearchScreen(remoteEnabled: remoteEnabled),
                      Icons.edit_note_outlined =>
                        GradingServiceScreen(remoteEnabled: remoteEnabled),
                      Icons.notifications_none =>
                        NotificationsScreen(remoteEnabled: remoteEnabled),
                      Icons.settings_outlined =>
                        SettingsScreen(remoteEnabled: remoteEnabled),
                      Icons.play_circle_outline =>
                        CoursesScreen(remoteEnabled: remoteEnabled),
                      _ => null,
                    };
                    if (tool != null) {
                      Navigator.push(
                          context, MaterialPageRoute(builder: (_) => tool));
                      return;
                    }
                    if (item.label == '订单与已购') {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => OrderListScreen(
                                  remoteEnabled: remoteEnabled)));
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                        border: entry.key < items.length - 1
                            ? const Border(
                                bottom: BorderSide(color: Color(0xFFE5E7ED)))
                            : null),
                    child: Row(children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                            color: item.background,
                            borderRadius: BorderRadius.circular(8)),
                        child: Icon(item.icon, color: item.color, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Text(item.label,
                              style: const TextStyle(
                                  color: Color(0xFF171925), fontSize: 14))),
                      const Icon(Icons.chevron_right,
                          color: Color(0xFFC0C5D0), size: 19),
                    ]),
                  ),
                );
              }).toList(),
            ),
          ),
        ]),
      );
}
