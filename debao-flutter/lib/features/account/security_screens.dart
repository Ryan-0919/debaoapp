import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../../shared/route_back_button.dart';

const _brand = Color(0xFF4C4BEA);
const _page = Color(0xFFF4F5F7);
const _muted = Color(0xFF707684);

class AccountSecurityScreen extends StatefulWidget {
  const AccountSecurityScreen({super.key, this.remoteEnabled = false});
  final bool remoteEnabled;
  @override
  State<AccountSecurityScreen> createState() => _AccountSecurityState();
}

class _AccountSecurityState extends State<AccountSecurityScreen> {
  bool phoneForm = false;
  bool wechatBound = false;
  bool deletionScheduled = false;
  final phone = TextEditingController();
  final code = TextEditingController();
  @override
  void dispose() {
    phone.dispose();
    code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled) return const _RemoteAccountSecurityScreen();
    return Scaffold(
        backgroundColor: _page,
        appBar: AppBar(
            leading: const DebaoRouteBackButton(),
            title: const Text('账号与安全'),
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white),
        body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              _section(
                  '手机号',
                  '用于登录、找回账号和安全验证',
                  ListTile(
                      tileColor: Colors.white,
                      leading: const Icon(Icons.phone_outlined, color: _brand),
                      title: const Text('当前手机号'),
                      subtitle: const Text('138****8000'),
                      trailing: TextButton(
                          onPressed: () =>
                              setState(() => phoneForm = !phoneForm),
                          child: Text(phoneForm ? '收起' : '更换')))),
              if (phoneForm)
                Card(
                    child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(children: [
                          TextField(
                              controller: phone,
                              keyboardType: TextInputType.phone,
                              maxLength: 11,
                              decoration: const InputDecoration(
                                  labelText: '新手机号', counterText: '')),
                          TextField(
                              controller: code,
                              keyboardType: TextInputType.number,
                              maxLength: 6,
                              decoration: const InputDecoration(
                                  labelText: '验证码', counterText: '')),
                          const SizedBox(height: 8),
                          SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                  onPressed: () {
                                    if (phone.text.length == 11 &&
                                        code.text.length == 6) {
                                      setState(() => phoneForm = false);
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(const SnackBar(
                                              content: Text('手机号已更换（演示）')));
                                    }
                                  },
                                  child: const Text('确认更换'))),
                        ]))),
              _section(
                  '第三方账号',
                  '微信登录仍需绑定本人手机号',
                  ListTile(
                      tileColor: Colors.white,
                      leading: const Icon(Icons.chat_bubble_outline,
                          color: Color(0xFF078C3D)),
                      title: const Text('微信'),
                      subtitle: Text(wechatBound ? '已绑定 · 微信用户' : '未绑定'),
                      trailing: TextButton(
                          onPressed: () =>
                              setState(() => wechatBound = !wechatBound),
                          child: Text(wechatBound ? '解绑' : '绑定')))),
              _section(
                  '登录设备',
                  '移除设备后，该设备需要重新登录',
                  Column(children: const [
                    ListTile(
                        tileColor: Colors.white,
                        leading:
                            Icon(Icons.phone_android_outlined, color: _brand),
                        title: Text('当前设备'),
                        subtitle: Text('ANDROID · 最近使用刚刚'),
                        trailing:
                            Text('当前设备', style: TextStyle(color: _muted))),
                    ListTile(
                        tileColor: Colors.white,
                        leading: Icon(Icons.computer_outlined, color: _muted),
                        title: Text('Chrome 浏览器'),
                        subtitle: Text('WEB · 最近使用昨天'),
                        trailing:
                            Text('移除', style: TextStyle(color: Colors.red))),
                  ])),
              _section(
                  '账号注销',
                  '注销申请提交后有 7 天冷静期',
                  Card(
                      child: ListTile(
                          title:
                              Text(deletionScheduled ? '注销申请等待执行' : '申请注销账号'),
                          subtitle: Text(deletionScheduled
                              ? '冷静期内可撤销，预计 7 天后执行。'
                              : '依法需要保留的交易记录将按协议处理。'),
                          trailing: TextButton(
                              onPressed: () => setState(
                                  () => deletionScheduled = !deletionScheduled),
                              child: Text(deletionScheduled ? '撤销' : '申请'))))),
              const SizedBox(height: 12),
              _LegalLink(
                  title: '第三方 SDK 清单',
                  document: 'sdk-list',
                  remoteEnabled: widget.remoteEnabled),
              _LegalLink(
                  title: '账号注销说明',
                  document: 'account-deletion',
                  remoteEnabled: widget.remoteEnabled),
            ]));
  }

  Widget _section(String title, String description, Widget child) => Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        Text(description, style: const TextStyle(color: _muted, fontSize: 11)),
        const SizedBox(height: 7),
        child
      ]));
}

class _LegalLink extends StatelessWidget {
  const _LegalLink(
      {required this.title,
      required this.document,
      required this.remoteEnabled});
  final String title, document;
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context) => Card(
      child: ListTile(
          title: Text(title),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => LegalDocumentScreen(
                      document: document, remoteEnabled: remoteEnabled)))));
}

class LegalDocumentScreen extends ConsumerWidget {
  const LegalDocumentScreen(
      {super.key, required this.document, this.remoteEnabled = false});
  final String document;
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (remoteEnabled) {
      final state = ref.watch(legalDocumentProvider(document));
      if (state.isLoading && !state.hasValue) {
        return _documentScaffold(
            title: _localTitle(document),
            body: const Center(
                key: ValueKey('legal-document-loading'),
                child: CircularProgressIndicator()));
      }
      if (state.hasError && !state.hasValue) {
        return _documentScaffold(
            title: _localTitle(document),
            body: _DocumentStateMessage(
                key: const ValueKey('legal-document-error'),
                icon: Icons.cloud_off_outlined,
                message: '法律文档暂时不可用',
                actionLabel: '重试',
                onAction: () =>
                    ref.invalidate(legalDocumentProvider(document))));
      }
      final remote = state.value;
      if (remote == null || remote.sections.isEmpty) {
        return _documentScaffold(
            title: _localTitle(document),
            body: const _DocumentStateMessage(
                key: ValueKey('legal-document-empty'),
                icon: Icons.description_outlined,
                message: '暂无可用文档'));
      }
      return _remoteDocumentScaffold(context, ref, state, remote);
    }
    final local = _localDocument(document);
    return _documentScaffold(
        title: local.title,
        body: _documentBody(local.versionLabel, local.sections));
  }

  Widget _remoteDocumentScaffold(BuildContext context, WidgetRef ref,
      AsyncValue<AppLegalDocument> state, AppLegalDocument document) {
    final body = _documentBody(
        '版本 ${document.version} · 更新日期：${_formatDate(document.updatedAt)}',
        document.sections);
    if (!state.hasError)
      return _documentScaffold(title: document.title, body: body);
    return _documentScaffold(
        title: document.title,
        body: Column(children: [
          MaterialBanner(
              content: const Text('文档刷新失败，当前显示上次成功内容'),
              leading: const Icon(Icons.sync_problem_outlined),
              actions: [
                TextButton(
                    onPressed: () =>
                        ref.invalidate(legalDocumentProvider(document.key)),
                    child: const Text('重试'))
              ]),
          Expanded(child: body),
        ]));
  }

  Widget _documentScaffold({required String title, required Widget body}) =>
      Scaffold(
          backgroundColor: _page,
          appBar: AppBar(
              leading: const DebaoRouteBackButton(),
              title: Text(title),
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.white),
          body: body);

  Widget _documentBody(String versionLabel, List<AppLegalSection> sections) =>
      ListView(padding: const EdgeInsets.all(16), children: [
        Text(versionLabel, style: const TextStyle(color: _muted, fontSize: 12)),
        ...sections.map((item) => Padding(
            padding: const EdgeInsets.only(top: 22),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.title,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 7),
              Text(item.body,
                  style: const TextStyle(color: _muted, height: 1.6))
            ])))
      ]);

  String _localTitle(String key) => _localDocument(key).title;

  _LocalLegalDocument _localDocument(String key) {
    final isSdk = key == 'sdk-list';
    final title = isSdk
        ? '第三方 SDK 清单'
        : key == 'account-deletion'
            ? '账号注销说明'
            : key == 'terms'
                ? '用户协议'
                : '隐私政策';
    final sections = isSdk
        ? const [
            AppLegalSection(
                title: '当前接入状态',
                body:
                    '开发版本仅提供微信登录和本机号码认证的原生适配器边界，尚未配置正式供应商 SDK、AppID、签名和生产密钥。未配置能力会明确停用，不会模拟生产授权成功。'),
            AppLegalSection(
                title: '正式发布要求',
                body:
                    '接入前需补充服务商名称、SDK 版本、处理目的、信息类型、使用场景、隐私政策链接及三端初始化时机，并经隐私合规审核和真机验证。')
          ]
        : key == 'account-deletion'
            ? const [
                AppLegalSection(
                    title: '申请条件',
                    body:
                        '登录后通过当前绑定手机号验证码确认本人操作。存在依法不能立即处理的争议、欠款或未完结交易时，相关记录按法律要求保留。'),
                AppLegalSection(
                    title: '冷静期',
                    body: '注销申请提交后进入 7 天冷静期。冷静期内可以在账号与安全页面撤销，撤销后账号继续正常使用。'),
                AppLegalSection(
                    title: '执行结果',
                    body:
                        '冷静期结束后，系统会匿名化账号资料、解除第三方账号绑定、移除登录设备并吊销全部会话。依法必须保存的交易和审计记录仅在规定期限及目的内保留。')
              ]
            : key == 'terms'
                ? const [
                    AppLegalSection(
                        title: '一、服务说明',
                        body:
                            '得宝为法律职业资格考试学习应用，向注册用户提供题库、课程、学习记录及相关服务。用户应使用本人手机号注册并妥善保管登录设备。'),
                    AppLegalSection(
                        title: '二、账号使用',
                        body:
                            '不得转让、出租或以其他方式向他人提供账号。发现账号异常时，应及时更换绑定手机号、移除异常设备或联系客服。'),
                    AppLegalSection(
                        title: '三、内容与交易',
                        body:
                            '课程权益、订单状态和退款规则以购买页面及订单约定为准。用户上传的答题内容应当合法，不得侵害他人权益。'),
                    AppLegalSection(
                        title: '四、责任与变更',
                        body:
                            '因维护、网络或第三方服务导致的短时不可用，将在合理范围内及时恢复。协议发生重要变更时，将通过应用内方式提示。')
                  ]
                : const [
                    AppLegalSection(
                        title: '一、信息收集',
                        body:
                            '为完成注册登录、学习同步和账号安全验证，我们会处理手机号、登录设备标识、学习记录、订单信息及用户主动提交的资料。'),
                    AppLegalSection(
                        title: '二、权限使用',
                        body:
                            '相册、相机、通知等系统权限仅在对应功能被用户主动使用时申请。拒绝非必要权限不影响手机号登录和基础学习功能。'),
                    AppLegalSection(
                        title: '三、共享与委托处理',
                        body:
                            '仅在实现短信、微信登录、号码认证、支付、推送等必要功能时，按最小范围向已披露的服务商提供信息。具体范围见第三方 SDK 清单。'),
                    AppLegalSection(
                        title: '四、用户权利',
                        body:
                            '用户可在账号与安全页面更换手机号、管理第三方绑定和登录设备，并可申请注销账号或在冷静期内撤销。'),
                    AppLegalSection(
                        title: '五、保存与保护',
                        body:
                            '个人信息在实现目的所需期限内保存，并采取访问控制、传输保护和会话吊销等措施。法律另有保存要求的，从其规定。')
                  ];
    return _LocalLegalDocument(
        title: title, versionLabel: '版本 2026-09-01', sections: sections);
  }

  String _formatDate(String value) {
    if (value.length >= 10) return value.substring(0, 10);
    return value.isEmpty ? '未知' : value;
  }
}

class _RemoteAccountSecurityScreen extends ConsumerStatefulWidget {
  const _RemoteAccountSecurityScreen();

  @override
  ConsumerState<_RemoteAccountSecurityScreen> createState() =>
      _RemoteAccountSecurityState();
}

class _RemoteAccountSecurityState
    extends ConsumerState<_RemoteAccountSecurityScreen> {
  final newPhone = TextEditingController();
  final oldCode = TextEditingController();
  final newCode = TextEditingController();
  bool phoneForm = false;
  bool busy = false;

  @override
  void dispose() {
    newPhone.dispose();
    oldCode.dispose();
    newCode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final identities = ref.watch(accountIdentitiesProvider);
    final devices = ref.watch(accountDevicesProvider);
    final deletion = ref.watch(accountDeletionProvider);
    final profile = user.valueOrNull;
    final scheduled = deletion.valueOrNull?.scheduled ?? false;

    if (user.isLoading && !user.hasValue) {
      return _remoteScaffold(
        body: const Center(
            child:
                CircularProgressIndicator(key: ValueKey('security-loading'))),
      );
    }
    if (user.hasError && !user.hasValue) {
      return _remoteScaffold(
        body: _RemoteStateMessage(
          icon: Icons.cloud_off_outlined,
          message: '账号安全信息暂时无法加载',
          actionLabel: '重试',
          onAction: () {
            ref.invalidate(currentUserProvider);
            ref.invalidate(accountIdentitiesProvider);
            ref.invalidate(accountDevicesProvider);
            ref.invalidate(accountDeletionProvider);
          },
        ),
      );
    }
    return _remoteScaffold(
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          _remoteSection(
            '手机号',
            '用于登录、找回账号和安全验证',
            ListTile(
              tileColor: Colors.white,
              leading: const Icon(Icons.phone_outlined, color: _brand),
              title: const Text('当前手机号'),
              subtitle: Text(_maskPhone(profile?.phone)),
              trailing: TextButton(
                onPressed:
                    busy ? null : () => setState(() => phoneForm = !phoneForm),
                child: Text(phoneForm ? '收起' : '更换'),
              ),
            ),
          ),
          if (phoneForm) _phoneForm(context),
          _remoteSection(
            '第三方账号',
            '微信登录仍需绑定本人手机号',
            _wechatTile(context, identities),
          ),
          _remoteSection(
            '登录设备',
            '移除设备后，该设备需要重新登录',
            _devicesView(context, devices),
          ),
          _remoteSection(
            '账号注销',
            '注销申请提交后有 7 天冷静期',
            _deletionView(context, deletion, scheduled),
          ),
          if (deletion.hasError && deletion.hasValue)
            _inlineRemoteError(
                '注销状态刷新失败', () => ref.invalidate(accountDeletionProvider)),
          const SizedBox(height: 12),
          _LegalLink(
              title: '第三方 SDK 清单', document: 'sdk-list', remoteEnabled: true),
          _LegalLink(
              title: '账号注销说明',
              document: 'account-deletion',
              remoteEnabled: true),
        ],
      ),
    );
  }

  Widget _remoteScaffold({required Widget body}) => Scaffold(
        backgroundColor: _page,
        appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('账号与安全'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
        ),
        body: body,
      );

  Widget _remoteSection(String title, String description, Widget child) =>
      Padding(
        padding: const EdgeInsets.only(top: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
            Text(description,
                style: const TextStyle(color: _muted, fontSize: 11)),
            const SizedBox(height: 7),
            child,
          ],
        ),
      );

  Widget _phoneForm(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              TextField(
                controller: newPhone,
                onChanged: (_) => setState(() {}),
                keyboardType: TextInputType.phone,
                maxLength: 11,
                decoration:
                    const InputDecoration(labelText: '新手机号', counterText: ''),
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: oldCode,
                      onChanged: (_) => setState(() {}),
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      decoration: const InputDecoration(
                          labelText: '当前号码验证码', counterText: ''),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: busy ? null : () => _sendPhoneCode('current'),
                    child: const Text('发送'),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: newCode,
                      onChanged: (_) => setState(() {}),
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      decoration: const InputDecoration(
                          labelText: '新号码验证码', counterText: ''),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: busy || newPhone.text.length != 11
                        ? null
                        : () => _sendPhoneCode('new'),
                    child: const Text('发送'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: busy ||
                          newPhone.text.length != 11 ||
                          oldCode.text.length != 6 ||
                          newCode.text.length != 6
                      ? null
                      : () => _changePhone(context),
                  child: Text(busy ? '处理中…' : '确认更换'),
                ),
              ),
            ],
          ),
        ),
      );

  Widget _wechatTile(
      BuildContext context, AsyncValue<List<AccountIdentity>> identities) {
    if (identities.isLoading && !identities.hasValue) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(18),
              child: Center(child: CircularProgressIndicator())));
    }
    if (identities.hasError && !identities.hasValue) {
      return _inlineRemoteError(
          '第三方账号信息暂时无法加载', () => ref.invalidate(accountIdentitiesProvider));
    }
    final identity = identities.valueOrNull
        ?.where((item) => item.provider == 'wechat')
        .firstOrNull;
    return ListTile(
      tileColor: Colors.white,
      leading: const Icon(Icons.chat_bubble_outline, color: Color(0xFF078C3D)),
      title: const Text('微信'),
      subtitle: Text(identity == null
          ? '未绑定'
          : '已绑定 · ${identity.nickname?.trim().isNotEmpty == true ? identity.nickname : '微信用户'}'),
      trailing: TextButton(
        onPressed: busy
            ? null
            : () => identity == null
                ? _bindWechat(context)
                : _unlinkWechat(context),
        child: Text(identity == null ? '绑定' : '解绑'),
      ),
    );
  }

  Widget _deletionView(BuildContext context,
      AsyncValue<AccountDeletionStatus> deletion, bool scheduled) {
    if (deletion.isLoading && !deletion.hasValue) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(18),
              child: Center(child: CircularProgressIndicator())));
    }
    if (deletion.hasError && !deletion.hasValue) {
      return _inlineRemoteError(
          '注销状态暂时无法加载', () => ref.invalidate(accountDeletionProvider));
    }
    return Card(
      child: ListTile(
        title: Text(scheduled ? '注销申请等待执行' : '申请注销账号'),
        subtitle: Text(scheduled
            ? _deletionSubtitle(deletion.valueOrNull)
            : '依法需要保留的交易记录将按协议处理。'),
        trailing: TextButton(
          onPressed: busy
              ? null
              : () => scheduled
                  ? _cancelDeletion(context)
                  : _requestDeletion(context),
          child: Text(scheduled ? '撤销' : '申请'),
        ),
      ),
    );
  }

  Widget _devicesView(
      BuildContext context, AsyncValue<List<UserDevice>> devices) {
    if (devices.isLoading && !devices.hasValue) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(18),
              child: Center(child: CircularProgressIndicator())));
    }
    if (devices.hasError && !devices.hasValue) {
      return _inlineRemoteError(
          '登录设备暂时无法加载', () => ref.invalidate(accountDevicesProvider));
    }
    final items = devices.valueOrNull ?? const <UserDevice>[];
    if (items.isEmpty) {
      return const Card(
          child: ListTile(
              leading: Icon(Icons.devices_other_outlined, color: _muted),
              title: Text('暂无其他登录设备')));
    }
    return Card(
      margin: EdgeInsets.zero,
      child: Column(
        children: [
          for (final device in items)
            ListTile(
              leading: Icon(
                  device.platform == 'ios'
                      ? Icons.phone_iphone_outlined
                      : device.platform == 'harmony'
                          ? Icons.smartphone_outlined
                          : Icons.phone_android_outlined,
                  color: device.current ? _brand : _muted),
              title: Text(device.name),
              subtitle: Text(
                  '${device.platform.toUpperCase()} · ${_relativeDate(device.lastSeenAt)}'),
              trailing: device.current
                  ? const Text('当前设备', style: TextStyle(color: _muted))
                  : TextButton(
                      onPressed:
                          busy ? null : () => _removeDevice(context, device),
                      child: const Text('移除',
                          style: TextStyle(color: Colors.red))),
            ),
        ],
      ),
    );
  }

  Widget _inlineRemoteError(String message, VoidCallback retry) => Card(
        child: ListTile(
          leading: const Icon(Icons.cloud_off_outlined, color: _muted),
          title: Text(message),
          trailing: IconButton(
              tooltip: '重试', icon: const Icon(Icons.refresh), onPressed: retry),
        ),
      );

  Future<void> _sendPhoneCode(String stage) async {
    if (stage == 'new' && newPhone.text.length != 11) return;
    await _runRemote(
        () => ref.read(accountSecurityRepositoryProvider).sendPhoneCode(
              stage: stage,
              phone: stage == 'new' ? newPhone.text.trim() : null,
            ),
        success: '验证码已发送，请查收短信');
  }

  Future<void> _changePhone(BuildContext context) async {
    final result = await _runRemote(
      () => ref.read(accountSecurityRepositoryProvider).changePhone(
            newPhone: newPhone.text.trim(),
            oldCode: oldCode.text.trim(),
            newCode: newCode.text.trim(),
          ),
    );
    if (!mounted || result == null) return;
    ref.invalidate(currentUserProvider);
    setState(() => phoneForm = false);
    _showMessage(context, '手机号已更新');
  }

  Future<void> _bindWechat(BuildContext context) async {
    final sent = await _runRemote(
      () => ref
          .read(accountSecurityRepositoryProvider)
          .sendIdentityCode(link: true),
      success: '请先完成微信授权，再输入短信验证码',
      showSuccess: false,
    );
    if (!mounted || sent == null) return;
    final values = await _wechatDialog(context, binding: true);
    if (!mounted || values == null) return;
    final identity = await _runRemote(
      () => ref.read(accountSecurityRepositoryProvider).bindWechat(
            authorizationCode: values.$1,
            smsCode: values.$2,
          ),
    );
    if (!mounted || identity == null) return;
    ref.invalidate(accountIdentitiesProvider);
    _showMessage(context, '微信已绑定');
  }

  Future<void> _unlinkWechat(BuildContext context) async {
    final sent = await _runRemote(
      () => ref
          .read(accountSecurityRepositoryProvider)
          .sendIdentityCode(link: false),
      success: '验证码已发送，请输入后确认解绑',
      showSuccess: false,
    );
    if (!mounted || sent == null) return;
    final values = await _wechatDialog(context, binding: false);
    if (!mounted || values == null) return;
    final removed = await _runRemote(
      () => ref.read(accountSecurityRepositoryProvider).unlinkWechat(values.$2),
    );
    if (!mounted || removed != true) return;
    ref.invalidate(accountIdentitiesProvider);
    _showMessage(context, '微信已解绑');
  }

  Future<(String, String)?> _wechatDialog(BuildContext context,
      {required bool binding}) async {
    final authorization = TextEditingController();
    final sms = TextEditingController();
    try {
      return await showDialog<(String, String)>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: Text(binding ? '绑定微信' : '解绑微信'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (binding)
                TextField(
                  controller: authorization,
                  decoration: const InputDecoration(labelText: '微信授权码'),
                ),
              TextField(
                controller: sms,
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration:
                    const InputDecoration(labelText: '短信验证码', counterText: ''),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('取消')),
            FilledButton(
              onPressed: () {
                if ((binding && authorization.text.trim().isEmpty) ||
                    sms.text.trim().length != 6) return;
                Navigator.pop(dialogContext,
                    (authorization.text.trim(), sms.text.trim()));
              },
              child: const Text('确认'),
            ),
          ],
        ),
      );
    } finally {
      authorization.dispose();
      sms.dispose();
    }
  }

  Future<void> _removeDevice(BuildContext context, UserDevice device) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('移除登录设备'),
        content: Text('移除“${device.name}”后，该设备需要重新登录。'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('取消')),
          FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('确认移除')),
        ],
      ),
    );
    if (!mounted || confirm != true) return;
    final result = await _runRemote(() =>
        ref.read(accountSecurityRepositoryProvider).removeDevice(device.id));
    if (!mounted || result == null) return;
    ref.invalidate(accountDevicesProvider);
    _showMessage(context, '设备已移除');
  }

  Future<void> _requestDeletion(BuildContext context) async {
    final sent = await _runRemote(
      () => ref.read(accountSecurityRepositoryProvider).sendDeletionCode(),
      success: '验证码已发送，请输入后确认注销',
      showSuccess: false,
    );
    if (!mounted || sent == null) return;
    final code = TextEditingController();
    try {
      final value = await showDialog<String>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('申请注销账号'),
          content: TextField(
            controller: code,
            keyboardType: TextInputType.number,
            maxLength: 6,
            decoration:
                const InputDecoration(labelText: '短信验证码', counterText: ''),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('取消')),
            FilledButton(
              onPressed: () {
                if (code.text.trim().length != 6) return;
                Navigator.pop(dialogContext, code.text.trim());
              },
              child: const Text('确认注销'),
            ),
          ],
        ),
      );
      if (!mounted || value == null) return;
      final status = await _runRemote(
        () =>
            ref.read(accountSecurityRepositoryProvider).requestDeletion(value),
      );
      if (!mounted || status == null) return;
      ref.invalidate(accountDeletionProvider);
      _showMessage(context, '注销申请已提交，冷静期内可撤销');
    } finally {
      code.dispose();
    }
  }

  Future<void> _cancelDeletion(BuildContext context) async {
    final result = await _runRemote(
        () => ref.read(accountSecurityRepositoryProvider).cancelDeletion());
    if (!mounted || result == null) return;
    ref.invalidate(accountDeletionProvider);
    _showMessage(context, '注销申请已撤销');
  }

  Future<T?> _runRemote<T>(Future<T> Function() action,
      {String? success, bool showSuccess = true}) async {
    if (busy) return null;
    setState(() => busy = true);
    try {
      final result = await action();
      if (mounted && showSuccess && success != null) {
        _showMessage(context, success);
      }
      return result;
    } catch (error) {
      if (mounted) _showMessage(context, _remoteErrorText(error), error: true);
      return null;
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  String _remoteErrorText(Object error) =>
      error is ApiError ? '${error.message}（${error.code}）' : '操作失败，请稍后重试';

  String _deletionSubtitle(AccountDeletionStatus? status) {
    final executeAfter = status?.executeAfter;
    if (executeAfter == null || executeAfter.isEmpty) return '冷静期内可撤销';
    final dateLabel = executeAfter.length >= 10
        ? executeAfter.substring(0, 10)
        : executeAfter;
    return '冷静期内可撤销，预计 $dateLabel 执行。';
  }

  String _relativeDate(String value) {
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return '最近使用';
    final difference = DateTime.now().difference(parsed.toLocal());
    if (difference.inMinutes < 2) return '刚刚使用';
    if (difference.inHours < 24) return '${difference.inHours} 小时前使用';
    return '${difference.inDays} 天前使用';
  }

  String _maskPhone(String? value) {
    if (value == null || value.length < 7) return '未绑定';
    return '${value.substring(0, 3)}****${value.substring(value.length - 4)}';
  }

  void _showMessage(BuildContext context, String message,
      {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: error ? Colors.red.shade700 : null,
    ));
  }
}

class _RemoteStateMessage extends StatelessWidget {
  const _RemoteStateMessage({
    required this.icon,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: _muted, size: 34),
            const SizedBox(height: 10),
            Text(message),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onAction,
              icon: const Icon(Icons.refresh, size: 16),
              label: Text(actionLabel),
            ),
          ],
        ),
      );
}

class _LocalLegalDocument {
  const _LocalLegalDocument(
      {required this.title,
      required this.versionLabel,
      required this.sections});
  final String title;
  final String versionLabel;
  final List<AppLegalSection> sections;
}

class _DocumentStateMessage extends StatelessWidget {
  const _DocumentStateMessage(
      {super.key,
      required this.icon,
      required this.message,
      this.actionLabel,
      this.onAction});
  final IconData icon;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  @override
  Widget build(BuildContext context) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: _muted, size: 32),
        const SizedBox(height: 10),
        Text(message, style: const TextStyle(color: _muted)),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onAction, child: Text(actionLabel!))
        ]
      ]));
}
