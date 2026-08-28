import type {ImageSourcePropType} from 'react-native';
import {colors} from '@/theme';
import type {Product} from '@/types/domain';

export type ProductCategory = '主客一体' | '客观题' | '主观题';
export type ProductType = '视频课程' | '直播课程' | '音频课程';

export interface CatalogProduct extends Product {
  category: ProductCategory;
  type: ProductType;
  teacher: string;
  image: ImageSourcePropType;
  detailImage: ImageSourcePropType;
  brief: string;
  stage: string;
  autoStart: boolean;
  includes: string[];
  delivery: string;
}

export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  p1: require('@/assets/images/home-library.png'),
  p2: require('@/assets/images/home-office.png'),
  p3: require('@/assets/images/course-subjective.png'),
  p4: require('@/assets/images/product-live.png'),
  p5: require('@/assets/images/product-audio-civil.png'),
  p6: require('@/assets/images/product-audio-all.png'),
};

export const catalogProducts: CatalogProduct[] = [
  {
    id: 'p1',
    name: '2024法考全程班（主客一体·视频精讲）',
    category: '主客一体',
    type: '视频课程',
    teacher: '张明远',
    price: 3980,
    originalPrice: 5200,
    sold: 2847,
    accent: colors.brand,
    image: PRODUCT_IMAGES.p1,
    detailImage: PRODUCT_IMAGES.p2,
    brief: '覆盖客观题全科+主观题冲刺，名师全程讲授，配套题库、模拟卷和主观题批改服务。',
    stage: '全程备考',
    autoStart: true,
    includes: ['客观题精讲课（全科共420课时）', '客观题章节题库（12,000+题）', '历年真题精讲（2014–2023）', '主观题案例精讲（80+案例）', '主观题批改服务（20次）', '考前冲刺模拟卷（6套）', '班主任1对1学习规划'],
    benefits: ['客观题精讲课（全科共420课时）', '客观题章节题库（12,000+题）', '历年真题精讲（2014–2023）', '主观题案例精讲（80+案例）', '主观题批改服务（20次）', '考前冲刺模拟卷（6套）', '班主任1对1学习规划'],
    delivery: '购买后立即开通，按课程计划解锁课节，有效期至2024年考试结束。',
  },
  {
    id: 'p2', name: '2024客观题精英班（视频+直播）', category: '客观题', type: '视频课程', teacher: '张明远',
    price: 1980, originalPrice: 2800, sold: 5312, accent: colors.brand,
    image: PRODUCT_IMAGES.p2, detailImage: PRODUCT_IMAGES.p2,
    brief: '系统精讲客观题全科知识点，覆盖卷一卷二，配套章节练习和历年真题解析。', stage: '客观题备考', autoStart: true,
    includes: ['客观题精讲课（全科220课时）', '章节配套题库（8,000+题）', '历年真题精解（2019–2023）', '每月直播答疑（共8次）'],
    benefits: ['客观题精讲课（全科220课时）', '章节配套题库（8,000+题）', '历年真题精解（2019–2023）', '每月直播答疑（共8次）'],
    delivery: '购买后48小时内开通，有效期至2024年客观题考试结束。',
  },
  {
    id: 'p3', name: '2024主观题冲刺班（精讲+批改）', category: '主观题', type: '视频课程', teacher: '王晓峰',
    price: 1280, originalPrice: 1680, sold: 1893, accent: colors.success,
    image: PRODUCT_IMAGES.p3, detailImage: PRODUCT_IMAGES.p3,
    brief: '主观题专项突破，以历年真题案例为核心，精讲答题逻辑与规范，配套批改服务。', stage: '主观题备考', autoStart: false,
    includes: ['主观题精讲课（共60课时）', '历年真题案例精解（60+案例）', '主观题批改（10次）', '答题模板与规范训练'],
    benefits: ['主观题精讲课（共60课时）', '历年真题案例精解（60+案例）', '主观题批改（10次）', '答题模板与规范训练'],
    delivery: '购买后开通，主观题考试前两个月起按计划推送课程，有效期至2024年主观题考试结束。',
  },
  {
    id: 'p4', name: '法考直播冲刺班（考前30天）', category: '客观题', type: '直播课程', teacher: '李东明',
    price: 680, originalPrice: 880, sold: 3102, accent: '#C0385A',
    image: PRODUCT_IMAGES.p4, detailImage: PRODUCT_IMAGES.p4,
    brief: '考前30天密集直播冲刺，押题预测、重点串讲，配合模拟考试查漏补缺。', stage: '冲刺阶段', autoStart: false,
    includes: ['直播冲刺课（30天×2小时）', '模拟试卷（3套）', '直播回放（永久可看）'],
    benefits: ['直播冲刺课（30天×2小时）', '模拟试卷（3套）', '直播回放（永久可看）'],
    delivery: '课程于2024年9月1日开课，购买后自动激活直播权限。',
  },
  {
    id: 'p5', name: '民法音频精讲（通勤随听版）', category: '客观题', type: '音频课程', teacher: '张明远',
    price: 398, originalPrice: 598, sold: 4217, accent: '#1A8B8B',
    image: PRODUCT_IMAGES.p5, detailImage: PRODUCT_IMAGES.p5,
    brief: '全程音频授课，利用碎片时间随时随地听课，配套逐字稿与知识点卡片，通勤路上高效备考。', stage: '客观题备考', autoStart: true,
    includes: ['民法音频精讲（共68讲·约52小时）', '每讲逐字稿PDF', '知识点速记卡片', '倍速播放（0.75x–2x）', '离线下载（手机端）'],
    benefits: ['民法音频精讲（共68讲·约52小时）', '每讲逐字稿PDF', '知识点速记卡片', '倍速播放（0.75x–2x）', '离线下载（手机端）'],
    delivery: '购买后立即开通，永久有效，支持离线下载。',
  },
  {
    id: 'p6', name: '法考全科音频串讲班', category: '主客一体', type: '音频课程', teacher: '多位名师',
    price: 880, originalPrice: 1280, sold: 2091, accent: '#1A8B8B',
    image: PRODUCT_IMAGES.p6, detailImage: PRODUCT_IMAGES.p6,
    brief: '名师精讲全科核心考点，音频形式高效输出，配合题库随时检验，适合已有基础的二战考生。', stage: '全程备考', autoStart: false,
    includes: ['全科音频精讲（共220讲·约160小时）', '配套章节题库（6,000+题）', '逐讲讲义PDF', '知识框架思维导图', '倍速播放与离线下载'],
    benefits: ['全科音频精讲（共220讲·约160小时）', '配套章节题库（6,000+题）', '逐讲讲义PDF', '知识框架思维导图', '倍速播放与离线下载'],
    delivery: '购买后48小时内开通，有效期至2025年考试结束。',
  },
];

export const findCatalogProduct = (id: string) =>
  catalogProducts.find(product => product.id === id) ?? catalogProducts[0];
