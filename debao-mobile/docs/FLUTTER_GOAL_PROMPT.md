# 得宝 APP Flutter 重开发 Goal 提示词

将以下内容整体作为 Goal 模式提示词使用。

```text
你正在重新开发“得宝”法考学习 APP。工作目录是 E:\code\得宝APP开发。

【最终技术方向】
移动端新建 Flutter + Dart 工程，目录名为 debao-flutter，目标 Android、iOS、HarmonyOS。使用 Riverpod、go_router、Dio 和安全存储；具体依赖必须先验证再锁定。后端不整体重写，继续复用 debao-server 的 API、PostgreSQL、Redis 和 OpenAPI 契约。debao-admin 继续独立维护。debao-mobile React Native 工程保留为 RC 运行态、接口、业务和页面基准，不删除、不覆盖；“得宝APP (1)” Figma Make 仅作历史源码参考。

【开始前必须做】
1. 阅读 debao-mobile/docs/FLUTTER_REBUILD_PLAN.md，以及 debao-mobile/docs/PAGE_PARITY_MATRIX.md、API.md、BUSINESS_DEVELOPMENT_PLAN.md、FEATURE_BACKLOG.md、PLATFORMS.md、TESTING.md、DECISIONS.md、PROGRESS.md。
2. 检查 git status，保留用户已有修改；禁止 git reset、checkout、clean 或删除现有工程。
3. 检查 Flutter、Dart、Android SDK、JDK、Xcode、DevEco Studio、ohpm/hvigor/hdc 是否存在，记录真实版本和阻塞项。
4. 检查“得宝APP (1)”中的页面、资源、路由和交互，不得凭印象重设计。

【第一阶段：先做技术验证，不要直接全量造页面】
1. 创建 debao-flutter 工程和最小启动页。
2. Android 可运行并生成截图；iOS 在当前环境可用时构建，否则验证工程和记录 macOS 阻塞；HarmonyOS 在工具链可用时构建，否则记录准确阻塞。
3. 验证 Dio 请求、Token 安全存储、图片/PDF 选择、视频播放、深链和统一错误处理。
4. 为微信登录、手机号一键登录、微信绑定、支付、推送、视频、直播和文件上传建立 platform contract；没有真实供应商时只能使用明确标注的 Mock/沙箱，不能伪造成功。
5. 输出 docs/FLUTTER_PLATFORM_SPIKE.md，记录每项能力的 Android/iOS/HarmonyOS 状态、依赖、测试证据和外部阻塞。

【架构要求】
1. lib/features 按 auth、home、question_bank、subjective、grading、learning、courses、media、mall、ai、legal、community、notifications、profile 拆分。
2. 每个 feature 使用 data/domain/presentation 分层。
3. 页面只能调用 provider/domain service；不能直接访问数据库、拼接 API URL 或读取密钥。
4. 平台差异集中在 lib/platform 和原生插件，不能把 Platform.isX 分支散落在业务页面。
5. 统一实现 loading、empty、error、offline、disabled、permission、retry 和防重复提交状态。
6. 统一记录 requestId、错误码、日志和可恢复失败。

【1:1 页面要求】
1. 视觉、布局、文案和交互基准来自 `debao-mobile` RC 运行态及其页面源码/资源；Figma Make 仅在需要追溯历史实现时参考，不能凭空扩展设计。
2. 先完成五个主 Tab：首页、题库、商城、课程、我的；再按真实导航完成其余核心页面。
3. 每页必须对照原型实现层级、内容顺序、中文文案、图标、图片、颜色、字号、字重、行高、间距、尺寸、圆角、边框、阴影、弹层和交互状态。
4. 每完成一页立即更新 docs/PAGE_PARITY_MATRIX.md，保存 RC 基准截图、Flutter 截图、关键交互和已知差异。不能最后批量补文档。
5. 不得用通用卡片模板替代 RC 页面，不得删减页面，不得凭空新增页面或交互。

【业务开发顺序】
Goal 1：基础架构和账号体系，包括登录、Token 刷新、微信绑定手机号、换绑、设备管理、异地提醒、头像和注销。
Goal 2：RC 28 个核心页面 parity，包括主客观题、课程、播放器、订单、学习工具、AI、法条、论坛、批改和账号页面。
Goal 3：题库、真实组卷、单选/多选、计时、断点续答、主观题套卷逐题作答、草稿、附件、法条查询、提交成功、服务端判分、报告、错题和收藏。
Goal 4：课程权益、试看、有效期、章节进度、讲义、笔记、视频/音频、直播、回放和断线恢复。
Goal 5：SKU、库存、优惠券、订单、三端支付、回调验签、退款、对账、AI 流式答疑、引用、额度、审核和通知推送。
Goal 6：论坛治理、批改任务分发、AI 首轮、人工批改、原句划线、红线点评、遗漏采分点、用户批改报告、隐私合规和上线包。

【后端边界】
复用 debao-server，不重写现有 API 和数据库。只在必要时补齐真实 PostgreSQL/Redis、对象存储、队列、支付验签、AI Provider、媒体、推送、审计和监控。价格、权益、判分、批改状态和权限以服务端为准。生产环境禁止静默回退 Mock。

【每个 Goal 的完成标准】
1. 代码完成且通过 flutter analyze、flutter test；相关服务端测试也必须通过。
2. 页面能打开、核心控件能操作、路由和返回正常；不是只创建空文件或占位文本。
3. Android 具备工具链时必须构建、安装、冷启动并截图；iOS/HarmonyOS 具备工具链时必须实际构建，否则记录外部阻塞和已完成的可执行验证。
4. 同步更新 README、docs/DEVELOPMENT.md、docs/ARCHITECTURE.md、docs/PLATFORMS.md、docs/TESTING.md、docs/PROGRESS.md、docs/PAGE_PARITY_MATRIX.md 和相关 API 文档。
5. 最终报告必须逐项列出完成项、测试证据、Mock 边界、外部阻塞和下一步，不能用“基本完成”代替证据。

现在从“第一阶段：三端技术验证”开始。先检查环境和现有文档，再创建 debao-flutter；不要删除任何现有目录，不要直接宣称 iOS 或 HarmonyOS 真机完成。
```
