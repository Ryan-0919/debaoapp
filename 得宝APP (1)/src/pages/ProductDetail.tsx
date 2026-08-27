import { useState } from "react";
import { NavContextType } from "@/types";
import { PRODUCTS } from "@/data";
import TopBar from "@/components/TopBar";
import BottomSheet from "@/components/BottomSheet";
import { Tag } from "@/components/ui";
import { CheckCircle, Share2, PlayCircle, Headphones, Radio, Star, ChevronDown, ChevronUp, Trophy, Users, Clock, Zap, BookOpen, Target, Shield, Gift, Mic, Wifi } from "lucide-react";

const TEACHER_INFO: Record<string, { title: string; bio: string }> = {
  张明远: {
    title: "法考名师 · 执业律师 · 民法方向",
    bio: "从事法律职业资格考试辅导16年，民法学博士，曾在头部律所任高级合伙人。授课以框架清晰、案例鲜活著称，善用思维导图串联考点，历届学员客观题通过率显著高于行业均值。",
  },
  王晓峰: {
    title: "法考名师 · 主观题专家 · 前高院法官",
    bio: "曾任省高级人民法院法官12年，深谙裁判思维与答题逻辑。擅长主观题答题规范训练，所带学员主观题均分高出全国平均15+分，批改评语精准到位。",
  },
  李东明: {
    title: "法考名师 · 刑法方向 · 双一流高校副教授",
    bio: "知名高校刑法学副教授，同时担任司法考试辅导机构首席讲师。理论功底深厚，结合真实案例讲授刑法体系，直播课互动氛围好，考前押题命中率极高。",
  },
  多位名师: {
    title: "豪华师资阵容 · 各科权威名师联袂",
    bio: "由张明远（民法）、王晓峰（主观题）、李东明（刑法）等多位顶级名师联合主讲，各科交由最擅长该科的老师授课，实现备考效率最大化。",
  },
};

type SyllabusItem = { label: string; title: string; meta: string };
const SYLLABI: Record<string, { heading: string; items: SyllabusItem[]; footer: string }> = {
  p1: {
    heading: "课程大纲（节选）",
    items: [
      { label: "第一章", title: "民法总则与基本原则", meta: "18讲" },
      { label: "第二章", title: "物权法精讲", meta: "22讲" },
      { label: "第三章", title: "合同法核心考点", meta: "26讲" },
      { label: "第四章", title: "刑法总论与分论", meta: "36讲" },
      { label: "第五章", title: "行政法与行政诉讼法", meta: "24讲" },
      { label: "第六章", title: "主观题答题逻辑与规范", meta: "20讲" },
    ],
    footer: "共420课时，购买后按学习计划逐步解锁",
  },
  p2: {
    heading: "课程大纲（节选）",
    items: [
      { label: "第一章", title: "民法总则、物权、合同精讲", meta: "52讲" },
      { label: "第二章", title: "刑法总论与常考分论", meta: "44讲" },
      { label: "第三章", title: "行政法与国家赔偿", meta: "28讲" },
      { label: "第四章", title: "民事诉讼法与证据", meta: "32讲" },
      { label: "第五章", title: "刑事诉讼法精讲", meta: "30讲" },
    ],
    footer: "共220课时，配8次月度直播答疑",
  },
  p3: {
    heading: "课程大纲（节选）",
    items: [
      { label: "第一单元", title: "主观题答题方法论", meta: "8讲" },
      { label: "第二单元", title: "民法案例综合分析", meta: "16讲" },
      { label: "第三单元", title: "刑法案例推理与定性", meta: "14讲" },
      { label: "第四单元", title: "历年真题精讲与模拟批改", meta: "14讲" },
      { label: "第五单元", title: "冲刺押题与答题规范", meta: "8讲" },
    ],
    footer: "共60课时，含10次一对一批改",
  },
  p4: {
    heading: "直播课程安排",
    items: [
      { label: "第1–5天", title: "民法高频考点极速串讲", meta: "每晚19:00–21:00" },
      { label: "第6–10天", title: "刑法总论+分论押题精讲", meta: "每晚19:00–21:00" },
      { label: "第11–15天", title: "行政法+民诉法重点突破", meta: "每晚19:00–21:00" },
      { label: "第16–20天", title: "刑诉法+商法+经济法冲刺", meta: "每晚19:00–21:00" },
      { label: "第21–25天", title: "模拟考试+考场技巧训练", meta: "全天模考+复盘" },
      { label: "第26–30天", title: "终极押题+考前答疑", meta: "每晚20:00–22:00" },
    ],
    footer: "直播后24小时内提供回放，永久可看",
  },
  p5: {
    heading: "音频目录（节选）",
    items: [
      { label: "第01讲", title: "民法基础框架与学习路径", meta: "38分钟" },
      { label: "第02讲", title: "自然人的权利能力与行为能力", meta: "42分钟" },
      { label: "第03讲", title: "法人与非法人组织", meta: "35分钟" },
      { label: "第15讲", title: "物权概述与善意取得", meta: "54分钟" },
      { label: "第28讲", title: "合同的成立与生效", meta: "48分钟" },
      { label: "第45讲", title: "侵权责任法重点考点", meta: "51分钟" },
    ],
    footer: "共68讲·约52小时，支持离线下载与倍速播放",
  },
  p6: {
    heading: "音频目录（节选）",
    items: [
      { label: "第001讲", title: "【民法】总则篇极速过关", meta: "62分钟" },
      { label: "第020讲", title: "【刑法】犯罪构成四要件串讲", meta: "58分钟" },
      { label: "第065讲", title: "【行政法】行政处罚重点梳理", meta: "45分钟" },
      { label: "第100讲", title: "【民诉】送达与期间高频考点", meta: "39分钟" },
      { label: "第150讲", title: "【刑诉】证据制度精要", meta: "52分钟" },
      { label: "第200讲", title: "【商经法】公司法核心考点", meta: "67分钟" },
    ],
    footer: "共220讲·约160小时，各科权威名师主讲",
  },
};

type Review = { name: string; text: string; stars: number; date: string; tag?: string };
const REVIEWS: Record<string, Review[]> = {
  p1: [
    { name: "法**生", stars: 5, date: "2024-08-15", tag: "全程班学员", text: "全程班内容太全了，从客观题到主观题一条龙，老师讲得系统清晰，配套题库质量也很高，今年终于过了！" },
    { name: "王*明", stars: 5, date: "2024-07-28", tag: "二战上岸", text: "二战选了这套课，和一战相比进步非常明显。张老师民法讲得真的绝，逻辑框架清楚，案例举一反三。" },
    { name: "备考**", stars: 4, date: "2024-07-10", tag: "已购买", text: "整体很满意，主观题批改服务真的有用，老师的修改意见很细致。就是希望客服反应再快一点。" },
  ],
  p2: [
    { name: "林*雨", stars: 5, date: "2024-09-01", tag: "客观题通过", text: "客观题一次性过，这套课功不可没！220课时信息量很大，但节奏很好，配合题库刷题效果超棒。" },
    { name: "小*萱", stars: 5, date: "2024-08-20", tag: "已购买", text: "月度直播答疑非常有价值，能实时问老师考点疑问，比录播课强很多。强烈推荐！" },
    { name: "考研**", stars: 4, date: "2024-08-05", tag: "已购买", text: "课程内容扎实，真题精解部分尤其好。卷一卷二都有涉及，覆盖面很全，性价比高。" },
  ],
  p3: [
    { name: "律**人", stars: 5, date: "2024-10-12", tag: "主观题通过", text: "王老师批改真的太认真了！每次提交作业，反馈都很详细，指出我答题逻辑上的漏洞。主观题最后高分通过！" },
    { name: "老*考", stars: 5, date: "2024-10-05", tag: "三战上岸", text: "三战终于主观题过了，选这门课是最正确的决定。答题模板和规范训练对我帮助很大。" },
    { name: "工作**", stars: 4, date: "2024-09-18", tag: "已购买", text: "一边工作一边备考，这门课帮我快速找到了主观题答题节奏，60课时内容精炼高效。" },
  ],
  p4: [
    { name: "冲**者", stars: 5, date: "2024-09-22", tag: "考前冲刺", text: "考前30天跟着李老师冲刺，感觉很踏实！每晚直播串讲思路清晰，押题命中了好几道！" },
    { name: "上班**", stars: 5, date: "2024-09-18", tag: "已购买", text: "本来只打算听回放，结果每晚直播太精彩忍不住实时看。老师互动很好，气氛活跃，学习效率大幅提升。" },
    { name: "最后**", stars: 4, date: "2024-09-10", tag: "已购买", text: "内容紧凑，30天安排得满满当当。模拟考试质量很高，和真题难度相当。考前心理素质也被练出来了。" },
  ],
  p5: [
    { name: "通**族", stars: 5, date: "2024-06-30", tag: "通勤党", text: "地铁上、健身时全靠这套音频！张老师语速适中，1.5倍速听完整套民法，知识点记得很牢。逐字稿PDF也很赞！" },
    { name: "碎**习", stars: 5, date: "2024-06-15", tag: "已购买", text: "音频质量非常好，无杂音，字幕同步。最爱的功能是知识点速记卡片，睡前看几张效果很好。" },
    { name: "民法**", stars: 4, date: "2024-05-28", tag: "已购买", text: "民法本来是我最弱的科目，听了这套音频后理解清晰多了。建议搭配题库使用，效果更好！" },
  ],
  p6: [
    { name: "全**刷", stars: 5, date: "2024-08-08", tag: "二战学员", text: "有了基础之后用这套全科音频串讲，效率极高！相当于把知识体系又梳理了一遍，覆盖面超全。" },
    { name: "职*人", stars: 5, date: "2024-07-25", tag: "上班族备考", text: "工作党福音！利用碎片时间把220讲刷完，配合配套题库，客观题顺利通过，性价比超高！" },
    { name: "二**战", stars: 4, date: "2024-07-12", tag: "已购买", text: "名师联袂讲课质量有保障，各科老师都是行业顶尖。就是各讲风格略有不同，适应一下就好。" },
  ],
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  视频课程: <PlayCircle size={13} color="#4C4BEA" />,
  音频课程: <Headphones size={13} color="#1A8B8B" />,
  直播课程: <Radio size={13} color="#C0385A" />,
};

const TYPE_LABEL_COLOR: Record<string, { bg: string; text: string }> = {
  视频课程: { bg: "#F0F0FF", text: "#4C4BEA" },
  音频课程: { bg: "#EAF7F7", text: "#1A8B8B" },
  直播课程: { bg: "#FFF0F5", text: "#C0385A" },
};

/* ─── Detail image panels (simulated marketing long-image) ─── */
type DetailPanel =
  | { kind: "hero"; title: string; subtitle: string; accent: string; bg: string }
  | { kind: "stats"; items: { icon: React.ReactNode; value: string; label: string }[] }
  | { kind: "features"; heading: string; items: { icon: React.ReactNode; title: string; desc: string }[] }
  | { kind: "guarantee"; items: { icon: React.ReactNode; text: string }[] }
  | { kind: "photo"; src: string; caption?: string }
  | { kind: "timeline"; heading: string; steps: { phase: string; title: string; detail: string; color: string }[] };

const DETAIL_PANELS: Record<string, DetailPanel[]> = {
  p1: [
    {
      kind: "hero",
      title: "一次报名 · 全程无忧",
      subtitle: "客观题 + 主观题 完整覆盖\n从零基础到高分上岸",
      accent: "#4C4BEA",
      bg: "linear-gradient(135deg, #1a1870 0%, #4C4BEA 60%, #7B6CF5 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Clock size={20} color="#4C4BEA" />, value: "420", label: "课时总量" },
        { icon: <Users size={20} color="#4C4BEA" />, value: "2847+", label: "已报名学员" },
        { icon: <Trophy size={20} color="#4C4BEA" />, value: "91%", label: "历届通过率" },
        { icon: <BookOpen size={20} color="#4C4BEA" />, value: "12000+", label: "配套题目" },
      ],
    },
    {
      kind: "features",
      heading: "课程四大核心优势",
      items: [
        { icon: <Target size={18} color="#4C4BEA" />, title: "系统体系·全科覆盖", desc: "从民法到刑法，行政法到诉讼法，一门课搞定全部科目，不留盲区" },
        { icon: <Zap size={18} color="#F5A623" />, title: "真题导向·精准押题", desc: "深度解析2014—2023年全部真题，找到命题规律，预判高频考点" },
        { icon: <BookOpen size={18} color="#5DA765" />, title: "主观批改·逐字精评", desc: "20次一对一批改，王晓峰老师亲自点评，答题逻辑全面提升" },
        { icon: <Shield size={18} color="#C0385A" />, title: "班主任全程陪跑", desc: "专属班主任制定学习计划，每周打卡督学，考前冲刺不掉队" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&auto=format",
      caption: "系统学习 · 高效备考",
    },
    {
      kind: "timeline",
      heading: "备考全程路线图",
      steps: [
        { phase: "第一阶段", title: "基础精讲", detail: "全科知识体系搭建，夯实基础", color: "#4C4BEA" },
        { phase: "第二阶段", title: "强化刷题", detail: "章节配套题库，查漏补缺", color: "#7B6CF5" },
        { phase: "第三阶段", title: "真题精解", detail: "历年真题全解析，把握命题规律", color: "#F5A623" },
        { phase: "第四阶段", title: "主观冲刺", detail: "案例精讲+批改，主观题突破", color: "#5DA765" },
        { phase: "第五阶段", title: "模拟上阵", detail: "6套模拟卷，考场状态全模拟", color: "#C0385A" },
      ],
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Shield size={16} color="#5DA765" />, text: "永久回看 · 课程内容永久有效" },
        { icon: <Gift size={16} color="#F5A623" />, text: "资料齐全 · 讲义题库全套配备" },
        { icon: <Users size={16} color="#4C4BEA" />, text: "班主任督学 · 全程不掉队" },
        { icon: <Trophy size={16} color="#C0385A" />, text: "上岸学员社群 · 经验直接传授" },
      ],
    },
  ],
  p2: [
    {
      kind: "hero",
      title: "客观题·精英突破",
      subtitle: "卷一卷二系统精讲\n直播答疑 · 实时互动",
      accent: "#4C4BEA",
      bg: "linear-gradient(135deg, #0f3460 0%, #1a5fa8 60%, #4C4BEA 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Clock size={20} color="#4C4BEA" />, value: "220", label: "精讲课时" },
        { icon: <Users size={20} color="#4C4BEA" />, value: "5312+", label: "已报名学员" },
        { icon: <Wifi size={20} color="#4C4BEA" />, value: "8次", label: "月度直播" },
        { icon: <BookOpen size={20} color="#4C4BEA" />, value: "8000+", label: "配套题目" },
      ],
    },
    {
      kind: "features",
      heading: "为什么选这门课？",
      items: [
        { icon: <Target size={18} color="#4C4BEA" />, title: "双卷全覆盖", desc: "卷一（民商经济法）+ 卷二（刑行诉讼法）双线并进，不偏科" },
        { icon: <Wifi size={18} color="#C0385A" />, title: "月度直播答疑", desc: "每月一次直播集中答疑，实时解决学习疑惑，互动感超强" },
        { icon: <Zap size={18} color="#F5A623" />, title: "真题全精解", desc: "2019—2023年真题逐题讲解，找到出题逻辑，举一反三" },
        { icon: <BookOpen size={18} color="#5DA765" />, title: "章节即时练习", desc: "学完一章立刻刷题，8000+题库覆盖全考点，学以致用" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop&auto=format",
      caption: "名师精讲 · 实时互动",
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Shield size={16} color="#5DA765" />, text: "有效期至2024年客观题考试结束" },
        { icon: <Wifi size={16} color="#4C4BEA" />, text: "直播回放 · 错过也能补看" },
        { icon: <Gift size={16} color="#F5A623" />, text: "讲义配套 · 章节知识点一览" },
        { icon: <Users size={16} color="#C0385A" />, text: "学员社群 · 互助备考不孤单" },
      ],
    },
  ],
  p3: [
    {
      kind: "hero",
      title: "主观题·精讲批改",
      subtitle: "前高院法官亲授答题逻辑\n10次一对一批改服务",
      accent: "#3A7A46",
      bg: "linear-gradient(135deg, #1a3a22 0%, #3A7A46 60%, #5DA765 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Clock size={20} color="#3A7A46" />, value: "60", label: "精讲课时" },
        { icon: <BookOpen size={20} color="#3A7A46" />, value: "60+", label: "案例精解" },
        { icon: <Trophy size={20} color="#3A7A46" />, value: "10次", label: "一对一批改" },
        { icon: <Users size={20} color="#3A7A46" />, value: "1893+", label: "已报名学员" },
      ],
    },
    {
      kind: "features",
      heading: "主观题突破核心方法",
      items: [
        { icon: <Target size={18} color="#3A7A46" />, title: "裁判思维·答题逻辑", desc: "王晓峰老师以法官视角解析案例，学会从裁判角度组织答案" },
        { icon: <BookOpen size={18} color="#4C4BEA" />, title: "60+真题案例精解", desc: "历年全部主观题逐题精讲，掌握各类型案例的答题框架" },
        { icon: <Zap size={18} color="#F5A623" />, title: "答题模板与规范", desc: "总结高分答案的写作范式，让阅卷老师一眼看到得分点" },
        { icon: <Shield size={18} color="#C0385A" />, title: "批改+点评精进", desc: "10次作业提交，老师逐字批改，精准指出丢分原因与改进方向" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&auto=format",
      caption: "深度批改 · 精准提分",
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Shield size={16} color="#5DA765" />, text: "10次批改 · 老师逐字点评" },
        { icon: <Target size={16} color="#3A7A46" />, text: "答题模板 · 规范训练手册" },
        { icon: <Gift size={16} color="#F5A623" />, text: "押题资料 · 考前重点预测" },
        { icon: <Trophy size={16} color="#C0385A" />, text: "上岸学员经验帖 · 免费获取" },
      ],
    },
  ],
  p4: [
    {
      kind: "hero",
      title: "考前30天·极速冲刺",
      subtitle: "李东明老师每晚直播带练\n押题命中 · 高效上岸",
      accent: "#C0385A",
      bg: "linear-gradient(135deg, #5a0a28 0%, #C0385A 60%, #e86b8a 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Wifi size={20} color="#C0385A" />, value: "30天", label: "直播天数" },
        { icon: <Clock size={20} color="#C0385A" />, value: "60h+", label: "直播总时长" },
        { icon: <Users size={20} color="#C0385A" />, value: "3102+", label: "已报名学员" },
        { icon: <Trophy size={20} color="#C0385A" />, value: "3套", label: "模拟试卷" },
      ],
    },
    {
      kind: "features",
      heading: "直播课核心价值",
      items: [
        { icon: <Wifi size={18} color="#C0385A" />, title: "每晚实时直播", desc: "李东明老师亲自主播，考点串讲+实时答疑，不是录播是真·直播" },
        { icon: <Target size={18} color="#4C4BEA" />, title: "押题精准命中", desc: "深度研究历年命题规律，考前精准押题，命中率极高" },
        { icon: <Zap size={18} color="#F5A623" />, title: "全科极速串讲", desc: "30天覆盖全科核心高频考点，帮你在有限时间内最大化分数" },
        { icon: <BookOpen size={18} color="#5DA765" />, title: "模拟考试三套", desc: "全真模拟考试环境，考前查漏补缺，锁定最终得分区间" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop&auto=format",
      caption: "实时直播 · 同步冲刺",
    },
    {
      kind: "timeline",
      heading: "30天冲刺日程一览",
      steps: [
        { phase: "第1–10天", title: "民法+刑法", detail: "高频考点极速串讲", color: "#4C4BEA" },
        { phase: "第11–20天", title: "行政+诉讼法", detail: "重点突破+模拟练习", color: "#C0385A" },
        { phase: "第21–25天", title: "商经+其他", detail: "全科收尾冲刺", color: "#F5A623" },
        { phase: "第26–30天", title: "押题+答疑", detail: "终极押题+考前心理辅导", color: "#5DA765" },
      ],
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Wifi size={16} color="#C0385A" />, text: "直播回放永久可看" },
        { icon: <Shield size={16} color="#5DA765" />, text: "课程于2024年9月1日开课" },
        { icon: <Gift size={16} color="#F5A623" />, text: "押题讲义 · 考前极速手册" },
        { icon: <Users size={16} color="#4C4BEA" />, text: "考生专属群 · 互助答疑" },
      ],
    },
  ],
  p5: [
    {
      kind: "hero",
      title: "碎片时间·高效备考",
      subtitle: "民法音频精讲 68讲·52小时\n通勤路上听出高分",
      accent: "#1A8B8B",
      bg: "linear-gradient(135deg, #0a3a3a 0%, #1A8B8B 60%, #3abfbf 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Mic size={20} color="#1A8B8B" />, value: "68讲", label: "音频总数" },
        { icon: <Clock size={20} color="#1A8B8B" />, value: "52h", label: "总时长" },
        { icon: <Users size={20} color="#1A8B8B" />, value: "4217+", label: "已购学员" },
        { icon: <Zap size={20} color="#1A8B8B" />, value: "0.75x–2x", label: "倍速播放" },
      ],
    },
    {
      kind: "features",
      heading: "音频课四大使用场景",
      items: [
        { icon: <Mic size={18} color="#1A8B8B" />, title: "通勤路上随时听", desc: "地铁、公交、步行全程可用，把原本碎片化的时间转化为有效备考时长" },
        { icon: <Zap size={18} color="#F5A623" />, title: "倍速灵活掌控", desc: "0.75x–2x倍速自由切换，熟悉的内容加速过，重点难点放慢听" },
        { icon: <BookOpen size={18} color="#4C4BEA" />, title: "逐字稿同步下载", desc: "每讲配套逐字稿PDF，听完后随时翻阅，加深理解与记忆" },
        { icon: <Shield size={18} color="#5DA765" />, title: "离线下载不限流", desc: "提前下载好，无网络环境照常学习，飞机地铁不断课" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=500&fit=crop&auto=format",
      caption: "随时随地 · 高效利用碎片时间",
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Shield size={16} color="#5DA765" />, text: "永久有效 · 购买后终身可听" },
        { icon: <Gift size={16} color="#1A8B8B" />, text: "逐字稿PDF · 每讲配套下载" },
        { icon: <Zap size={16} color="#F5A623" />, text: "知识点速记卡 · 睡前快速复习" },
        { icon: <Shield size={16} color="#4C4BEA" />, text: "离线下载 · 无网络畅听" },
      ],
    },
  ],
  p6: [
    {
      kind: "hero",
      title: "全科串讲·高效过关",
      subtitle: "220讲·160小时 名师联袂主讲\n适合有基础的二战学员",
      accent: "#1A8B8B",
      bg: "linear-gradient(135deg, #1a3060 0%, #4C4BEA 40%, #1A8B8B 100%)",
    },
    {
      kind: "stats",
      items: [
        { icon: <Mic size={20} color="#1A8B8B" />, value: "220讲", label: "音频总数" },
        { icon: <Clock size={20} color="#1A8B8B" />, value: "160h", label: "总时长" },
        { icon: <Users size={20} color="#1A8B8B" />, value: "2091+", label: "已购学员" },
        { icon: <BookOpen size={20} color="#1A8B8B" />, value: "6000+", label: "配套题目" },
      ],
    },
    {
      kind: "features",
      heading: "名师联袂·各科权威主讲",
      items: [
        { icon: <Mic size={18} color="#4C4BEA" />, title: "张明远主讲民法", desc: "16年教学经验，民法学博士，框架系统、案例鲜活，民法难题迎刃而解" },
        { icon: <Mic size={18} color="#C0385A" />, title: "李东明主讲刑法", desc: "刑法学副教授，理论深厚，结合真实案例解析犯罪构成，刑法不再难" },
        { icon: <Mic size={18} color="#3A7A46" />, title: "王晓峰主讲主观", desc: "前高院法官，以裁判思维讲答题，主观题答题规范大幅提升" },
        { icon: <Mic size={18} color="#A87000" />, title: "多位老师覆盖诸科", desc: "行政法、诉讼法、商法、经济法均由各科权威名师主讲，无短板" },
      ],
    },
    {
      kind: "photo",
      src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=500&fit=crop&auto=format",
      caption: "多位名师 · 全科串讲",
    },
    {
      kind: "guarantee",
      items: [
        { icon: <Shield size={16} color="#5DA765" />, text: "有效期至2025年考试结束" },
        { icon: <BookOpen size={16} color="#4C4BEA" />, text: "讲义PDF + 思维导图全套" },
        { icon: <Zap size={16} color="#F5A623" />, text: "倍速播放 + 离线下载" },
        { icon: <Users size={16} color="#1A8B8B" />, text: "二战学员专属社群答疑" },
      ],
    },
  ],
};

function DetailImageSection({ panels, accentColor }: { panels: DetailPanel[]; accentColor: string }) {
  return (
    <div className="bg-white mt-3 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F4F5F7] flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: accentColor }} />
        <p className="text-[15px] font-semibold text-[#171925]">课程详情</p>
      </div>
      {panels.map((panel, i) => {
        if (panel.kind === "hero") {
          return (
            <div
              key={i}
              className="relative px-6 py-10 flex flex-col items-center text-center"
              style={{ background: panel.bg }}
            >
              <div className="w-12 h-0.5 rounded-full bg-white/40 mb-4" />
              <p className="text-[22px] font-bold text-white leading-snug mb-3">{panel.title}</p>
              <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-line">{panel.subtitle}</p>
              <div className="w-12 h-0.5 rounded-full bg-white/40 mt-4" />
            </div>
          );
        }
        if (panel.kind === "stats") {
          return (
            <div key={i} className="grid grid-cols-4 border-b border-[#F4F5F7]">
              {panel.items.map((s, si) => (
                <div
                  key={si}
                  className={`flex flex-col items-center py-4 gap-1 ${si < panel.items.length - 1 ? "border-r border-[#F4F5F7]" : ""}`}
                >
                  {s.icon}
                  <p className="text-[15px] font-bold text-[#171925] mt-0.5">{s.value}</p>
                  <p className="text-[10px] text-[#707684]">{s.label}</p>
                </div>
              ))}
            </div>
          );
        }
        if (panel.kind === "features") {
          return (
            <div key={i} className="px-4 py-5 border-b border-[#F4F5F7]">
              <p className="text-[14px] font-bold text-[#171925] mb-4 text-center">{panel.heading}</p>
              <div className="space-y-4">
                {panel.items.map((f, fi) => (
                  <div key={fi} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F5F7] flex items-center justify-center flex-none">{f.icon}</div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#171925]">{f.title}</p>
                      <p className="text-[12px] text-[#707684] mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (panel.kind === "photo") {
          return (
            <div key={i} className="border-b border-[#F4F5F7]">
              <img src={panel.src} alt={panel.caption ?? ""} className="w-full h-[180px] object-cover" />
              {panel.caption && (
                <p className="text-[11px] text-[#707684] text-center py-2 bg-[#F4F5F7]">{panel.caption}</p>
              )}
            </div>
          );
        }
        if (panel.kind === "timeline") {
          return (
            <div key={i} className="px-4 py-5 border-b border-[#F4F5F7]">
              <p className="text-[14px] font-bold text-[#171925] mb-4 text-center">{panel.heading}</p>
              <div className="relative">
                <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[#E5E7ED]" />
                <div className="space-y-4">
                  {panel.steps.map((step, si) => (
                    <div key={si} className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-none z-10 text-white text-[10px] font-bold text-center leading-tight"
                        style={{ background: step.color }}
                      >
                        {step.phase.replace("第", "").replace("阶段", "").replace("天", "d")}
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-[13px] font-semibold text-[#171925]">{step.title}</p>
                        <p className="text-[12px] text-[#707684]">{step.detail}</p>
                      </div>
                      <span className="text-[10px] text-[#C0C5D0] pt-2 flex-none">{step.phase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        if (panel.kind === "guarantee") {
          return (
            <div key={i} className="px-4 py-4 bg-[#F8F9FF]">
              <p className="text-[12px] font-semibold text-[#707684] mb-3 text-center">服务承诺</p>
              <div className="grid grid-cols-2 gap-2">
                {panel.items.map((g, gi) => (
                  <div key={gi} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
                    <div className="flex-none">{g.icon}</div>
                    <p className="text-[11px] text-[#5F6574] leading-snug">{g.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

interface Props {
  nav: NavContextType;
  productId: string;
}

export default function ProductDetail({ nav, productId }: Props) {
  const p = PRODUCTS.find((x) => x.id === productId) ?? PRODUCTS[0];
  const [purchaseSheet, setPurchaseSheet] = useState(false);
  const [syllabusExpanded, setSyllabusExpanded] = useState(false);

  const detailPanels = DETAIL_PANELS[p.id] ?? [];
  const teacherInfo = TEACHER_INFO[p.teacher ?? ""] ?? {
    title: "法考名师 · 执业律师",
    bio: "从事法律职业资格考试辅导多年，授课风格系统清晰，善于以案说法，深受学员喜爱。",
  };
  const syllabus = SYLLABI[p.id];
  const reviews = REVIEWS[p.id] ?? REVIEWS["p1"];
  const visibleItems = syllabusExpanded ? syllabus?.items : syllabus?.items.slice(0, 4);
  const typeColors = TYPE_LABEL_COLOR[p.type] ?? { bg: "#F0F0FF", text: "#4C4BEA" };

  const handlePurchase = () => {
    setPurchaseSheet(false);
    nav.navigate({ type: "purchase-success", productName: p.name, productId: p.id });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar
        onBack={nav.goBack}
        right={
          <button className="w-8 h-8 flex items-center justify-center">
            <Share2 size={18} color="#5F6574" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Cover with type overlay */}
        <div className="relative">
          <img src={p.image} alt={p.name} className="w-full h-[210px] object-cover bg-[#E5E7ED]" />
          {p.type === "音频课程" && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Headphones size={32} color="white" />
              </div>
            </div>
          )}
          {p.type === "直播课程" && (
            <div className="absolute bottom-3 left-4">
              <div className="flex items-center gap-2 bg-[#C0385A]/90 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[12px] font-semibold">直播课程</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white px-4 pt-4 pb-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Tag color="brand">{p.category}</Tag>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
              style={{ background: typeColors.bg, color: typeColors.text }}
            >
              {TYPE_ICON[p.type]}
              <span>{p.type}</span>
            </div>
            <Tag color="muted">{p.stage}</Tag>
          </div>
          <h1 className="text-[17px] font-bold text-[#171925] leading-snug mb-2">{p.name}</h1>
          <p className="text-[13px] text-[#5F6574] leading-relaxed">{p.brief}</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-[24px] font-bold text-[#4C4BEA]">¥{p.price.toLocaleString()}</span>
            {p.originalPrice && (
              <span className="text-[14px] text-[#C0C5D0] line-through">
                ¥{p.originalPrice.toLocaleString()}
              </span>
            )}
            {p.originalPrice && (
              <span className="text-[11px] text-white bg-[#FF7252] px-1.5 py-0.5 rounded font-semibold">
                省¥{(p.originalPrice - p.price).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <p className="text-[12px] text-[#707684]">已售 {p.sold.toLocaleString()} 份</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} fill="#F5A623" color="#F5A623" />
              ))}
              <span className="text-[11px] text-[#707684] ml-1">4.9</span>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="bg-white mt-3 px-4 py-4">
          <p className="text-[15px] font-semibold text-[#171925] mb-3">课程包含</p>
          <div className="space-y-2.5">
            {p.includes.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle size={15} color="#5DA765" className="mt-0.5 flex-none" />
                <p className="text-[13px] text-[#5F6574]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher intro */}
        <div className="bg-white mt-3 px-4 py-4">
          <p className="text-[15px] font-semibold text-[#171925] mb-3">主讲老师</p>
          <div className="flex items-start gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-none shadow"
              style={{
                background: p.teacher === "多位名师"
                  ? "linear-gradient(135deg, #4C4BEA 0%, #C0385A 100%)"
                  : "linear-gradient(135deg, #4C4BEA 0%, #7B6CF5 100%)",
              }}
            >
              <span className="text-[20px] font-bold text-white">
                {p.teacher === "多位名师" ? "多" : p.teacher?.[0] ?? "师"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#171925]">{p.teacher ?? "名师主讲"}</p>
              <p className="text-[11px] text-[#4C4BEA] mt-0.5 leading-snug">{teacherInfo.title}</p>
              <p className="text-[13px] text-[#5F6574] mt-2 leading-relaxed">{teacherInfo.bio}</p>
            </div>
          </div>
        </div>

        {/* Syllabus — adaptive by product type */}
        {syllabus && (
          <div className="bg-white mt-3 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-semibold text-[#171925]">{syllabus.heading}</p>
            </div>
            <div className="space-y-0">
              {visibleItems?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#F4F5F7] last:border-0">
                  <div className="w-[72px] flex-none">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{ background: typeColors.bg, color: typeColors.text }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="flex-1 text-[13px] text-[#171925] leading-snug">{item.title}</p>
                  <span className="text-[11px] text-[#707684] flex-none whitespace-nowrap">{item.meta}</span>
                </div>
              ))}
            </div>
            {syllabus.items.length > 4 && (
              <button
                onClick={() => setSyllabusExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-1 mt-2 py-2 text-[13px] text-[#4C4BEA] active:opacity-70"
              >
                {syllabusExpanded ? (
                  <>收起 <ChevronUp size={14} /></>
                ) : (
                  <>展开全部 {syllabus.items.length} 项 <ChevronDown size={14} /></>
                )}
              </button>
            )}
            <p className="text-[11px] text-[#C0C5D0] mt-2 text-center">{syllabus.footer}</p>
          </div>
        )}

        {/* Delivery */}
        <div className="bg-white mt-3 px-4 py-4">
          <p className="text-[15px] font-semibold text-[#171925] mb-2">交付方式</p>
          <p className="text-[13px] text-[#5F6574] leading-relaxed">{p.delivery}</p>
        </div>

        {/* Detail image panels */}
        {detailPanels.length > 0 && (
          <DetailImageSection panels={detailPanels} accentColor={typeColors.text} />
        )}

        {/* Reviews */}
        <div className="bg-white mt-3 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-semibold text-[#171925]">学员评价</p>
            <div className="flex items-center gap-1">
              <span className="text-[18px] font-bold text-[#4C4BEA]">4.9</span>
              <span className="text-[12px] text-[#707684]">/ 5.0</span>
            </div>
          </div>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className={`pb-3 ${i < reviews.length - 1 ? "border-b border-[#F4F5F7]" : ""}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4C4BEA] to-[#7B6CF5] flex items-center justify-center text-[11px] font-bold text-white">
                      {r.name[0]}
                    </div>
                    <span className="text-[12px] text-[#171925] font-medium">{r.name}</span>
                    {r.tag && (
                      <span className="text-[10px] text-[#5DA765] bg-[#EAF6EF] px-1.5 py-0.5 rounded">{r.tag}</span>
                    )}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} className={`text-[12px] ${si < r.stars ? "text-[#F5A623]" : "text-[#E5E7ED]"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-[#5F6574] leading-relaxed">{r.text}</p>
                <p className="text-[11px] text-[#C0C5D0] mt-1">{r.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-24" />
      </div>

      {/* Fixed purchase bar */}
      <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3 flex gap-3 items-center">
        <div>
          <p className="text-[11px] text-[#707684]">限时优惠</p>
          <p className="text-[18px] font-bold text-[#4C4BEA]">¥{p.price.toLocaleString()}</p>
        </div>
        <button
          onClick={() => setPurchaseSheet(true)}
          className="flex-1 h-12 bg-[#4C4BEA] text-white text-[15px] font-semibold rounded-lg active:bg-[#3D3CC8]"
        >
          立即购买
        </button>
      </div>

      {/* Purchase sheet */}
      <BottomSheet open={purchaseSheet} onClose={() => setPurchaseSheet(false)} title="确认购买">
        <div className="px-5 py-4">
          <div className="flex gap-3 mb-4 pb-4 border-b border-[#E5E7ED]">
            <img src={p.image} alt={p.name} className="w-16 h-12 object-cover rounded bg-[#E5E7ED] flex-none" />
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#171925] leading-snug mb-1">{p.name}</p>
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
                style={{ background: typeColors.bg, color: typeColors.text }}
              >
                {TYPE_ICON[p.type]}
                <span>{p.type}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-[#5F6574]">课程原价</span>
              <span className="text-[#707684] line-through">¥{(p.originalPrice ?? p.price).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-[#5F6574]">限时优惠</span>
              <span className="text-[#FF7252]">−¥{((p.originalPrice ?? p.price) - p.price).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[15px] font-semibold pt-2 border-t border-[#E5E7ED]">
              <span className="text-[#171925]">实付金额</span>
              <span className="text-[#4C4BEA]">¥{p.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#F4F5F7] rounded-lg p-3 mb-5">
            <p className="text-[12px] text-[#707684] leading-relaxed">
              购买后系统将自动开通课程权限。如需发票，请在"订单与已购"中申请。
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPurchaseSheet(false)}
              className="flex-1 h-12 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574] active:bg-[#F4F5F7]"
            >
              取消
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 h-12 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
            >
              确认支付 ¥{p.price.toLocaleString()}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
