import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  DisconnectOutlined,
  GiftOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  adjustAdminUserEntitlement,
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  getAdminUsers,
  getCurrentAdmin,
  restrictAdminUser,
  revokeAdminUserSessions,
  type AdminUserDetail,
  type AdminUserRecord,
} from '@/services/api';

const courseTypeLabel: Record<string, string> = {video: '视频', audio: '音频', live: '直播'};
const formatDate = (value?: string) => value ? new Date(value).toLocaleString('zh-CN', {hour12: false}) : '-';
const formatMinutes = (value: number) => value >= 60 ? `${Math.floor(value / 60)}小时${value % 60 ? ` ${value % 60}分` : ''}` : `${value}分钟`;

type CreateUserValues = {name: string; phone: string; examYear: string};
type DeleteUserValues = {reason: string; confirmation: string};

export default function Users() {
  const [items, setItems] = useState<AdminUserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<AdminUserDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [restrictionOpen, setRestrictionOpen] = useState(false);
  const [entitlementOpen, setEntitlementOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord>();
  const [submitting, setSubmitting] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [restrictionForm] = Form.useForm();
  const [entitlementForm] = Form.useForm();
  const [createForm] = Form.useForm<CreateUserValues>();
  const [deleteForm] = Form.useForm<DeleteUserValues>();

  const examYearOptions = useMemo(() => Array.from({length: 8}, (_, index) => {
    const value = String(new Date().getFullYear() + index);
    return {value, label: `${value} 年法考`};
  }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminUsers(keyword.trim() || undefined);
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载用户失败');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let active = true;
    getCurrentAdmin().then(admin => {
      if (!active) return;
      const permissions = new Set(admin.permissions);
      setCanWrite(permissions.has('*') || permissions.has('users.write'));
    }).catch(() => { if (active) setCanWrite(false); });
    return () => { active = false; };
  }, []);

  const openDetail = async (record: AdminUserRecord) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      setSelected(await getAdminUser(record.id));
    } catch (error) {
      setDrawerOpen(false);
      message.error(error instanceof Error ? error.message : '加载用户详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!selected) return;
    setDetailLoading(true);
    try {
      setSelected(await getAdminUser(selected.id));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '刷新详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCreate = async (values: CreateUserValues) => {
    setSubmitting(true);
    try {
      await createAdminUser({name: values.name.trim(), phone: values.phone.trim(), examYear: values.examYear});
      message.success('用户已创建，可使用手机号验证码登录 App');
      setCreateOpen(false);
      createForm.resetFields();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建用户失败');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    try {
      const values = await deleteForm.validateFields();
      setSubmitting(true);
      const result = await deleteAdminUser(deleteTarget.id, {reason: values.reason.trim(), confirmation: 'DELETE'});
      message.success(result.revokedSessions > 0 ? `用户已删除，并下线 ${result.revokedSessions} 个会话` : '用户已删除');
      if (selected?.id === deleteTarget.id) {
        setDrawerOpen(false);
        setSelected(undefined);
      }
      setDeleteTarget(undefined);
      deleteForm.resetFields();
      await load();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error(error instanceof Error ? error.message : '删除用户失败');
    } finally {
      setSubmitting(false);
    }
  };

  const submitRestriction = async (values: {type: 'login' | 'community'; reason: string; expiresAt?: string}) => {
    if (!selected) return;
    try {
      await restrictAdminUser(selected.id, values);
      message.success('限制已生效');
      setRestrictionOpen(false);
      restrictionForm.resetFields();
      await refreshDetail();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const revokeSessions = () => {
    if (!selected) return;
    Modal.confirm({
      title: '强制下线该用户？',
      content: '该用户所有有效设备会立即失效。',
      okText: '确认下线',
      okButtonProps: {danger: true},
      onOk: async () => {
        const result = await revokeAdminUserSessions(selected.id);
        message.success(`已撤销 ${result.revoked} 个会话`);
        await refreshDetail();
      },
    });
  };

  const submitEntitlement = async (values: {courseId: string; type: 'grant' | 'revoke'; reason: string; expiresAt?: string}) => {
    if (!selected) return;
    try {
      await adjustAdminUserEntitlement(selected.id, values);
      message.success(values.type === 'grant' ? '权益已发放' : '权益已撤销');
      setEntitlementOpen(false);
      entitlementForm.resetFields();
      await refreshDetail();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '权益调整失败');
    }
  };
  const renderOverview = (detail: AdminUserDetail) => <Space direction="vertical" size={16} style={{display: 'flex'}}><Row gutter={[12, 12]}><Col span={8}><Card size="small"><Statistic title="课程进度" value={detail.learningSummary.averageProgress} suffix="%" /></Card></Col><Col span={8}><Card size="small"><Statistic title="累计学习" value={formatMinutes(detail.learningSummary.studyMinutes)} /></Card></Col><Col span={8}><Card size="small"><Statistic title="做题正确率" value={detail.questionStats.correctRate} suffix="%" /></Card></Col></Row><Descriptions column={2} size="small" bordered items={[{key: 'id', label: '用户 ID', children: detail.id}, {key: 'phone', label: '手机号', children: detail.phone || '-'}, {key: 'year', label: '考试年份', children: detail.examYear || '-'}, {key: 'study', label: '学习天数', children: detail.studyDays}, {key: 'role', label: '角色', children: detail.role}, {key: 'status', label: '账号状态', children: detail.restriction ? <Tag color="red">{detail.restriction.type === 'login' ? '禁止登录' : '禁止发言'}</Tag> : <Tag color="green">正常</Tag>}]} /><Space wrap><Button danger icon={<StopOutlined />} onClick={() => setRestrictionOpen(true)}>限制账号</Button><Button icon={<DisconnectOutlined />} onClick={revokeSessions}>强制下线</Button><Button type="primary" icon={<GiftOutlined />} onClick={() => setEntitlementOpen(true)}>调整课程权益</Button><Button icon={<ReloadOutlined />} onClick={() => void refreshDetail()}>刷新详情</Button></Space>{detail.restriction && <Alert type="warning" showIcon message={`当前限制：${detail.restriction.reason}`} description={`创建于 ${formatDate(detail.restriction.createdAt)}${detail.restriction.expiresAt ? `，截止 ${formatDate(detail.restriction.expiresAt)}` : '，长期有效'}`} />}</Space>;
  const renderLearning = (detail: AdminUserDetail) => <Space direction="vertical" size={16} style={{display: 'flex'}}><Row gutter={[12, 12]}><Col span={8}><Statistic title="课程数" value={detail.learningSummary.courseCount} /></Col><Col span={8}><Statistic title="已完成" value={detail.learningSummary.completedCourseCount} /></Col><Col span={8}><Statistic title="听课时长" value={formatMinutes(detail.learningSummary.courseMinutes)} /></Col></Row><Table size="small" rowKey="courseId" pagination={false} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无听课记录" />}} dataSource={detail.courseProgress} columns={[{title: '课程', dataIndex: 'courseTitle', render: (value, row) => <Space direction="vertical" size={0}><Typography.Text strong>{value}</Typography.Text><Typography.Text type="secondary">{row.teacher || '-'} · {courseTypeLabel[row.type || ''] || row.type || '-'} · {row.lessons || 0} 节</Typography.Text></Space>}, {title: '进度', dataIndex: 'progress', width: 170, render: (value) => <Progress percent={value} size="small" />}, {title: '更新时间', dataIndex: 'updatedAt', width: 160, render: formatDate}]} /><Divider orientation="left">最近学习活动</Divider><List size="small" bordered locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无学习活动" />}} dataSource={detail.learningActivities.slice(0, 8)} renderItem={entry => <List.Item><Space><Tag>{entry.kind === 'course' ? '听课' : entry.kind === 'question' ? '做题' : entry.kind === 'task' ? '计划' : '阅读'}</Tag><Typography.Text>{entry.courseId || entry.questionId || entry.taskId || '学习活动'}</Typography.Text><Typography.Text type="secondary">{formatMinutes(Math.round(entry.durationSeconds / 60))} · {formatDate(entry.occurredAt)}</Typography.Text></Space></List.Item>} /><Divider orientation="left">学习计划与任务</Divider><List size="small" bordered locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无学习计划" />}} dataSource={detail.plans} renderItem={plan => <List.Item><Space direction="vertical" size={0}><Typography.Text strong>{String(plan.title || '学习计划')}</Typography.Text><Typography.Text type="secondary">每日 {String(plan.dailyMinutes || 0)} 分钟 · {String(plan.status || '-')} · {String(detail.tasks.filter(task => task.planId === plan.id).length)} 项任务</Typography.Text></Space></List.Item>} /></Space>;
  const renderQuestions = (detail: AdminUserDetail) => <Space direction="vertical" size={16} style={{display: 'flex'}}><Row gutter={[12, 12]}><Col span={8}><Statistic title="已答题" value={detail.questionStats.answeredCount} /></Col><Col span={8}><Statistic title="答对" value={detail.questionStats.correctCount} /></Col><Col span={8}><Statistic title="错题数" value={detail.questionStats.mistakeCount} /></Col><Col span={8}><Statistic title="收藏题" value={detail.questionStats.favoriteCount} /></Col><Col span={8}><Statistic title="收藏法条" value={detail.questionStats.legalFavoriteCount} /></Col><Col span={8}><Statistic title="正确率" value={detail.questionStats.correctRate} suffix="%" /></Col></Row><Table size="small" rowKey="id" pagination={false} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无客观题作答记录" />}} dataSource={detail.questionSubmissions.slice(0, 12)} columns={[{title: '题目 ID', dataIndex: 'questionId'}, {title: '结果', dataIndex: 'correct', render: (value) => value ? <Tag color="green">答对</Tag> : <Tag color="red">答错</Tag>}, {title: '作答时间', dataIndex: 'createdAt', render: formatDate}]} /></Space>;
  const renderExams = (detail: AdminUserDetail) => <Space direction="vertical" size={16} style={{display: 'flex'}}><Row gutter={[12, 12]}><Col span={8}><Statistic title="客观题考试" value={detail.examStats.objectiveSessionCount} /></Col><Col span={8}><Statistic title="客观题报告" value={detail.examStats.objectiveReportCount} /></Col><Col span={8}><Statistic title="客观题平均分" value={detail.examStats.objectiveAverageScore} /></Col><Col span={8}><Statistic title="主观题提交" value={detail.examStats.subjectiveSubmissionCount} /></Col><Col span={8}><Statistic title="已发布批改" value={detail.examStats.subjectivePublishedCount} /></Col><Col span={8}><Statistic title="主观题得分率" value={detail.examStats.subjectiveAverageScore} suffix="%" /></Col></Row><Divider orientation="left">客观题考试记录</Divider><Table size="small" rowKey="id" pagination={false} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无客观题考试记录" />}} dataSource={detail.objectiveReports} columns={[{title: '考试', dataIndex: 'title'}, {title: '答题数', dataIndex: 'answered', render: (value, row) => `${value}/${row.total}`}, {title: '得分', dataIndex: 'score', render: (value, row) => `${value}/${row.maxScore}`}, {title: '提交时间', dataIndex: 'submittedAt', render: formatDate}]} /><Divider orientation="left">主观题批改记录</Divider><Table size="small" rowKey="id" pagination={false} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无主观题批改记录" />}} dataSource={detail.subjectiveSubmissions} columns={[{title: '提交 ID', dataIndex: 'id'}, {title: '试卷 ID', dataIndex: 'paperId', render: (value) => value || '-'}, {title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 'published' ? 'green' : 'blue'}>{value}</Tag>}, {title: '得分', dataIndex: 'score', render: (value, row) => value === undefined ? '-' : `${value}/${row.maxScore}`}, {title: '提交时间', dataIndex: 'createdAt', render: formatDate}]} /></Space>;

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>用户与权益</Typography.Title>
          <Typography.Text type="secondary">共 {total} 位用户，支持手动开户、账号治理以及学习与权益查询</Typography.Text>
        </div>
        <Space wrap>
          {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.setFieldsValue({examYear: String(new Date().getFullYear())}); setCreateOpen(true); }}>新增用户</Button>}
          <Space.Compact>
            <Input allowClear value={keyword} onChange={event => setKeyword(event.target.value)} onPressEnter={() => void load()} placeholder="搜索昵称、手机号或用户 ID" prefix={<SearchOutlined />} />
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
          </Space.Compact>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{x: 980}}
        locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={keyword ? '没有符合搜索条件的用户' : '暂无用户'} />}}
        columns={[
          {title: '用户', dataIndex: 'name', render: value => <Typography.Text strong>{value || '未命名用户'}</Typography.Text>},
          {title: '手机号', dataIndex: 'phone'},
          {title: '考试年份', dataIndex: 'examYear'},
          {title: '学习天数', dataIndex: 'studyDays'},
          {title: '课程权益', dataIndex: 'courseCount'},
          {title: '活跃会话', dataIndex: 'sessionCount'},
          {title: '状态', render: () => <Tag color="green">正常</Tag>},
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: canWrite ? 170 : 90,
            render: (_, record) => (
              <Space size={4}>
                <Button type="link" size="small" onClick={() => void openDetail(record)}>查看详情</Button>
                {canWrite && <Button danger type="link" size="small" icon={<DeleteOutlined />} onClick={() => { deleteForm.resetFields(); setDeleteTarget(record); }}>删除</Button>}
              </Space>
            ),
          },
        ]}
        pagination={{pageSize: 20, total, showTotal: value => `共 ${value} 条`}}
      />

      <Drawer title={selected ? `用户详情 · ${selected.name || selected.phone}` : '用户详情'} width={860} open={drawerOpen} onClose={() => setDrawerOpen(false)} destroyOnClose>
        {detailLoading ? <div style={{padding: 80, textAlign: 'center'}}><Spin tip="正在加载用户数据..." /></div> : selected && (
          <Tabs items={[
            {key: 'overview', label: '概览', children: renderOverview(selected)},
            {key: 'learning', label: '听课数据', children: renderLearning(selected)},
            {key: 'questions', label: '做题数据', children: renderQuestions(selected)},
            {key: 'exams', label: '考试数据', children: renderExams(selected)},
            {key: 'commerce', label: '订单与权益', children: <Space direction="vertical" size={16} style={{display: 'flex'}}><Divider orientation="left">课程权益</Divider><List size="small" bordered locale={{emptyText: '暂无课程权益'}} dataSource={selected.entitlements} renderItem={entry => <List.Item><Space direction="vertical" size={0}><Typography.Text>{entry.courseId}</Typography.Text><Typography.Text type="secondary">来源：{entry.sourceOrderId || '未知'}{entry.expiresAt ? ` · 到期 ${formatDate(entry.expiresAt)}` : ''}</Typography.Text></Space></List.Item>} /><Divider orientation="left">订单</Divider><List size="small" bordered locale={{emptyText: '暂无订单'}} dataSource={selected.orders} renderItem={order => <List.Item><Space><Typography.Text>{String(order.productName || order.id)}</Typography.Text><Tag>{String(order.status || '-')}</Tag><Typography.Text type="secondary">¥{String(order.amount || 0)} · {formatDate(String(order.createdAt || ''))}</Typography.Text></Space></List.Item>} /></Space>},
            {key: 'security', label: '账号安全', children: <Space direction="vertical" size={16} style={{display: 'flex'}}><Divider orientation="left">有效会话</Divider><List size="small" bordered locale={{emptyText: '暂无有效会话'}} dataSource={selected.sessions.filter(item => !item.revokedAt)} renderItem={entry => <List.Item><Typography.Text>{entry.deviceId} · 到期 {formatDate(entry.expiresAt)}</Typography.Text></List.Item>} /><Divider orientation="left">设备</Divider><List size="small" bordered locale={{emptyText: '暂无设备'}} dataSource={selected.devices} renderItem={entry => <List.Item><Typography.Text>{entry.name} · {entry.platform} · 最近活跃 {formatDate(entry.lastSeenAt)}</Typography.Text></List.Item>} /></Space>},
          ]} />
        )}
        <Alert style={{marginTop: 16}} type="info" showIcon message="所有后台操作都会写入审计日志，生产环境需按双人复核策略执行高风险操作。" />
      </Drawer>

      <Drawer title="新增用户" width={480} open={createOpen} onClose={() => { setCreateOpen(false); createForm.resetFields(); }} destroyOnClose>
        <Alert type="info" showIcon message="无需设置初始密码" description="用户创建后，可在 App 使用该手机号获取验证码并登录。" style={{marginBottom: 20}} />
        <Form form={createForm} layout="vertical" onFinish={submitCreate} requiredMark="optional">
          <Form.Item name="name" label="用户昵称" required rules={[{required: true, whitespace: true, min: 2, max: 80, message: '请输入 2 到 80 个字符的用户昵称'}]}>
            <Input maxLength={80} showCount placeholder="例如：张同学" autoComplete="off" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" required rules={[{required: true, pattern: /^1\d{10}$/, message: '请输入有效的 11 位中国大陆手机号'}]}>
            <Input inputMode="numeric" maxLength={11} placeholder="用于 App 验证码登录" autoComplete="off" />
          </Form.Item>
          <Form.Item name="examYear" label="考试年份" required rules={[{required: true, message: '请选择考试年份'}]}>
            <Select options={examYearOptions} placeholder="请选择" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>创建用户</Button>
        </Form>
      </Drawer>

      <Modal
        title="删除用户"
        open={Boolean(deleteTarget)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{danger: true, loading: submitting}}
        onOk={() => void submitDelete()}
        onCancel={() => { setDeleteTarget(undefined); deleteForm.resetFields(); }}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          message={`将删除用户“${deleteTarget?.name ?? ''}”`}
          description="账号会立即下线并从用户列表移除，手机号和身份绑定会被清理；订单、学习记录及审计记录会继续保留。"
          style={{marginBottom: 18}}
        />
        <Form form={deleteForm} layout="vertical">
          <Form.Item name="reason" label="删除原因" rules={[{required: true, whitespace: true, min: 4, max: 500, message: '请输入 4 到 500 个字符的删除原因'}]}>
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="例如：测试账号清理" />
          </Form.Item>
          <Form.Item name="confirmation" label="输入 DELETE 确认" rules={[{required: true, validator: async (_, value?: string) => { if (value !== 'DELETE') throw new Error('请输入 DELETE 确认删除'); }}]}>
            <Input placeholder="DELETE" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="限制用户" open={restrictionOpen} onCancel={() => setRestrictionOpen(false)} onOk={() => restrictionForm.submit()} okText="确认限制" okButtonProps={{danger: true}} destroyOnClose>
        <Form form={restrictionForm} layout="vertical" onFinish={submitRestriction}>
          <Form.Item name="type" label="限制范围" initialValue="login"><Select options={[{value: 'login', label: '禁止登录'}, {value: 'community', label: '禁止社区发言'}]} /></Form.Item>
          <Form.Item name="reason" label="原因" rules={[{required: true, min: 2, message: '请输入原因'}]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="expiresAt" label="截止时间（可选）"><Input placeholder="2026-12-31T23:59:59.000Z" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="调整课程权益" open={entitlementOpen} onCancel={() => setEntitlementOpen(false)} onOk={() => entitlementForm.submit()} okText="提交调整" destroyOnClose>
        <Form form={entitlementForm} layout="vertical" onFinish={submitEntitlement}>
          <Form.Item name="courseId" label="课程 ID" rules={[{required: true, message: '请输入课程 ID'}]}><Input placeholder="例如 c-demo" /></Form.Item>
          <Form.Item name="type" label="调整类型" initialValue="grant"><Select options={[{value: 'grant', label: '发放权益'}, {value: 'revoke', label: '撤销权益'}]} /></Form.Item>
          <Form.Item name="reason" label="原因" rules={[{required: true, min: 2, message: '请输入原因'}]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="expiresAt" label="到期时间（可选）"><Input placeholder="2026-12-31T23:59:59.000Z" /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
