# 产品化开发记录

## 当前交付

- 独立 `debao-server` TypeScript API 服务，可用 `npm run dev` 或 Docker Compose 启动。
- 统一 requestId、成功/错误 envelope、鉴权校验和参数校验。
- 首批业务接口：用户、题库科目、答题草稿/提交、课程、订单、支付状态、通知、AI/媒体适配器占位。
- PostgreSQL 初始迁移覆盖用户、刷新会话、科目/题目、课程权益、商品/订单/订单事件。
- Redis 与 PostgreSQL 已加入 Docker Compose，生产连接和迁移执行仍需按环境接入。
- React Native 服务层支持 Mock/真实 API 运行时切换，页面和导航保持 1:1 原型结构。

## 运行验收

| 项目 | 结果 |
|---|---|
| `debao-server npm test` | 3/3 通过 |
| `debao-mobile pnpm typecheck` | 通过 |
| `debao-mobile pnpm test` | 30 套件、45 测试通过 |
| 本地 API HTTP 冒烟 | `/v1/health`、`/v1/courses` 通过 |

## 未伪造的外部依赖

短信、Apple/Android/Harmony 支付、AI provider、对象存储/CDN、APNs/FCM/Harmony Push、法考授权题库、iOS/macOS 签名和 Harmony DevEco 构建均需要供应商账号、证书、设备或合同。本阶段只提供适配器边界、配置模板、错误码和本地测试；没有声称完成真实供应商联调。

## 下一批实现顺序

1. PostgreSQL/Redis 仓储替换内存实现，加入迁移执行器和 refresh session。
2. 完成学习计划、错题/收藏、答题记录和课程权益接口。
3. 增加后台运营接口、审计日志、限流、监控和结构化日志。
4. 在具备供应商凭据后接入支付、短信、AI、媒体和推送，并补齐沙箱集成测试。
