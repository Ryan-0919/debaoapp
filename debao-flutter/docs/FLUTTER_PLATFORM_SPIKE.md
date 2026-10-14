# Flutter 平台技术预研记录

## 目标

验证 Android、iOS、HarmonyOS 的工具链和 Flutter 基础能力，建立登录、支付、媒体、推送、文件和直播的统一 contract。此阶段不接入生产 SDK，也不把占位实现当成三端完成。

## 环境检查结果（2026-09-01）

| 工具 | 结果 |
|---|---|
| Flutter | PASS，3.47.2，安装于 `E:\tools\debao-flutter\flutter` |
| Dart | PASS，3.13.2，随 Flutter SDK |
| Java | PASS，JDK 21，`D:\java\jdk21` |
| Android SDK/ADB | PASS，`E:\Android\Sdk`，ADB 37.0.1 |
| Android 模拟器 | PASS，`emulator-5554`，Android 16/API 36 |
| Xcode | BLOCKED，Windows 环境不可用 |
| DevEco/hvigor/ohpm/hdc | BLOCKED，当前机器未安装 |

## 已执行验证

- Flutter SDK 归档 SHA-256：`37934f2128a55d77a38baba12fd611157ed23a47bf7d2b7d17e9e84da118409d`，PASS。
- `flutter pub get`，PASS。
- `flutter analyze --no-pub`，PASS（通过盘符映射规避中文路径下分析服务异常）。
- `flutter test`，PASS。
- `flutter devices`，识别 Android 模拟器、Windows、Chrome、Edge。
- `flutter create --platforms=android`，PASS，生成 v2 embedding Android 壳层。
- `flutter build apk --debug --no-tree-shake-icons`，PASS（通过 ASCII 盘符工作目录，Gradle 依赖已解析）；产物为
  `build/app/outputs/flutter-apk/app-debug.apk`。
- `flutter build apk --release --no-pub --no-tree-shake-icons`，PASS；产物为
  `build/app/outputs/flutter-apk/app-release.apk`（约 55.3 MB）。
- APK 已安装到 `emulator-5554`（Android 16/API 36）并冷启动；首页在服务端未启动时显示明确的离线错误与“重试”入口。
- Android SDK 通过 `flutter config --android-sdk E:\\Android\\Sdk` 配置；`flutter doctor` 仍提示许可证状态未知，需在
  Android SDK 管理器中完成许可证确认后再作为发布前置条件复核。

## 合同与占位行为

接口定义位于 `lib/platform/platform_contracts.dart`，默认实现位于 `lib/platform/unavailable_platforms.dart`。调用未接 SDK 的能力会明确返回 `PlatformOperationStatus.unavailable`，并附带原因；不会返回伪成功结果。

## 解除阻塞条件

1. 允许访问 Gradle Plugin Portal 和 Google Maven，或准备对应的离线缓存。
2. 在 macOS 安装 Xcode 并配置 Apple 签名。
3. 安装 DevEco Studio 及 OpenHarmony Flutter 适配工具链。
4. 为微信登录、手机号一键登录、支付、推送、视频/直播和文件上传分别配置供应商沙箱账号，再进行真实联调。
