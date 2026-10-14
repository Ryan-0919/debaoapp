# 产品化开发记录

## 当前交付

- 当前快照：2026-09-02。Mock fixture 继续服务于原型视觉验收，真实模式通过 `DEBAO_USE_MOCKS=false` 访问已覆盖的本地 API。
- 独立 `debao-server` TypeScript API 服务，可用 `npm run dev` 或 Docker Compose 启动。
- 统一 requestId、成功/错误 envelope、鉴权校验和参数校验。
- 已接入业务接口：用户/账号安全、题库科目与客观题会话、答题草稿/提交/记录/报告、课程权益与进度、学习计划/任务/报告、订单/支付状态、通知、错题/收藏、法条、论坛、批改基础流程、AI/媒体适配器边界和后台运营 API。
- PostgreSQL 迁移 `001` 至当前最新版本覆盖用户、刷新会话、设备、科目/题目、课程权益、商品/订单/订单事件、学习/批改/公告/论坛、后台管理、版本化法律文档、答题/学习快照、上传/优惠券、AI/通知状态、退款复核字段及论坛举报并发幂等索引；`002_seed.sql` 提供可重复执行的演示数据。
- Redis 与 PostgreSQL 已加入 Docker Compose，用户、设备、草稿、答题提交/记录、错题、收藏、订单、权益、学习计划/任务、批改、公告和论坛写入/启动回填已接入 PostgreSQL；未配置数据库时保留内存降级。
- Compose API 容器会等待 PostgreSQL/Redis 健康检查，通过后自动按文件名顺序执行当前目录中的全部迁移；本轮已实际执行并验证重复执行安全。
- refresh token 仅以 SHA-256 摘要写入 PostgreSQL，并使用 Redis 做会话缓存；每次刷新都会轮换，登出、移除设备和注销会同步吊销。
- 客户端真实模式会等待本地会话恢复，401 时对并发请求只执行一次 token refresh，并且只重放一次原请求。
- React Native 服务层支持 Mock/真实 API 运行时切换，页面和导航保持 1:1 原型结构。
- AI 对话、题库科目/提交、商城商品、订单列表、通知、学习计划/报告、错题、收藏、做题记录、课程权益和法条搜索已在真实模式接入 API；请求失败时显示明确错误/重试状态，不静默回退为原型成功数据。
- 新增登录/刷新、学习计划、学习报告、错题、收藏、课程权益、答题记录、批改队列、设备、首页内容、商品、法条、论坛和运营接口契约。
- 本轮补齐外部适配器的 `local`/`unconfigured`/`http` 三种模式、8 秒超时与 Bearer key 转发；媒体页真实模式调用 `/media/prepare` 并在不可用时展示明确状态。
- 订单、课程进度和通知已读回执均按用户隔离并持久化；新增 `003_user_state.sql`。
- 新增登录门禁、短信验证码、运营商一键登录、微信首次强制绑定手机号和再次直接登录；`004_auth_identities.sql` 保存第三方身份、一次性绑定票据和登录审计事件。

## 运行验收

| 项目 | 结果 |
|---|---|
| `debao-server npm run check` | 54/54 通过 |
| `debao-mobile pnpm typecheck` | 通过 |
| `debao-mobile pnpm check` | 36 suites、73 tests 通过（typecheck/lint/Jest） |
| 本地 API HTTP 冒烟 | `scripts/local_api_smoke.ps1` 当前 `24/24` 通过，覆盖健康、认证、用户、课程、题库、商城、订单、学习、法条、错题、通知和论坛读取；写流程与 Provider 错误边界由自动化测试覆盖 |
| Android production JS bundle | 通过，`productization.android.bundle` |
| iOS production JS bundle | 通过，`productization.main.jsbundle` |
| Harmony Hermes bundle | 通过，`harmony/entry/src/main/resources/rawfile/hermes_bundle.hbc` |
| Docker Compose 全链路 | `docker compose config` 通过；PostgreSQL/Redis healthy、API 临时端口 `4011` 启动、迁移与管理员登录已实测 |
| Redis 故障探针 | 不可达时快速返回 `redisReachable=false`，不持续重试 |

## 未伪造的外部依赖

短信、Apple/Android/Harmony 支付、AI provider、对象存储/CDN、APNs/FCM/Harmony Push、法考授权题库、iOS/macOS 签名和 Harmony DevEco 构建均需要供应商账号、证书、设备或合同。本阶段只提供适配器边界、配置模板、错误码和本地测试；没有声称完成真实供应商联调。

## 下一批实现顺序

1. 在正式环境执行 PostgreSQL/Redis/API 全链路和跨重启恢复验证，并替换本地管理员凭据。
2. 补齐客户端分页/筛选入口、法条全文索引和科目级学习统计增强。
3. 将已完成的本地导出/批改/推送 Worker 处理入口部署为独立可靠队列，补齐跨重启恢复、可靠重试、审计监控和结构化告警；本机代码与持久化闭环已完成。
4. 在具备供应商凭据后接入支付、短信、AI、媒体和推送，并补齐沙箱集成测试。
