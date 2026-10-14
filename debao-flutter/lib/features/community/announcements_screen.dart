import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';

const _brand = Color(0xFF4C4BEA);
const _page = Color(0xFFF4F5F7);
const _ink = Color(0xFF171925);
const _body = Color(0xFF5F6574);
const _muted = Color(0xFF707684);

const _localAnnouncements = <({String title, String body, String date})>[
  (
    title: '2024 年法律职业资格考试客观题考试时间公告',
    body: '根据司法部统一部署，考试时间定于 9 月 14 日、15 日举行。',
    date: '2026-08-20',
  ),
  (
    title: '得宝法考 2024 客观题冲刺班正式上线',
    body: '包含直播课程、历年真题精讲与考前模拟押题。',
    date: '2026-08-15',
  ),
  (
    title: '关于法律职业资格考试报名条件调整的说明',
    body: '请以官方最新规定为准。',
    date: '2026-08-10',
  ),
];

final _announcementsProvider = FutureProvider<List<JsonMap>>(
  (ref) => ref.watch(legalRepositoryProvider).announcements(),
);

class AnnouncementListScreen extends StatelessWidget {
  const AnnouncementListScreen({super.key, this.remoteEnabled = false});

  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _AnnouncementListBody(remoteEnabled: remoteEnabled),
      );
}

class _AnnouncementListBody extends ConsumerWidget {
  const _AnnouncementListBody({required this.remoteEnabled});

  final bool remoteEnabled;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = remoteEnabled
        ? ref.watch(_announcementsProvider)
        : const AsyncValue<List<JsonMap>>.data(<JsonMap>[]);

    return Scaffold(
      key: const ValueKey('announcement-list-screen'),
      backgroundColor: _page,
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: const Text('官方公告'),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
      ),
      body: remoteEnabled
          ? state.when(
              loading: () => const Center(
                child: CircularProgressIndicator(strokeWidth: 2.2),
              ),
              error: (error, _) => _AnnouncementError(
                error: error,
                onRetry: () => ref.invalidate(_announcementsProvider),
              ),
              data: (items) => items.isEmpty
                  ? const _AnnouncementEmpty()
                  : _remoteList(items, ref),
            )
          : _localList(),
    );
  }

  Widget _localList() => ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        itemCount: _localAnnouncements.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final item = _localAnnouncements[index];
          return _AnnouncementRow(
            title: item.title,
            body: item.body,
            date: item.date,
          );
        },
      );

  Widget _remoteList(List<JsonMap> items, WidgetRef ref) => RefreshIndicator(
        color: _brand,
        onRefresh: () async {
          ref.invalidate(_announcementsProvider);
          await ref.read(_announcementsProvider.future);
        },
        child: ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, index) {
            final item = items[index];
            return _AnnouncementRow(
              title: '${item['title'] ?? ''}',
              body: '${item['body'] ?? item['content'] ?? ''}',
              date: '${item['publishedAt'] ?? item['createdAt'] ?? ''}',
            );
          },
        ),
      );
}

class _AnnouncementRow extends StatelessWidget {
  const _AnnouncementRow({
    required this.title,
    required this.body,
    required this.date,
  });

  final String title;
  final String body;
  final String date;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: _ink,
                fontSize: 14,
                height: 1.45,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              body,
              style: const TextStyle(color: _body, fontSize: 12, height: 1.6),
            ),
            if (date.trim().isNotEmpty) ...[
              const SizedBox(height: 9),
              Text(
                _displayDate(date),
                style: const TextStyle(color: _muted, fontSize: 11),
              ),
            ],
          ],
        ),
      );
}

class _AnnouncementEmpty extends StatelessWidget {
  const _AnnouncementEmpty();

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.campaign_outlined, color: _muted, size: 34),
              SizedBox(height: 10),
              Text(
                '暂无官方公告',
                style: TextStyle(
                  color: _ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 5),
              Text(
                '新的公告发布后会显示在这里。',
                textAlign: TextAlign.center,
                style: TextStyle(color: _muted, fontSize: 12),
              ),
            ],
          ),
        ),
      );
}

class _AnnouncementError extends StatelessWidget {
  const _AnnouncementError({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_outlined, color: _muted, size: 34),
              const SizedBox(height: 10),
              const Text(
                '公告暂时无法加载',
                style: TextStyle(
                  color: _ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                error is ApiError ? (error as ApiError).message : '请检查网络后重试。',
                textAlign: TextAlign.center,
                style: const TextStyle(color: _muted, fontSize: 12),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 17),
                label: const Text('重新加载'),
              ),
            ],
          ),
        ),
      );
}

String _displayDate(String value) {
  final date = DateTime.tryParse(value)?.toLocal();
  if (date == null) return value;
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}
