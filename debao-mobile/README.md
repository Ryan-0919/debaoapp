# 得宝移动端

得宝是一套面向法考学习者的三端移动 App 工程。共享界面和业务层使用 React Native + TypeScript，Android/iOS 使用官方 React Native 原生工程，HarmonyOS 使用 RNOH + ArkTS 宿主。

当前版本为 `0.1.0` 第一阶段工程版，已建立 Figma Make 原型 28 个页面的 React Native 技术骨架和路由，但不代表 28 页已经完成 1:1 复刻。逐页真实状态见 [28 页 1:1 核验矩阵](docs/PAGE_PARITY_MATRIX.md)。登录、支付、AI、媒体、直播、下载、推送和远端数据仍是明确标识的 Mock，不是正式线上能力。

需要通过 Codex Goal 模式继续推进时，使用 [Goal 模式开发提示词](docs/GOAL_PROMPT.md)。该提示词包含技术栈、三端边界、文档要求和验收标准。

## 固定版本

- Node.js `22.22.0`
- pnpm `10.26.1`
- React `19.1.1`
- React Native `0.82.1`
- RNOH `0.82.30`（npm dist-tag：`0.82-stable`）
- TypeScript `5.8.3`
- Android：compile/target SDK 36、min SDK 24、NDK `27.1.12297006`
- HarmonyOS：compatible SDK 12、target SDK 20

RNOH `0.82.30` 的 peer dependency 明确要求 React Native `0.82.1`。不要单独升级 RN 或 RNOH；升级前必须重新核对兼容矩阵和端口包。

## 目录

```text
debao-mobile/
├── android/                  Android/Kotlin 工程
├── ios/                      iOS/Swift 工程
├── harmony/                  HarmonyOS/ArkTS + C++ 工程
├── patches/                  RNOH/Gradle 可复现兼容补丁
├── scripts/                  环境诊断、Android 路径适配、RNOH postlink
├── src/
│   ├── components/           公共移动端组件
│   ├── config/               环境配置
│   ├── data/                 本地演示数据
│   ├── navigation/           Stack + Bottom Tabs
│   ├── platform/             平台能力声明
│   ├── screens/              28 个页面
│   ├── services/             接口契约、API Client、Mock 实现
│   ├── store/                Zustand + AsyncStorage
│   ├── theme/                设计 Token
│   └── types/                领域和导航类型
└── docs/                     架构、开发、接口、平台、测试与进度文档
```

## 安装

当前工作区路径包含中文。Node/Metro 可正常工作，但本机 Java 在 Gradle wrapper 路径中会把中文转换为 `?`。正式开发建议将仓库克隆到纯 ASCII 路径，例如 `E:\code\debao-app`；保留当前路径时使用提供的盘符映射脚本。

```powershell
cd E:\code\得宝APP开发\debao-mobile
nvm use 22.22.0
pnpm install --frozen-lockfile
pnpm run doctor
powershell -ExecutionPolicy Bypass -File .\scripts\environment-doctor.ps1
```

## 日常命令

```powershell
pnpm start
pnpm typecheck
pnpm lint
pnpm test
pnpm check
```

## 本地 API 产品化开发

同级目录 `debao-server` 是配套 TypeScript API。详见 [产品化开发记录](docs/PRODUCTIZATION.md) 和 [API 契约](docs/API.md)。默认客户端保持 Mock；设置 `DEBAO_USE_MOCKS=false` 并启动 API 后即可切换到真实本地服务。

## Android

需要 Android Studio、SDK Platform 36、Build Tools 36、NDK `27.1.12297006`，并设置 `ANDROID_HOME`。

纯 ASCII 路径中直接运行：

```powershell
pnpm android
```

当前中文路径中运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\android-build.ps1
```

需要生成不依赖 Metro 的可演示 Debug APK 时：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\android-build.ps1 -DriveLetter T: -EmbeddedBundle
```

`-EmbeddedBundle` 会先在真实工程路径重新生成 production JS Bundle，并把图片等 Metro 资源写入 Android `debug/res`，再通过临时 ASCII 盘符执行 Gradle，避免中文路径和 pnpm 链接导致的解析问题、图片资源缺失或 APK 复用旧 Bundle。

2026-08-28 已在本机完成 `assembleDebug`、APK 安装和 Android API 36 模拟器冷启动。APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`，运行截图见 [Android 首页](docs/screenshots/android-home-api36.png)。详见 [平台文档](docs/PLATFORMS.md)。

## iOS

Windows 只能验证 JS bundle 和 Xcode 工程结构。实际构建必须在 macOS + Xcode 上执行：

```bash
cd debao-mobile
pnpm install --frozen-lockfile
cd ios
bundle install
bundle exec pod install
cd ..
pnpm ios
```

## HarmonyOS

需要 DevEco Studio、HarmonyOS SDK 12+/20、ohpm、hvigor、hdc，并使用 Node 22。

```powershell
pnpm harmony:link
pnpm harmony:bundle
pnpm harmony:run
```

首次在 DevEco Studio 打开 `harmony` 后，根据 `harmony/build-profile.template.json5` 创建本机签名配置。`build-profile.json5` 含开发者签名，不进入 Git。

## 已验证结果

- TypeScript 严格检查：通过
- ESLint：通过，无 warning
- Jest：2 个测试套件、3 个测试通过
- Android production JS bundle：通过
- iOS production JS bundle：通过
- Harmony Hermes HBC bundle：通过，4 个 RNOH 端口正确重定向
- Android Debug APK：通过，已安装并启动于 `Debao_API_36`（Android API 36 / x86_64）
- Android 首页视觉检查：通过，无空白、崩溃或明显布局重叠
- Android 五个主 Tab 烟雾测试：通过，各页面唯一文案匹配且无崩溃日志
- iOS 原生构建：未执行，当前不是 macOS
- Harmony HAP：未执行，本机未检测到 DevEco CLI/SDK

## 常见问题

### Node 24 运行 RNOH init 报 `paths[0]`

RNOH `0.82.30` 的 Windows CLI 使用了与 Node 24 不兼容的 `Dirent.path`。使用仓库固定的 Node `22.22.0`。

### Android 提示找不到 SDK

安装 SDK 36 和 NDK `27.1.12297006`，设置 `ANDROID_HOME`，重新打开终端后执行 `pnpm doctor`。

### 重新 link 后 ArkTS import 变化

必须使用 `pnpm harmony:link`，不要只运行裸 `react-native link-harmony`。脚本会执行 `postlink-harmony.mjs`，修正三个旧端口包的 named export。

详细说明见 [开发文档](docs/DEVELOPMENT.md)、[架构文档](docs/ARCHITECTURE.md) 和 [迁移报告](MIGRATION_REPORT.md)。
