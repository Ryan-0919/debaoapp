# 业务开发 Goal 模式提示词

本文件用于继续开发移动端真实业务，不用于重复执行已经完成的 28 页 Figma 1:1 迁移。推荐先运行 Goal A；真实供应商资料和三端环境齐备后再运行 Goal B。后台已经单独立项，后台开发必须使用 [ADMIN_CONSOLE_DESIGN.md](ADMIN_CONSOLE_DESIGN.md) 第 13 节的独立 Goal，不能混入本提示词。

## Goal A：当前环境内完成全部业务工程

将下面整段内容作为 Goal 模式提示词：

```text
你正在继续开发“得宝”法考学习 App。工作目录是 E:\code\得宝APP开发，移动端位于 debao-mobile，服务端位于 debao-server。请持续实施，不要只输出方案，直到当前机器和现有资料范围内的业务开发、测试和文档全部完成。

本 Goal 的范围以 debao-mobile/docs/BUSINESS_DEVELOPMENT_PLAN.md 为准，按 WP-00 至 WP-10 顺序执行。本轮明确不开发独立后台管理 Web 页面、后台角色菜单、运营工作台或可视化管理报表；不要删除现有 /v1/admin/* 接口，但不要扩建后台管理产品。需要维护的初始题库、课程、法条、商品和首页内容使用 JSON/CSV 模板、校验器和命令行导入脚本完成。

一、开始前必须完成
1. 完整阅读 debao-mobile/docs/BUSINESS_DEVELOPMENT_PLAN.md、FEATURE_BACKLOG.md、PROGRESS.md、ARCHITECTURE.md、API.md、DEVELOPMENT.md、PLATFORMS.md、TESTING.md、DECISIONS.md、INTEGRATION_BLOCKERS.md、AUTH_INTEGRATION.md，以及 debao-server/README.md 和 openapi.yaml。
2. 检查 git status 和现有差异。工作区可能有用户修改，不得 reset、checkout、覆盖或删除不属于本 Goal 的改动。
3. 运行移动端 pnpm check、服务端 npm run check、OpenAPI YAML 解析和 docker compose config，记录真实基线。Docker、SDK 或设备不可用时记录准确错误后继续其他可做工作。
4. 对照 BUSINESS_DEVELOPMENT_PLAN.md 建立 WP-00 至 WP-10 的执行计划；一次只允许一个工作包处于 in_progress。

二、固定边界
1. 保留 React Native 0.82.1、React 19.1.1、TypeScript 5.8.3、RNOH 0.82.30 方向，不改成 WebView、Capacitor 或三套重复页面。
2. 现有 28 页正常态已经完成 1:1，业务开发不得自行改版。新增状态只补 loading、empty、error、offline、permission、disabled、retry 和业务必要弹层。
3. 生产模式不得静默使用 mockServices、src/data/mock.ts、固定 AI 答案、模拟播放计时或 mock-paid 冒充成功。DEBAO_USE_MOCKS=true 仅用于原型回归；DEBAO_USE_MOCKS=false 必须严格读取 API 或展示明确失败状态。
4. PostgreSQL 是生产事实来源。生产环境数据库不可用时启动失败；不得使用内存降级掩盖生产故障。Redis 仅用于缓存、限流、一次性票据和短期状态。
5. 金额、支付状态、课程权益、分数、正确答案、库存、批改次数和身份绑定由服务端判定。客户端结果不能直接改变这些状态。
6. 所有写接口实现鉴权、用户隔离、参数校验、幂等、并发控制、审计和可测试错误码。
7. Provider 私钥只从服务端环境读取。不得写入或提交 token、AppSecret、支付密钥、证书、正式签名、生产 keystore 或个人数据。
8. 没有真实凭据时，实现 Provider contract、HTTP adapter、配置校验、沙箱测试、失败状态和接入文档，然后把真实联调记录到 INTEGRATION_BLOCKERS.md 并继续下一项。不得伪造真实联调结果。
9. 不创建或修改 PRODUCT.md。

三、执行工作包
1. WP-00：生产运行基础。完成数据库/Redis 跨重启、生产禁用内存降级、环境分层、分页、幂等、结构化日志、脱敏、限流、备份恢复与 CI 检查。
2. WP-01：账号与用户安全。完成验证码消费与频控、换绑、身份冲突、设备/会话管理、注销与撤销、头像上传、协议入口，以及三端认证 Provider 边界。
3. WP-02：题库与答题闭环。完成数据导入、题目版本、组卷、服务端计时、答案自动保存、断线恢复、幂等交卷、服务端判分、报告、记录、错题和收藏。
4. WP-03：学习计划、报告与首页。完成计划 CRUD、任务状态、学习事件、日周月聚合、薄弱项、首页模式持久化和真实首页数据。
5. WP-04：法条、论坛与公告。完成法条导入/版本/全文索引、收藏与练习、论坛帖子/回复/点赞/举报/作者删除、公告已读和深链；公告运营管理已独立建设，生产内容审核仍按运营规则接入。
6. WP-05：课程、媒体与直播。完成课程导入、权益、签名媒体地址、真实播放器 contract、进度、字幕、笔记、讲义、下载和直播状态。缺少供应商或原生 SDK 时完成服务端和 TS 边界及失败状态。
7. WP-06：商品、订单、支付与售后。完成商品/SKU 导入、服务端计价、幂等订单、支付状态机、回调验签边界、权益、恢复购买、退款与对账。无商户凭据时不宣称真实支付完成。
8. WP-07：主观题批改。严格按 [GRADING_SYSTEM_DESIGN.md](GRADING_SYSTEM_DESIGN.md) 实现可批改题目/批改依据/采分点、用户答案快照、AI 首轮、独立兼职批改登录与工作台、人工复核、用户报告、小时/日统计和审计。OpenAI GPT 系列模型配置只存在服务端，兼职老师不可见。
9. WP-08：AI 法律答疑。完成会话持久化、流式协议、取消/重试、法条检索引用、额度、审核、限流和成本记录。无模型 key 时完成 HTTP provider 沙箱和失败状态。
10. WP-09：通知与深链。完成设备 Token 生命周期、通知分类/分页/全部已读、业务模板、类型化深链和通知偏好。无证书时完成三端桥接 contract 和服务端沙箱。
11. WP-10：三端质量与生产切换。完成严格真实模式回归、异常状态、Android 可用环境的 release/真机验证，以及 iOS/Harmony 工程、bundle 和当前工具链允许的验证；外部平台不得虚报。

四、每个工作包的强制循环
1. 先审计已有实现，不重复创建已有接口或类型。
2. 先确定业务状态机、数据库约束和错误码，再修改客户端。
3. 同步实现迁移、服务端、客户端 contract、真实 service、页面状态和测试。
4. 同步更新 debao-server/openapi.yaml、docs/API.md、环境变量示例和相关专题文档。
5. 运行该工作包的定向测试，再运行完整移动端和服务端检查。
6. 更新 docs/PROGRESS.md：状态只能使用未开始、进行中、已完成、受阻，并写明证据和唯一下一步。
7. 只有 BUSINESS_DEVELOPMENT_PLAN.md 的该工作包验收条件全部满足，才把它标为已完成；外部联调未做时必须拆分为“本地实现已完成”和“真实联调受阻”。

五、最低测试要求
1. 服务端业务规则至少覆盖成功、未登录、越权、无效输入、重复提交、并发/幂等和 Provider 不可用。
2. 数据库测试覆盖迁移重复执行、唯一约束、事务回滚、跨用户隔离和重启恢复。
3. 客户端测试覆盖 loading、empty、error、retry、token 失效、重复点击和正常导航。
4. 真实模式测试必须显式设置 DEBAO_USE_MOCKS=false，并证明 API 失败不会展示 Mock 成功数据。
5. 依赖或原生代码变化后重新执行 Android/iOS production bundle 和 pnpm harmony:link、pnpm harmony:bundle。
6. 最终执行 pnpm check、npm run check、OpenAPI YAML 解析、docker compose config 和 git diff --check。

六、完成门槛
1. WP-00 至 WP-10 中当前环境可完成的代码、测试和文档全部完成。
2. 没有开发后台管理页面或偏离既定范围。
3. 不存在生产模式静默 Mock、伪支付、伪播放、伪 AI、伪推送或伪登录。
4. 每项真实外部依赖在 INTEGRATION_BLOCKERS.md 中写清所需账号/证书/数据、代码接入点、环境变量、验收命令和当前状态。
5. 所有可运行自动化检查通过；不能运行的原生或供应商验收有准确阻塞证据。
6. 最终报告按 WP-00 至 WP-10 逐项列出：完成内容、测试证据、剩余外部阻塞。不得使用“其余均完成”代替逐项结果。

持续推进所有不依赖外部资料的工作，不要在遇到第一个支付、证书、macOS、DevEco 或真机阻塞时停止整个 Goal。只在当前环境内全部可做事项真正完成后结束。
```

## Goal B：真实供应商和三端发布联调

只有 `BUSINESS_DEVELOPMENT_PLAN.md` 第 6 节列出的入口材料齐备后再运行。将下面整段内容作为 Goal 模式提示词：

```text
继续“得宝”App 的真实供应商和三端发布联调。工作目录是 E:\code\得宝APP开发。先阅读 debao-mobile/docs/BUSINESS_DEVELOPMENT_PLAN.md、INTEGRATION_BLOCKERS.md、AUTH_INTEGRATION.md、PLATFORMS.md、TESTING.md、PROGRESS.md 和 debao-server/.env.example，核对用户本次提供的账号、证书、SDK、合同和真机范围。

本 Goal 不开发后台管理系统，不改变已完成的 28 页 1:1 正常态，不把任何密钥提交到 Git。按 INTEGRATION_BLOCKERS.md 逐项接入短信、微信、一键登录、三端支付、对象存储、媒体/直播、批改、AI 和推送；每接入一项都完成服务端验签或 token 校验、客户端原生桥接、失败回退、沙箱测试和至少一台对应平台真机验证。

随后完成 Android release、iOS Xcode/TestFlight、HarmonyOS HAP 的签名构建、安装、升级、冷启动、深链、支付回调、推送、媒体生命周期和核心业务冒烟测试。严格区分本地、沙箱和生产结果；没有实际执行的项目不得写成通过。

完成时更新 INTEGRATION_BLOCKERS.md、PLATFORMS.md、TESTING.md、PROGRESS.md、API.md、openapi.yaml 和环境变量说明。最终按供应商和平台逐项给出真实证据、失败项和应用商店提交前剩余事项。
```
