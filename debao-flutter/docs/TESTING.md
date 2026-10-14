# Flutter 测试计划与当前记录

## 当前自动化基线（2026-09-02）

最近一次完整记录：

- `flutter test --no-pub`：`98/98` 通过（含 RC 页面导航、全部公开深链首帧布局、学习计划 CRUD、远端边界、课程媒体和商品详情长页回归）。
- `flutter build web --no-pub --no-tree-shake-icons --no-wasm-dry-run`：通过。
- `flutter build apk --debug --no-tree-shake-icons`：通过；安装到 `emulator-5554` 后冷启动显示首页离线重试态。
- Android 模拟器开发联调：开发环境默认使用 `http://10.0.2.2:4000` 访问宿主机；可用
  `--dart-define=DEBAO_API_BASE_URL=...` 覆盖。新 debug APK 已重新构建并安装，冷启动进程正常。
- `dart analyze --format machine`：`0 error / 0 warning`，仍有 `148` 条既有
  lint/info（139 条 lint、9 条 hint）；不能描述为静态检查完全清零。
- `debao-server` 的 `npm run check`：`54/54` 通过。
- `scripts/local_api_smoke.ps1`：`24/24` 通过，目标为
  `http://127.0.0.1:4000`。

Web 构建需要 `--no-tree-shake-icons`，因为 Flutter 在 Windows 中文工作区路径下生成
字体子集文件时可能出现路径编码失败；`--no-wasm-dry-run` 用于跳过
`flutter_secure_storage_web` 的 Wasm 兼容性提示。这两个参数不等于页面运行验证。

Android 模拟器不能用 `127.0.0.1` 访问宿主机 API；开发构建会自动映射到
`10.0.2.2:4000`。物理设备或其他环境请显式传入 `DEBAO_API_BASE_URL`。

## 98 个 Flutter 测试的实际覆盖

| 测试文件 | 数量 | 当前覆盖 |
|---|---:|---|
| `test/widget_test.dart` | 18 | 五 Tab/题库入口、主观题法条完整页与返回、学习计划 RC 分周任务卡和状态切换、学习工具、资料保存、AI、通知、商城本地支付边界、批改、设置、论坛和登录协议 |
| `test/smoke_test.dart` | 1 | App Shell 首页和底部导航首屏 |
| `test/course_media_test.dart` | 8 | 课程到媒体导航；视频播放/倍速/控件/笔记；音频波形/跳转/循环/逐字稿/笔记；直播倒计时/预约；订单封面与类型；390x844 媒体首屏无溢出 |
| `test/course_remote_detail_test.dart` | 4 | 服务端课程目录、权益阻断、空详情不回退 fixture、授权后进入媒体页、空章节媒体占位保护 |
| `test/course_remote_media_test.dart` | 3 | 视频/音频/直播 Provider 不可用原因、重试和授权状态 |
| `test/data_layer_test.dart` | 2 | 核心 repository 集合和 typed model 映射、学习计划 CRUD contract |
| `test/home_navigation_test.dart` | 1 | 首页做题记录快捷入口导航 |
| `test/learning_plan_crud_test.dart` | 5 | 学习计划创建、更新、删除、任务完成和服务端错误边界 |
| `test/objective_session_repository_test.dart` | 3 | 客观题 session 创建/恢复 contract、不同答题意图隔离、逐题 PUT、幂等交卷和服务端报告快照 |
| `test/question_draft_repository_test.dart` | 3 | 云端草稿 PUT、旧 transport 不支持状态、旧客观题提交 payload |
| `test/remote_data_boundary_test.dart` | 14 | 订单列表/详情、个人中心、商品详情、课程、批改、主观题、论坛和客观报告页面的 loading/empty/error/no-mock-fallback 边界 |
| `test/study_tools_interactions_test.dart` | 4 | 本地做题记录报告、本地收藏继续练习、远端通知已读请求和未读点更新、远端学习计划任务完成请求 |
| `test/legal_document_remote_test.dart` | 5 | 版本化法律文档 repository、章节/版本渲染、错误不回退 fixture、设置远端通知偏好 |
| `test/objective_record_snapshot_test.dart` | 1 | 历史客观题记录优先使用服务端快照 |
| `test/auth_repository_test.dart` | 2 | 认证供应商/验证码/登录会话映射、token 持久化和退出清理 |
| `test/login_remote_test.dart` | 1 | 远程登录页验证码发送、会话持久化和成功状态 |
| `test/user_profile_remote_test.dart` | 2 | 远程个人资料加载失败/重试，以及服务端昵称、手机号和考试年份渲染 |
| `test/account_security_remote_test.dart` | 3 | 远端账号安全服务端资料、设备操作，以及身份/注销加载失败边界 |
| `test/account_security_repository_test.dart` | 1 | 账号安全 repository 的身份、设备、手机号、微信和注销 contract |
| `test/question_records_and_legal_favorites_repository_test.dart` | 2 | 做题记录分页/筛选、累计 `answered/correct` 和法条收藏快照、增删 contract |
| `test/route_layout_test.dart` | 1 | 36 个公开深链在 390x844 逻辑视口渲染首帧；检查无异常和 ErrorWidget。该测试是布局/路由 smoke，不是像素 golden 对照 |
| `test/router_smoke_test.dart` | 2 | 全部注册深链路由均可解析并渲染页面、独立深链返回按钮和媒体页返回入口 |

自动化尚未覆盖完整的 28 页像素级视觉 parity，也没有 golden 文件或 `integration_test/`
用例。已保存 36 个公开深链的 390x844 Flutter 首帧截图到
`docs/evidence/visual/routes/`；这些截图不替代 RC 同状态对照。首页/题库/学习工具/
主观题的全部远端状态、导航返回、键盘与长文本仍缺少端到端覆盖。

## API 冒烟范围

`scripts/local_api_smoke.ps1` 当前检查：

1. `GET /v1/health`；
2. `GET /v1/legal-documents/privacy` 和 `GET /v1/auth/providers`；
3. 本地短信验证码 `POST /v1/auth/send-code`、`POST /v1/auth/login`，以及签发 token 后的
   `GET /v1/me` 和 `POST /v1/auth/logout`；
4. 带 `demo-token` 的 `GET /v1/me`、`GET /v1/me/settings`、`GET /v1/courses`、
   `GET /v1/questions`、`GET /v1/products`、`GET /v1/orders`、`GET /v1/notifications`、
   `GET /v1/forum/posts`、`GET /v1/me/identities`、`GET /v1/devices`、
   `GET /v1/account/deletion`、`GET /v1/learning/plans`、`GET /v1/learning/tasks`、
   `GET /v1/learning/report`、`GET /v1/legal-favorites`、`GET /v1/mistakes`；
5. 若订单列表非空，再检查一笔 `GET /v1/orders/{id}`。

每个成功响应检查 `data` 和 `requestId`；订单详情还校验返回 id。当前完整读取基线为 `24/24`。
该脚本不覆盖客观题 session 写流程、主观题批改、课程媒体授权、法条搜索写流程或认证刷新，
因此 `24/24`
只能说明这组检查通过，不能代表 API 全量联调完成。

## 推荐命令

Windows 中文路径下可直接使用已验证的 Flutter 绝对路径，必要时再映射 ASCII 盘符：

```powershell
E:\tools\debao-flutter\flutter\bin\dart.bat analyze --format machine
E:\tools\debao-flutter\flutter\bin\flutter.bat test --no-pub
E:\tools\debao-flutter\flutter\bin\flutter.bat build web --no-pub --no-tree-shake-icons --no-wasm-dry-run
.\scripts\local_api_smoke.ps1
```

服务端在 `debao-server` 目录执行：

```powershell
npm run check
```

## 视觉与平台验收缺口

自动化通过不替代逐页视觉验收。当前可复核证据位于
`debao-flutter/docs/evidence/visual/`，其中 `routes/` 保存了 36 个 Flutter clean-path
首帧（每张 `390x844`），RC 参考图位于 `debao-mobile/docs/screenshots/figma-*.png`。
首帧证据可证明路由和布局可达，但仍不能替代逐页同状态的像素 1:1 对照。

页面改为“视觉已完成”前仍需补齐：

- RC 基准正常态和 Flutter 同尺寸正常态截图；
- loading/empty/error/offline/retry、弹层、长文本和禁用态；
- 返回、键盘、滚动、重复提交和跨页面参数；
- Android 安装/冷启动/日志；iOS 与 HarmonyOS 在各自工具链和真机环境中的复核。

平台原生发布、供应商登录/支付/推送/媒体/直播/文件 SDK 在本 Goal 中排除，统一标记为
“未验证/外部阻塞”，不得标记为通过。
