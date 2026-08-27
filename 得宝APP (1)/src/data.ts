export const SUBJECTS = [
  { id: "civil", name: "民法", color: "#F0F0FF", textColor: "#4C4BEA" },
  { id: "criminal", name: "刑法", color: "#FFF1E8", textColor: "#D2691E" },
  { id: "admin", name: "行政法", color: "#EAF7F7", textColor: "#1A8B8B" },
  { id: "civil-proc", name: "民事诉讼法", color: "#EAF6EF", textColor: "#3A7A46" },
  { id: "crim-proc", name: "刑事诉讼法", color: "#FFF5DD", textColor: "#A87000" },
  { id: "commercial", name: "商法", color: "#FFF0F5", textColor: "#C0385A" },
  { id: "economic", name: "经济法", color: "#EDF5FF", textColor: "#1A5FA8" },
  { id: "intl", name: "国际法", color: "#EAF6EF", textColor: "#3A7A46" },
  { id: "jurisprudence", name: "法理学", color: "#F0F0FF", textColor: "#4C4BEA" },
  { id: "constitutional", name: "宪法", color: "#FFF5DD", textColor: "#A87000" },
];

export const SUBJECTIVE_QUESTIONS = [
  {
    id: "q1",
    year: "2023",
    title: "甲公司股权转让与债权人保护",
    summary: "甲公司为有限责任公司，股东乙拟将其持有的40%股权转让给公司外部的丙，其他股东丁、戊主张优先购买权并发生争议，同时甲公司对外负有债务……",
    difficulty: "难",
    subCount: 4,
    suggestMinutes: 45,
    status: "draft" as const,
    subject: "民法",
    content: `甲有限责任公司（以下简称甲公司）的股东为乙（持股40%）、丁（持股35%）、戊（持股25%）。

2023年3月，乙与丙签订股权转让协议，约定将乙持有的40%股权以300万元的价格转让给丙，丁、戊明确表示放弃优先购买权。此后乙反悔，主张该协议无效。

与此同时，甲公司的债权人己持有到期债权100万元，甲公司以资金周转困难为由拒绝偿还。己向法院申请强制执行甲公司财产，发现甲公司账面资产严重不足，但发现甲公司曾于2022年12月将一批价值60万元的设备以20万元的低价出售给与甲公司有关联的庚公司。

【问题】`,
    questions: [
      {
        id: "q1-1",
        num: 1,
        text: "乙主张股权转让协议无效的理由是否成立？请说明理由。（10分）",
      },
      {
        id: "q1-2",
        num: 2,
        text: "己能否对甲公司向庚公司低价出售设备的行为行使撤销权？请说明理由及撤销权的行使方式。（15分）",
      },
      {
        id: "q1-3",
        num: 3,
        text: "如甲公司无力偿还己的债务，己能否要求乙、丁、戊对甲公司的债务承担责任？请分析各股东的责任。（10分）",
      },
      {
        id: "q1-4",
        num: 4,
        text: "假设乙最终完成股权转让，丙成为甲公司股东，公司章程未就此变更，丙的股东资格何时取得？（5分）",
      },
    ],
  },
  {
    id: "q2",
    year: "2022",
    title: "不当得利与无因管理综合案例",
    summary: "甲将一笔款项误转入乙的账户，乙在不知情的情况下将该款项用于购置一辆汽车，后甲发现并主张返还……",
    difficulty: "中",
    subCount: 3,
    suggestMinutes: 35,
    status: "done" as const,
    subject: "民法",
    content: `2022年5月，甲因操作失误将50万元转入乙的银行账户（甲原本打算转给与乙同名的丙）。乙发现到账后，以为是朋友庚赠与，遂将该款项中的40万元用于购置一辆汽车（市场价40万元），其余10万元存入自己账户。

同月，乙的邻居丁因突发疾病住院，乙在未经丁委托的情况下，垫付了丁的医疗费2万元，并照料丁的房屋一个月（期间支出费用0.5万元）。

甲事后发现转账错误，要求乙返还50万元。乙以汽车已购置为由拒绝返还40万元，并主张其为丁支出的费用应由丁偿还。

【问题】`,
    questions: [
      {
        id: "q2-1",
        num: 1,
        text: "甲能否要求乙返还50万元？乙以购车为由拒绝返还40万元是否有法律依据？（15分）",
      },
      {
        id: "q2-2",
        num: 2,
        text: "乙为丁垫付医疗费及照料房屋的行为性质如何认定？乙能否向丁主张费用偿还？（15分）",
      },
      {
        id: "q2-3",
        num: 3,
        text: "如乙已将购置的汽车以35万元转让给善意第三方戊，甲应如何救济其权利？（10分）",
      },
    ],
  },
  {
    id: "q3",
    year: "2023",
    title: "合同解除与违约责任",
    summary: "甲与乙签订购房合同，后因市场变化甲主张解除合同并要求返还定金，双方就违约责任归属产生争议……",
    difficulty: "中",
    subCount: 3,
    suggestMinutes: 30,
    status: "none" as const,
    subject: "民法",
    content: `2023年1月，甲（购房人）与乙（开发商）签订商品房预售合同，约定购买乙开发的A小区3号楼501室，总价200万元，甲向乙支付定金20万元，余款在办理贷款手续后支付。合同约定乙应于2023年12月31日前交房，逾期交房每日按合同总价0.1‰支付违约金。

合同签订后，甲向银行申请贷款，银行以甲负债率过高为由拒绝放款。甲向乙说明情况，请求退还定金并解除合同。乙认为甲未能取得贷款属于甲的过错，不同意解除合同，坚持要求甲支付余款。

2023年12月31日，因施工材料供应问题，乙未能如期交房，实际于2024年3月1日才完成交付（按合同计算逾期60天）。甲主张乙违约，要求支付违约金并赔偿因逾期交房导致的额外租房费用1.2万元。

【问题】`,
    questions: [
      {
        id: "q3-1",
        num: 1,
        text: "甲未能取得银行贷款的法律后果应如何处理？甲能否解除合同并要求返还定金？（15分）",
      },
      {
        id: "q3-2",
        num: 2,
        text: "乙逾期60天交房，甲主张的违约金及额外租房费用赔偿应如何处理？（15分）",
      },
      {
        id: "q3-3",
        num: 3,
        text: "如双方约定的违约金明显过高，乙能否请求法院予以调整？调整的标准是什么？（10分）",
      },
    ],
  },
  {
    id: "q4",
    year: "2022",
    title: "物权变动与善意取得",
    summary: "甲将房屋登记在乙名下，后乙擅自将房屋出售给丙，引发所有权争议及第三人保护问题……",
    difficulty: "易",
    subCount: 2,
    suggestMinutes: 25,
    status: "none" as const,
    subject: "民法",
    content: `甲为规避限购政策，借用其好友乙之名购置了一套住宅（以下简称"涉案房屋"），房屋登记在乙名下，购房款全部由甲支付，双方签有书面的借名购房协议。

2022年8月，乙擅自以200万元的价格将涉案房屋出售给丙，并完成了过户登记。丙系善意购房，支付了合理对价，不知道乙与甲之间的借名购房关系。

甲得知后，以乙无权处分为由，主张丙不能取得房屋所有权，要求乙返还房屋并赔偿损失。

【问题】`,
    questions: [
      {
        id: "q4-1",
        num: 1,
        text: "甲乙之间的借名购房协议是否有效？甲能否依据该协议取得涉案房屋的所有权？（15分）",
      },
      {
        id: "q4-2",
        num: 2,
        text: "丙能否依善意取得制度取得涉案房屋的所有权？甲的损失应由谁承担？（15分）",
      },
    ],
  },
  {
    id: "q5",
    year: "2021",
    title: "婚姻家庭与继承综合案例",
    summary: "甲乙结婚后购置房产，离婚时就财产分割及子女抚养发生争议，同时涉及甲父的遗产继承问题……",
    difficulty: "难",
    subCount: 4,
    suggestMinutes: 50,
    status: "none" as const,
    subject: "民法",
    content: `甲（男）与乙（女）于2015年结婚，婚后共同出资购置了一套住宅（以下简称"婚房"），登记在甲名下，贷款尚未还清。甲的父亲丙于2020年去世，留有遗嘱将其名下一套旧房（价值80万元）留给甲，但丙的配偶丁（甲的母亲）认为遗嘱无效。

2023年，甲乙感情破裂，协议离婚未果，甲向法院起诉离婚。双方就婚房分割、贷款承担、子女（丙12岁）抚养权及抚养费发生争议。乙另主张甲在婚姻存续期间多次向其隐瞒转移财产。

【问题】`,
    questions: [
      {
        id: "q5-1",
        num: 1,
        text: "婚房应如何分割？剩余贷款应如何处理？（15分）",
      },
      {
        id: "q5-2",
        num: 2,
        text: "丙的遗嘱是否有效？如遗嘱有效，丁能否主张权利？如遗嘱无效，遗产如何分配？（15分）",
      },
      {
        id: "q5-3",
        num: 3,
        text: "子女抚养权的判决应考虑哪些因素？抚养费标准如何确定？（10分）",
      },
      {
        id: "q5-4",
        num: 4,
        text: "乙主张甲转移财产，人民法院应如何处理？对甲的转移财产行为有何法律后果？（10分）",
      },
    ],
  },
];

export const PRODUCTS = [
  {
    id: "p1",
    name: "2024法考全程班（主客一体·视频精讲）",
    category: "主客一体",
    type: "视频课程",
    teacher: "张明远",
    price: 3980,
    originalPrice: 5200,
    sold: 2847,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=450&fit=crop&auto=format",
    brief: "覆盖客观题全科+主观题冲刺，名师全程讲授，配套题库、模拟卷和主观题批改服务。",
    stage: "全程备考",
    autoStart: true,
    includes: [
      "客观题精讲课（全科共420课时）",
      "客观题章节题库（12,000+题）",
      "历年真题精讲（2014–2023）",
      "主观题案例精讲（80+案例）",
      "主观题批改服务（20次）",
      "考前冲刺模拟卷（6套）",
      "班主任1对1学习规划",
    ],
    delivery: "购买后立即开通，按课程计划解锁课节，有效期至2024年考试结束。",
  },
  {
    id: "p2",
    name: "2024客观题精英班（视频+直播）",
    category: "客观题",
    type: "视频课程",
    teacher: "张明远",
    price: 1980,
    originalPrice: 2800,
    sold: 5312,
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop&auto=format",
    brief: "系统精讲客观题全科知识点，覆盖卷一卷二，配套章节练习和历年真题解析。",
    stage: "客观题备考",
    autoStart: true,
    includes: [
      "客观题精讲课（全科220课时）",
      "章节配套题库（8,000+题）",
      "历年真题精解（2019–2023）",
      "每月直播答疑（共8次）",
    ],
    delivery: "购买后48小时内开通，有效期至2024年客观题考试结束。",
  },
  {
    id: "p3",
    name: "2024主观题冲刺班（精讲+批改）",
    category: "主观题",
    type: "视频课程",
    teacher: "王晓峰",
    price: 1280,
    originalPrice: 1680,
    sold: 1893,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop&auto=format",
    brief: "主观题专项突破，以历年真题案例为核心，精讲答题逻辑与规范，配套批改服务。",
    stage: "主观题备考",
    autoStart: false,
    includes: [
      "主观题精讲课（共60课时）",
      "历年真题案例精解（60+案例）",
      "主观题批改（10次）",
      "答题模板与规范训练",
    ],
    delivery: "购买后开通，主观题考试前两个月起按计划推送课程，有效期至2024年主观题考试结束。",
  },
  {
    id: "p4",
    name: "法考直播冲刺班（考前30天）",
    category: "客观题",
    type: "直播课程",
    teacher: "李东明",
    price: 680,
    originalPrice: 880,
    sold: 3102,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&auto=format",
    brief: "考前30天密集直播冲刺，押题预测、重点串讲，配合模拟考试查漏补缺。",
    stage: "冲刺阶段",
    autoStart: false,
    includes: [
      "直播冲刺课（30天×2小时）",
      "模拟试卷（3套）",
      "直播回放（永久可看）",
    ],
    delivery: "课程于2024年9月1日开课，购买后自动激活直播权限。",
  },
  {
    id: "p5",
    name: "民法音频精讲（通勤随听版）",
    category: "客观题",
    type: "音频课程",
    teacher: "张明远",
    price: 398,
    originalPrice: 598,
    sold: 4217,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=450&fit=crop&auto=format",
    brief: "全程音频授课，利用碎片时间随时随地听课，配套逐字稿与知识点卡片，通勤路上高效备考。",
    stage: "客观题备考",
    autoStart: true,
    includes: [
      "民法音频精讲（共68讲·约52小时）",
      "每讲逐字稿PDF",
      "知识点速记卡片",
      "倍速播放（0.75x–2x）",
      "离线下载（手机端）",
    ],
    delivery: "购买后立即开通，永久有效，支持离线下载。",
  },
  {
    id: "p6",
    name: "法考全科音频串讲班",
    category: "主客一体",
    type: "音频课程",
    teacher: "多位名师",
    price: 880,
    originalPrice: 1280,
    sold: 2091,
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop&auto=format",
    brief: "名师精讲全科核心考点，音频形式高效输出，配合题库随时检验，适合已有基础的二战考生。",
    stage: "全程备考",
    autoStart: false,
    includes: [
      "全科音频精讲（共220讲·约160小时）",
      "配套章节题库（6,000+题）",
      "逐讲讲义PDF",
      "知识框架思维导图",
      "倍速播放与离线下载",
    ],
    delivery: "购买后48小时内开通，有效期至2025年考试结束。",
  },
];

export const COURSES = [
  {
    id: "c1",
    name: "民法精讲课（2024版）",
    teacher: "张明远",
    progress: 42,
    currentLesson: "第18讲：物权变动的公示与公信原则",
    totalLessons: 68,
    completedLessons: 28,
    lastStudied: "昨天 21:30",
    type: "录播",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=225&fit=crop&auto=format",
    productId: "p2",
    chapters: [
      {
        title: "第一章 民法总则",
        lessons: [
          { id: "l1", title: "第1讲：民法的性质与体系", duration: "42:30", done: true },
          { id: "l2", title: "第2讲：民事法律关系", duration: "38:15", done: true },
          { id: "l3", title: "第3讲：民事主体——自然人", duration: "55:20", done: true },
          { id: "l4", title: "第4讲：民事主体——法人", duration: "48:00", done: true },
        ],
      },
      {
        title: "第二章 物权法",
        lessons: [
          { id: "l5", title: "第15讲：物权概述与分类", duration: "44:10", done: true },
          { id: "l6", title: "第16讲：物权的效力", duration: "39:45", done: true },
          { id: "l7", title: "第17讲：物权变动总论", duration: "51:30", done: true },
          { id: "l8", title: "第18讲：物权变动的公示与公信原则", duration: "58:00", done: false, current: true },
          { id: "l9", title: "第19讲：不动产登记", duration: "46:20", done: false },
          { id: "l10", title: "第20讲：动产交付", duration: "35:00", done: false },
        ],
      },
      {
        title: "第三章 合同法",
        lessons: [
          { id: "l11", title: "第28讲：合同的成立", duration: "52:15", done: false },
          { id: "l12", title: "第29讲：合同的效力", duration: "48:30", done: false },
          { id: "l13", title: "第30讲：合同的履行", duration: "44:00", done: false },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "刑法体系课（2024版）",
    teacher: "李东明",
    progress: 18,
    currentLesson: "第8讲：犯罪的未完成形态",
    totalLessons: 72,
    completedLessons: 13,
    lastStudied: "3天前",
    type: "录播",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&auto=format",
    productId: "p1",
    chapters: [
      {
        title: "第一章 刑法总论",
        lessons: [
          { id: "l20", title: "第1讲：刑法的概念与原则", duration: "38:00", done: true },
          { id: "l21", title: "第2讲：犯罪构成理论", duration: "62:30", done: true },
          { id: "l22", title: "第8讲：犯罪的未完成形态", duration: "55:00", done: false, current: true },
        ],
      },
    ],
  },
];

export const ORDERS = [
  {
    id: "o1",
    productName: "2024法考全程班（主客一体·视频精讲）",
    orderNo: "DB2024031200001",
    date: "2024-03-12 14:32",
    amount: 3980,
    status: "已完成",
    productId: "p1",
    courseId: "c1",
  },
  {
    id: "o2",
    productName: "法考直播冲刺班（考前30天）",
    orderNo: "DB2024052800078",
    date: "2024-05-28 09:15",
    amount: 680,
    status: "待开课",
    productId: "p4",
    courseId: null,
  },
];

export const OBJECTIVE_QUESTIONS = [
  {
    id: "oq1",
    subject: "民法",
    year: "2023",
    num: 1,
    stem: "甲公司（出卖人）与乙公司（买受人）签订买卖合同，约定甲以分期付款方式向乙出售一批货物，乙未按期付款超过合同金额五分之一后，甲主张解除合同。关于甲的主张，下列说法正确的是：",
    options: [
      { key: "A", text: "甲可以直接解除合同，无需通知乙" },
      { key: "B", text: "甲须经催告乙在合理期限内付款，乙不履行时，甲可解除合同" },
      { key: "C", text: "合同中无明确约定时，甲不能主张解除合同" },
      { key: "D", text: "甲可以行使法定解除权，须以通知方式解除，通知到达乙时合同解除" },
    ],
    answer: "D",
    explanation: "根据《民法典》第634条，分期付款的买受人未支付到期价款的数额达到全部价款五分之一，经催告后在合理期限内仍未支付的，出卖人可以请求买受人支付全部价款或者解除合同。但本题需注意，法定解除权的行使须以通知方式，通知到达对方时合同解除。故D项正确。",
    point: "分期付款买卖与法定解除权",
    lawBasis: "《中华人民共和国民法典》第634条",
  },
  {
    id: "oq2",
    subject: "民法",
    year: "2023",
    num: 2,
    stem: "甲于2020年1月将一幅名画借给乙展览，约定展览结束后归还。乙展览结束后，将名画转卖给不知情的丙，丙支付合理对价并取得名画。甲于2023年6月发现后，向法院起诉要求丙返还名画。下列说法正确的是：",
    options: [
      { key: "A", text: "丙构成善意取得，甲无权要求丙返还名画" },
      { key: "B", text: "名画属于遗失物，善意取得不适用，甲可要求丙返还" },
      { key: "C", text: "甲的请求已超过诉讼时效，应被驳回" },
      { key: "D", text: "丙构成善意取得，但甲可以就价款向乙主张不当得利返还" },
    ],
    answer: "A",
    explanation: "名画系甲委托乙保管（借用），乙占有系有权占有，非遗失物。乙将名画转卖给善意第三人丙，丙支付合理对价，满足善意取得的构成要件，丙依法取得名画所有权。甲不能要求丙返还，只能向乙主张损害赔偿。诉讼时效从甲知道或应当知道之日起算，2023年6月发现，尚未超过诉讼时效。故A项正确。",
    point: "动产善意取得与遗失物区别",
    lawBasis: "《中华人民共和国民法典》第311条",
  },
  {
    id: "oq3",
    subject: "民法",
    year: "2022",
    num: 3,
    stem: "关于诉讼时效的适用，下列说法错误的是：",
    options: [
      { key: "A", text: "当事人可以协议延长或缩短诉讼时效期间" },
      { key: "B", text: "诉讼时效届满后，义务人的自愿履行不构成不当得利" },
      { key: "C", text: "诉讼时效届满，权利人的实体权利并不消灭，只是丧失胜诉权" },
      { key: "D", text: "权利人在诉讼时效期间内向义务人提出履行请求，诉讼时效中断" },
    ],
    answer: "A",
    explanation: "根据《民法典》第197条，诉讼时效的期间、计算方法以及中止、中断的事由由法律规定，当事人约定无效。故A项说法错误，是本题应选的答案。B项正确（时效届满后自愿履行属于对抗时效抗辩的放弃，不构成不当得利）。C项正确（诉讼时效届满消灭的是胜诉权，而非实体权利）。D项正确（权利人提出请求构成时效中断事由）。",
    point: "诉讼时效的性质与适用规则",
    lawBasis: "《中华人民共和国民法典》第197条",
  },
  {
    id: "oq4",
    subject: "民法",
    year: "2022",
    num: 4,
    stem: "甲（17岁，已参加工作）用自己工资购买了一台电脑，其父乙认为不必要，主张撤销该行为。下列说法正确的是：",
    options: [
      { key: "A", text: "甲系限制民事行为能力人，购买电脑需经乙同意或追认" },
      { key: "B", text: "甲以自己的劳动收入为主要生活来源，视为完全民事行为能力人，该购买行为有效" },
      { key: "C", text: "购买电脑属于与甲年龄、智力相适应的行为，乙无权撤销" },
      { key: "D", text: "乙作为法定代理人，有权撤销甲的该购买行为" },
    ],
    answer: "B",
    explanation: "根据《民法典》第18条第2款，16周岁以上的未成年人，以自己的劳动收入为主要生活来源的，视为完全民事行为能力人。甲17岁，已参加工作并以工资为生活来源，应视为完全民事行为能力人，其购买电脑的行为完全有效，乙无权干涉或撤销。故B项正确。",
    point: "限制民事行为能力人与拟制完全民事行为能力",
    lawBasis: "《中华人民共和国民法典》第18条",
  },
];
