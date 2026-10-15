import '../../core/config/app_environment.dart';
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../data/repositories.dart';
import 'security_screens.dart';
import '../community/forum_screens.dart';
import '../auth/login_screen.dart';
import '../questions/subjective_screens.dart';
import '../../shared/route_back_button.dart';

const _brand = Color(0xFF4C4BEA);
const _page = Color(0xFFF4F5F7);
const _ink = Color(0xFF171925);
const _body = Color(0xFF5F6574);
const _muted = Color(0xFF707684);
const _line = Color(0xFFE5E7ED);

enum _ProfileFieldKey { nickname, phone, goal, stage, school }

class _ProfileFieldDefinition {
  const _ProfileFieldDefinition({
    required this.key,
    required this.label,
    this.inputType = _ProfileInputType.text,
    this.options = const <String>[],
  });

  final _ProfileFieldKey key;
  final String label;
  final _ProfileInputType inputType;
  final List<String> options;
}

enum _ProfileInputType { text, select }

const _profileFields = <_ProfileFieldDefinition>[
  _ProfileFieldDefinition(key: _ProfileFieldKey.nickname, label: '昵称'),
  _ProfileFieldDefinition(key: _ProfileFieldKey.phone, label: '手机号'),
  _ProfileFieldDefinition(key: _ProfileFieldKey.goal, label: '备考目标'),
  _ProfileFieldDefinition(
    key: _ProfileFieldKey.stage,
    label: '备考阶段',
    inputType: _ProfileInputType.select,
    options: <String>[
      '客观题备考阶段',
      '客观题精讲阶段',
      '客观题冲刺阶段',
      '主观题备考阶段',
      '主观题冲刺阶段',
    ],
  ),
  _ProfileFieldDefinition(key: _ProfileFieldKey.school, label: '学校/单位'),
];

// Keeps a successful read action visible while the remote list is refreshed.
final notificationReadOverridesProvider =
    StateProvider<Set<String>>((ref) => <String>{});

class UserProfileScreen extends StatelessWidget {
  const UserProfileScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) => ProviderScope(
        child: _UserProfileBody(remoteEnabled: remoteEnabled),
      );
}

class _UserProfileBody extends ConsumerStatefulWidget {
  const _UserProfileBody({required this.remoteEnabled});
  final bool remoteEnabled;

  @override
  ConsumerState<_UserProfileBody> createState() => _UserProfileState();
}

class _UserProfileState extends ConsumerState<_UserProfileBody> {
  final nickname = TextEditingController(text: '李明远');
  String goal = '2024年法律职业资格考试';
  String stage = '客观题精讲阶段';
  String school = '未填写';
  String? hydratedUserId;
  String? avatarColorValue;
  bool saving = false;
  bool saved = false;
  String? saveError;
  Timer? savedTimer;

  @override
  void initState() {
    super.initState();
    avatarColorValue = '#4C4BEA';
  }

  @override
  void dispose() {
    savedTimer?.cancel();
    nickname.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final remoteState =
        widget.remoteEnabled ? ref.watch(currentUserProvider) : null;
    if (widget.remoteEnabled &&
        remoteState!.isLoading &&
        !remoteState.hasValue) {
      return _profileStatus(const CircularProgressIndicator(
          key: ValueKey('user-profile-loading')));
    }
    if (widget.remoteEnabled &&
        remoteState!.hasError &&
        !remoteState.hasValue) {
      return _profileStatus(
        Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.cloud_off_outlined, color: _muted, size: 32),
          const SizedBox(height: 10),
          const Text('账号资料暂时无法加载',
              style: TextStyle(
                  color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(_accountError(remoteState.error!),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(color: _muted, fontSize: 11)),
          const SizedBox(height: 10),
          OutlinedButton.icon(
              key: const ValueKey('user-profile-retry'),
              onPressed: () => ref.invalidate(currentUserProvider),
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('重试')),
        ]),
      );
    }
    final remoteUser = remoteState?.valueOrNull;
    _scheduleHydrate(remoteUser);
    final displayName = nickname.text;
    final examYear = _extractExamYear(goal) ?? remoteUser?.examYear ?? '2024';
    final phone =
        widget.remoteEnabled ? _maskPhone(remoteUser?.phone) : '138****8888';
    final avatarColor = _colorFromHex(widget.remoteEnabled
        ? (remoteUser?.avatarColor ?? avatarColorValue)
        : '#4C4BEA');
    return Scaffold(
      backgroundColor: _page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('账号资料'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white),
      body: ListView(padding: const EdgeInsets.only(bottom: 24), children: [
        if (saved)
          Container(
              key: const ValueKey('user-profile-saved-banner'),
              height: 42,
              margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                  color: const Color(0xFFEAF6EF),
                  border: Border.all(color: const Color(0x4D5DA765)),
                  borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                Container(
                    width: 16,
                    height: 16,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                        color: Color(0xFF5DA765), shape: BoxShape.circle),
                    child:
                        const Icon(Icons.check, color: Colors.white, size: 11)),
                const SizedBox(width: 8),
                const Text('已保存修改',
                    style: TextStyle(
                        color: Color(0xFF3A7A46),
                        fontSize: 13,
                        fontWeight: FontWeight.w500))
              ])),
        if (saveError != null)
          Container(
              key: const ValueKey('user-profile-save-error'),
              margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                  color: const Color(0xFFFFF1EE),
                  borderRadius: BorderRadius.circular(8)),
              child: Text(saveError!,
                  style:
                      const TextStyle(color: Color(0xFFB13B25), fontSize: 12))),
        Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              Stack(children: [
                CircleAvatar(
                    radius: 32,
                    backgroundColor: avatarColor,
                    child: Text(nickname.text.isEmpty ? '我' : nickname.text[0],
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 23,
                            fontWeight: FontWeight.w700))),
                Positioned(
                    right: -1,
                    bottom: -1,
                    child: CircleAvatar(
                        radius: 10,
                        backgroundColor: avatarColor,
                        child: const Icon(Icons.camera_alt_outlined,
                            color: Colors.white, size: 11)))
              ]),
              const SizedBox(width: 14),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(displayName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: _ink,
                            fontSize: 16,
                            fontWeight: FontWeight.w700)),
                    const SizedBox(height: 3),
                    Text('$examYear年法律职业资格考试',
                        style: TextStyle(color: _muted, fontSize: 12)),
                    const SizedBox(height: 5),
                    InkWell(
                        onTap: () => _chooseAvatarColor(context, avatarColor),
                        child: const Text('更换头像颜色',
                            style: TextStyle(color: _brand, fontSize: 12)))
                  ]))
            ])),
        Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(children: [
              _field(context, _profileFields[0], nickname.text),
              _field(context, _profileFields[1], phone, locked: true),
              _field(context, _profileFields[2], goal),
              _field(context, _profileFields[3], stage),
              _field(context, _profileFields[4], school,
                  last: true, placeholder: school == '未填写'),
            ])),
        Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: const Text('账号安全',
                style: TextStyle(color: _muted, fontSize: 12))),
        Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(children: [
              _securityEntry(context, '修改密码', '上次修改：90天前'),
              const Divider(height: 1),
              _securityEntry(context, '绑定微信', '已绑定'),
              const Divider(height: 1),
              _securityEntry(context, '注销账号', '删除所有数据', danger: true),
            ])),
      ]),
    );
  }

  String _valueFor(_ProfileFieldKey key) => switch (key) {
        _ProfileFieldKey.nickname => nickname.text,
        _ProfileFieldKey.phone => '138****8888',
        _ProfileFieldKey.goal => goal,
        _ProfileFieldKey.stage => stage,
        _ProfileFieldKey.school => school,
      };

  void _setValue(_ProfileFieldKey key, String value) {
    switch (key) {
      case _ProfileFieldKey.nickname:
        nickname.value = nickname.value.copyWith(text: value);
      case _ProfileFieldKey.phone:
        break;
      case _ProfileFieldKey.goal:
        goal = value;
      case _ProfileFieldKey.stage:
        stage = value;
      case _ProfileFieldKey.school:
        school = value;
    }
  }

  String? _extractExamYear(String value) =>
      RegExp(r'20\d{2}').firstMatch(value)?.group(0);

  Future<void> _editField(
      BuildContext context, _ProfileFieldDefinition field) async {
    final initial = _valueFor(field.key);
    final controller = field.inputType == _ProfileInputType.text
        ? TextEditingController(text: initial)
        : null;
    var draft = initial;
    final result = await showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (sheetContext) => StatefulBuilder(
              builder: (context, setSheetState) {
                final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
                return Padding(
                    padding: EdgeInsets.only(bottom: bottomInset),
                    child: SafeArea(
                        top: false,
                        child: Container(
                            key: const ValueKey('profile-edit-sheet'),
                            decoration: const BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.vertical(
                                    top: Radius.circular(12))),
                            padding: const EdgeInsets.only(bottom: 24),
                            child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                          child: Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 20),
                                              child: Text('修改${field.label}',
                                                  style: const TextStyle(
                                                      color: _ink,
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.w700)))),
                                      IconButton(
                                          key: const ValueKey(
                                              'profile-edit-close'),
                                          tooltip: '关闭编辑',
                                          onPressed: () =>
                                              Navigator.pop(sheetContext),
                                          icon: const Icon(Icons.close,
                                              color: _body, size: 20))
                                    ],
                                  ),
                                  const Divider(height: 1),
                                  if (field.inputType ==
                                      _ProfileInputType.select)
                                    Padding(
                                        padding: const EdgeInsets.fromLTRB(
                                            20, 10, 20, 18),
                                        child: Column(
                                            children:
                                                field.options.map((option) {
                                          final selected = draft == option;
                                          return Padding(
                                              padding: const EdgeInsets.only(
                                                  bottom: 8),
                                              child: InkWell(
                                                  key: ValueKey(
                                                      'profile-stage-$option'),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                  onTap: () => setSheetState(
                                                      () => draft = option),
                                                  child: Container(
                                                      height: 52,
                                                      padding:
                                                          const EdgeInsets.symmetric(
                                                              horizontal: 16),
                                                      decoration: BoxDecoration(
                                                          color: selected
                                                              ? const Color(
                                                                  0xFFF0F0FF)
                                                              : Colors.white,
                                                          border: Border.all(
                                                              color: selected
                                                                  ? _brand
                                                                  : const Color(
                                                                      0xFFE5E7ED)),
                                                          borderRadius:
                                                              BorderRadius.circular(12)),
                                                      child: Row(children: [
                                                        Expanded(
                                                            child: Text(option,
                                                                style: TextStyle(
                                                                    color: selected
                                                                        ? _brand
                                                                        : _body,
                                                                    fontSize:
                                                                        14,
                                                                    fontWeight: selected
                                                                        ? FontWeight
                                                                            .w600
                                                                        : FontWeight
                                                                            .normal))),
                                                        if (selected)
                                                          const Icon(
                                                              Icons.check,
                                                              color: _brand,
                                                              size: 18)
                                                      ]))));
                                        }).toList())),
                                  if (field.inputType == _ProfileInputType.text)
                                    Padding(
                                        padding: const EdgeInsets.fromLTRB(
                                            20, 12, 20, 20),
                                        child: Column(children: [
                                          TextField(
                                              key: const ValueKey(
                                                  'profile-edit-input'),
                                              controller: controller,
                                              autofocus: true,
                                              maxLength: 30,
                                              onChanged: (value) =>
                                                  setSheetState(
                                                      () => draft = value),
                                              decoration: const InputDecoration(
                                                  counterText: '',
                                                  filled: true,
                                                  fillColor: _page,
                                                  contentPadding:
                                                      EdgeInsets.symmetric(
                                                          horizontal: 16),
                                                  enabledBorder: OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                          color: _brand),
                                                      borderRadius: BorderRadius.all(
                                                          Radius.circular(12))),
                                                  focusedBorder: OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                          color: _brand),
                                                      borderRadius:
                                                          BorderRadius.all(
                                                              Radius.circular(12))))),
                                          Align(
                                              alignment: Alignment.centerRight,
                                              child: Text(
                                                  '${draft.length} / 30',
                                                  style: const TextStyle(
                                                      color: Color(0xFFC0C5D0),
                                                      fontSize: 11)))
                                        ])),
                                  Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 20),
                                      child: Row(children: [
                                        Expanded(
                                            child: OutlinedButton(
                                                key: const ValueKey(
                                                    'profile-edit-cancel'),
                                                onPressed: () => Navigator.pop(
                                                    sheetContext),
                                                style: OutlinedButton.styleFrom(
                                                    minimumSize: const Size
                                                        .fromHeight(48),
                                                    foregroundColor: _body,
                                                    side: const BorderSide(
                                                        color:
                                                            Color(0xFFE5E7ED)),
                                                    shape:
                                                        RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        12))),
                                                child: const Text('取消'))),
                                        const SizedBox(width: 8),
                                        Expanded(
                                            child: FilledButton(
                                                key: const ValueKey(
                                                    'profile-edit-save'),
                                                onPressed: () => Navigator.pop(
                                                    sheetContext, draft),
                                                style: FilledButton.styleFrom(
                                                    minimumSize: const Size
                                                        .fromHeight(48),
                                                    backgroundColor: _brand,
                                                    shape:
                                                        RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        12))),
                                                child: const Text('保存')))
                                      ]))
                                ]))));
              },
            ));
    // The modal route resolves when pop is requested, before its closing
    // animation finishes rebuilding the sheet. Defer disposal until that
    // animation has detached the TextField from the tree.
    if (controller != null) {
      final pendingController = controller;
      Future<void>.delayed(
          const Duration(milliseconds: 400), pendingController.dispose);
    }
    if (!mounted || result == null) return;
    final value = result.trim().isEmpty ? initial : result.trim();
    await _applyField(field.key, value, initial);
  }

  Future<void> _applyField(
      _ProfileFieldKey key, String value, String previous) async {
    _setValue(key, value);
    if (mounted) {
      setState(() {
        saveError = null;
        saved = false;
      });
    }
    final needsRemoteSave = widget.remoteEnabled &&
        (key == _ProfileFieldKey.nickname || key == _ProfileFieldKey.goal);
    if (!needsRemoteSave) {
      _markSaved();
      return;
    }
    final current = ref.read(currentUserProvider).valueOrNull;
    if (current == null) {
      if (mounted) {
        setState(() {
          _setValue(key, previous);
          saveError = '账号资料暂时不可用';
        });
      }
      return;
    }
    if (key == _ProfileFieldKey.nickname && value.trim().isEmpty) {
      if (mounted) {
        setState(() {
          _setValue(key, previous);
          saveError = '昵称不能为空';
        });
      }
      return;
    }
    setState(() {
      saving = true;
      saveError = null;
    });
    try {
      final updated = await ref.read(userRepositoryProvider).update({
        'name': key == _ProfileFieldKey.nickname ? value : current.name,
        'examYear': key == _ProfileFieldKey.goal
            ? (_extractExamYear(value) ?? current.examYear ?? '2024')
            : (current.examYear ?? '2024'),
        if (avatarColorValue != null) 'avatarColor': avatarColorValue,
      });
      if (!mounted) return;
      if (key == _ProfileFieldKey.nickname) {
        _setValue(key, updated.name);
      }
      hydratedUserId = updated.id;
      avatarColorValue = updated.avatarColor ?? avatarColorValue;
      ref.invalidate(currentUserProvider);
      setState(() => saving = false);
      _markSaved();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        saving = false;
        _setValue(key, previous);
        saveError = _accountError(error);
      });
    }
  }

  void _markSaved() {
    if (!mounted) return;
    savedTimer?.cancel();
    setState(() {
      saved = true;
      saveError = null;
    });
    savedTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) setState(() => saved = false);
    });
  }

  String _accountError(Object error) {
    if (error is ApiError) return error.message;
    return '资料保存失败，请检查网络后重试';
  }

  void _scheduleHydrate(UserProfile? profile) {
    if (!widget.remoteEnabled ||
        profile == null ||
        hydratedUserId == profile.id) {
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || hydratedUserId == profile.id) return;
      hydratedUserId = profile.id;
      nickname.value = nickname.value.copyWith(text: profile.name);
      goal = '${profile.examYear ?? '2024'}年法律职业资格考试';
      avatarColorValue = profile.avatarColor ?? '#4C4BEA';
      setState(() {});
    });
  }

  Widget _profileStatus(Widget body) => Scaffold(
        backgroundColor: _page,
        appBar: AppBar(
            leading: const DebaoRouteBackButton(),
            title: const Text('账号资料'),
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white),
        body: Center(
            child: Padding(padding: const EdgeInsets.all(28), child: body)),
      );

  String _maskPhone(String? value) {
    final phone = value?.trim() ?? '';
    if (phone.length != 11) return phone.isEmpty ? '未绑定' : phone;
    return '${phone.substring(0, 3)}****${phone.substring(7)}';
  }

  Color _colorFromHex(String? value) {
    final raw = (value ?? '').replaceFirst('#', '');
    final parsed = int.tryParse(raw, radix: 16);
    return parsed == null ? _brand : Color(0xFF000000 | parsed);
  }

  Future<void> _chooseAvatarColor(BuildContext context, Color current) async {
    const colors = <String>[
      '#4C4BEA',
      '#C0385A',
      '#3A7A46',
      '#A87000',
      '#1A5FA8',
      '#1A8B8B',
    ];
    final selected = await showModalBottomSheet<String>(
        context: context,
        backgroundColor: Colors.white,
        builder: (sheetContext) => SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  children: colors
                      .map((value) => InkWell(
                            onTap: () => Navigator.pop(sheetContext, value),
                            borderRadius: BorderRadius.circular(28),
                            child: CircleAvatar(
                              radius: 24,
                              backgroundColor: _colorFromHex(value),
                              child: _colorFromHex(value) == current
                                  ? const Icon(Icons.check, color: Colors.white)
                                  : null,
                            ),
                          ))
                      .toList(),
                ),
              ),
            ));
    if (!mounted || selected == null || selected == avatarColorValue) return;
    if (!widget.remoteEnabled) {
      setState(() => avatarColorValue = selected);
      _markSaved();
      return;
    }
    setState(() {
      avatarColorValue = selected;
      saving = true;
      saveError = null;
    });
    try {
      final profile = ref.read(currentUserProvider).valueOrNull;
      if (profile == null)
        throw const ApiError('PROFILE_UNAVAILABLE', '账号资料暂时不可用');
      await ref.read(userRepositoryProvider).update({
        'name': profile.name,
        'examYear': profile.examYear ?? '2024',
        'avatarColor': selected,
      });
      ref.invalidate(currentUserProvider);
      _markSaved();
    } catch (error) {
      if (mounted) {
        setState(() {
          avatarColorValue = '#4C4BEA';
          saveError = _accountError(error);
        });
      }
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  Widget _field(
      BuildContext context, _ProfileFieldDefinition field, String value,
      {bool locked = false, bool last = false, bool placeholder = false}) {
    final row = Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        decoration: BoxDecoration(
            border: last
                ? null
                : const Border(bottom: BorderSide(color: Color(0xFFE5E7ED)))),
        child: Row(children: [
          SizedBox(
              width: 72,
              child: Text(field.label,
                  style: const TextStyle(color: _muted, fontSize: 14))),
          Expanded(
              child: Text(value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      color: placeholder ? const Color(0xFFC0C5D0) : _ink,
                      fontSize: 14))),
          if (locked)
            const Text('不可修改',
                style: TextStyle(color: Color(0xFFC0C5D0), fontSize: 11))
          else
            const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0), size: 17)
        ]));
    final keyed = KeyedSubtree(
        key: ValueKey('profile-field-${field.key.name}'), child: row);
    if (locked) return keyed;
    return InkWell(
        onTap: saving ? null : () => _editField(context, field), child: keyed);
  }

  Widget _securityEntry(BuildContext context, String title, String subtitle,
          {bool danger = false}) =>
      Material(
        color: Colors.white,
        child: ListTile(
          onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => AccountSecurityScreen(
                      remoteEnabled: widget.remoteEnabled))),
          title: Text(title,
              style: TextStyle(color: danger ? const Color(0xFFFF7252) : _ink)),
          subtitle: Text(subtitle),
          trailing: const Icon(Icons.chevron_right,
              color: Color(0xFFC0C5D0), size: 17),
        ),
      );
}

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsState();
}

class _SettingsState extends ConsumerState<SettingsScreen> {
  bool notices = true;
  bool savingNotice = false;
  bool loggingOut = false;
  @override
  Widget build(BuildContext context) {
    final remote =
        widget.remoteEnabled ? ref.watch(userSettingsProvider) : null;
    final remoteSettings = remote?.valueOrNull;
    final remoteReady = !widget.remoteEnabled || (remote?.hasValue ?? false);
    final effectiveNotices = widget.remoteEnabled
        ? (remoteSettings?.learningReminders ?? false)
        : notices;
    final body = ListView(padding: EdgeInsets.zero, children: [
      if (widget.remoteEnabled && remote?.hasError == true && !remote!.hasValue)
        MaterialBanner(
            key: const ValueKey('settings-error'),
            content: const Text('设置服务暂时不可用，修改通知偏好前请重试'),
            leading: const Icon(Icons.cloud_off_outlined),
            actions: [
              TextButton(
                  onPressed: () => ref.invalidate(userSettingsProvider),
                  child: const Text('重试'))
            ]),
      if (widget.remoteEnabled &&
          remote?.isLoading == true &&
          !remote!.hasValue)
        const LinearProgressIndicator(key: ValueKey('settings-loading')),
      const Padding(
          padding: EdgeInsets.only(bottom: 6),
          child: Text('通知', style: TextStyle(color: _muted, fontSize: 12))),
      _group([
        SwitchListTile(
          title: const Text('学习提醒'),
          subtitle: Text(remoteReady ? '每日学习计划提醒' : '正在读取服务端设置…'),
          value: effectiveNotices,
          activeColor: _brand,
          onChanged: savingNotice ||
                  !remoteReady ||
                  (widget.remoteEnabled && remote?.hasError == true)
              ? null
              : (value) => _setLearningReminders(value),
        ),
        const ListTile(
          title: Text('课程更新通知'),
          trailing: Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)),
        ),
        const ListTile(
          title: Text('订单通知'),
          trailing: Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)),
        ),
      ]),
      const Padding(
          padding: EdgeInsets.only(top: 16, bottom: 6),
          child: Text('隐私', style: TextStyle(color: _muted, fontSize: 12))),
      _group([
        ListTile(
            title: const Text('账号与安全'),
            trailing: const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)),
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => AccountSecurityScreen(
                        remoteEnabled: widget.remoteEnabled)))),
        ListTile(
            title: const Text('隐私政策'),
            trailing: const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)),
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => LegalDocumentScreen(
                        document: 'privacy',
                        remoteEnabled: widget.remoteEnabled))))
      ]),
      const Padding(
          padding: EdgeInsets.only(top: 16, bottom: 6),
          child: Text('关于', style: TextStyle(color: _muted, fontSize: 12))),
      _group([
        const ListTile(title: Text('版本信息'), subtitle: Text('v2.4.1')),
        ListTile(
            title: const Text('用户协议'),
            trailing: const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)),
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => LegalDocumentScreen(
                        document: 'terms',
                        remoteEnabled: widget.remoteEnabled)))),
        const ListTile(
            title: Text('联系客服'),
            trailing: Icon(Icons.chevron_right, color: Color(0xFFC0C5D0)))
      ]),
      const SizedBox(height: 16),
      SizedBox(
          width: double.infinity,
          height: 46,
          child: TextButton(
              style: TextButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFFFF7252),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding: EdgeInsets.zero),
              onPressed: () => showDialog<void>(
                  context: context,
                  builder: (dialogContext) => AlertDialog(
                          title: const Text('确认退出登录'),
                          content: const Text('退出后需要重新登录才能访问您的学习数据。'),
                          actions: [
                            TextButton(
                                onPressed: () => Navigator.pop(dialogContext),
                                child: const Text('取消')),
                            FilledButton(
                                onPressed: () {
                                  Navigator.pop(dialogContext);
                                  unawaited(_logout(context));
                                },
                                child: const Text('退出登录'))
                          ])),
              child: const Text('退出登录',
                  style: TextStyle(color: Color(0xFFFF7252))))),
    ]);
    return _AccountPage(title: '设置与隐私', child: body);
  }

  Future<void> _setLearningReminders(bool value) async {
    if (!widget.remoteEnabled) {
      setState(() => notices = value);
      return;
    }
    setState(() {
      savingNotice = true;
      notices = value;
    });
    try {
      await ref
          .read(settingsRepositoryProvider)
          .update(learningReminders: value);
      ref.invalidate(userSettingsProvider);
    } catch (error) {
      if (!mounted) return;
      setState(() => notices = !value);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(_settingsError(error))));
    } finally {
      if (mounted) setState(() => savingNotice = false);
    }
  }

  String _settingsError(Object error) =>
      error is ApiError ? error.message : '设置保存失败，请检查网络后重试';

  Future<void> _logout(BuildContext context) async {
    if (loggingOut) return;
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => loggingOut = true);
    Object? failure;
    if (widget.remoteEnabled) {
      try {
        await ref.read(authRepositoryProvider).logout();
      } catch (error) {
        // AuthRepository clears local credentials in its finally block. A
        // network failure should not trap the user on an authenticated page.
        failure = error;
      }
    }
    if (!mounted) return;
    setState(() => loggingOut = false);
    navigator.pushReplacement(MaterialPageRoute(
        builder: (_) => LoginScreen(remoteEnabled: widget.remoteEnabled)));
    if (failure != null) {
      messenger.showSnackBar(SnackBar(content: Text(_settingsError(failure))));
    }
  }

  Widget _group(List<Widget> children) => Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children));
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context) =>
      ProviderScope(child: _NotificationsBody(remoteEnabled: remoteEnabled));
}

class _NotificationsBody extends ConsumerWidget {
  const _NotificationsBody({required this.remoteEnabled});
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remote = remoteEnabled
        ? ref.watch(notificationsProvider)
        : const AsyncValue<List<NotificationItem>>.data([]);
    final items = remote.asData?.value;
    final readOverrides = ref.watch(notificationReadOverridesProvider);
    if (remote.isLoading && !remote.hasValue)
      return const _AccountPage(
          title: '消息通知', child: Center(child: CircularProgressIndicator()));
    if (remoteEnabled && remote.hasError && !remote.hasValue) {
      return _AccountPage(
          title: '消息通知',
          child: Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, color: _muted, size: 32),
            const SizedBox(height: 10),
            const Text('通知服务暂时不可用',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text('${remote.error}',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(color: _muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('notifications-retry'),
                onPressed: () => ref.invalidate(notificationsProvider),
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重试')),
          ])));
    }
    final fallback = const [
      _NoticeRow(
          icon: Icons.notifications_none,
          bg: Color(0xFFF0F0FF),
          color: _brand,
          title: '学习提醒',
          body: '您已连续3天未完成今日学习计划，距考试还有42天，继续加油！',
          time: '10分钟前',
          unread: true),
      Divider(height: 1),
      _NoticeRow(
          icon: Icons.menu_book_outlined,
          bg: Color(0xFFEAF6EF),
          color: Color(0xFF3A7A46),
          title: '课程通知',
          body: '民法精讲课第19讲已上线，点击继续学习。',
          time: '1小时前',
          unread: true),
      Divider(height: 1),
      _NoticeRow(
          icon: Icons.shopping_bag_outlined,
          bg: Color(0xFFFFF0F5),
          color: Color(0xFFC0385A),
          title: '订单通知',
          body: '您的订单已支付成功，课程权限已自动开通。',
          time: '昨天'),
      Divider(height: 1),
      _NoticeRow(
          icon: Icons.notifications_none,
          bg: Color(0xFFF0F0FF),
          color: _brand,
          title: '错题复习提醒',
          body: '您有错题待复习，建议今天完成巩固。',
          time: '前天'),
    ];
    return _AccountPage(
        title: '消息通知',
        child: Column(children: [
          if (remoteEnabled && remote.hasError)
            MaterialBanner(
                content: const Text('通知更新失败，当前保留已加载内容'),
                leading: const Icon(Icons.cloud_off_outlined),
                actions: [
                  TextButton(
                      onPressed: () => ref.invalidate(notificationsProvider),
                      child: const Text('重试'))
                ]),
          Container(
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(8)),
              child: Column(
                  children: !remoteEnabled
                      ? fallback
                      : (items == null || items.isEmpty)
                          ? const [
                              Padding(
                                  padding: EdgeInsets.all(28),
                                  child: _NoticeEmptyState()),
                            ]
                          : items
                              .map((item) => _NoticeRow(
                                  key: ValueKey('notification-${item.id}'),
                                  icon: _notificationIcon(item.title),
                                  bg: _notificationBackground(item.title),
                                  color: _notificationColor(item.title),
                                  title: item.title,
                                  body: item.body,
                                  time: item.createdAt,
                                  unread: !item.read &&
                                      !readOverrides.contains(item.id),
                                  onTap: item.read ||
                                          readOverrides.contains(item.id)
                                      ? null
                                      : () => _markRead(context, ref, item)))
                              .toList()))
        ]));
  }

  IconData _notificationIcon(String title) {
    if (title.contains('课程')) return Icons.menu_book_outlined;
    if (title.contains('订单')) return Icons.shopping_bag_outlined;
    return Icons.notifications_none;
  }

  Color _notificationBackground(String title) {
    if (title.contains('课程')) return const Color(0xFFEAF6EF);
    if (title.contains('订单')) return const Color(0xFFFFF0F5);
    return const Color(0xFFF0F0FF);
  }

  Color _notificationColor(String title) {
    if (title.contains('课程')) return const Color(0xFF3A7A46);
    if (title.contains('订单')) return const Color(0xFFC0385A);
    return _brand;
  }

  Future<void> _markRead(
      BuildContext context, WidgetRef ref, NotificationItem item) async {
    if (item.id.trim().isEmpty) return;
    try {
      await ref.read(communityRepositoryProvider).markNotificationRead(item.id);
      final notifier = ref.read(notificationReadOverridesProvider.notifier);
      notifier.state = {...notifier.state, item.id};
      ref.invalidate(notificationsProvider);
    } catch (error) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('标记已读失败：${_accountErrorMessage(error)}')));
    }
  }
}

class _NoticeEmptyState extends StatelessWidget {
  const _NoticeEmptyState();

  @override
  Widget build(BuildContext context) => const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.notifications_none, color: _muted, size: 28),
          SizedBox(height: 8),
          Text('暂无通知',
              style: TextStyle(
                  color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
          SizedBox(height: 4),
          Text('新的学习、课程和订单通知会显示在这里。',
              textAlign: TextAlign.center,
              style: TextStyle(color: _muted, fontSize: 12)),
        ],
      );
}

class _NoticeRow extends StatelessWidget {
  const _NoticeRow(
      {super.key,
      required this.icon,
      required this.bg,
      required this.color,
      required this.title,
      required this.body,
      required this.time,
      this.unread = false,
      this.onTap});
  final IconData icon;
  final Color bg, color;
  final String title, body, time;
  final bool unread;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final content = Container(
        color: unread ? const Color(0xFFFAFAFE) : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                  color: bg, borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: color, size: 18)),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Row(children: [
                  Text(title,
                      style: TextStyle(
                          color: unread ? _ink : _body,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                  const Spacer(),
                  Text(time,
                      style: const TextStyle(
                          color: Color(0xFFC0C5D0), fontSize: 10))
                ]),
                const SizedBox(height: 4),
                Text(body,
                    style: const TextStyle(
                        color: _muted, fontSize: 12, height: 1.5))
              ])),
          if (unread)
            const Padding(
                padding: EdgeInsets.only(left: 6, top: 3),
                child: CircleAvatar(radius: 4, backgroundColor: _brand))
        ]));
    if (onTap == null) return content;
    return Material(
        color: Colors.transparent,
        child: InkWell(onTap: onTap, child: content));
  }
}

/// The AI screen intentionally keeps its local fixture behaviour in sync with
/// the RC prototype.  A real provider, streaming protocol and content review
/// service are not available in the local build; [remoteEnabled] only opts in
/// to the one-shot `/v1/ai/reply` adapter and exposes its unavailable state.
class AIChatScreen extends StatelessWidget {
  const AIChatScreen({super.key, this.remoteEnabled = remoteDataDefault, this.repository});

  final bool remoteEnabled;
  final AiRepository? repository;

  @override
  Widget build(BuildContext context) {
    final body = _AIChatBody(
      remoteEnabled: remoteEnabled,
      repository: repository,
    );

    // Most app routes already have a root ProviderScope.  Reusing it keeps
    // provider overrides visible to widget tests and to embedding hosts.  A
    // standalone `MaterialApp(home: AIChatScreen())` still receives a local
    // scope for the mock mode used by previews.
    try {
      ProviderScope.containerOf(context, listen: false);
      return body;
    } on StateError {
      return ProviderScope(child: body);
    }
  }
}

class _AIChatBody extends ConsumerStatefulWidget {
  const _AIChatBody({required this.remoteEnabled, this.repository});
  final bool remoteEnabled;
  final AiRepository? repository;

  @override
  ConsumerState<_AIChatBody> createState() => _AIChatState();
}

enum _AiMessageRole { assistant, user }

class _AiMessage {
  const _AiMessage({
    required this.id,
    required this.role,
    required this.text,
    required this.time,
    this.error = false,
  });

  final String id;
  final _AiMessageRole role;
  final String text;
  final String time;
  final bool error;
}

const _aiQuickQuestions = <String>[
  '善意取得的三个要件是什么？',
  '诉讼时效与除斥期间有何区别？',
  '合同无效与合同被撤销的区别？',
  '共同犯罪中从犯如何认定？',
];

const _aiWelcome = '你好！我是得宝法考AI助手，可以帮你解答法考相关问题。\n\n'
    '你可以问我：法律概念辨析、案例分析思路、法条解读、易混考点对比等。';

const _aiAnswerByKeyword = <String, String>{
  '善意取得': '**善意取得的三个构成要件（《民法典》第311条）：**\n\n'
      '1. **受让人善意**：受让时不知道且不应当知道转让人无处分权。举证责任由主张恶意的一方承担。\n\n'
      '2. **以合理价格转让**：排除赠与、明显低价等情形，通常以不低于市价70%为参考。\n\n'
      '3. **已完成公示**：不动产须已登记，动产须已交付（含简易交付、指示交付）。\n\n'
      '**口诀**：善意 + 合价 + 公示 → 善意取得成立。',
  '诉讼时效': '**诉讼时效 vs 除斥期间对比：**\n\n'
      '**诉讼时效**（一般3年）\n'
      '- 消灭胜诉权，实体权利仍存在\n'
      '- 可以中断、中止、延长\n'
      '- 自知道或应知损害及义务人起算\n\n'
      '**除斥期间**（法定，不可变更）\n'
      '- 直接消灭实体权利\n'
      '- 不可中断、中止\n'
      '- 自权利成立之日起算\n\n'
      '**高频考点**：撤销权的行使期限——知道之日起1年（除斥期间），行为发生之日起5年（最长期限），两者均不适用中断中止。',
  '合同无效': '**合同无效 vs 合同被撤销：**\n\n'
      '**无效合同**：自始当然绝对无效，任何人可主张，法院可主动适用。典型情形：违反强制性规定、违背公序良俗、恶意串通损害第三人。\n\n'
      '**可撤销合同**：撤销前有效，撤销后溯及既往无效。只有特定当事人（撤销权人）可主张，1年除斥期间内行使。典型情形：欺诈、胁迫、重大误解、显失公平。\n\n'
      '**共同后果**：返还财产→折价补偿→损害赔偿，各自按过错承担责任。',
  '共同犯罪': '**从犯的认定（《刑法》第27条）：**\n\n'
      '在共同犯罪中起**次要或辅助**作用的为从犯。\n\n'
      '**两种类型：**\n'
      '- **次要实行犯**：参与实行但作用较小（如望风、部分实行）\n'
      '- **帮助犯**：未参与实行，仅提供帮助（提供工具、出谋划策）\n\n'
      '**处罚**：应当从轻、减轻或免除处罚（三档裁量）\n\n'
      '**易混点**：主犯 ≠ 首要分子。首要分子是犯罪集团/聚众犯罪中的组织策划者，不要求亲自实行。',
};

String _aiLocalReply(String text) {
  for (final entry in _aiAnswerByKeyword.entries) {
    if (text.contains(entry.key)) return entry.value;
  }
  return '关于「$text」的分析思路：\n\n'
      '**第一步：定性**\n'
      '明确涉及的法律关系类型和适用的法律领域（民事/刑事/行政）。\n\n'
      '**第二步：找构成要件**\n'
      '逐一对照相关法条的构成要件，逐项分析是否满足。\n\n'
      '**第三步：结合案情得结论**\n'
      '注意区分必要条件与充分条件，留意法律例外规定和司法解释。\n\n'
      '如果是具体案例，欢迎描述详情，我可以给出更针对性的分析。';
}

class _AIChatState extends ConsumerState<_AIChatBody> {
  final input = TextEditingController();
  final scroll = ScrollController();
  final messages = <_AiMessage>[];
  Timer? replyTimer;
  bool sending = false;
  bool offline = false;
  String? retryPrompt;
  int requestToken = 0;
  int messageSequence = 0;

  @override
  void initState() {
    super.initState();
    messages.add(_newMessage(_AiMessageRole.assistant, _aiWelcome,
        id: 'ai-message-welcome'));
    input.addListener(_inputChanged);
  }

  @override
  void dispose() {
    replyTimer?.cancel();
    input
      ..removeListener(_inputChanged)
      ..dispose();
    scroll.dispose();
    super.dispose();
  }

  void _inputChanged() {
    if (mounted) setState(() {});
  }

  _AiMessage _newMessage(_AiMessageRole role, String text,
      {bool error = false, String? id}) {
    messageSequence++;
    return _AiMessage(
      id: id ??
          'ai-message-${role == _AiMessageRole.user ? 'user' : 'assistant'}-$messageSequence',
      role: role,
      text: text,
      time: _aiTick(),
      error: error,
    );
  }

  @override
  Widget build(BuildContext context) {
    final showQuick = messages.length == 1 && !sending;
    return Scaffold(
      key: const ValueKey('ai-chat-screen'),
      backgroundColor: _page,
      appBar: AppBar(
        toolbarHeight: 52,
        leadingWidth: 48,
        leading: const DebaoRouteBackButton(),
        title: Tooltip(
            message: widget.remoteEnabled
                ? '当前为单轮 HTTP 适配器；真实流式输出与内容审核尚未接入'
                : '本地演示模式：未连接真实 AI Provider、流式输出与内容审核',
            child: const Text('AI 答疑',
                style: TextStyle(
                    color: _ink, fontSize: 16, fontWeight: FontWeight.w600))),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        shape: const Border(bottom: BorderSide(color: _line)),
        actions: [
          IconButton(
            key: const ValueKey('ai-chat-reset'),
            tooltip: '重置对话',
            onPressed: _reset,
            constraints: const BoxConstraints.tightFor(width: 40, height: 40),
            padding: EdgeInsets.zero,
            icon: const Icon(Icons.refresh, color: _body, size: 18),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            if (offline) _AiOfflineBanner(message: _offlineMessage),
            Expanded(
              // The RC page uses a regular scroll view.  Keeping all bubbles
              // mounted preserves the accessibility tree and makes older
              // turns available to keyboard/screenshot test harnesses.
              child: SingleChildScrollView(
                controller: scroll,
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    for (final message in messages)
                      _AiMessageRow(
                          key: ValueKey(message.id), message: message),
                    if (sending)
                      const _AiThinking(key: ValueKey('ai-thinking')),
                    if (showQuick) const _AiQuickQuestions(),
                    const SizedBox(height: 1),
                  ],
                ),
              ),
            ),
            _AiComposer(
              controller: input,
              sending: sending,
              onInputChanged: (_) => _inputChanged(),
              onSend: () => _send(),
            ),
          ],
        ),
      ),
    );
  }

  String get _offlineMessage =>
      widget.remoteEnabled ? 'AI 服务暂不可用，已保留本地草稿；请稍后重试' : '当前处于离线状态，消息仅保存在本机草稿中';

  void _reset() {
    requestToken++;
    replyTimer?.cancel();
    replyTimer = null;
    input.clear();
    setState(() {
      messages
        ..clear()
        ..add(_newMessage(_AiMessageRole.assistant, _aiWelcome,
            id: 'ai-message-welcome'));
      sending = false;
      offline = false;
      retryPrompt = null;
    });
  }

  void _send([String? override]) {
    final value = (override ?? input.text).trim();
    if (value.isEmpty || sending) return;
    final token = ++requestToken;
    setState(() {
      messages.add(_newMessage(_AiMessageRole.user, value));
      input.clear();
      sending = true;
      offline = false;
      retryPrompt = null;
    });
    _scrollToEnd();

    if (!widget.remoteEnabled) {
      // Keep the prototype's visible 0.8–1.3s thinking state deterministic so
      // widget and screenshot tests do not depend on random scheduling.
      replyTimer = Timer(const Duration(milliseconds: 900), () {
        if (!mounted || token != requestToken) return;
        setState(() {
          messages
              .add(_newMessage(_AiMessageRole.assistant, _aiLocalReply(value)));
          sending = false;
          replyTimer = null;
        });
        _scrollToEnd();
      });
      return;
    }
    _requestRemote(value, token);
  }

  Future<void> _requestRemote(String value, int token) async {
    try {
      // Riverpod's generated `read` type can be nullable under older
      // analyzer versions even though `aiRepositoryProvider` always returns
      // an `AiRepository`.  The widget-level override is nullable by design,
      // so normalize the fallback once before invoking the transport.
      final repository = widget.repository ?? ref.read(aiRepositoryProvider)!;
      final reply = await repository.reply(value);
      if (!mounted || token != requestToken) return;
      setState(() {
        messages.add(_newMessage(_AiMessageRole.assistant, reply));
        sending = false;
        offline = false;
        retryPrompt = null;
      });
      _scrollToEnd();
    } catch (error) {
      if (!mounted || token != requestToken) return;
      final message = _aiErrorMessage(error);
      setState(() {
        messages
            .add(_newMessage(_AiMessageRole.assistant, message, error: true));
        sending = false;
        offline = true;
        retryPrompt = value;
      });
      _scrollToEnd();
    }
  }

  void _retry() {
    final value = retryPrompt;
    if (value == null || value.isEmpty || sending) return;
    final token = ++requestToken;
    replyTimer?.cancel();
    setState(() {
      if (messages.isNotEmpty && messages.last.error) messages.removeLast();
      sending = true;
      offline = false;
      retryPrompt = null;
    });
    _requestRemote(value, token);
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !scroll.hasClients) return;
      scroll.animateTo(scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 180), curve: Curves.easeOut);
    });
  }
}

String _aiTick() {
  final now = DateTime.now();
  return '${now.hour}:${now.minute.toString().padLeft(2, '0')}';
}

String _aiErrorMessage(Object error) {
  final detail = error is ApiError ? error.message : '$error';
  final suffix = detail.trim().isEmpty ? '' : '：$detail';
  return 'AI 服务暂时不可用，请稍后重试$suffix';
}

class _AiMessageRow extends StatelessWidget {
  const _AiMessageRow({super.key, required this.message});
  final _AiMessage message;

  @override
  Widget build(BuildContext context) {
    final user = message.role == _AiMessageRole.user;
    final row = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!user) const _AiAvatar(),
        if (!user) const SizedBox(width: 10),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 270),
          child: Column(
            crossAxisAlignment:
                user ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: user ? _brand : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(user ? 16 : 4),
                    bottomRight: Radius.circular(user ? 4 : 16),
                  ),
                  boxShadow: user
                      ? null
                      : const [
                          BoxShadow(
                              color: Color(0x12000000),
                              blurRadius: 2,
                              offset: Offset(0, 1)),
                        ],
                ),
                child: user
                    ? Text(message.text,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 13, height: 1.54))
                    : _AiRichText(
                        message.text,
                        error: message.error,
                      ),
              ),
              const SizedBox(height: 4),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(message.time,
                    style: const TextStyle(
                        color: Color(0xFFC0C5D0), fontSize: 10)),
              ),
            ],
          ),
        ),
      ],
    );
    return Align(
      alignment: user ? Alignment.centerRight : Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child:
            user ? Row(mainAxisSize: MainAxisSize.min, children: [row]) : row,
      ),
    );
  }
}

class _AiAvatar extends StatelessWidget {
  const _AiAvatar();

  @override
  Widget build(BuildContext context) => Container(
        width: 32,
        height: 32,
        margin: const EdgeInsets.only(top: 2),
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
              colors: [Color(0xFF4C4BEA), Color(0xFF7B6CF5)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight),
          boxShadow: [
            BoxShadow(
                color: Color(0x18000000), blurRadius: 2, offset: Offset(0, 1)),
          ],
        ),
        child: const Icon(Icons.auto_awesome, color: Colors.white, size: 14),
      );
}

class _AiRichText extends StatelessWidget {
  const _AiRichText(this.text, {this.error = false});
  final String text;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final lines = text.split('\n');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < lines.length; i++)
          if (lines[i].isEmpty)
            const SizedBox(height: 8)
          else
            Text.rich(
              TextSpan(children: _aiInlineSpans(lines[i], error: error)),
              style: TextStyle(
                  color: error ? const Color(0xFFB13B25) : _body,
                  fontSize: 13,
                  height: 1.54),
            ),
      ],
    );
  }
}

List<InlineSpan> _aiInlineSpans(String line, {bool error = false}) {
  final spans = <InlineSpan>[];
  final pattern = RegExp(r'\*\*(.*?)\*\*');
  var cursor = 0;
  for (final match in pattern.allMatches(line)) {
    if (match.start > cursor) {
      spans.add(TextSpan(text: line.substring(cursor, match.start)));
    }
    spans.add(TextSpan(
      text: match.group(1),
      style: TextStyle(
          color: error ? const Color(0xFFB13B25) : _ink,
          fontWeight: FontWeight.w600),
    ));
    cursor = match.end;
  }
  if (cursor < line.length) spans.add(TextSpan(text: line.substring(cursor)));
  return spans;
}

class _AiThinking extends StatelessWidget {
  const _AiThinking({super.key});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const _AiAvatar(),
          const SizedBox(width: 10),
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
              ),
              boxShadow: [
                BoxShadow(
                    color: Color(0x12000000),
                    blurRadius: 2,
                    offset: Offset(0, 1)),
              ],
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              _AiDot(delay: 0),
              const SizedBox(width: 6),
              _AiDot(delay: 150),
              const SizedBox(width: 6),
              _AiDot(delay: 300),
            ]),
          ),
        ]),
      );
}

class _AiDot extends StatefulWidget {
  const _AiDot({required this.delay});
  final int delay;

  @override
  State<_AiDot> createState() => _AiDotState();
}

class _AiDotState extends State<_AiDot> with SingleTickerProviderStateMixin {
  late final AnimationController controller;

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: Tween<double>(begin: .35, end: 1).animate(CurvedAnimation(
            parent: controller,
            curve: Interval(widget.delay / 900,
                math.min(1.0, widget.delay / 900 + .5).toDouble(),
                curve: Curves.easeInOut))),
        child: Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
                color: Color(0xFFC0C5D0), shape: BoxShape.circle)),
      );
}

class _AiQuickQuestions extends StatelessWidget {
  const _AiQuickQuestions();

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Column(children: [
          const Text('常见问题快速提问',
              style: TextStyle(color: Color(0xFFC0C5D0), fontSize: 11)),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final width = (constraints.maxWidth - 8) / 2;
              return Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (var i = 0; i < _aiQuickQuestions.length; i++)
                    SizedBox(
                      width: width,
                      child: _AiQuickButton(
                        buttonKey: ValueKey('ai-quick-${_aiQuickQuestions[i]}'),
                        label: _aiQuickQuestions[i],
                        book: i.isEven,
                      ),
                    ),
                ],
              );
            },
          ),
        ]),
      );
}

class _AiQuickButton extends StatelessWidget {
  const _AiQuickButton(
      {this.buttonKey, required this.label, required this.book});
  final Key? buttonKey;
  final String label;
  final bool book;

  @override
  Widget build(BuildContext context) => Material(
        key: buttonKey,
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        elevation: 1,
        shadowColor: const Color(0x18000000),
        child: InkWell(
          onTap: () {
            final state = context.findAncestorStateOfType<_AIChatState>();
            state?._send(label);
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(book ? Icons.menu_book_outlined : Icons.balance_outlined,
                  color: _brand, size: 14),
              const SizedBox(width: 8),
              Expanded(
                  child: Text(label,
                      style: const TextStyle(
                          color: _body, fontSize: 12, height: 1.42))),
            ]),
          ),
        ),
      );
}

class _AiOfflineBanner extends StatelessWidget {
  const _AiOfflineBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    final state = context.findAncestorStateOfType<_AIChatState>();
    return Container(
      key: const ValueKey('ai-offline-banner'),
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 8, 12, 8),
      color: const Color(0xFFFFF1EE),
      child: Row(children: [
        const Icon(Icons.cloud_off_outlined,
            color: Color(0xFFB13B25), size: 17),
        const SizedBox(width: 8),
        Expanded(
            child: Text(message,
                style: const TextStyle(
                    color: Color(
                      0xFF8E3425,
                    ),
                    fontSize: 11))),
        TextButton(
          key: const ValueKey('ai-chat-retry'),
          onPressed: state?._retry,
          style: TextButton.styleFrom(
              minimumSize: const Size(44, 32), padding: EdgeInsets.zero),
          child: const Text('重试', style: TextStyle(fontSize: 12)),
        ),
      ]),
    );
  }
}

class _AiComposer extends StatelessWidget {
  const _AiComposer({
    required this.controller,
    required this.sending,
    required this.onInputChanged,
    required this.onSend,
  });
  final TextEditingController controller;
  final bool sending;
  final ValueChanged<String> onInputChanged;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) =>
      ValueListenableBuilder<TextEditingValue>(
        valueListenable: controller,
        builder: (context, value, _) {
          final canSend = value.text.trim().isNotEmpty && !sending;
          return Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: _line)),
            ),
            child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Expanded(
                child: TextField(
                  key: const ValueKey('ai-chat-input'),
                  controller: controller,
                  onChanged: onInputChanged,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => onSend(),
                  keyboardType: TextInputType.multiline,
                  style:
                      const TextStyle(color: _ink, fontSize: 13, height: 1.46),
                  decoration: InputDecoration(
                    hintText: '输入问题，如：善意取得的构成要件是什么？',
                    hintStyle:
                        const TextStyle(color: Color(0xFFC0C5D0), fontSize: 13),
                    filled: true,
                    fillColor: _page,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: _brand)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 40,
                height: 40,
                child: Tooltip(
                  message: '发送消息',
                  child: Semantics(
                    button: true,
                    enabled: canSend,
                    label: '发送消息',
                    child: Material(
                      color: canSend ? _brand : _brand.withValues(alpha: .4),
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        key: const ValueKey('ai-chat-send'),
                        // Keep a live hit target while an IME is composing.  The
                        // callback itself guards empty/duplicate submissions, and
                        // semantics still exposes the true enabled state.
                        onTap: onSend,
                        borderRadius: BorderRadius.circular(12),
                        child: Center(
                          child: sending
                              ? const SizedBox(
                                  width: 17,
                                  height: 17,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.send,
                                  color: Colors.white, size: 17),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ]),
          );
        },
      );
}

const _demoGradingPapers = <GradingPaper>[
  GradingPaper(
    id: 'grading-paper-civil',
    title: '2026 民法主观题专项套卷（一）',
    subjectId: 'civil',
    year: '2026',
    totalScore: 40,
    questionIds: ['subjective-demo-1', 'subjective-demo-2'],
    status: 'published',
  ),
  GradingPaper(
    id: 'grading-paper-criminal',
    title: '2026 刑法主观题专项套卷（一）',
    subjectId: 'criminal',
    year: '2026',
    totalScore: 20,
    questionIds: ['subjective-demo-3'],
    status: 'published',
  ),
];

const _demoGradingRecords = <GradingSubmission>[
  // Legacy prototype entries stay first so existing deep links open the same
  // visible history rows as the RC mock screen.
  GradingSubmission(
    id: 'gsub-demo-2023',
    paperTitle: '2023 年主观题真题',
    questionTitle: '民法·股权转让案例',
    status: 'published',
    score: 38,
    maxScore: 50,
    feedback: '论点清晰，法条引用准确，建议加强对抗辩权的分析。',
    createdAt: '2023-08-30T09:20:00.000Z',
  ),
  GradingSubmission(
    id: 'gsub-demo-2022',
    paperTitle: '2022 年主观题真题',
    questionTitle: '合同解除与违约责任',
    status: 'manual_queued',
    createdAt: '2022-08-30T09:20:00.000Z',
  ),
  GradingSubmission(
    id: 'gsub-demo-queued',
    paperId: 'grading-paper-civil',
    paperTitle: '2026 民法主观题专项套卷（一）',
    questionTitle: '民法案例分析：房屋买卖与租赁',
    status: 'manual_queued',
    createdAt: '2026-08-30T09:20:00.000Z',
  ),
  GradingSubmission(
    id: 'gsub-demo-published',
    paperId: 'grading-paper-civil',
    paperTitle: '2026 民法主观题专项套卷（一）',
    questionTitle: '民法案例分析：合同解除与违约责任',
    status: 'published',
    score: 16,
    maxScore: 20,
    feedback: '论点清晰，法条引用准确。',
    latestReportId: 'greport-demo-published',
    createdAt: '2026-08-27T10:00:00.000Z',
  ),
];

class GradingServiceScreen extends StatelessWidget {
  const GradingServiceScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) {
    if (remoteEnabled) {
      return ProviderScope(
          child: _RemoteGradingServiceBody(remoteEnabled: remoteEnabled));
    }
    // Keep the local fixture contract explicit: if the seed data is ever
    // removed accidentally, show a deterministic empty state instead of
    // rendering a partially populated prototype.
    if (_demoGradingPapers.isEmpty || _demoGradingRecords.isEmpty) {
      return const _AccountPage(
          title: '批改服务',
          child: _StatusPanel(
              icon: Icons.inbox_outlined, color: _muted, text: '暂无批改记录。'));
    }
    return const _AccountPage(
        title: '批改服务', child: _PrototypeGradingServiceContent());
  }
}

/// Local/mock mode mirrors the RC prototype screenshot exactly: one direct
/// upload entry followed by the two historical rows.  The newer paper catalog
/// remains available in remote mode and through the paper-detail route.
class _PrototypeGradingServiceContent extends StatelessWidget {
  const _PrototypeGradingServiceContent();

  @override
  Widget build(BuildContext context) => ListView(
        padding: EdgeInsets.zero,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('批改次数',
                          style: TextStyle(
                              color: _ink,
                              fontSize: 14,
                              fontWeight: FontWeight.w600)),
                      Text('剩余 8 次',
                          style: TextStyle(
                              color: _brand,
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ]),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: const LinearProgressIndicator(
                      value: .2,
                      minHeight: 6,
                      backgroundColor: Color(0xFFE5E7ED),
                      valueColor: AlwaysStoppedAnimation(_brand)),
                ),
                const SizedBox(height: 7),
                const Text('已使用 2 次 / 共 10 次（含课程权益）',
                    style: TextStyle(color: _muted, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          InkWell(
            key: const ValueKey('grading-submit'),
            borderRadius: BorderRadius.circular(8),
            onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => const SubjectiveAnswerScreen(
                      subject: '民法',
                      paperTitle: '主观题答案批改',
                      remoteEnabled: false,
                    ))),
            child: CustomPaint(
              painter:
                  const _DashedRoundedBorderPainter(color: _brand, radius: 8),
              child: Container(
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.upload_outlined, color: _brand, size: 22),
                      SizedBox(height: 7),
                      Text('提交主观题答案批改',
                          style: TextStyle(
                              color: _brand,
                              fontSize: 14,
                              fontWeight: FontWeight.w600)),
                      SizedBox(height: 5),
                      Text('选择题目后提交您的书面答案，24小时内反馈',
                          style: TextStyle(color: _muted, fontSize: 12)),
                    ]),
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(top: 16, bottom: 6),
            child: Text('批改记录', style: TextStyle(color: _muted, fontSize: 13)),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Material(
              color: Colors.white,
              child: Column(children: [
                _prototypeRecord(
                  context,
                  id: 'g1',
                  title: '民法·股权转让案例',
                  detailTitle: '民法·股权转让案例',
                  year: '2023年真题',
                  status: '已批改',
                  score: '38/50',
                  feedback: '论点清晰，法条引用准确，建议加强对抗辩权的分析。',
                ),
                const Divider(height: 1, color: _line),
                _prototypeRecord(
                  context,
                  id: 'g2',
                  title: '合同解除与违约责任',
                  detailTitle: '合同解除与违约责任',
                  year: '2022年真题',
                  status: '待批改',
                ),
              ]),
            ),
          ),
        ],
      );

  Widget _prototypeRecord(
    BuildContext context, {
    required String id,
    required String title,
    required String detailTitle,
    required String year,
    required String status,
    String? score,
    String? feedback,
  }) =>
      InkWell(
        key: ValueKey('grading-record-$id'),
        // The RC prototype history rows are static.  Keep the row itself
        // non-interactive while retaining a title affordance for the legacy
        // Flutter smoke test and deep-link previews.
        onTap: null,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: score != null
                      ? const Color(0xFFEAF6EF)
                      : const Color(0xFFFFF5DD),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(status,
                    style: TextStyle(
                        color: score != null
                            ? const Color(0xFF5DA765)
                            : const Color(0xFFA87000),
                        fontSize: 11,
                        fontWeight: FontWeight.w500)),
              ),
              const SizedBox(width: 8),
              Text(year, style: const TextStyle(color: _muted, fontSize: 11)),
              if (score != null) ...[
                const Spacer(),
                Text(score,
                    style: const TextStyle(
                        color: _brand,
                        fontSize: 13,
                        fontWeight: FontWeight.w700)),
              ],
            ]),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => GradingPaperDetailScreen(
                      title: detailTitle, remoteEnabled: false))),
              child: Text(title,
                  style: const TextStyle(
                      color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
            ),
            if (feedback != null) ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                    color: _page, borderRadius: BorderRadius.circular(4)),
                child: Text(feedback,
                    style: const TextStyle(
                        color: _body, fontSize: 12, height: 1.45)),
              ),
            ],
          ]),
        ),
      );
}

/// Lightweight dependency-free dashed outline used by the RC upload card.
class _DashedRoundedBorderPainter extends CustomPainter {
  const _DashedRoundedBorderPainter(
      {required this.color, required this.radius});

  final Color color;
  final double radius;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0 || size.height <= 0) return;
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    final path = Path()
      ..addRRect(
          RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(radius)));
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final end = math.min(distance + 5, metric.length);
        canvas.drawPath(metric.extractPath(distance, end), paint);
        distance += 9;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedRoundedBorderPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.radius != radius;
}

class _GradingServiceContent extends StatelessWidget {
  const _GradingServiceContent({
    required this.papers,
    required this.records,
    required this.remoteEnabled,
  });

  final List<GradingPaper> papers;
  final List<GradingSubmission> records;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) {
    final consumed = records.length;
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _gradingUsageCard(consumed),
        const SizedBox(height: 4),
        _gradingSectionHeader('可批改套卷', hint: '先选套卷，再逐题作答'),
        if (papers.isEmpty)
          const _StatusPanel(
              icon: Icons.inbox_outlined, color: _muted, text: '暂无可提交的批改题目。')
        else
          ...papers.map((paper) => _gradingPaperCard(context, paper)),
        _gradingSectionHeader('批改记录', icon: Icons.history),
        _gradingHistoryCard(context),
      ],
    );
  }

  Widget _gradingUsageCard(int consumed) {
    final safeConsumed = consumed.clamp(0, 10);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(8)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('批改次数',
              style: TextStyle(
                  color: _ink, fontSize: 14, fontWeight: FontWeight.w600)),
          Text('剩余 ${10 - safeConsumed} 次',
              style: const TextStyle(
                  color: _brand, fontSize: 13, fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
              value: safeConsumed / 10,
              minHeight: 6,
              backgroundColor: const Color(0xFFE5E7ED),
              valueColor: const AlwaysStoppedAnimation(_brand)),
        ),
        const SizedBox(height: 7),
        Text('已使用 $safeConsumed 次 / 共 10 次（含课程权益）',
            style: const TextStyle(color: _muted, fontSize: 11)),
      ]),
    );
  }

  Widget _gradingSectionHeader(String title, {String? hint, IconData? icon}) =>
      Padding(
        padding: const EdgeInsets.only(top: 16, bottom: 6),
        child: Row(children: [
          Text(title, style: const TextStyle(color: _muted, fontSize: 13)),
          if (hint != null) ...[
            const Spacer(),
            Text(hint, style: const TextStyle(color: _muted, fontSize: 11)),
          ],
          if (icon != null) ...[
            const Spacer(),
            Icon(icon, size: 16, color: _muted),
          ],
        ]),
      );

  Widget _gradingPaperCard(BuildContext context, GradingPaper paper) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            key: ValueKey('grading-paper-${paper.id}'),
            borderRadius: BorderRadius.circular(8),
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => GradingPaperDetailScreen(
                        title: paper.title,
                        paperId: paper.id,
                        remoteEnabled: remoteEnabled))),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(children: [
                Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                        color: const Color(0xFFF0F0FF),
                        borderRadius: BorderRadius.circular(6)),
                    child: const Icon(Icons.menu_book_outlined,
                        size: 21, color: _brand)),
                const SizedBox(width: 12),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(paper.title,
                          style: const TextStyle(
                              color: _ink,
                              fontSize: 14,
                              fontWeight: FontWeight.w600)),
                      const SizedBox(height: 5),
                      Text(
                          '${_subjectLabel(paper.subjectId)} · ${paper.questionCount} 道题 · 满分 ${_formatScore(paper.totalScore)} 分',
                          style: const TextStyle(color: _muted, fontSize: 11)),
                    ])),
                const Icon(Icons.chevron_right, size: 18, color: _muted),
              ]),
            ),
          ),
        ),
      );

  Widget _gradingHistoryCard(BuildContext context) {
    if (records.isEmpty) {
      return const _StatusPanel(
          icon: Icons.history, color: _muted, text: '完成提交后，记录会显示在这里。');
    }
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: records.asMap().entries.map((entry) {
          final record = entry.value;
          final published = record.status == 'published';
          final title = record.paperTitle ??
              record.questionTitle ??
              record.questionId ??
              '文件答案批改';
          final year = record.createdAt.length >= 4
              ? record.createdAt.substring(0, 4)
              : '—';
          final canOpen = !remoteEnabled || published;
          return InkWell(
            key: ValueKey('grading-record-${record.id}'),
            onTap: canOpen
                ? () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => GradingPaperDetailScreen(
                            title: title,
                            paperId: record.paperId,
                            remoteEnabled: remoteEnabled)))
                : null,
            child: Container(
              padding: const EdgeInsets.all(15),
              decoration: entry.key < records.length - 1
                  ? const BoxDecoration(
                      border:
                          Border(bottom: BorderSide(color: Color(0xFFE5E7ED))))
                  : null,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                              color: published
                                  ? const Color(0xFFEAF6EF)
                                  : const Color(0xFFFFF5DD),
                              borderRadius: BorderRadius.circular(5)),
                          child: Text(published ? '已批改' : '等待人工',
                              style: TextStyle(
                                  color: published
                                      ? const Color(0xFF3A7A46)
                                      : const Color(0xFFA87000),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500))),
                      const SizedBox(width: 8),
                      Text('$year 年真题',
                          style: const TextStyle(color: _muted, fontSize: 11)),
                      if (record.score != null) ...[
                        const Spacer(),
                        Text(
                            '${_formatScore(record.score!)}${record.maxScore == null ? '' : '/${_formatScore(record.maxScore!)}'}',
                            style: const TextStyle(
                                color: _brand,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                      ],
                    ]),
                    const SizedBox(height: 8),
                    Text(title,
                        style: const TextStyle(
                            color: _ink,
                            fontSize: 14,
                            fontWeight: FontWeight.w600)),
                    if (record.feedback?.isNotEmpty == true) ...[
                      const SizedBox(height: 8),
                      Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(9),
                          decoration: BoxDecoration(
                              color: _page,
                              borderRadius: BorderRadius.circular(5)),
                          child: Text(record.feedback!,
                              style: const TextStyle(
                                  color: _muted, fontSize: 12, height: 1.55))),
                    ],
                  ]),
            ),
          );
        }).toList(growable: false),
      ),
    );
  }
}

String _subjectLabel(String id) => switch (id) {
      'civil' => '民法',
      'criminal' => '刑法',
      _ => id.isEmpty ? '综合' : id,
    };

class _RemoteGradingServiceBody extends ConsumerWidget {
  const _RemoteGradingServiceBody({required this.remoteEnabled});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final papers = ref.watch(gradingPapersProvider(null));
    final submissions = ref.watch(gradingSubmissionsProvider);
    if (papers.isLoading &&
        !papers.hasValue &&
        submissions.isLoading &&
        !submissions.hasValue) {
      return _AccountPage(
          title: '批改服务',
          child: const Center(child: CircularProgressIndicator()));
    }
    if ((papers.hasError && !papers.hasValue) ||
        (submissions.hasError && !submissions.hasValue)) {
      final error = papers.hasError ? papers.error! : submissions.error!;
      return _AccountPage(
          title: '批改服务',
          child: Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(error is ApiError ? error.message : '批改数据加载失败'),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                onPressed: () {
                  ref.invalidate(gradingPapersProvider(null));
                  ref.invalidate(gradingSubmissionsProvider);
                },
                icon: const Icon(Icons.refresh),
                label: const Text('重试'))
          ])));
    }
    final paperItems = papers.valueOrNull ?? const <GradingPaper>[];
    final records = submissions.valueOrNull ?? const <GradingSubmission>[];
    return _AccountPage(
        title: '批改服务',
        child: _GradingServiceContent(
            papers: paperItems, records: records, remoteEnabled: true));
  }
}

class GradingPaperDetailScreen extends StatelessWidget {
  const GradingPaperDetailScreen({
    super.key,
    required this.title,
    this.paperId,
    this.remoteEnabled = remoteDataDefault,
  });

  final String title;
  final String? paperId;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) {
    if (remoteEnabled) {
      final id = paperId?.trim() ?? '';
      if (id.isEmpty) {
        return const _AccountPage(
          title: '套卷详情',
          child: _StatusPanel(
              icon: Icons.assignment_outlined,
              color: _muted,
              text: '套卷编号缺失，请从批改服务重新打开。'),
        );
      }
      return ProviderScope(
        child: _RemoteGradingPaperBody(title: title, paperId: id),
      );
    }
    return _LocalGradingPaperBody(title: title);
  }
}

class _LocalGradingPaperBody extends StatelessWidget {
  const _LocalGradingPaperBody({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) => _AccountPage(
        title: '套卷详情',
        child: ListView(children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 18, fontWeight: FontWeight.w700, color: _brand)),
          const SizedBox(height: 8),
          const Text('4 道主观题 · 满分 100 分 · 支持图片附件',
              style: TextStyle(color: _brand)),
          const SizedBox(height: 18),
          const _StatusPanel(
              icon: Icons.info_outline,
              color: _brand,
              text: '提交后将由专业老师批改，通常 24 小时内返回结果。'),
          const SizedBox(height: 14),
          FilledButton.icon(
              onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => GradingReportScreen(title: title))),
              icon: const Icon(Icons.upload_file_outlined),
              label: const Text('上传答卷并提交')),
        ]),
      );
}

class _RemoteGradingPaperBody extends ConsumerWidget {
  const _RemoteGradingPaperBody({required this.title, required this.paperId});
  final String title;
  final String paperId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(gradingPaperProvider(paperId));
    if (state.isLoading && !state.hasValue) {
      return const _AccountPage(
          title: '套卷详情', child: Center(child: CircularProgressIndicator()));
    }
    if (state.hasError && !state.hasValue) {
      return _AccountPage(
        title: '套卷详情',
        child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, color: _muted, size: 30),
            const SizedBox(height: 8),
            Text(_accountErrorMessage(state.error!)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => ref.invalidate(gradingPaperProvider(paperId)),
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('重试'),
            ),
          ]),
        ),
      );
    }
    final paper = state.valueOrNull;
    if (paper == null) {
      return const _AccountPage(
          title: '套卷详情',
          child: _StatusPanel(
              icon: Icons.inbox_outlined, color: _muted, text: '暂无套卷内容。'));
    }
    final questions = paper.questions;
    return _AccountPage(
      title: '套卷详情',
      child: ListView(children: [
        Text(paper.title.isEmpty ? title : paper.title,
            style: const TextStyle(
                fontSize: 18, fontWeight: FontWeight.w700, color: _brand)),
        const SizedBox(height: 8),
        Text(
            '${paper.year.isEmpty ? '专项训练' : '${paper.year} 年'} · ${paper.questionCount} 道主观题 · 满分 ${paper.totalScore} 分',
            style: const TextStyle(color: _brand)),
        const SizedBox(height: 14),
        const _StatusPanel(
            icon: Icons.info_outline,
            color: _brand,
            text: '提交后将由专业老师批改，通常 24 小时内返回结果。'),
        const SizedBox(height: 12),
        if (questions.isEmpty)
          const _StatusPanel(
              icon: Icons.inbox_outlined,
              color: _muted,
              text: '该套卷暂未配置可作答题目，请稍后重试。')
        else ...[
          const Text('题目列表', style: TextStyle(color: _muted, fontSize: 12)),
          const SizedBox(height: 6),
          ...questions.asMap().entries.map((entry) {
            final question = entry.value;
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                    radius: 16,
                    backgroundColor: const Color(0xFFF0F0FF),
                    child: Text('${entry.key + 1}',
                        style: const TextStyle(color: _brand))),
                title: Text(question.title),
                subtitle: Text(
                    '${question.subQuestions.length} 个小问 · ${question.suggestedMinutes} 分钟'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => SubjectiveAnswerScreen(
                              subject: question.subjectId,
                              paperTitle: paper.title,
                              questionId: question.id,
                              paperId: paper.id,
                              remoteEnabled: true,
                            ))),
              ),
            );
          }),
          const SizedBox(height: 6),
          FilledButton.icon(
            onPressed: () {
              final question = questions.first;
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => SubjectiveAnswerScreen(
                            subject: question.subjectId,
                            paperTitle: paper.title,
                            questionId: question.id,
                            paperId: paper.id,
                            remoteEnabled: true,
                          )));
            },
            icon: const Icon(Icons.edit_outlined),
            label: const Text('开始作答'),
          ),
        ],
      ]),
    );
  }
}

class GradingReportScreen extends StatelessWidget {
  const GradingReportScreen({
    super.key,
    required this.title,
    this.submissionId,
    this.remoteEnabled = remoteDataDefault,
  });

  final String title;
  final String? submissionId;
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) {
    if (remoteEnabled) {
      final id = submissionId?.trim() ?? '';
      if (id.isEmpty) {
        return const _AccountPage(
          title: '批改报告',
          child: _StatusPanel(
              icon: Icons.assignment_outlined,
              color: _muted,
              text: '批改记录编号缺失，请从批改服务重新打开。'),
        );
      }
      return ProviderScope(
          child: _RemoteGradingReportBody(title: title, submissionId: id));
    }
    return _LocalGradingReportBody(title: title);
  }
}

class _LocalGradingReportBody extends StatelessWidget {
  const _LocalGradingReportBody({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) => _AccountPage(
        title: '批改报告',
        child: ListView(children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
          const SizedBox(height: 14),
          const _StatusPanel(
              icon: Icons.hourglass_empty,
              color: Color(0xFFA87000),
              text: '已提交，等待批改结果。'),
          const SizedBox(height: 14),
          const ListTile(
              tileColor: Colors.white,
              title: Text('批改状态'),
              trailing:
                  Text('排队中', style: TextStyle(color: Color(0xFFA87000)))),
          const ListTile(
              tileColor: Colors.white,
              title: Text('提交时间'),
              trailing: Text('刚刚')),
        ]),
      );
}

class _RemoteGradingReportBody extends ConsumerWidget {
  const _RemoteGradingReportBody(
      {required this.title, required this.submissionId});
  final String title;
  final String submissionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportState = ref.watch(gradingReportProvider(submissionId));
    final submissionState = ref.watch(gradingSubmissionProvider(submissionId));
    if (reportState.isLoading && !reportState.hasValue) {
      return const _AccountPage(
          title: '批改报告', child: Center(child: CircularProgressIndicator()));
    }
    if (reportState.hasError && !reportState.hasValue) {
      final submission = submissionState.valueOrNull;
      final status = submission?.status;
      if (status != null && status != 'published') {
        return _AccountPage(
          title: '批改报告',
          child: ListView(children: [
            Text(submission?.questionTitle ?? submission?.paperTitle ?? title,
                style: const TextStyle(
                    fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
            const SizedBox(height: 14),
            _StatusPanel(
                icon: Icons.hourglass_empty,
                color: const Color(0xFFA87000),
                text: '当前状态：${_gradingStatusLabel(status)}，报告发布后会显示在这里。'),
            const SizedBox(height: 12),
            ListTile(
                tileColor: Colors.white,
                title: const Text('提交时间'),
                trailing: Text(submission?.createdAt ?? '-')),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                onPressed: () {
                  ref.invalidate(gradingSubmissionProvider(submissionId));
                  ref.invalidate(gradingReportProvider(submissionId));
                },
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('刷新状态')),
          ]),
        );
      }
      return _AccountPage(
        title: '批改报告',
        child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline, color: Color(0xFFD2691E), size: 30),
            const SizedBox(height: 8),
            Text(_accountErrorMessage(reportState.error!)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                onPressed: () =>
                    ref.invalidate(gradingReportProvider(submissionId)),
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重试')),
          ]),
        ),
      );
    }
    final report = reportState.valueOrNull;
    if (report == null) {
      return const _AccountPage(
          title: '批改报告',
          child: _StatusPanel(
              icon: Icons.inbox_outlined, color: _muted, text: '暂无批改报告。'));
    }
    final scoreText = _formatScore(report.totalScore);
    final maxText = _formatScore(report.maxScore);
    return _AccountPage(
      title: '批改报告',
      child: ListView(children: [
        Text(title,
            style: const TextStyle(
                fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: const Color(0xFFF0F0FF),
              borderRadius: BorderRadius.circular(8)),
          child: Row(children: [
            Text(scoreText,
                style: const TextStyle(
                    color: _brand, fontSize: 30, fontWeight: FontWeight.w800)),
            Text(' / $maxText 分',
                style: const TextStyle(color: _muted, fontSize: 12)),
            const Spacer(),
            const Text('已发布', style: TextStyle(color: _brand, fontSize: 12)),
          ]),
        ),
        if (report.feedback.isNotEmpty) ...[
          const SizedBox(height: 12),
          _ReportSection(title: '批改反馈', body: report.feedback),
        ],
        if (report.improvementAdvice.isNotEmpty) ...[
          const SizedBox(height: 10),
          _ReportSection(title: '改进建议', body: report.improvementAdvice),
        ],
        if (report.pointResults.isNotEmpty) ...[
          const SizedBox(height: 14),
          const Text('采分点结果', style: TextStyle(color: _muted, fontSize: 12)),
          const SizedBox(height: 6),
          ...report.pointResults.map((point) => _PointResultTile(point: point)),
        ],
        if (report.answers.isNotEmpty) ...[
          const SizedBox(height: 14),
          const Text('我的答案', style: TextStyle(color: _muted, fontSize: 12)),
          const SizedBox(height: 6),
          ...report.answers.map((answer) => _AnswerTile(answer: answer)),
        ],
      ]),
    );
  }
}

class _ReportSection extends StatelessWidget {
  const _ReportSection({required this.title, required this.body});
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: const TextStyle(
                  color: _ink, fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(body,
              style: const TextStyle(color: _body, fontSize: 12, height: 1.55)),
        ]),
      );
}

class _PointResultTile extends StatelessWidget {
  const _PointResultTile({required this.point});
  final JsonMap point;

  @override
  Widget build(BuildContext context) {
    final score = point['score'] ?? point['suggestedScore'] ?? 0;
    final max = point['maxScore'] ?? '-';
    final status = '${point['status'] ?? ''}';
    final color =
        status == 'hit' ? const Color(0xFF3A7A46) : const Color(0xFFA87000);
    return Container(
      margin: const EdgeInsets.only(bottom: 7),
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(8)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${point['title'] ?? point['pointId'] ?? '采分点'}',
              style: const TextStyle(
                  color: _ink, fontSize: 12, fontWeight: FontWeight.w600)),
          if ('${point['comment'] ?? point['evidence'] ?? ''}'.isNotEmpty)
            Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text('${point['comment'] ?? point['evidence']}',
                    style: const TextStyle(color: _muted, fontSize: 11))),
        ])),
        Text('$score/$max',
            style: TextStyle(
                color: color, fontSize: 12, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}

class _AnswerTile extends StatelessWidget {
  const _AnswerTile({required this.answer});
  final JsonMap answer;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 7),
        padding: const EdgeInsets.all(11),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: Text('${answer['text'] ?? ''}',
            style: const TextStyle(color: _body, fontSize: 12, height: 1.55)),
      );
}

String _formatScore(num value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);

String _gradingStatusLabel(String status) => switch (status) {
      'submitted' ||
      'ai_queued' ||
      'ai_processing' ||
      'ai_completed' ||
      'manual_queued' =>
        '排队中',
      'manual_claimed' => '老师批改中',
      'manual_returned' => '已退回',
      'published' => '已发布',
      'ai_failed' => 'AI 处理失败，等待人工',
      _ => status,
    };

String _accountErrorMessage(Object error) =>
    error is ApiError ? error.message : '请求失败，请稍后重试';

class ForumScreen extends StatelessWidget {
  const ForumScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;

  @override
  Widget build(BuildContext context) =>
      CommunityForumScreen(remoteEnabled: remoteEnabled);
}

class _StatusPanel extends StatelessWidget {
  const _StatusPanel(
      {required this.icon, required this.color, required this.text});
  final IconData icon;
  final Color color;
  final String text;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
          color: color.withValues(alpha: .10),
          borderRadius: BorderRadius.circular(8)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 19),
        const SizedBox(width: 8),
        Expanded(
            child: Text(text,
                style:
                    const TextStyle(color: _body, fontSize: 12, height: 1.45)))
      ]));
}

class _AccountPage extends StatelessWidget {
  const _AccountPage({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: _page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: Text(title),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white),
      body: Padding(padding: const EdgeInsets.all(16), child: child));
}
