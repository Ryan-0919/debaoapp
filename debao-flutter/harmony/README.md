# HarmonyOS 本地预览

当前工程使用 ArkTS Web 容器运行同一份 Flutter Web 页面，供 UI 和本地后端联调。
这不是 Flutter 原生鸿蒙移植；支付、推送及原生媒体能力仍需独立适配。
直播入口已暂时隐藏。

使用 DevEco Studio API 26 SDK 构建 `entry` 的 debug HAP。模拟器支持安装 unsigned HAP。
先启动后端 4000 和 Flutter Web 静态服务 8097，再运行：

```sh
hdc rport tcp:4000 tcp:4000
hdc rport tcp:8097 tcp:8097
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
hdc shell aa start -b cn.denlaw.debao -a EntryAbility
```

Flutter Web 构建参数：
`--no-web-resources-cdn --dart-define=DEBAO_REMOTE=true --dart-define=DEBAO_API_BASE_URL=http://127.0.0.1:4000`。
在 Flutter 项目目录运行 `node scripts/serve_web_spa.mjs` 提供 8097 服务。
