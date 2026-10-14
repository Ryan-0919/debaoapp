# Flutter API 对接

## 当前边界

Flutter 当前通过 `ApiClient` 访问本地 `debao-server`，开发地址为
`http://127.0.0.1:4000`，默认开发凭据为服务端 `demo-token` fixture。
`AppEnvironment.current` 目前固定为 development；staging/production 地址只是
配置枚举，尚未接入构建时切换。生产环境不得把 API 失败静默替换为本地演示数据。

正式入口 `lib/main.dart` 默认使用 `DebaoApp(remoteEnabled: false)` 的 RC fixture。
需要连接服务端时显式传入 `--dart-define=DEBAO_REMOTE=true`；独立页面预览和大部分
widget 测试默认 `remoteEnabled: false`，这是显式的 RC fixture 模式，不是网络失败后的
回退路径。

## Flutter Repository Mapping

| Repository | 当前调用的服务端接口 | Provider/入口 |
|---|---|---|
| `UserRepository` | `GET/PATCH /v1/me` | `currentUserProvider`、`UserProfileScreen` |
| `AuthRepository` | `GET /v1/auth/providers`、`POST /v1/auth/send-code`、`POST /v1/auth/login`、`POST /v1/auth/logout` | `authRepositoryProvider`、`LoginScreen(remoteEnabled: true)`；会话写入 `SecureTokenStore` |
| `HomeRepository` | `GET /v1/home` | `homeDataProvider`、`HomeScreen` |
| `AiRepository` | `POST /v1/ai/reply` | `AIChatScreen`（远端模式） |
| `QuestionRepository` | `GET /v1/question-subjects`、`GET /v1/questions`、`GET /v1/questions/{id}` | `subjectsProvider`、`questionListProvider`、`questionProvider` |
| `QuestionRepository` | `GET /v1/question-records`、`GET /v1/question-submissions/{id}/report`、`POST /v1/question-submissions` | `typedQuestionRecordsProvider`、记录详情、旧版客观题提交；分页响应包含当前筛选范围的累计 `answered`/`correct` |
| `QuestionRepository` | `GET/POST /v1/question-sessions`、`GET /v1/question-sessions/{id}`、`PUT/PATCH /v1/question-sessions/{id}/answers`、`POST /v1/question-sessions/{id}/submit`、`GET /v1/question-sessions/{id}/report` | `objectiveSessionProvider`、`objectiveReportProvider`、`ObjectiveAnswerScreen` |
| `QuestionRepository` | `PUT /v1/question-drafts/{id}`、`GET/POST /v1/favorites`、`DELETE /v1/favorites/{id}`、`GET /v1/mistakes`、`DELETE /v1/mistakes/{id}` | `typedFavoritesProvider`、`typedMistakesProvider`、主观题/学习工具页面 |
| `CourseRepository` | `GET /v1/courses`、`GET /v1/courses/{id}`、`GET /v1/courses/{id}/entitlement`、`POST /v1/courses/{id}/progress` | `coursesProvider`、`courseProvider`、`courseEntitlementProvider` |
| `CourseRepository` | `POST /v1/media/prepare` | `mediaAvailabilityProvider(courseId:kind)`、视频/音频/直播页面 |
| `CourseRepository` | `GET/POST /v1/learning/plans`、`PATCH/DELETE /v1/learning/plans/{id}`、`GET /v1/learning/tasks`、`POST /v1/learning/tasks/{id}/complete`、`GET /v1/learning/report` | `learningPlansProvider`、`learningTasksProvider`、`learningReportProvider` |
| `CommerceRepository` | `GET /v1/products`、`GET /v1/products/{id}`、`GET /v1/orders`、`GET /v1/orders/{id}`、`POST /v1/orders` | `productsProvider`、`productProvider`、`ordersProvider`、`orderProvider` |
| `CommunityRepository` | `GET /v1/notifications`、`POST /v1/notifications/{id}/read` | `notificationsProvider`、`NotificationsScreen` |
| `CommunityRepository` | `GET/POST /v1/forum/posts`、`GET /v1/forum/posts/{id}`、`POST /v1/forum/posts/{id}/like`、`POST /v1/forum/posts/{id}/favorite`、`GET/POST /v1/forum/posts/{id}/comments` | `forumPostsProvider`、`forumPostProvider`、`forumCommentsProvider`、论坛页面 |
| `LegalRepository` | `GET /v1/law/search`、`GET /v1/announcements`、`GET /v1/legal-documents/{key}` | `legalSearchProvider`、`legalDocumentProvider`、法条/协议/公告页面 |
| `SettingsRepository` | `GET/PATCH /v1/me/settings` | `userSettingsProvider`、`SettingsScreen(remoteEnabled: true)` |
| `GradingRepository` | `GET /v1/grading/questions`、`GET /v1/grading/questions/{id}`、`GET /v1/grading/papers`、`GET /v1/grading/papers/{id}`、`GET /v1/grading/submissions/v2`、`GET /v1/grading/submissions/{id}`、`GET /v1/grading/submissions/{id}/report`、`POST /v1/grading/submissions`、`POST /v1/grading/submissions/{id}/retry` | `grading*Provider`、批改服务页面 |

所有 repository 接受 `ApiTransport`，因此映射测试可使用 fake transport；生产实现
为同一份 `ApiClient` contract。集合响应同时兼容数组和 `{ items: [...] }`。

## Objective Session Contract

客观题远端链路已经覆盖：服务端创建/恢复进行中的 session、使用服务端题目顺序和
已保存答案、单选/多选逐题保存、带 `Idempotency-Key` 交卷，以及从服务端读取
`ObjectiveReport`。报告使用服务端题目版本、答案快照、得分和科目统计，不在 Flutter
重复判分。相关 repository 测试在 `test/objective_session_repository_test.dart`。

主观题远端页面目前读取批改题目、保存云端草稿并提交批改；提交使用题目版本和
`Idempotency-Key` 防止重复创建；附件按钮仍是页面状态，
真实文件选择/上传尚未实现。

## Response and Error Rules

- 成功响应：`{ data, requestId }`；`ApiClient` 返回前解包 `data`。
- 错误响应：`{ error: { code, message, requestId } }`，映射为 `ApiError`。
- 连接失败/连接超时映射为 `OFFLINE`，接收超时映射为 `TIMEOUT`，其余请求失败保留
  服务端状态码和消息。
- 每个请求自动附加 `Accept: application/json`、`X-Client-Platform: flutter`；需要认证
  的请求附加 bearer token。
- HTTP 401 最多执行一次 refresh-token 轮换；刷新失败会清理安全存储并继续返回错误。
- Access/Refresh Token 只由 `SecureTokenStore` 保存，不写入普通偏好或日志。
- 远端首次加载失败显示错误和重试；空集合显示空态；已有内容刷新失败可以保留内容并
  显示错误 banner，但绝不改用成功的 mock 数据。
- 媒体 `POST /v1/media/prepare` 只做能力探测/短期授权。`available: false` 或
  `503/ADAPTER_UNAVAILABLE` 必须显示服务端原因和重试；即使 `available: true`，当前
  页面仍会明确提示原生播放器 SDK 待配置。
- 订单创建以服务端当前商品价格、库存和订单幂等键为准；客户端展示价格不能作为扣款
  依据。订单冲突、重复幂等键和商品切换会返回错误，支付回调及最终权益发放仍需真实
  Provider。
- 学习报告支持 `day`、`week`、`month` 时间窗；课程、订单、学习计划、收藏、论坛和
  通知等资源均按当前用户隔离，客户端不得用本地 fixture 替代跨用户访问错误。

## Server Endpoints Not Yet Implemented In Flutter

账号安全和设备管理已经通过 `AccountSecurityRepository`、Riverpod providers 和
`AccountSecurityScreen(remoteEnabled: true)` 接入，包括手机号换绑、微信绑定/解绑、设备移除、
注销申请/撤销及独立的加载失败重试状态。以下能力仍只有 contract、不可用状态或待接入真实
平台实现：微信/一键登录等原生认证 UI (`/v1/auth/wechat`、`/v1/auth/one-click`)、通知权限设置、
订单支付 (`POST /v1/orders/{id}/pay`)、批改人员工作台 (`/v1/grader/*`)、
文件上传、推送、支付、原生媒体与直播 SDK。页面必须显示 unavailable/待配置状态，不能写成已联调。

应用协议文档使用公开的 `GET /v1/legal-documents/{key}`，只返回 `published` 版本及章节；
`key` 仅支持 `terms`、`privacy`、`sdk-list`、`account-deletion`。设置中的学习提醒通过
鉴权的 `GET/PATCH /v1/me/settings` 持久化，服务不可用时页面显示错误和重试，不回退到远端成功假数据。

## Verification

启动服务端后运行：

```powershell
.\scripts\local_api_smoke.ps1
```

当前冒烟脚本覆盖健康检查、公开隐私文档、认证能力/验证码/登录/签发 token 后的用户读取/退出、
账号安全读取、学习计划/任务/报告、法条收藏、错题、课程/题目/商城/订单/通知/论坛和一笔订单详情，共 `24/24`；它不等于
所有接口和所有页面均已完成联调。OpenAPI 来源：
`E:\code\得宝APP开发\debao-server\openapi.yaml`。

后续如引入 OpenAPI 生成 Dart client，必须锁定生成器版本并提交生成结果；当前代码仍为
手写 typed model/repository。
## 2026-09-02 additions

- `QuestionRepository.recordPage()` calls `GET /v1/question-records?page=&pageSize=&subjectId=&mode=` and maps the paginated response. The response includes filtered cumulative `answered` and `correct` totals for summary cards; the legacy unparameterized array response remains supported.
- Legal article favorites use `GET/POST /v1/legal-favorites` and `DELETE /v1/legal-favorites/{id}`. The server stores an immutable article/version snapshot; duplicate creates are idempotent.
- `LegalRepository.search(query, subjectId: ...)` forwards the optional subject filter to `GET /v1/law/search`.
