import type {ImageSourcePropType} from 'react-native';

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  done: boolean;
  current?: boolean;
}

export interface CourseChapter {
  title: string;
  lessons: CourseLesson[];
}

export interface CourseDetail {
  id: string;
  name: string;
  teacher: string;
  progress: number;
  currentLesson: string;
  totalLessons: number;
  completedLessons: number;
  lastStudied: string;
  type: string;
  image: ImageSourcePropType;
  productId: string;
  chapters: CourseChapter[];
}

export const courseDetails: CourseDetail[] = [
  {
    id: 'c1',
    name: '民法精讲课（2024版）',
    teacher: '张明远',
    progress: 42,
    currentLesson: '第18讲：物权变动的公示与公信原则',
    totalLessons: 68,
    completedLessons: 28,
    lastStudied: '昨天 21:30',
    type: '录播',
    image: require('@/assets/images/course-civil-law.png'),
    productId: 'p2',
    chapters: [
      {
        title: '第一章 民法总则',
        lessons: [
          {id: 'l1', title: '第1讲：民法的性质与体系', duration: '42:30', done: true},
          {id: 'l2', title: '第2讲：民事法律关系', duration: '38:15', done: true},
          {id: 'l3', title: '第3讲：民事主体——自然人', duration: '55:20', done: true},
          {id: 'l4', title: '第4讲：民事主体——法人', duration: '48:00', done: true},
        ],
      },
      {
        title: '第二章 物权法',
        lessons: [
          {id: 'l5', title: '第15讲：物权概述与分类', duration: '44:10', done: true},
          {id: 'l6', title: '第16讲：物权的效力', duration: '39:45', done: true},
          {id: 'l7', title: '第17讲：物权变动总论', duration: '51:30', done: true},
          {id: 'l8', title: '第18讲：物权变动的公示与公信原则', duration: '58:00', done: false, current: true},
          {id: 'l9', title: '第19讲：不动产登记', duration: '46:20', done: false},
          {id: 'l10', title: '第20讲：动产交付', duration: '35:00', done: false},
        ],
      },
      {
        title: '第三章 合同法',
        lessons: [
          {id: 'l11', title: '第28讲：合同的成立', duration: '52:15', done: false},
          {id: 'l12', title: '第29讲：合同的效力', duration: '48:30', done: false},
          {id: 'l13', title: '第30讲：合同的履行', duration: '44:00', done: false},
        ],
      },
    ],
  },
  {
    id: 'c2',
    name: '刑法体系课（2024版）',
    teacher: '李东明',
    progress: 18,
    currentLesson: '第8讲：犯罪的未完成形态',
    totalLessons: 72,
    completedLessons: 13,
    lastStudied: '3天前',
    type: '录播',
    image: require('@/assets/images/course-criminal-law.png'),
    productId: 'p1',
    chapters: [
      {
        title: '第一章 刑法总论',
        lessons: [
          {id: 'l20', title: '第1讲：刑法的概念与原则', duration: '38:00', done: true},
          {id: 'l21', title: '第2讲：犯罪构成理论', duration: '62:30', done: true},
          {id: 'l22', title: '第8讲：犯罪的未完成形态', duration: '55:00', done: false, current: true},
        ],
      },
    ],
  },
];

const ownedCourseIds = new Set(['c1']);

export function findCourse(courseId: string) {
  return courseDetails.find(course => course.id === courseId) ?? courseDetails[0];
}

export function isCourseOwned(courseId: string) {
  return ownedCourseIds.has(courseId);
}
