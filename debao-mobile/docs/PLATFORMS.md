# 三端平台说明

## 兼容版本选择

2026-08-27 查询 npm 元数据：

- `@react-native-oh/react-native-harmony` 的 `0.82-stable` 为 `0.82.30`。
- `@react-native-oh/react-native-harmony@0.82.30` 的 peer dependency 是 `react-native: 0.82.1`。
- React Native `0.82.1` 要求 React `^19.1.1` 和 Node `>=20.19.4`。

因此本项目固定 RN `0.82.1`、React `19.1.1`、RNOH `0.82.30`、Node `22.22.0`。RNOH 0.84 当时仍处于 RC，不用于本阶段。

## 能力矩阵

| 能力 | Android | iOS | HarmonyOS | 当前状态 |
|---|---|---|---|---|
| 页面与导航 | RN | RN | RNOH | 共享代码完成，Bundle 通过 |
| Safe Area | 标准包 | 标准包 | RNOH HAR | 已配置 |
| 持久化 | AsyncStorage | AsyncStorage | RNOH HAR | 本地状态完成 |
| SVG/Lucide | react-native-svg | react-native-svg | RNOH SVG HAR | Bundle 通过 |
| 支付 | Kotlin adapter | Swift/IAP adapter | ArkTS adapter | 仅 Mock |
| 推送 | FCM/厂商 | APNs | Harmony Push | 仅 Mock |
| 视频/音频 | 待选播放器 | 待选播放器 | 待验证端口 | UI/状态机完成 |
| 直播 | 待接信令/播放器 | 待接信令/播放器 | 待接 ArkTS 能力 | UI/状态机完成 |
| 离线下载 | 待实现 | 待实现 | 待实现 | 接口占位 |

## Android

工程：`android/`，包名 `com.debao.app`，入口为 Kotlin。

要求：

- JDK 17 或 21
- Android SDK Platform 36
- Android Build Tools 36
- NDK `27.1.12297006`
- `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`
- 纯 ASCII 项目路径，或使用 `scripts/android-build.ps1`

本机验证记录：

1. Gradle 9 wrapper 下载成功。
2. RN Gradle settings/root 插件与 Kotlin 编译成功。
3. 构建在 Android Gradle Plugin 读取 SDK 时停止：`SDK location not found`。
4. 本机未检测到 `ANDROID_HOME`、`ANDROID_SDK_ROOT`、`adb` 或 SDK 默认目录。

因此 Android JS bundle 已验证，APK 安装启动未验证。唯一下一步是安装上述 SDK/NDK 并重新执行构建脚本。

### RN 0.82 Gradle 补丁

RN `0.82.1` 的 gradle-plugin 使用 `foojay-resolver-convention 0.5.0`，与模板 Gradle 9 组合时报 `IBM_SEMERU` 字段错误。`patches/@react-native__gradle-plugin@0.82.1.patch` 将其升级为 `1.0.0`；已验证可以越过插件编译并到达 SDK 检查。

## iOS

工程：`ios/`，bundle identifier `com.debao.app`，入口 `AppDelegate.swift`，Podfile 已由 RN 0.82 官方模板生成。

要求：

- macOS
- 与 RN 0.82 兼容的 Xcode
- Ruby/Bundler/CocoaPods
- Apple Developer signing team

验证记录：iOS production JS bundle 已通过；Windows 无法运行 Xcode、CocoaPods 或模拟器，因此没有声称原生构建通过。

macOS 验证命令：

```bash
bundle install
cd ios && bundle exec pod install && cd ..
pnpm ios
```

## HarmonyOS

工程：`harmony/`，bundleName `com.debao.app`，ArkTS 入口 `EntryAbility`，RN appKey `DebaoMobile`。

目标：

- compatible SDK `5.0.0(12)`
- target SDK `6.0.0(20)`
- runtimeOS `HarmonyOS`
- BiSheng native compiler

已完成：

- RNOH 官方 `init-harmony` 模板生成
- ArkTS/C++ PackageProvider
- AsyncStorage、Safe Area、Screens、SVG 四个 HAR autolink
- Harmony Metro import redirect
- production Hermes `hermes_bundle.hbc` 生成

未验证：HAP 编译、签名、真机启动。当前 PATH 未检测到 `hvigor`、`ohpm`、`hdc`，也没有可调用的 DevEco SDK。安装后：

1. 用 DevEco Studio 打开 `harmony/`。
2. 根据 `build-profile.template.json5` 配置自动签名。
3. 执行 ohpm sync。
4. 运行 `pnpm harmony:link` 和 `pnpm harmony:bundle`。
5. 连接设备后执行 `pnpm harmony:run`。

## RNOH 端口补丁

AsyncStorage、Safe Area、SVG 的已发布 HAR 早于 RNOH 0.82 autolink schema，但实现和 HAR 均存在。pnpm patch 只增加：OH 包名、CMake target、C++ package class、ArkTS package class。Screens 已原生包含新 schema，不需要补丁。

所有补丁位于 `patches/`，`pnpm install --frozen-lockfile` 会自动复现。

## 包名说明

`com.debao.app` 是第一阶段临时统一包名。正式发布前确认商标和开发者账号后，一次性修改 Android applicationId/namespace、iOS bundle identifier 和 Harmony bundleName，不要分平台临时修改。
