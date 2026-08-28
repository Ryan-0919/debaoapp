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
| 14 | `src/pages/LiveCourse.tsx` | `src/screens/courses/LiveCourseScreen.tsx` | 倒计时、课程/教师/人数信息、今日直播安排、预约提醒双态 | 已完成 |
| 15 | `src/pages/AudioPlayer.tsx` | `src/screens/courses/AudioPlayerScreen.tsx` | 播放/暂停、波形进度、15 秒跳转、倍速层、循环、字幕/目录/笔记、新增笔记、切课 | 已完成 |
| 16 | `src/pages/LearningReport.tsx` | `src/screens/tools/LearningReportScreen.tsx` | 学习数据、周柱图、六科进度、薄弱项、做题统计和专项练习跳转 | 已完成 |
| 17 | `src/pages/LearningPlan.tsx` | `src/screens/tools/LearningPlanScreen.tsx` | 周进度、两周计划、任务时长和完成态 | 已完成 |
| 18 | `src/pages/MistakeBook.tsx` | `src/screens/tools/MistakeBookScreen.tsx` | 科目筛选、错题列表、复习跳转 | 已完成 |
| 19 | `src/pages/Favorites.tsx` | `src/screens/tools/FavoritesScreen.tsx` | 收藏列表、题目/法条标签、收藏题目跳转 | 已完成 |
| 20 | `src/pages/LawSearch.tsx` | `src/screens/tools/LawSearchScreen.tsx` | 法条/论坛/公告 Tab、搜索前后、科目筛选、列表展开、收藏、法条全文 Bottom Sheet、关联练习 | 已完成 |
| 21 | `src/pages/AIChat.tsx` | `src/screens/ai/AIChatScreen.tsx` | 初始消息、输入、发送、加载、连续对话、键盘和滚动 | 已完成 |
| 22 | `src/pages/OrderList.tsx` | `src/screens/commerce/OrderListScreen.tsx` | 订单列表、状态/金额/商品信息、详情跳转 | 已完成 |
| 23 | `src/pages/OrderDetail.tsx` | `src/screens/commerce/OrderDetailScreen.tsx` | 订单信息、商品跳转、课程跳转和不同订单参数 | 已完成 |
| 24 | `src/pages/UserProfile.tsx` | `src/screens/account/UserProfileScreen.tsx` | 资料展示、字段编辑 Bottom Sheet、头像颜色 Bottom Sheet、保存反馈 | 已完成 |
| 25 | `src/pages/Settings.tsx` | `src/screens/account/SettingsScreen.tsx` | 设置分组、静态入口、退出登录 Dialog | 已完成 |
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

### 14. 直播课堂

- 原型源码：`得宝APP (1)/src/pages/LiveCourse.tsx`、`src/data.ts` 和课程页直播入口已核对；原型 `liveState` 固定为 `countdown`，因此聊天室与课件 JSX 在实际运行中不可达。
- 原型截图：`docs/screenshots/figma-live-course-countdown.png`、`figma-live-course-subscribed.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-live-course-countdown.png`、`android-live-course-subscribed.png`。
- 关键交互：Android 已验证预约前后按钮、人数和视觉状态；Jest 固定验证初始 `04:28:17` 倒计时、路由直播标题、张明远老师、`6,284` 人预约、三条今日安排及预约后 `6,285` 人和“已预约开播提醒”。
- 数据与导航：学习日历和全部课程中的两个直播入口均携带对应标题；直播页保留 `courseId` 并使用原型同源受控本地 PNG。
- 已知差异：原型源码包含聊天、课件、发言和点赞代码，但固定 `countdown` 状态使这些分支不可观察，不能作为运行态验收内容；React Native 严格复刻当前可达的倒计时与预约两态。Android UIAutomator 因每秒倒计时无法进入 idle，交互证据改用预约前后截图与 Jest 固定。尚未接入真实直播流、信令、聊天室和开播提醒服务。除此之外仅有平台必然差异。

### 15. 音频播放

- 原型源码：`得宝APP (1)/src/pages/AudioPlayer.tsx`、`src/pages/Courses.tsx`、`src/data.ts` 和 c1 完整课程目录已核对。
- 原型截图：`docs/screenshots/figma-audio-player-transcript.png`、`figma-audio-player-playing.png`、`figma-audio-player-speed.png`、`figma-audio-player-notes.png`、`figma-audio-player-note-saved.png`、`figma-audio-player-catalog.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-audio-player-transcript.png`、`android-audio-player-playing.png`、`android-audio-player-speed.png`、`android-audio-player-notes.png`、`android-audio-player-catalog.png`。
- 关键交互：Android 已验证课程页真实入口、模拟计时、播放视觉、完整六档倍速、字幕/笔记/目录三态、循环选中和目录切到第19讲；Jest 覆盖波形 50% 定位、前后 15 秒、循环、倍速关闭、字幕时间点、笔记保存和携带 `lessonId` 的 `replace`。
- 数据与导航：音频页复用 `src/data/courses.ts` 的 c1 封面、老师和 13 个课时；课程列表两个音频入口均按原型传 `courseId: c1`，目录切课使用 `replace` 防止返回栈累积。
- 已知差异：此前 RN 骨架错误传递 `c2`，现已按原型 `Courses.tsx` 修正为 `c1`。原型本身用计时器和波形模拟音频；React Native 同样实现可交互模拟状态，但尚未接入真实媒体源、后台播放、锁屏控制和离线下载。除此之外仅有平台状态栏、Safe Area 和字体栅格化差异。

### 16. 学习报告

- 原型源码：`得宝APP (1)/src/pages/LearningReport.tsx`、公共 `TopBar`、`ProgressBar` 和个人页报告入口已核对。
- 原型截图：`docs/screenshots/figma-learning-report.png`、`figma-learning-report-bottom.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-learning-report.png`；API 36 设备纵向空间可在一屏显示原型两张截图覆盖的全部内容。
- 关键交互：UIAutomator 已确认 `learning-report-screen`、`4.2 小时`、六个 `learning-subject-*` 节点和专项练习按钮；点击后实际进入 `ObjectiveAnswer`，标题为“民事诉讼法专项”。Jest 固定验证周柱图、民诉 53%、`2,847 / 68% / 28` 三项统计和完整路由参数。
- 数据与导航：六科正确率均按原型 `correct / total` 四舍五入计算；不同阈值使用原型绿/紫/橙色和等级标签，专项练习携带 `{mode: chapter, title: 民事诉讼法专项}`。
- 已知差异：当前学习时长、正确率、排名和做题统计仍是原型 Mock，尚未接入服务端统计口径。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 17. 学习计划

- 原型源码：`得宝APP (1)/src/pages/LearningPlan.tsx`、公共 `TopBar` 和个人页学习计划入口已核对；原型任务状态是静态展示，不存在点击勾选交互。
- 原型截图：`docs/screenshots/figma-learning-plan.png`、`figma-learning-plan-bottom.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-learning-plan.png`；API 36 设备可在一屏展示完整两周计划。
- 关键交互：UIAutomator 已确认 `learning-plan-screen`、`1 / 4`、3.5/0.9 小时、两个周标题和 6 个任务文本全部存在；Jest 固定验证 25% 进度、原型文案、6 个唯一任务节点均无 `onPress`，并验证返回操作。
- 数据与导航：从“我的 → 学习计划”实际进入独立 `LearningPlanScreen`；本周 4 项中仅“观看刑法第8讲”为已完成，下周 2 项均为未完成。
- 已知差异：当前计划和进度仍是原型 Mock，尚未接入云端日程、提醒或跨设备同步。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 18. 错题本

- 原型源码：`得宝APP (1)/src/pages/MistakeBook.tsx`、`src/data.ts`、公共 `TopBar`、`Tag` 和个人页/首页错题本入口已核对。
- 原型截图：`docs/screenshots/figma-mistake-book.png`、`figma-mistake-book-filter.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-mistake-book.png`、`android-mistake-book-filter.png`。
- 关键交互：UIAutomator 已确认 6 个科目筛选项、`共 3 道错题待复习`、`一键重做`、3 张题卡和答错次数；点击“民法”只改变选中态，点击首张题卡进入“错题复习”。Jest 固定验证 3 个唯一题卡、筛选状态、只读一键重做和 `{mode: chapter, title: 错题复习}` 路由参数。
- 数据与导航：错题数据复用 `src/data/objectiveQuestions.ts` 前三题，保留原型中的用户答案 `B/C/B`、正确答案 `D/A/A` 和 `2/1/3` 次答错标记。
- 已知差异：筛选和错题列表仍使用原型 Mock，尚未接入真实错题归档、筛选服务和同步；原型“一键重做”无事件，RN 严格保留只读状态。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 19. 收藏夹

- 原型源码：`得宝APP (1)/src/pages/Favorites.tsx`、公共 `TopBar`、`Tag` 和个人页/首页收藏入口已核对。
- 原型截图：`docs/screenshots/figma-favorites.png`，390x844。
- Android 截图：`docs/screenshots/android-favorites.png`。
- 关键交互：UIAutomator 已确认 `favorites-screen`、`共 4 条收藏`、4 张收藏行和全部标题；点击首项后进入“收藏题目”并显示 `1 / 4`。Jest 固定验证 4 个唯一收藏节点、全部文案及 `{mode: chapter, title: 收藏题目}` 路由参数。
- 数据与导航：保留原型三道题目和一条《民法典》第311条法条收藏；法条项仅显示“民法典”标签，不增加年份。
- 已知差异：当前收藏数据仍为原型 Mock，尚未接入账号级收藏增删和同步；原型所有收藏项统一进入客观题页，RN 按其可达行为复刻。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 20. 法条检索

- 原型源码：`得宝APP (1)/src/pages/LawSearch.tsx`、公共 `TopBar`、`Tag`、首页主观题快捷入口和客观题作答页法条入口已核对。
- 原型截图：`docs/screenshots/figma-law-search.png`、`figma-law-article-sheet.png`、`figma-law-forum.png`、`figma-law-notices.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-law-search.png`、`android-law-search-result.png`、`android-law-article-sheet.png`、`android-law-forum.png`、`android-law-notices.png`、`android-law-notice-expanded.png`。
- 关键交互：UIAutomator 已验证搜索 `311` 返回唯一结果、打开第311条全文、跳转“第311条相关练习”、论坛“答疑求助”筛选和首条公告展开；Jest 使用原型关键词“善意取得”固定搜索结果，并覆盖全文收藏、关联练习路由、6 篇论坛帖子/2 篇筛选结果和 6 条公告。
- 数据与导航：完整迁移 10 条法条、4 条高频法条、8 个科目筛选、5 个有数据的科目分组、6 篇论坛帖子和 6 条公告；关联练习携带 `{mode: chapter, title: 第311条相关练习}` 进入客观题作答。
- 已知差异：当前内容仍为原型 Mock，尚未接入权威法规数据源、版本更新、全文索引、论坛服务和公告后台；原型中发布帖子、论坛点赞/回复及公告收藏没有业务事件，RN 不自行增加交互。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 21. AI 对话

- 原型源码：`得宝APP (1)/src/pages/AIChat.tsx`、公共 `TopBar` 和首页主客观题模式的 AI 答疑入口已核对。
- 原型截图：`docs/screenshots/figma-ai-chat.png`、`figma-ai-chat-loading.png`、`figma-ai-chat-answer.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-ai-chat.png`、`android-ai-chat-loading.png`、`android-ai-chat-answer.png`、`android-ai-chat-keyboard.png`。
- 关键交互：UIAutomator 已验证初始欢迎消息、4 个快捷问题、快捷提问“三点思考”态、完整第311条回答、右上角重置、输入框和发送按钮；标准键盘下输入区保持可见，输入 `test` 并回车后生成通用三步分析。Jest 固定验证快捷问题、思考延迟、定制回答、通用回答、重置和返回。
- 数据与状态：完整迁移善意取得、诉讼时效、合同无效和共同犯罪 4 组定制答案；其他输入使用原型通用“定性→构成要件→结合案情”回答。发送期间隐藏快捷问题并阻止重复提交，0.8-1.3 秒后一次性追加回答，保持原型行为而非旧 RN 的逐字流式输出。
- 已知差异：当前回答仍为原型本地固定逻辑，不构成真实 AI 服务或法律意见；外部模型、鉴权、配额、内容审查、网络错误和中断协议尚未接入。Android 模拟器 Gboard 使用浮动键盘，输入区仍保持可见；除此之外仅有平台状态栏、Safe Area、设备纵向空间、系统键盘和字体栅格化差异。

### 22. 订单列表

- 原型源码：`得宝APP (1)/src/pages/OrderList.tsx`、`src/data.ts`、公共 `TopBar` 和个人页“订单与已购”入口已核对。
- 原型截图：`docs/screenshots/figma-order-list.png`，390x844。
- Android 截图：`docs/screenshots/android-order-list.png`。
- 关键交互：UIAutomator 已从“我的 → 订单与已购”进入页面，确认两条订单的状态、商品名、日期和金额；点击第二条进入“订单详情”。Jest 固定验证两条唯一订单行和 `navigation.navigate('OrderDetail', {orderId: 'o2'})`。
- 数据与导航：新增 `src/data/orders.ts` 保存与原型同源的 `o1/o2` 订单、订单号、商品/课程关联；列表仅展示原型定义的状态、商品名、日期和金额，不保留旧 RN 的订单号副标题、状态胶囊和“实付”前缀。
- 已知差异：订单仍为原型 Mock，尚未接入账号订单分页、刷新和服务端状态；第 23 页订单详情单独验收。除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 23. 订单详情

- 原型源码：`得宝APP (1)/src/pages/OrderDetail.tsx`、`src/data.ts`、公共 `TopBar` 及订单列表入口已核对。
- 原型截图：`docs/screenshots/figma-order-detail-complete.png`、`figma-order-detail-pending.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-order-detail-complete.png`、`android-order-detail-pending.png`。
- 关键交互：UIAutomator 已验证 `o1` 的“已完成/课程权限已自动开通”和 `o2` 的“待开课/课程将于开课日自动激活”；`o2` 点击“查看商品”进入 `product-detail` 并显示法考直播冲刺班与 `¥680`，`o1` 点击“进入课程”进入 `course-detail`。Jest 固定验证两态全部文案、未知订单回退、`{productId: 'p1'/'p4'}` 和 `{courseId: 'c1'}` 导航参数。
- 数据与状态：详情页复用 `src/data/orders.ts` 的两条订单和商品图片；`o1` 展示视频课程、`¥3,980`、`DB2024031200001`、微信支付及双按钮，`o2` 展示直播课程、`¥680`、`DB2024052800078`、微信支付且仅保留查看商品。未知 `orderId` 按原型回退 `o1`。
- 已知差异：订单仍为原型 Mock，不包含真实服务端订单状态、物流、退款或售后流程；除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。

### 24. 用户资料

- 原型源码：`得宝APP (1)/src/pages/UserProfile.tsx`、公共 `TopBar`/`BottomSheet` 和个人页头像/编辑资料入口已核对。
- 原型截图：`docs/screenshots/figma-user-profile.png`、`figma-user-profile-edit.png`、`figma-user-profile-stage.png`、`figma-user-profile-avatar.png`、`figma-user-profile-saved.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-user-profile.png`、`android-user-profile-edit.png`、`android-user-profile-keyboard.png`、`android-user-profile-stage.png`、`android-user-profile-avatar.png`、`android-user-profile-saved.png`。
- 关键交互：UIAutomator 已从“我的 → 编辑资料”进入，确认五项资料、手机号禁用、账号安全三行、文本编辑和计数、5 个备考阶段、6 个头像色板及 2 秒保存提示；昵称输入获得焦点后浮动键盘不遮挡取消/保存。Jest 固定验证默认内容、只读/无事件行、空值回退、阶段选择、六色头像和提示自动消失。
- 数据与状态：初始昵称、手机号、备考目标、阶段和学校与原型一致；文本字段最大 30 字，空白保存保留旧值；头像颜色仅在原型给定的 `#4C4BEA/#C0385A/#3A7A46/#A87000/#1A5FA8/#1A8B8B` 中选择。
- 已知差异：原型资料修改只保存在页面状态，当前同样未接入账号持久化、头像照片上传、密码/微信/注销业务；账号安全三行按原型保留为无事件展示。除此之外仅有平台状态栏、Safe Area、设备纵向空间、系统键盘和字体栅格化差异。

### 25. 设置

- 原型源码：`得宝APP (1)/src/pages/Settings.tsx`、公共 `TopBar`/`Dialog` 和个人页“设置与隐私”入口已核对。
- 原型截图：`docs/screenshots/figma-settings.png`、`figma-settings-logout.png`，均为 390x844。
- Android 截图：`docs/screenshots/android-settings.png`、`android-settings-logout.png`。
- 关键交互：UIAutomator 已从“我的 → 设置与隐私”进入，确认通知/隐私/关于三组 8 项和 `v2.4.1`；8 个设置行均无可点击节点。点击退出登录打开居中 Dialog，取消后仍在设置页，确认后返回 `profile-screen`。Jest 固定验证完整文案、静态行、取消和确认返回。
- 数据与状态：学习提醒只显示“每日学习计划提醒”说明，不保留旧 RN 的通知开关；退出确认只关闭 Dialog 并 `goBack()`，严格对应原型，不调用登出服务或清空本地学习数据。
- 已知差异：所有设置项按原型保持无业务事件，真实账号安全、协议、客服、通知权限和退出登录服务尚未接入；除此之外仅有平台状态栏、Safe Area、设备纵向空间和字体栅格化差异。
