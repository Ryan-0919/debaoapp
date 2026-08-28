# 迁移进度

更新时间：2026-08-28

状态只使用“未开始、进行中、已完成、受阻”。下方 P0/P1/P2 表格记录的是功能骨架迁移；“有 React Native 页面和路由”不再等同于“已按 Figma Make 1:1 完成”。

## 1:1 原型复刻状态

2026-08-28 用户明确要求以 `得宝APP (1)` 为唯一基准逐页 1:1 迁移。验收必须同时覆盖源码结构、390x844 原型渲染、React Native 实现、关键交互态和 Android 截图；未做对照的既有页面一律不算 1:1 完成。

| 范围 | 状态 | 当前证据 | 唯一明确的下一步 |
|---|---|---|---|
| 首页 `Home.tsx` | 进行中 | 右上角主客观题切换已恢复，但当前 RN 首页整体结构仍未按原型逐项对照 | 按原型的品牌头、横幅、功能入口、促销、倒计时、热门课程、公告和社区内容完整重做并截图对照 |
| 题库 `QuestionBank.tsx` | 已完成 | 顶部居中切换、历年真题、年份 Bottom Sheet、卷别、可展开章节、分科真题和历年整卷已按原型迁移；Android API 36 三态截图通过 | 在 iOS/HarmonyOS 原生环境补同页视觉回归 |
| 其余 26 页 | 未开始 | RN 技术页面和路由存在，但尚未建立逐页 1:1 对照证据 | 按五个主 Tab 后二级流程的顺序逐页核验和修复 |
| 三端 1:1 视觉验收 | 进行中 | Android 题库页已验证；iOS/HarmonyOS 只有共享 Bundle 结果 | 完成 Android 全页面，再在 macOS/DevEco 环境补平台差异验证 |

## P0

| 项目 | 状态 | 验证结果 | 剩余问题 |
|---|---|---|---|
| 首页 | 已完成 | `Home` Tab 已注册；右上角主客观题分段切换会联动快捷入口；Android/iOS JS bundle 与 Harmony Hermes bundle 通过 | 需要 iOS/Harmony 真机视觉回归 |
| 题库 | 已完成 | `Questions` Tab 已注册；主客观题页内切换、年份弹层、章节展开和对应路由可用 | 真实题库接口未接入，当前使用 Mock 数据 |
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
| Android 原生构建与安装 | 已完成 | Debug APK 构建成功，并在 `Debao_API_36`（API 36 / x86_64）完成安装、冷启动、首页截图和五 Tab 烟雾测试；进程保持前台且无运行期崩溃 | 继续完成返回、键盘、旋转、小屏及真机矩阵 |
| iOS production JS bundle | 已完成 | Windows 上 production JS bundle 已生成成功 | 原生依赖变化后在 macOS 再次 bundle |
| iOS 原生构建与安装 | 受阻 | Swift 入口、Xcode 工程和 Podfile 已生成；Windows 无 Xcode/CocoaPods/模拟器 | 在 macOS 安装 Pods，执行 `pnpm ios`，完成签名和真机启动验证 |
| Harmony autolink 与 Hermes bundle | 已完成 | 四个 RNOH 端口已链接，production `hermes_bundle.hbc` 已生成 | 端口升级后重新执行 `pnpm harmony:link` 和 `pnpm harmony:bundle` |
| Harmony HAP 构建与安装 | 受阻 | ArkTS/C++/Hvigor 工程已生成；PATH 未检测到 `hvigor`、`ohpm`、`hdc` 或可调用 DevEco SDK | 安装 DevEco 工具链、配置签名、ohpm sync，构建 HAP 并用 hdc 真机启动 |
| 三端真机视觉、返回、键盘和小屏验收 | 进行中 | Android API 36 模拟器首页视觉已通过；共享代码已使用 Safe Area、native-stack 和 KeyboardAvoidingView | 补 Android 完整设备矩阵，并在 macOS/DevEco 环境完成 iOS 与 HarmonyOS 验收 |

## 下一阶段入口条件

1. Android：基础构建、API 36 模拟器首页和五 Tab 已通过；继续执行返回、键盘、旋转、小屏和至少一台真机验收。
2. iOS：准备 macOS、Xcode、CocoaPods 和开发签名，执行 Pod 安装、模拟器及真机构建。
3. HarmonyOS：准备 DevEco Studio、SDK 12/20、ohpm、hvigor、hdc 和开发签名，完成 HAP 构建。
4. 业务接入：后端先按 `docs/API.md` 固化 OpenAPI/错误码和测试环境，再逐个替换 `src/services/mockServices.ts` 中的实现。
