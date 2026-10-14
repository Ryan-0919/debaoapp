# Flutter 页面实现矩阵

## 当前验收快照（2026-09-02）

基准是 `debao-mobile` 的现有页面、导航、资源和服务契约；Figma/RC 只用于核对已有
页面，不用于凭空增加功能。正式入口 `lib/main.dart` 默认使用
`DebaoApp(remoteEnabled: false)` 的 RC fixture；需要连接服务端时显式传入
`--dart-define=DEBAO_REMOTE=true`。独立页面预览和 widget 测试同样使用显式的
`remoteEnabled: false` fixture 模式。

当前工程验证：`flutter test --no-pub` `98/98`、Web 构建通过（中文 Windows 路径需
`--no-tree-shake-icons`）、`scripts/local_api_smoke.ps1` `24/24`、`debao-server`
检查 `54/54`。这些结果证明代码和契约可运行，不等于 1:1 视觉验收完成。已通过本地
SPA fallback 在 `390x844` 视口保存 36 个公开深链的 Flutter 首帧截图，见
`docs/evidence/visual/routes/`；这些是路由/布局证据，不替代逐页 RC 同状态截图和像素
golden 对照。新增 `test/route_layout_test.dart` 同样覆盖 36 个公开深链的首帧
异常/ErrorWidget 检查。

状态含义：

- `功能/远端已接入，视觉证据待补`：代码已有主要流程和 provider，但尚无可复核的逐页
  RC/Flutter 同尺寸截图，不能称 1:1 完成。
- `远端边界已覆盖，业务能力待补`：loading/empty/error/retry 或服务端读取已实现，仍有
  业务字段、写操作或外部 SDK 缺口。
- `fixture/不可用状态`：仅用于 RC 视觉预览，或明确显示供应商未配置；不是生产成功态。

| 页面 | RN 原项目来源 | 当前 Flutter 状态 | 已实现/已知差异 |
|---|---|---|---|
| Home | `src/pages/Home.tsx` / `src/screens/tabs/HomeScreen.tsx` | 功能/远端已接入，视觉证据待补 | `/v1/home` 与论坛 provider、主客观切换、通知/论坛入口、空/错/重试；fixture 模式保留原型图片和文案 |
| QuestionBank | `src/pages/QuestionBank.tsx` / `src/screens/tabs/QuestionBankScreen.tsx` | 功能/远端已接入，视觉证据待补 | 科目读取、客观/主观切换、年份/章节入口、客观 session 导航；年份与完整 RC 内容数量仍需截图核对 |
| Mall | `src/pages/Mall.tsx` | 功能/远端已接入，视觉证据待补 | `/v1/products`、搜索/筛选、空/错/重试、商品详情入口；真实库存/SKU/支付未接入 |
| Courses | `src/pages/Courses.tsx` | 功能/远端已接入，视觉证据待补 | `/v1/courses`、日历/全部课程、分类空态、错误重试、课程详情入口；服务端未返回的媒体字段不伪造 |
| Profile | `src/pages/Profile.tsx` | 功能/远端已接入，视觉证据待补 | 用户、课程、订单、报告、错题远端读取和空态；详情页视觉及账号媒体仍待验收 |
| SubjectiveSelect | `src/pages/SubjectiveSelect.tsx` | 远端边界已覆盖，RC parity 待补 | 批改题目 provider、年份/难度筛选、loading/empty/error/retry、进入答题；服务端题目数量和 RC 卡片细节尚未逐项核对 |
| SubjectiveAnswer | `src/pages/SubjectiveAnswer.tsx` | 远端提交/草稿已接入，视觉证据待补 | 小问导航、文本草稿、完整法条检索页与返回、提交确认、幂等提交和成功页；附件目前只是页面状态，真实文件选择/上传未接入 |
| SubjectiveSubmitSuccess | `src/screens/tools/GradingSubmitSuccessScreen.tsx` | 提交结果已接入，视觉证据待补 | 提交成功信息、返回题库和带 submission id 的“查看批改记录”已接通；`/questions/subjective/success` 与 `/grading/success` 均复用 Flutter `SubjectiveSubmitSuccessScreen`；真实批改完成通知由服务端/推送提供 |
| ObjectiveAnswer | `src/pages/ObjectiveAnswer.tsx` | 远端闭环已接入，视觉证据待补 | 服务端 session 创建/恢复、题目顺序、已保存答案、单选/多选、逐题 PUT、15 分钟倒计时、幂等交卷、生命周期提示 |
| ObjectiveReport | `src/pages/ObjectiveReport.tsx` | 服务端报告已接入，视觉证据待补 | `ObjectiveReport` 读取服务端答案快照、版本、得分、科目统计和逐题解析；旧记录兼容路径不提供完整正确答案，报告全部状态仍需 RC 截图 |
| ProductDetail | `src/pages/ProductDetail.tsx` | 远端商品/订单创建已接入，视觉证据待补 | `/v1/products/{id}`、字段缺失空态、购买确认面板、`POST /v1/orders`；支付 SDK、价格/库存校验和评价数据未接入 |
| PurchaseSuccess | `src/pages/PurchaseSuccess.tsx` | fixture 成功页；生产支付待补 | 本地 fixture 展示成功入口；远端创建订单进入 `PurchasePending`，不能视为已扣款或权益已开通 |
| PurchasePending | RN 订单创建/支付流程 | 远端订单创建已接入，支付能力待补 | 展示订单号和待支付说明，可进入远端订单列表；`POST /v1/orders/{id}/pay` 与支付回调未接入 |
| OrderList | `src/pages/OrderList.tsx` | 远端读取已接入，视觉证据待补 | `/v1/orders`、loading/empty/error/retry、详情参数；分页、刷新、支付/退款状态动作未接入 |
| OrderDetail | `src/pages/OrderDetail.tsx` | 远端详情读取已接入，视觉证据待补 | `/v1/orders/{id}` 按订单号读取服务端商品/金额/状态；售后、退款和支付动作未接入 |
| CourseDetail | `src/pages/CourseDetail.tsx` | 远端详情/权益已接入，媒体能力待补 | `/v1/courses/{id}`、entitlement、章节展开、未授权阻断、媒体授权入口；讲义/笔记同步和真实媒体 SDK 未接入 |
| VideoPlayer | `src/pages/VideoPlayer.tsx` | 媒体授权探测已接入，原生能力待补 | 目录/讲义/笔记、倍速、控件显隐、模拟进度和 390x844 widget 断言；服务端授权成功后仍提示原生播放器 SDK 待配置 |
| AudioPlayer | `src/pages/AudioPlayer.tsx` | 媒体授权探测已接入，原生能力待补 | 波形、15 秒跳转、循环、倍速、逐字稿、笔记和窄屏断言；无真实音频、后台播放、锁屏或下载 |
| LiveCourse | `src/pages/LiveCourse.tsx` | 媒体授权探测已接入，直播能力待补 | 倒计时、预约、排期和窄屏断言；无信令/流媒体/聊天室/课件，分享明确为不可用 |
| LearningReport | `src/pages/LearningReport.tsx` | 远端读取已接入，视觉证据待补 | `/v1/learning/report?period=week`、服务端总览/科目统计、空/错/重试和薄弱科目专项练习入口；周柱图当前是结构化示意，服务端未提供逐日数据 |
| LearningPlan | `src/pages/LearningPlan.tsx` | 远端读取/任务完成已接入，视觉证据待补 | Flutter fixture 与远端页均按 RC 的“本周计划/下周预计”分周任务卡、进度卡、状态图标和时长展示；任务完成写入、空/错/重试已覆盖。服务端计划 CRUD contract 已有，但 RC 页面没有创建/编辑控件，因此未凭空增加管理入口；视觉截图和跨设备冲突仍待验收 |
| MistakeBook | `src/pages/MistakeBook.tsx` | 远端读取/筛选/移除已接入，视觉证据待补 | `/v1/mistakes`、本地科目筛选、删除/resolve、空/错/重试和远端错题重做入口；服务端分页未接入 |
| Favorites | `src/pages/Favorites.tsx` | 题目收藏和法条收藏远端已接入，视觉证据待补 | typed question/legal favorites、移除、题目详情/继续练习、法条详情快照、空/错/重试；RC/Flutter 同尺寸截图仍待补 |
| LawSearch | `src/pages/LawSearch.tsx` | 远端搜索、筛选、分组和收藏已接入，视觉证据待补 | 根据产品确认，法条页只保留 `/v1/law/search`、科目筛选、按科目折叠、版本/生效日期、全文 bottom sheet、法条收藏和相关练习；论坛使用独立社区页面，公告使用首页独立列表，不再混入法条检索；RC/Flutter 同尺寸截图仍待补 |
| QuestionRecords | `src/pages/QuestionRecords.tsx` | 远端分页、筛选、加载更多和累计统计已接入，视觉证据待补 | typed records、科目/客观题/主观题筛选、分页/加载更多、累计 answered/correct、`/v1/question-submissions/{id}/report` 详情、报告入口、空/错/重试；Flutter 另注册 `/tools/question-records/:recordId` 记录详情路由并已有首帧证据；RC/Flutter 同尺寸截图仍待补 |
| UserProfile | `src/pages/UserProfile.tsx` | 远端读取/更新已接入，视觉证据待补 | `/v1/me`、PATCH 保存和明确错误；头像照片选择/上传未接入；账号安全写操作由独立 `AccountSecurity` 页面承载 |
| Settings | `src/pages/Settings.tsx` | 远程通知偏好已接入，视觉证据待补 | `GET/PATCH /v1/me/settings` 保存学习提醒；账号安全/协议导航、退出确认；课程/订单通知开关及客服接口仍按 RC 静态入口保留。已移除 RC 不存在的缓存清理行，退出按钮改为 RC 白底无描边样式 |
| AccountSecurity | `src/screens/account/AccountSecurityScreen.tsx` | 远端读写已接入，视觉证据待补 | 手机号换绑、微信绑定/解绑、设备列表/移除、注销申请/撤销均通过 `AccountSecurityRepository` 和 `/v1/account/*`、`/v1/devices`；身份/注销独立 loading/error/retry 状态；原生微信授权仍依赖供应商 |
| LegalDocument | `src/screens/account/LegalDocumentScreen.tsx` | 远程版本化文档已接入，视觉证据待补 | 公开 `GET /v1/legal-documents/{key}` 返回 RC 同源章节和版本；加载/空/错/重试不回退 fixture，fixture 模式保留 RC 文案 |
| Notifications | `src/screens/account/NotificationsScreen.tsx` | 远端列表/已读已接入，视觉证据待补 | `/v1/notifications`、逐条 `POST /v1/notifications/{id}/read`、loading/empty/error/retry、未读视觉；推送 SDK 未接入 |
| AIChat | `src/screens/ai/AIChatScreen.tsx` | 远端单轮回复已接入，业务能力待补 | `/v1/ai/reply`、发送/loading/offline、明确本地 fixture；流式输出、历史、配额、审核和取消未接入 |
| Forum | `src/screens/tools/Forum*` | 远端列表/写操作已接入，视觉证据待补 | 列表、分类/范围、空/错/重试、发帖入口；举报提交已接入 Flutter 详情页，审核和后台治理由管理端承载 |
| ForumCompose | `src/screens/tools/ForumComposeScreen.tsx` | 远端发帖已接入，平台验收待补 | 表单校验、提交状态、成功返回详情；键盘、附件和弱网端到端验收待补 |
| ForumDetail | `src/screens/tools/ForumDetailScreen.tsx` | 远端详情/评论/点赞/收藏已接入，视觉证据待补 | 详情、评论列表与创建、点赞/收藏；作者删除与举报提交已接入 Flutter 详情页，审核和后台治理由管理端承载 |
| GradingService | `src/screens/tools/GradingServiceScreen.tsx` | 远端题目/套卷/记录已接入，业务能力待补 | `grading*Provider`、套卷详情、提交和报告状态；真实附件、AI/人工批改 worker、发布通知依赖服务端/供应商 |
| GradingPaperDetail | `src/screens/tools/GradingPaperDetailScreen.tsx` | 远端详情已接入，视觉证据待补 | 试卷题目读取、进入主观答题；上传和批改提交的附件能力未接入 |
| GradingReport | `src/screens/tools/GradingReportScreen.tsx` | 远端报告读取已接入，外部流程待补 | 报告/提交状态、刷新/重试；报告发布和人工批改结果取决于服务端 worker |

## 通过条件

### 当前视觉证据边界

`docs/evidence/visual/routes/` 已覆盖全部 36 个公开 Flutter 深链的首帧（每张
`390x844`），但它们是路由/布局 smoke 证据，不是逐页 RC 对照。RC 的 62 张 Figma
状态图（正常态、筛选、展开、弹层、键盘、提交等）尚未与 Flutter 建立同状态配对；
因此本矩阵当前没有页面可仅凭“有截图”改成“1:1 已完成”。

页面只有同时具备以下证据才可将状态改为“1:1 已完成”：

1. RN/RC 源码、文案、资源和导航清单；
2. 390x844 基准正常态与 Flutter 同尺寸实现截图；
3. 关键交互态（筛选、展开、弹层、提交、返回、键盘等）截图或自动化断言；
4. 适用的 loading/empty/error/offline/disabled/permission/retry 状态；
5. Android 及可用平台的启动、返回、日志和长文本验证。

## 已知平台限制

Android debug/release APK 已在 API 36 模拟器工具链构建；Windows 无 macOS/Xcode，未检测到
HarmonyOS DevEco/hvigor/ohpm/hdc。微信/短信、支付、推送、媒体/直播、文件上传和
对象存储均只有 contract 或明确不可用状态。平台发布不属于本 Goal。
