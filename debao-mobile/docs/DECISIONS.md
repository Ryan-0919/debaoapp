# 技术决策记录

本文记录第一阶段工程中的关键技术决策。日期均为决策落地日期；版本升级或平台实现发生变化时，应新增记录，不覆盖历史结论。

## 2026-08-27：采用 React Native Bare 三端共享方案

- 背景：原项目是 Figma Make 生成的 React Web 原型，目标平台是 Android、iOS 和 HarmonyOS，不能使用 WebView 或 Capacitor 包装网页。
- 候选方案：Flutter；Android/iOS React Native 加独立 ArkUI 工程；React Native Bare 加 React Native for OpenHarmony（RNOH）。
- 最终选择：React Native Bare，共享 TypeScript 页面和业务层；Android 使用 Kotlin 宿主，iOS 使用 Swift 宿主，HarmonyOS 使用 RNOH + ArkTS 宿主。
- 原因：最大程度复用原型的 React 组件思路；保留三端原生扩展能力；RNOH 能让 HarmonyOS 复用主要 JS 业务代码。
- 影响：HarmonyOS 依赖必须逐项确认 RNOH 端口；三端支付、推送、媒体和下载仍需要独立原生 adapter。

## 2026-08-27：固定 RN 0.82.1 与 RNOH 0.82.30

- 背景：React Native 与 RNOH 必须严格匹配，直接选择各自最新版可能导致 ABI、CLI 或端口包不兼容。
- 候选方案：React Native 最新稳定版；RNOH 0.84 RC；RNOH `0.82-stable` 对应版本。
- 最终选择：React `19.1.1`、React Native `0.82.1`、RNOH `0.82.30`、TypeScript `5.8.3`、Node `22.22.0`。
- 原因：npm 元数据表明 RNOH `0.82.30` 的 peer dependency 明确要求 RN `0.82.1`；0.84 当时仍是 RC。
- 影响：依赖使用精确版本；升级前必须重新核对 RNOH 兼容矩阵、端口包和三端 bundle，不允许单独升级 RN 或 RNOH。

## 2026-08-27：原型只作为设计与交互基准，移动端代码全部重写

- 背景：原型依赖 Vite、DOM、Tailwind 和浏览器交互，不能直接在 React Native 中运行。
- 候选方案：复用 Web 组件并做兼容层；WebView 封装；按原产品结构重写 React Native 组件。
- 最终选择：保留信息架构、页面内容和视觉方向，使用 React Native 组件、StyleSheet、Safe Area 和 Native Stack 重写 28 个页面。
- 原因：避免 DOM/CSS 兼容层和 WebView 限制，使系统返回、键盘、Safe Area 和原生能力可以按平台实现。
- 影响：没有复制原 Web 页面组件；迁移验收需要按页面映射进行视觉和交互回归，不能把 Web 构建结果当作移动端结果。

## 2026-08-27：使用类型化 Native Stack + Bottom Tabs

- 背景：应用包含五个一级入口和答题、课程、订单等多级流程，需要正确处理 Android/Harmony 系统返回。
- 候选方案：自建页面状态切换；单一 Stack；React Navigation Native Stack 嵌套 Bottom Tabs。
- 最终选择：React Navigation 6，根级 Native Stack 内嵌五个 Bottom Tabs，参数统一由 `RootStackParamList` 和 `MainTabParamList` 定义。
- 原因：导航栈和系统返回行为由原生导航容器处理，路由参数能在 TypeScript 编译期检查。
- 影响：新增页面必须先登记参数类型和 Stack；页面不得自行维护全局“当前页面”字符串。

## 2026-08-27：Service Contract 隔离全部未接业务能力

- 背景：第一阶段没有正式后端、支付、AI、媒体、直播、下载和推送凭据，不能用静态点击结果冒充真实接入。
- 候选方案：页面内直接使用演示数据；提前绑定具体供应商 SDK；接口契约加显式 Mock 实现。
- 最终选择：在 `src/services/contracts.ts` 定义契约，在 `mockServices.ts` 提供带延迟、状态和错误结构的 Mock；页面只依赖导出的 Service 实例。
- 原因：演示流程可运行，同时保留替换真实实现的稳定边界，并能在代码和 UI 中明确 Mock 属性。
- 影响：正式接入必须实现相同契约，并为鉴权、错误码、重试和平台 SDK 增加测试；不能在 Screen 中直接调用供应商 SDK 或拼接 URL。

## 2026-08-27：Zustand + AsyncStorage 保存最小客户端状态

- 背景：答题草稿、收藏、设置和用户资料需要跨页面，并在重启后保留部分状态。
- 候选方案：React Context；Redux Toolkit；Zustand + AsyncStorage。
- 最终选择：使用 Zustand 管理共享状态，通过 persist middleware 写入 AsyncStorage。
- 原因：当前状态规模较小，Zustand API 简洁；AsyncStorage 在 Android/iOS 有成熟实现，并有可用 RNOH 端口。
- 影响：访问令牌、支付凭据等敏感数据不得写入 AsyncStorage；接入登录后需要增加 Keychain/Keystore/Asset Store 安全存储 adapter。

## 2026-08-27：Android/iOS 包与 RNOH 端口并存

- 背景：标准 React Native 包提供 Android/iOS 原生代码，RNOH 端口包提供 Harmony HAR，单纯用 npm alias 会丢失其中一侧的原生实现。
- 候选方案：只安装标准包；用 alias 全量替换为 RNOH 包；标准包与 `@react-native-oh-tpl/*` 端口并存并由 Harmony Metro 重定向。
- 最终选择：并存安装，Harmony 通过 `harmony.alias` 和 autolink 使用端口包。
- 原因：三端各自获得正确的原生实现，同时共享 TypeScript import。
- 影响：依赖升级时需同步检查标准包、RNOH 端口和 HAR；`pnpm harmony:link` 是唯一支持的链接命令。

## 2026-08-27：用可复现补丁适配旧 RNOH 元数据和 Gradle 9

- 背景：三个已发布 RNOH 端口缺少 0.82 autolink 元数据；RN 0.82.1 Gradle 插件中的 Foojay 0.5.0 与 Gradle 9 组合会触发 `IBM_SEMERU` 错误。
- 候选方案：手工修改 `node_modules`；fork 依赖；使用 pnpm patchedDependencies。
- 最终选择：在 `patches/` 中维护四个 pnpm patch，并用 `scripts/postlink-harmony.mjs` 修正遗留 ArkTS named export。
- 原因：`pnpm install --frozen-lockfile` 可以稳定复现，且变更范围小于维护完整 fork。
- 影响：升级对应依赖时补丁可能失效，必须重新执行安装、Gradle 插件编译、Harmony autolink 和 bundle 验证。

## 2026-08-27：移除在线图片和字体运行时依赖

- 背景：原型使用 Unsplash 和 Web 字体，离线或网络策略变化会导致核心页面缺图或排版漂移。
- 候选方案：继续引用远程 URL；引入图片 CDN；使用本地几何图形和 React Native 可控样式重建视觉素材。
- 最终选择：第一阶段使用本地可控的装饰组件、色块、图标和排版，不依赖 Unsplash 或 Google Fonts。
- 原因：三端 bundle 可离线生成，演示内容不会受第三方资源可用性影响。
- 影响：正式品牌插画和课程封面需要由产品提供授权位图资源，并按多分辨率资源规范加入仓库或正式 CDN。

## 2026-08-27：统一临时包名并严格区分验证层级

- 背景：开发者账号和正式商标信息尚未提供，当前 Windows 主机也缺少 Android SDK、Xcode 和 DevEco CLI/SDK。
- 候选方案：各平台使用模板包名；提前猜测正式包名；使用统一临时包名并记录构建证据。
- 最终选择：三端暂用 `com.debao.app`，应用名为“得宝”；分别记录静态检查、JS/Hermes bundle、原生编译、安装启动四个验证层级。
- 原因：统一标识减少联调歧义；分层证据避免把 bundle 成功误写为 APK、App 或 HAP 构建成功。
- 影响：发布前需一次性确认并替换三端包名及签名配置；当前不得声称 Android APK、iOS 原生构建或 Harmony HAP 已通过。
