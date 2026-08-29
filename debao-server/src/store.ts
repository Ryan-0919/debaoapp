import type {Store} from './types.js';

export function createStore(): Store {
  return {
    profile: {
      id: 'u-demo',
      name: '法考学习者',
      phone: '138****9190',
      examYear: '2026',
      studyDays: 126,
    },
    subjects: [
      {id: 'civil', name: '民法', questionCount: 2380, color: '#DDE9FF'},
      {id: 'criminal', name: '刑法', questionCount: 1860, color: '#FFE0D1'},
      {id: 'admin', name: '行政法', questionCount: 960, color: '#DDF3E4'},
      {id: 'civil-proc', name: '民事诉讼法', questionCount: 1280, color: '#D9F3EE'},
      {id: 'crim-proc', name: '刑事诉讼法', questionCount: 1420, color: '#FFF0C7'},
      {id: 'commercial', name: '商法', questionCount: 1160, color: '#F7DDE3'},
      {id: 'economic', name: '经济法', questionCount: 880, color: '#DCEFFF'},
      {id: 'theory', name: '理论法', questionCount: 720, color: '#DDE9FF'},
    ],
    courses: [
      {id: 'c1', title: '民法体系精讲', teacher: '张明远', type: 'video', progress: 68, lessons: 42, accent: '#5D7FE8'},
      {id: 'c2', title: '刑法重点突破', teacher: '周子恒', type: 'audio', progress: 32, lessons: 36, accent: '#E27663'},
      {id: 'c3', title: '主观题每日带练', teacher: '王老师', type: 'live', progress: 12, lessons: 30, accent: '#56A878'},
      {id: 'c4', title: '行政法真题串讲', teacher: '陈思源', type: 'video', progress: 0, lessons: 24, accent: '#D59841'},
    ],
    products: [
      {id: 'p1', name: '2026 法考全程班（主客一体）', category: '全程备考', price: 3980, originalPrice: 5200, sold: 2847, accent: '#5D7FE8', benefits: ['客观题全科精讲', '主观题批改 20 次', '班主任学习规划']},
      {id: 'p2', name: '主观题案例突破班', category: '主观题', price: 1680, originalPrice: 2280, sold: 1536, accent: '#E27663', benefits: ['80 个核心案例', '逐题人工批改', '考前模拟 6 套']},
      {id: 'p3', name: '法条音频随身课', category: '音频课', price: 299, originalPrice: 399, sold: 4203, accent: '#56A878', benefits: ['全科重点法条', '逐字稿配套', '离线能力待接入']},
    ],
    orders: [
      {id: 'DB202608270001', productId: 'p1', productName: '2026 法考全程班（主客一体）', amount: 3980, status: 'paid', createdAt: '2026-08-27 20:18'},
      {id: 'DB202608110016', productId: 'p3', productName: '法条音频随身课', amount: 299, status: 'paid', createdAt: '2026-08-11 09:42'},
    ],
    questions: [
      {id: 'oq1', stem: '关于民事法律行为的效力，下列哪一选项是正确的？', options: ['无民事行为能力人实施的行为一律无效', '限制民事行为能力人实施的纯获利益行为有效', '可撤销行为自始当然无效', '无权代理行为不得追认'], answer: 1, analysis: '限制民事行为能力人可以独立实施纯获利益的民事法律行为。'},
      {id: 'oq2', stem: '甲将自己的房屋出租给乙，租赁期间将房屋出售给丙。下列说法正确的是？', options: ['租赁合同自动终止', '乙必须立即搬离', '买卖不破租赁', '丙可以单方提高租金'], answer: 2, analysis: '租赁物在承租人占有期间发生所有权变动，不影响租赁合同效力。'},
    ],
    drafts: new Map(),
  };
}
