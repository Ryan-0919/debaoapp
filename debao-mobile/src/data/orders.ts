export interface PrototypeOrder {
  id: string;
  productName: string;
  orderNo: string;
  date: string;
  amount: number;
  status: '已完成' | '待开课';
  productId: string;
  courseId: string | null;
}

export const prototypeOrders: PrototypeOrder[] = [
  {
    id: 'o1',
    productName: '2024法考全程班（主客一体·视频精讲）',
    orderNo: 'DB2024031200001',
    date: '2024-03-12 14:32',
    amount: 3980,
    status: '已完成',
    productId: 'p1',
    courseId: 'c1',
  },
  {
    id: 'o2',
    productName: '法考直播冲刺班（考前30天）',
    orderNo: 'DB2024052800078',
    date: '2024-05-28 09:15',
    amount: 680,
    status: '待开课',
    productId: 'p4',
    courseId: null,
  },
];
