import {App, ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {getCurrentAdmin} from '@/services/api';
import type {ReactNode} from 'react';

dayjs.locale('zh-cn');

export async function getInitialState() {
  if (['/login', '/learning-admin/login', '/grading-admin/login', '/grader/login'].includes(window.location.pathname)) return {currentUser: undefined};
  try {
    return {currentUser: await getCurrentAdmin()};
  } catch {
    return {currentUser: undefined};
  }
}

export function rootContainer(container: ReactNode) {
  return <ConfigProvider locale={zhCN} theme={{token: {colorPrimary: '#4C4BEA', borderRadius: 8, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}}}><App>{container}</App></ConfigProvider>;
}
