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

该编排启动 PostgreSQL、Redis 和 API；API 容器等待两个依赖健康后自动执行迁移再启动。SQL 迁移位于 `migrations/001_initial.sql`，生产部署需使用正式迁移工具执行并配置密钥管理。

数据库已提供可重复执行的 `001_initial.sql` 与 `002_seed.sql`。数据库可达后运行 `npm run migrate`；迁移脚本按文件名顺序执行，生产环境应在发布流水线中执行并记录版本。

## 接口契约

机器可读契约见 `openapi.yaml`。

## 已实现接口

`GET /v1/health`、`POST /v1/auth/send-code|login|refresh|logout`、`GET/PATCH /v1/me`、设备管理与注销、题目/答题记录/报告、学习计划/任务/报告、错题/收藏、课程/权益/进度、商品、订单/支付、首页/公告/通知、法条/论坛、批改队列、AI/媒体和运营概览均已提供本地实现。

响应统一为 `{ data, requestId }`；错误统一为 `{ error: { code, message, requestId } }`。支付、短信、AI、媒体、推送等外部能力必须通过适配器接入，当前未宣称真实供应商联调。
