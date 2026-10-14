import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/design_tokens.dart';
import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';
import '../tools/study_tools_screens.dart';
import 'learning_task_screen.dart';
export 'learning_task_screen.dart';

/// The learner-facing entry for 得恩私教.  The screen deliberately keeps the
/// diagnostic gate and the weekly task list together: a learner can always see
/// what the next action is, while the server remains the source of truth for
/// purchase access, task ordering and unlock state.
class LearningCenterScreen extends StatelessWidget {
  const LearningCenterScreen({super.key, this.remoteEnabled = false});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _LearningCenterBody(remoteEnabled: remoteEnabled),
      );
}

class LearningDiagnosticRouteScreen extends ConsumerWidget {
  const LearningDiagnosticRouteScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(learningDiagnosticProvider);
    return state.when(
      loading: () => const _LearningScaffold(
          title: '首次学习诊断', child: Center(child: CircularProgressIndicator())),
      error: (error, _) => _LearningScaffold(
          title: '首次学习诊断',
          child: _ErrorState(
              message: '诊断加载失败：${_message(error)}',
              onRetry: () => ref.invalidate(learningDiagnosticProvider))),
      data: (value) => value.access != 'granted'
          ? const _LearningScaffold(
              title: '首次学习诊断',
              child: _EmptyState(title: '暂未开通', message: '购买得恩私教后才能开始诊断。'))
          : value.completed && value.result != null
              ? LearningDiagnosticResultScreen(
                  result: value.result!, state: value)
              : LearningDiagnosticScreen(state: value),
    );
  }
}

// Reading plans retries automatic generation after a successfully saved diagnosis.
// Tasks must be fetched afterwards so the first visit cannot race generation.
final learningJourneyProvider = FutureProvider<List<LearningTask>>((ref) async {
  final repository = ref.watch(courseRepositoryProvider);
  await repository.plans();
  return repository.tasks();
});

class _LearningCenterBody extends ConsumerWidget {
  const _LearningCenterBody({required this.remoteEnabled});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!remoteEnabled) {
      return const _LearningScaffold(
        title: '得恩私教',
        child: _EmptyState(title: '学习中心预览', message: '登录并购买得恩私教后开始首次学习诊断。'),
      );
    }
    final diagnostic = ref.watch(learningDiagnosticProvider);
    return _LearningScaffold(
      title: '得恩私教',
      child: diagnostic.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorState(
          message: '学习中心暂时不可用：${_message(error)}',
          onRetry: () => ref.invalidate(learningDiagnosticProvider),
        ),
        data: (state) => _DiagnosticGate(state: state),
      ),
    );
  }
}

class _DiagnosticGate extends ConsumerStatefulWidget {
  const _DiagnosticGate({required this.state});
  final LearningDiagnosticState state;

  @override
  ConsumerState<_DiagnosticGate> createState() => _DiagnosticGateState();
}

class _DiagnosticGateState extends ConsumerState<_DiagnosticGate> {
  bool promptShown = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!promptShown &&
        widget.state.access == 'granted' &&
        !widget.state.completed) {
      promptShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (!mounted) return;
        final enter = await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (dialogContext) => AlertDialog(
            title: const Text('开始首次学习诊断'),
            content: const Text('首次进入学习中心需要先完成诊断，我们会根据结果制定专属学习计划。'),
            actions: [
              FilledButton(
                  onPressed: () => Navigator.pop(dialogContext, true),
                  child: const Text('进入诊断')),
            ],
          ),
        );
        if (mounted && enter == true) {
          await Navigator.push<void>(
              context,
              MaterialPageRoute(
                  builder: (_) =>
                      LearningDiagnosticScreen(state: widget.state)));
          if (mounted) ref.invalidate(learningDiagnosticProvider);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    if (state.access != 'granted') {
      return _ScrollContent(children: [
        _HeroCard(
            title: '先了解你，再制定学习方案', subtitle: '得恩私教会根据你的基础、时间和学习习惯安排每周学习任务。'),
        _Panel(
            icon: Icons.lock_outline,
            title: '尚未开通学习中心',
            body: '购买得恩私教后才能进行首次诊断。请在商城完成购买，再回来开始。'),
        if (state.productId.isNotEmpty)
          FilledButton(
              onPressed: () async {
                await context.push(
                    '/commerce/product/${Uri.encodeComponent(state.productId)}');
                if (context.mounted) ref.invalidate(learningDiagnosticProvider);
              },
              child: const Text('查看得恩私教')),
      ]);
    }
    if (!state.completed) {
      return _ScrollContent(children: [
        _HeroCard(
            title: state.form?.subtitle ?? '完成首次诊断',
            subtitle:
                state.form?.description ?? '诊断没有对错，请按真实情况作答。提交后会生成你的初始学习画像。'),
        if (state.questions.isEmpty)
          _ErrorState(
              message: '诊断问卷正在准备中，请稍后再来',
              onRetry: () => ref.invalidate(learningDiagnosticProvider))
        else
          _ActionCard(
              icon: Icons.fact_check_outlined,
              title: '首次学习诊断',
              body:
                  '${state.questions.length} 道题 · 预计 ${state.form?.estimatedMinutes ?? 5} 分钟',
              label: '开始诊断',
              onTap: () async {
                await Navigator.push<void>(
                    context,
                    MaterialPageRoute(
                        builder: (_) =>
                            LearningDiagnosticScreen(state: state)));
                if (context.mounted) ref.invalidate(learningDiagnosticProvider);
              }),
      ]);
    }
    return _CompletedCenter(state: state);
  }
}

class _CompletedCenter extends ConsumerWidget {
  const _CompletedCenter({required this.state});
  final LearningDiagnosticState state;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(learningJourneyProvider);
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(learningDiagnosticProvider);
        ref.invalidate(learningTasksProvider);
        ref.invalidate(learningJourneyProvider);
        await ref.read(learningJourneyProvider.future);
      },
      child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            _HeroCard(
                title: state.form?.successTitle ?? '首次学习诊断已完成',
                subtitle: state.form?.successDescription ??
                    '按顺序完成本周任务：听课打卡 → 卡片背诵 → 关联练习。'),
            if (state.result != null) _ScoresPanel(state: state),
            if (state.result?.assignment != null)
              _TeacherPanel(
                  assignment: state.result!.assignment!,
                  className: state.classTypeName),
            const SizedBox(height: 12),
            Row(children: [
              const Expanded(
                  child: Text('本周学习任务',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.w800))),
              TextButton(
                  onPressed: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute(
                          builder: (_) =>
                              const LearningPlanScreen(remoteEnabled: true))),
                  child: const Text('查看计划'))
            ]),
            tasks.when(
              loading: () => const Padding(
                  padding: EdgeInsets.all(28),
                  child: Center(child: CircularProgressIndicator())),
              error: (error, _) => _ErrorState(
                  message: '任务加载失败：${_message(error)}',
                  onRetry: () => ref.invalidate(learningJourneyProvider)),
              data: (items) => items.isEmpty
                  ? const _EmptyState(
                      title: '暂时没有本周任务', message: '管理员发布阶段学习内容后，这里会自动生成一周任务。')
                  : Column(
                      children: _orderedTasks(items)
                          .map((task) => _TaskTile(task: task))
                          .toList()),
            ),
          ]),
    );
  }
}

class _TaskTile extends ConsumerWidget {
  const _TaskTile({required this.task});
  final LearningTask task;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final done = task.status == 'done';
    final locked = task.locked || task.status == 'locked';
    final type = _taskTypeLabel(task.contentType);
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFFE6E7EF))),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: locked
            ? () => ScaffoldMessenger.of(context)
                .showSnackBar(const SnackBar(content: Text('请先完成前置学习内容')))
            : () async {
                await Navigator.push<void>(
                    context,
                    MaterialPageRoute(
                        builder: (_) => LearningTaskScreen(task: task)));
                if (context.mounted) {
                  ref.invalidate(learningTasksProvider);
                  ref.invalidate(learningJourneyProvider);
                }
              },
        child: Padding(
            padding: const EdgeInsets.all(15),
            child: Row(children: [
              CircleAvatar(
                  radius: 21,
                  backgroundColor: locked
                      ? const Color(0xFFF1F2F6)
                      : done
                          ? const Color(0xFFE7F7EE)
                          : const Color(0xFFEEEDFF),
                  child: Icon(
                      locked
                          ? Icons.lock_outline
                          : done
                              ? Icons.check
                              : _taskIcon(task.contentType),
                      color: locked
                          ? Colors.grey
                          : done
                              ? const Color(0xFF23864B)
                              : DebaoColors.brand,
                      size: 20)),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(task.title,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(
                        '$type${task.minutes > 0 ? ' · ${task.minutes} 分钟' : ''} · ${task.dueDate}',
                        style: const TextStyle(
                            color: DebaoColors.muted, fontSize: 12)),
                    if (locked)
                      const Text('完成前置任务后解锁',
                          style:
                              TextStyle(color: DebaoColors.muted, fontSize: 12))
                  ])),
              Icon(
                  locked
                      ? Icons.lock
                      : done
                          ? Icons.check_circle
                          : Icons.chevron_right,
                  color: locked
                      ? DebaoColors.muted
                      : done
                          ? const Color(0xFF23864B)
                          : DebaoColors.brand),
            ])),
      ),
    );
  }
}

class LearningDiagnosticScreen extends StatefulWidget {
  const LearningDiagnosticScreen({super.key, required this.state});
  final LearningDiagnosticState state;
  @override
  State<LearningDiagnosticScreen> createState() =>
      _LearningDiagnosticScreenState();
}

class _LearningDiagnosticScreenState extends State<LearningDiagnosticScreen> {
  final answers = <String, ({List<String> optionIds, String? value})>{};
  final controllers = <String, TextEditingController>{};
  int index = 0;
  bool submitting = false;
  String? error;
  late final String startedAt = DateTime.now().toUtc().toIso8601String();
  LearningDiagnosticResult? result;

  @override
  void dispose() {
    for (final controller in controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  LearningDiagnosticQuestion get question => widget.state.questions[index];
  ({List<String> optionIds, String? value}) get answer =>
      answers[question.id] ?? (optionIds: <String>[], value: null);
  bool get hasAnswer =>
      answer.optionIds.isNotEmpty || (answer.value?.trim().isNotEmpty ?? false);

  void select(String id) {
    if (submitting) return;
    final current = answer.optionIds;
    final next = question.type == 'single' || question.type == 'scale'
        ? <String>[id]
        : current.contains(id)
            ? current.where((item) => item != id).toList()
            : [...current, id];
    setState(
        () => answers[question.id] = (optionIds: next, value: answer.value));
  }

  Future<void> submit() async {
    if (submitting || widget.state.questions.isEmpty) return;
    if (question.required && !hasAnswer) {
      setState(() => error = '请先完成本题');
      return;
    }
    final value = answer.value?.trim() ?? '';
    if (question.type == 'number' && value.isNotEmpty) {
      final number = num.tryParse(value);
      if (number == null ||
          !number.isFinite ||
          question.min != null && number < question.min! ||
          question.max != null && number > question.max!) {
        setState(() => error =
            '请输入有效数字${question.min != null ? '，最小 ${question.min}' : ''}${question.max != null ? '，最大 ${question.max}' : ''}');
        return;
      }
    }
    if (question.type == 'text' &&
        value.isNotEmpty &&
        (question.minLength != null && value.length < question.minLength! ||
            question.maxLength != null && value.length > question.maxLength!)) {
      setState(() => error =
          '回答长度需在 ${question.minLength ?? 0} 到 ${question.maxLength ?? 2000} 字之间');
      return;
    }
    if (index < widget.state.questions.length - 1) {
      setState(() {
        index++;
        error = null;
      });
      return;
    }
    setState(() {
      submitting = true;
      error = null;
    });
    try {
      final repository = ProviderScope.containerOf(context, listen: false)
          .read(courseRepositoryProvider);
      final submitted = await repository.submitDiagnostic(
          startedAt: startedAt,
          answers: widget.state.questions.map((item) {
            final value =
                answers[item.id] ?? (optionIds: <String>[], value: null);
            return <String, dynamic>{
              'questionId': item.id,
              'optionIds': value.optionIds,
              if (value.value?.trim().isNotEmpty ?? false)
                'value': item.type == 'number'
                    ? num.parse(value.value!.trim())
                    : value.value!.trim()
            };
          }).toList(growable: false));
      if (!mounted) return;
      final container = ProviderScope.containerOf(context, listen: false);
      container.invalidate(learningDiagnosticProvider);
      container.invalidate(learningJourneyProvider);
      setState(() {
        result = submitted;
        submitting = false;
      });
    } catch (e) {
      if (e is ApiError && e.code == 'DIAGNOSTIC_ALREADY_COMPLETED') {
        try {
          final existing =
              await ProviderScope.containerOf(context, listen: false)
                  .read(courseRepositoryProvider)
                  .diagnostic();
          if (mounted && existing.result != null) {
            setState(() {
              result = existing.result;
              submitting = false;
            });
            return;
          }
        } catch (_) {/* Keep answers available for retry. */}
      }
      if (mounted)
        setState(() {
          submitting = false;
          error = '提交失败：${_message(e)}，请检查网络后重试。';
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.state.access != 'granted')
      return const _LearningScaffold(
          title: '首次学习诊断',
          child: _EmptyState(title: '暂未开通', message: '请先购买得恩私教。'));
    if (result != null)
      return LearningDiagnosticResultScreen(
          result: result!, state: widget.state);
    if (widget.state.completed && widget.state.result != null)
      return LearningDiagnosticResultScreen(
          result: widget.state.result!, state: widget.state);
    if (widget.state.questions.isEmpty)
      return const _LearningScaffold(
          title: '首次学习诊断',
          child: _EmptyState(title: '暂无诊断题', message: '问卷正在准备中，请稍后再来。'));
    return _LearningScaffold(
        title: widget.state.form?.title ?? '首次学习诊断',
        child: Column(children: [
          Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: LinearProgressIndicator(
                  value: (index + 1) / widget.state.questions.length,
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(8),
                  color: DebaoColors.brand,
                  backgroundColor: const Color(0xFFE7E8EF))),
          Expanded(
              child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                Text('${index + 1} / ${widget.state.questions.length}',
                    style: const TextStyle(
                        color: DebaoColors.muted, fontSize: 12)),
                const SizedBox(height: 12),
                Text(question.stem,
                    style: const TextStyle(
                        fontSize: 21,
                        height: 1.4,
                        fontWeight: FontWeight.w800)),
                if (question.description != null)
                  Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(question.description!,
                          style: const TextStyle(
                              color: DebaoColors.muted, height: 1.5))),
                if (question.type == 'text' || question.type == 'number')
                  Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: TextField(
                          key: ValueKey(question.id),
                          maxLines: question.type == 'text' ? 5 : 1,
                          keyboardType: question.type == 'number'
                              ? TextInputType.number
                              : TextInputType.text,
                          enabled: !submitting,
                          controller: controllers.putIfAbsent(
                              question.id,
                              () => TextEditingController(
                                  text: answer.value ?? '')),
                          onChanged: (value) => answers[question.id] =
                              (optionIds: answer.optionIds, value: value),
                          decoration: InputDecoration(
                              hintText: question.placeholder ?? '请输入回答',
                              border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12))))),
                if (question.options.isNotEmpty)
                  Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: Column(
                          children:
                              question.options.asMap().entries.map((entry) {
                        final option = entry.value;
                        final active = answer.optionIds.contains(option.id);
                        return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            elevation: 0,
                            color:
                                active ? const Color(0xFFEEEDFF) : Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(
                                    color: active
                                        ? DebaoColors.brand
                                        : const Color(0xFFE3E4EB))),
                            child: ListTile(
                                onTap: () => select(option.id),
                                leading: CircleAvatar(
                                    radius: 16,
                                    backgroundColor: active
                                        ? DebaoColors.brand
                                        : const Color(0xFFF1F2F6),
                                    child: active
                                        ? const Icon(Icons.check,
                                            color: Colors.white, size: 16)
                                        : Text(
                                            String.fromCharCode(65 + entry.key),
                                            style: const TextStyle(
                                                color: DebaoColors.muted))),
                                title: Text(option.label)));
                      }).toList())),
                if (error != null)
                  Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Text(error!,
                          style: const TextStyle(color: Colors.red))),
              ])),
          SafeArea(
              top: false,
              child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    if (index > 0)
                      TextButton(
                          onPressed:
                              submitting ? null : () => setState(() => index--),
                          child: const Text('上一题')),
                    const Spacer(),
                    FilledButton(
                        onPressed: submitting ? null : submit,
                        child: submitting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : Text(index == widget.state.questions.length - 1
                                ? (widget.state.form?.submitLabel ?? '提交诊断')
                                : '下一题'))
                  ]))),
        ]));
  }
}

class LearningDiagnosticResultScreen extends StatelessWidget {
  const LearningDiagnosticResultScreen(
      {super.key, required this.result, required this.state});
  final LearningDiagnosticResult result;
  final LearningDiagnosticState state;
  @override
  Widget build(BuildContext context) => _LearningScaffold(
      title: '诊断完成',
      child: ListView(padding: const EdgeInsets.all(16), children: [
        _HeroCard(
            title: '你的初始学习画像已生成',
            subtitle: state.form?.successDescription ?? '接下来按系统安排的一周任务开始学习。'),
        _ScoresPanel(result: result, state: state),
        const SizedBox(height: 18),
        FilledButton(
            onPressed: () {
              final container =
                  ProviderScope.containerOf(context, listen: false);
              container.invalidate(learningDiagnosticProvider);
              container.invalidate(learningJourneyProvider);
              if (Navigator.of(context).canPop()) {
                Navigator.pop(context);
              } else if (GoRouter.maybeOf(context) != null) {
                context.go('/learning');
              } else {
                Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                        builder: (_) =>
                            const LearningCenterScreen(remoteEnabled: true)));
              }
            },
            child: const Text('进入学习中心')),
      ]));
}

class _ScoresPanel extends StatelessWidget {
  const _ScoresPanel({this.result, this.state});
  final LearningDiagnosticResult? result;
  final LearningDiagnosticState? state;
  @override
  Widget build(BuildContext context) {
    final scores =
        result?.scores ?? state?.result?.scores ?? const <String, int>{};
    final dimensions =
        state?.dimensions ?? const <({String code, String label})>[];
    return _Panel(
        icon: Icons.insights_outlined,
        title: '初始学习画像',
        body: scores.entries
            .map((entry) =>
                '${dimensions.where((item) => item.code == entry.key).map((item) => item.label).firstOrNull ?? entry.key} ${entry.value} 分')
            .join(' · '));
  }
}

class _TeacherPanel extends StatelessWidget {
  const _TeacherPanel({required this.assignment, this.className});
  final LearningTeacherAssignment assignment;
  final String? className;
  @override
  Widget build(BuildContext context) => _Panel(
        icon: Icons.school_outlined,
        title: assignment.status == 'assigned' ? '已分配学习老师' : '老师分配处理中',
        body: [
          if (className != null) '班型：$className',
          if (assignment.stageName != null) '阶段：${assignment.stageName}',
          if (assignment.teacherName != null)
            '${assignment.teacherName} · ${assignment.teacherSubject ?? ''}',
          if (assignment.teacherSpecialty != null) assignment.teacherSpecialty!,
          if (assignment.teacherName == null) '当前阶段暂未配置老师，管理员完成配置后会自动分配。',
        ].join('\n'),
      );
}

List<LearningTask> _orderedTasks(List<LearningTask> tasks) {
  const rank = {
    'course': 0,
    'card': 1,
    'question': 2,
    'subjective': 2,
    'assessment': 3
  };
  final ordered = [...tasks];
  ordered.sort((a, b) => '${a.dueDate}:${rank[a.contentType] ?? 9}:${a.id}'
      .compareTo('${b.dueDate}:${rank[b.contentType] ?? 9}:${b.id}'));
  return ordered;
}

class _LearningScaffold extends StatelessWidget {
  const _LearningScaffold({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: Text(title),
          backgroundColor: DebaoColors.page,
          elevation: 0),
      body: child);
}

class _ScrollContent extends StatelessWidget {
  const _ScrollContent({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) =>
      ListView(padding: const EdgeInsets.all(16), children: children);
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.title, required this.subtitle});
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.all(22),
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
          color: const Color(0xFF292675),
          borderRadius: BorderRadius.circular(18)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Icon(Icons.auto_awesome, color: Colors.white, size: 28),
        const SizedBox(height: 14),
        Text(title,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
                height: 1.3)),
        const SizedBox(height: 8),
        Text(subtitle,
            style: const TextStyle(color: Color(0xFFD9D8F2), height: 1.5))
      ]));
}

class _Panel extends StatelessWidget {
  const _Panel({required this.icon, required this.title, required this.body});
  final IconData icon;
  final String title;
  final String body;
  @override
  Widget build(BuildContext context) => Card(
      elevation: 0,
      child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: DebaoColors.brand),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 6),
                  Text(body,
                      style: const TextStyle(
                          color: DebaoColors.muted, height: 1.5))
                ]))
          ])));
}

class _ActionCard extends StatelessWidget {
  const _ActionCard(
      {required this.icon,
      required this.title,
      required this.body,
      required this.label,
      required this.onTap});
  final IconData icon;
  final String title;
  final String body;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
      elevation: 0,
      child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Icon(icon, color: DebaoColors.brand, size: 28),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(body,
                      style: const TextStyle(
                          color: DebaoColors.muted, fontSize: 12))
                ])),
            FilledButton(onPressed: onTap, child: Text(label))
          ])));
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.title, required this.message});
  final String title;
  final String message;
  @override
  Widget build(BuildContext context) => Padding(
      padding: const EdgeInsets.all(30),
      child: Column(children: [
        Icon(Icons.inbox_outlined, color: DebaoColors.muted, size: 42),
        const SizedBox(height: 10),
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 5),
        Text(message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: DebaoColors.muted, height: 1.5))
      ]));
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) =>
      _EmptyState(title: message, message: '请检查网络后重试').withRetry(onRetry);
}

extension on _EmptyState {
  Widget withRetry(VoidCallback onRetry) => Column(children: [
        this,
        TextButton(onPressed: onRetry, child: const Text('重试'))
      ]);
}

String _message(Object error) => error is ApiError ? error.message : '$error';
String _taskTypeLabel(String? type) => switch (type) {
      'course' => '听课打卡',
      'card' => '背诵卡片',
      'question' => '客观题',
      'subjective' => '主观题',
      'assessment' => '周考',
      _ => '学习任务'
    };
IconData _taskIcon(String? type) => switch (type) {
      'course' => Icons.headphones_outlined,
      'card' => Icons.style_outlined,
      'assessment' => Icons.assignment_outlined,
      'subjective' => Icons.edit_note_outlined,
      _ => Icons.quiz_outlined
    };
