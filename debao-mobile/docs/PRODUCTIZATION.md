# 产品化开发记录

## 当前交付

- 独立 `debao-server` TypeScript API 服务，可用 `npm run dev` 或 Docker Compose 启动。
- 统一 requestId、成功/错误 envelope、鉴权校验和参数校验。
- 首批业务接口：用户、题库科目、答题草稿/提交、课程、订单、支付状态、通知、AI/媒体适配器占位。
- PostgreSQL 初始迁移覆盖用户、刷新会话、设备、科目/题目、课程权益、商品/订单/订单事件、学习/批改/公告/论坛；`002_seed.sql` 提供可重复执行的演示数据。
- Redis 与 PostgreSQL 已加入 Docker Compose，生产连接和迁移执行仍需按环境接入。
- React Native 服务层支持 Mock/真实 API 运行时切换，页面和导航保持 1:1 原型结构。
- AI 对话、题库科目、商城商品、订单列表和通知页已在真实模式接入 API，失败时保留原型可用数据。
- 新增登录/刷新、学习计划、学习报告、错题、收藏、课程权益、答题记录、批改队列、设备、首页内容、商品、法条、论坛和运营接口契约。

## 运行验收

| 项目 | 结果 |
|---|---|
| `debao-server npm test` | 5/5 通过 |
| `debao-mobile pnpm typecheck` | 通过 |
| `debao-mobile pnpm test` | 30 套件、45 测试通过 |
| 本地 API HTTP 冒烟 | `/v1/health`、`/v1/courses` 通过 |
| Android production JS bundle | 通过，`productization.android.bundle` |
| iOS production JS bundle | 通过，`productization.main.jsbundle` |
| Harmony Hermes bundle | 通过，`harmony/entry/src/main/resources/rawfile/hermes_bundle.hbc` |
| Docker Compose 配置 | `docker compose config` 通过；当前机器 Docker daemon 未启动，未伪造容器联调结果 |
| Redis 故障探针 | 不可达时快速返回 `redisReachable=false`，不持续重试 |

## 未伪造的外部依赖

短信、Apple/Android/Harmony 支付、AI provider、对象存储/CDN、APNs/FCM/Harmony Push、法考授权题库、iOS/macOS 签名和 Harmony DevEco 构建均需要供应商账号、证书、设备或合同。本阶段只提供适配器边界、配置模板、错误码和本地测试；没有声称完成真实供应商联调。

## 下一批实现顺序

1. PostgreSQL/Redis 仓储替换内存实现，加入迁移执行器和 refresh session 的持久化。
2. 完成学习计划、错题/收藏、答题记录和课程权益接口。
3. 增加后台运营接口、审计日志、限流、监控和结构化日志。
4. 在具备供应商凭据后接入支付、短信、AI、媒体和推送，并补齐沙箱集成测试。
