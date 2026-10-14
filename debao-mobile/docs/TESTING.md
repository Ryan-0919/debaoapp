# 测试与验证

## 自动检查

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm check
```

当前结果（2026-09-02）：

| 检查 | 结果 | 范围 |
|---|---|---|
| TypeScript | 通过 | App TS/TSX 严格检查 |
| ESLint | 通过 | 全工程 JS/TS/TSX，无 warning |
| Jest | 通过 | 36 suites / 73 tests |
| Service unit | 通过 | Mock 支付、AI 流式输出 |
| Component | 通过 | AppButton 文案/按压；题库主客观题页内切换且不误导航 |

Harmony `hvigorfile.ts` 不由应用 `tsc` 检查，其类型来自 DevEco/ohpm；ArkTS 与 Hvigor 必须由 Harmony 原生构建验证。

## Bundle 验证

Android：

```powershell
New-Item -ItemType Directory -Force .cache\android-assets | Out-Null
pnpm exec react-native bundle --platform android --dev false --minify true --entry-file index.js --bundle-output .cache\index.android.bundle --assets-dest .cache\android-assets
```

iOS：

```powershell
New-Item -ItemType Directory -Force .cache\ios-assets | Out-Null
pnpm exec react-native bundle --platform ios --dev false --minify true --entry-file index.js --bundle-output .cache\main.jsbundle --assets-dest .cache\ios-assets
```

HarmonyOS：

```powershell
pnpm harmony:link
pnpm harmony:bundle
```

三项均已通过。Harmony 日志确认 4 个标准包被重定向到 RNOH 端口，并生成 Hermes HBC。

## 原生构建与真机

### Android

已在 `Debao_API_36`（Pixel 6、Android API 36、Google APIs x86_64）完成 Debug APK 构建、安装和冷启动。应用进程保持前台，logcat 无 JavaScript/Android Runtime 崩溃，首页视觉检查通过。

首页已按 Figma Make `Home.tsx` 完成 1:1 重做。原型基准：![Figma 首页客观题](screenshots/figma-home-objective.png) ![Figma 首页主观题](screenshots/figma-home-subjective.png)

客观题状态：![Android 首页客观题状态](screenshots/android-home-api36.png)

主观题状态：![Android 首页主观题状态](screenshots/android-home-subjective.png)

右上角分段控件通过 UIAutomator 验证：默认“客观题”的 `selected` 为 true；点击“主观题”后选中态切换，并显示“课程、法条检索、做题记录、收藏夹、批改、AI答疑”六个原型入口。第二张 Banner、第二条公告、公告关闭、社区热帖滚动内容也已验证；切换后应用进程保持存活且无崩溃日志。补充截图见 `android-home-banner-two.png` 和 `android-home-community.png`。

题库页 1:1 原型回归已完成：默认客观题态显示“历年真题、章节练习、民法总则”，主观题态显示“分科真题、历年整卷、2023年主观题”，年份弹层显示“选择年份、2023年、2018年”。三态均在 API 36 模拟器截图确认。

客观题态：![Android 题库客观题](screenshots/android-question-bank-objective.png)

主观题态：![Android 题库主观题](screenshots/android-question-bank-subjective.png)

年份弹层：![Android 题库年份弹层](screenshots/android-question-bank-year-sheet.png)

商城页 1:1 回归已完成：标题、搜索框、分类 Tab、课程类型筛选和 6 个商品行与原型结构一致；UIAutomator 验证筛选组合和空态，Jest 验证商品详情参数。

默认态：![Android 商城](screenshots/android-mall.png)

空态：![Android 商城空态](screenshots/android-mall-empty.png)

课程页 1:1 回归已完成：学习日历与全部课程两态、当前课程、周日历、快捷筛选、时间线、动态周切换、月份选择、待补课调整、加入学习安排及录播/专项/音频/直播分组均与原型结构一致。Jest 覆盖页面状态和类型化导航；UIAutomator 确认下一周变为 8月31日到 9月6日。

原型基准：![Figma 课程日历](screenshots/figma-courses-calendar.png) ![Figma 全部课程](screenshots/figma-courses-all.png)

Android 正常态：![Android 课程日历](screenshots/android-courses-calendar-raw.png) ![Android 全部课程](screenshots/android-courses-all-raw.png)

Android 弹层态：![Android 月份选择](screenshots/android-courses-month-sheet-raw.png) ![Android 调整补课](screenshots/android-courses-reschedule-sheet-raw.png) ![Android 加入安排](screenshots/android-courses-add-sheet-raw.png)

“我的”页 1:1 回归已完成：账号、继续学习、已开课程/本周学习/当前进度、本周重点、学习与内容、课程与服务和应用管理均与原型结构一致。UIAutomator 验证全部菜单节点，Jest 验证 14 个页面操作对应的 12 类路由目标。

原型基准：![Figma 我的](screenshots/figma-profile.png)

Android 首屏与滚动态：![Android 我的](screenshots/android-profile.png) ![Android 我的服务区](screenshots/android-profile-services.png)

主观题选择页 1:1 回归已完成：民法 5 道演示真题、年份/难度组合筛选、清除筛选、筛选空态、其他科目空态和答题参数均与原型行为一致。

原型基准：![Figma 主观题选择](screenshots/figma-subjective-select.png)

Android 默认态与筛选态：![Android 主观题选择](screenshots/android-subjective-select.png) ![Android 主观题筛选](screenshots/android-subjective-select-filter.png)

主观题作答页 1:1 回归已完成：五道民法真题及全部小问来自原型同源数据；题目/小问导航、独立答案、保存时间、字数、上一题/下一问/下一题、法条检索和最终提交 Dialog 均已验证。Hermes 保存时间使用显式 `HH:mm`，避免不同平台区域设置产生 AM/PM 差异。

原型基准：![Figma 主观题作答](screenshots/figma-subjective-answer.png)

Android 默认态、保存态与提交确认态：![Android 主观题作答](screenshots/android-subjective-answer.png) ![Android 主观题保存](screenshots/android-subjective-answer-saved.png) ![Android 主观题提交确认](screenshots/android-subjective-answer-submit-dialog.png)

客观题作答页 1:1 回归已完成：原型 4 道客观题、章节/考试标题、单选状态、上下题、进度、答题卡统计、题号跳转和交卷确认均已迁移。UIAutomator 验证确认交卷后报告正确率参数为实际答题结果。

原型基准：![Figma 客观题作答](screenshots/figma-objective-answer.png) ![Figma 客观题选中](screenshots/figma-objective-answer-selected.png) ![Figma 客观题答题卡](screenshots/figma-objective-answer-card.png) ![Figma 客观题交卷](screenshots/figma-objective-answer-dialog.png)

Android 默认态、答题卡与确认态：![Android 客观题作答](screenshots/android-objective-answer.png) ![Android 客观题答题卡](screenshots/android-objective-answer-card.png) ![Android 客观题交卷](screenshots/android-objective-answer-dialog.png)

客观题报告页 1:1 回归已完成：动态成绩圆环、答对/答错/总题数、两科进度、四道逐题解析和错题本/返回操作均已迁移。组件测试验证原型 75 分基线；Android 流程截图显示本次实际 1/4 对应 25 分，确认路由参数生效。

原型基准：![Figma 客观题报告](screenshots/figma-objective-report.png)

Android 首屏与列表底部：![Android 客观题报告](screenshots/android-objective-report.png) ![Android 客观题报告底部](screenshots/android-objective-report-bottom.png)

商品详情页 1:1 回归已完成：6 商品与商城共用同一目录数据；封面类型态、价格/优惠、课程包含、教师、大纲、交付、营销长页、服务承诺、评价和购买弹层均已迁移。UIAutomator 验证 p1 的 6 项展开、金额、长页末端和 Mock 支付导航；Jest 另覆盖 p4 直播态和 p5 音频态。

原型三态：![Figma 商品详情](screenshots/figma-product-detail.png) ![Figma 商品详情展开](screenshots/figma-product-detail-expanded.png) ![Figma 确认购买](screenshots/figma-product-detail-purchase.png)

Android 首屏、展开、购买和底部：![Android 商品详情](screenshots/android-product-detail.png) ![Android 商品详情展开](screenshots/android-product-detail-expanded.png) ![Android 确认购买](screenshots/android-product-detail-purchase.png) ![Android 商品详情底部](screenshots/android-product-detail-bottom.png)

购买成功页 1:1 回归已完成：自动开通商品显示绿色权益提示和“进入课程”，预约开课商品显示黄色激活提示和“查看我的课程”；查看订单、返回首页及原型商品-课程映射均已迁移。Android 原生验证额外发现并修正了嵌套 Tab 首次落到首页的问题，当前 p4 操作后“课程”Tab 明确为选中态。

原型两态：![Figma 购买成功](screenshots/figma-purchase-success.png) ![Figma 预约开课成功](screenshots/figma-purchase-success-scheduled.png)

Android 两态：![Android 购买成功](screenshots/android-purchase-success.png) ![Android 预约开课成功](screenshots/android-purchase-success-scheduled.png)

课程详情页 1:1 回归已完成：c1 已购态和 c2 未购态、完整章节、完成/当前/未学课时、互斥章节展开、继续学习、具体课时与购买导航均已迁移。Android 首轮对比发现 c2 本地图片不是原型同图，现已替换为原型 Unsplash 图源的受控本地 PNG 并重新构建验证。

原型三态：![Figma 已购课程](screenshots/figma-course-detail-owned.png) ![Figma 当前章节](screenshots/figma-course-detail-current.png) ![Figma 未购课程](screenshots/figma-course-detail-locked.png)

Android 三态：![Android 已购课程](screenshots/android-course-detail-owned.png) ![Android 当前章节](screenshots/android-course-detail-current.png) ![Android 未购课程](screenshots/android-course-detail-locked.png)

UIAutomator 已确认 `course-detail-screen`、`course-owned-state`、`course-locked-state`、`course-lesson-l8`、`course-lesson-l22` 和 `course-buy` 均存在且可点击；点击 c2“去购买”后匹配到 p1 的“2024法考全程班（主客一体·视频精讲）”。

视频播放页 1:1 回归已完成：视频封面、顶部工具、中央/底部播放、进度、前后 10 秒、模拟计时、六档倍速、控件显隐、课程信息、目录、讲义、笔记和切课均与原型状态机对应。Android 首轮发现进度双线、倍速文字换行和菜单被原生容器裁剪，均已在同一视觉修正批次处理并完成最终确认。

原型关键态：![Figma 视频目录](screenshots/figma-video-player-catalog.png) ![Figma 控件隐藏](screenshots/figma-video-player-controls-hidden.png) ![Figma 倍速](screenshots/figma-video-player-speed.png) ![Figma 讲义](screenshots/figma-video-player-handout.png) ![Figma 笔记](screenshots/figma-video-player-notes.png)

Android 关键态：![Android 视频目录](screenshots/android-video-player-catalog.png) ![Android 控件隐藏](screenshots/android-video-player-controls-hidden.png) ![Android 倍速](screenshots/android-video-player-speed.png) ![Android 讲义](screenshots/android-video-player-handout.png) ![Android 笔记](screenshots/android-video-player-notes.png)

UIAutomator 确认倍速层六项 `0.75x/正常/1.25x/1.5x/1.75x/2x` 均完整可点击；实机模拟播放时间从 `5:38` 推进到 `5:58` 后暂停。笔记保存和目录切课由 Jest 固定验证，避免 Android 中文输入法状态影响自动化稳定性。

直播课堂页 1:1 回归已完成：原型当前可观察的“即将直播”状态、动态倒计时、课程图片和标题、老师与预约人数、三条今日安排及底部预约提醒均已迁移。预约后人数从 `6,284` 变为 `6,285`，按钮切换为橙色“已预约开播提醒”。

原型两态：![Figma 直播课堂倒计时](screenshots/figma-live-course-countdown.png) ![Figma 直播课堂已预约](screenshots/figma-live-course-subscribed.png)

Android 两态：![Android 直播课堂倒计时](screenshots/android-live-course-countdown.png) ![Android 直播课堂已预约](screenshots/android-live-course-subscribed.png)

原型 `LiveCourse.tsx` 的 `liveState` 固定为 `countdown`，聊天室、课件、发言和点赞代码在运行时不可达，因此不计入当前页面运行态完成范围。Android UIAutomator 因页面每秒更新倒计时无法进入 idle；预约交互改由前后截图确认，文本、人数和状态切换由 Jest 固定验证。

音频播放页 1:1 回归已完成：c1 课程图片和课时、模拟计时、波形进度、前后 15 秒、循环、六档倍速、播放视觉、同步字幕、时间点笔记、扁平目录和切课均与原型运行态对应。课程列表中原有的错误 `c2` 参数已按原型修正为 `c1`。

原型关键态：![Figma 音频字幕](screenshots/figma-audio-player-transcript.png) ![Figma 音频播放](screenshots/figma-audio-player-playing.png) ![Figma 音频倍速](screenshots/figma-audio-player-speed.png) ![Figma 音频笔记](screenshots/figma-audio-player-notes.png) ![Figma 音频目录](screenshots/figma-audio-player-catalog.png)

Android 关键态：![Android 音频字幕](screenshots/android-audio-player-transcript.png) ![Android 音频播放](screenshots/android-audio-player-playing.png) ![Android 音频倍速](screenshots/android-audio-player-speed.png) ![Android 音频笔记](screenshots/android-audio-player-notes.png) ![Android 音频目录](screenshots/android-audio-player-catalog.png)

UIAutomator 已确认 `audio-player-screen`、c1 第18讲标题、`0:38` 初始时间、三 Tab、循环选中态和 `audio-lesson-l9`；播放实测推进到 `1:28`，点击第19讲后标题变为“不动产登记”。新增笔记和波形精确定位由 Jest 固定验证，避免 Android 中文输入法和坐标取样影响自动化稳定性。

学习报告页 1:1 回归已完成：`4.2 小时`周学习柱图、民事诉讼法 53% 薄弱提示、六科等级和进度、`2,847 / 68% / 28` 做题统计及专项练习入口均与原型一致。

原型首屏与底部：![Figma 学习报告](screenshots/figma-learning-report.png) ![Figma 学习报告底部](screenshots/figma-learning-report-bottom.png)

Android 全页：![Android 学习报告](screenshots/android-learning-report.png)

UIAutomator 已确认六个科目节点和专项练习按钮；点击后 `objective-answer-screen` 标题为“民事诉讼法专项”。Jest 同步固定原型全部统计值与 `{mode: chapter, title: 民事诉讼法专项}` 路由参数。

学习计划页 1:1 回归已完成：`1 / 4` 周进度、预计 3.5 小时/已完成 0.9 小时、本周 4 项和下周 2 项计划、任务时长及唯一完成态均与原型一致；没有保留旧 RN 骨架自行增加的任务勾选交互。

原型全页：![Figma 学习计划](screenshots/figma-learning-plan.png)

Android 全页：![Android 学习计划](screenshots/android-learning-plan.png)

UIAutomator 已从“我的”实际进入页面并确认标题、进度、两个周标题和 6 个任务文本；Jest 固定验证 25% 进度、全部关键文案、任务只读状态和返回操作。

错题本页 1:1 回归已完成：顶部 6 个科目筛选、3 道错题卡、答错次数、我的/正确答案对照和“错题复习”导航均与原型一致；“一键重做”按原型保留为无事件展示。

原型默认态与筛选态：![Figma 错题本](screenshots/figma-mistake-book.png) ![Figma 错题本民法筛选](screenshots/figma-mistake-book-filter.png)

Android 默认态与筛选态：![Android 错题本](screenshots/android-mistake-book.png) ![Android 错题本民法筛选](screenshots/android-mistake-book-filter.png)

UIAutomator 已从“我的”实际进入页面并命中全部筛选项、3 道题卡和答错次数；点击“民法”后仍保留 3 道题，点击首题后进入“错题复习”且显示 `1 / 4`。Jest 固定验证筛选状态、只读重做入口和章节复习路由参数。

收藏夹页 1:1 回归已完成：`共 4 条收藏`、三道题目与一条法条、科目/年份标签、金色星标和统一收藏题目导航均与原型一致。

原型全页：![Figma 收藏夹](screenshots/figma-favorites.png)

Android 全页：![Android 收藏夹](screenshots/android-favorites.png)

UIAutomator 已从“我的”实际进入页面并确认 4 条收藏完整显示；点击首项后进入“收藏题目”且显示 `1 / 4`。Jest 同步固定全部收藏文案和章节练习路由参数。

法条检索页回归已完成：页面只保留法条检索和学习论坛两个 Tab，10 条法条、4 条高频法条、搜索/清空/空态、科目筛选与浏览、全文弹层、收藏、关联练习和论坛筛选均可用。公告已从本页移出，统一在首页公告位和消息通知中展示。

原型关键态：![Figma 法条检索](screenshots/figma-law-search.png) ![Figma 法条全文](screenshots/figma-law-article-sheet.png) ![Figma 学习论坛](screenshots/figma-law-forum.png)

Android 关键态：![Android 法条检索](screenshots/android-law-search.png) ![Android 搜索结果](screenshots/android-law-search-result.png) ![Android 法条全文](screenshots/android-law-article-sheet.png) ![Android 学习论坛](screenshots/android-law-forum.png)

UIAutomator 已从首页主观题模式的“法条检索”入口进入，验证 `311` 唯一搜索结果、第311条全文、收藏与“第311条相关练习”导航及论坛“答疑求助”筛选。Jest 另以原型关键词“善意取得”固定中文检索、全文收藏和 6/2 篇论坛计数，并断言法条页不存在公告 Tab；论坛卡片和发布按钮现已接通业务子页面。

论坛业务专项测试新增 `ForumScreens.test.tsx`：验证详情/评论加载、点赞、收藏、发表评论、举报理由校验与 pending 提交、发布表单分类与成功路由。服务端 `api.test.ts` 另覆盖字段校验、分类和游标分页、收藏 scope、点赞切换、双用户 `canDelete`/收藏隔离、评论作者权限、帖子作者权限、举报幂等/长度校验及软删除后 404。完整规则见 [FORUM.md](FORUM.md)。

AI 对话页 1:1 回归已完成：欢迎消息、右上角重置、4 个快捷问题、输入发送、0.8-1.3 秒三点思考态、4 类定制回答、通用回答、连续对话和自动滚动均与原型一致；旧 RN 页中的“Mock 模式”副标题、提示条和非原型快捷问题已删除。

原型三态：![Figma AI 对话](screenshots/figma-ai-chat.png) ![Figma AI 思考中](screenshots/figma-ai-chat-loading.png) ![Figma AI 回答](screenshots/figma-ai-chat-answer.png)

Android 四态：![Android AI 对话](screenshots/android-ai-chat.png) ![Android AI 思考中](screenshots/android-ai-chat-loading.png) ![Android AI 回答](screenshots/android-ai-chat-answer.png) ![Android AI 键盘](screenshots/android-ai-chat-keyboard.png)

UIAutomator 已从首页 AI 答疑入口进入，命中欢迎语、4 个快捷问题、思考态与完整第311条回答；右上角重置后恢复初始态。Android 标准键盘下输入区保持可见，输入 `test` 后发送按钮启用，回车后得到“第一步：定性 / 第二步：找构成要件 / 第三步：结合案情得结论”。Jest 固定验证定制/通用回答、延迟态、重置和返回。

订单列表页 1:1 回归已完成：两条原型订单的完成/待开课状态、商品名、日期、金额和详情跳转均已迁移，旧 RN 的 2026 订单、状态胶囊、订单号副标题和卡片分组已移除。

原型全页：![Figma 订单列表](screenshots/figma-order-list.png)

Android 全页：![Android 订单列表](screenshots/android-order-list.png)

UIAutomator 已从“我的 → 订单与已购”进入页面，确认两条订单完整显示；点击第二条进入“订单详情”。Jest 固定验证两条唯一订单行和 `{orderId: 'o2'}` 路由参数。订单详情内容属于第 23 页，未在本页提前计入完成。

订单详情页 1:1 回归已完成：`o1` 已完成和 `o2` 待开课两种原型状态、状态说明、商品图片/课程类型、实付金额、订单号、下单时间、支付方式和底部按钮均已迁移。

原型两态：![Figma 已完成订单详情](screenshots/figma-order-detail-complete.png) ![Figma 待开课订单详情](screenshots/figma-order-detail-pending.png)

Android 两态：![Android 已完成订单详情](screenshots/android-order-detail-complete.png) ![Android 待开课订单详情](screenshots/android-order-detail-pending.png)

UIAutomator 已确认 `o1` 的“已完成”、`DB2024031200001` 与“进入课程”，以及 `o2` 的“待开课”、`DB2024052800078` 和唯一“查看商品”按钮。实机点击验证 `o2 → ProductDetail(p4)` 显示法考直播冲刺班和 `¥680`，`o1 → CourseDetail(c1)` 进入 `course-detail`。Jest 固定验证两态内容、未知订单回退和商品/课程导航参数。

用户资料页 1:1 回归已完成：账号资料标题、初始资料、手机号禁用、文本/单选 Bottom Sheet、六色头像选择、账号安全展示和保存反馈均与原型对应；旧 RN 的整页输入表单、目标考试年份和页面级保存按钮已移除。

原型关键态：![Figma 用户资料](screenshots/figma-user-profile.png) ![Figma 文本编辑](screenshots/figma-user-profile-edit.png) ![Figma 阶段选择](screenshots/figma-user-profile-stage.png) ![Figma 头像颜色](screenshots/figma-user-profile-avatar.png) ![Figma 保存反馈](screenshots/figma-user-profile-saved.png)

Android 关键态：![Android 用户资料](screenshots/android-user-profile.png) ![Android 文本编辑](screenshots/android-user-profile-edit.png) ![Android 浮动键盘](screenshots/android-user-profile-keyboard.png) ![Android 阶段选择](screenshots/android-user-profile-stage.png) ![Android 头像颜色](screenshots/android-user-profile-avatar.png) ![Android 保存反馈](screenshots/android-user-profile-saved.png)

UIAutomator 已从“我的 → 编辑资料”进入，命中五项资料、手机号“不可修改”、账号安全三行、昵称输入/字数/取消/保存、5 个备考阶段、6 个头像色板和“已保存修改”；选择“主观题冲刺阶段”后列表即时更新，提示 2 秒后消失。Jest 固定验证全部原型内容、手机号只读、账号安全导航、文本空值回退、阶段和头像选择。

设置页 1:1 回归已完成：通知/隐私/关于三组 8 项、说明、版本号、退出按钮和居中确认 Dialog 均与原型一致；旧 RN 的 Mock 提示、通知开关、功能图标、工程版版本号、清空 session 和跳转首页逻辑已移除。

原型两态：![Figma 设置](screenshots/figma-settings.png) ![Figma 退出确认](screenshots/figma-settings-logout.png)

Android 两态：![Android 设置](screenshots/android-settings.png) ![Android 退出确认](screenshots/android-settings-logout.png)

UIAutomator 已从“我的 → 设置与隐私”进入并确认全部内容；8 个 `settings-row-*` 节点均不可点击。取消退出后 Dialog 消失且仍在设置页；再次打开并确认后返回 `profile-screen`。Jest 固定验证三组内容、无事件约束和确认/取消分支。

消息通知页 1:1 回归已完成：4 条通知的图标、标题、时间、正文和已读/未读视觉均与原型一致；旧 RN 的异步加载、Mock 提示、独立通知卡片和“未读”文字胶囊已移除。

原型全页：![Figma 消息通知](screenshots/figma-notifications.png)

Android 全页：![Android 消息通知](screenshots/android-notifications.png)

UIAutomator 已从“我的 → 消息通知”进入并确认全文，统计 `ROWS=4 / CLICKABLE=0 / UNREAD=2`；Jest 固定验证 4 条原型数据顺序、三类图标、两条未读圆点和静态无事件约束。

批改服务页 1:1 回归已完成：剩余/已用次数、20% 进度、虚线提交入口、已批改/待批改记录、分数和反馈均与原型一致；旧 RN 的 Mock 提示、题目卡、答案输入、图片/PDF 占位和本页提交成功态已移除。

原型全页：![Figma 批改服务](screenshots/figma-grading-service.png)

Android 全页：![Android 批改服务](screenshots/android-grading-service.png)

UIAutomator 已从“我的 → 批改服务”进入，确认 2 条记录均不可点击；点击“提交主观题答案批改”后进入 `subjective-answer-screen`，标题“民法 · 分科真题”、题号 `1 / 5`。Jest 固定验证全部原型数据及 `{questionIndex: 0, subjectName: '民法'}` 导航参数。

做题记录页 1:1 回归已完成：页面标题、`2,847` 累计做题、`68%` 正确率、4 条练习记录、绿色/错误色正确率和右侧箭头均与原型一致；旧 RN 的“答题记录”、Mock 批改状态和 3 条占位记录已移除。

原型全页：![Figma 做题记录](screenshots/figma-question-records.png)

Android 全页：![Android 做题记录](screenshots/android-question-records.png)

UIAutomator 已从“我的 → 做题记录”进入，命中 4 个可点击 `question-record-r*` 节点及全部统计/记录文案；点击首条后进入 `objective-report-screen`，显示 `75 分 / 答对 3 / 答错 1 / 总题数 4`。Jest 固定验证 4 条原型数据及所有记录统一使用 `{correct: 3, total: 4}` 参数。

五 Tab 烟雾测试已通过：依次点击题库、商城、课程、我的和首页，UIAutomator 分别匹配到“客观题”“精选课程”“我的课程”“得宝 AI 学习助手”“法考学习者”，测试后应用进程保持存活且无崩溃日志。

APK：`android/app/build/outputs/apk/debug/app-debug.apk`。

尚需验证：系统返回、真实 AI 服务的流式/错误状态、旋转和小屏设备。当前结果是模拟器验证，不等同于 Android 真机兼容性验收。

### iOS

当前 Windows 未执行原生构建。macOS 需要验证 Pod install、Debug build、Safe Area、键盘、系统返回手势和 iPhone SE/标准/Max 三种尺寸。

### HarmonyOS

当前缺少 DevEco CLI/SDK。安装后需验证 HAP build、四个 HAR link、ArkTS appKey、返回键、Safe Area、AsyncStorage 和 Lucide SVG 渲染。

## 端到端策略

选择支持 React Native 和三端设备驱动的工具前，不引入只支持 Android/iOS 的 E2E 依赖。计划分层：

1. Service contract test：不依赖设备。
2. Component test：状态和无障碍属性。
3. Android/iOS：在 CI 使用设备或模拟器执行主流程。
4. HarmonyOS：通过 hdc/DevEco 测试任务执行同一验收场景。

核心 E2E 场景：

- 五个 Tab 逐一打开且状态不丢失。
- 客观题选项、解析、报告和返回题库。
- 主观题输入、保存草稿、重启恢复、Mock 提交。
- 商品创建 Mock 订单、支付提示、订单详情。
- 课程进入视频/音频/直播并显示真实能力未接入。
- AI 文本逐段生成，发送中禁止重复提交。
- 修改用户资料并重启恢复。
- 登录后更换手机号，原号码与新号码分别验证且验证码不能重放。
- 绑定/解绑微信均完成当前手机号二次验证，身份冲突不覆盖原账号。
- 移除非当前设备后对应 Refresh Token 立即失效；当前设备标识正确。
- 提交注销、重启读取冷静期状态、撤销；到期执行后所有设备退出。

## 账号体系自动化覆盖（2026-08-31）

服务端 `src/test/api.test.ts` 覆盖：未申请验证码拒绝登录、60 秒频控、单次消费、5 次失败上限、Refresh Token 轮换与重放拒绝、手机号双验证码换绑、微信解绑二次验证、登录设备登记、移除设备吊销会话、注销申请/撤销/到期执行。

移动端 `AccountSecurityScreen.test.tsx` 覆盖：身份/设备/注销状态加载、手机号换绑表单、微信解绑、设备移除、注销申请和撤销；`SettingsScreen`、`UserProfileScreen` 保留全部原型文案断言并新增导航断言。

## 未覆盖范围

真实短信/微信/号码认证供应商、支付 SDK、头像对象存储、真实媒体、直播、下载、推送、弱网、升级迁移、性能、崩溃恢复和无障碍读屏尚未联调或验证。每项需要在对应真实 Service/adapter 实现时补测试，不能沿用 local/Mock 测试作为上线证据。
