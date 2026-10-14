# 得宝 Flutter 移动端

这是得宝 APP 的全新 Flutter 移动端工程，目标平台为 Android、iOS 和 HarmonyOS。

## 当前状态

- Flutter 3.47.2 工程、Android 原生壳层、主题入口、路由、网络层和平台能力 contract 已建立。
- `flutter pub get`、`flutter analyze`、`flutter test` 已通过；Android 模拟器已识别。
- Android debug/release APK 已在本机 API 36 模拟器工具链构建；iOS/HarmonyOS 仍需各自原生工具链。
- 三端 SDK、签名、真实登录、支付、推送、媒体和直播能力必须在对应平台环境中验证。

## 开发命令

```powershell
flutter pub get
flutter analyze
flutter test
flutter run
```

## 相关文档

- `../debao-mobile/docs/FLUTTER_REBUILD_PLAN.md`
- `../debao-mobile/docs/FLUTTER_GOAL_PROMPT.md`
- `docs/FLUTTER_PLATFORM_SPIKE.md`

现有 `debao-mobile`、`debao-server`、`debao-admin` 和 Figma Make 原型均为项目资产，不得删除。

## 本地 Web 预览

先执行 `flutter build web`，再运行 `node scripts/serve_web_spa.mjs`。脚本默认监听
`http://127.0.0.1:8097/`，并为 Flutter clean-path 深链提供 SPA fallback；可通过
`DEBAO_WEB_PORT` 和 `DEBAO_WEB_ROOT` 覆盖端口与构建目录。
