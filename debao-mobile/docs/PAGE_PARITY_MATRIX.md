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
| 8 | `src/pages/ObjectiveAnswer.tsx` | `src/screens/questions/ObjectiveAnswerScreen.tsx` | 章节/考试模式、单选作答、解析态、上下题、答题卡 Bottom Sheet、交卷 Dialog | 未开始 |
| 9 | `src/pages/ObjectiveReport.tsx` | `src/screens/questions/ObjectiveReportScreen.tsx` | 成绩概览、题目结果、错题本跳转、返回路径 | 未开始 |
| 10 | `src/pages/ProductDetail.tsx` | `src/screens/commerce/ProductDetailScreen.tsx` | 各商品内容、课程大纲展开/收起、底部购买栏、确认购买 Bottom Sheet、购买跳转 | 未开始 |
| 11 | `src/pages/PurchaseSuccess.tsx` | `src/screens/commerce/PurchaseSuccessScreen.tsx` | 成功信息、课程/订单/首页入口和不同商品参数 | 未开始 |
| 12 | `src/pages/CourseDetail.tsx` | `src/screens/courses/CourseDetailScreen.tsx` | 已购/未购、章节展开、课时状态、视频和商品跳转 | 未开始 |
| 13 | `src/pages/VideoPlayer.tsx` | `src/screens/courses/MediaScreens.tsx` (`VideoPlayerScreen`) | 播放控件显隐、播放/暂停、进度、倍速层、目录/讲义/笔记、章节展开、切课 | 未开始 |
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
