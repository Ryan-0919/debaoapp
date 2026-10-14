import {Alert, Button, Col, Row, Space, Statistic, Typography, message} from 'antd';
import {useEffect, useState} from 'react';
import {createAdminExport, getAdminAnalytics, type AdminAnalytics} from '@/services/api';

export default function Analytics() {
  const [data, setData] = useState<AdminAnalytics>(); const [error, setError] = useState<string>();
  useEffect(() => { getAdminAnalytics().then(setData).catch(cause => setError(cause instanceof Error ? cause.message : '分析数据加载失败')); }, []);
  return <div><Space style={{display: 'flex', justifyContent: 'space-between'}}><Typography.Title level={4} style={{marginTop: 0}}>数据分析概览</Typography.Title><Button onClick={async () => {try {const job = await createAdminExport('analytics_overview'); message.info(`导出任务 ${job.id} 已进入队列`);} catch (cause) {message.error(cause instanceof Error ? cause.message : '创建导出任务失败');}}}>导出概览</Button></Space>{error && <Alert type="warning" showIcon message={error} />}{data && <><Typography.Text type="secondary">统计时间：{data.generatedAt}</Typography.Text><Row gutter={[16, 16]} style={{marginTop: 16}}>{[['用户数', data.users], ['课程数', data.courses], ['题目数', data.questions], ['订单数', data.orders], ['帖子数', data.forumPosts]].map(([title, value]) => <Col xs={24} sm={12} lg={8} key={String(title)}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20}}><Statistic title={title as string} value={value as number} /></div></Col>)}</Row></>}</div>;
}
