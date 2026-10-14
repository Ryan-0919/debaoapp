import {ReloadOutlined} from '@ant-design/icons';
import {Alert, Button, Empty, Space, Table, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {getAdminAIFlags, type AdminAIFlag} from '@/services/api';
const riskStatusLabels: Record<string, string> = {open: '待处理', reviewing: '处理中', resolved: '已处理', dismissed: '已忽略'};

export default function AIRiskFlags() {
  const [items, setItems] = useState<AdminAIFlag[]>([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const result = await getAdminAIFlags(); setItems(result.items); setTotal(result.total); } catch (error) { message.error(error instanceof Error ? error.message : '加载 AI 风险记录失败'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <Space direction="vertical" size={18} style={{display: 'flex'}}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div><Typography.Title level={4} style={{margin: 0}}>AI 风险记录</Typography.Title><Typography.Text type="secondary">仅展示 AI 服务商产生的风险事件，不创建模拟记录。</Typography.Text></div><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button></div>{!items.length && !loading && <Alert type="info" showIcon message="暂无风险事件" description="接入 AI 服务商和风险事件 Worker 后，此队列会自动产生数据。" />}<Table rowKey="id" loading={loading} dataSource={items} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无风险事件" />}} columns={[{title: '记录 ID', dataIndex: 'id'}, {title: '用户', dataIndex: 'userId'}, {title: '风险等级', dataIndex: 'risk'}, {title: '状态', dataIndex: 'status', render: value => <Tag>{riskStatusLabels[String(value)] ?? '未知'}</Tag>}, {title: '创建时间', dataIndex: 'createdAt'}]} pagination={{pageSize: 20, total}} /></Space>;
}
