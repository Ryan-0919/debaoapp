# 三端平台状态

| 平台 | 目标 | 当前状态 | 必要工具 |
|---|---|---|---|
| Android | APK/AAB、登录、支付、媒体、推送 | Debug APK 已构建并安装到 API 36 模拟器；正式登录、支付、媒体、推送仍按 Provider 边界未接入 | `E:\Android\Sdk`、JDK 21、Flutter SDK |
| iOS | App、Apple 购买、APNs、媒体 | Windows 无法执行原生构建 | macOS、Xcode、Apple 签名账号 |
| HarmonyOS | OpenHarmony 包、登录、支付、推送 | 当前未发现鸿蒙工具链 | DevEco Studio、SDK、hvigor、ohpm、hdc、签名 |

## Android 已验证环境

```text
Flutter 3.47.2 / Dart 3.13.2
Java D:\java\jdk21\bin\java.exe
Android SDK E:\Android\Sdk
ADB 37.0.1
Device emulator-5554: Android 16 (API 36), android-x64
```

## 能力接入规则

- 页面只依赖 `lib/platform/platform_contracts.dart` 中的接口。
- 未接入 SDK 时返回 `unavailable`，不伪造登录、支付或推送成功。
- 生产环境禁止 Mock 静默回退；Mock 只能用于开发和自动化测试。
- 每个平台能力必须提供真实设备/模拟器命令、日志和截图证据后，才可标记为已验证。
