import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/design_tokens.dart';
import '../../core/network/api_client.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';
import 'learning_card_reader.dart';

class LearningInquiriesScreen extends ConsumerWidget {
  const LearningInquiriesScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inquiries = ref.watch(learningInquiriesProvider);
    return Scaffold(
      appBar: AppBar(
          title: const Text('我的答疑'),
          leading:
              const DebaoRouteBackButton(fallbackLocation: '/?tab=courses'),
          actions: [
            IconButton(
                tooltip: '刷新答疑',
                onPressed: () => ref.invalidate(learningInquiriesProvider),
                icon: const Icon(Icons.refresh))
          ]),
      body: inquiries.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(e is ApiError ? e.message : '答疑加载失败'),
          TextButton(
              onPressed: () => ref.invalidate(learningInquiriesProvider),
              child: const Text('重试')),
        ])),
        data: (items) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(learningInquiriesProvider);
            await ref.read(learningInquiriesProvider.future);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: items.isEmpty
                ? [
                    const Padding(
                        padding: EdgeInsets.only(top: 80),
                        child: Text('暂无答疑\n做题提交后，可在逐题解析中提交错因或疑问。',
                            textAlign: TextAlign.center)),
                  ]
                : items
                    .map((item) => Card(
                            child: ExpansionTile(
                          key: ValueKey('inquiry-${item.id}'),
                          initiallyExpanded: item.status == 'answered',
                          title: Text(item.question.stem,
                              maxLines: 2, overflow: TextOverflow.ellipsis),
                          subtitle: Text(item.status == 'answered'
                              ? '老师已回复 · ${item.teacherName ?? '答疑老师'}'
                              : '待老师回复'),
                          childrenPadding: const EdgeInsets.all(16),
                          expandedCrossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SelectableText(item.question.stem),
                            for (final option
                                in item.question.options.asMap().entries)
                              Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                      '${String.fromCharCode(65 + option.key)}. ${option.value}')),
                            const Divider(),
                            Text('我的错因 / 疑问',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            SelectableText(item.reason),
                            const SizedBox(height: 16),
                            if (item.reply != null) ...[
                              Text('${item.teacherName ?? '答疑老师'}的回复',
                                  style: const TextStyle(
                                      color: DebaoColors.brand,
                                      fontWeight: FontWeight.bold)),
                              SelectableText(item.reply!),
                            ] else
                              const Text('已提交，等待老师回复。'),
                          ],
                        )))
                    .toList(),
          ),
        ),
      ),
    );
  }
}

/// Reused by the report and question detail. An absent upload renders nothing.
class QuestionMicroLesson extends StatelessWidget {
  const QuestionMicroLesson({super.key, this.reference, this.type});
  final String? reference, type;
  @override
  Widget build(BuildContext context) {
    if (reference?.trim().isNotEmpty != true) return const SizedBox.shrink();
    return OutlinedButton.icon(
      key: const ValueKey('question-micro-lesson'),
      icon:
          Icon(type == 'video' ? Icons.play_circle_outline : Icons.headphones),
      label: Text(type == 'video' ? '播放视频微课' : '播放语音微课'),
      onPressed: () async {
        try {
          if (!await launchUrl(learningAssetUri(reference!)))
            throw StateError('open failed');
        } catch (_) {
          if (context.mounted)
            ScaffoldMessenger.of(context)
                .showSnackBar(const SnackBar(content: Text('微课打开失败，请稍后重试')));
        }
      },
    );
  }
}

class SubmitLearningInquiry extends ConsumerStatefulWidget {
  const SubmitLearningInquiry(
      {super.key, required this.reportId, required this.questionId});
  final String reportId, questionId;
  @override
  ConsumerState<SubmitLearningInquiry> createState() =>
      _SubmitLearningInquiryState();
}

class _SubmitLearningInquiryState extends ConsumerState<SubmitLearningInquiry> {
  final reason = TextEditingController();
  final requestId = 'inquiry-${DateTime.now().microsecondsSinceEpoch}';
  bool busy = false, sent = false;
  String? error;
  @override
  void dispose() {
    reason.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (busy || sent) return;
    if (reason.text.trim().length < 2) {
      setState(() => error = '请至少填写 2 个字的错因或疑问');
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(questionRepositoryProvider).submitInquiry(
          reportId: widget.reportId,
          questionId: widget.questionId,
          reason: reason.text.trim(),
          clientRequestId: requestId);
      ref.invalidate(learningInquiriesProvider);
      if (mounted)
        setState(() {
          sent = true;
          busy = false;
        });
    } catch (e) {
      if (mounted)
        setState(() {
          busy = false;
          error = e is ApiError ? e.message : '提交失败，请重试';
        });
    }
  }

  @override
  Widget build(BuildContext context) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('提交错因 / 向老师提问',
            style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (!sent) ...[
          TextField(
              controller: reason,
              enabled: !busy,
              minLines: 3,
              maxLines: 8,
              maxLength: 5000,
              key: const ValueKey('inquiry-reason'),
              decoration: const InputDecoration(
                  hintText: '写下你的思路、做错的原因或不理解的地方，答疑老师会回复。',
                  border: OutlineInputBorder())),
          if (error != null)
            Text(error!, style: const TextStyle(color: Colors.red)),
          FilledButton(
              onPressed: busy ? null : submit,
              child: Text(busy ? '提交中…' : '提交错因')),
        ] else
          const Text('已提交，老师回复后可在“我的答疑”中查看。'),
        TextButton(
            onPressed: () {
              ref.invalidate(learningInquiriesProvider);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const LearningInquiriesScreen()));
            },
            child: const Text('查看我的答疑')),
      ]);
}
