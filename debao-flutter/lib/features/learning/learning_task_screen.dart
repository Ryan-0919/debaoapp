import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/design_tokens.dart';
import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';
import '../questions/objective_answer_screen.dart';
import 'learning_card_deck.dart';

class LearningTaskScreen extends ConsumerStatefulWidget {
  const LearningTaskScreen({super.key, required this.task});
  final LearningTask task;
  @override
  ConsumerState<LearningTaskScreen> createState() => _LearningTaskScreenState();
}

class _LearningTaskScreenState extends ConsumerState<LearningTaskScreen> {
  late Future<LearningTask> current;
  final answers = <String, TextEditingController>{};
  bool busy = false;
  bool finished = false;
  String? error;
  Map<int, String> recallRatings = {};

  @override
  void initState() {
    super.initState();
    current = _load();
  }

  Future<LearningTask> _load() async {
    // Recheck on entry so a stale list or deep link cannot bypass prerequisites.
    final tasks = await ref.read(courseRepositoryProvider).tasks();
    return tasks.firstWhere((item) => item.id == widget.task.id,
        orElse: () =>
            throw const ApiError('TASK_NOT_FOUND', '学习任务不存在或已调整，请刷新计划'));
  }

  @override
  void dispose() {
    for (final controller in answers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _finish(LearningTask task,
      {LearningSubjectiveQuestion? question, int? cardVersion}) async {
    if (busy || finished || task.locked || task.status == 'done') return;
    final payload = <JsonMap>[];
    if (question != null) {
      for (final sub in question.subQuestions) {
        final value = answers[sub.id]?.text.trim() ?? '';
        if (value.isEmpty) {
          setState(() => error = '请完成每个小问后再提交');
          return;
        }
        payload.add({'subQuestionId': sub.id, 'text': value});
      }
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final repository = ref.read(courseRepositoryProvider);
      final result = question != null
          ? await repository.submitSubjectiveTask(task.id, payload)
          : task.contentType == 'course'
              ? await repository.checkInTask(task.id)
              : await repository.completeTask(task.id,
                  cardVersion: cardVersion, recallRatings: recallRatings);
      if (result.status != 'done')
        throw const ApiError('INVALID_RESPONSE', '任务尚未完成，请重试');
      if (!mounted) return;
      ref.invalidate(learningTasksProvider);
      ref.invalidate(learningReportProvider);
      setState(() {
        finished = true;
        busy = false;
      });
    } catch (e) {
      if (mounted)
        setState(() {
          busy = false;
          error = e is ApiError ? e.message : '提交失败，请检查网络后重试';
        });
    }
  }

  Widget _page(LearningTask task, Widget child) => Scaffold(
        backgroundColor: DebaoColors.page,
        appBar: AppBar(
            title: Text(task.title),
            leading: const DebaoRouteBackButton(fallbackLocation: '/learning')),
        body: child,
      );

  Widget _notice(String text, {VoidCallback? retry}) => Center(
          child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(text, textAlign: TextAlign.center),
          if (retry != null)
            TextButton(onPressed: retry, child: const Text('重试'))
        ]),
      ));

  List<Widget> _actions(String label, VoidCallback? action) => [
        if (error != null)
          Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(error!, style: const TextStyle(color: Colors.red))),
        const SizedBox(height: 16),
        FilledButton(
            onPressed: busy ? null : action,
            child: Text(busy ? '提交中…' : label)),
      ];

  @override
  Widget build(BuildContext context) => FutureBuilder<LearningTask>(
      future: current,
      builder: (context, snapshot) {
        final task = snapshot.data ?? widget.task;
        if (snapshot.hasError)
          return _page(
              task,
              _notice(
                  snapshot.error is ApiError
                      ? (snapshot.error as ApiError).message
                      : '任务加载失败',
                  retry: () => setState(() => current = _load())));
        if (!snapshot.hasData)
          return _page(task, const Center(child: CircularProgressIndicator()));
        if (finished || task.status == 'done')
          return _page(
              task,
              Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.check_circle,
                    color: DebaoColors.success, size: 48),
                const SizedBox(height: 12),
                const Text('已完成学习任务'),
                const SizedBox(height: 12),
                FilledButton(
                    onPressed: () => debaoPopOrFallback(context, '/learning'),
                    child: const Text('返回学习计划')),
              ])));
        if (task.locked || task.status == 'locked')
          return _page(task, _notice('请先完成前置学习内容，完成后再回来继续'));
        final type = task.contentType ?? 'task';
        if (['question', 'assessment', 'subjective', 'card'].contains(type) &&
            (task.contentId?.trim().isEmpty ?? true)) {
          return _page(task, _notice('尚未配置学习内容，请联系老师'));
        }
        switch (type) {
          case 'question':
          case 'assessment':
            return ObjectiveAnswerScreen(
                title: task.title,
                remoteEnabled: true,
                mode: type == 'assessment' ? 'exam' : 'chapter',
                paperId: type == 'assessment' ? task.contentId : null,
                questionIds: type == 'question' ? [task.contentId!] : const [],
                learningTaskId: task.id);
          case 'card':
            return _page(task, _card(task));
          case 'subjective':
            return _page(task, _subjective(task));
          case 'course':
          case 'task':
            return _page(
                task,
                ListView(padding: const EdgeInsets.all(20), children: [
                  Text(type == 'course' ? '站外听课安排' : '学习要求',
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  SelectableText(task.description ?? '请按老师安排完成本项学习任务。',
                      style: const TextStyle(fontSize: 16, height: 1.7)),
                  if (type == 'course')
                    const Padding(
                        padding: EdgeInsets.only(top: 20),
                        child: Text('请在指定平台听课，听完后回来打卡。无需填写学习时长。',
                            style: TextStyle(color: DebaoColors.body))),
                  ..._actions(type == 'course' ? '听完课程，立即打卡' : '完成学习任务',
                      () => _finish(task)),
                ]));
          default:
            return _page(task, _notice('暂不支持此任务类型，请更新 App 或联系老师'));
        }
      });

  Widget _card(LearningTask task) =>
      ref.watch(learningCardProvider(task.contentId!)).when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _notice('卡片加载失败，请重试',
                retry: () =>
                    ref.invalidate(learningCardProvider(task.contentId!))),
            data: (card) {
              if (card == null || card.assets.isEmpty)
                return _notice('卡片不存在或尚未配置素材，请联系老师');
              return LearningCardDeck(
                key: ValueKey('${card.id}:${card.version}'),
                card: card,
                busy: busy,
                error: error,
                onRatingsChanged: (value) => recallRatings = value,
                onComplete: () => _finish(task, cardVersion: card.version),
              );
            },
          );

  Widget _subjective(LearningTask task) =>
      ref.watch(learningSubjectiveQuestionProvider(task.contentId!)).when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _notice('题目加载失败，请重试',
                retry: () => ref.invalidate(
                    learningSubjectiveQuestionProvider(task.contentId!))),
            data: (question) {
              if (question == null || question.subQuestions.isEmpty)
                return _notice('题目不存在或已停用，请联系老师');
              return ListView(padding: const EdgeInsets.all(20), children: [
                Text(question.stem,
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        height: 1.6)),
                if (question.caseMaterial?.isNotEmpty ?? false)
                  Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: SelectableText(question.caseMaterial!,
                          style: const TextStyle(height: 1.7))),
                ...question.subQuestions.map((sub) => Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${sub.prompt}（${sub.score} 分）'),
                          const SizedBox(height: 12),
                          TextField(
                              key: ValueKey('answer-${sub.id}'),
                              controller: answers.putIfAbsent(
                                  sub.id, () => TextEditingController()),
                              enabled: !busy,
                              minLines: 4,
                              maxLines: 12,
                              maxLength: 10000,
                              decoration: const InputDecoration(
                                  hintText: '请输入本问答案',
                                  border: OutlineInputBorder())),
                        ]))),
                ..._actions('提交答案', () => _finish(task, question: question)),
              ]);
            },
          );
}
