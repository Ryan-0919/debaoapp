# Flutter 路由首帧证据

生成时间：2026-09-02。所有文件均为 Flutter Web clean-path 页面在 `390x844` 视口的
首帧 JPEG；预览由 `scripts/serve_web_spa.mjs` 提供，默认地址为
`http://127.0.0.1:8097/`。对应 RC 参考图位于
`debao-mobile/docs/screenshots/figma-*.png`。

这些截图证明路由可达、首帧有内容且没有明显布局崩溃；它们不等同于逐页同状态的
像素级 1:1 验收。矩阵中的“视觉证据待补”状态仍需保留，直到 RC 与 Flutter 在同一
交互状态下完成对照。

## 证据审计（2026-09-02）

- `lib/app/app.dart` 当前注册 36 个 `GoRoute`；`test/route_layout_test.dart` 使用同一
  组 36 个公开地址。下表引用的 36 个文件均存在，格式为 JPEG，尺寸均为 `390x844`。
- 36 个文件中有 35 个不同的图像内容：`questions-subjective-success` 与
  `grading-success` 两张图完全相同，这是两条路由复用同一个成功组件的预期结果，
  不是缺少一张子页面。
- 这 36 张图只证明 fixture 模式（`remoteEnabled: false`）的 clean-path 首帧可达，
  不代表 RC 的每个正常态、筛选/展开/弹层/键盘/提交态或远端错误态。RC 基准目录仍有
  62 张 `debao-mobile/docs/screenshots/figma-*.png` 状态图；当前没有为这些状态建立
  一一对应的 Flutter 图或像素 golden，因此页面矩阵中的“视觉证据待补”不能改成
  “1:1 已完成”。
- 当前导出图可见 Flutter Web 的手机外框、灰色背景和阴影；RC 参考图是裸的
  `390x844` 画布。做像素 diff 前必须在两边使用同一画布（建议直接捕获 child canvas，
  或明确裁掉外框），否则尺寸相同也不能视为可比证据。

以下是路由与矩阵页面的对应关系，避免把参数化/别名路由误判为漏实现：

| 路由 | 矩阵对应项 | 说明 |
|---|---|---|
| `/tools/question-records/:recordId` | `QuestionRecords` | Flutter 的记录详情状态；有独立首帧证据，但不另造一个 RN 原型页面 |
| `/questions/subjective/success` | `SubjectiveSubmitSuccess` | 主观题提交成功页 |
| `/grading/success` | `SubjectiveSubmitSuccess` / RN `GradingSubmitSuccess` | Flutter 复用同一成功组件，路由和首帧均已覆盖 |
| `/login` | RN auth gate（矩阵外） | 认证入口，不是 Figma Make 的 28 个业务页面之一；仍保留独立路由证据 |

参数兼容：`/questions/subjective/answer` 同时接受 RN 的
`subjectName/questionIndex/gradingPaperId/gradingQuestionId` 与历史 Flutter 的
`subject/paperTitle/paperId/questionId`；购买成功页接受 `productName/productId/orderId`。

参数化路由目前各保留一个可复核 fixture 参数（例如 `p1`、`c1`、`privacy`、`order-1`、
`sub-1`）。`terms`/`sdk-list`/`account-deletion` 等法律文档参数，以及不同商品、课程、
订单和批改状态尚未各自保存首帧；它们属于同一路由的参数/状态验收清单，不应被误报为
“子页面已完成”。

| 路由 | Flutter 首帧 |
|---|---|
| `/login` | [login.jpg](routes/login.jpg) |
| `/` | [home.jpg](routes/home.jpg) |
| `/questions/subjective` | [questions-subjective__subject-E6B091E6B395.jpg](routes/questions-subjective__subject-E6B091E6B395.jpg) |
| `/questions/subjective/answer` | [questions-subjective-answer__subject-E6B091E6B395.jpg](routes/questions-subjective-answer__subject-E6B091E6B395.jpg) |
| `/questions/subjective/success` | [questions-subjective-success__submissionId-sub-1.jpg](routes/questions-subjective-success__submissionId-sub-1.jpg) |
| `/questions/objective` | [questions-objective__title-E5AEA2E8A782E9A298.jpg](routes/questions-objective__title-E5AEA2E8A782E9A298.jpg) |
| `/questions/objective/report` | [questions-objective-report__answers-0,1,2.jpg](routes/questions-objective-report__answers-0,1,2.jpg) |
| `/commerce/product/p1` | [commerce-product-p1.jpg](routes/commerce-product-p1.jpg) |
| `/commerce/purchase/success` | [commerce-purchase-success__productName-E6B091E6B395E8AFBEE7A88B.jpg](routes/commerce-purchase-success__productName-E6B091E6B395E8AFBEE7A88B.jpg) |
| `/commerce/purchase/pending` | [commerce-purchase-pending__orderId-order-1.jpg](routes/commerce-purchase-pending__orderId-order-1.jpg) |
| `/commerce/orders` | [commerce-orders.jpg](routes/commerce-orders.jpg) |
| `/commerce/orders/:orderId` | [commerce-orders-order-1.jpg](routes/commerce-orders-order-1.jpg) |
| `/courses/:courseId` | [courses-c1.jpg](routes/courses-c1.jpg) |
| `/courses/:courseId/video` | [courses-c1-video__lessonId-l1.jpg](routes/courses-c1-video__lessonId-l1.jpg) |
| `/courses/:courseId/audio` | [courses-c1-audio__lessonId-l1.jpg](routes/courses-c1-audio__lessonId-l1.jpg) |
| `/courses/:courseId/live` | [courses-c3-live.jpg](routes/courses-c3-live.jpg) |
| `/tools/learning-report` | [tools-learning-report.jpg](routes/tools-learning-report.jpg) |
| `/tools/learning-plan` | [tools-learning-plan.jpg](routes/tools-learning-plan.jpg) |
| `/tools/mistakes` | [tools-mistakes.jpg](routes/tools-mistakes.jpg) |
| `/tools/favorites` | [tools-favorites.jpg](routes/tools-favorites.jpg) |
| `/tools/law` | [tools-law.jpg](routes/tools-law.jpg) |
| `/tools/question-records` | [tools-question-records.jpg](routes/tools-question-records.jpg) |
| `/tools/question-records/:recordId` | [tools-question-records-record-1__questionId-q1.jpg](routes/tools-question-records-record-1__questionId-q1.jpg) |
| `/community/forum` | [community-forum.jpg](routes/community-forum.jpg) |
| `/community/forum/compose` | [community-forum-compose.jpg](routes/community-forum-compose.jpg) |
| `/community/forum/:postId` | [community-forum-post-1__title-E5B896E5AD90.jpg](routes/community-forum-post-1__title-E5B896E5AD90.jpg) |
| `/account/ai` | [account-ai.jpg](routes/account-ai.jpg) |
| `/account/profile` | [account-profile.jpg](routes/account-profile.jpg) |
| `/account/settings` | [account-settings.jpg](routes/account-settings.jpg) |
| `/account/security` | [account-security.jpg](routes/account-security.jpg) |
| `/account/legal/:document` | [account-legal-privacy.jpg](routes/account-legal-privacy.jpg) |
| `/account/notifications` | [account-notifications.jpg](routes/account-notifications.jpg) |
| `/grading` | [grading.jpg](routes/grading.jpg) |
| `/grading/paper/:paperId` | [grading-paper-paper-1.jpg](routes/grading-paper-paper-1.jpg) |
| `/grading/success` | [grading-success__submissionId-sub-1.jpg](routes/grading-success__submissionId-sub-1.jpg) |
| `/grading/report/:submissionId` | [grading-report-sub-1.jpg](routes/grading-report-sub-1.jpg) |
