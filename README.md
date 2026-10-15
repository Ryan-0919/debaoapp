# 得宝APP（最新版）

> GitHub 仓库：`debaoapp`。项目展示名称为“得宝APP（最新版）”。

## 项目目录

- `debao-flutter`：当前 Flutter 移动端。
- `debao-server`：后端 API、数据库迁移和测试。
- `debao-admin`：运营后台、学习中心后台和批改后台。
- `debao-mobile`：保留的 React Native 工程及历史设计文档。
- `得宝APP (1)`：界面原型。
- `deploy`：服务器部署配置和脚本。

## 在另一台电脑恢复开发

先安装 Git、Node.js 22 或更高版本、pnpm、Flutter 和 Android SDK。Android 编译的额外配置见 `debao-flutter/docs/POLYV_INTEGRATION.md`。

```powershell
git clone https://github.com/Ryan-0919/debaoapp.git
cd debaoapp
```

### 后端

本地需要 PostgreSQL 和 Redis。可在安装 Docker 后运行：

```powershell
cd debao-server
docker compose up -d postgres redis
Copy-Item .env.example .env
# 按本机环境调整 .env 中的数据库地址和开发账号配置。
npm ci
npm run migrate
npm run dev
```

API 默认地址：`http://127.0.0.1:4000`。

### 管理端

在另一个终端中运行：

```powershell
cd debao-admin
pnpm install --frozen-lockfile
pnpm dev
```

默认地址：`http://127.0.0.1:8000`。管理账号由后端环境配置或数据库中的管理员记录决定。

### Flutter App

在另一个终端中运行：

```powershell
cd debao-flutter
flutter pub get
flutter run --dart-define=DEBAO_API_BASE_URL=http://10.0.2.2:4000
```

`10.0.2.2` 用于 Android 模拟器访问本机后端。真机请改成开发电脑的局域网 IP；Web 请使用 `http://127.0.0.1:4000`。

## 本机数据

仓库包含源码、测试、迁移、项目资源和配置示例。`.env`、私有签名文件、上传文件、数据库、依赖目录、缓存、编译产物及本地工作树不会上传。

另一台电脑会创建新的本地数据库。如需继续使用已有数据，还需要单独迁移数据库及 `debao-server/uploads`；实际环境配置也需要单独安全传输。

更详细的说明请查看各子项目 README 和 `PROJECT_COMPLETION_PLAN.md`。
