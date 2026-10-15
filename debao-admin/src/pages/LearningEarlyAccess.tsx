import {useCallback, useEffect, useState} from 'react';
import {Alert, Button, Card, Input, message, Space, Table, Tag} from 'antd';
import {getEarlyAccessRequests, reviewEarlyAccessRequest, type EarlyAccessRequest} from '@/services/api';

export default function LearningEarlyAccess() {
  const [items, setItems] = useState<EarlyAccessRequest[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState<string>(); const [reason, setReason] = useState('');
  const load = useCallback(async () => {setLoading(true); try {setItems((await getEarlyAccessRequests()).items); setError(undefined);} catch (e) {setError(e instanceof Error ? e.message : '加载失败');} finally {setLoading(false);}}, []);
  useEffect(() => {void load();}, [load]);
  const review = async (item: EarlyAccessRequest, approved: boolean) => {try {await reviewEarlyAccessRequest(item.id, approved, reason); setReason(''); message.success(approved ? '已同意提前学习' : '已拒绝申请'); await load();} catch (e) {message.error(e instanceof Error ? e.message : '处理失败');}};
  return <Card title="提前学习申请" extra={<Button onClick={() => void load()}>刷新</Button>}>
    {error && <Alert type="error" message={error} showIcon style={{marginBottom: 16}} />}
    <Input placeholder="处理备注（可选）" value={reason} onChange={e => setReason(e.target.value)} style={{maxWidth: 420, marginBottom: 16}} />
    <Table rowKey="id" loading={loading} dataSource={items} columns={[
      {title: '学员', dataIndex: 'userId'}, {title: '计划', render: (_: unknown, item: EarlyAccessRequest) => item.plan?.title ?? item.planId},
      {title: '申请提前至', dataIndex: 'requestedThrough'}, {title: '状态', render: (_: unknown, item: EarlyAccessRequest) => <Tag color={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'orange'}>{item.status === 'approved' ? '已同意' : item.status === 'rejected' ? '已拒绝' : '待审核'}</Tag>},
      {title: '操作', render: (_: unknown, item: EarlyAccessRequest) => item.status === 'pending' ? <Space><Button type="primary" onClick={() => void review(item, true)}>同意</Button><Button danger onClick={() => void review(item, false)}>拒绝</Button></Space> : '—'},
    ]} />
  </Card>;
}
