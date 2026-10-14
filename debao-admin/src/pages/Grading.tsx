import {EyeOutlined, HighlightOutlined, ReloadOutlined, SendOutlined, UserSwitchOutlined} from '@ant-design/icons';
import {Alert, Button, DatePicker, Descriptions, Drawer, Empty, Flex, Form, Input, InputNumber, Modal, Segmented, Select, Skeleton, Space, Statistic, Table, Tag, Timeline, Typography, message} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {assignAdminGrading, getAdminGraderAccounts, getAdminGrading, getAdminGradingDetail, getAdminGradingStats, publishAdminGrading, queueAdminGradingManual, reassignAdminGrading, recallAdminGrading, selfReviewAdminGrading, type AdminGraderAccount, type AdminGradingDetail, type AdminGradingStats, type AdminGradingV2} from '@/services/api';

const statusLabels: Record<string, string> = {
  submitted: '已提交', ai_queued: '等待 AI', ai_processing: 'AI 批改中', ai_completed: 'AI 已完成', ai_failed: 'AI 失败',
  manual_queued: '等待人工', manual_claimed: '人工批改中', manual_submitted: '待发布', supervisor_review: '主管复核',
  manual_returned: '已退回', manual_expired: '已超时', published: '已发布', appealed: '申诉中', cancelled: '已取消',
};
const statusColors: Record<string, string> = {ai_failed: 'error', manual_returned: 'warning', manual_expired: 'warning', manual_queued: 'gold', manual_claimed: 'processing', manual_submitted: 'cyan', supervisor_review: 'purple', published: 'success', appealed: 'magenta', cancelled: 'default'};
const eventLabels: Record<string, string> = {submitted: '用户提交答案', ai_completed: 'AI 首轮完成', ai_failed: 'AI 首轮失败', manual_queued: '转入人工队列', manual_claimed: '批改老师领取', manual_assigned: '管理员分发任务', manual_reassigned: '管理员重新分配', manual_submitted: '批改老师提交', manual_returned: '批改老师退回', published: '主管发布报告'};

function StatusTag({value}: {value: string}) { return <Tag color={statusColors[value] ?? 'blue'}>{statusLabels[value] ?? value}</Tag>; }
function formatTime(value?: string) { return value ? new Date(value).toLocaleString('zh-CN', {hour12: false}) : '-'; }

export default function Grading() {
  const [items, setItems] = useState<AdminGradingV2[]>([]);
  const [stats, setStats] = useState<AdminGradingStats>();
  const [active, setActive] = useState<AdminGradingDetail>();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [graders, setGraders] = useState<AdminGraderAccount[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selfReviewOpen, setSelfReviewOpen] = useState(false);
  const [assignForm] = Form.useForm<{graderId: string; dueAt: any; reason: string}>();
  const [selfReviewForm] = Form.useForm<{totalScore: number; feedback: string; improvementAdvice: string}>();

  const load = useCallback(async () => {
    setLoading(true);
    try { const [queue, summary, accounts] = await Promise.all([getAdminGrading(), getAdminGradingStats(), getAdminGraderAccounts()]); setItems(queue.items); setStats(summary); setGraders(accounts.items); }
    catch (error) { message.error(error instanceof Error ? error.message : '加载批改任务失败'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const showDetail = async (record: AdminGradingV2) => {
    setDetailLoading(true); setActive(undefined);
    try { setActive(await getAdminGradingDetail(record.id)); }
    catch (error) { message.error(error instanceof Error ? error.message : '加载批改详情失败'); }
    finally { setDetailLoading(false); }
  };
  const act = async (action: 'queue' | 'publish') => {
    if (!active) return; setActing(true);
    try { if (action === 'queue') { await queueAdminGradingManual(active.submission.id); message.success('任务已转入人工批改队列'); } else { await publishAdminGrading(active.submission.id); message.success('人工批改报告已发布给用户'); } setActive(await getAdminGradingDetail(active.submission.id)); await load(); }
    catch (error) { message.error(error instanceof Error ? error.message : '操作失败'); }
    finally { setActing(false); }
  };
  const openAssign = () => {
    if (!active) return;
    assignForm.setFieldsValue({graderId: active.assignment?.graderId, dueAt: undefined, reason: active.assignment?.graderId ? '调整批改老师分工' : '按科目分配批改任务'});
    setAssignOpen(true);
  };
  const submitAssign = async (values: {graderId: string; dueAt: any; reason: string}) => {
    if (!active) return;
    setActing(true);
    try {
      const dueAt = values.dueAt?.toISOString?.() ?? new Date(Date.now() + 24 * 3600000).toISOString();
      const input = {graderId: values.graderId, dueAt, reason: values.reason};
      if (active.assignment?.graderId) await reassignAdminGrading(active.submission.id, input); else await assignAdminGrading(active.submission.id, input);
      message.success(active.assignment?.graderId ? '任务已重新分配' : '任务已分发给批改老师'); setAssignOpen(false); setActive(await getAdminGradingDetail(active.submission.id)); await load();
    } catch (error) { message.error(error instanceof Error ? error.message : '分发失败'); }
    finally { setActing(false); }
  };
  const recall = async () => {
    if (!active) return;
    const reason = window.prompt('请输入收回并重新批改的原因', '管理员复核后要求重新批改')?.trim();
    if (!reason) return;
    setActing(true);
    try { await recallAdminGrading(active.submission.id, {reason}); message.success('批改结果已收回，重新进入人工队列'); setActive(await getAdminGradingDetail(active.submission.id)); await load(); }
    catch (error) { message.error(error instanceof Error ? error.message : '收回失败'); }
    finally { setActing(false); }
  };
  const selfReview = async (values: {totalScore: number; feedback: string; improvementAdvice: string}) => {
    if (!active) return; setActing(true);
    try { await selfReviewAdminGrading(active.submission.id, values); message.success('管理员批改已提交，待发布给学生'); setSelfReviewOpen(false); setActive(await getAdminGradingDetail(active.submission.id)); await load(); }
    catch (error) { message.error(error instanceof Error ? error.message : '管理员批改提交失败'); }
    finally { setActing(false); }
  };

  const filtered = useMemo(() => filter === 'all' ? items : items.filter(item => filter === 'exception' ? ['ai_failed', 'manual_returned', 'manual_expired', 'appealed'].includes(item.status) : item.status === filter), [filter, items]);
  const metricItems = [
    {title: '全部任务', value: stats?.total ?? 0},
    {title: '等待人工', value: stats?.byStatus.manual_queued ?? 0},
    {title: '批改中', value: stats?.byStatus.manual_claimed ?? 0},
    {title: '待发布', value: (stats?.byStatus.manual_submitted ?? 0) + (stats?.byStatus.supervisor_review ?? 0)},
    {title: '异常任务', value: (stats?.byStatus.ai_failed ?? 0) + (stats?.byStatus.manual_returned ?? 0) + (stats?.byStatus.manual_expired ?? 0) + (stats?.byStatus.appealed ?? 0)},
  ];

  return <Space direction="vertical" size={20} style={{display: 'flex'}}>
    <Flex justify="space-between" align="flex-end" wrap gap={12}>
      <div><Typography.Title level={4} style={{margin: 0}}>批改队列</Typography.Title><Typography.Text type="secondary">监控 AI 首轮、人工批改、异常处理和报告发布。人工老师使用独立工作台完成评分。</Typography.Text></div>
      <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>刷新</Button>
    </Flex>
    <Flex gap={12} wrap>{metricItems.map(item => <div key={item.title} style={{minWidth: 148, flex: '1 1 148px', padding: '14px 16px', background: '#fff', border: '1px solid #e8e9ef', borderRadius: 6}}><Statistic title={item.title} value={item.value} valueStyle={{fontSize: 24}} /></div>)}</Flex>
    <Flex justify="space-between" align="center" wrap gap={12}><Segmented value={filter} onChange={setFilter} options={[{label: '全部', value: 'all'}, {label: '等待人工', value: 'manual_queued'}, {label: '批改中', value: 'manual_claimed'}, {label: '待发布', value: 'manual_submitted'}, {label: '异常', value: 'exception'}, {label: '已发布', value: 'published'}]} /><Typography.Text type="secondary">共 {filtered.length} 条</Typography.Text></Flex>
    <Table rowKey="id" loading={loading} dataSource={filtered} scroll={{x: 980}} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前筛选条件下没有批改任务" />}} columns={[
      {title: '任务编号', dataIndex: 'id', width: 220, ellipsis: true},
      {title: '套卷 / 题目', width: 220, ellipsis: true, render: (_, record) => <span>{record.paperTitle ? `${record.paperTitle} · ` : ''}{record.questionTitle ?? record.questionId}</span>},
      {title: '题目版本', dataIndex: 'questionVersion', width: 96, render: value => `v${value}`},
      {title: '状态', dataIndex: 'status', width: 120, render: value => <StatusTag value={String(value)} />},
      {title: '当前批改人', width: 130, render: (_, record) => record.assignment?.graderId ?? '-'},
      {title: '提交时间', dataIndex: 'createdAt', width: 170, render: formatTime},
      {title: '报告', width: 110, render: (_, record) => record.report ? `${record.report.totalScore}/${record.report.maxScore}` : '-'},
      {title: '操作', fixed: 'right', width: 90, render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => void showDetail(record)}>详情</Button>},
    ]} pagination={{pageSize: 20, showSizeChanger: false}} />

    <Drawer title="批改任务详情" open={detailLoading || Boolean(active)} onClose={() => {setActive(undefined); setDetailLoading(false);}} width={760} destroyOnClose extra={active && <Space>{['manual_queued', 'manual_returned', 'manual_expired'].includes(active.submission.status) && <Button icon={<HighlightOutlined />} loading={acting} onClick={() => { selfReviewForm.resetFields(); setSelfReviewOpen(true); }}>管理员自批</Button>}{['manual_queued', 'manual_claimed', 'manual_returned', 'manual_expired'].includes(active.submission.status) && <Button icon={<UserSwitchOutlined />} loading={acting} onClick={openAssign}>{active.assignment?.graderId ? '重新分配' : '分发任务'}</Button>}{active.submission.status === 'ai_failed' && <Button icon={<UserSwitchOutlined />} loading={acting} onClick={() => void act('queue')}>转人工</Button>}{active.submission.status === 'manual_submitted' && <Button type="primary" icon={<SendOutlined />} loading={acting} onClick={() => void act('publish')}>发布报告</Button>}{active.submission.status === 'published' && <Button danger loading={acting} onClick={() => void recall()}>收回重批</Button>}</Space>}>
      {detailLoading && <Skeleton active paragraph={{rows: 10}} />}
      {active && <Space direction="vertical" size={20} style={{display: 'flex'}}>
        {active.submission.status === 'ai_failed' && <Alert type="warning" showIcon message="AI 首轮未完成" description={active.aiRuns[0]?.failureReason ?? 'AI 服务返回异常。可核查 Provider 后重试，或将任务转入人工队列。'} />}
        <Descriptions bordered size="small" column={2} title="任务信息" items={[
          {key: 'id', label: '任务编号', children: active.submission.id, span: 2}, {key: 'status', label: '状态', children: <StatusTag value={active.submission.status} />}, {key: 'version', label: '题目版本', children: `v${active.submission.questionVersion}`}, {key: 'question', label: '题目', children: active.rubric?.title ?? active.submission.questionId, span: 2}, {key: 'grader', label: '当前批改老师', children: active.assignment?.graderId ?? '未分配'}, {key: 'dueAt', label: '截止时间', children: formatTime(active.assignment?.dueAt)}, {key: 'created', label: '提交时间', children: formatTime(active.submission.createdAt)}, {key: 'updated', label: '更新时间', children: formatTime(active.submission.updatedAt)},
        ]} />
        <div><Typography.Title level={5}>用户答案快照</Typography.Title>{active.submission.answers.map((answer, index) => <div key={answer.subQuestionId} style={{padding: '12px 14px', background: '#f7f8fa', borderRadius: 6, marginBottom: 8}}><Typography.Text strong>第 {index + 1} 问</Typography.Text><Typography.Paragraph style={{whiteSpace: 'pre-wrap', margin: '6px 0 0'}}>{answer.text || '仅提交附件'}</Typography.Paragraph>{answer.attachments.length > 0 && <Typography.Text type="secondary">附件 {answer.attachments.length} 个</Typography.Text>}</div>)}</div>
        <Descriptions bordered size="small" column={1} title="AI 首轮" items={active.aiRuns.length ? active.aiRuns.map(run => ({key: run.id, label: <StatusTag value={run.status === 'completed' ? 'ai_completed' : run.status === 'failed' ? 'ai_failed' : `ai_${run.status}`} />, children: run.status === 'failed' ? run.failureReason : run.suggestedScore === undefined ? '处理中' : `建议分 ${run.suggestedScore}（仅供人工参考）`})) : [{key: 'none', label: '状态', children: '尚未创建 AI 运行'}]} />
        <div><Typography.Title level={5}>人工结果</Typography.Title>{active.reviews.length ? active.reviews.map(review => (<Descriptions key={review.id} bordered size="small" column={1} items={[{key: 'score', label: '人工最终分', children: `${review.totalScore}/${active.rubric?.totalScore ?? '-'}`}, {key: 'feedback', label: '老师评语', children: review.feedback}, {key: 'advice', label: '改进建议', children: review.improvementAdvice}, {key: 'status', label: '复核状态', children: review.status}]} />)) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="兼职老师尚未提交人工结果" />}</div>
        <div><Typography.Title level={5}>流转记录</Typography.Title><Timeline items={active.events.slice().reverse().map(event => ({children: <div><Typography.Text>{eventLabels[event.eventType] ?? event.eventType}</Typography.Text><br /><Typography.Text type="secondary">{formatTime(event.createdAt)} · {event.actorType}{event.actorId ? ` ${event.actorId}` : ''}</Typography.Text></div>}))} /></div>
      </Space>}
    </Drawer>
    <Modal title={active?.assignment?.graderId ? '重新分配批改任务' : '分发批改任务'} open={assignOpen} onCancel={() => setAssignOpen(false)} footer={null} destroyOnClose>
      <Form form={assignForm} layout="vertical" onFinish={submitAssign}>
        <Form.Item name="graderId" label="批改老师" rules={[{required: true, message: '请选择批改老师'}]}><Select showSearch optionFilterProp="label" options={graders.filter(item => !active?.rubric?.subjectId || item.subjectIds.length === 0 || item.subjectIds.includes(active.rubric.subjectId)).map(item => ({value: item.id, label: `${item.displayName}（${item.subjectIds.length ? item.subjectIds.join('、') : '全科'}）`}))} /></Form.Item>
        <Form.Item name="dueAt" label="截止时间"><DatePicker showTime style={{width: '100%'}} placeholder="不填写则默认 24 小时" /></Form.Item>
        <Form.Item name="reason" label="分发原因" rules={[{required: true, min: 2, message: '请填写分发原因'}]}><Input.TextArea rows={3} placeholder="例如：按民法科目分配" /></Form.Item>
        <Flex justify="flex-end" gap={8}><Button onClick={() => setAssignOpen(false)}>取消</Button><Button type="primary" htmlType="submit" loading={acting}>确认分发</Button></Flex>
      </Form>
    </Modal>
    <Modal title="管理员自批" open={selfReviewOpen} onCancel={() => setSelfReviewOpen(false)} onOk={() => selfReviewForm.submit()} confirmLoading={acting} destroyOnClose>
      <Form form={selfReviewForm} layout="vertical" onFinish={selfReview}>
        <Form.Item name="totalScore" label="总分" rules={[{required: true, type: 'number', min: 0}]}><InputNumber min={0} style={{width: '100%'}} /></Form.Item>
        <Form.Item name="feedback" label="批改评语" rules={[{required: true, min: 2}]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="improvementAdvice" label="改进建议" rules={[{required: true, min: 2}]}><Input.TextArea rows={4} /></Form.Item>
      </Form>
    </Modal>
  </Space>;
}
