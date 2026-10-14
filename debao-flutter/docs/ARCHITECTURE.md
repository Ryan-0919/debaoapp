# Flutter 架构

## 当前实现（2026-09-02）

工程目前采用“共享基础设施 + feature 页面”的结构：

```text
features/presentation
        |
        +--> data/providers.dart (Riverpod)
                    |
                    +--> data/repositories.dart
                                |
                                +--> core/network/api_client.dart (Dio)
```

- `lib/core/network/api_client.dart` 是唯一的 HTTP 入口。它负责 base URL、超时、
  `Accept`/`X-Client-Platform` 请求头、bearer 注入、401 refresh-token 轮换、响应
  envelope 解包和 `ApiError` 映射。
- `lib/data/models.dart` 提供用户、首页、题目/客观题 session/报告、课程/权益、学习、
  商品/订单、通知/论坛、法条和批改等 typed model。
- `lib/data/repositories.dart` 按业务封装服务端路径；`lib/data/providers.dart` 用
  Riverpod `FutureProvider`/family provider 注入 repository，页面不直接拼 URL。
- `lib/features` 当前以页面文件为主，并没有为每个 feature 单独建立 domain service
  目录；“presentation -> domain -> data”仍是目标分层，不应在现状文档中写成已经落地。
- 当前没有 Drift/Isar 等本地业务数据库。答题草稿、播放进度和页面交互状态主要在
  页面 state 中，服务端是远端业务事实来源；安全 token 使用
  `lib/core/security/secure_token_store.dart`。

## Remote/Fixture 模式

`remoteEnabled` 是显式参数，不是请求失败后的隐式开关：

- `main.dart` 默认启动 `DebaoApp(remoteEnabled: false)`，以 RC fixture 保持稳定的视觉
  入口；使用 `--dart-define=DEBAO_REMOTE=true` 时，五个主 Tab 和从它们打开且透传该
  参数的子页面使用 repository/provider 读取 API。
- `DebaoApp()`、独立页面预览和 widget 测试默认 `remoteEnabled: false`，使用确定性的
  RC fixture 数据，便于视觉与交互测试。
- 远端首次失败渲染错误/重试，空集合渲染空态；已有数据刷新失败可以保留已加载内容并
  展示 banner，但不得静默切换到本地成功数据。
- 商品、订单、课程、学习工具、通知、论坛、法条和批改的远端页面已分别接入 provider；
  页面级视觉 parity 仍需单独验收，数据层接入不代表 1:1 完成。

## 路由与页面导航

`lib/app/app.dart` 的 `go_router` 已注册首页、认证、商城、订单、课程/媒体、题库、学习
工具、论坛、账号和批改等完整深链；页面内部仍有少量 `MaterialPageRoute` 用于局部 push。
路由 smoke test 会覆盖注册的深链解析，参数校验和导航状态恢复仍需继续补齐。

## Platform Boundary

`lib/platform/platform_contracts.dart` 定义认证、支付、媒体下载、推送、文件选择和直播
room contract；`platform_providers.dart` 当前注入 `Unavailable*Platform` 实现。这样页面
可以显示明确的 `unavailable`/`mocked` 状态，但不代表真实供应商 SDK 已接入。

仍待外部环境或凭据的能力：

- 生产短信和微信授权供应商（本地验证码及账号安全服务端流程已接入，真实短信/微信 SDK 仍需凭据）；
- 微信/支付宝/Apple/HarmonyOS 支付及订单支付回调；
- 视频、音频、直播解码、后台播放、DRM、下载和锁屏控制；
- APNs、Android 厂商/FCM、Harmony Push；
- 图片/PDF 选择、附件上传、对象存储和系统分享。

Windows 当前无法验证 iOS 的 Xcode 工具链，也未检测到 HarmonyOS DevEco/hvigor/ohpm/hdc；
Android APK 构建还受 Gradle 插件依赖网络影响。平台发布不属于本轮 Goal。

## 服务端边界

Flutter 不复制订单价格校验、课程权益判定或客观题判分。相关规则留在
`debao-server`；Flutter 只消费其 `{ data, requestId }`/`{ error, requestId }` contract，
并通过 idempotency key 保护客观题 session 和批改提交。服务端数据库迁移、真实 Provider、
支付回调和推送 Worker 的状态，以 `debao-server` 文档和测试为准。
