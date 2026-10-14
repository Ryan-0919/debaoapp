# 得宝 API 服务

这是得宝移动端的本地产品化 API。当前实现提供可替换的仓储与支付适配器：默认使用内存数据和 `local` 支付适配器，便于在没有供应商账号时完成端到端开发；生产环境应接入 PostgreSQL、Redis 以及对应支付渠道。

## 本地运行

```powershell
cd E:\code\得宝APP开发\debao-server
Copy-Item .env.example .env
npm install
npm run dev
```

服务地址：`http://127.0.0.1:4000`，健康检查：`GET /v1/health`。本地演示令牌为 `demo-token`，仅用于开发，不得用于生产。

## Docker

```powershell
docker compose up --build
```

该编排启动 PostgreSQL、Redis 和 API；API 容器等待两个依赖健康后自动执行 `npm run migrate`，按文件名顺序应用当前目录中的全部迁移再启动。生产部署需使用正式迁移工具执行并配置密钥管理。

Compose 内置的 `admin` / `local-compose-admin-2026` 仅用于本地联调，且关闭强制 MFA；生产环境必须通过密钥管理注入新的管理员凭据和 MFA 配置。

数据库已提供可重复执行的 `001` 至 `042` 迁移。数据库可达后运行 `npm run migrate`；迁移脚本按文件名顺序执行，生产环境应在发布流水线中执行并记录版本。`008_admin_console.sql` 增加管理员账号、角色权限、后台会话和审计日志表；`009` 至 `012` 增加题目版本、用户操作、退款和社区举报数据；`013` 增加导入/导出/审核/推送任务表；`014` 增加管理员 MFA 密钥字段；`015` 增加试卷表；`016` 增加法条版本字段；`024` 增加版本化应用法律文档和用户通知偏好表；`026` 增加商品上下架状态；`027` 增加答题历史题目快照；`028` 增加独立答题幂等键；`029` 增加学习任务完成时间和科目字段；`030` 增加商品 SKU、优惠券、学习活动、附件和订单生命周期字段；`031` 增加 AI 会话/消息、活动题目关联和通知关闭状态；`032` 增加退款拒绝原因、退款双人复核阶段及最终审核字段；`033` 增加可持久化的后台系统设置（含退款复核阈值）；`034` 增加 AI 配额/用量/风险记录及导出、推送任务的 worker 状态字段；`035` 为待处理论坛举报增加按帖子/用户的并发幂等唯一索引；`037` 增加题型与题库分类字段；`042` 增加公告置顶、受众、深链、撤回和时间窗口字段。

## 接口契约

机器可读契约见 `openapi.yaml`。

## 已实现接口

`GET /v1/health`、短信验证码、运营商一键登录、微信登录/绑定手机号、Refresh Token 轮换/logout、`GET/PATCH /v1/me`、`GET/PATCH /v1/me/settings`、公开版本化应用法律文档、微信绑定/解绑、手机号换绑、设备与会话管理、注销冷静期/撤销/到期执行、题目/答题记录/报告、学习计划/任务/报告、错题/收藏、课程/权益/进度、商品、订单/支付、首页/公告/通知、法条、论坛列表/详情/发布/评论/点赞/收藏/作者删除/举报、批改队列、AI/媒体和运营概览均已提供本地实现。

后台已提供管理员登录/退出、当前管理员、动态导航、管理员/角色目录、独立 MFA 首次绑定与重置、工作台指标、用户列表/详情、用户限制/强制下线/权益调整、题目列表/创建/编辑/发布/版本历史、试卷维护、题目导入预检/确认、法条版本维护、课程章节/课时、直播排期、批改领取/提交、商品编辑/价格历史、订单详情时间线、退款 Provider 边界、社区帖子/评论/举报/规则治理、公告/Banner/模板/推送任务、AI 配额/Provider 和分析概览查询接口；写操作统一校验后台会话、CSRF 和审计字段。

响应统一为 `{ data, requestId }`；错误统一为 `{ error: { code, message, requestId } }`。支付、短信、AI、媒体、推送和批改通过环境变量选择 `local`、`http` 或未配置模式；HTTP 模式只从服务端读取 provider URL/key，当前未宣称真实供应商联调。

## Productization notes

- Migration `003_user_state.sql` adds per-user course progress and notification read receipts.
- Migration `004_auth_identities.sql` adds WeChat identities, one-time phone-binding tickets, and auth audit events.
- Migration `005_account_security.sql` adds avatar fields, verification challenges, deletion completion and session/device indexes; `006_verification_risk_context.sql` adds IP/device risk context.
- Migration `007_forum.sql` adds forum categories, soft deletion, comments, per-user likes/favorites and pagination indexes.
- Forum writes enforce author permissions, 4-80/10-5000/1-1000 character limits and per-user hourly posting/comment limits. Lists support category, mine/favorites scopes and opaque cursors.
- Verification challenges expire after five minutes, are single-use, count failed attempts and enforce phone/IP/device send limits.
- Refresh tokens rotate on use. Removing a device or completing account deletion revokes matching sessions and cache entries.
- `GET /v1/orders` and order detail/payment routes are scoped to the authenticated user; admin routes retain the full view.
- Admin authentication uses `POST /v1/admin/auth/login` with a local development account or production `admin_users` account, an HttpOnly `debao_admin_session` cookie, CSRF token, `GET /v1/admin/me`, `GET /v1/admin/navigation` and `GET /v1/admin/dashboard`. Production can require first-login MFA enrollment; secrets are encrypted with `DEBAO_AUTH_SECRET`. Admin routes accept the cookie session only; APP bearer tokens and the former `admin-token` fixture are rejected.
- Production bootstrap is one-time: set `ADMIN_INIT_USERNAME`, `ADMIN_INIT_PASSWORD` (at least 12 characters), `ADMIN_INIT_DISPLAY_NAME`, `DATABASE_URL` and `DEBAO_AUTH_SECRET`, then run `npm run admin:init`. The command refuses to run when any administrator already exists.
- `POST /v1/notifications/:id/read` is idempotent and persists the authenticated user's receipt.
- Provider failures and missing configuration return HTTP `503` with error code `ADAPTER_UNAVAILABLE`; refund approval never reports success when the payment-refund Provider is unconfigured.
- Docker Compose was validated with `docker compose config`; this workspace also verified healthy PostgreSQL/Redis containers, migrations, restart idempotency, and admin login through the Compose API on temporary host port `4011`.
