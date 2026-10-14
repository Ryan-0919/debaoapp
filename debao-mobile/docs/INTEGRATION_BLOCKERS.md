# 外部集成阻塞清单

本项目已经提供本地实现、HTTP 适配器和沙箱测试，但以下能力不能在没有供应商账号、签名材料或真实设备的情况下宣称完成。

| 能力 | 当前状态 | 需要补齐 |
|---|---|---|
| 支付 | `local` 适配器可创建待支付订单并模拟支付 | 微信/支付宝或 App Store IAP 商户资料、回调验签、退款与对账沙箱 |
| 短信 | `local` 适配器返回开发验证码 | 短信服务商模板、签名、密钥、频控和生产回执 |
| 微信登录 | 首次绑定手机号、再次直接登录、身份唯一约束和 HTTP 适配器已实现 | 微信开放平台 AppID/AppSecret、三端应用登记、Universal Link/回调和真机授权 |
| 手机号一键登录 | 登录/微信绑定流程、运营商 token 服务端核验适配器已实现 | 支持 Android/iOS/HarmonyOS 的号码认证供应商、三端 SDK、应用密钥和隐私授权页 |
| 头像文件上传 | 头像颜色、远程 `avatarUrl` 持久化和 `DebaoProfileMedia` 三端选择契约已实现 | 三端相册/相机实现、图片压缩裁剪、对象存储桶、签名上传端点、内容审核和旧文件清理 |
| 推送 | 服务端记录设备并暴露测试接口 | APNs、FCM/厂商推送和 Harmony Push 证书、token 生命周期处理 |
| AI | 本地回复和 HTTP provider 适配器 | 模型供应商 key、内容安全、限流、成本计量和流式协议 |
| 媒体 | `/media/prepare` 明确返回 `available: false` | CDN、签名 URL、DRM、直播房间 token、播放进度和离线下载服务 |
| 主观题批改 | 队列和 HTTP 批改适配器已具备 | 可批改题目/采分点配置、题目版本、文件存储、AI 首轮、独立兼职批改账号、人工复核、报告发布和统计；详见 [GRADING_SYSTEM_DESIGN.md](GRADING_SYSTEM_DESIGN.md) |
| 三端原生能力 | JS bundle 可构建，认证和头像媒体均有统一 Native Module 契约 | Android/iOS/Harmony 证书、认证/图片/推送/支付 SDK 与真机验收 |

生产配置只允许在 `debao-server` 环境变量中注入 provider URL/key，客户端不得保存供应商私钥。

## 本轮最终验收（2026-09-02）

以下结果已在当前工作区实际执行：Flutter `flutter test --no-pub` `98/98`、Dart
analyze `0 error / 0 warning / 148 info`、Flutter Web release build、移动端
RN typecheck/lint/Jest `36 suites / 73 tests`、后台 typecheck/lint/Vitest `4 tests`
和 production build、服务端 `npm run check` `54/54`、本地 API smoke `24/24`，以及
`docker compose config`。RN 测试无失败用例，且已收口 React `act(...)` 控制台警告。

以下是环境阻塞，不以本地适配器或共享 bundle 代替：

- Docker Desktop 已恢复并完成本轮验收：PostgreSQL/Redis 容器均 healthy，Compose API 以临时宿主端口 `4011` 启动，迁移已成功执行，并完成重复迁移/重启与管理员登录验证。生产环境仍需使用独立密钥和正式端口部署。
- Windows 无 macOS/Xcode/CocoaPods，无法完成 iOS 原生构建、签名、安装和真机视觉回归。
- 未安装 HarmonyOS DevEco/hvigor/ohpm/hdc，无法完成 HAP 构建、签名、安装和真机回归。
- 正式短信、微信/号码认证、支付、推送、AI、媒体/直播、对象存储和文件上传仍缺供应商凭据、证书或生产端点；代码已提供本地/HTTP/unconfigured 边界和错误态。
- 平台商店发布明确不在本 Goal 范围内。

本地可验证命令：`npm run check`（服务端）、`pnpm typecheck`、`pnpm lint`、`pnpm test`
（移动端/后台）、Flutter 测试/构建、三端 bundle 命令，以及 `docker compose config`。
真机和供应商沙箱是独立验收门槛；Docker 本地链路已验收。
