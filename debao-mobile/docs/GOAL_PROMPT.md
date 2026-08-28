# Codex Goal 模式开发提示词

将下面整段内容作为 Goal 模式提示词使用。当前仓库已完成第一阶段迁移，提示词要求先读现状再继续，不重复推倒重做。

```text
你正在维护“得宝”法考学习 App。工作目录是 E:\code\得宝APP开发，React Native 工程位于 debao-mobile，Figma Make 原型位于“得宝APP (1)”。请持续工作，直到本机环境内可完成的开发、验证、文档和提交全部结束；不要只给方案。

一、开始前
1. 先阅读 debao-mobile/README.md、MIGRATION_REPORT.md、docs/ARCHITECTURE.md、docs/DEVELOPMENT.md、docs/PLATFORMS.md、docs/TESTING.md、docs/PROGRESS.md、docs/API.md 和 docs/DECISIONS.md。
2. 检查 git status 和最近提交，保留用户已有修改，不重置、不覆盖 Figma Make 原型目录。
3. 审计现有实现、依赖锁定、Mock 边界和平台阻塞，基于事实更新计划。

二、固定技术方向
1. 共享 UI 与业务代码使用 React Native 0.82.1 + React 19.1.1 + TypeScript 5.8.3。
2. Android 使用 Kotlin 原生宿主；iOS 使用 Swift/Xcode 原生宿主；HarmonyOS 使用 RNOH 0.82.30 + ArkTS/C++/Hvigor。
3. 不使用 WebView、Capacitor、DOM shim 或三套重复业务页面。
4. Android/iOS 使用 metro.config.js；HarmonyOS 只能通过 metro.harmony.config.js 打包，禁止把 Harmony resolver/serializer 合回标准 Metro 配置。
5. 三端原生能力通过同一个 TypeScript contract 和平台 adapter 暴露，页面中不散落 Platform.OS 业务分支。

三、产品与实现要求
1. 保持 Figma Make 的信息架构、中文文案方向、五个主 Tab 和 28 个页面，不随意删除流程。
2. 所有可点击控件必须有实际响应；页面必须处理 loading、empty、error、disabled 和重复提交状态。
3. Safe Area、系统返回、键盘遮挡、小屏、长文本和无障碍标签必须纳入实现与验收。
4. 登录、支付、AI、媒体、直播、下载、推送和远程数据在真实服务未接入前必须明确标为 Mock，不得伪造成线上能力。
5. 不写入或提交 API token、支付密钥、正式签名、证书、生产 keystore 或用户隐私数据。

四、执行顺序
1. 先运行 pnpm install --frozen-lockfile 和 pnpm check，修复现有错误。
2. Android：使用 SDK 36、NDK 27.1.12297006 和 scripts/android-build.ps1；构建 APK，安装到模拟器，冷启动并用 logcat 检查崩溃。当前中文路径下 Gradle 必须使用脚本的临时 ASCII 盘符映射。
3. Android 无 Metro 演示包：先生成 android/app/src/debug/assets/index.android.bundle，再运行 scripts/android-build.ps1 -EmbeddedBundle。
4. iOS：在 macOS/Xcode 环境执行 bundle install、pod install、原生构建和模拟器验证；如果当前仍是 Windows，只验证工程结构和 production bundle，并明确记录外部环境阻塞，绝不声称原生通过。
5. HarmonyOS：运行 pnpm harmony:link 和 pnpm harmony:bundle；有 DevEco/ohpm/hvigor/hdc 时继续构建 HAP、签名并启动设备。缺工具链时记录准确缺项，不声称 HAP 通过。
6. 按 docs/TESTING.md 验证五 Tab、主客观题、课程、商城/Mock 支付、AI Mock、资料持久化、返回、键盘、旋转和小屏；每个已运行平台保存截图和日志证据。

五、文档必须与代码同批更新
1. README.md：环境、安装、运行、构建和当前验证结论。
2. docs/DEVELOPMENT.md：新增约定、脚本、依赖和故障处理。
3. docs/PLATFORMS.md：Android/iOS/HarmonyOS 的实际能力矩阵和工具链状态。
4. docs/TESTING.md：执行命令、设备/API、通过项、失败项和未覆盖项。
5. docs/PROGRESS.md：每项只用“未开始、进行中、已完成、受阻”，写明唯一下一步。
6. MIGRATION_REPORT.md：Figma 页面映射、Mock 边界、验证证据和剩余风险。
7. 架构或依赖方向变化时更新 docs/ARCHITECTURE.md 与 docs/DECISIONS.md；接口变化时更新 docs/API.md。
8. 文档只写真实执行结果。Bundle 成功不等于原生包成功，模拟器成功不等于真机成功。

六、完成门槛
1. pnpm check 全通过。
2. Android 和 iOS production bundle 通过。
3. pnpm harmony:link 与 pnpm harmony:bundle 通过。
4. 当前具备工具链的平台完成原生构建、安装、冷启动、日志检查和截图；不具备工具链的平台形成可直接执行的阻塞清单。
5. git diff --check 通过，工作区没有误提交的 bundle、APK、密钥、缓存或构建目录。
6. 更新所有相关文档后提交一个清晰的稳定里程碑，并在最终报告中列出提交号、通过项、未验证项、产物路径和截图路径。

持续定位和修复可解决的问题。只有真正依赖 macOS、DevEco、签名账户、后端接口或产品决策时才标记受阻；不得以“建议后续处理”代替本机可以完成的工作。
```
