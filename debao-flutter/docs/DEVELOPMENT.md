# Flutter 开发约定

## 本地启动

在安装 Flutter stable 后执行：

```powershell
flutter doctor -v
flutter pub get
flutter analyze
flutter test
flutter run
```

当前 Flutter SDK 位于 `E:\tools\debao-flutter\flutter`。平台发布构建按 Goal 范围不执行；Web 验证命令见 `TESTING.md`。

## 功能基准

实现新页面或调整交互时，先查阅 `debao-mobile/src` 对应页面、`debao-mobile/src/navigation`、服务契约和 `debao-mobile/docs`。Flutter 只迁移已有业务行为；没有原项目依据的功能必须先确认，不得凭空新增。

## 代码约定

- 页面放在 `lib/features`，通用组件放在 `lib/shared`。
- 页面不直接拼接 URL、读取密钥或调用原生 SDK。
- API 响应和错误码以 `debao-server/openapi.yaml` 为准。
- 生产环境禁止静默回退 Mock。
- 每次页面或平台能力变更，同步更新测试和文档。
