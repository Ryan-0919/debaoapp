# 测试与验证

## 自动检查

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm check
```

当前结果（2026-08-28）：

| 检查 | 结果 | 范围 |
|---|---|---|
| TypeScript | 通过 | App TS/TSX 严格检查 |
| ESLint | 通过 | 全工程 JS/TS/TSX，无 warning |
| Jest | 通过 | 17 suites / 23 tests |
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

五 Tab 烟雾测试已通过：依次点击题库、商城、课程、我的和首页，UIAutomator 分别匹配到“客观题”“精选课程”“我的课程”“得宝 AI 学习助手”“法考学习者”，测试后应用进程保持存活且无崩溃日志。

APK：`android/app/build/outputs/apk/debug/app-debug.apk`。

尚需验证：系统返回、键盘遮挡、AI 流式状态、旋转和小屏设备。当前结果是模拟器验证，不等同于 Android 真机兼容性验收。

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

## 未覆盖范围

真实鉴权、后端错误码、支付 SDK、真实媒体、直播、下载、推送、弱网、升级迁移、性能、崩溃恢复和无障碍读屏尚未接入或验证。每项需要在对应真实 Service/adapter 实现时补测试，不能沿用 Mock 测试作为上线证据。
