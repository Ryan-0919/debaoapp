import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../account/account_service_screens.dart';
import '../tools/study_tools_screens.dart';
import '../../shared/route_back_button.dart';

enum _SubjectiveStatus { none, draft, done }

class _SubjectiveSubQuestion {
  const _SubjectiveSubQuestion({
    required this.id,
    required this.prompt,
    required this.maxScore,
  });

  final String id;
  final String prompt;
  final num maxScore;
}

class _SubjectivePaper {
  const _SubjectivePaper({
    required this.id,
    required this.year,
    required this.title,
    required this.summary,
    required this.difficulty,
    required this.suggestMinutes,
    required this.status,
    required this.subject,
    required this.content,
    required this.questions,
    this.paperId,
  });

  final String id;
  final String year;
  final String title;
  final String summary;
  final String difficulty;
  final int suggestMinutes;
  final _SubjectiveStatus status;
  final String subject;
  final String content;
  final List<_SubjectiveSubQuestion> questions;
  final String? paperId;

  factory _SubjectivePaper.fromRemote(GradingQuestion question) {
    final year = question.title.startsWith('20')
        ? question.title.substring(0, 4)
        : '2026';
    return _SubjectivePaper(
      id: question.id,
      year: year,
      title: question.title,
      summary: question.caseMaterial,
      difficulty: '中',
      suggestMinutes: question.suggestedMinutes,
      status: _SubjectiveStatus.none,
      subject: question.subjectId,
      content: question.caseMaterial,
      questions: question.subQuestions
          .map((item) => _SubjectiveSubQuestion(
                id: item.id,
                prompt: item.prompt,
                maxScore: item.maxScore,
              ))
          .toList(growable: false),
    );
  }
}

const _localPapers = <_SubjectivePaper>[
  _SubjectivePaper(
    id: 'q1',
    year: '2023',
    title: '甲公司股权转让与债权人保护',
    summary:
        '甲公司为有限责任公司，股东乙拟将其持有的40%股权转让给公司外部的丙，其他股东丁、戊主张优先购买权并发生争议，同时甲公司对外负有债务……',
    difficulty: '难',
    suggestMinutes: 45,
    status: _SubjectiveStatus.draft,
    subject: '民法',
    content:
        '甲有限责任公司（以下简称甲公司）的股东为乙（持股40%）、丁（持股35%）、戊（持股25%）。\n\n2023年3月，乙与丙签订股权转让协议，约定将乙持有的40%股权以300万元的价格转让给丙，丁、戊明确表示放弃优先购买权。此后乙反悔，主张该协议无效。\n\n与此同时，甲公司的债权人己持有到期债权100万元，甲公司以资金周转困难为由拒绝偿还。己向法院申请强制执行甲公司财产，发现甲公司账面资产严重不足，但发现甲公司曾于2022年12月将一批价值60万元的设备以20万元的低价出售给与甲公司有关联的庚公司。\n\n【问题】',
    questions: [
      _SubjectiveSubQuestion(
          id: 'q1-1', prompt: '乙主张股权转让协议无效的理由是否成立？请说明理由。', maxScore: 10),
      _SubjectiveSubQuestion(
          id: 'q1-2',
          prompt: '己能否对甲公司向庚公司低价出售设备的行为行使撤销权？请说明理由及撤销权的行使方式。',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q1-3',
          prompt: '如甲公司无力偿还己的债务，己能否要求乙、丁、戊对甲公司的债务承担责任？请分析各股东的责任。',
          maxScore: 10),
      _SubjectiveSubQuestion(
          id: 'q1-4',
          prompt: '假设乙最终完成股权转让，丙成为甲公司股东，公司章程未就此变更，丙的股东资格何时取得？',
          maxScore: 5),
    ],
    paperId: 'grading-paper-civil',
  ),
  _SubjectivePaper(
    id: 'q2',
    year: '2022',
    title: '不当得利与无因管理综合案例',
    summary: '甲将一笔款项误转入乙的账户，乙在不知情的情况下将该款项用于购置一辆汽车，后甲发现并主张返还……',
    difficulty: '中',
    suggestMinutes: 35,
    status: _SubjectiveStatus.done,
    subject: '民法',
    content:
        '2022年5月，甲因操作失误将50万元转入乙的银行账户（甲原本打算转给与乙同名的丙）。乙发现到账后，以为是朋友庚赠与，遂将该款项中的40万元用于购置一辆汽车（市场价40万元），其余10万元存入自己账户。\n\n同月，乙的邻居丁因突发疾病住院，乙在未经丁委托的情况下，垫付了丁的医疗费2万元，并照料丁的房屋一个月（期间支出费用0.5万元）。\n\n甲事后发现转账错误，要求乙返还50万元。乙以汽车已购置为由拒绝返还40万元，并主张其为丁支出的费用应由丁偿还。\n\n【问题】',
    questions: [
      _SubjectiveSubQuestion(
          id: 'q2-1',
          prompt: '甲能否要求乙返还50万元？乙以购车为由拒绝返还40万元是否有法律依据？',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q2-2',
          prompt: '乙为丁垫付医疗费及照料房屋的行为性质如何认定？乙能否向丁主张费用偿还？',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q2-3',
          prompt: '如乙已将购置的汽车以35万元转让给善意第三方戊，甲应如何救济其权利？',
          maxScore: 10),
    ],
  ),
  _SubjectivePaper(
    id: 'q3',
    year: '2023',
    title: '合同解除与违约责任',
    summary: '甲与乙签订购房合同，后因市场变化甲主张解除合同并要求返还定金，双方就违约责任归属产生争议……',
    difficulty: '中',
    suggestMinutes: 30,
    status: _SubjectiveStatus.none,
    subject: '民法',
    content:
        '2023年1月，甲（购房人）与乙（开发商）签订商品房预售合同，约定购买乙开发的A小区3号楼501室，总价200万元，甲向乙支付定金20万元，余款在办理贷款手续后支付。合同约定乙应于2023年12月31日前交房，逾期交房每日按合同总价0.1‰支付违约金。\n\n合同签订后，甲向银行申请贷款，银行以甲负债率过高为由拒绝放款。甲向乙说明情况，请求退还定金并解除合同。乙认为甲未能取得贷款属于甲的过错，不同意解除合同，坚持要求甲支付余款。\n\n2023年12月31日，因施工材料供应问题，乙未能如期交房，实际于2024年3月1日才完成交付（按合同计算逾期60天）。甲主张乙违约，要求支付违约金并赔偿因逾期交房导致的额外租房费用1.2万元。\n\n【问题】',
    questions: [
      _SubjectiveSubQuestion(
          id: 'q3-1',
          prompt: '甲未能取得银行贷款的法律后果应如何处理？甲能否解除合同并要求返还定金？',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q3-2', prompt: '乙逾期60天交房，甲主张的违约金及额外租房费用赔偿应如何处理？', maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q3-3',
          prompt: '如双方约定的违约金明显过高，乙能否请求法院予以调整？调整的标准是什么？',
          maxScore: 10),
    ],
  ),
  _SubjectivePaper(
    id: 'q4',
    year: '2022',
    title: '物权变动与善意取得',
    summary: '甲将房屋登记在乙名下，后乙擅自将房屋出售给丙，引发所有权争议及第三人保护问题……',
    difficulty: '易',
    suggestMinutes: 25,
    status: _SubjectiveStatus.none,
    subject: '民法',
    content:
        '甲为规避限购政策，借用其好友乙之名购置了一套住宅（以下简称"涉案房屋"），房屋登记在乙名下，购房款全部由甲支付，双方签有书面的借名购房协议。\n\n2022年8月，乙擅自以200万元的价格将涉案房屋出售给丙，并完成了过户登记。丙系善意购房，支付了合理对价，不知道乙与甲之间的借名购房关系。\n\n甲得知后，以乙无权处分为由，主张丙不能取得房屋所有权，要求乙返还房屋并赔偿损失。\n\n【问题】',
    questions: [
      _SubjectiveSubQuestion(
          id: 'q4-1',
          prompt: '甲乙之间的借名购房协议是否有效？甲能否依据该协议取得涉案房屋的所有权？',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q4-2', prompt: '丙能否依善意取得制度取得涉案房屋的所有权？甲的损失应由谁承担？', maxScore: 15),
    ],
  ),
  _SubjectivePaper(
    id: 'q5',
    year: '2021',
    title: '婚姻家庭与继承综合案例',
    summary: '甲乙结婚后购置房产，离婚时就财产分割及子女抚养发生争议，同时涉及甲父的遗产继承问题……',
    difficulty: '难',
    suggestMinutes: 50,
    status: _SubjectiveStatus.none,
    subject: '民法',
    content:
        '甲（男）与乙（女）于2015年结婚，婚后共同出资购置了一套住宅（以下简称"婚房"），登记在甲名下，贷款尚未还清。甲的父亲丙于2020年去世，留有遗嘱将其名下一套旧房（价值80万元）留给甲，但丙的配偶丁（甲的母亲）认为遗嘱无效。\n\n2023年，甲乙感情破裂，协议离婚未果，甲向法院起诉离婚。双方就婚房分割、贷款承担、子女（丙12岁）抚养权及抚养费发生争议。乙另主张甲在婚姻存续期间多次向其隐瞒转移财产。\n\n【问题】',
    questions: [
      _SubjectiveSubQuestion(
          id: 'q5-1', prompt: '婚房应如何分割？剩余贷款应如何处理？', maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q5-2',
          prompt: '丙的遗嘱是否有效？如遗嘱有效，丁能否主张权利？如遗嘱无效，遗产如何分配？',
          maxScore: 15),
      _SubjectiveSubQuestion(
          id: 'q5-3', prompt: '子女抚养权的判决应考虑哪些因素？抚养费标准如何确定？', maxScore: 10),
      _SubjectiveSubQuestion(
          id: 'q5-4',
          prompt: '乙主张甲转移财产，人民法院应如何处理？对甲的转移财产行为有何法律后果？',
          maxScore: 10),
    ],
  ),
];

class SubjectiveSelectScreen extends StatelessWidget {
  const SubjectiveSelectScreen({
    super.key,
    required this.subject,
    this.subjectId,
    this.remoteEnabled = false,
  });

  final String subject;
  final String? subjectId;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _SubjectiveSelectBody(
          subject: subject,
          subjectId: subjectId,
          remoteEnabled: remoteEnabled,
        ),
      );
}

class _SubjectiveSelectBody extends ConsumerStatefulWidget {
  const _SubjectiveSelectBody({
    required this.subject,
    required this.subjectId,
    required this.remoteEnabled,
  });

  final String subject;
  final String? subjectId;
  final bool remoteEnabled;

  @override
  ConsumerState<_SubjectiveSelectBody> createState() =>
      _SubjectiveSelectBodyState();
}

class _SubjectiveSelectBodyState extends ConsumerState<_SubjectiveSelectBody> {
  String? year;
  String? difficulty;

  ({Color background, Color foreground}) _subjectPalette(String value) =>
      switch (value) {
        '刑法' => (
            background: const Color(0xFFFFF1E8),
            foreground: const Color(0xFFD2691E)
          ),
        '行政法' => (
            background: const Color(0xFFEAF7F7),
            foreground: const Color(0xFF1A8B8B)
          ),
        '民事诉讼法' => (
            background: const Color(0xFFEAF6EF),
            foreground: const Color(0xFF3A7A46)
          ),
        '刑事诉讼法' => (
            background: const Color(0xFFFFF5DD),
            foreground: const Color(0xFFA87000)
          ),
        _ => (
            background: const Color(0xFFF0F0FF),
            foreground: const Color(0xFF4C4BEA)
          ),
      };

  @override
  Widget build(BuildContext context) {
    final remote = widget.remoteEnabled
        ? ref.watch(gradingQuestionsProvider(widget.subjectId))
        : null;
    final papers = widget.remoteEnabled
        ? (remote?.valueOrNull ?? const <GradingQuestion>[])
            .map(_SubjectivePaper.fromRemote)
            .toList(growable: false)
        : _localPapers;
    final filtered = papers
        .where((paper) =>
            (year == null || paper.year == year) &&
            (difficulty == null || paper.difficulty == difficulty))
        .toList(growable: false);

    if (widget.remoteEnabled && remote != null) {
      if (remote.isLoading && !remote.hasValue) {
        return _stateScaffold(
          child: const _SubjectiveState(
            icon: Icons.cloud_download_outlined,
            title: '正在加载主观题',
            message: '正在读取已发布批改题目，请稍候…',
            loading: true,
          ),
        );
      }
      if (remote.hasError && !remote.hasValue) {
        return _stateScaffold(
          child: _SubjectiveState(
            icon: Icons.cloud_off_outlined,
            title: '主观题加载失败',
            message: _subjectiveError(remote.error),
            actionLabel: '重试',
            onAction: () =>
                ref.invalidate(gradingQuestionsProvider(widget.subjectId)),
          ),
        );
      }
      if (papers.isEmpty) {
        return _stateScaffold(
          child: const _SubjectiveState(
            icon: Icons.inbox_outlined,
            title: '暂无主观题',
            message: '当前科目还没有已发布的批改题目。',
          ),
        );
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F7),
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: Text('${widget.subject} · 主观题'),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          IconButton(
              onPressed: () => _showFilter(context),
              tooltip: '筛选',
              icon: Icon(Icons.filter_list,
                  color: year != null || difficulty != null
                      ? const Color(0xFF4C4BEA)
                      : null)),
        ],
      ),
      body: Column(children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Builder(builder: (context) {
              final palette = _subjectPalette(widget.subject);
              return Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                      color: palette.background,
                      borderRadius: BorderRadius.circular(8)),
                  child: Text(widget.subject.isEmpty ? '?' : widget.subject[0],
                      style: TextStyle(
                          color: palette.foreground,
                          fontWeight: FontWeight.w700)));
            }),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.subject,
                        style: const TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 3),
                    Text(
                        '共${filtered.length}题 · 2018–2023真题${year != null || difficulty != null ? ' · 已筛选' : ''}',
                        style: const TextStyle(
                            color: Color(0xFF707684), fontSize: 12)),
                  ]),
            ),
            if (year != null || difficulty != null)
              TextButton(
                  onPressed: () => setState(() {
                        year = null;
                        difficulty = null;
                      }),
                  child: const Text('清除筛选')),
          ]),
        ),
        Expanded(
          child: filtered.isEmpty
              ? _emptyList(activeFilter: year != null || difficulty != null)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, index) =>
                      _paperCard(context, filtered[index]),
                ),
        ),
      ]),
    );
  }

  Widget _stateScaffold({required Widget child}) => Scaffold(
        backgroundColor: const Color(0xFFF4F5F7),
        appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: Text('${widget.subject} · 主观题'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
        ),
        body: child,
      );

  Widget _emptyList({required bool activeFilter}) => Center(
        child: Padding(
          padding: const EdgeInsets.all(34),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.assignment_outlined,
                color: Color(0xFFC0C5D0), size: 42),
            const SizedBox(height: 13),
            Text(activeFilter ? '暂无符合条件的题目' : '暂无真题数据',
                style:
                    const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 5),
            Text(activeFilter ? '请尝试调整筛选条件' : '当前科目尚未发布主观题',
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: Color(0xFF707684), fontSize: 11, height: 1.6)),
          ]),
        ),
      );

  Widget _paperCard(BuildContext context, _SubjectivePaper paper) {
    final difficultyColor = paper.difficulty == '难'
        ? const Color(0xFFD2691E)
        : paper.difficulty == '中'
            ? const Color(0xFFA87000)
            : const Color(0xFF3A7A46);
    final difficultyBackground = paper.difficulty == '难'
        ? const Color(0xFFFFF1E8)
        : paper.difficulty == '中'
            ? const Color(0xFFFFF5DD)
            : const Color(0xFFEAF6EF);
    final status = switch (paper.status) {
      _SubjectiveStatus.draft => '草稿',
      _SubjectiveStatus.done => '已完成',
      _ => '未作答',
    };
    final statusDotColor = switch (paper.status) {
      _SubjectiveStatus.done => const Color(0xFF5DA765),
      _SubjectiveStatus.draft => const Color(0xFFF5A623),
      _ => const Color(0xFF707684),
    };
    return InkWell(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => SubjectiveAnswerScreen(
                    subject: widget.subject,
                    paperTitle: paper.title,
                    questionId: widget.remoteEnabled ? paper.id : null,
                    paperId: paper.paperId,
                    remoteEnabled: widget.remoteEnabled,
                  ))),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _Tag('${paper.year}年', const Color(0xFFF4F5F7),
                const Color(0xFF707684)),
            const SizedBox(width: 6),
            _Tag(paper.difficulty, difficultyBackground, difficultyColor),
            const Spacer(),
            Row(mainAxisSize: MainAxisSize.min, children: [
              Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                      color: statusDotColor, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              Text(status,
                  style:
                      const TextStyle(color: Color(0xFF707684), fontSize: 11)),
            ]),
          ]),
          const SizedBox(height: 10),
          Text(paper.title,
              style: const TextStyle(
                  color: Color(0xFF171925),
                  fontSize: 14,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 7),
          Text(paper.summary,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  color: Color(0xFF5F6574), fontSize: 12, height: 1.5)),
          const SizedBox(height: 10),
          Row(children: [
            Text('${paper.questions.length}个小问',
                style: const TextStyle(color: Color(0xFF707684), fontSize: 11)),
            const SizedBox(width: 14),
            Text('建议${paper.suggestMinutes}分钟',
                style: const TextStyle(color: Color(0xFF707684), fontSize: 11)),
            const Spacer(),
            const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0), size: 18),
          ]),
        ]),
      ),
    );
  }

  // Kept as a separate method so the bottom sheet can be covered by a widget
  // test without depending on the page's list implementation.
  void _showFilter(BuildContext context) => showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        builder: (sheetContext) => StatefulBuilder(
          builder: (context, setSheetState) => SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('筛选条件',
                        style: TextStyle(
                            fontSize: 17, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 16),
                    const Text('年份',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(
                        spacing: 8,
                        children: ['2023', '2022', '2021']
                            .map((item) => FilterChip(
                                label: Text('$item年'),
                                selected: year == item,
                                onSelected: (_) {
                                  setState(
                                      () => year = year == item ? null : item);
                                  setSheetState(() {});
                                }))
                            .toList()),
                    const SizedBox(height: 12),
                    const Text('难度',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(
                        spacing: 8,
                        children: ['易', '中', '难']
                            .map((item) => FilterChip(
                                label: Text(item),
                                selected: difficulty == item,
                                onSelected: (_) {
                                  setState(() => difficulty =
                                      difficulty == item ? null : item);
                                  setSheetState(() {});
                                }))
                            .toList()),
                    const SizedBox(height: 16),
                    SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                            onPressed: () => Navigator.pop(sheetContext),
                            child: const Text('确认'))),
                  ]),
            ),
          ),
        ),
      );
}

class SubjectiveAnswerScreen extends StatelessWidget {
  const SubjectiveAnswerScreen({
    super.key,
    required this.subject,
    required this.paperTitle,
    this.questionIndex = 0,
    this.questionId,
    this.paperId,
    this.remoteEnabled = false,
  });

  final String subject;
  final String paperTitle;

  /// Index of the paper in the selected subject, matching the RN route
  /// contract.  It is only used when no explicit paper title is supplied.
  final int questionIndex;
  final String? questionId;
  final String? paperId;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _SubjectiveAnswerBody(
          subject: subject,
          paperTitle: paperTitle,
          questionIndex: questionIndex,
          questionId: questionId,
          paperId: paperId,
          remoteEnabled: remoteEnabled,
        ),
      );
}

class _SubjectiveAnswerBody extends ConsumerStatefulWidget {
  const _SubjectiveAnswerBody({
    required this.subject,
    required this.paperTitle,
    required this.questionIndex,
    required this.questionId,
    required this.paperId,
    required this.remoteEnabled,
  });

  final String subject;
  final String paperTitle;
  final int questionIndex;
  final String? questionId;
  final String? paperId;
  final bool remoteEnabled;

  @override
  ConsumerState<_SubjectiveAnswerBody> createState() =>
      _SubjectiveAnswerScreenState();
}

class _SubjectiveAnswerScreenState
    extends ConsumerState<_SubjectiveAnswerBody> {
  late List<TextEditingController> controllers;
  int active = 0;
  String? savedAt;
  bool submitting = false;
  bool savingDraft = false;
  bool draftUnsynced = false;
  String? attachment;
  String? saveError;

  @override
  void initState() {
    super.initState();
    final local = _localPaperForSelection(
        widget.paperTitle, widget.subject, widget.questionIndex);
    controllers =
        List.generate(local.questions.length, (_) => TextEditingController());
  }

  @override
  void dispose() {
    for (final controller in controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.remoteEnabled) {
      return _buildAnswer(
          context,
          _localPaperForSelection(
              widget.paperTitle, widget.subject, widget.questionIndex));
    }
    final questionId = widget.questionId;
    if (questionId == null || questionId.isEmpty) {
      return _answerStateScaffold(
          child: const _SubjectiveState(
              icon: Icons.link_off_outlined,
              title: '题目编号缺失',
              message: '请从题库重新打开这道题后再继续作答。'));
    }
    final remote = ref.watch(gradingQuestionProvider(questionId));
    if (remote.isLoading && !remote.hasValue) {
      return _answerStateScaffold(
          child: const _SubjectiveState(
              icon: Icons.cloud_download_outlined,
              title: '正在加载题目',
              message: '正在读取案情和小问，请稍候…',
              loading: true));
    }
    if (remote.hasError && !remote.hasValue) {
      return _answerStateScaffold(
          child: _SubjectiveState(
              icon: Icons.cloud_off_outlined,
              title: '题目加载失败',
              message: _subjectiveError(remote.error),
              actionLabel: '重试',
              onAction: () =>
                  ref.invalidate(gradingQuestionProvider(questionId))));
    }
    final question = remote.valueOrNull;
    if (question == null || question.subQuestions.isEmpty) {
      return _answerStateScaffold(
          child: const _SubjectiveState(
              icon: Icons.inbox_outlined,
              title: '暂无小问',
              message: '该题目暂时没有可作答的小问。'));
    }
    final paper = _paperFromQuestion(question);
    _ensureControllers(paper.questions.length);
    return _buildAnswer(context, paper);
  }

  Widget _answerStateScaffold({required Widget child}) => Scaffold(
        backgroundColor: const Color(0xFFF4F5F7),
        appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: Text('${widget.subject} · 分科真题'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
        ),
        body: child,
      );

  void _ensureControllers(int length) {
    if (controllers.length == length) return;
    for (final controller in controllers) {
      controller.dispose();
    }
    controllers = List.generate(length, (_) => TextEditingController());
    active = active.clamp(0, length - 1).toInt();
  }

  Widget _buildAnswer(BuildContext context, _SubjectivePaper paper) {
    final safeActive = active.clamp(0, paper.questions.length - 1).toInt();
    final currentController = controllers[safeActive];
    final answered = controllers
        .where((controller) => controller.text.trim().isNotEmpty)
        .length;
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F7),
      appBar: AppBar(
        leading: const DebaoRouteBackButton(),
        title: Column(children: [
          Text('${widget.subject} · 分科真题',
              style: const TextStyle(fontSize: 14)),
          Text('第 ${safeActive + 1} / ${paper.questions.length} 问',
              style: const TextStyle(color: Color(0xFF707684), fontSize: 10))
        ]),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          IconButton(
              onPressed: () => _lawSearch(context),
              tooltip: '查询法条',
              icon: const Icon(Icons.menu_book_outlined,
                  color: Color(0xFF4C4BEA)))
        ],
      ),
      body: Column(children: [
        if (saveError != null)
          MaterialBanner(
              content: Text(saveError!),
              leading: const Icon(Icons.error_outline),
              actions: [
                TextButton(
                    onPressed: () => setState(() => saveError = null),
                    child: const Text('关闭'))
              ]),
        Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Row(
                children: List.generate(
                    paper.questions.length,
                    (index) => Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                            onTap: () => setState(() => active = index),
                            borderRadius: BorderRadius.circular(4),
                            child: Container(
                                width: 32,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                    color: active == index
                                        ? const Color(0xFF4C4BEA)
                                        : controllers[index].text.isNotEmpty
                                            ? const Color(0xFFEAF6EF)
                                            : const Color(0xFFF4F5F7),
                                    borderRadius: BorderRadius.circular(4)),
                                child: Text('${index + 1}',
                                    style: TextStyle(
                                        color: active == index
                                            ? Colors.white
                                            : const Color(0xFF707684),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600)))))))),
        Expanded(
          child: ListView(padding: const EdgeInsets.all(16), children: [
            Row(children: [
              _Tag('${paper.year}年', const Color(0xFFFFFFFF),
                  const Color(0xFF707684)),
              const SizedBox(width: 6),
              _Tag(paper.difficulty, const Color(0xFFFFF1E8),
                  const Color(0xFFD2691E)),
              const SizedBox(width: 8),
              Text('建议${paper.suggestMinutes}分钟',
                  style:
                      const TextStyle(color: Color(0xFF707684), fontSize: 11))
            ]),
            const SizedBox(height: 12),
            Text(paper.title,
                style: const TextStyle(
                    color: Color(0xFF171925),
                    fontSize: 16,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8)),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(paper.content,
                          style: const TextStyle(
                              color: Color(0xFF5F6574),
                              fontSize: 13,
                              height: 1.75)),
                      ...paper.questions.asMap().entries.map((entry) => Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                              '${entry.key + 1}. ${entry.value.prompt}（${entry.value.maxScore}分）',
                              style: const TextStyle(
                                  color: Color(0xFF343846),
                                  fontSize: 13,
                                  height: 1.6))))
                    ])),
          ]),
        ),
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: SafeArea(
              top: false,
              child: Column(children: [
                Row(
                    children: List.generate(
                        paper.questions.length,
                        (index) => Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ChoiceChip(
                                label: Text('第${_chineseNumber(index)}问'),
                                selected: safeActive == index,
                                onSelected: (_) =>
                                    setState(() => active = index))))),
                const SizedBox(height: 8),
                TextField(
                    controller: currentController,
                    minLines: 3,
                    maxLines: 5,
                    onChanged: (_) => setState(() => savedAt = null),
                    decoration: InputDecoration(
                        hintText: '在此输入您的回答…',
                        filled: true,
                        fillColor: const Color(0xFFF8F9FA),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                const BorderSide(color: Color(0xFFE5E7ED))))),
                const SizedBox(height: 5),
                Row(children: [
                  Text(
                      draftUnsynced
                          ? '未同步'
                          : savedAt == null
                              ? (widget.remoteEnabled && answered > 0
                                  ? '未保存'
                                  : '')
                              : '草稿已保存 $savedAt',
                      style: const TextStyle(
                          color: Color(0xFF707684), fontSize: 11)),
                  const Spacer(),
                  Text('${currentController.text.length} 字',
                      style: const TextStyle(
                          color: Color(0xFF707684), fontSize: 11))
                ]),
                const SizedBox(height: 8),
                Row(children: [
                  OutlinedButton.icon(
                      onPressed: submitting || savingDraft ? null : _saveDraft,
                      icon: const Icon(Icons.save_outlined, size: 16),
                      label: Text(savingDraft ? '保存中…' : '保存')),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                      onPressed: submitting ||
                              (widget.remoteEnabled &&
                                  !paper.questions.isNotEmpty)
                          ? null
                          : () => setState(() => attachment =
                              attachment == null ? '答题照片.jpg' : null),
                      icon: Icon(
                          attachment == null
                              ? Icons.attach_file
                              : Icons.attach_file_outlined,
                          size: 16),
                      label: Text(attachment ?? '附件')),
                  const SizedBox(width: 8),
                  Expanded(
                      child: FilledButton(
                          onPressed: submitting
                              ? null
                              : safeActive < paper.questions.length - 1
                                  ? () =>
                                      setState(() => active = safeActive + 1)
                                  : () => _confirmSubmit(context, paper),
                          style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF4C4BEA),
                              minimumSize: const Size.fromHeight(42)),
                          child: Text(submitting
                              ? '提交中…'
                              : safeActive < paper.questions.length - 1
                                  ? '下一问'
                                  : '提交作答'))),
                ]),
              ])),
        ),
      ]),
    );
  }

  Future<void> _saveDraft() async {
    if (!widget.remoteEnabled) {
      setState(() {
        savedAt = '刚刚';
        draftUnsynced = false;
      });
      return;
    }
    final questionId = widget.questionId;
    if (questionId == null || questionId.isEmpty) {
      setState(() {
        draftUnsynced = true;
        saveError = '当前题目缺少编号，无法保存云端草稿。';
      });
      return;
    }
    setState(() {
      savingDraft = true;
      saveError = null;
    });
    try {
      await ref.read(questionRepositoryProvider).saveDraft(
            questionId,
            controllers.map((controller) => controller.text).toList(),
          );
      if (!mounted) return;
      setState(() {
        savingDraft = false;
        savedAt = '刚刚';
        draftUnsynced = false;
        saveError = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        savingDraft = false;
        savedAt = null;
        draftUnsynced = true;
        saveError = '云端草稿保存失败：${_subjectiveError(error)}，请检查网络后重试。';
      });
    }
  }

  void _confirmSubmit(BuildContext context, _SubjectivePaper paper) {
    final answered = controllers
        .where((controller) => controller.text.trim().isNotEmpty)
        .length;
    showDialog<void>(
        context: context,
        builder: (dialogContext) => AlertDialog(
                title: const Text('确认提交'),
                content: Text(
                    '共 ${paper.questions.length} 个小问，已作答 $answered 个。提交后将进入批改流程。'),
                actions: [
                  TextButton(
                      onPressed: submitting
                          ? null
                          : () => Navigator.pop(dialogContext),
                      child: const Text('继续修改')),
                  FilledButton(
                      onPressed: submitting
                          ? null
                          : () {
                              Navigator.pop(dialogContext);
                              unawaited(_submit(context, paper));
                            },
                      child: Text(submitting ? '提交中…' : '提交作答'))
                ]));
  }

  Future<void> _submit(BuildContext context, _SubjectivePaper paper) async {
    final navigator = Navigator.of(context);
    setState(() => submitting = true);
    try {
      if (widget.remoteEnabled && widget.questionId != null) {
        final answers = paper.questions.asMap().entries.map((entry) {
          return <String, dynamic>{
            'subQuestionId': entry.value.id,
            'text': controllers[entry.key].text.trim(),
            'attachments': attachment == null ? <String>[] : [attachment],
          };
        }).toList(growable: false);
        final result = await ref.read(gradingRepositoryProvider).submit(
              questionId: widget.questionId!,
              paperId: widget.paperId,
              answers: answers,
              idempotencyKey:
                  'flutter-${widget.questionId}-${DateTime.now().microsecondsSinceEpoch}',
            );
        if (!mounted) return;
        setState(() => submitting = false);
        navigator.pushReplacement(MaterialPageRoute(
            builder: (_) => SubjectiveSubmitSuccessScreen(
                submissionId: result.id,
                status: result.status,
                reportTitle: paper.title,
                paperId: widget.paperId,
                remoteEnabled: true)));
        return;
      }
      if (!mounted) return;
      setState(() => submitting = false);
      navigator.pushReplacement(MaterialPageRoute(
          builder: (_) => const SubjectiveSubmitSuccessScreen()));
    } catch (error) {
      if (!mounted) return;
      setState(() {
        submitting = false;
        saveError = '提交失败：${_subjectiveError(error)}，请检查网络后重试。';
      });
    }
  }

  void _lawSearch(BuildContext context) {
    // RC/RN opens the full law/forum surface so users can search, browse by
    // subject, inspect the article, and return to the draft without losing it.
    Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => LawSearchScreen(
              remoteEnabled: widget.remoteEnabled,
              source: 'subjective-answer',
              subject: widget.subject,
            )));
  }
}

class SubjectiveSubmitSuccessScreen extends StatelessWidget {
  const SubjectiveSubmitSuccessScreen({
    super.key,
    this.submissionId,
    this.status,
    this.reportTitle,
    this.paperId,
    this.remoteEnabled = false,
  });

  final String? submissionId;
  final String? status;
  final String? reportTitle;
  final String? paperId;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) {
    final hasSubmission = submissionId?.trim().isNotEmpty == true;
    final hasPaper = paperId?.trim().isNotEmpty == true;
    final title = reportTitle?.trim().isNotEmpty == true
        ? reportTitle!.trim()
        : '主观题批改报告';
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                      color: Color(0xFFEAF6EF), shape: BoxShape.circle),
                  child: const Icon(Icons.check,
                      color: Color(0xFF5DA765), size: 38)),
              const SizedBox(height: 20),
              const Text('提交成功',
                  style: TextStyle(
                      color: Color(0xFF171925),
                      fontSize: 22,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text(
                  hasSubmission
                      ? '答案已提交至服务端批改流程（${status ?? 'submitted'}）。完成后会通过消息通知你。'
                      : '答案已进入 AI 首轮批改，随后由批改老师复核。完成后会通过消息通知你。',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Color(0xFF707684), fontSize: 13, height: 1.6)),
              const SizedBox(height: 28),
              FilledButton(
                  key: const ValueKey('grading-success-question-bank'),
                  onPressed: () => _goQuestionBank(context),
                  style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF4C4BEA),
                      minimumSize: const Size.fromHeight(46)),
                  child: const Text('返回题库')),
              const SizedBox(height: 10),
              // Keep the RN success contract: this action opens the grading
              // history list, while the optional report action below opens a
              // single report directly.
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  key: const ValueKey('grading-success-records'),
                  onPressed: () => Navigator.push<void>(
                      context,
                      MaterialPageRoute(
                          builder: (_) => GradingServiceScreen(
                              remoteEnabled: remoteEnabled))),
                  icon: const Icon(Icons.receipt_long_outlined, size: 17),
                  label: const Text('查看批改记录'),
                ),
              ),
              if (hasPaper) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    key: const ValueKey('grading-success-paper'),
                    onPressed: () => Navigator.push<void>(
                        context,
                        MaterialPageRoute(
                            builder: (_) => GradingPaperDetailScreen(
                                  title: title,
                                  paperId: paperId,
                                  remoteEnabled: remoteEnabled,
                                ))),
                    child: const Text('返回套卷'),
                  ),
                ),
              ],
              if (hasSubmission) ...[
                const SizedBox(height: 10),
                TextButton(
                    key: const ValueKey('grading-success-report'),
                    onPressed: () => Navigator.push<void>(
                        context,
                        MaterialPageRoute(
                            builder: (_) => GradingReportScreen(
                                  title: title,
                                  submissionId: submissionId,
                                  remoteEnabled: remoteEnabled,
                                ))),
                    child: const Text('查看批改报告')),
              ],
              TextButton(
                  key: const ValueKey('grading-success-home'),
                  onPressed: () => _goHome(context),
                  child: const Text('返回首页')),
            ],
          ),
        ),
      ),
    );
  }

  void _goHome(BuildContext context) {
    // GoRouter is available in the production shell and guarantees that the
    // selected tab is reset to the home route. Standalone widget previews do
    // not provide a router, so retain the safe Navigator fallback.
    final router = GoRouter.maybeOf(context);
    if (router != null) {
      router.go('/');
      return;
    }
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  void _goQuestionBank(BuildContext context) {
    // AppShell exposes the active tab through the root route query.  This
    // keeps the button's label truthful when the success page was opened from
    // another tab or as a standalone deep link.
    final router = GoRouter.maybeOf(context);
    if (router != null) {
      router.go('/?tab=questions');
      return;
    }
    Navigator.of(context).popUntil((route) => route.isFirst);
  }
}

class _SubjectiveState extends StatelessWidget {
  const _SubjectiveState({
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.loading = false,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool loading;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              if (loading)
                const SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(strokeWidth: 2.5))
              else
                Icon(icon, color: const Color(0xFFC0C5D0), size: 40),
              const SizedBox(height: 14),
              Text(title,
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              Text(message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Color(0xFF707684), fontSize: 12, height: 1.5)),
              if (actionLabel != null && onAction != null) ...[
                const SizedBox(height: 16),
                OutlinedButton(onPressed: onAction, child: Text(actionLabel!)),
              ],
            ])),
      );
}

class _Tag extends StatelessWidget {
  const _Tag(this.label, this.background, this.foreground);
  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
          color: background, borderRadius: BorderRadius.circular(4)),
      child: Text(label, style: TextStyle(color: foreground, fontSize: 11)));
}

_SubjectivePaper _localPaperFor(String title) {
  return _localPapers.firstWhere(
    (paper) => paper.title == title,
    orElse: () => _localPapers.first,
  );
}

_SubjectivePaper _localPaperForSelection(
    String title, String subject, int questionIndex) {
  if (title.trim().isNotEmpty) return _localPaperFor(title);
  final subjectPapers =
      _localPapers.where((paper) => paper.subject == subject).toList();
  if (subjectPapers.isEmpty) return _localPapers.first;
  final safeIndex = questionIndex.clamp(0, subjectPapers.length - 1).toInt();
  return subjectPapers[safeIndex];
}

_SubjectivePaper _paperFromQuestion(GradingQuestion question) =>
    _SubjectivePaper.fromRemote(question);

String _chineseNumber(int index) {
  const values = ['一', '二', '三', '四', '五', '六', '七', '八'];
  return index >= 0 && index < values.length ? values[index] : '${index + 1}';
}

String _subjectiveError(Object? error) {
  if (error is ApiError) return error.message;
  if (error is TimeoutException) return '请求超时';
  return '网络暂时不可用';
}
