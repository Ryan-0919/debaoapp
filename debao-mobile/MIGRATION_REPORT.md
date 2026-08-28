# 得宝 App 第一阶段迁移报告

报告日期：2026-08-28

## 结论

Figma Make 输出的 React Web 原型已迁移为 React Native Bare + TypeScript 工程。28 个原型页面均有对应的 React Native 页面和类型化路由；Android/iOS production JS bundle 与 HarmonyOS production Hermes bundle 已验证通过。后端、登录、支付、AI、真实媒体、直播、下载和推送尚未接入，均通过明确的 Service Contract 和 Mock 实现隔离。

“页面迁移完成”只代表共享源码和 bundle 层完成。Android Debug APK 已在 API 36 模拟器完成构建、安装、冷启动和首页视觉验证；当前 Windows 主机仍缺少 DevEco 工具链，且不能运行 Xcode，因此本报告不声称 iOS App 或 Harmony HAP 已完成原生构建、安装或真机验证。

## 原型审计

- 原型目录：`得宝APP (1)/`
- 原型技术：React 19、Vite、Tailwind/浏览器 CSS、静态演示数据。
- 原型规模：28 个页面，页面源码约 6712 行。
- 原型性质：高保真交互原型，没有正式后端、原生宿主、离线存储或平台 SDK。
- 新工程目录：`debao-mobile/`
- 新工程技术：React Native `0.82.1`、React `19.1.1`、RNOH `0.82.30`、TypeScript `5.8.3`。

原型目录保持不变，并已作为基线提交 `c9acf2d` 保存。

## 页面映射

| 优先级 | Figma Make 页面 | React Native 页面/路由 | 状态 | 验证边界 |
|---|---|---|---|---|
| P0 | `Home.tsx` | `HomeScreen` / `Home` Tab | 已完成 | 右上角主客观题切换、联动入口、路由、类型检查、三端 bundle |
| P0 | `QuestionBank.tsx` | `QuestionBankScreen` / `Questions` Tab | 已完成 | 路由、类型检查、三端 bundle |
| P0 | `Mall.tsx` | `MallScreen` / `Mall` Tab | 已完成 | 路由、类型检查、三端 bundle |
| P0 | `Courses.tsx` | `CoursesScreen` / `Courses` Tab | 已完成 | 路由、类型检查、三端 bundle |
| P0 | `Profile.tsx` | `ProfileScreen` / `Profile` Tab | 已完成 | 路由、类型检查、三端 bundle |
| P1 | `SubjectiveSelect.tsx` | `SubjectiveSelectScreen` / `SubjectiveSelect` | 已完成 | 路由参数与 bundle |
| P1 | `SubjectiveAnswer.tsx` | `SubjectiveAnswerScreen` / `SubjectiveAnswer` | 已完成 | 输入、提交状态与 bundle |
| P1 | `ObjectiveAnswer.tsx` | `ObjectiveAnswerScreen` / `ObjectiveAnswer` | 已完成 | 练习/考试参数与 bundle |
| P1 | `ObjectiveReport.tsx` | `ObjectiveReportScreen` / `ObjectiveReport` | 已完成 | 报告参数与 bundle |
| P1 | `CourseDetail.tsx` | `CourseDetailScreen` / `CourseDetail` | 已完成 | `courseId` 参数与 bundle |
| P1 | `VideoPlayer.tsx` | `VideoPlayerScreen` / `VideoPlayer` | 已完成 | 仅播放器 UI/状态机 |
| P1 | `AudioPlayer.tsx` | `AudioPlayerScreen` / `AudioPlayer` | 已完成 | 仅播放器 UI/状态机 |
| P1 | `LiveCourse.tsx` | `LiveCourseScreen` / `LiveCourse` | 已完成 | 仅直播 UI/状态机 |
| P1 | `ProductDetail.tsx` | `ProductDetailScreen` / `ProductDetail` | 已完成 | `productId` 参数与 Mock 数据 |
| P1 | `PurchaseSuccess.tsx` | `PurchaseSuccessScreen` / `PurchaseSuccess` | 已完成 | 仅 Mock 支付结果 |
| P1 | `OrderList.tsx` | `OrderListScreen` / `OrderList` | 已完成 | Mock 订单列表 |
| P1 | `OrderDetail.tsx` | `OrderDetailScreen` / `OrderDetail` | 已完成 | `orderId` 参数与 Mock 数据 |
| P1 | `AIChat.tsx` | `AIChatScreen` / `AIChat` | 已完成 | Mock 流式文本，不调用外部模型 |
| P1 | `UserProfile.tsx` | `UserProfileScreen` / `UserProfile` | 已完成 | 本地资料与持久化 |
| P1 | `Settings.tsx` | `SettingsScreen` / `Settings` | 已完成 | 本地设置，不申请真实平台权限 |
| P1 | `Notifications.tsx` | `NotificationsScreen` / `Notifications` | 已完成 | Mock 通知，不接系统推送 |
| P2 | `LearningReport.tsx` | `LearningReportScreen` / `LearningReport` | 已完成 | Mock 统计数据 |
| P2 | `LearningPlan.tsx` | `LearningPlanScreen` / `LearningPlan` | 已完成 | 本地演示计划 |
| P2 | `MistakeBook.tsx` | `MistakeBookScreen` / `MistakeBook` | 已完成 | Mock 错题数据 |
| P2 | `Favorites.tsx` | `FavoritesScreen` / `Favorites` | 已完成 | 本地收藏状态 |
| P2 | `LawSearch.tsx` | `LawSearchScreen` / `LawSearch` | 已完成 | 本地演示检索 |
| P2 | `GradingService.tsx` | `GradingServiceScreen` / `Grading` | 已完成 | 仅提交 UI，无上传/人工派单 |
| P2 | `QuestionRecords.tsx` | `QuestionRecordsScreen` / `QuestionRecords` | 已完成 | Mock 答题记录 |

公共组件对应关系：`TopBar` 重写为 `PageHeader`，`BottomNav` 由 React Navigation Bottom Tabs 取代，`Dialog`/`BottomSheet` 的确认场景统一为 React Native `Modal` 驱动的 `ConfirmSheet`，原型公共按钮和卡片重写到 `src/components/ui.tsx`。

## 复用与重写范围

已复用的是产品层内容：五个主入口、28 个页面的信息架构、中文文案方向、核心流程、色彩层级和演示数据语义。

以下内容已重写：

- DOM、Vite 路由和浏览器事件改为 React Native View/Text/Pressable、Native Stack 和 Bottom Tabs。
- Tailwind/CSS 改为共享主题 Token 与 `StyleSheet`。
- 浏览器滚动、输入和弹层改为 ScrollView、KeyboardAvoidingView、Safe Area 和原生 Modal。
- 页面内静态动作改为类型化 Service Contract、Mock Service 和标准错误结构。
- Web 本地状态改为 Zustand；需要保留的客户端状态通过 AsyncStorage 持久化。
- Unsplash/Google Fonts 依赖移除，第一阶段使用本地可控视觉组件和系统字体。

没有复用或引入任何 WebView、Capacitor、DOM shim，也没有修改原型目录。

## Mock 与真实能力边界

| 能力 | 当前实现 | 真实接入位置 | 正式接入验收条件 |
|---|---|---|---|
| 登录/用户 | 本地 Mock 用户和资料 | `AuthService` | Token 刷新、安全存储、退出失效和接口错误测试通过 |
| 题库/报告 | 本地题目、提交和统计 | `QuestionService` | 组卷、保存、交卷幂等、报告口径和弱网恢复通过 |
| 课程 | 本地课程列表与详情 | `CourseService` | 分页、购买权限、学习进度和缓存策略通过 |
| 订单 | 本地 Mock 订单 | `OrderService` | 服务端价格校验、状态机、分页、退款/售后协议通过 |
| 支付 | Mock 成功/失败结果，不扣款 | `PaymentService` + 三端 adapter | 服务端下单验签、三端 SDK、回调幂等和沙箱测试通过 |
| AI | 本地定时分片模拟流式回复 | `AIService` | 鉴权、SSE/WebSocket 中断、超时、配额、内容安全和隐私策略通过 |
| 媒体/直播 | UI 与准备状态机 | `MediaService` + 三端播放器 | 播放、暂停、进度、后台、耳机中断、DRM/直播信令真机通过 |
| 通知 | Mock 通知列表 | `NotificationService` + 三端推送 | 权限、Token 注册、前后台消息、点击路由和注销通过 |
| 下载 | 能力声明，无真实文件下载 | 平台 download adapter | 空间检查、断点续传、校验、加密、清理和后台策略通过 |

`src/services/apiClient.ts` 已提供未来 HTTP 的超时和错误映射入口，但第一阶段不发送正式业务请求，也不包含真实密钥。

## 三端适配现状

| 平台 | 已完成 | 已验证 | 未验证及可验证原因 |
|---|---|---|---|
| Android | RN 官方 Kotlin 工程、包名、Gradle/RN 插件、共享代码 | production JS bundle；Debug APK；API 36 x86_64 模拟器安装、冷启动、首页视觉检查和五 Tab 烟雾测试 | 返回、键盘、旋转、小屏与 Android 真机矩阵 |
| iOS | RN 官方 Swift 入口、Xcode 工程、Podfile、共享代码 | production JS bundle | 当前为 Windows，不能运行 Xcode/CocoaPods/模拟器，因此没有原生构建或签名结果 |
| HarmonyOS | RNOH ArkTS/C++/Hvigor 工程、四个 HAR autolink、Metro redirect | production Hermes HBC；四个端口重定向 | PATH 没有 hvigor、ohpm、hdc 和 DevEco SDK，因此没有 HAP、签名或真机启动结果 |

共享层已经处理 Safe Area、键盘规避和 native-stack 返回语义；Android 已有可安装构建和首页截图。横竖屏、小屏、系统返回和辅助功能仍需要按真实设备矩阵验证，iOS/HarmonyOS 仍需各自原生环境。

## 第一阶段验证结果

| 检查 | 结果 | 说明 |
|---|---|---|
| TypeScript strict | 通过 | Harmony Hvigor 脚本由 DevEco/ohpm 类型系统负责，不混入 RN `tsc` |
| ESLint | 通过 | 无 warning |
| Jest | 通过 | 2 个套件、3 个测试；覆盖 API Client 与关键 Mock Service 行为 |
| Android production JS bundle | 通过 | 只证明共享 JS 可打包 |
| iOS production JS bundle | 通过 | 只证明共享 JS 可打包 |
| Harmony production Hermes bundle | 通过 | 生成 `hermes_bundle.hbc`，并确认四个 RNOH 包重定向 |
| Android APK/安装 | 通过基础验收 | `assembleDebug` 成功；安装并冷启动于 `Debao_API_36`，首页无崩溃或明显布局问题，五个主 Tab 均可切换 |
| iOS 原生构建/安装 | 未通过验收 | Windows 无 Xcode 工具链 |
| Harmony HAP/安装 | 未通过验收 | 环境缺 DevEco CLI/SDK |

具体命令和复现步骤见 `README.md`、`docs/PLATFORMS.md` 与 `docs/TESTING.md`。

## 风险与下一阶段任务

1. Android 原生构建基线已经完成；继续补齐返回、键盘、Safe Area、小屏和真机矩阵。iOS 在 macOS 安装 Pods 并配置签名；HarmonyOS 安装 DevEco SDK/CLI、同步 ohpm 并配置签名。每端至少记录一次冷启动和关键交互截图。
2. 发布前确认正式 applicationId/bundle identifier/bundleName、应用中文名、商标和签名主体，再一次性修改三端配置并做升级安装测试。
3. 后端团队按 `docs/API.md` 输出可执行 OpenAPI、鉴权流程和错误码；客户端从登录、题库、课程、订单顺序替换 Mock，并为每个 Service 增加契约测试。
4. 支付必须先确定商品属性和三端合规路径，再实现服务端订单、验签、回调幂等及 Android/iOS/Harmony 沙箱 adapter；未完成前保留 Mock 标识。
5. 媒体方案必须先验证 Android/iOS 播放器与 RNOH/Harmony 可用能力，再决定共享库或三端 adapter；验收包含后台、中断、弱网、直播延迟和授权内容保护。
6. 当前测试没有组件交互、截图回归或端到端覆盖。原生构建可用后增加 React Native Testing Library、关键流程 E2E 和三端视觉基线。
7. pnpm 补丁依赖特定包版本。任何 RN、RNOH、Gradle 或端口包升级都必须重新验证安装、autolink、三端 bundle 和原生构建，不能只更新 lockfile。
