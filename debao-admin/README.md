# 得宝运营后台

独立的 Ant Design Pro/Umi Max 管理端，服务端复用 `debao-server`。产品与验收基线见 `debao-mobile/docs/ADMIN_CONSOLE_DESIGN.md`。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 检查

```bash
pnpm check
```

当前后台 Goal 已完成 ADMIN-00 至 ADMIN-08 的页面、真实 Admin API 闭环和本地数据持久化；ADMIN-09 的本机全量检查与交付验收也已完成（`pnpm.cmd check`、Playwright 桌面/移动流程）。页面只展示服务端真实返回的数据，Provider 未配置时显示明确状态。剩余工作仅限生产化、运营策略和外部供应商联调，不把页面可用误写为供应商联调完成。
## 本轮 Goal 进展

课程章节/课时树、订单详情时间线、社区帖子/评论/举报/规则、社区处罚执行、AI 配额/风险/用量、审计日志、系统配置、服务健康、学习记录/计划和权益页面均已接入真实 Admin API。系统配置支持通过 `PATCH /v1/admin/settings` 调整退款复核阈值，写入 `admin_system_settings` 并记录审计；AI 配额、用量和风险记录已持久化，分析与导出任务支持排队、重试和鉴权下载。服务端提供推送/导出 Worker 的本地处理入口，写操作继续由服务端负责权限、CSRF、幂等/并发控制和审计；外部 Provider 未配置时只显示不可用或排队状态。

仍待完成：活动价/营销策略、生产环境独立 Worker 队列与告警、正式 Provider 健康回执和 PostgreSQL/Redis 正式部署演练。SKU/库存、价格历史与退款双人复核已完成本地 Admin API 与界面闭环；社区处罚、AI 用量持久化和导出/推送任务的本地闭环已完成。支付、短信、微信、推送、媒体和对象存储的真实供应商联调不在本地验收结论内。

本地验收：

```bash
pnpm.cmd check
pnpm.cmd test:e2e
```
