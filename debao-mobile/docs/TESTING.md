# 测试与验证

## 自动检查

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm check
```

当前结果（2026-08-27）：

| 检查 | 结果 | 范围 |
|---|---|---|
| TypeScript | 通过 | App TS/TSX 严格检查 |
| ESLint | 通过 | 全工程 JS/TS/TSX，无 warning |
| Jest | 通过 | 2 suites / 3 tests |
| Service unit | 通过 | Mock 支付、AI 流式输出 |
| Component | 通过 | AppButton 文案和按压行为 |

Harmony `hvigorfile.ts` 不由应用 `tsc` 检查，其类型来自 DevEco/ohpm；ArkTS 与 Hvigor 必须由 Harmony 原生构建验证。

## Bundle 验证

Android：

```powershell
New-Item -ItemType Directory -Force .cache\android-assets | Out-Null
pnpm exec react-native bundle --platform android --dev false --minify true --entry-file index.js --bundle-output .cache\index.android.bundle --assets-dest .cache\android-assets
```

iOS：

```powershell
New-Item -ItemType Directory -Force .cache\ios-assets | Out-Null
pnpm exec react-native bundle --platform ios --dev false --minify true --entry-file index.js --bundle-output .cache\main.jsbundle --assets-dest .cache\ios-assets
```

HarmonyOS：

```powershell
pnpm harmony:link
pnpm harmony:bundle
```

三项均已通过。Harmony 日志确认 4 个标准包被重定向到 RNOH 端口，并生成 Hermes HBC。

## 原生构建与真机

### Android

Gradle 已完成 RN/Kotlin 插件编译，随后因本机没有 SDK 停止。安装 SDK 后需验证：debug APK、冷启动、五 Tab、系统返回、键盘遮挡、支付 Mock、AI 流式状态、旋转和小屏设备。

### iOS

当前 Windows 未执行原生构建。macOS 需要验证 Pod install、Debug build、Safe Area、键盘、系统返回手势和 iPhone SE/标准/Max 三种尺寸。

### HarmonyOS

当前缺少 DevEco CLI/SDK。安装后需验证 HAP build、四个 HAR link、ArkTS appKey、返回键、Safe Area、AsyncStorage 和 Lucide SVG 渲染。

## 端到端策略

选择支持 React Native 和三端设备驱动的工具前，不引入只支持 Android/iOS 的 E2E 依赖。计划分层：

1. Service contract test：不依赖设备。
2. Component test：状态和无障碍属性。
3. Android/iOS：在 CI 使用设备或模拟器执行主流程。
4. HarmonyOS：通过 hdc/DevEco 测试任务执行同一验收场景。

核心 E2E 场景：

- 五个 Tab 逐一打开且状态不丢失。
- 客观题选项、解析、报告和返回题库。
- 主观题输入、保存草稿、重启恢复、Mock 提交。
- 商品创建 Mock 订单、支付提示、订单详情。
- 课程进入视频/音频/直播并显示真实能力未接入。
- AI 文本逐段生成，发送中禁止重复提交。
- 修改用户资料并重启恢复。

## 未覆盖范围

真实鉴权、后端错误码、支付 SDK、真实媒体、直播、下载、推送、弱网、升级迁移、性能、崩溃恢复和无障碍读屏尚未接入或验证。每项需要在对应真实 Service/adapter 实现时补测试，不能沿用 Mock 测试作为上线证据。
