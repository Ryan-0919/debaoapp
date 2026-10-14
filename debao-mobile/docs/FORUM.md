# 论坛业务说明

更新时间：2026-09-02

## 范围与页面

论坛入口保留在 `LawSearchScreen` 的“学习论坛”Tab。正常 Mock 态继续展示 Figma Make 的 6 篇帖子；真实模式使用 `ForumService`，不在失败或空数据时回退到原型内容。

- `ForumDetailScreen`：帖子正文、点赞/取消点赞、收藏/取消收藏、评论分页、发表评论、作者删除帖子或评论、举报帖子。
- `ForumComposeScreen`：选择四类帖子、填写标题和正文、字段计数、提交禁用态、错误提示，发布成功后进入详情。
- `LawSearchScreen`：按分类查询、游标加载更多、loading/error/empty/retry 状态、详情和发帖导航。

路由参数：`ForumDetail: {postId: string}`；`ForumCompose: undefined`。

## 业务规则

| 规则 | 服务端约束 |
|---|---|
| 分类 | 经验分享、答疑求助、知识整理、技巧方法 |
| 标题 | 去除首尾空白后 4-80 字 |
| 正文 | 去除首尾空白后 10-5000 字 |
| 评论 | 去除首尾空白后 1-1000 字 |
| 发帖频控 | 每个用户每小时最多 5 篇 |
| 评论频控 | 每个用户每小时最多 20 条 |
| 删除 | 仅作者可删除，帖子和评论均为软删除 |
| 点赞/收藏 | 按帖子和当前用户唯一，重复调用执行切换 |
| 举报 | 登录用户可提交 2-200 字理由；同一用户对同一帖子存在 pending 举报时幂等返回原记录 |
| 分页 | `limit` 为 1-50，默认 20；`cursor` 为服务端生成的不透明游标 |
| 用户隔离 | `mine`、`favorites`、`liked`、`favorited`、`canDelete` 均按 Access Token 对应用户计算 |

## 接口

| 方法 | 路径 | 用途 |
|---|---|---|
| GET/POST | `/forum/posts` | 分类/范围/游标列表；发布帖子 |
| GET/DELETE | `/forum/posts/:id` | 详情；作者软删除 |
| POST | `/forum/posts/:id/like` | 点赞状态切换 |
| POST | `/forum/posts/:id/favorite` | 收藏状态切换 |
| POST | `/forum/posts/:id/report` | 提交举报并进入 pending 待处理队列 |
| GET/POST | `/forum/posts/:id/comments` | 评论游标列表；发表评论 |
| DELETE | `/forum/comments/:id` | 评论作者软删除 |

完整请求体、响应字段和错误响应以 `debao-server/openapi.yaml` 为准。数据库结构由 `migrations/007_forum.sql` 提供，包含评论、点赞、收藏和列表索引。

## 错误与状态

- `AUTH_REQUIRED`：登录失效，由统一 API 客户端刷新会话或进入登录流程。
- `VALIDATION_ERROR`：分类、字数、limit、cursor 或举报理由不合法，页面保留用户输入。
- `FORUM_POST_NOT_FOUND` / `FORUM_COMMENT_NOT_FOUND`：内容不存在或已删除。
- `FORUM_DELETE_FORBIDDEN`：当前用户不是作者。
- `FORUM_POST_RATE_LIMITED` / `FORUM_COMMENT_RATE_LIMITED`：频控命中，读取 `details.retryAfter`。

## 验证

- 服务端专项测试覆盖分类和游标分页、字段校验、点赞切换、收藏范围、双用户隔离、评论创建/删除、越权 403 和软删除后 404。
- 移动端组件测试覆盖原型 6/2 篇筛选、列表到详情/发帖导航、详情加载、点赞、收藏、评论和发布表单。
- 上线前仍需在 Android、iOS、HarmonyOS 真机验证输入法顶起、长正文滚动、Safe Area、系统返回和弱网重试。

## 治理边界

移动端已完成举报受理：RN 与 Flutter 真实模式均提供理由校验、提交中/失败/成功状态，并将记录写入服务端 `pending` 队列；默认 Mock 模式保留 RC 正常态，不显示远端治理入口。运营审核、处罚执行和内容风控供应商由独立 `debao-admin` 与服务端承载，移动端不会伪造审核完成。
