import {Alert, Button, Col, Row, Space, Statistic, Typography} from 'antd';
import {ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getDashboardMetrics, type DashboardMetrics} from '@/services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setMetrics(await getDashboardMetrics());
    } catch (cause) {
      setMetrics(undefined);
      setError(cause instanceof Error ? cause.message : '工作台指标暂时不可用');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <Space direction="vertical" size={22} style={{display: 'flex'}}>
    <div>
      <Typography.Title level={3} style={{margin: 0}}>工作台</Typography.Title>
      <Typography.Text type="secondary">今日运营概览 · 数据由 Admin API 实时提供</Typography.Text>
    </div>
    {error && <Alert type="error" showIcon message="工作台数据加载失败" description={error} action={<Button icon={<ReloadOutlined />} onClick={() => void load()}>重试</Button>} />}
    {loading && !metrics && <Alert type="info" showIcon message="正在加载工作台指标" />}
    {!loading && !metrics && !error && <Alert type="warning" showIcon message="工作台指标暂不可用" description="服务端未返回可展示的指标，请稍后重试。" action={<Button icon={<ReloadOutlined />} onClick={() => void load()}>重试</Button>} />}
    {metrics && <Row gutter={[16, 16]}>
      {[
        ['用户总数', metrics.users, <ArrowUpOutlined />, '#4C4BEA'],
        ['活跃用户', metrics.activeUsers, <ArrowUpOutlined />, '#147D64'],
        ['今日答题', metrics.answeredToday, <CheckCircleOutlined />, '#1677ff'],
        ['付费金额', `¥${metrics.paidAmount.toLocaleString()}`, <ArrowUpOutlined />, '#D46B08'],
        ['退款金额', `¥${metrics.refundAmount.toLocaleString()}`, <ArrowDownOutlined />, '#CF1322'],
        ['待处理举报', metrics.reports, <ExclamationCircleOutlined />, '#722ED1'],
      ].map(([title, value, icon, color]) => <Col xs={24} sm={12} lg={8} xl={4} key={String(title)}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: '18px 18px 16px'}}><Statistic title={title as string} value={value as string | number} prefix={<span style={{color: color as string, fontSize: 16}}>{icon}</span>} /></div></Col>)}
    </Row>}
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20, minHeight: 150}}>
        <Typography.Title level={5} style={{margin: '0 0 14px'}}>待办队列</Typography.Title>
        <Alert type="info" showIcon message="待办汇总暂未接入" description="请进入对应业务模块查看实时队列，工作台不会展示静态或推测数量。" action={<Button type="link" onClick={() => navigate('/grading')}>打开批改队列</Button>} />
      </div></Col>
      <Col xs={24} lg={10}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20, minHeight: 150}}>
        <Typography.Title level={5} style={{margin: '0 0 14px'}}>系统健康</Typography.Title>
        <Alert type="info" showIcon message="健康状态请查看系统状态页" description="工作台不缓存基础设施状态，避免显示过期结果。" action={<Button type="link" onClick={() => navigate('/system/health')}>打开服务状态</Button>} />
      </div></Col>
    </Row>
  </Space>;
}
