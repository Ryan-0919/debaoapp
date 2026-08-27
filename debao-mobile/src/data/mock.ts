import {colors} from '@/theme';
import type {
  AppNotification,
  Course,
  Order,
  Product,
  Subject,
} from '@/types/domain';

export const subjects: Subject[] = [
  {id: 'civil', name: '民法', questionCount: 2380, color: colors.brandLight},
  {id: 'criminal', name: '刑法', questionCount: 1860, color: colors.apricot},
  {id: 'admin', name: '行政法', questionCount: 960, color: colors.celadon},
  {id: 'civil-proc', name: '民事诉讼法', questionCount: 1280, color: colors.mint},
  {id: 'crim-proc', name: '刑事诉讼法', questionCount: 1420, color: colors.gold},
  {id: 'commercial', name: '商法', questionCount: 1160, color: colors.rose},
  {id: 'economic', name: '经济法', questionCount: 880, color: colors.sky},
  {id: 'theory', name: '理论法', questionCount: 720, color: colors.brandLight},
];

export const courses: Course[] = [
  {id: 'c1', title: '民法体系精讲', teacher: '张明远', type: 'video', progress: 68, lessons: 42, accent: colors.brand},
  {id: 'c2', title: '刑法重点突破', teacher: '周子恒', type: 'audio', progress: 32, lessons: 36, accent: colors.error},
  {id: 'c3', title: '主观题每日带练', teacher: '王老师', type: 'live', progress: 12, lessons: 30, accent: colors.success},
  {id: 'c4', title: '行政法真题串讲', teacher: '陈思源', type: 'video', progress: 0, lessons: 24, accent: colors.warning},
];

export const products: Product[] = [
  {
    id: 'p1',
    name: '2026 法考全程班（主客一体）',
    category: '全程备考',
    price: 3980,
    originalPrice: 5200,
    sold: 2847,
    accent: colors.brand,
    benefits: ['客观题全科精讲', '主观题批改 20 次', '班主任学习规划'],
  },
  {
    id: 'p2',
    name: '主观题案例突破班',
    category: '主观题',
    price: 1680,
    originalPrice: 2280,
    sold: 1536,
    accent: colors.error,
    benefits: ['80 个核心案例', '逐题人工批改', '考前模拟 6 套'],
  },
  {
    id: 'p3',
    name: '法条音频随身课',
    category: '音频课',
    price: 299,
    originalPrice: 399,
    sold: 4203,
    accent: colors.success,
    benefits: ['全科重点法条', '逐字稿配套', '离线能力待接入'],
  },
];

export const orders: Order[] = [
  {id: 'DB202608270001', productName: products[0].name, amount: 3980, status: 'paid', createdAt: '2026-08-27 20:18'},
  {id: 'DB202608110016', productName: products[2].name, amount: 299, status: 'paid', createdAt: '2026-08-11 09:42'},
];

export const notifications: AppNotification[] = [
  {id: 'n1', title: '今日学习提醒', body: '民法体系精讲还有 2 节待完成。', time: '10 分钟前', read: false},
  {id: 'n2', title: '批改完成', body: '您的主观题答案已完成批改。', time: '昨天', read: false},
  {id: 'n3', title: '订单通知', body: '订单 DB202608270001 已支付成功。', time: '8 月 27 日', read: true},
];

export const objectiveQuestions = [
  {
    id: 'oq1',
    stem: '关于民事法律行为的效力，下列哪一选项是正确的？',
    options: ['无民事行为能力人实施的行为一律无效', '限制民事行为能力人实施的纯获利益行为有效', '可撤销行为自始当然无效', '无权代理行为不得追认'],
    answer: 1,
    analysis: '限制民事行为能力人可以独立实施纯获利益的民事法律行为。',
  },
  {
    id: 'oq2',
    stem: '甲将自己的房屋出租给乙，租赁期间将房屋出售给丙。下列说法正确的是？',
    options: ['租赁合同自动终止', '乙必须立即搬离', '买卖不破租赁', '丙可以单方提高租金'],
    answer: 2,
    analysis: '租赁物在承租人占有期间发生所有权变动，不影响租赁合同效力。',
  },
];
