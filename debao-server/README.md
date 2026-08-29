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

该编排启动 PostgreSQL、Redis 和 API。SQL 迁移位于 `migrations/001_initial.sql`，生产部署需使用正式迁移工具执行并配置密钥管理。

## 接口契约

机器可读契约见 `openapi.yaml`。

## 已实现接口

`GET /v1/health`、`GET/PATCH /v1/me`、`POST /v1/auth/logout`、`GET /v1/question-subjects`、`PUT /v1/question-drafts/:id`、`POST /v1/question-submissions`、`GET /v1/courses`、`GET /v1/courses/:id`、`GET/POST /v1/orders`、`GET /v1/orders/:id`、`POST /v1/orders/:id/pay`。

响应统一为 `{ data, requestId }`；错误统一为 `{ error: { code, message, requestId } }`。支付、短信、AI、媒体、推送等外部能力必须通过适配器接入，当前未宣称真实供应商联调。
