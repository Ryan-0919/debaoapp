# 开发指南

## 环境要求

统一使用 Node `22.22.0`。RNOH 0.82.30 在 Windows + Node 24 下执行 `init-harmony` 会报 `paths[0]` 参数错误。

```powershell
nvm install 22.22.0
nvm use 22.22.0
corepack enable
corepack prepare pnpm@10.26.1 --activate
pnpm install --frozen-lockfile
```

运行环境诊断：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\environment-doctor.ps1
pnpm doctor
```

## 编码约定

- TypeScript 开启严格检查，禁止用 `any` 绕过领域类型。
- 文件和文档使用 UTF-8，界面文本使用简体中文。
- 页面默认导出，组合页面文件可以使用具名导出。
- 颜色、间距和圆角必须来自 `src/theme`，业务强调色除外。
- 路由参数只在 `RootStackParamList` 和 `MainTabParamList` 声明。
- 页面不能直接调用 `fetch`、原生模块或访问密钥。
- 真实能力必须先定义 Service contract，再提供平台实现。
- Mock 界面必须展示 `MockNotice` 或等价的明确提示。
- 固定格式控件使用稳定尺寸，避免按内容改变导航和按钮布局。

## 新增页面

1. 在对应 `src/screens/<domain>` 中创建页面。
2. 在 `src/types/navigation.ts` 中增加路由和参数。
3. 在 `src/navigation/AppNavigator.tsx` 注册页面。
4. 使用 `AppScreen` 处理 Safe Area、滚动和键盘。
5. 增加 loading、empty、error、disabled 状态。
6. 更新 `docs/PROGRESS.md` 和 `MIGRATION_REPORT.md`。
7. 运行 `pnpm check` 和至少一个目标平台 bundle。

## 新增 Service

1. 在 `contracts.ts` 定义输入、输出和错误语义。
2. 在 `mockServices.ts` 提供不会误导用户的演示实现。
3. 在 `services/index.ts` 暴露当前实例。
4. 真实服务必须经 `ApiClient` 处理 base URL、超时、鉴权和错误。
5. 为 contract 关键行为增加单元测试，并同步更新 `docs/API.md`。

## 新增原生能力

- Android：在 `android/app` 编写 Kotlin module，并在无法 autolink 时显式注册。
- iOS：在 `ios/DebaoMobile` 编写 Swift/ObjC bridge，并更新 Podfile/PrivacyInfo。
- HarmonyOS：在 `harmony/entry` 编写 ArkTS TurboModule 或 Fabric component，并更新 RNOH PackageProvider。
- 三端对外暴露同一个 TypeScript interface，不允许页面按 `Platform.OS` 拼业务分支。

## RNOH 依赖流程

四个共享原生依赖同时安装标准 RN 包和 RNOH 端口包。Metro 在 Harmony bundle 时按 `harmony.alias` 重定向 JS import。

`metro.config.js` 只用于 Android/iOS，`metro.harmony.config.js` 只用于 HarmonyOS。`pnpm harmony:bundle` 会通过 `--config metro.harmony.config.js` 显式加载 Harmony resolver。不要重新合并这两个配置；Harmony serializer 会覆盖标准 React Native 初始化模块，误用于 Android 离线 bundle 时会导致运行期核心 API 未初始化。

旧端口包缺少 RNOH 0.82 的 `autolinking` 元数据，`patches/` 为其补齐包名、CMake target 和 Package class。安装后执行：

```powershell
pnpm harmony:link
pnpm harmony:bundle
```

`harmony:link` 还会运行 `scripts/postlink-harmony.mjs`，将旧 HAR 的 ArkTS named export 修正到生成工厂中。

## Git 工作流

- `main` 始终保持可安装依赖、可类型检查和可测试。
- 功能提交使用 `feat:`，修复使用 `fix:`，文档使用 `docs:`，构建使用 `build:`。
- 代码与相关文档在同一提交更新。
- 不提交 `node_modules`、Bundle、APK/HAP/IPA、正式签名文件或 `.env`。RN 模板自带的 `android/app/debug.keystore` 使用公开默认口令，仅用于本地 Debug，不得用于测试或生产发布。
- 每次提交前运行 `pnpm check`；涉及三端依赖时额外运行三个 bundle。

## 环境变量与密钥

`.env.example` 只描述变量名。当前 RN 工程没有自动加载 `.env`。接入真实环境前应选择支持三端的 secrets/config 方案，并区分开发、测试、生产配置。

禁止提交：API token、支付私钥、推送证书、Android 正式 keystore、Apple signing certificate、Harmony signingConfig。仓库中的 RN 模板 `debug.keystore` 不是正式签名凭据；发布构建必须通过本地或 CI 密钥库注入独立密钥。

## 路径要求

Android Java/Gradle 在当前中文路径下无法读取 wrapper 路径。首选将仓库放到纯 ASCII 路径；必须保留当前目录时使用 `scripts/android-build.ps1` 创建临时盘符映射。

该脚本的可执行字符串保持 ASCII，以兼容 Windows 自带的 PowerShell 5.1；中文说明保留在本文档中。使用 PowerShell 7 时也可以执行同一脚本。

`-EmbeddedBundle` 会设置 `debaoEmbeddedBundle`，关闭 Debug Dev Support，并把预先生成到 `android/app/src/debug/assets/index.android.bundle` 的 bundle 打进 APK。该模式用于无 Metro 演示和冷启动验证；生成的 debug bundle/resources 已被 `.gitignore` 排除，不提交仓库。
