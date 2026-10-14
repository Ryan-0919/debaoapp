import {ReloadOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Col, Descriptions, Empty, Input, Modal, Row, Select, Space, Statistic, Table, Tag, Typography, message} from 'antd';
import dayjs from 'dayjs';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {getCurrentAdmin, getLearningDiagnosticDimensions, getLearningDiagnosticResults, getLearningStages, getLearningStageTeachers, updateLearningDiagnosticAssignment, type AdminLearningDiagnosticDimension, type AdminLearningDiagnosticResult, type AdminLearningStage, type AdminLearningTeacher} from '@/services/api';

export default function LearningDiagnosticResults() {
  const [items, setItems] = useState<AdminLearningDiagnosticResult[]>([]);
  const [dimensions, setDimensions] = useState<AdminLearningDiagnosticDimension[]>([]);
  const [stats, setStats] = useState({total: 0, assigned: 0, pending: 0});
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminLearningDiagnosticResult | null>(null);
  const [canRead, setCanRead] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [stages, setStages] = useState<AdminLearningStage[]>([]);
  const [teachers, setTeachers] = useState<AdminLearningTeacher[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>();
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLearningDiagnosticResults({keyword: keyword || undefined});
      setItems(result.items); setStats(result.stats);
    } catch (error) { message.error(error instanceof Error ? error.message : '诊断结果加载失败'); }
    finally { setLoading(false); }
  }, [keyword]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    Promise.all([getLearningDiagnosticDimensions(), getCurrentAdmin()]).then(([dimensionResult, admin]) => {
      setDimensions(dimensionResult.items);
      setCanRead(admin.permissions.includes('*') || admin.permissions.includes('learning.diagnostics.read'));
      setCanWrite(admin.permissions.includes('*') || admin.permissions.includes('learning.diagnostics.write'));
    }).catch(() => undefined);
  }, []);

  const dimensionLabel = (code: string) => dimensions.find(item => item.code === code)?.label ?? code;
  const loadStageTeachers = async (stageId?: string) => {
    setTeachers([]);
    if (!stageId) return;
    try {
      const response = await getLearningStageTeachers(stageId);
      setTeachers(response.items.filter(item => item.status === 'active'));
    } catch { setTeachers([]); }
  };
  const openDetail = async (result: AdminLearningDiagnosticResult) => {
    setDetail(result);
    setSelectedStageId(result.assignment?.stage?.id);
    setSelectedTeacherId(result.assignment?.teacher?.id);
    if (result.assignment?.classType?.id) {
      try {
        const response = await getLearningStages(result.assignment.classType.id);
        setStages(response.items.filter(item => item.status === 'active'));
      } catch { setStages([]); }
      await loadStageTeachers(result.assignment?.stage?.id);
    } else {
      setStages([]);
      setTeachers([]);
    }
  };
  const handleStageChange = async (stageId?: string) => {
    setSelectedStageId(stageId);
    setSelectedTeacherId(undefined);
    await loadStageTeachers(stageId);
  };
  const saveAssignment = async () => {
    if (!detail) return;
    setAssigning(true);
    try {
      const assignment = await updateLearningDiagnosticAssignment(detail.attemptId, {stageId: selectedStageId, teacherId: selectedTeacherId});
      setDetail({...detail, assignment});
      setItems(current => current.map(item => item.attemptId === detail.attemptId ? {...item, assignment} : item));
      await load();
      message.success(selectedTeacherId ? '老师已调整' : selectedStageId ? '阶段已指定，等待分配老师' : '已撤销阶段和老师分配');
    } catch (error) { message.error(error instanceof Error ? error.message : '老师调整失败'); }
    finally { setAssigning(false); }
  };
  const columns = useMemo(() => [
    {title: '用户', dataIndex: 'user', width: 180, render: (user: AdminLearningDiagnosticResult['user']) => <Space direction="vertical" size={0}><Typography.Text strong>{user.name}</Typography.Text><Typography.Text type="secondary">{user.phone}</Typography.Text></Space>},
    {title: '画像分数', dataIndex: 'scores', width: 300, render: (scores: Record<string, number>) => <Space wrap size={[4, 4]}>{Object.entries(scores).map(([code, score]) => <Tag key={code} color={score >= 70 ? 'green' : score >= 40 ? 'gold' : 'red'}>{dimensionLabel(code)} {score}</Tag>)}</Space>},
    {title: '分配结果', dataIndex: 'assignment', width: 220, render: (assignment: AdminLearningDiagnosticResult['assignment']) => assignment?.teacher ? <Space direction="vertical" size={0}><Typography.Text>{assignment.teacher.name}</Typography.Text><Typography.Text type="secondary">{assignment.stage?.name ?? '未记录阶段'}</Typography.Text></Space> : <Tag color="warning">待分配</Tag>},
    {title: '答题进度', dataIndex: 'answeredCount', width: 100, render: (value: number, result: AdminLearningDiagnosticResult) => `${value} / ${result.questionCount}`},
    {title: '提交时间', dataIndex: 'submittedAt', width: 170, render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm')},
    {title: '操作', key: 'actions', width: 100, render: (_: unknown, result: AdminLearningDiagnosticResult) => <Button type="link" onClick={() => void openDetail(result)}>查看详情</Button>},
  ], [dimensions]);

  if (!canRead && !loading) return <Alert type="error" showIcon message="当前管理员没有查看诊断结果的权限" />;
  return <Space direction="vertical" size={20} style={{display: 'flex'}}>
    <div><Typography.Title level={3} style={{margin: 0}}>诊断结果</Typography.Title><Typography.Paragraph type="secondary" style={{margin: '6px 0 0'}}>查看用户提交的首次学习诊断画像、答题快照和自动分配结果。</Typography.Paragraph></div>
    <Row gutter={16}><Col span={8}><Card size="small"><Statistic title="已完成诊断" value={stats.total} /></Card></Col><Col span={8}><Card size="small"><Statistic title="已分配老师" value={stats.assigned} valueStyle={{color: '#389e0d'}} /></Card></Col><Col span={8}><Card size="small"><Statistic title="待分配" value={stats.pending} valueStyle={{color: '#d89614'}} /></Card></Col></Row>
    <Card extra={<Space><Input.Search value={keywordDraft} onChange={event => setKeywordDraft(event.target.value)} onSearch={value => setKeyword(value.trim())} allowClear placeholder="搜索用户姓名、手机号" style={{width: 260}} /><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button></Space>}>
      <Table rowKey="attemptId" loading={loading} dataSource={items} columns={columns} pagination={{pageSize: 20}} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有用户完成诊断" />}} scroll={{x: 1100}} />
    </Card>
    <Modal title="诊断结果详情" open={Boolean(detail)} width={760} footer={<Space><Button onClick={() => setDetail(null)}>关闭</Button>{detail?.assignment?.classType?.id ? <Button type="primary" disabled={!canWrite} loading={assigning} onClick={() => void saveAssignment()}>保存分配</Button> : null}</Space>} onCancel={() => setDetail(null)}>
      {detail ? <Space direction="vertical" size={18} style={{display: 'flex'}}><Descriptions column={2} size="small" bordered items={[{key: 'user', label: '用户', children: `${detail.user.name}（${detail.user.phone}）`}, {key: 'submitted', label: '提交时间', children: dayjs(detail.submittedAt).format('YYYY-MM-DD HH:mm:ss')}, {key: 'assignment', label: '分配状态', children: detail.assignment?.teacher ? `${detail.assignment.teacher.name} · ${detail.assignment.stage?.name ?? '未记录阶段'}` : detail.assignment?.stage ? `${detail.assignment.stage.name} · 待分配老师` : '待分配'}]} /><Card size="small" title="阶段和老师分配">{detail.assignment?.classType?.id ? <Space direction="vertical" style={{display: 'flex'}}><Typography.Text type="secondary">当前班型：{detail.assignment.classType.name}</Typography.Text><Select disabled={!canWrite} allowClear value={selectedStageId} onChange={value => void handleStageChange(value)} placeholder="选择学习阶段" options={stages.map(stage => ({value: stage.id, label: `${stage.name} · ${stage.code}`}))} style={{width: 420}} />{selectedStageId ? <Select disabled={!canWrite} allowClear value={selectedTeacherId} onChange={setSelectedTeacherId} placeholder="选择当前阶段老师" options={teachers.map(teacher => ({value: teacher.id, label: `${teacher.name} · ${teacher.subject}`}))} style={{width: 420}} /> : <Typography.Text type="secondary">请选择阶段后再选择老师；也可以清空阶段和老师分配。</Typography.Text>}</Space> : <Typography.Text type="secondary">该诊断结果没有关联班型，无法手动分配阶段和老师。</Typography.Text>}</Card><Card size="small" title="画像分数"><Space wrap>{Object.entries(detail.scores).map(([code, score]) => <Tag key={code} color={score >= 70 ? 'green' : score >= 40 ? 'gold' : 'red'}>{dimensionLabel(code)}：{score}</Tag>)}</Space></Card><Card size="small" title={`答题快照（${detail.answeredCount} / ${detail.questionCount}）`}><Space direction="vertical" style={{display: 'flex'}}>{detail.questionSnapshot.map((question, index) => {const answer = detail.answers.find(item => item.questionId === question.id); const labels = answer?.optionIds.map(id => question.options.find(option => option.id === id)?.label ?? id) ?? []; return <div key={question.id}><Typography.Text strong>{index + 1}. {question.stem}</Typography.Text><Typography.Paragraph type="secondary" style={{marginBottom: 0}}>回答：{labels.length ? labels.join('、') : answer?.value ?? '未回答'}</Typography.Paragraph></div>;})}</Space></Card></Space> : null}
    </Modal>
  </Space>;
}
