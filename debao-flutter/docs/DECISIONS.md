# Flutter 技术决策

## 2026-09-01：从零开发采用 Flutter

选择 Flutter + Dart 作为新的移动端实现，原因是题库、课程、媒体、商城、AI 和批改页面需要统一的交互实现。功能范围、页面层级、导航和文案以现有 `debao-mobile` 项目及其业务文档为准；Figma 只在明确提出视觉验收时参考，不用于猜测需求。

后端继续复用 `debao-server`，避免重复实现账号、订单、权益、判分和批改状态机。React Native 工程保留为参考，不与 Flutter 代码混用运行时。

## 2026-09-01：平台能力插件化

微信登录、手机号、支付、推送、媒体、文件和直播通过平台 contract 暴露。Android、iOS、HarmonyOS 可分别接入原生 SDK；未验证的能力必须保持 pending/unavailable 状态。

## 2026-09-01：当前环境限制

当前 Windows 已安装并验证 Flutter/Dart Web 工具链；iOS 缺少 macOS/Xcode，HarmonyOS 缺少 DevEco 工具链。因此已完成 Flutter/Web 功能闭环，但不能宣称三端原生构建完成。
