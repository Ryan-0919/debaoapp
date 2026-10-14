import {DownloadOutlined, ReloadOutlined} from '@ant-design/icons';
import {Alert, Button, Empty, Space, Table, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {createAdminExport, getAdminAIUsage, type AdminAIUsage} from '@/services/api';

export default function AIUsage() {
  const [items, setItems] = useState<AdminAIUsage[]>([]); const [total, setTotal] = useState(0); const [generatedAt, setGeneratedAt] = useState<string>(); const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const result = await getAdminAIUsage(); setItems(result.items); setTotal(result.total); setGeneratedAt(result.generatedAt); } catch (error) { message.error(error instanceof Error ? error.message : '加载 AI 用量失败'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const exportUsage = async () => { try { const job = await createAdminExport('ai_usage'); message.info(`导出任务 ${job.id} 已进入队列`); } catch (error) { message.error(error instanceof Error ? error.message : '创建导出任务失败'); } };
  return <Space direction="vertical" size={18} style={{display: 'flex'}}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div><Typography.Title level={4} style={{margin: 0}}>AI 用量统计</Typography.Title><Typography.Text type="secondary">{generatedAt ? `统计快照：${generatedAt}` : '用量统计快照'}</Typography.Text></div><Space><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button><Button icon={<DownloadOutlined />} onClick={() => void exportUsage()}>排队导出</Button></Space></div>{!items.length && !loading && <Alert type="info" showIcon message="暂无用量数据" description="AI 计量 Worker 收到 Provider 回调后才会产生用量数据。" />}<Table rowKey={(record, index) => record.userId ?? String(index)} loading={loading} dataSource={items} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用量数据" />}} columns={[{title: '用户', dataIndex: 'userId'}, {title: '请求次数', dataIndex: 'requests'}, {title: 'Token 数', dataIndex: 'tokens'}, {title: '费用', dataIndex: 'cost', render: value => value === undefined ? '-' : `¥${Number(value).toFixed(4)}`}]} pagination={{pageSize: 20, total}} /></Space>;
}
