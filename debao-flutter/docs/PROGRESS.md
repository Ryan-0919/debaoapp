# Flutter 重开发进度

## 当前快照（2026-09-02）

本轮 Goal 的范围是：以 `debao-mobile` 现有 RC 页面、导航、资源和服务契约为唯一
功能基准，完成 Flutter 主页面和子页面的可运行实现、`debao-server` API/Riverpod
数据层闭环、明确远端失败状态、测试和 Web 构建。平台发布不在范围内。

“文件存在”或“路由能打开”不等于页面完成。页面只有在正常态、关键交互、
loading/empty/error/offline/disabled/retry、导航返回和 390x844 对照证据齐全后，才能
在 `PAGE_PARITY_MATRIX.md` 标记为 1:1 完成。当前多数页面仍是“代码/数据已接入，视觉
证据待补”，不能把可运行误写成已完成。

## 最近验证记录

以下结果来自最近一次代码变更后的验证记录；若继续修改代码，应重新执行并更新本节：

- `E:\tools\debao-flutter\flutter\bin\flutter.bat test --no-pub`：`98/98` 通过（含 RC 页面导航、36 个公开深链首帧布局、商品详情长页、课程媒体、学习计划 CRUD、远端边界和服务端快照 contract）。
- `E:\tools\debao-flutter\flutter\bin\dart.bat analyze --format machine`：`0 error / 0 warning`，仍有
  `148` 条 lint/info（139 条 lint、9 条 hint）。
- `flutter build web --no-pub --no-tree-shake-icons --no-wasm-dry-run`：通过。
- `flutter build apk --debug --no-tree-shake-icons`：通过；已安装到 `emulator-5554` 并完成冷启动检查。Android 开发目标默认将本机 API 映射为 `10.0.2.2:4000`，支持 `DEBAO_API_BASE_URL` 编译时覆盖。
- `debao-server` `npm run check`：`54/54` 通过（含分页记录 `answered/correct` 累计字段校验、幂等、权限隔离、SKU 原子库存和后台题库导入流程）。
- `scripts/local_api_smoke.ps1`：本地 `http://127.0.0.1:4000` 实际 `24/24` 通过，
  包含健康检查、公开隐私文档、认证能力/验证码/登录/签发 token 后的用户读取/退出、
  账号安全读取、学习计划/任务/报告、法条收藏、错题、课程/题目/商城/订单/通知/论坛和一笔订单详情。

Web 构建中的 `--no-tree-shake-icons` 是 Windows 中文路径下 Flutter 字体子集工具的
规避参数；`--no-wasm-dry-run` 只跳过 Web Wasm 兼容性提示，不代表原生媒体能力可用。

## 已完成的工程能力

| 项目 | 当前状态 | 证据/边界 |
|---|---|---|
| Flutter 工程与依赖 | 已建立 | Flutter 3.47.2 / Dart 3.13.2，`flutter pub get` 已验证 |
| 网络层 | 已建立 | Dio `ApiClient` 统一 base URL、超时、请求头、bearer、401 refresh、envelope 和 `ApiError` |
| 安全存储 | 已建立 | `SecureTokenStore` 保存 access/refresh token，不写普通偏好或日志 |
| typed 数据层 | 已建立 | `data/models.dart`、`repositories.dart`、`providers.dart` 覆盖用户、首页、题目、课程、学习、商城、订单、通知、论坛、法条和批改 |
| 客观题远端闭环 | 已接入 | session 创建/恢复、服务端题目顺序、已保存答案、单选/多选、逐题 PUT、幂等交卷、服务端报告读取；测试覆盖 contract |
| 主观题远端流程 | 已接入边界 | 批改题目读取、筛选、云端草稿 PUT、提交、成功页和批改记录入口已接入；附件选择/上传及完整批改 worker 仍受外部能力限制 |
| 课程媒体 | 能力探测已接入 | `/v1/media/prepare` 的 loading/error/unavailable/retry 已覆盖；真实视频/音频/直播 SDK 未配置 |
| 订单详情 | 已接入 | 页面级 `GET /v1/orders/{id}` 读取服务端字段，不用列表占位内容 |
| 学习工具/社区 | 远端读取与关键写操作已接入 | 计划、任务、报告、错题、收藏、法条、论坛、通知已读、批改 provider 已建立；逐页视觉证据和服务端未提供的写操作仍按矩阵标注 |

## 页面完成度总览

详细页面清单、来源、远端状态和差异见 [`PAGE_PARITY_MATRIX.md`](PAGE_PARITY_MATRIX.md)。
当前不把任何页面仅因“能运行”标记为 1:1 完成：

- 五个主 Tab（首页、题库、商城、课程、我的）已有首屏布局和主要入口，仍需逐页
  Flutter 截图与 RC 截图对照。
- 客观题作答已经取得服务端闭环；客观题报告已能读取服务端快照；视觉状态和完整
  返回流仍需验收。
- 主观题选择/答题、学习报告、收藏、法条、做题记录、媒体播放器等页面已有代码和
  远端边界，但仍有 RC 细节、字段数量、弹层、附件或原生能力缺口。
- 手机号登录、退出和账号安全（手机号换绑、微信绑定/解绑、设备移除、注销申请/撤销）写操作已接入；
  微信/一键登录的原生授权仍按矩阵标注供应商边界；法律文档已通过公开版本化 API
  读取，设置页的学习提醒已通过 `/v1/me/settings` 持久化。未配置的认证供应商和
  原生能力仍显示明确不可用状态。

## 平台与供应商限制

| 项目 | 状态 | 说明 |
|---|---|---|
| Android APK | 已验证（debug/release） | `build/app/outputs/flutter-apk/app-debug.apk` 与 `app-release.apk` 已生成；debug APK 已安装到 API 36 模拟器；签名与商店发布不在本 Goal |
| iOS 构建 | 受阻 | 当前 Windows 无 macOS/Xcode |
| HarmonyOS 构建 | 受阻 | 未检测到 DevEco Studio、hvigor、ohpm、hdc |
| 手机号验证码登录 | 已接入（服务端/Flutter） | `/v1/auth/send-code`、`/v1/auth/login`、`/v1/auth/logout` 已接入；生产环境仍需配置短信供应商 |
| 微信/一键登录 | 未接入 | 页面显示原生 SDK 未配置；需凭据、签名和真机 |
| 支付 | 未接入 | 仅完成订单创建 contract；微信/支付宝/Apple/HarmonyOS 支付与回调未接入 |
| 推送 | 未接入 | 通知列表可读；APNs、Android 厂商/FCM、Harmony Push 未接入 |
| 媒体/直播 | 未接入 | 服务端可返回授权或不可用原因；原生解码、DRM、后台播放、直播信令未接入 |
| 文件/附件 | 未接入 | 主观题附件目前是页面状态；文件选择、上传、对象存储和审核未接入 |

这些外部限制不会被“演示成功”掩盖。平台发布、签名、商店提交和真实供应商联调均不
属于本轮 Goal。

## 下一步验收清单

1. 对照 `PAGE_PARITY_MATRIX.md` 逐页补 RC 正常态、关键交互态、错误态和返回流程截图。
2. 在可靠的 390x844 移动视口和桌面视口分别检查长文本、键盘、滚动、弹层和禁用态。
3. 重新执行 Flutter 测试、Dart 分析、Web 构建、服务端测试和 API smoke，并更新本节数字。
4. 只有截图/导航/状态证据齐全后，才把矩阵中的对应页面改为 1:1 完成。

## 历史记录

此前按时间追加的“首批迁移”“第二轮对齐”“16/16、40/40”等记录已被当前代码和
测试结果取代，不作为当前完成证明。保留这些记录仅用于追踪开发批次；当前状态以本页
快照、`TESTING.md` 和 `PAGE_PARITY_MATRIX.md` 为准。
