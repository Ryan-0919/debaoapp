export type DetailIcon = 'book' | 'clock' | 'gift' | 'headphones' | 'radio' | 'shield' | 'target' | 'trophy' | 'users' | 'zap';

export interface TeacherInfo {title: string; bio: string}
export interface SyllabusItem {label: string; title: string; meta: string}
export interface ProductSyllabus {heading: string; items: SyllabusItem[]; footer: string}
export interface ProductReview {name: string; text: string; stars: number; date: string; tag?: string}
export interface MarketingStat {icon: DetailIcon; value: string; label: string}
export interface MarketingFeature {icon: DetailIcon; color: string; title: string; description: string}
export interface MarketingStep {phase: string; marker: string; title: string; detail: string; color: string}
export interface ProductMarketing {
  heroTitle: string;
  heroSubtitle: string;
  heroColor: string;
  stats: MarketingStat[];
  featureHeading: string;
  features: MarketingFeature[];
  photoCaption: string;
  timelineHeading?: string;
  timeline?: MarketingStep[];
  guarantees: {icon: DetailIcon; color: string; text: string}[];
}

export const teacherInfo: Record<string, TeacherInfo> = {
  得恩教研团队: {title: '法考学习规划与教研团队', bio: '负责诊断题、学习画像和学习计划的持续维护。首次诊断会从基础、时间、执行、理解、记忆和练习习惯等维度了解你的当前状态。'},
  张明远: {title: '法考名师 · 执业律师 · 民法方向', bio: '从事法律职业资格考试辅导16年，民法学博士，曾在头部律所任高级合伙人。授课以框架清晰、案例鲜活著称，善用思维导图串联考点，历届学员客观题通过率显著高于行业均值。'},
  王晓峰: {title: '法考名师 · 主观题专家 · 前高院法官', bio: '曾任省高级人民法院法官12年，深谙裁判思维与答题逻辑。擅长主观题答题规范训练，所带学员主观题均分高出全国平均15+分，批改评语精准到位。'},
  李东明: {title: '法考名师 · 刑法方向 · 双一流高校副教授', bio: '知名高校刑法学副教授，同时担任司法考试辅导机构首席讲师。理论功底深厚，结合真实案例讲授刑法体系，直播课互动氛围好，考前押题命中率极高。'},
  多位名师: {title: '豪华师资阵容 · 各科权威名师联袂', bio: '由张明远（民法）、王晓峰（主观题）、李东明（刑法）等多位顶级名师联合主讲，各科交由最擅长该科的老师授课，实现备考效率最大化。'},
};

export const productSyllabi: Record<string, ProductSyllabus> = {
  'deen-private-coach': {heading: '服务流程', items: [
    {label: '第 1 步', title: '完成首次学习诊断', meta: '约 5 分钟'},
    {label: '第 2 步', title: '生成初始学习画像', meta: '提交后即时生成'},
    {label: '第 3 步', title: '形成个性化学习计划', meta: '依据画像安排'},
    {label: '第 4 步', title: '根据学习数据动态调整', meta: '持续更新'},
  ], footer: '首次诊断只能提交一次，后续通过阶段复测和真实学习数据调整画像'},
  p1: {heading: '课程大纲（节选）', items: [
    {label: '第一章', title: '民法总则与基本原则', meta: '18讲'}, {label: '第二章', title: '物权法精讲', meta: '22讲'},
    {label: '第三章', title: '合同法核心考点', meta: '26讲'}, {label: '第四章', title: '刑法总论与分论', meta: '36讲'},
    {label: '第五章', title: '行政法与行政诉讼法', meta: '24讲'}, {label: '第六章', title: '主观题答题逻辑与规范', meta: '20讲'},
  ], footer: '共420课时，购买后按学习计划逐步解锁'},
  p2: {heading: '课程大纲（节选）', items: [
    {label: '第一章', title: '民法总则、物权、合同精讲', meta: '52讲'}, {label: '第二章', title: '刑法总论与常考分论', meta: '44讲'},
    {label: '第三章', title: '行政法与国家赔偿', meta: '28讲'}, {label: '第四章', title: '民事诉讼法与证据', meta: '32讲'},
    {label: '第五章', title: '刑事诉讼法精讲', meta: '30讲'},
  ], footer: '共220课时，配8次月度直播答疑'},
  p3: {heading: '课程大纲（节选）', items: [
    {label: '第一单元', title: '主观题答题方法论', meta: '8讲'}, {label: '第二单元', title: '民法案例综合分析', meta: '16讲'},
    {label: '第三单元', title: '刑法案例推理与定性', meta: '14讲'}, {label: '第四单元', title: '历年真题精讲与模拟批改', meta: '14讲'},
    {label: '第五单元', title: '冲刺押题与答题规范', meta: '8讲'},
  ], footer: '共60课时，含10次一对一批改'},
  p4: {heading: '直播课程安排', items: [
    {label: '第1–5天', title: '民法高频考点极速串讲', meta: '每晚19:00–21:00'}, {label: '第6–10天', title: '刑法总论+分论押题精讲', meta: '每晚19:00–21:00'},
    {label: '第11–15天', title: '行政法+民诉法重点突破', meta: '每晚19:00–21:00'}, {label: '第16–20天', title: '刑诉法+商法+经济法冲刺', meta: '每晚19:00–21:00'},
    {label: '第21–25天', title: '模拟考试+考场技巧训练', meta: '全天模考+复盘'}, {label: '第26–30天', title: '终极押题+考前答疑', meta: '每晚20:00–22:00'},
  ], footer: '直播后24小时内提供回放，永久可看'},
  p5: {heading: '音频目录（节选）', items: [
    {label: '第01讲', title: '民法基础框架与学习路径', meta: '38分钟'}, {label: '第02讲', title: '自然人的权利能力与行为能力', meta: '42分钟'},
    {label: '第03讲', title: '法人与非法人组织', meta: '35分钟'}, {label: '第15讲', title: '物权概述与善意取得', meta: '54分钟'},
    {label: '第28讲', title: '合同的成立与生效', meta: '48分钟'}, {label: '第45讲', title: '侵权责任法重点考点', meta: '51分钟'},
  ], footer: '共68讲·约52小时，支持离线下载与倍速播放'},
  p6: {heading: '音频目录（节选）', items: [
    {label: '第001讲', title: '【民法】总则篇极速过关', meta: '62分钟'}, {label: '第020讲', title: '【刑法】犯罪构成四要件串讲', meta: '58分钟'},
    {label: '第065讲', title: '【行政法】行政处罚重点梳理', meta: '45分钟'}, {label: '第100讲', title: '【民诉】送达与期间高频考点', meta: '39分钟'},
    {label: '第150讲', title: '【刑诉】证据制度精要', meta: '52分钟'}, {label: '第200讲', title: '【商经法】公司法核心考点', meta: '67分钟'},
  ], footer: '共220讲·约160小时，各科权威名师主讲'},
};

export const productReviews: Record<string, ProductReview[]> = {
  'deen-private-coach': [],
  p1: [
    {name: '法**生', stars: 5, date: '2024-08-15', tag: '全程班学员', text: '全程班内容太全了，从客观题到主观题一条龙，老师讲得系统清晰，配套题库质量也很高，今年终于过了！'},
    {name: '王*明', stars: 5, date: '2024-07-28', tag: '二战上岸', text: '二战选了这套课，和一战相比进步非常明显。张老师民法讲得真的绝，逻辑框架清楚，案例举一反三。'},
    {name: '备考**', stars: 4, date: '2024-07-10', tag: '已购买', text: '整体很满意，主观题批改服务真的有用，老师的修改意见很细致。就是希望客服反应再快一点。'},
  ],
  p2: [
    {name: '林*雨', stars: 5, date: '2024-09-01', tag: '客观题通过', text: '客观题一次性过，这套课功不可没！220课时信息量很大，但节奏很好，配合题库刷题效果超棒。'},
    {name: '小*萱', stars: 5, date: '2024-08-20', tag: '已购买', text: '月度直播答疑非常有价值，能实时问老师考点疑问，比录播课强很多。强烈推荐！'},
    {name: '考研**', stars: 4, date: '2024-08-05', tag: '已购买', text: '课程内容扎实，真题精解部分尤其好。卷一卷二都有涉及，覆盖面很全，性价比高。'},
  ],
  p3: [
    {name: '律**人', stars: 5, date: '2024-10-12', tag: '主观题通过', text: '王老师批改真的太认真了！每次提交作业，反馈都很详细，指出我答题逻辑上的漏洞。主观题最后高分通过！'},
    {name: '老*考', stars: 5, date: '2024-10-05', tag: '三战上岸', text: '三战终于主观题过了，选这门课是最正确的决定。答题模板和规范训练对我帮助很大。'},
    {name: '工作**', stars: 4, date: '2024-09-18', tag: '已购买', text: '一边工作一边备考，这门课帮我快速找到了主观题答题节奏，60课时内容精炼高效。'},
  ],
  p4: [
    {name: '冲**者', stars: 5, date: '2024-09-22', tag: '考前冲刺', text: '考前30天跟着李老师冲刺，感觉很踏实！每晚直播串讲思路清晰，押题命中了好几道！'},
    {name: '上班**', stars: 5, date: '2024-09-18', tag: '已购买', text: '本来只打算听回放，结果每晚直播太精彩忍不住实时看。老师互动很好，气氛活跃，学习效率大幅提升。'},
    {name: '最后**', stars: 4, date: '2024-09-10', tag: '已购买', text: '内容紧凑，30天安排得满满当当。模拟考试质量很高，和真题难度相当。考前心理素质也被练出来了。'},
  ],
  p5: [
    {name: '通**族', stars: 5, date: '2024-06-30', tag: '通勤党', text: '地铁上、健身时全靠这套音频！张老师语速适中，1.5倍速听完整套民法，知识点记得很牢。逐字稿PDF也很赞！'},
    {name: '碎**习', stars: 5, date: '2024-06-15', tag: '已购买', text: '音频质量非常好，无杂音，字幕同步。最爱的功能是知识点速记卡片，睡前看几张效果很好。'},
    {name: '民法**', stars: 4, date: '2024-05-28', tag: '已购买', text: '民法本来是我最弱的科目，听了这套音频后理解清晰多了。建议搭配题库使用，效果更好！'},
  ],
  p6: [
    {name: '全**刷', stars: 5, date: '2024-08-08', tag: '二战学员', text: '有了基础之后用这套全科音频串讲，效率极高！相当于把知识体系又梳理了一遍，覆盖面超全。'},
    {name: '职*人', stars: 5, date: '2024-07-25', tag: '上班族备考', text: '工作党福音！利用碎片时间把220讲刷完，配合配套题库，客观题顺利通过，性价比超高！'},
    {name: '二**战', stars: 4, date: '2024-07-12', tag: '已购买', text: '名师联袂讲课质量有保障，各科老师都是行业顶尖。就是各讲风格略有不同，适应一下就好。'},
  ],
};

const feature = (icon: DetailIcon, color: string, title: string, description: string): MarketingFeature => ({icon, color, title, description});
const guarantee = (icon: DetailIcon, color: string, text: string) => ({icon, color, text});

export const productMarketing: Record<string, ProductMarketing> = {
  'deen-private-coach': {
    heroTitle: '先诊断，再制定学习方案', heroSubtitle: '了解基础、时间与学习习惯\n生成属于你的法考学习画像', heroColor: '#26236F',
    stats: [{icon: 'target', value: '6项', label: '画像维度'}, {icon: 'clock', value: '约5分钟', label: '首次诊断'}, {icon: 'book', value: '1份', label: '专属画像'}, {icon: 'zap', value: '持续', label: '动态调整'}],
    featureHeading: '得恩私教如何工作', features: [
      feature('target', '#4C4BEA', '首次学习诊断', '通过选择题了解你的备考基础、可投入时间和真实学习习惯'),
      feature('book', '#287A65', '生成专属画像', '将诊断结果整理成清晰的能力维度，为后续计划提供依据'),
      feature('zap', '#B56B16', '安排学习节奏', '结合画像分配学习内容和练习强度，减少无效重复'),
      feature('shield', '#B43F5C', '持续动态调整', '后续根据任务完成情况和阶段复测结果更新学习方案'),
    ],
    photoCaption: '个性化诊断 · 专属学习方案',
    timelineHeading: '你的使用路径',
    timeline: [
      {phase: '购买后', marker: '1', title: '完成首次诊断', detail: '按真实情况完成画像选择题', color: '#4C4BEA'},
      {phase: '提交后', marker: '2', title: '查看初始画像', detail: '了解当前优势与需要加强的维度', color: '#287A65'},
      {phase: '学习中', marker: '3', title: '执行专属计划', detail: '按阶段任务推进并记录学习数据', color: '#B56B16'},
      {phase: '阶段末', marker: '4', title: '复测与调整', detail: '根据实际表现更新后续安排', color: '#B43F5C'},
    ],
    guarantees: [guarantee('shield', '#287A65', '诊断结果仅用于学习规划'), guarantee('target', '#4C4BEA', '方案基于真实作答生成'), guarantee('zap', '#B56B16', '学习数据持续参与调整'), guarantee('book', '#B43F5C', '关键阶段提供复测')],
  },
  p1: {
    heroTitle: '一次报名 · 全程无忧', heroSubtitle: '客观题 + 主观题 完整覆盖\n从零基础到高分上岸', heroColor: '#252075',
    stats: [{icon: 'clock', value: '420', label: '课时总量'}, {icon: 'users', value: '2847+', label: '已报名学员'}, {icon: 'trophy', value: '91%', label: '历届通过率'}, {icon: 'book', value: '12000+', label: '配套题目'}],
    featureHeading: '课程四大核心优势', features: [
      feature('target', '#4C4BEA', '系统体系·全科覆盖', '从民法到刑法，行政法到诉讼法，一门课搞定全部科目，不留盲区'),
      feature('zap', '#F5A623', '真题导向·精准押题', '深度解析2014—2023年全部真题，找到命题规律，预判高频考点'),
      feature('book', '#5DA765', '主观批改·逐字精评', '20次一对一批改，王晓峰老师亲自点评，答题逻辑全面提升'),
      feature('shield', '#C0385A', '班主任全程陪跑', '专属班主任制定学习计划，每周打卡督学，考前冲刺不掉队'),
    ], photoCaption: '系统学习 · 高效备考', timelineHeading: '备考全程路线图',
    timeline: [
      {phase: '第一阶段', marker: '一', title: '基础精讲', detail: '全科知识体系搭建，夯实基础', color: '#4C4BEA'},
      {phase: '第二阶段', marker: '二', title: '强化刷题', detail: '章节配套题库，查漏补缺', color: '#7B6CF5'},
      {phase: '第三阶段', marker: '三', title: '真题精解', detail: '历年真题全解析，把握命题规律', color: '#F5A623'},
      {phase: '第四阶段', marker: '四', title: '主观冲刺', detail: '案例精讲+批改，主观题突破', color: '#5DA765'},
      {phase: '第五阶段', marker: '五', title: '模拟上阵', detail: '6套模拟卷，考场状态全模拟', color: '#C0385A'},
    ], guarantees: [guarantee('shield', '#5DA765', '永久回看 · 课程内容永久有效'), guarantee('gift', '#F5A623', '资料齐全 · 讲义题库全套配备'), guarantee('users', '#4C4BEA', '班主任督学 · 全程不掉队'), guarantee('trophy', '#C0385A', '上岸学员社群 · 经验直接传授')],
  },
  p2: {
    heroTitle: '客观题·精英突破', heroSubtitle: '卷一卷二系统精讲\n直播答疑 · 实时互动', heroColor: '#174E87',
    stats: [{icon: 'clock', value: '220', label: '精讲课时'}, {icon: 'users', value: '5312+', label: '已报名学员'}, {icon: 'radio', value: '8次', label: '月度直播'}, {icon: 'book', value: '8000+', label: '配套题目'}],
    featureHeading: '为什么选这门课？', features: [feature('target', '#4C4BEA', '双卷全覆盖', '卷一（民商经济法）+ 卷二（刑行诉讼法）双线并进，不偏科'), feature('radio', '#C0385A', '月度直播答疑', '每月一次直播集中答疑，实时解决学习疑惑，互动感超强'), feature('zap', '#F5A623', '真题全精解', '2019—2023年真题逐题讲解，找到出题逻辑，举一反三'), feature('book', '#5DA765', '章节即时练习', '学完一章立刻刷题，8000+题库覆盖全考点，学以致用')],
    photoCaption: '名师精讲 · 实时互动', guarantees: [guarantee('shield', '#5DA765', '有效期至2024年客观题考试结束'), guarantee('radio', '#4C4BEA', '直播回放 · 错过也能补看'), guarantee('gift', '#F5A623', '讲义配套 · 章节知识点一览'), guarantee('users', '#C0385A', '学员社群 · 互助备考不孤单')],
  },
  p3: {
    heroTitle: '主观题·精讲批改', heroSubtitle: '前高院法官亲授答题逻辑\n10次一对一批改服务', heroColor: '#2E693B',
    stats: [{icon: 'clock', value: '60', label: '精讲课时'}, {icon: 'book', value: '60+', label: '案例精解'}, {icon: 'trophy', value: '10次', label: '一对一批改'}, {icon: 'users', value: '1893+', label: '已报名学员'}],
    featureHeading: '主观题突破核心方法', features: [feature('target', '#3A7A46', '裁判思维·答题逻辑', '王晓峰老师以法官视角解析案例，学会从裁判角度组织答案'), feature('book', '#4C4BEA', '60+真题案例精解', '历年全部主观题逐题精讲，掌握各类型案例的答题框架'), feature('zap', '#F5A623', '答题模板与规范', '总结高分答案的写作范式，让阅卷老师一眼看到得分点'), feature('shield', '#C0385A', '批改+点评精进', '10次作业提交，老师逐字批改，精准指出丢分原因与改进方向')],
    photoCaption: '深度批改 · 精准提分', guarantees: [guarantee('shield', '#5DA765', '10次批改 · 老师逐字点评'), guarantee('target', '#3A7A46', '答题模板 · 规范训练手册'), guarantee('gift', '#F5A623', '押题资料 · 考前重点预测'), guarantee('trophy', '#C0385A', '上岸学员经验帖 · 免费获取')],
  },
  p4: {
    heroTitle: '考前30天·极速冲刺', heroSubtitle: '李东明老师每晚直播带练\n押题命中 · 高效上岸', heroColor: '#8F2444',
    stats: [{icon: 'radio', value: '30天', label: '直播天数'}, {icon: 'clock', value: '60h+', label: '直播总时长'}, {icon: 'users', value: '3102+', label: '已报名学员'}, {icon: 'trophy', value: '3套', label: '模拟试卷'}],
    featureHeading: '直播课核心价值', features: [feature('radio', '#C0385A', '每晚实时直播', '李东明老师亲自主播，考点串讲+实时答疑，不是录播是真·直播'), feature('target', '#4C4BEA', '押题精准命中', '深度研究历年命题规律，考前精准押题，命中率极高'), feature('zap', '#F5A623', '全科极速串讲', '30天覆盖全科核心高频考点，帮你在有限时间内最大化分数'), feature('book', '#5DA765', '模拟考试三套', '全真模拟考试环境，考前查漏补缺，锁定最终得分区间')],
    photoCaption: '实时直播 · 同步冲刺', timelineHeading: '30天冲刺日程一览', timeline: [
      {phase: '第1–10天', marker: '1–10', title: '民法+刑法', detail: '高频考点极速串讲', color: '#4C4BEA'},
      {phase: '第11–20天', marker: '11–20', title: '行政+诉讼法', detail: '重点突破+模拟练习', color: '#C0385A'},
      {phase: '第21–25天', marker: '21–25', title: '商经+其他', detail: '全科收尾冲刺', color: '#F5A623'},
      {phase: '第26–30天', marker: '26–30', title: '押题+答疑', detail: '终极押题+考前心理辅导', color: '#5DA765'},
    ], guarantees: [guarantee('radio', '#C0385A', '直播回放永久可看'), guarantee('shield', '#5DA765', '课程于2024年9月1日开课'), guarantee('gift', '#F5A623', '押题讲义 · 考前极速手册'), guarantee('users', '#4C4BEA', '考生专属群 · 互助答疑')],
  },
  p5: {
    heroTitle: '碎片时间·高效备考', heroSubtitle: '民法音频精讲 68讲·52小时\n通勤路上听出高分', heroColor: '#126A6A',
    stats: [{icon: 'headphones', value: '68讲', label: '音频总数'}, {icon: 'clock', value: '52h', label: '总时长'}, {icon: 'users', value: '4217+', label: '已购学员'}, {icon: 'zap', value: '0.75x–2x', label: '倍速播放'}],
    featureHeading: '音频课四大使用场景', features: [feature('headphones', '#1A8B8B', '通勤路上随时听', '地铁、公交、步行全程可用，把原本碎片化的时间转化为有效备考时长'), feature('zap', '#F5A623', '倍速灵活掌控', '0.75x–2x倍速自由切换，熟悉的内容加速过，重点难点放慢听'), feature('book', '#4C4BEA', '逐字稿同步下载', '每讲配套逐字稿PDF，听完后随时翻阅，加深理解与记忆'), feature('shield', '#5DA765', '离线下载不限流', '提前下载好，无网络环境照常学习，飞机地铁不断课')],
    photoCaption: '随时随地 · 高效利用碎片时间', guarantees: [guarantee('shield', '#5DA765', '永久有效 · 购买后终身可听'), guarantee('gift', '#1A8B8B', '逐字稿PDF · 每讲配套下载'), guarantee('zap', '#F5A623', '知识点速记卡 · 睡前快速复习'), guarantee('shield', '#4C4BEA', '离线下载 · 无网络畅听')],
  },
  p6: {
    heroTitle: '全科串讲·高效过关', heroSubtitle: '220讲·160小时 名师联袂主讲\n适合有基础的二战学员', heroColor: '#244B77',
    stats: [{icon: 'headphones', value: '220讲', label: '音频总数'}, {icon: 'clock', value: '160h', label: '总时长'}, {icon: 'users', value: '2091+', label: '已购学员'}, {icon: 'book', value: '6000+', label: '配套题目'}],
    featureHeading: '名师联袂·各科权威主讲', features: [feature('headphones', '#4C4BEA', '张明远主讲民法', '16年教学经验，民法学博士，框架系统、案例鲜活，民法难题迎刃而解'), feature('headphones', '#C0385A', '李东明主讲刑法', '刑法学副教授，理论深厚，结合真实案例解析犯罪构成，刑法不再难'), feature('headphones', '#3A7A46', '王晓峰主讲主观', '前高院法官，以裁判思维讲答题，主观题答题规范大幅提升'), feature('headphones', '#A87000', '多位老师覆盖诸科', '行政法、诉讼法、商法、经济法均由各科权威名师主讲，无短板')],
    photoCaption: '多位名师 · 全科串讲', guarantees: [guarantee('shield', '#5DA765', '有效期至2025年考试结束'), guarantee('book', '#4C4BEA', '讲义PDF + 思维导图全套'), guarantee('zap', '#F5A623', '倍速播放 + 离线下载'), guarantee('users', '#1A8B8B', '二战学员专属社群答疑')],
  },
};
