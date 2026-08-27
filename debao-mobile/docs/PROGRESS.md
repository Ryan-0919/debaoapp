# 迁移进度

更新时间：2026-08-27

状态只使用“未开始、进行中、已完成、受阻”。“页面已完成”表示 React Native 源码、类型化路由和 production bundle 已覆盖该页面，不代表三个平台的原生安装包均已构建或完成真机视觉验收。

## P0

| 项目 | 状态 | 验证结果 | 剩余问题 |
|---|---|---|---|
| 首页 | 已完成 | `Home` Tab 已注册；Android/iOS JS bundle 与 Harmony Hermes bundle 通过 | 需要三端真机视觉回归 |
| 题库 | 已完成 | `Questions` Tab 已注册；主客观题入口可导航 | 真实题库接口未接入，当前使用 Mock 数据 |
| 商城 | 已完成 | `Mall` Tab 已注册；可进入商品与订单流程 | 商品、库存、优惠和支付均需正式后端 |
| 课程 | 已完成 | `Courses` Tab 已注册；可进入课程详情和媒体 UI | 真实课程、播放地址和授权未接入 |
| 我的 | 已完成 | `Profile` Tab 已注册；资料、设置、通知入口可导航 | 登录和云端资料同步未接入 |
| 公共顶部栏、底部导航、弹窗、Bottom Sheet、按钮 | 已完成 | `PageHeader`、Bottom Tabs、`ConfirmSheet` 和公共 UI 组件已落地并通过类型检查 | 三端辅助功能和屏幕阅读器需真机复测 |

## P1

| 项目 | 状态 | 验证结果 | 剩余问题 |
|---|---|---|---|
| 主观题选择 | 已完成 | `SubjectiveSelect` 路由和科目参数已类型化 | 题目列表来自 Mock |
| 主观题答题 | 已完成 | `SubjectiveAnswer` 路由、输入和提交状态已实现 | 真实保存、上传和批改接口未接入 |
| 客观题答题 | 已完成 | `ObjectiveAnswer` 支持练习/考试参数与答题状态 | 真实组卷、计时同步和防作弊未接入 |
| 客观题报告 | 已完成 | `ObjectiveReport` 接收正确数和总数并展示结果 | 真实报告生成与云端记录未接入 |
| 课程详情 | 已完成 | `CourseDetail` 路由按 `courseId` 打开 | 课程详情来自 Mock |
| 视频页面 | 已完成 | `VideoPlayer` UI 和媒体准备状态已实现 | 没有解码、DRM、倍速或真实播放 |
| 音频页面 | 已完成 | `AudioPlayer` UI 和媒体状态已实现 | 没有后台播放、锁屏控制或真实播放 |
| 直播页面 | 已完成 | `LiveCourse` UI 和直播状态已实现 | 没有信令、流媒体、聊天室或真实直播 |
| 商品详情 | 已完成 | `ProductDetail` 按 `productId` 展示并进入购买流程 | 真实库存、价格校验和 SKU 未接入 |
| 购买结果 | 已完成 | Mock 支付后可进入 `PurchaseSuccess` | 不会调用支付 SDK，也不会真实扣款 |
| 订单列表 | 已完成 | `OrderList` 展示本地 Mock 订单 | 真实分页、刷新和服务端状态未接入 |
| 订单详情 | 已完成 | `OrderDetail` 按 `orderId` 展示 | 物流、退款和售后未接入 |
| AI 对话 | 已完成 | `AIChat` 通过 `AIService` 产生 Mock 流式文本 | 未调用外部模型；鉴权、配额、审查和中断协议未接入 |
| 用户资料 | 已完成 | `UserProfile` 可编辑本地资料并持久化 | 登录身份和服务端同步未接入 |
| 设置 | 已完成 | `Settings` 与本地状态联动 | 推送权限、缓存清理和账号安全能力未接入 |
| 通知 | 已完成 | `Notifications` 展示 Mock 通知 | APNs、Android 厂商/FCM、Harmony Push 均未接入 |

## P2

| 项目 | 状态 | 验证结果 | 剩余问题 |
|---|---|---|---|
| 学习报告 | 已完成 | `LearningReport` 路由和演示数据已实现 | 真实统计口径与服务端聚合未接入 |
| 学习计划 | 已完成 | `LearningPlan` 路由和计划 UI 已实现 | 云端日程、提醒和跨设备同步未接入 |
| 错题本 | 已完成 | `MistakeBook` 路由和列表状态已实现 | 真实错题归档、筛选和同步未接入 |
| 收藏 | 已完成 | `Favorites` 路由和本地收藏状态已实现 | 账号级同步未接入 |
| 法条检索 | 已完成 | `LawSearch` 路由和本地搜索演示已实现 | 权威法规数据源、版本和全文索引未接入 |
| 批改服务 | 已完成 | `Grading` 路由和提交 UI 已实现 | 文件上传、人工派单、进度和结果接口未接入 |
| 答题记录 | 已完成 | `QuestionRecords` 路由和 Mock 记录已实现 | 真实分页、筛选和服务端记录未接入 |

## 工程与平台

| 项目 | 状态 | 验证结果 | 唯一明确的下一步 |
|---|---|---|---|
| TypeScript、Lint、单元测试 | 已完成 | `pnpm typecheck`、`pnpm lint`、`pnpm test` 已通过；最终提交前重新执行 | 依赖或源码变化后继续由 `pnpm check` 守护 |
| Android production JS bundle | 已完成 | Metro production bundle 已生成成功 | 原生依赖变化后重新 bundle |
| Android 原生构建与安装 | 受阻 | Gradle/RN/Kotlin 插件已编译到 SDK 检查；本机没有 `ANDROID_HOME`、SDK 36 和 NDK `27.1.12297006` | 安装指定 SDK/NDK，设置 `ANDROID_HOME`，执行 `scripts/android-build.ps1` 并在设备上安装启动 |
| iOS production JS bundle | 已完成 | Windows 上 production JS bundle 已生成成功 | 原生依赖变化后在 macOS 再次 bundle |
| iOS 原生构建与安装 | 受阻 | Swift 入口、Xcode 工程和 Podfile 已生成；Windows 无 Xcode/CocoaPods/模拟器 | 在 macOS 安装 Pods，执行 `pnpm ios`，完成签名和真机启动验证 |
| Harmony autolink 与 Hermes bundle | 已完成 | 四个 RNOH 端口已链接，production `hermes_bundle.hbc` 已生成 | 端口升级后重新执行 `pnpm harmony:link` 和 `pnpm harmony:bundle` |
| Harmony HAP 构建与安装 | 受阻 | ArkTS/C++/Hvigor 工程已生成；PATH 未检测到 `hvigor`、`ohpm`、`hdc` 或可调用 DevEco SDK | 安装 DevEco 工具链、配置签名、ohpm sync，构建 HAP 并用 hdc 真机启动 |
| 三端真机视觉、返回、键盘和小屏验收 | 受阻 | 共享代码已使用 Safe Area、native-stack 和 KeyboardAvoidingView；当前没有可运行的三端设备构建 | 在上述原生构建完成后按 `docs/TESTING.md` 的设备矩阵逐项记录截图和结果 |

## 下一阶段入口条件

1. Android：Android Studio 中安装 Platform/Build Tools 36 与 NDK `27.1.12297006`，设置 SDK 环境变量后执行构建脚本。
2. iOS：准备 macOS、Xcode、CocoaPods 和开发签名，执行 Pod 安装、模拟器及真机构建。
3. HarmonyOS：准备 DevEco Studio、SDK 12/20、ohpm、hvigor、hdc 和开发签名，完成 HAP 构建。
4. 业务接入：后端先按 `docs/API.md` 固化 OpenAPI/错误码和测试环境，再逐个替换 `src/services/mockServices.ts` 中的实现。
