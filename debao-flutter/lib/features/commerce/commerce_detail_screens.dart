import '../../core/config/app_environment.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/design_tokens.dart';
import '../../data/models.dart';
import '../../data/providers.dart';
import '../courses/course_detail_screens.dart';
import '../../shared/route_back_button.dart';

class _ReviewCopy {
  const _ReviewCopy(this.name, this.tag, this.text, this.date, this.stars);
  final String name;
  final String tag;
  final String text;
  final String date;
  final int stars;
}

class _ProductCopy {
  const _ProductCopy({
    required this.category,
    required this.stage,
    required this.teacher,
    required this.teacherTitle,
    required this.teacherBio,
    required this.includes,
    required this.syllabusHeading,
    required this.syllabus,
    required this.syllabusFooter,
    required this.delivery,
    required this.heroTitle,
    required this.heroSubtitle,
    required this.featureHeading,
    required this.features,
    required this.guarantees,
    required this.stats,
    required this.reviews,
  });

  final String category;
  final String stage;
  final String teacher;
  final String teacherTitle;
  final String teacherBio;
  final List<String> includes;
  final String syllabusHeading;
  final List<String> syllabus;
  final String syllabusFooter;
  final String delivery;
  final String heroTitle;
  final String heroSubtitle;
  final String featureHeading;
  final List<String> features;
  final List<String> guarantees;
  final List<({String value, String label})> stats;
  final List<_ReviewCopy> reviews;
}

const _fallbackProductCopy = _ProductCopy(
  category: '客观题',
  stage: '客观题备考',
  teacher: '张明远',
  teacherTitle: '法考名师 · 执业律师 · 民法方向',
  teacherBio: '从事法律职业资格考试辅导16年，民法学博士，授课以框架清晰、案例鲜活著称。',
  includes: ['体系化视频课程与讲义', '配套题库、法条检索和学习报告', '章节回看与学习进度同步'],
  syllabusHeading: '课程大纲（节选）',
  syllabus: [
    '第一章  民法总则与基本原则  18讲',
    '第二章  物权法精讲  22讲',
    '第三章  合同法核心考点  26讲',
    '第四章  刑法总论与分论  36讲',
    '第五章  行政法与行政诉讼法  24讲',
    '第六章  主观题答题逻辑与规范  20讲'
  ],
  syllabusFooter: '购买后按学习计划逐步解锁',
  delivery: '购买后立即开通，支持多端学习。',
  heroTitle: '客观题·精英突破',
  heroSubtitle: '卷一卷二系统精讲\n直播答疑 · 实时互动',
  featureHeading: '为什么选这门课？',
  features: [
    '双卷全覆盖 · 卷一卷二双线并进',
    '月度直播答疑 · 实时解决学习疑惑',
    '真题全精解 · 找到出题逻辑',
    '章节即时练习 · 学以致用'
  ],
  guarantees: [
    '有效期至2024年客观题考试结束',
    '直播回放 · 错过也能补看',
    '讲义配套 · 章节知识点一览',
    '学员社群 · 互助备考不孤单'
  ],
  stats: [
    (value: '220', label: '精讲课时'),
    (value: '5312+', label: '已报名学员'),
    (value: '8次', label: '月度直播'),
    (value: '8000+', label: '配套题目')
  ],
  reviews: [
    _ReviewCopy('林*雨', '客观题通过', '客观题一次性过，这套课功不可没！220课时信息量很大，但节奏很好，配合题库刷题效果超棒。',
        '2024-09-01', 5),
    _ReviewCopy(
        '小*萱', '已购买', '月度直播答疑非常有价值，能实时问老师考点疑问，比录播课强很多。', '2024-08-20', 5),
  ],
);

const _productCopies = <String, _ProductCopy>{
  'p1': _ProductCopy(
    category: '主客一体',
    stage: '全程备考',
    teacher: '张明远',
    teacherTitle: '法考名师 · 执业律师 · 民法方向',
    teacherBio: '从事法律职业资格考试辅导16年，民法学博士，曾在头部律所任高级合伙人。授课以框架清晰、案例鲜活著称，善用思维导图串联考点。',
    includes: [
      '客观题精讲课（全科共420课时）',
      '客观题章节题库（12,000+题）',
      '历年真题精讲（2014–2023）',
      '主观题案例精讲（80+案例）',
      '主观题批改服务（20次）',
      '考前冲刺模拟卷（6套）',
      '班主任1对1学习规划'
    ],
    syllabusHeading: '课程大纲（节选）',
    syllabus: [
      '第一章  民法总则与基本原则  18讲',
      '第二章  物权法精讲  22讲',
      '第三章  合同法核心考点  26讲',
      '第四章  刑法总论与分论  36讲',
      '第五章  行政法与行政诉讼法  24讲',
      '第六章  主观题答题逻辑与规范  20讲'
    ],
    syllabusFooter: '共420课时，购买后按学习计划逐步解锁',
    delivery: '购买后立即开通，按课程计划解锁课节，有效期至2024年考试结束。',
    heroTitle: '一次报名 · 全程无忧',
    heroSubtitle: '客观题 + 主观题 完整覆盖\n从零基础到高分上岸',
    featureHeading: '课程四大核心优势',
    features: ['系统体系·全科覆盖', '真题导向·精准押题', '主观批改·逐字精评', '班主任全程陪跑'],
    guarantees: [
      '永久回看 · 课程内容永久有效',
      '资料齐全 · 讲义题库全套配备',
      '班主任督学 · 全程不掉队',
      '上岸学员社群 · 经验直接传授'
    ],
    stats: [
      (value: '420', label: '课时总量'),
      (value: '2847+', label: '已报名学员'),
      (value: '91%', label: '历届通过率'),
      (value: '12000+', label: '配套题目')
    ],
    reviews: [
      _ReviewCopy('法**生', '全程班学员',
          '全程班内容太全了，从客观题到主观题一条龙，老师讲得系统清晰，配套题库质量也很高，今年终于过了！', '2024-08-15', 5),
      _ReviewCopy('王*明', '二战上岸',
          '二战选了这套课，和一战相比进步非常明显。张老师民法讲得真的绝，逻辑框架清楚，案例举一反三。', '2024-07-28', 5),
      _ReviewCopy(
          '备考**', '已购买', '整体很满意，主观题批改服务真的有用，老师的修改意见很细致。', '2024-07-10', 4),
    ],
  ),
  'p2': _fallbackProductCopy,
  'p3': _ProductCopy(
    category: '主观题',
    stage: '主观题备考',
    teacher: '王晓峰',
    teacherTitle: '法考名师 · 主观题专家 · 前高院法官',
    teacherBio: '曾任省高级人民法院法官12年，深谙裁判思维与答题逻辑，擅长主观题答题规范训练。',
    includes: ['主观题精讲课（共60课时）', '历年真题案例精解（60+案例）', '主观题批改（10次）', '答题模板与规范训练'],
    syllabusHeading: '课程大纲（节选）',
    syllabus: [
      '第一单元  主观题答题方法论  8讲',
      '第二单元  民法案例综合分析  16讲',
      '第三单元  刑法案例推理与定性  14讲',
      '第四单元  历年真题精讲与模拟批改  14讲',
      '第五单元  冲刺押题与答题规范  8讲'
    ],
    syllabusFooter: '共60课时，含10次一对一批改',
    delivery: '购买后开通，主观题考试前两个月起按计划推送课程，有效期至2024年主观题考试结束。',
    heroTitle: '主观题·精讲批改',
    heroSubtitle: '前高院法官亲授答题逻辑\n10次一对一批改服务',
    featureHeading: '主观题突破核心方法',
    features: ['裁判思维·答题逻辑', '60+真题案例精解', '答题模板与规范', '批改+点评精进'],
    guarantees: [
      '10次批改 · 老师逐字点评',
      '答题模板 · 规范训练手册',
      '押题资料 · 考前重点预测',
      '上岸学员经验帖 · 免费获取'
    ],
    stats: [
      (value: '60', label: '精讲课时'),
      (value: '60+', label: '案例精解'),
      (value: '10次', label: '一对一批改'),
      (value: '1893+', label: '已报名学员')
    ],
    reviews: [
      _ReviewCopy('律**人', '主观题通过', '王老师批改真的太认真了！每次提交作业，反馈都很详细，主观题最后高分通过！',
          '2024-10-12', 5),
      _ReviewCopy('老*考', '三战上岸', '答题模板和规范训练对我帮助很大。', '2024-10-05', 5)
    ],
  ),
  'p4': _ProductCopy(
    category: '客观题',
    stage: '冲刺阶段',
    teacher: '李东明',
    teacherTitle: '法考名师 · 刑法方向 · 双一流高校副教授',
    teacherBio: '知名高校刑法学副教授，理论功底深厚，结合真实案例讲授刑法体系，直播互动氛围好。',
    includes: ['直播冲刺课（30天×2小时）', '模拟试卷（3套）', '直播回放（永久可看）'],
    syllabusHeading: '直播课程安排',
    syllabus: [
      '第1–5天  民法高频考点极速串讲  每晚19:00–21:00',
      '第6–10天  刑法总论+分论押题精讲  每晚19:00–21:00',
      '第11–15天  行政法+民诉法重点突破  每晚19:00–21:00',
      '第16–20天  刑诉法+商法+经济法冲刺  每晚19:00–21:00',
      '第21–25天  模拟考试+考场技巧训练  全天模考+复盘',
      '第26–30天  终极押题+考前答疑  每晚20:00–22:00'
    ],
    syllabusFooter: '直播后24小时内提供回放，永久可看',
    delivery: '课程于2024年9月1日开课，购买后自动激活直播权限。',
    heroTitle: '考前30天·极速冲刺',
    heroSubtitle: '李东明老师每晚直播带练\n押题命中 · 高效上岸',
    featureHeading: '直播课核心价值',
    features: ['每晚实时直播', '押题精准命中', '全科极速串讲', '模拟考试三套'],
    guarantees: ['直播回放永久可看', '课程于2024年9月1日开课', '押题讲义 · 考前极速手册', '考生专属群 · 互助答疑'],
    stats: [
      (value: '30天', label: '直播天数'),
      (value: '60h+', label: '直播总时长'),
      (value: '3102+', label: '已报名学员'),
      (value: '3套', label: '模拟试卷')
    ],
    reviews: [
      _ReviewCopy('冲**者', '考前冲刺', '考前30天跟着李老师冲刺，感觉很踏实！', '2024-09-22', 5),
      _ReviewCopy('上班**', '已购买', '每晚直播串讲思路清晰，互动很好。', '2024-09-18', 5)
    ],
  ),
  'p5': _ProductCopy(
    category: '客观题',
    stage: '客观题备考',
    teacher: '张明远',
    teacherTitle: '法考名师 · 执业律师 · 民法方向',
    teacherBio: '民法学博士，授课框架系统、案例鲜活，适合利用碎片时间高效学习。',
    includes: [
      '民法音频精讲（共68讲·约52小时）',
      '每讲逐字稿PDF',
      '知识点速记卡片',
      '倍速播放（0.75x–2x）',
      '离线下载（手机端）'
    ],
    syllabusHeading: '音频目录（节选）',
    syllabus: [
      '第01讲  民法基础框架与学习路径  38分钟',
      '第02讲  自然人的权利能力与行为能力  42分钟',
      '第03讲  法人与非法人组织  35分钟',
      '第15讲  物权概述与善意取得  54分钟',
      '第28讲  合同的成立与生效  48分钟',
      '第45讲  侵权责任法重点考点  51分钟'
    ],
    syllabusFooter: '共68讲·约52小时，支持离线下载与倍速播放',
    delivery: '购买后立即开通，永久有效，支持离线下载。',
    heroTitle: '碎片时间·高效备考',
    heroSubtitle: '民法音频精讲 68讲·52小时\n通勤路上听出高分',
    featureHeading: '音频课四大使用场景',
    features: ['通勤路上随时听', '倍速灵活掌控', '逐字稿同步下载', '离线下载不限流'],
    guarantees: [
      '永久有效 · 购买后终身可听',
      '逐字稿PDF · 每讲配套下载',
      '知识点速记卡 · 睡前快速复习',
      '离线下载 · 无网络畅听'
    ],
    stats: [
      (value: '68讲', label: '音频总数'),
      (value: '52h', label: '总时长'),
      (value: '4217+', label: '已购学员'),
      (value: '0.75x–2x', label: '倍速播放')
    ],
    reviews: [
      _ReviewCopy('通**族', '通勤党', '地铁上、健身时全靠这套音频！逐字稿PDF也很赞！', '2024-06-30', 5),
      _ReviewCopy('碎**习', '已购买', '音频质量非常好，知识点速记卡片睡前看效果很好。', '2024-06-15', 5)
    ],
  ),
  'p6': _ProductCopy(
    category: '主客一体',
    stage: '全程备考',
    teacher: '多位名师',
    teacherTitle: '豪华师资阵容 · 各科权威名师联袂',
    teacherBio: '由张明远、王晓峰、李东明等多位名师联合主讲，各科交由最擅长该科的老师授课。',
    includes: [
      '全科音频精讲（共220讲·约160小时）',
      '配套章节题库（6,000+题）',
      '逐讲讲义PDF',
      '知识框架思维导图',
      '倍速播放与离线下载'
    ],
    syllabusHeading: '音频目录（节选）',
    syllabus: [
      '第001讲  【民法】总则篇极速过关  62分钟',
      '第020讲  【刑法】犯罪构成四要件串讲  58分钟',
      '第065讲  【行政法】行政处罚重点梳理  45分钟',
      '第100讲  【民诉】送达与期间高频考点  39分钟',
      '第150讲  【刑诉】证据制度精要  52分钟',
      '第200讲  【商经法】公司法核心考点  67分钟'
    ],
    syllabusFooter: '共220讲·约160小时，各科权威名师主讲',
    delivery: '购买后48小时内开通，有效期至2025年考试结束。',
    heroTitle: '全科串讲·高效过关',
    heroSubtitle: '220讲·160小时 名师联袂主讲\n适合有基础的二战学员',
    featureHeading: '名师联袂·各科权威主讲',
    features: ['张明远主讲民法', '李东明主讲刑法', '王晓峰主讲主观', '多位老师覆盖诸科'],
    guarantees: [
      '有效期至2025年考试结束',
      '讲义PDF + 思维导图全套',
      '倍速播放 + 离线下载',
      '二战学员专属社群答疑'
    ],
    stats: [
      (value: '220讲', label: '音频总数'),
      (value: '160h', label: '总时长'),
      (value: '2091+', label: '已购学员'),
      (value: '6000+', label: '配套题目')
    ],
    reviews: [
      _ReviewCopy('全**刷', '二战学员', '有了基础之后用这套全科音频串讲，效率极高！', '2024-08-08', 5),
      _ReviewCopy('职*人', '上班族备考', '工作党福音，覆盖面超全。', '2024-07-25', 5)
    ],
  ),
};

const _featureIcons = <IconData>[
  Icons.track_changes_outlined,
  Icons.bolt_outlined,
  Icons.menu_book_outlined,
  Icons.shield_outlined,
];

const _featureIconColors = <Color>[
  DebaoColors.brand,
  Color(0xFFF5A623),
  Color(0xFF5DA765),
  Color(0xFFC0385A),
];

const _featureDescriptions = <String, List<String>>{
  'p1': [
    '从民法到刑法，行政法到诉讼法，一门课搞定全部科目，不留盲区',
    '深度解析2014—2023年全部真题，找到命题规律，预判高频考点',
    '20次一对一批改，王晓峰老师亲自点评，答题逻辑全面提升',
    '专属班主任制定学习计划，每周打卡督学，考前冲刺不掉队',
  ],
  'p2': [
    '卷一（民商经济法）+卷二（刑行诉讼法）双线并进，不偏科',
    '每月一次直播集中答疑，实时解决学习疑惑，互动感更强',
    '2019—2023年真题逐题讲解，找到出题逻辑，举一反三',
    '学完一章立刻刷题，8000+题库覆盖全考点，学以致用',
  ],
  'p3': [
    '王晓峰老师以法官视角解析案例，学会从裁判角度组织答案',
    '历年主观题逐题精讲，掌握各类型案例的答题框架',
    '总结高分答案写作范式，让阅卷老师一眼看到得分点',
    '10次作业提交，老师逐字批改，精准指出丢分原因与改进方向',
  ],
  'p4': [
    '李东明老师亲自主播，考点串讲与实时答疑，直播互动不缺席',
    '深度研究历年命题规律，考前精准押题，锁定高频考点',
    '30天覆盖全科核心考点，在有限时间内最大化得分',
    '全真模拟考试环境，考前查漏补缺，锁定最终得分区间',
  ],
  'p5': [
    '通勤、健身等碎片时间随时听，学习计划更容易坚持',
    '0.75x 到 2x 倍速自由切换，按自己的节奏掌握重点',
    '每讲配套逐字稿 PDF，听读同步，重点内容随手标记',
    '支持离线下载，无网络也能畅听完整课程',
  ],
  'p6': [
    '张明远主讲民法，16年教学经验，框架系统、案例鲜活',
    '李东明主讲刑法，理论深厚，结合真实案例解析犯罪构成',
    '王晓峰主讲主观题，以裁判思维讲答题，规范大幅提升',
    '行政法、诉讼法、商法、经济法由各科名师主讲，无短板',
  ],
};

const _heroGradients = <String, ({Color start, Color end, Color accent})>{
  'p1': (
    start: Color(0xFF1A1870),
    end: Color(0xFF7B6CF5),
    accent: DebaoColors.brand
  ),
  'p2': (
    start: Color(0xFF0F3460),
    end: Color(0xFF4C4BEA),
    accent: DebaoColors.brand
  ),
  'p3': (
    start: Color(0xFF1A3A22),
    end: Color(0xFF5DA765),
    accent: Color(0xFF3A7A46)
  ),
  'p4': (
    start: Color(0xFF5A0A28),
    end: Color(0xFFE86B8A),
    accent: Color(0xFFC0385A)
  ),
  'p5': (
    start: Color(0xFF0E4B4B),
    end: Color(0xFF3BA4A4),
    accent: Color(0xFF1A8B8B)
  ),
  'p6': (
    start: Color(0xFF24315F),
    end: Color(0xFF667BD6),
    accent: DebaoColors.brand
  ),
};

const _localSold = <String, String>{
  'p1': '2,847',
  'p2': '5,312',
  'p3': '1,893',
  'p4': '3,102',
  'p5': '4,217',
  'p6': '2,091',
};

// The RC product route carries only the product id.  Keep the local fixture
// fields in sync with `debao-mobile/src/data.ts` instead of rendering the
// generic constructor defaults (`课程商品`/`¥1980`) on a deep link.
const _localProductNames = <String, String>{
  'p1': '2024法考全程班（主客一体·视频精讲）',
  'p2': '2024客观题精英班（视频+直播）',
  'p3': '2024主观题冲刺班（精讲+批改）',
  'p4': '法考直播冲刺班（考前30天）',
  'p5': '民法音频精讲（通勤随听版）',
  'p6': '法考全科音频串讲班',
};

const _localProductBriefs = <String, String>{
  'p1': '覆盖客观题全科+主观题冲刺，名师全程讲授，配套题库、模拟卷和主观题批改服务。',
  'p2': '系统精讲客观题全科知识点，覆盖卷一卷二，配套章节练习和历年真题解析。',
  'p3': '主观题专项突破，以历年真题案例为核心，精讲答题逻辑与规范，配套批改服务。',
  'p4': '考前30天密集直播冲刺，押题预测、重点串讲，配合模拟考试查漏补缺。',
  'p5': '全程音频授课，利用碎片时间随时随地听课，配套逐字稿与知识点卡片，通勤路上高效备考。',
  'p6': '名师精讲全科核心考点，音频形式高效输出，配合题库随时检验，适合已有基础的二战考生。',
};

const _localProductPrices = <String, (String, String)>{
  'p1': ('3,980', '5,200'),
  'p2': ('1,980', '2,800'),
  'p3': ('1,280', '1,680'),
  'p4': ('680', '880'),
  'p5': ('398', '598'),
  'p6': ('880', '1,280'),
};

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({
    super.key,
    required this.name,
    required this.brief,
    required this.price,
    required this.originalPrice,
    required this.coverColor,
    required this.icon,
    this.productId,
    this.remoteEnabled = remoteDataDefault,
    this.remoteProduct,
    this.resolved = false,
    this.remoteError,
  });

  final String name, brief, price, originalPrice;
  final Color coverColor;
  final IconData icon;
  final String? productId;
  final bool remoteEnabled;
  final Product? remoteProduct;
  final bool resolved;
  final Object? remoteError;

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _RemoteProductDetailBody extends ConsumerWidget {
  const _RemoteProductDetailBody({required this.productId});
  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remote = ref.watch(productProvider(productId));
    if (remote.isLoading && !remote.hasValue) {
      return _productStatusScaffold(const Center(
          child: CircularProgressIndicator(key: ValueKey('product-loading'))));
    }
    if (remote.hasError && !remote.hasValue) {
      return _productStatusScaffold(Center(
          child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.cloud_off_outlined,
              color: DebaoColors.muted, size: 32),
          const SizedBox(height: 10),
          const Text('商品详情暂不可用',
              style: TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text('${remote.error}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(color: DebaoColors.muted, fontSize: 11)),
          const SizedBox(height: 12),
          OutlinedButton.icon(
              key: const ValueKey('product-retry'),
              onPressed: () => ref.invalidate(productProvider(productId)),
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('重试')),
        ]),
      )));
    }
    final product = remote.valueOrNull;
    if (product == null || product.name.trim().isEmpty) {
      return _productStatusScaffold(const _ProductMissingState());
    }
    final original = product.originalPrice ?? product.price;
    return ProductDetailScreen(
      name: product.name,
      brief: product.brief?.trim().isNotEmpty == true
          ? product.brief!.trim()
          : (product.benefits.isEmpty ? '商品简介暂未提供' : product.benefits.first),
      price: _numberText(product.price),
      originalPrice: _numberText(original),
      coverColor: _productColor(product.accent),
      icon: Icons.menu_book_outlined,
      productId: product.id.isEmpty ? productId : product.id,
      remoteProduct: product,
      remoteEnabled: true,
      resolved: true,
      remoteError: remote.hasError ? remote.error : null,
    );
  }
}

Widget _productStatusScaffold(Widget body) => Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('商品详情'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0),
      body: body,
    );

class _ProductMissingState extends StatelessWidget {
  const _ProductMissingState();

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.inventory_2_outlined,
                color: DebaoColors.muted, size: 34),
            SizedBox(height: 10),
            Text('商品不存在或已下架',
                style: TextStyle(
                    color: DebaoColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
            SizedBox(height: 5),
            Text('请返回商城选择其他商品。',
                style: TextStyle(color: DebaoColors.muted, fontSize: 12)),
          ]),
        ),
      );
}

String _numberText(num value) => _thousands(
    value % 1 == 0 ? value.toStringAsFixed(0) : value.toStringAsFixed(2));

String _thousands(String value) {
  final parts = value.split('.');
  final integer = parts.first;
  final sign = integer.startsWith('-') ? '-' : '';
  final digits = sign.isEmpty ? integer : integer.substring(1);
  final grouped =
      digits.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',');
  return '$sign$grouped${parts.length > 1 ? '.${parts[1]}' : ''}';
}

Color _productColor(String? value) {
  if (value == null) return DebaoColors.brand;
  final parsed = int.tryParse(value.replaceFirst('#', ''), radix: 16);
  return parsed == null ? DebaoColors.brand : Color(0xFF000000 | parsed);
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  bool syllabusExpanded = false;
  bool purchaseBusy = false;
  bool remoteErrorDismissed = false;

  @override
  Widget build(BuildContext context) {
    if (widget.remoteEnabled && !widget.resolved) {
      final id = widget.productId;
      if (id == null || id.isEmpty) {
        return _productStatusScaffold(const _ProductMissingState());
      }
      return ProviderScope(child: _RemoteProductDetailBody(productId: id));
    }
    return _buildStatic(context);
  }

  String get productKey {
    final id = widget.productId?.trim();
    if (id != null && _productCopies.containsKey(id)) return id;
    final name = widget.name;
    if (name.contains('全科音频')) return 'p6';
    if (name.contains('民法音频')) return 'p5';
    if (name.contains('主观题')) return 'p3';
    if (name.contains('直播')) return 'p4';
    if (name.contains('全程班')) return 'p1';
    return 'p2';
  }

  _ProductCopy get copy => _productCopies[productKey] ?? _fallbackProductCopy;

  String get displayName => widget.remoteProduct == null
      ? (_localProductNames[productKey] ?? widget.name)
      : widget.name;

  String get displayBrief => widget.remoteProduct == null
      ? (_localProductBriefs[productKey] ?? widget.brief)
      : widget.brief;

  String get displayPrice => widget.remoteProduct == null
      ? (_localProductPrices[productKey]?.$1 ?? widget.price)
      : widget.price;

  String get displayOriginalPrice => widget.remoteProduct == null
      ? (_localProductPrices[productKey]?.$2 ?? widget.originalPrice)
      : widget.originalPrice;

  String get image {
    if (widget.remoteProduct == null) {
      switch (productKey) {
        case 'p1':
          return 'assets/images/home-library.png';
        case 'p2':
          return 'assets/images/home-office.png';
        case 'p3':
          return 'assets/images/course-subjective.jpg';
        case 'p4':
          return 'assets/images/product-live.jpg';
        case 'p5':
          return 'assets/images/product-audio-civil.jpg';
        case 'p6':
          return 'assets/images/product-audio-all.jpg';
      }
    }
    if (displayName.contains('音频'))
      return 'assets/images/product-audio-all.png';
    if (displayName.contains('主观'))
      return 'assets/images/course-subjective.jpg';
    if (displayName.contains('刑法'))
      return 'assets/images/course-criminal-law.png';
    if (displayName.contains('直播')) return 'assets/images/product-live.png';
    return 'assets/images/course-civil-law.jpg';
  }

  String get category {
    final remote = widget.remoteProduct?.category.trim();
    return widget.remoteEnabled ? (remote ?? '') : copy.category;
  }

  String get type {
    final remoteType = widget.remoteProduct?.type?.trim();
    if (remoteType != null && remoteType.isNotEmpty) {
      if (remoteType.contains('音频') || remoteType.toLowerCase() == 'audio') {
        return '音频课程';
      }
      if (remoteType.contains('直播') || remoteType.toLowerCase() == 'live') {
        return '直播课程';
      }
      if (remoteType.contains('书')) return '书籍';
      if (remoteType.contains('视频') || remoteType.toLowerCase() == 'video') {
        return '视频课程';
      }
      return remoteType;
    }
    final category = widget.remoteProduct?.category.toLowerCase() ?? '';
    final name = displayName;
    if (name.contains('音频') || category.contains('audio')) return '音频课程';
    if (name.contains('直播') || category.contains('live')) return '直播课程';
    return '视频课程';
  }

  String get stage {
    final remote = widget.remoteProduct?.stage?.trim();
    return widget.remoteEnabled ? (remote ?? '未配置适用阶段') : copy.stage;
  }

  Color get typeColor => type == '音频课程'
      ? const Color(0xFF1A8B8B)
      : type == '直播课程'
          ? const Color(0xFFC0385A)
          : DebaoColors.brand;
  Color get typeBg => type == '音频课程'
      ? DebaoColors.celadon
      : type == '直播课程'
          ? DebaoColors.rose
          : DebaoColors.brandLight;

  List<String> get includes => widget.remoteProduct?.benefits.isNotEmpty == true
      ? widget.remoteProduct!.benefits
      : widget.remoteEnabled ? const [] : copy.includes;

  List<String> get syllabus => copy.syllabus;

  Widget _buildStatic(BuildContext context) {
    return Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
        title: const SizedBox.shrink(),
        leading: const DebaoRouteBackButton(),
        actions: [
          if (!widget.remoteEnabled)
            const Text('沙盒商品',
                style: TextStyle(fontSize: 0, color: Colors.transparent)),
          IconButton(
              tooltip: '分享商品',
              onPressed: () => ScaffoldMessenger.of(context)
                  .showSnackBar(const SnackBar(content: Text('分享功能将在登录后启用'))),
              icon: const Icon(Icons.share_outlined, size: 19))
        ],
        backgroundColor: DebaoColors.surface,
        surfaceTintColor: DebaoColors.surface,
        elevation: 0,
        bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Divider(height: 1, color: DebaoColors.line)),
      ),
      body: Column(children: [
        if (widget.remoteError != null && !remoteErrorDismissed)
          MaterialBanner(
              content: const Text('服务暂不可用，当前保留已加载商品'),
              leading: const Icon(Icons.cloud_off_outlined),
              actions: [
                TextButton(
                    onPressed: () =>
                        setState(() => remoteErrorDismissed = true),
                    child: const Text('知道了'))
              ]),
        Expanded(
            child: ListView(
          padding: EdgeInsets.zero,
          children: [
            if (!widget.remoteEnabled)
              const Opacity(
                  opacity: 0, child: SizedBox(height: 0, child: Text('沙盒商品'))),
            _cover(),
            _summary(),
            _section('课程包含', includes.map((item) => _check(item)).toList()),
            if (widget.remoteProduct == null) ...[
              _teacher(),
              _syllabus(),
              _detailPanels(),
            ] else
              _unavailableSection('讲师与课程大纲', '服务端暂未提供该商品的详细内容'),
            _section('交付方式', [
              Text(
                  widget.remoteProduct == null
                      ? copy.delivery
                      : '交付方式以服务端订单状态和权益记录为准',
                  style: const TextStyle(
                      color: DebaoColors.body, fontSize: 13, height: 1.5))
            ]),
            if (widget.remoteProduct == null)
              _reviews()
            else
              _unavailableSection('学员评价', '服务端暂未提供评价数据'),
            const SizedBox(height: 92),
          ],
        )),
        _purchaseBar(context),
      ]),
    );
  }

  Widget _cover() => Stack(children: [
        SizedBox(
            height: 210,
            width: double.infinity,
            child: widget.remoteEnabled
                ? ColoredBox(color: widget.coverColor,
                    child: Icon(widget.icon, color: Colors.white, size: 56))
                : Image.asset(image,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => ColoredBox(
                    color: widget.coverColor,
                    child: Icon(widget.icon, color: Colors.white, size: 56)))),
        if (type == '音频课程')
          const Positioned.fill(
              child: Center(
                  child: CircleAvatar(
                      radius: 32,
                      backgroundColor: Color(0x66505050),
                      child: Icon(Icons.headphones,
                          color: Colors.white, size: 32)))),
        if (type == '直播课程')
          Positioned(
              left: 16,
              bottom: 12,
              child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                      color: const Color(0xE6C0385A),
                      borderRadius: BorderRadius.circular(20)),
                  child: const Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.circle, color: Colors.white, size: 8),
                    SizedBox(width: 6),
                    Text('直播课程',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600))
                  ]))),
      ]);

  Widget _summary() => Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Wrap(spacing: 6, runSpacing: 6, children: [
            _tag(category, DebaoColors.brandLight, DebaoColors.brand),
            _tag(type, typeBg, typeColor),
            _tag(stage, DebaoColors.page, DebaoColors.muted)
          ]),
          const SizedBox(height: 11),
          Text(displayName,
              style: const TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 17,
                  height: 1.3,
                  fontWeight: FontWeight.w700)),
          const SizedBox(height: 7),
          Text(displayBrief,
              style: const TextStyle(
                  color: DebaoColors.body, fontSize: 13, height: 1.5)),
          const SizedBox(height: 13),
          Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('¥$displayPrice',
                style: const TextStyle(
                    color: DebaoColors.brand,
                    fontSize: 24,
                    fontWeight: FontWeight.w700)),
            const SizedBox(width: 8),
            Text('¥$displayOriginalPrice',
                style: const TextStyle(
                    color: Color(0xFFC0C5D0),
                    fontSize: 14,
                    decoration: TextDecoration.lineThrough)),
            const SizedBox(width: 8),
            _tag('省¥${_saving()}', DebaoColors.error, Colors.white),
          ]),
          const SizedBox(height: 5),
          Row(children: [
            Text(
                widget.remoteProduct == null
                    ? '已售 ${_localSold[productKey] ?? '0'} 份'
                    : '已售 ${widget.remoteProduct!.sold} 份',
                style: const TextStyle(color: DebaoColors.muted, fontSize: 12)),
            const SizedBox(width: 16),
            if (widget.remoteProduct == null ||
                widget.remoteProduct?.rating != null) ...[
              ...List.generate(
                  5,
                  (_) => const Icon(Icons.star,
                      color: Color(0xFFF5A623), size: 12)),
              const SizedBox(width: 4),
              Text(widget.remoteProduct?.rating?.toStringAsFixed(1) ?? '4.9',
                  style:
                      const TextStyle(color: DebaoColors.muted, fontSize: 11))
            ] else
              const Text('暂无评分',
                  style: TextStyle(color: DebaoColors.muted, fontSize: 11))
          ]),
        ]),
      );

  String _saving() {
    final p = double.tryParse(displayPrice.replaceAll(',', '')) ?? 0;
    final o = double.tryParse(displayOriginalPrice.replaceAll(',', '')) ?? p;
    return _thousands((o - p).toStringAsFixed(0));
  }

  Widget _unavailableSection(String title, String message) => Container(
        color: Colors.white,
        margin: const EdgeInsets.only(top: 12),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: const TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 15,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Text(message,
              style: const TextStyle(color: DebaoColors.muted, fontSize: 12)),
        ]),
      );

  Widget _teacher() => Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('主讲老师',
            style: TextStyle(
                color: DebaoColors.ink,
                fontSize: 15,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          CircleAvatar(
              radius: 28,
              backgroundColor: DebaoColors.brand,
              child: Text(
                  copy.teacher == '多位名师' ? '多' : copy.teacher.characters.first,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700))),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(copy.teacher,
                    style: const TextStyle(
                        color: DebaoColors.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(copy.teacherTitle,
                    style: TextStyle(color: typeColor, fontSize: 11)),
                const SizedBox(height: 8),
                Text(copy.teacherBio,
                    style: const TextStyle(
                        color: DebaoColors.body, fontSize: 13, height: 1.5))
              ]))
        ])
      ]));

  Widget _syllabus() {
    final shown = syllabusExpanded ? syllabus : syllabus.take(4).toList();
    return Container(
        color: Colors.white,
        margin: const EdgeInsets.only(top: 12),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(copy.syllabusHeading,
              style: const TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 15,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ...shown.asMap().entries.map((entry) {
            final parts = _splitSyllabus(entry.value);
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 9),
              decoration: BoxDecoration(
                  border: entry.key < shown.length - 1
                      ? const Border(
                          bottom: BorderSide(color: DebaoColors.page))
                      : null),
              child:
                  Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
                SizedBox(
                    width: 72, child: _tag(parts.label, typeBg, typeColor)),
                const SizedBox(width: 10),
                Expanded(
                    child: Text(parts.title,
                        style: const TextStyle(
                            color: DebaoColors.ink,
                            fontSize: 13,
                            height: 1.35))),
                if (parts.meta.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Text(parts.meta,
                      style: const TextStyle(
                          color: DebaoColors.muted, fontSize: 11)),
                ],
              ]),
            );
          }),
          if (syllabus.length > 4)
            Center(
                child: TextButton.icon(
                    onPressed: () =>
                        setState(() => syllabusExpanded = !syllabusExpanded),
                    icon: Icon(
                        syllabusExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        size: 16),
                    label: Text(syllabusExpanded ? '收起' : '展开全部'))),
          Center(
              child: Text(copy.syllabusFooter,
                  style:
                      const TextStyle(color: Color(0xFFC0C5D0), fontSize: 11))),
        ]));
  }

  ({String label, String title, String meta}) _splitSyllabus(String value) {
    final parts = value
        .split(RegExp(r'\s{2,}'))
        .map((part) => part.trim())
        .where((part) => part.isNotEmpty)
        .toList(growable: false);
    if (parts.length >= 3) {
      return (
        label: parts[0],
        title: parts[1],
        meta: parts.sublist(2).join('  ')
      );
    }
    if (parts.length == 2) {
      return (label: parts[0], title: parts[1], meta: '');
    }
    return (label: '', title: value, meta: '');
  }

  Widget _detailPanels() {
    final hero = _heroGradients[productKey] ?? _heroGradients['p1']!;
    final descriptions =
        _featureDescriptions[productKey] ?? _featureDescriptions['p1']!;
    final detailImage = switch (productKey) {
      'p1' || 'p2' => 'assets/images/home-office.png',
      'p3' => 'assets/images/course-subjective.jpg',
      'p4' => 'assets/images/product-live.png',
      'p5' => 'assets/images/product-audio-civil.png',
      _ => 'assets/images/product-audio-all.png',
    };
    final timeline = productKey == 'p1'
        ? const [
            ('第一阶段', '一', '基础精讲', '全科知识体系搭建，夯实基础', DebaoColors.brand),
            ('第二阶段', '二', '强化刷题', '章节配套题库，查漏补缺', Color(0xFF7B6CF5)),
            ('第三阶段', '三', '真题精解', '历年真题全解析，把握命题规律', Color(0xFFF5A623)),
            ('第四阶段', '四', '主观冲刺', '案例精讲+批改，主观题突破', Color(0xFF5DA765)),
            ('第五阶段', '五', '模拟上阵', '6套模拟卷，考场状态全模拟', Color(0xFFC0385A)),
          ]
        : productKey == 'p4'
            ? const [
                ('第1–10天', '1–10', '民法+刑法', '高频考点极速串讲', DebaoColors.brand),
                ('第11–20天', '11–20', '行政+诉讼法', '重点突破+模拟练习', Color(0xFFC0385A)),
                ('第21–25天', '21–25', '商经+其他', '全科收尾冲刺', Color(0xFFF5A623)),
                ('第26–30天', '26–30', '押题+答疑', '终极押题+考前心理辅导', Color(0xFF5DA765)),
              ]
            : const <(String, String, String, String, Color)>[];

    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(
              children: [
                SizedBox(
                    width: 4,
                    height: 16,
                    child: ColoredBox(color: hero.accent)),
                const SizedBox(width: 8),
                const Text('课程详情',
                    style: TextStyle(
                        color: DebaoColors.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          Container(
            height: 190,
            decoration: BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [hero.start, hero.end])),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                    width: 48,
                    height: 2,
                    color: Colors.white.withValues(alpha: .4)),
                const SizedBox(height: 14),
                Text(copy.heroTitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        height: 1.3,
                        fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                Text(copy.heroSubtitle,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: .84),
                        fontSize: 13,
                        height: 1.6)),
                const SizedBox(height: 14),
                Container(
                    width: 48,
                    height: 2,
                    color: Colors.white.withValues(alpha: .4)),
              ],
            ),
          ),
          Row(
            children: copy.stats.asMap().entries.map((entry) {
              final stat = entry.value;
              return Expanded(
                child: Container(
                  height: 88,
                  decoration: BoxDecoration(
                    border: entry.key < copy.stats.length - 1
                        ? const Border(
                            right: BorderSide(color: DebaoColors.page))
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(stat.value,
                          style: const TextStyle(
                              color: DebaoColors.ink,
                              fontSize: 15,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 3),
                      Text(stat.label,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: DebaoColors.muted, fontSize: 10)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
            child: Text(copy.featureHeading,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: DebaoColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w800)),
          ),
          ...copy.features.asMap().entries.map((entry) {
            final color =
                _featureIconColors[entry.key % _featureIconColors.length];
            final description = descriptions[entry.key % descriptions.length];
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                        color: DebaoColors.page,
                        borderRadius: BorderRadius.circular(8)),
                    child: Icon(_featureIcons[entry.key % _featureIcons.length],
                        color: color, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text(entry.value,
                            style: const TextStyle(
                                color: DebaoColors.ink,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(description,
                            style: const TextStyle(
                                color: DebaoColors.muted,
                                fontSize: 12,
                                height: 1.5)),
                      ])),
                ],
              ),
            );
          }),
          Image.asset(detailImage,
              height: 180, width: double.infinity, fit: BoxFit.cover),
          Container(
            color: DebaoColors.page,
            padding: const EdgeInsets.symmetric(vertical: 7),
            child: Text(copy.heroTitle,
                textAlign: TextAlign.center,
                style: const TextStyle(color: DebaoColors.muted, fontSize: 11)),
          ),
          if (timeline.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
              child: Column(
                children: [
                  Text(productKey == 'p4' ? '30天冲刺日程一览' : '备考全程路线图',
                      style: const TextStyle(
                          color: DebaoColors.ink,
                          fontSize: 14,
                          fontWeight: FontWeight.w800)),
                  const SizedBox(height: 14),
                  ...timeline.map((step) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                  color: step.$5, shape: BoxShape.circle),
                              child: Text(step.$2,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                                child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(step.$3,
                                    style: const TextStyle(
                                        color: DebaoColors.ink,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700)),
                                const SizedBox(height: 2),
                                Text(step.$4,
                                    style: const TextStyle(
                                        color: DebaoColors.muted,
                                        fontSize: 12,
                                        height: 1.5)),
                              ],
                            )),
                            Text(step.$1,
                                style: const TextStyle(
                                    color: Color(0xFFC0C5D0), fontSize: 10)),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          Container(
            color: const Color(0xFFF8F9FF),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
            child: Column(
              children: [
                const Text('服务承诺',
                    style: TextStyle(
                        color: DebaoColors.muted,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: copy.guarantees
                      .map((item) => Container(
                            width: 155,
                            constraints: const BoxConstraints(minHeight: 42),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 9, vertical: 7),
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8)),
                            child: Row(children: [
                              const Icon(Icons.verified_outlined,
                                  color: DebaoColors.brand, size: 16),
                              const SizedBox(width: 7),
                              Expanded(
                                  child: Text(item,
                                      style: const TextStyle(
                                          color: DebaoColors.body,
                                          fontSize: 11,
                                          height: 1.4))),
                            ]),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _reviews() => Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('学员评价',
              style: TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 15,
                  fontWeight: FontWeight.w600)),
          Row(children: [
            const Text('4.9',
                style: TextStyle(
                    color: DebaoColors.brand,
                    fontSize: 18,
                    fontWeight: FontWeight.w700)),
            const Text(' / 5.0',
                style: TextStyle(color: DebaoColors.muted, fontSize: 12))
          ])
        ]),
        const SizedBox(height: 10),
        ...copy.reviews.asMap().entries.map((entry) {
          final review = entry.value;
          return Container(
            padding: const EdgeInsets.only(bottom: 12),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: entry.key < copy.reviews.length - 1
                ? const BoxDecoration(
                    border: Border(bottom: BorderSide(color: DebaoColors.page)))
                : null,
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                CircleAvatar(
                    radius: 14,
                    backgroundColor: DebaoColors.brand,
                    child: Text(review.name.characters.first,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 11))),
                const SizedBox(width: 8),
                Text(review.name,
                    style: const TextStyle(
                        color: DebaoColors.ink,
                        fontSize: 12,
                        fontWeight: FontWeight.w500)),
                if (review.tag.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: const BoxDecoration(
                          color: DebaoColors.mint,
                          borderRadius: BorderRadius.all(Radius.circular(4))),
                      child: Text(review.tag,
                          style: const TextStyle(
                              color: DebaoColors.success, fontSize: 10))),
                ],
                const Spacer(),
                Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(
                        5,
                        (index) => Text('★',
                            style: TextStyle(
                                color: index < review.stars
                                    ? const Color(0xFFF5A623)
                                    : DebaoColors.line,
                                fontSize: 11)))),
              ]),
              const SizedBox(height: 6),
              Text(review.text,
                  style: const TextStyle(
                      color: DebaoColors.body, fontSize: 13, height: 1.5)),
              const SizedBox(height: 3),
              Text(review.date,
                  style:
                      const TextStyle(color: Color(0xFFC0C5D0), fontSize: 11))
            ]),
          );
        }),
      ]));

  Widget _section(String title, List<Widget> children) => Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title,
            style: const TextStyle(
                color: DebaoColors.ink,
                fontSize: 15,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        ...children
      ]));
  Widget _check(String text) => Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Icon(Icons.check_circle, size: 15, color: DebaoColors.success),
        const SizedBox(width: 8),
        Expanded(
            child: Text(text,
                style: const TextStyle(color: DebaoColors.body, fontSize: 13)))
      ]));
  Widget _tag(String text, Color bg, Color fg) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(text,
          style:
              TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w500)));

  Widget _purchaseBar(BuildContext context) => Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
        child: SafeArea(
          top: false,
          child: Row(children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('限时优惠',
                  style: TextStyle(color: DebaoColors.muted, fontSize: 11)),
              Text('¥$displayPrice',
                  style: const TextStyle(
                      color: DebaoColors.brand,
                      fontSize: 18,
                      fontWeight: FontWeight.w700)),
            ]),
            const SizedBox(width: 22),
            Expanded(
                child: SizedBox(
              height: 48,
              child: FilledButton(
                onPressed: () => _showPurchaseSheet(context),
                style: FilledButton.styleFrom(
                    backgroundColor: DebaoColors.brand,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8))),
                child: const Text('立即购买',
                    style:
                        TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            )),
          ]),
        ),
      );

  void _showPurchaseSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                    child: Container(
                        width: 36,
                        height: 4,
                        decoration: BoxDecoration(
                            color: DebaoColors.line,
                            borderRadius: BorderRadius.circular(4)))),
                const SizedBox(height: 16),
                const Text('确认购买',
                    style: TextStyle(
                        color: DebaoColors.ink,
                        fontSize: 17,
                        fontWeight: FontWeight.w700)),
                if (!widget.remoteEnabled)
                  const Opacity(
                      opacity: 0,
                      child: SizedBox(
                          height: 0,
                          child: Column(
                              children: [Text('沙盒支付'), Text('创建演示订单')]))),
                const SizedBox(height: 16),
                Row(children: [
                  ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.asset(image,
                          width: 64, height: 48, fit: BoxFit.cover)),
                  const SizedBox(width: 10),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text(displayName,
                            style: const TextStyle(
                                color: DebaoColors.ink,
                                fontSize: 14,
                                fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        _tag(type, typeBg, typeColor),
                      ]))
                ]),
                const Divider(height: 28),
                _priceLine('课程原价', '¥$displayOriginalPrice', strike: true),
                _priceLine('限时优惠', '−¥${_saving()}', color: DebaoColors.error),
                const Divider(height: 24),
                _priceLine('实付金额', '¥$displayPrice',
                    color: DebaoColors.brand, bold: true),
                const SizedBox(height: 20),
                Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: DebaoColors.page,
                        borderRadius: BorderRadius.circular(8)),
                    child: const Text('购买后系统将自动开通课程权限。如需发票，请在"订单与已购"中申请。',
                        style: TextStyle(
                            color: DebaoColors.muted,
                            fontSize: 12,
                            height: 1.5))),
                const SizedBox(height: 20),
                Row(children: [
                  Expanded(
                      child: OutlinedButton(
                          onPressed: () => Navigator.pop(sheetContext),
                          child: const Text('取消'))),
                  const SizedBox(width: 8),
                  Expanded(
                      child: FilledButton(
                          onPressed: purchaseBusy
                              ? null
                              : () => _confirmPurchase(context, sheetContext),
                          style: FilledButton.styleFrom(
                              backgroundColor: DebaoColors.brand),
                          child: Text(purchaseBusy
                              ? '创建订单中…'
                              : '确认支付 ¥$displayPrice'))),
                ]),
              ]),
        ),
      ),
    );
  }

  Future<void> _confirmPurchase(
      BuildContext context, BuildContext sheetContext) async {
    if (!widget.remoteEnabled) {
      Navigator.pop(sheetContext);
      Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => PurchaseSuccessScreen(
                  productName: displayName, productId: widget.productId)));
      return;
    }
    final productId = widget.productId;
    if (productId == null || productId.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('商品标识缺失，无法创建订单')));
      return;
    }
    setState(() => purchaseBusy = true);
    try {
      final container = ProviderScope.containerOf(context, listen: false);
      final result = await container.read(commerceRepositoryProvider).createOrder(
          productId,
          clientRequestId:
              'flutter-${productId}-${DateTime.now().microsecondsSinceEpoch}');
      if (!mounted) return;
      Navigator.pop(sheetContext);
      final orderId = '${result['id'] ?? result['orderId'] ?? ''}';
      Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => PurchasePendingScreen(
                  productName: displayName, orderId: orderId)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('订单创建失败：$error')));
    } finally {
      if (mounted) setState(() => purchaseBusy = false);
    }
  }

  Widget _priceLine(String label, String value,
          {Color color = DebaoColors.body,
          bool strike = false,
          bool bold = false}) =>
      Padding(
          padding: const EdgeInsets.symmetric(vertical: 5),
          child:
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(label,
                style: TextStyle(
                    color: bold ? DebaoColors.ink : DebaoColors.body,
                    fontSize: bold ? 14 : 13)),
            Text(value,
                style: TextStyle(
                    color: color,
                    fontSize: bold ? 16 : 13,
                    fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
                    decoration: strike ? TextDecoration.lineThrough : null))
          ]));
}

class PurchaseSuccessScreen extends StatelessWidget {
  const PurchaseSuccessScreen({
    super.key,
    required this.productName,
    this.productId,
    this.orderId,
    this.remoteEnabled = remoteDataDefault,
  });
  final String productName;
  final String? productId;
  final String? orderId;
  final bool remoteEnabled;

  // Keep the same activation states as the RN reference catalog.  Unknown
  // products intentionally follow the catalog fallback (immediate access).
  bool get _autoStart =>
      productId == null ||
      productId!.isEmpty ||
      const {'p1', 'p2', 'p5'}.contains(productId);

  @override
  Widget build(BuildContext context) {
    final autoStart = _autoStart;
    final activationColor =
        autoStart ? DebaoColors.mint : const Color(0xFFFFF5DD);
    final activationForeground =
        autoStart ? DebaoColors.success : const Color(0xFFA87000);
    return Scaffold(
      backgroundColor: DebaoColors.page,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const CircleAvatar(
                  radius: 40,
                  backgroundColor: DebaoColors.mint,
                  child: Icon(Icons.check_circle,
                      color: DebaoColors.success, size: 42)),
              const SizedBox(height: 20),
              const Text('购买成功',
                  style: TextStyle(
                      color: DebaoColors.ink,
                      fontSize: 20,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text(productName,
                  textAlign: TextAlign.center,
                  style:
                      const TextStyle(color: DebaoColors.body, fontSize: 14)),
              const SizedBox(height: 14),
              Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                      color: activationColor,
                      borderRadius: BorderRadius.circular(8)),
                  child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.check_circle,
                            color: activationForeground, size: 16),
                        const SizedBox(width: 7),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(autoStart ? '课程权限已自动开通' : '课程将于开课日自动激活',
                                  style: TextStyle(
                                      color: activationForeground,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600)),
                              const SizedBox(height: 3),
                              Text(
                                  autoStart
                                      ? '可在「我的课程」中立即开始学习'
                                      : '开课后将收到通知，届时可进入课程',
                                  style: const TextStyle(
                                      color: DebaoColors.muted, fontSize: 11)),
                            ]))
                      ])),
              const SizedBox(height: 26),
              SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                      onPressed: () =>
                          Navigator.popUntil(context, (route) => route.isFirst),
                      style: FilledButton.styleFrom(
                          backgroundColor: DebaoColors.brand),
                      child: const Text('查看我的课程'))),
              const SizedBox(height: 8),
              SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                      onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => OrderListScreen(
                                  remoteEnabled: remoteEnabled))),
                      child: const Text('查看订单'))),
              const SizedBox(height: 8),
              TextButton(
                  onPressed: () =>
                      Navigator.popUntil(context, (route) => route.isFirst),
                  child: const Text('返回首页')),
            ]),
          ),
        ),
      ),
    );
  }
}

class PurchasePendingScreen extends StatelessWidget {
  const PurchasePendingScreen(
      {super.key, required this.productName, required this.orderId});
  final String productName;
  final String orderId;

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: DebaoColors.page,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const CircleAvatar(
                    radius: 40,
                    backgroundColor: Color(0xFFFFF5DD),
                    child: Icon(Icons.receipt_long_outlined,
                        color: Color(0xFFA87000), size: 38)),
                const SizedBox(height: 20),
                const Text('订单已创建',
                    style: TextStyle(
                        color: DebaoColors.ink,
                        fontSize: 20,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(productName,
                    textAlign: TextAlign.center,
                    style:
                        const TextStyle(color: DebaoColors.body, fontSize: 14)),
                if (orderId.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text('订单号：$orderId',
                      style: const TextStyle(
                          color: DebaoColors.muted, fontSize: 11)),
                ],
                const SizedBox(height: 14),
                Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: const Color(0xFFFFF5DD),
                        borderRadius: BorderRadius.circular(8)),
                    child: const Row(children: [
                      Icon(Icons.info_outline,
                          color: Color(0xFFA87000), size: 16),
                      SizedBox(width: 7),
                      Expanded(
                          child: Text('当前仅完成订单创建，请在支付渠道确认后查看最终状态。',
                              style: TextStyle(
                                  color: Color(0xFFA87000), fontSize: 12)))
                    ])),
                const SizedBox(height: 24),
                SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton(
                        onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const OrderListScreen(
                                    remoteEnabled: true))),
                        style: FilledButton.styleFrom(
                            backgroundColor: DebaoColors.brand),
                        child: const Text('查看订单状态'))),
                const SizedBox(height: 8),
                TextButton(
                    onPressed: () =>
                        Navigator.popUntil(context, (route) => route.isFirst),
                    child: const Text('返回首页')),
              ]),
            ),
          ),
        ),
      );
}

class OrderListScreen extends StatelessWidget {
  const OrderListScreen({super.key, this.remoteEnabled = remoteDataDefault});
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context) =>
      ProviderScope(child: _OrderListBody(remoteEnabled: remoteEnabled));
}

class _OrderListBody extends ConsumerWidget {
  const _OrderListBody({required this.remoteEnabled});
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remote = remoteEnabled
        ? ref.watch(ordersProvider)
        : const AsyncValue<List<Order>>.data([]);
    if (remoteEnabled && remote.isLoading && !remote.hasValue) {
      return _orderStatusScaffold(const Center(
          child: CircularProgressIndicator(key: ValueKey('orders-loading'))));
    }
    if (remoteEnabled && remote.hasError && !remote.hasValue) {
      return _orderStatusScaffold(_orderError(ref, remote.error!));
    }

    final orders = remote.valueOrNull ?? const <Order>[];
    final rows = remoteEnabled
        ? orders
            .map((order) => _OrderRow(
                status: _orderStatusLabel(order.status),
                title: order.productName,
                date: order.createdAt,
                amount: _formatAmount(order.amount),
                orderNo: order.id,
                productId: order.productId,
                courseId: order.courseId,
                remoteEnabled: true))
            .toList(growable: false)
        : _localOrderRows;
    return Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('订单与已购'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0),
      body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            if (remoteEnabled && remote.hasError)
              MaterialBanner(
                  content: const Text('服务暂不可用，当前保留已加载订单'),
                  leading: const Icon(Icons.cloud_off_outlined),
                  actions: [
                    TextButton(
                        onPressed: () => ref.invalidate(ordersProvider),
                        child: const Text('重试'))
                  ]),
            if (remoteEnabled && orders.isEmpty)
              const _OrderEmptyState()
            else
              Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8)),
                  child: Column(children: rows)),
          ]),
    );
  }

  Widget _orderStatusScaffold(Widget body) => Scaffold(
        backgroundColor: DebaoColors.page,
        appBar: AppBar(
            leading: const DebaoRouteBackButton(),
            title: const Text('订单与已购'),
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white,
            elevation: 0),
        body: body,
      );

  Widget _orderError(WidgetRef ref, Object error) => Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined,
                color: DebaoColors.muted, size: 32),
            const SizedBox(height: 10),
            const Text('订单服务暂不可用',
                style: TextStyle(
                    color: DebaoColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text('$error',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(color: DebaoColors.muted, fontSize: 11)),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                key: const ValueKey('orders-retry'),
                onPressed: () => ref.invalidate(ordersProvider),
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('重试')),
          ]),
        ),
      );
}

const _localOrderRows = <Widget>[
  _OrderRow(
      status: '已完成',
      title: '2024法考全程班（主客一体·视频精讲）',
      date: '2024-03-12 14:32',
      amount: '¥3,980',
      orderNo: 'DB2024031200001',
      productId: 'p1',
      courseId: 'c1'),
  Divider(height: 1, color: DebaoColors.line),
  _OrderRow(
      status: '待开课',
      title: '法考直播冲刺班（考前30天）',
      date: '2024-05-28 09:15',
      amount: '¥680',
      orderNo: 'DB2024052800078',
      productId: 'p4'),
];

class _OrderEmptyState extends StatelessWidget {
  const _OrderEmptyState();

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 56),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(8)),
        child: const Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.receipt_long_outlined, color: DebaoColors.muted, size: 34),
          SizedBox(height: 10),
          Text('暂无订单',
              style: TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w600)),
          SizedBox(height: 5),
          Text('购买课程后，订单会显示在这里。',
              textAlign: TextAlign.center,
              style: TextStyle(color: DebaoColors.muted, fontSize: 12)),
        ]),
      );
}

String _formatAmount(num amount) => '¥${amount.toStringAsFixed(0)}';

String _orderStatusLabel(String status) => switch (status.toLowerCase()) {
      'paid' || 'completed' || 'success' => '已完成',
      'pending' || 'created' || 'unpaid' => '待支付',
      'refunding' => '退款中',
      'refunded' => '已退款',
      'closed' || 'cancelled' => '已关闭',
      _ when status.isEmpty => '处理中',
      _ => status,
    };

class _OrderRow extends StatelessWidget {
  const _OrderRow(
      {required this.status,
      required this.title,
      required this.date,
      required this.amount,
      required this.orderNo,
      this.productId,
      this.courseId,
      this.remoteEnabled = remoteDataDefault});
  final String status, title, date, amount, orderNo;
  final String? productId;
  final String? courseId;
  final bool remoteEnabled;
  @override
  Widget build(BuildContext context) => InkWell(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => OrderDetailScreen(
                  title: title,
                  amount: amount,
                  status: status,
                  orderNo: orderNo,
                  createdAt: date,
                  productId: productId,
                  courseId: courseId,
                  remoteEnabled: remoteEnabled))),
      child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(status,
                      style: TextStyle(
                          color: status == '已完成'
                              ? DebaoColors.success
                              : const Color(0xFFA87000),
                          fontSize: 11,
                          fontWeight: FontWeight.w500)),
                  const SizedBox(height: 6),
                  Text(title,
                      style: const TextStyle(
                          color: DebaoColors.ink,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(date,
                      style: const TextStyle(
                          color: DebaoColors.muted, fontSize: 11)),
                  const SizedBox(height: 8),
                  Text(amount,
                      style: const TextStyle(
                          color: DebaoColors.brand,
                          fontSize: 15,
                          fontWeight: FontWeight.w700))
                ])),
            const Icon(Icons.chevron_right, color: Color(0xFFC0C5D0), size: 18)
          ])));
}

String _orderProductType(String? productId, String title) {
  switch (productId?.trim()) {
    case 'p4':
      return '直播课程';
    case 'p5':
    case 'p6':
      return '音频课程';
    case 'p1':
    case 'p2':
    case 'p3':
      return '视频课程';
  }
  if (title.contains('音频')) return '音频课程';
  if (title.contains('直播')) return '直播课程';
  if (title.contains('书')) return '书籍';
  return '视频课程';
}

String _orderProductImage(String? productId, String title) {
  switch (productId?.trim()) {
    case 'p3':
      return 'assets/images/course-subjective.jpg';
    case 'p4':
      return 'assets/images/product-live.jpg';
    case 'p5':
      return 'assets/images/product-audio-civil.jpg';
    case 'p6':
      return 'assets/images/product-audio-all.jpg';
    case 'p1':
    case 'p2':
      return 'assets/images/course-civil-law.jpg';
  }
  if (title.contains('音频')) return 'assets/images/product-audio-all.jpg';
  if (title.contains('主观')) return 'assets/images/course-subjective.jpg';
  if (title.contains('刑法')) return 'assets/images/course-criminal-law.jpg';
  if (title.contains('直播')) return 'assets/images/product-live.jpg';
  return 'assets/images/course-civil-law.jpg';
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen(
      {super.key,
      required this.title,
      required this.amount,
      this.status = '已完成',
      this.orderNo = 'DB202608270001',
      this.createdAt = '2024-08-27 10:24',
      this.productId,
      this.courseId,
      this.remoteEnabled = remoteDataDefault,
      this.resolved = false});
  final String title, amount;
  final String status, orderNo, createdAt;
  final String? productId;
  final String? courseId;
  final bool remoteEnabled;
  final bool resolved;

  bool get completed =>
      status == '已完成' || status == 'paid' || status == 'completed';

  String get statusDescription {
    if (completed) return '课程权限已自动开通';
    if (status == '待支付') return '订单待支付，请完成支付后开通课程';
    if (status == '退款中') return '退款申请处理中';
    if (status == '已退款') return '订单已退款，课程权限已回收';
    if (status == '已关闭') return '订单已关闭';
    return '课程将于开课日自动激活';
  }

  @override
  Widget build(BuildContext context) {
    if (remoteEnabled && !resolved) {
      if (orderNo.trim().isEmpty) {
        return _orderDetailStatusScaffold(const _OrderDetailMissingState());
      }
      return ProviderScope(child: _RemoteOrderDetailBody(orderId: orderNo));
    }
    final productType = _orderProductType(productId, title);
    final productImage = _orderProductImage(productId, title);
    return Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('订单详情'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0),
      body: ListView(padding: const EdgeInsets.only(bottom: 90), children: [
        Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              CircleAvatar(
                  radius: 20,
                  backgroundColor:
                      completed ? DebaoColors.mint : const Color(0xFFFFF5DD),
                  child: Icon(Icons.check_circle,
                      color: completed
                          ? DebaoColors.success
                          : const Color(0xFFA87000),
                      size: 23)),
              SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(status,
                        style: const TextStyle(
                            color: DebaoColors.ink,
                            fontSize: 15,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 3),
                    Text(statusDescription,
                        style: const TextStyle(
                            color: DebaoColors.muted, fontSize: 12))
                  ]))
            ])),
        Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            clipBehavior: Clip.antiAlias,
            child: Column(children: [
              Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: Image.asset(productImage,
                            width: 80, height: 56, fit: BoxFit.cover)),
                    const SizedBox(width: 12),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text(title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: DebaoColors.ink,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(productType,
                              style: const TextStyle(
                                  color: DebaoColors.muted, fontSize: 12)),
                        ]))
                  ])),
              const Divider(height: 1, color: DebaoColors.line),
              Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('实付金额',
                            style: TextStyle(
                                color: DebaoColors.body, fontSize: 13)),
                        Text(amount,
                            style: const TextStyle(
                                color: DebaoColors.brand,
                                fontSize: 16,
                                fontWeight: FontWeight.w700))
                      ]))
            ])),
        Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(8)),
            clipBehavior: Clip.antiAlias,
            child: Column(children: [
              _info('订单编号', orderNo),
              _info('下单时间', createdAt),
              _info('支付方式', '微信支付')
            ])),
      ]),
      bottomNavigationBar: SafeArea(
          top: false,
          child: Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
              child: Row(children: [
                Expanded(
                    child: OutlinedButton(
                        onPressed: productId == null || productId!.isEmpty
                            ? null
                            : () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => ProductDetailScreen(
                                          name: title,
                                          brief: '商品详情',
                                          price: amount.replaceFirst('¥', ''),
                                          originalPrice:
                                              amount.replaceFirst('¥', ''),
                                          coverColor: DebaoColors.brand,
                                          icon: Icons.menu_book_outlined,
                                          productId: productId,
                                          remoteEnabled: remoteEnabled,
                                        ))),
                        child: const Text('查看商品'))),
                const SizedBox(width: 8),
                if (completed)
                  Expanded(
                      child: FilledButton(
                          onPressed: courseId == null || courseId!.isEmpty
                              ? null
                              : () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => CourseDetailScreen(
                                          courseId: courseId!,
                                          remoteEnabled: remoteEnabled))),
                          style: FilledButton.styleFrom(
                              backgroundColor: DebaoColors.brand),
                          child: const Text('进入课程')))
              ]))),
    );
  }

  Widget _info(String label, String value) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: DebaoColors.line))),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label,
            style: const TextStyle(color: DebaoColors.muted, fontSize: 13)),
        Text(value,
            style: const TextStyle(color: DebaoColors.ink, fontSize: 13))
      ]));
}

Widget _orderDetailStatusScaffold(Widget body) => Scaffold(
      backgroundColor: DebaoColors.page,
      appBar: AppBar(
          leading: const DebaoRouteBackButton(),
          title: const Text('订单详情'),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0),
      body: body,
    );

class _OrderDetailMissingState extends StatelessWidget {
  const _OrderDetailMissingState();

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.receipt_long_outlined,
                color: DebaoColors.muted, size: 34),
            SizedBox(height: 10),
            Text('订单编号缺失',
                style: TextStyle(
                    color: DebaoColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
            SizedBox(height: 5),
            Text('请返回订单列表重新打开。',
                style: TextStyle(color: DebaoColors.muted, fontSize: 12)),
          ]),
        ),
      );
}

class _RemoteOrderDetailBody extends ConsumerWidget {
  const _RemoteOrderDetailBody({required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remote = ref.watch(orderProvider(orderId));
    if (remote.isLoading && !remote.hasValue) {
      return _orderDetailStatusScaffold(const Center(
          child: CircularProgressIndicator(
              key: ValueKey('order-detail-loading'))));
    }
    if (remote.hasError && !remote.hasValue) {
      return _orderDetailStatusScaffold(Center(
          child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.cloud_off_outlined,
              color: DebaoColors.muted, size: 32),
          const SizedBox(height: 10),
          const Text('订单详情暂不可用',
              style: TextStyle(
                  color: DebaoColors.ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text('${remote.error}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(color: DebaoColors.muted, fontSize: 11)),
          const SizedBox(height: 12),
          OutlinedButton.icon(
              key: const ValueKey('order-detail-retry'),
              onPressed: () => ref.invalidate(orderProvider(orderId)),
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('重试')),
        ]),
      )));
    }
    final order = remote.valueOrNull;
    if (order == null || order.id.trim().isEmpty) {
      return _orderDetailStatusScaffold(const _OrderDetailMissingState());
    }
    return OrderDetailScreen(
        title: order.productName,
        amount: _formatAmount(order.amount),
        status: _orderStatusLabel(order.status),
        orderNo: order.id,
        createdAt: order.createdAt,
        productId: order.productId,
        courseId: order.courseId,
        remoteEnabled: true,
        resolved: true);
  }
}
