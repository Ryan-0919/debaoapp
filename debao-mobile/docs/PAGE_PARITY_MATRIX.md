# 28 页 1:1 核验矩阵

更新时间：2026-08-28

`E:\code\得宝APP开发\得宝APP (1)` 是唯一的视觉、内容和交互基准。React Native 中存在页面文件或路由，只代表技术骨架存在，不代表完成 1:1 复刻。

## 状态定义

- `未开始`：尚未完成原型源码、运行态和 React Native 实现的逐项对照。
- `进行中`：正在实现，或缺少关键状态、导航、Android 截图中的任一项。
- `已完成`：同时具备原型源码核对、390x844 原型截图、React Native 实现、关键交互验证和 Android 对照截图。
- `受阻`：仅用于真实依赖外部环境、账号、签名或产品决策的情况。

## 页面清单

| # | Figma Make 页面 | React Native 目标 | 必验正常态与关键交互态 | 状态 |
|---:|---|---|---|---|
| 1 | `src/pages/Home.tsx` | `src/screens/tabs/HomeScreen.tsx` | 客观题首页、主观题首页、两张 Banner、公告切换/关闭、横向入口和课程滚动、全部入口跳转 | 已完成 |
| 2 | `src/pages/QuestionBank.tsx` | `src/screens/tabs/QuestionBankScreen.tsx` | 客观题、主观题、年份 Bottom Sheet、卷别切换、章节展开、全部入口跳转 | 已完成 |
| 3 | `src/pages/Mall.tsx` | `src/screens/tabs/MallScreen.tsx` | 分类筛选、类型筛选、商品列表、商品跳转 | 已完成 |
| 4 | `src/pages/Courses.tsx` | `src/screens/tabs/CoursesScreen.tsx` | 日历/全部课程、周/月切换、快捷筛选、补课日期、加入安排三个 Bottom Sheet、课程/直播/音频跳转 | 已完成 |
| 5 | `src/pages/Profile.tsx` | `src/screens/tabs/ProfileScreen.tsx` | 用户信息、学习数据、功能分组、全部入口跳转 | 已完成 |
| 6 | `src/pages/SubjectiveSelect.tsx` | `src/screens/questions/SubjectiveSelectScreen.tsx` | 默认列表、科目参数、年份/难度筛选 Bottom Sheet、筛选结果、答题跳转 | 已完成 |
| 7 | `src/pages/SubjectiveAnswer.tsx` | `src/screens/questions/SubjectiveAnswerScreen.tsx` | 题目/小题切换、答题输入、保存时间、法条检索跳转、提交 Dialog | 已完成 |
| 8 | `src/pages/ObjectiveAnswer.tsx` | `src/screens/questions/ObjectiveAnswerScreen.tsx` | 章节/考试模式、单选作答、上下题、答题卡 Bottom Sheet、交卷 Dialog | 已完成 |
| 9 | `src/pages/ObjectiveReport.tsx` | `src/screens/questions/ObjectiveReportScreen.tsx` | 成绩概览、题目结果、错题本跳转、返回路径 | 已完成 |
| 10 | `src/pages/ProductDetail.tsx` | `src/screens/commerce/ProductDetailScreen.tsx` | 各商品内容、课程大纲展开/收起、底部购买栏、确认购买 Bottom Sheet、购买跳转 | 已完成 |
| 11 | `src/pages/PurchaseSuccess.tsx` | `src/screens/commerce/PurchaseSuccessScreen.tsx` | 成功信息、课程/订单/首页入口和不同商品参数 | 已完成 |
| 12 | `src/pages/CourseDetail.tsx` | `src/screens/courses/CourseDetailScreen.tsx` | 已购/未购、章节展开、课时状态、视频和商品跳转 | 已完成 |
| 13 | `src/pages/VideoPlayer.tsx` | `src/screens/courses/VideoPlayerScreen.tsx` | 播放控件显隐、播放/暂停、进度、倍速层、目录/讲义/笔记、章节展开、切课 | 已完成 |
| 14 | `src/pages/LiveCourse.tsx` | `src/screens/courses/MediaScreens.tsx` (`LiveCourseScreen`) | 倒计时、聊天/课件、发言、点赞和人数信息 | 未开始 |
| 15 | `src/pages/AudioPlayer.tsx` | `src/screens/courses/MediaScreens.tsx` (`AudioPlayerScreen`) | 播放/暂停、进度、倍速层、循环、文稿/目录/笔记、新增笔记、切课 | 未开始 |
| 16 | `src/pages/LearningReport.tsx` | `src/screens/tools/ToolScreens.tsx` (`LearningReportScreen`) | 学习数据、图表/进度、薄弱项和专项练习跳转 | 未开始 |
| 17 | `src/pages/LearningPlan.tsx` | `src/screens/tools/ToolScreens.tsx` (`LearningPlanScreen`) | 计划概览、每日任务、状态和操作按钮 | 未开始 |
| 18 | `src/pages/MistakeBook.tsx` | `src/screens/tools/ToolScreens.tsx` (`MistakeBookScreen`) | 科目筛选、错题列表、复习跳转 | 未开始 |
| 19 | `src/pages/Favorites.tsx` | `src/screens/tools/ToolScreens.tsx` (`FavoritesScreen`) | 收藏分类/列表、题目练习跳转 | 未开始 |
| 20 | `src/pages/LawSearch.tsx` | `src/screens/tools/ToolScreens.tsx` (`LawSearchScreen`) | 法条/论坛/公告 Tab、搜索前后、科目筛选、列表展开、收藏、法条全文 Bottom Sheet、关联练习 | 未开始 |
| 21 | `src/pages/AIChat.tsx` | `src/screens/ai/AIChatScreen.tsx` | 初始消息、输入、发送、加载、连续对话、键盘和滚动 | 未开始 |
| 22 | `src/pages/OrderList.tsx` | `src/screens/commerce/OrderScreens.tsx` (`OrderListScreen`) | 订单列表、状态/金额/商品信息、详情跳转 | 未开始 |
| 23 | `src/pages/OrderDetail.tsx` | `src/screens/commerce/OrderScreens.tsx` (`OrderDetailScreen`) | 订单信息、商品跳转、课程跳转和不同订单参数 | 未开始 |
| 24 | `src/pages/UserProfile.tsx` | `src/screens/account/AccountScreens.tsx` (`UserProfileScreen`) | 资料展示、字段编辑 Bottom Sheet、头像颜色 Bottom Sheet、保存反馈 | 未开始 |
| 25 | `src/pages/Settings.tsx` | `src/screens/account/AccountScreens.tsx` (`SettingsScreen`) | 设置分组、开关/入口、退出登录 Dialog | 未开始 |
| 26 | `src/pages/Notifications.tsx` | `src/screens/account/AccountScreens.tsx` (`NotificationsScreen`) | 通知分组、已读/未读视觉和滚动内容 | 未开始 |
| 27 | `src/pages/GradingService.tsx` | `src/screens/tools/ToolScreens.tsx` (`GradingServiceScreen`) | 服务说明、提交入口和主观题跳转 | 未开始 |
| 28 | `src/pages/QuestionRecords.tsx` | `src/screens/tools/ToolScreens.tsx` (`QuestionRecordsScreen`) | 记录列表、成绩/时间/状态、报告跳转 | 未开始 |

## 单页完成证据

每一行从 `进行中` 改为 `已完成` 前，必须同时记录：

1. 原型源码和公共组件核对结果。
2. 390x844 原型正常态截图路径。
3. 该页所有关键交互态截图或 UIAutomator 断言。
4. Android 390x844 或等比例实现截图路径。
5. 页面内全部可点击元素的目标路由或本地状态变化。
6. 与原型差异清单；不存在差异时明确写“无已知差异”。

28 行没有全部达到 `已完成` 时，不得把“全部页面 1:1 复刻”对应的 Goal 标记为完成。

## 已完成页面证据

### 1. 首页

- 原型源码：`得宝APP (1)/src/pages/Home.tsx`、`src/components/BottomNav.tsx`、`src/index.css` 已核对。
- 原型截图：`docs/screenshots/figma-home-objective.png`、`docs/screenshots/figma-home-subjective.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-home-api36.png`、`android-home-subjective.png`、`android-home-banner-two.png`、`android-home-community.png`。
- 关键交互：UIAutomator 已验证主客观题切换、6 个主观题入口、第二张 Banner、第二条公告、公告关闭和社区热帖；Jest 固定页内切换与 `LawSearch` 跳转。
- 导航：功能入口、通知、促销、热门课程、公告和社区入口均接入类型化 React Navigation 路由。
- 已知差异：仅真实 Android 系统状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 2. 题库

- Android 截图：`docs/screenshots/android-question-bank-objective.png`、`android-question-bank-subjective.png`、`android-question-bank-year-sheet.png`。
- 关键交互：UIAutomator 与 Jest 已验证主客观题切换、年份 Bottom Sheet、卷别、章节展开和对应答题路由。
- 已知差异：仅平台必然差异；无已知产品内容或交互差异。

### 3. 商城

- 原型源码：`得宝APP (1)/src/pages/Mall.tsx`、`src/components/TopBar.tsx`、`src/components/ui.tsx` 和 `src/data.ts` 已核对。
- 原型截图：`docs/screenshots/figma-mall.png`，390x844。
- Android 截图：`docs/screenshots/android-mall.png`、`android-mall-empty.png`。
- 关键交互：UIAutomator 已验证分类、类型筛选和“主观题 + 直播课程”空态；Jest 已验证商品过滤、空态和 `p4` 商品详情参数。
- 导航：6 个商品均连接到类型化 `ProductDetail` 路由并携带原型 `productId`。
- 已知差异：原型基准截图抓取时远程图片未加载；React Native 使用同一 Unsplash 图源的受控本地 PNG。除此之外仅有平台必然差异。

### 4. 课程

- 原型源码：`得宝APP (1)/src/pages/Courses.tsx`、`src/components/BottomSheet.tsx`、`src/components/ui.tsx` 和课程演示数据已核对。
- 原型截图：`docs/screenshots/figma-courses-calendar.png`、`figma-courses-all.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-courses-calendar-raw.png`、`android-courses-all-raw.png`、`android-courses-month-sheet-raw.png`、`android-courses-reschedule-sheet-raw.png`、`android-courses-add-sheet-raw.png`。
- 关键交互：UIAutomator 已验证日历/全部课程切换、下一周真实变为 8月31日到 9月6日、月份弹层、待补课调整弹层和加入学习安排弹层；Jest 覆盖日期、空态、快捷筛选、月份选择、三个弹层及课程/音频/直播导航。
- 导航：录播、专项课程连接 `CourseDetail`，音频连接 `AudioPlayer`，直播连接 `LiveCourse`，均携带类型化参数。
- 已知差异：仅真实 Android 状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 5. 我的

- 原型源码：`得宝APP (1)/src/pages/Profile.tsx` 和公共底部导航已核对。
- 原型截图：`docs/screenshots/figma-profile.png`，390x844。
- Android 截图：`docs/screenshots/android-profile.png`、`android-profile-services.png`。
- 关键交互：UIAutomator 已验证首屏账号、继续学习、学习资产、本周重点，以及滚动后的学习与内容、课程与服务、应用管理三组入口；Jest 覆盖头像、编辑、继续、报告和全部 10 个菜单路由。
- 导航：页面入口连接 `UserProfile`、`CourseDetail`、`LearningPlan`、`LearningReport`、`QuestionRecords`、`MistakeBook`、`Favorites`、课程 Tab、`OrderList`、`Grading`、`Notifications` 和 `Settings`。
- 已知差异：仅真实 Android 状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 6. 主观题选择

- 原型源码：`得宝APP (1)/src/pages/SubjectiveSelect.tsx`、`src/data.ts` 和公共 Bottom Sheet 已核对。
- 原型截图：`docs/screenshots/figma-subjective-select.png`，390x844。
- Android 截图：`docs/screenshots/android-subjective-select.png`、`android-subjective-select-filter.png`。
- 关键交互：UIAutomator 已验证民法 5 题、筛选弹层年份/难度选项；Jest 覆盖组合筛选、筛选空态、清除筛选、非民法空态和题目索引导航。
- 导航：每道题连接 `SubjectiveAnswer`，携带原始 `questionIndex` 和 `subjectName`，筛选后索引不会错位。
- 已知差异：仅真实 Android 状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 7. 主观题作答

- 原型源码：`得宝APP (1)/src/pages/SubjectiveAnswer.tsx`、`src/data.ts`、`src/components/Dialog.tsx` 和公共状态组件已核对。
- 原型截图：`docs/screenshots/figma-subjective-answer.png`，390x844。
- Android 截图：`docs/screenshots/android-subjective-answer.png`、`android-subjective-answer-saved.png`、`android-subjective-answer-submit-dialog.png`。
- 关键交互：UIAutomator 已验证从首页/题库进入真实答题页、五道题导航、四个小问、文本输入、12 字计数、24 小时制保存时间、最终提交 Dialog 和法条检索；Jest 覆盖指定题目索引、独立小问答案、保存、上一问、题目切换、取消/确认提交和导航。
- 导航：法条按钮连接 `LawSearch`；最终确认提交后返回上一页；题目、小问及上一题/下一问/下一题均保持原型状态机。
- 已知差异：仅真实 Android 状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 8. 客观题作答

- 原型源码：`得宝APP (1)/src/pages/ObjectiveAnswer.tsx`、`src/data.ts`、`src/components/BottomSheet.tsx` 和 `src/components/Dialog.tsx` 已核对。
- 原型截图：`docs/screenshots/figma-objective-answer.png`、`figma-objective-answer-selected.png`、`figma-objective-answer-card.png`、`figma-objective-answer-dialog.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-objective-answer.png`、`android-objective-answer-card.png`、`android-objective-answer-dialog.png`。
- 关键交互：UIAutomator 已验证题库章节入口、四道原型题、进度、选项 D、答题卡统计、交卷确认和带正确数/总数的报告导航；Jest 覆盖未答切题、上下题、两题答案、答题卡题号跳转、取消交卷和确认交卷。
- 导航：章节/考试标题参数均显示在顶部；确认交卷连接类型化 `ObjectiveReport` 并携带实际 `correct`、`total`。
- 已知差异：原型源码定义了解析态，但确认交卷时立即导航到报告，运行态不可停留在解析态；React Native 保持同样行为。除此之外仅有平台必然差异。

### 9. 客观题报告

- 原型源码：`得宝APP (1)/src/pages/ObjectiveReport.tsx`、`src/data.ts` 和公共进度组件已核对。
- 原型截图：`docs/screenshots/figma-objective-report.png`，390x844。
- Android 截图：`docs/screenshots/android-objective-report.png`、`android-objective-report-bottom.png`。
- 关键交互：UIAutomator 已验证真实交卷结果的分数/答对/答错/总题数、科目分析、四道逐题解析和底部两项操作；Jest 固定验证原型 3/4 对应 75 分、完整题目列表及导航。
- 导航：“加入错题本”连接 `MistakeBook`；“返回题库”返回上一层答题来源。
- 已知差异：原型顶部固定 3/4，但逐题演示答案实际为 2/4；React Native 顶部使用真实路由结果，逐题区保留原型演示答案。除此之外仅有平台必然差异。

### 10. 商品详情

- 原型源码：`得宝APP (1)/src/pages/ProductDetail.tsx`、`src/data.ts`、公共 TopBar 和 Bottom Sheet 已核对。
- 原型截图：`docs/screenshots/figma-product-detail.png`、`figma-product-detail-expanded.png`、`figma-product-detail-purchase.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-product-detail.png`、`android-product-detail-expanded.png`、`android-product-detail-purchase.png`、`android-product-detail-bottom.png`。
- 关键交互：UIAutomator 已验证 p1 首屏、6 项大纲展开、确认购买金额、支付跳转、营销详情、服务承诺和 3 条评价；Jest 覆盖 p1 展开/取消/支付、p4 直播封面态和 p5 音频封面态。
- 数据与导航：商城和详情共用 6 商品目录；确认支付调用现有 Mock 订单/支付服务，并携带商品名和订单号替换到 `PurchaseSuccess`。
- 已知差异：原型营销面板使用 CSS 渐变，React Native 共享实现使用对应主色纯色背景，避免引入三端不一致的额外渐变依赖；除此之外仅有平台必然差异。

### 11. 购买成功

- 原型源码：`得宝APP (1)/src/pages/PurchaseSuccess.tsx`、`src/data.ts` 和商品/课程关联已核对。
- 原型截图：`docs/screenshots/figma-purchase-success.png`、`figma-purchase-success-scheduled.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-purchase-success.png`、`android-purchase-success-scheduled.png`。
- 关键状态：p1 自动开通态显示“进入课程”，p4 预约开课态显示“查看我的课程”；UIAutomator 已验证两态全部文案和 p1 关联课程、p4 课程 Tab 导航。
- 导航：p1/p2 使用原型商品-课程映射进入 `CourseDetail`；其他商品进入课程 Tab；“查看订单”连接 `OrderList`；“返回首页”明确替换到首页 Tab。Jest 覆盖全部目标。
- 已知差异：仅真实 Android 状态栏、底部手势区、Safe Area 和字体栅格化差异；无已知产品内容或交互差异。

### 12. 课程详情

- 原型源码：`得宝APP (1)/src/pages/CourseDetail.tsx`、`src/data.ts`、公共 TopBar、Tag 和 ProgressBar 已核对。
- 原型截图：`docs/screenshots/figma-course-detail-owned.png`、`figma-course-detail-current.png`、`figma-course-detail-locked.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-course-detail-owned.png`、`android-course-detail-current.png`、`android-course-detail-locked.png`。
- 关键交互：UIAutomator 已验证 c1 已购态、默认首章、第二章展开、当前课高亮、c2 未购态及“去购买”；Jest 覆盖继续学习、章节互斥开合、具体 `lessonId` 视频参数、未购按钮和未购课时商品参数。
- 数据与导航：`src/data/courses.ts` 完整迁移 c1/c2 章节和课时；已购课时连接 `VideoPlayer`，未购课时及按钮连接对应 `ProductDetail`。两张课程图片均为原型同源的受控本地 PNG。
- 已知差异：原型把 `c1` 静态标记为已购、`c2` 静态标记为未购，即使由 p1 购买成功进入 c2 也不会改变授权状态；React Native 为保持页面运行态 1:1 暂时保留该矛盾，正式接入时必须由订单/授权服务统一状态。除此之外仅有平台必然差异。

### 13. 视频播放

- 原型源码：`得宝APP (1)/src/pages/VideoPlayer.tsx`、`src/data.ts` 和课程目录数据已核对。
- 原型截图：`docs/screenshots/figma-video-player-catalog.png`、`figma-video-player-controls-hidden.png`、`figma-video-player-speed.png`、`figma-video-player-handout.png`、`figma-video-player-notes.png`、`figma-video-player-note-saved.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-video-player-catalog.png`、`android-video-player-controls-hidden.png`、`android-video-player-speed.png`、`android-video-player-handout.png`、`android-video-player-notes.png`。
- 关键交互：UIAutomator 已验证中央/底部播放、模拟计时、前后 10 秒、控件显隐、完整六档倍速、三个 Tab、讲义和笔记输入节点；Jest 覆盖计时、快进、倍速选择、控件显隐、讲义、笔记保存、章节开合和携带 `lessonId` 的切课替换。
- 数据与导航：视频页复用 `src/data/courses.ts`，无 `lessonId` 时定位原型当前课，有参数时定位指定课时；目录切课使用 `replace` 防止连续切课堆积返回栈。
- 已知差异：原型本身使用图片和计时器模拟视频；React Native 同样实现可交互模拟状态，但尚未接入真实媒体源、解码、DRM、离线下载和系统全屏能力。原型底部使用 CSS 渐变遮罩，三端共享实现使用分层半透明遮罩。除此之外仅有平台必然差异。
