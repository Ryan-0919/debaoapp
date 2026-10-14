# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Ant Design Pro + Umi Max + React + TypeScript + Ant Design 5 + Pro Components; the backend reuses debao-server.

## Users

主要用户是得宝 APP 的运营人员、内容编辑、教学运营、社区审核、客服、财务和数据观察员。他们在桌面浏览器中处理高频列表、审核、发布、售后和数据查询工作。

## Product Purpose

得宝运营后台为得宝 APP 提供真实的业务管理闭环，覆盖用户与权益、题库与法条、课程与学习、商城交易、社区治理、运营触达、AI 配额、数据分析和系统权限。成功标准是运营人员无需修改业务代码即可安全完成日常维护，并且高风险操作可追溯、可审计。

## Positioning

后台直接复用 APP 的业务事实和服务端能力，通过权限、状态机、版本和审计把内容运营与交易治理变成可控的工作流，而不是静态演示数据。

## Operating Context

后台作为独立 Web 工程 `debao-admin` 部署，与 `debao-server` 通过同站 `/api` 通信。运营人员以左侧菜单、筛选列表、详情页和编辑页完成日常操作；复杂内容编辑和高风险操作需要独立页面、二次确认和审计记录。

## Capabilities and Constraints

- 后台包含十个一级业务模块，按权限动态生成菜单，服务端必须再次鉴权。
- 管理员账号与 APP 用户账号、会话和权限分离；正式管理会话使用 HttpOnly Cookie + CSRF。
- 题目、课程、商品、订单、退款、举报、公告和推送遵循设计文档中的状态机与不可变约束。
- 普通管理员默认只能看到脱敏手机号和必要的 AI 风险上下文；PII、退款、封禁、权益、发布和权限变更均需要专门权限与审计。
- 外部支付、推送、AI、媒体和对象存储 Provider 的真实账号尚未全部提供；缺失时必须展示明确的禁用或错误状态，不得伪造成功。

## Brand Commitments

产品名称为“得宝”。后台沿用 APP 的品牌操作色和已有业务术语；桌面优先、高信息密度、低动效的工作台体验以 `debao-mobile/docs/ADMIN_CONSOLE_DESIGN.md` 为视觉与交互基线。

## Evidence on Hand

- 项目收口路线：[PROJECT_COMPLETION_PLAN.md](PROJECT_COMPLETION_PLAN.md)

- 后台详细设计：[debao-mobile/docs/ADMIN_CONSOLE_DESIGN.md](debao-mobile/docs/ADMIN_CONSOLE_DESIGN.md)
- 移动端业务范围：[debao-mobile/docs/BUSINESS_DEVELOPMENT_PLAN.md](debao-mobile/docs/BUSINESS_DEVELOPMENT_PLAN.md)
- 服务端 API 与迁移：[debao-server/openapi.yaml](debao-server/openapi.yaml)、[debao-server/migrations](debao-server/migrations)
- 独立 `debao-admin` 前端工程已创建，采用 Ant Design Pro/Umi Max + React + TypeScript，
  与 `debao-server` 共享真实管理 API；当前可在本机完成类型检查、Lint、Vitest 和生产构建。

## Product Principles

- 业务事实单一来源：后台不复制一套脱离 APP 的题库、订单或论坛数据。
- 高风险可追溯：重要写操作必须有权限、原因、幂等、并发控制和审计。
- 状态真实可解释：加载、空数据、错误、无权限和 Provider 不可用都必须明确呈现。
- 先完成可运营闭环：内容、课程、交易、社区和运营能力优先形成真实可用链路。

## Accessibility & Inclusion

后台最低支持 1024px 桌面宽度；表格、表单和审核操作必须可键盘访问，状态不能只依赖颜色，错误信息需要提供明确恢复路径。

## Open Decisions

- 品牌 Logo 与后台正式名称
- 管理员 MFA 的最终供应商和恢复流程
- 退款双人复核金额阈值
- 社区处罚时长和数据报表最终口径
- 各外部 Provider 的正式账号与生产域名
