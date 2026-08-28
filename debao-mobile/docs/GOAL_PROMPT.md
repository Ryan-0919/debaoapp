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

三、1:1 原型复刻与实现要求
1. “得宝APP (1)”是唯一的产品、视觉和交互基准；debao-mobile 现有页面只能作为原生工程骨架，不能作为设计依据。禁止自行改版、删减、重排或用近似卡片替代原型结构。
2. 1:1 包括：页面层级、固定/滚动区域、内容顺序、中文文案、图片、图标、颜色、字号、字重、行高、间距、尺寸、圆角、边框、阴影、选中/展开/弹层状态和全部跳转。原型基准画布为 390x844；仅允许真实系统状态栏、Safe Area、字体栅格化等平台必然差异。
3. 每个页面必须先阅读对应 Figma Make 源码和公共组件，再运行原型取得 390x844 基准截图；实现后在 Android 同尺寸或等比例视口截图逐项对照。没有完成源码清单、交互清单和截图对照的页面不得标记为 1:1 完成。
4. 原型可见控件尺寸保持不变；需要满足原生点击热区时优先使用 hitSlop 扩大不可见点击范围，不得擅自放大并改变视觉排版。
5. 保持五个主 Tab 和 28 个页面，不删除任何原型流程。原型依赖的真实视觉素材必须随页面迁移；远程演示图应转为可控本地资源或明确记录待授权替换，不能用空白占位。
6. 所有可点击控件必须有实际响应；页面必须处理原型已有的 loading、empty、error、disabled 和重复提交状态。新增非原型状态时不得改变正常态视觉。
7. Safe Area、系统返回、键盘遮挡、小屏、长文本和无障碍标签必须纳入实现与验收；适配以不破坏 390x844 基准视觉为前提。
8. 登录、支付、AI、媒体、直播、下载、推送和远程数据在真实服务未接入前必须明确标为 Mock，不得伪造成线上能力。
9. 不写入或提交 API token、支付密钥、正式签名、证书、生产 keystore 或用户隐私数据。

四、执行顺序
1. 先运行 pnpm install --frozen-lockfile 和 pnpm check，修复现有错误。
2. 建立 28 页 1:1 核验矩阵，逐页比较“得宝APP (1)/src/pages”与“debao-mobile/src/screens”；优先修复五个主 Tab，再按真实导航顺序修复二级页面。一次只以一个原型页面为视觉真相，不批量套用通用近似模板。
3. Android：使用 SDK 36、NDK 27.1.12297006 和 scripts/android-build.ps1；构建 APK，安装到模拟器，冷启动并用 logcat 检查崩溃。当前中文路径下 Gradle 必须使用脚本的临时 ASCII 盘符映射。
4. Android 无 Metro 演示包：运行 scripts/android-build.ps1 -EmbeddedBundle。脚本会先在真实工程路径重新生成 android/app/src/debug/assets/index.android.bundle，再通过 ASCII 临时盘符构建，禁止复用旧 Bundle 截图。
5. iOS：在 macOS/Xcode 环境执行 bundle install、pod install、原生构建和模拟器验证；如果当前仍是 Windows，只验证工程结构和 production bundle，并明确记录外部环境阻塞，绝不声称原生通过。
6. HarmonyOS：运行 pnpm harmony:link 和 pnpm harmony:bundle；有 DevEco/ohpm/hvigor/hdc 时继续构建 HAP、签名并启动设备。缺工具链时记录准确缺项，不声称 HAP 通过。
7. 按 docs/TESTING.md 验证五 Tab、主客观题、课程、商城/Mock 支付、AI Mock、资料持久化、返回、键盘、旋转和小屏；每个已运行平台保存原型基准截图、实现截图和日志证据。

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
1. 28 个页面全部完成源码结构、正常态、关键交互态和导航的 1:1 核验矩阵；任何只存在 RN 路由但未对照原型的页面都不能算完成。
2. pnpm check 全通过。
3. Android 和 iOS production bundle 通过。
4. pnpm harmony:link 与 pnpm harmony:bundle 通过。
5. 当前具备工具链的平台完成原生构建、安装、冷启动、日志检查和截图；不具备工具链的平台形成可直接执行的阻塞清单。
6. git diff --check 通过，工作区没有误提交的 bundle、APK、密钥、缓存或构建目录。
7. 更新所有相关文档后提交一个清晰的稳定里程碑，并在最终报告中列出提交号、逐页 1:1 状态、通过项、未验证项、产物路径和截图路径。

持续定位和修复可解决的问题。只有真正依赖 macOS、DevEco、签名账户、后端接口或产品决策时才标记受阻；不得以“建议后续处理”代替本机可以完成的工作。
```
