# 得宝 APP Flutter 重开发方案

更新日期：2026-09-01

## 1. 决策结论

本项目从移动端重新开发时，采用 **Flutter + Dart + OpenHarmony Flutter 适配**。

后端不整体重写，继续复用 `debao-server` 的 API、PostgreSQL 数据模型、Redis 设计和 OpenAPI 契约。现有 `debao-mobile` React Native 工程保留为页面、交互和接口行为参考，直到 Flutter 版本完成页面 parity 验收后再决定是否归档。

目标平台：

- Android
- iOS
- HarmonyOS

目标产品：法考学习 APP，包含题库、主客观题、成绩报告、课程、视频/音频、直播、商城、支付、AI 答疑、法条检索、论坛、批改服务、通知和账号体系。

## 2. 为什么选择 Flutter

- Flutter 自带渲染引擎，三端的字体、间距、颜色、圆角和交互状态更容易保持一致，适合按 RC 运行态逐页还原。
- 普通页面、复杂表单、题目作答、划线批改、抽屉、弹层和播放器控制都可以使用同一套 Dart UI 实现。
- Android 和 iOS 的 Flutter 生态成熟，工程结构和测试方式统一。
- 平台差异可以收敛到插件和 `platform` 层，页面代码不直接散落平台判断。
- 后续新页面主要维护一套 UI，长期维护成本低于三套原生页面。

## 3. 重要边界

Flutter 不代表三端完全不写原生代码。以下能力必须先做三端验证，并按平台接入原生 SDK 或插件：

- 微信登录、手机号一键登录和微信绑定
- 微信支付、支付宝支付、Apple 购买和 HarmonyOS 支付
- APNs、Android 厂商推送、Harmony Push
- 视频、音频、直播、后台播放、锁屏控制和 DRM
- 图片/PDF 选择、上传、预览和离线下载
- 系统分享、权限、相册、通知和深链

HarmonyOS Flutter 适配层的插件覆盖度可能低于 Android/iOS。没有真实 HarmonyOS 设备、DevEco Studio、签名和供应商账号时，只能记录适配器和明确的阻塞状态，不能伪造已接入。

## 4. 工程边界

```text
E:\code\得宝APP开发\
├─ debao-flutter/       新的 Flutter 移动端（本次重开发）
├─ debao-server/        现有 Node.js 服务端（复用并生产化）
├─ debao-admin/         现有中文后台（继续独立维护）
├─ debao-mobile/        React Native 参考工程，暂不删除
└─ 得宝APP (1)/          历史 Figma Make 原型（仅作源码参考）
```

禁止事项：

- 不删除或覆盖 Figma Make 原型。
- 不删除现有 RN 工程、服务端或后台。
- 不把 Mock 结果标记为真实供应商能力。
- 不在 Flutter 页面中直接拼接 URL、直接访问数据库或写入平台密钥。

## 5. 推荐技术栈

```text
Flutter：稳定版，锁定版本并记录在 README
Dart：随 Flutter SDK
状态管理：Riverpod
路由：go_router
网络：Dio
数据模型：json_serializable + freezed（若引入需锁定版本）
本地数据：Drift 或 Isar，首选 Drift 保存可查询的答题/学习记录
安全存储：flutter_secure_storage
图片缓存：cached_network_image
视频：video_player，复杂能力通过 platform plugin 扩展
测试：flutter test、integration_test、golden test
服务端：复用 Node.js + TypeScript + PostgreSQL + Redis
```

依赖必须在真实安装和构建后再写入锁文件。不得为了通过静态检查而添加未验证插件。

## 6. Flutter 目录设计

```text
debao-flutter/
├─ lib/
│  ├─ app/                 App 启动、主题、环境配置
│  ├─ core/                错误、日志、网络、权限、存储
│  ├─ router/              路由和深链
│  ├─ theme/               RC 颜色、字体、间距和组件 token
│  ├─ shared/              通用组件、弹层、加载/空/错误状态
│  ├─ platform/            三端能力 contract 和实现入口
│  └─ features/
│     ├─ auth/             登录、绑定、设备和注销
│     ├─ home/             首页和主客观题切换
│     ├─ question_bank/    科目、题库、组卷、作答、记录
│     ├─ subjective/       主观题、草稿、提交和法条查询
│     ├─ grading/          批改服务、记录、报告和点评查看
│     ├─ learning/         计划、任务、报告、错题、收藏
│     ├─ courses/          课程、章节、进度和讲义
│     ├─ media/            视频、音频和直播
│     ├─ mall/              商品、SKU、订单和售后
│     ├─ ai/                AI 答疑和会话历史
│     ├─ legal/             法条搜索、版本和收藏
│     ├─ community/         论坛、回复、点赞、举报和公告
│     ├─ notifications/     通知和偏好
│     └─ profile/            个人资料、设置和客服入口
├─ android/
├─ ios/
├─ harmony/
├─ test/
├─ integration_test/
└─ docs/
```

每个 feature 采用 `data / domain / presentation` 三层。页面只调用 domain service/provider；平台 SDK 只出现在 `platform` 目录或插件中。

## 7. 页面 1:1 还原规则

视觉、布局、文案和交互的当前验收唯一基准是 RC 运行态 `debao-mobile`；`得宝APP (1)` Figma Make 原型仅作历史源码参考，不凭空扩展页面设计。

每个页面必须完成：

1. 读取 RC 页面、资源和交互；必要时参考 Figma 历史源码。
2. 记录 390x844 正常态 RC 基准截图。
3. 在 Flutter 实现固定布局、滚动区域、中文文案、图标、颜色、字号、行高、间距、圆角和弹层。
4. 对照 Android 截图，再验证 iOS 和 HarmonyOS 的 Safe Area、返回、键盘和系统状态栏。
5. 补齐 loading、empty、error、offline、disabled、permission、retry 和重复提交状态；这些状态不得改变正常态布局。
6. 更新 `PAGE_PARITY_MATRIX.md`，记录源图、实现图、差异和导航证据。

首批页面必须包含五个主 Tab：首页、题库、商城、课程、我的；随后按真实导航完成主客观题、课程、播放器、商城订单、学习工具、AI、法条、论坛、批改和账号页面。

## 8. 后端复用和改造原则

后端保持以下契约不变：

- `debao-server` 的 API 路径和统一响应结构
- OpenAPI 文档和错误码
- PostgreSQL 作为业务事实来源
- Redis 用于缓存、限流和短期状态
- 账号 Token、后台 Cookie 会话和 CSRF 规则

后端只做必要的生产化补齐：真实数据库读写、对象存储、队列、支付回调验签、AI Provider、媒体服务、推送、审计和监控。Flutter 端通过 typed API client 调用，不复制业务判分、订单价格校验或权益开通逻辑。

## 9. 分阶段 Goal 计划

### Goal 0：三端技术验证

- 创建 `debao-flutter` 空工程并锁定 Flutter/Dart 版本。
- Android、iOS、HarmonyOS 分别启动最小 Demo。
- 验证网络请求、Token 安全存储、图片/PDF 选择、视频播放和深链。
- 验证微信登录、手机号一键登录、支付、推送和直播插件可用性。
- 输出每个平台的通过项、失败项、工具链和外部账号阻塞。

### Goal 1：基础架构和账号体系

- 建立主题 token、通用组件、路由、网络层、错误层、日志和环境配置。
- 完成登录、Token 刷新、微信绑定手机号、换绑、设备管理、异地提醒、头像和账号注销。
- 完成 Android 模拟器验证，并记录 iOS/HarmonyOS 工具链状态。

### Goal 2：RC 页面 parity

- 按 `PAGE_PARITY_MATRIX.md` 逐页重做 28 个核心页面。
- 先五个主 Tab，再按导航完成二级页面。
- 每完成一页立即截图对照并更新文档，不允许最后批量补证据。

### Goal 3：题库、主客观题和成绩

- 真实组卷、单选/多选、计时、断点续答和防重复提交。
- 主观题套卷、逐题作答、云端草稿、附件、做题时查询法条和提交成功页。
- 服务端判分、报告、历史记录、错题、收藏和统计。

### Goal 4：课程、媒体、学习和直播

- 课程权益、试看、有效期、章节进度、讲义、笔记和跨设备同步。
- 视频/音频真实播放、清晰度、字幕、后台播放、锁屏、断点续播和离线策略。
- 直播房间、预约、推拉流、聊天室、课件、回放和断线恢复。

### Goal 5：商城、支付、AI 和通知

- SKU、库存、优惠券、活动价、订单超时、真实价格校验。
- 三端支付、回调验签、权益开通、恢复购买、退款和对账。
- AI 流式输出、会话历史、法条引用、额度、审核和成本统计。
- Android/iOS/HarmonyOS 推送、通知偏好和深链。

### Goal 6：论坛、批改、合规和上线

- 论坛发帖、回复、点赞、收藏、举报、审核和公告。
- 批改套卷、任务分发、AI 首轮、人工批改、原句划线、红线点评、遗漏采分点和用户报告。
- 隐私协议、用户协议、软著/应用商店材料、日志审计、崩溃监控和三端发布包。

## 10. 验收门槛

- Flutter 工程可在 Android 上安装、冷启动、返回和旋转验证。
- iOS 工程在 macOS/Xcode 上可构建；当前 Windows 环境只能记录外部阻塞，不能宣称 iOS 原生通过。
- HarmonyOS 工程在 DevEco Studio/真机可用时构建 HAP；工具缺失必须形成阻塞清单。
- `flutter analyze`、`flutter test`、集成测试和服务端测试通过。
- 28 个页面逐项有 RC 基准图、Flutter 实现图和导航证据；尚未生成的逐页同尺寸截图不得宣称已完成视觉验收。
- 真实服务未接入时明确显示 Mock 或 Provider 未配置，不得假装支付、AI、推送、直播成功。
- 所有 API、架构、平台差异、测试和进度文档与代码同步更新。

## 11. 外部依赖清单

- Apple Developer、App Store Connect、macOS/Xcode
- HarmonyOS 开发者账号、DevEco Studio、签名证书和真机
- 微信开放平台、短信运营商、支付商户号
- 对象存储/CDN、直播服务、推送证书
- OpenAI 模型服务和内容审核服务
- 权威题库、法条数据、课程和客服运营资源

缺少账号、密钥、证书或真机时，目标是完成接口 contract、沙箱适配、失败状态和文档，不提交秘密或伪造生产成功。
