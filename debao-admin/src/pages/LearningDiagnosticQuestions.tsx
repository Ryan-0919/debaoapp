import {DeleteOutlined, EditOutlined, PauseCircleOutlined, PlusOutlined, ReloadOutlined, SendOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Col, Drawer, Empty, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Statistic, Switch, Table, Tag, Typography, message} from 'antd';
import dayjs from 'dayjs';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {
  createLearningDiagnosticQuestion,
  createLearningDiagnosticDimension,
  deleteLearningDiagnosticDimension,
  deleteLearningDiagnosticQuestion,
  disableLearningDiagnosticQuestion,
  disableLearningDiagnosticForm,
  getCurrentAdmin,
  getLearningDiagnosticDimensions,
  getLearningDiagnosticForm,
  getLearningDiagnosticQuestions,
  publishLearningDiagnosticForm,
  publishLearningDiagnosticQuestion,
  updateLearningDiagnosticDimension,
  updateLearningDiagnosticForm,
  updateLearningDiagnosticQuestion,
  type AdminLearningDiagnosticInput,
  type AdminLearningDiagnosticDimension,
  type AdminLearningDiagnosticForm,
  type AdminLearningDiagnosticQuestion,
  type AdminLearningDiagnosticStats,
  type LearningDiagnosticDimension,
} from '@/services/api';

type FormValues = AdminLearningDiagnosticInput;
type StatusFilter = AdminLearningDiagnosticQuestion['status'] | undefined;

const fallbackDimensionMeta: Record<string, {label: string; color: string; description: string}> = {
  foundation: {label: '学习基础', color: 'blue', description: '已有知识与备考经历'},
  time: {label: '时间投入', color: 'cyan', description: '每天可稳定投入的时间'},
  discipline: {label: '执行能力', color: 'purple', description: '计划执行与拖延风险'},
  comprehension: {label: '理解能力', color: 'geekblue', description: '理解复杂规则和案例的能力'},
  memory: {label: '记忆能力', color: 'gold', description: '记忆与复习保持情况'},
  practice: {label: '练习习惯', color: 'green', description: '做题、复盘和错题整理习惯'},
};

const questionTypeMeta: Record<string, string> = {single: '单选题', multiple: '多选题', scale: '量表题', text: '文本题', number: '数字题'};

const statusMeta = {
  draft: {label: '草稿', color: 'default'},
  published: {label: '已发布', color: 'success'},
  disabled: {label: '已停用', color: 'error'},
} as const;

const emptyStats: AdminLearningDiagnosticStats = {total: 0, draft: 0, published: 0, disabled: 0};

export default function LearningDiagnosticQuestions() {
  const location = useLocation();
  const section = location.pathname.endsWith('/form') ? 'form' : location.pathname.endsWith('/dimensions') ? 'dimensions' : 'questions';
  const showForm = section === 'form';
  const showDimensions = section === 'dimensions';
  const showQuestions = section === 'questions';
  const [items, setItems] = useState<AdminLearningDiagnosticQuestion[]>([]);
  const [stats, setStats] = useState(emptyStats);
  const [dimensions, setDimensions] = useState<AdminLearningDiagnosticDimension[]>([]);
  const [formSettings, setFormSettings] = useState<AdminLearningDiagnosticForm | null>(null);
  const [formCounts, setFormCounts] = useState({publishedQuestionCount: 0, totalQuestionCount: 0});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminLearningDiagnosticQuestion | null>(null);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>();
  const [disableTarget, setDisableTarget] = useState<AdminLearningDiagnosticQuestion | null>(null);
  const [disableFormOpen, setDisableFormOpen] = useState(false);
  const [dimensionDrawerOpen, setDimensionDrawerOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState<AdminLearningDiagnosticDimension | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const [settingsForm] = Form.useForm();
  const [dimensionForm] = Form.useForm();
  const [disableForm] = Form.useForm<{reason: string}>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLearningDiagnosticQuestions({keyword: keyword || undefined, status});
      setItems(result.items);
      setStats(result.stats);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '诊断题加载失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, status]);

  useEffect(() => { void load(); }, [load]);
  const loadConfiguration = useCallback(async () => {
    try {
      const [formResult, dimensionResult] = await Promise.all([getLearningDiagnosticForm(), getLearningDiagnosticDimensions()]);
      setFormSettings(formResult.form);
      setFormCounts({publishedQuestionCount: formResult.publishedQuestionCount, totalQuestionCount: formResult.totalQuestionCount});
      setDimensions(dimensionResult.items);
      settingsForm.setFieldsValue(formResult.form);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '表单配置加载失败');
    }
  }, [settingsForm]);
  useEffect(() => { void loadConfiguration(); }, [loadConfiguration]);
  useEffect(() => {
    getCurrentAdmin().then(admin => {
      const permissions = new Set(admin.permissions);
      setCanWrite(permissions.has('*') || permissions.has('learning.diagnostics.write'));
      setCanPublish(permissions.has('*') || permissions.has('learning.diagnostics.publish'));
    }).catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({type: 'single', dimension: dimensions.find(item => item.status === 'active')?.code ?? 'foundation', required: true, sortOrder: (stats.total + 1) * 10, options: [{label: '', score: 0, sortOrder: 10}, {label: '', score: 1, sortOrder: 20}]});
    setDrawerOpen(true);
  };

  const openEdit = (question: AdminLearningDiagnosticQuestion) => {
    setEditing(question);
    form.setFieldsValue({stem: question.stem, description: question.description, section: question.section, placeholder: question.placeholder, type: question.type, dimension: question.dimension, required: question.required, sortOrder: question.sortOrder, validation: question.validation, options: question.options.map(option => ({...option}))});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const save = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const normalized: AdminLearningDiagnosticInput = {...values, description: values.description?.trim() || undefined, section: values.section?.trim() || undefined, placeholder: values.placeholder?.trim() || undefined, options: values.options?.map((option, index) => ({...option, label: option.label.trim(), sortOrder: option.sortOrder ?? (index + 1) * 10})) ?? []};
      if (editing) await updateLearningDiagnosticQuestion(editing.id, normalized);
      else await createLearningDiagnosticQuestion(normalized);
      message.success(editing ? '已保存为草稿，请确认后重新发布' : '诊断题已创建');
      closeDrawer();
      await load();
      await loadConfiguration();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = async (values: Record<string, unknown>) => {
    try { const updated = await updateLearningDiagnosticForm(values); setFormSettings(updated); message.success('表单设置已保存为草稿，请重新发布'); await loadConfiguration(); } catch (error) { message.error(error instanceof Error ? error.message : '表单设置保存失败'); }
  };

  const saveDimension = async (values: {code?: string; label: string; description?: string; color?: string; sortOrder: number; status?: 'active' | 'disabled'}) => {
    try {
      if (editingDimension) await updateLearningDiagnosticDimension(editingDimension.code, values);
      else await createLearningDiagnosticDimension({...values, code: values.code ?? ''});
      message.success(editingDimension ? '画像维度已更新' : '画像维度已创建'); setDimensionDrawerOpen(false); setEditingDimension(null); dimensionForm.resetFields(); await loadConfiguration();
    } catch (error) { message.error(error instanceof Error ? error.message : '画像维度保存失败'); }
  };

  const editDimension = (dimension: AdminLearningDiagnosticDimension) => { setEditingDimension(dimension); dimensionForm.setFieldsValue(dimension); setDimensionDrawerOpen(true); };

  const removeDimension = async (dimension: AdminLearningDiagnosticDimension) => {
    try { await deleteLearningDiagnosticDimension(dimension.code); message.success('画像维度已删除'); await loadConfiguration(); } catch (error) { message.error(error instanceof Error ? error.message : '删除失败'); }
  };

  const publish = async (question: AdminLearningDiagnosticQuestion) => {
    try {
      await publishLearningDiagnosticQuestion(question.id);
      message.success('诊断题已发布，App 将按排序展示');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    }
  };

  const disable = async () => {
    if (!disableTarget) return;
    const values = await disableForm.validateFields();
    setSubmitting(true);
    try {
      await disableLearningDiagnosticQuestion(disableTarget.id, values.reason.trim());
      message.success('诊断题已停用，不再向新用户展示');
      setDisableTarget(null);
      disableForm.resetFields();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '停用失败');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (question: AdminLearningDiagnosticQuestion) => {
    try {
      await deleteLearningDiagnosticQuestion(question.id);
      message.success('草稿已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns = useMemo(() => [
    {title: '排序', dataIndex: 'sortOrder', width: 72},
    {title: '诊断题', dataIndex: 'stem', width: 390, render: (_: unknown, question: AdminLearningDiagnosticQuestion) => <Space direction="vertical" size={2}><Typography.Text strong>{question.stem}</Typography.Text>{question.description && <Typography.Text type="secondary" ellipsis style={{maxWidth: 370}}>{question.description}</Typography.Text>}</Space>},
    {title: '画像维度', dataIndex: 'dimension', width: 140, render: (value: LearningDiagnosticDimension) => {const meta = dimensions.find(item => item.code === value) ?? fallbackDimensionMeta[value] ?? {label: value, color: 'default'}; return <Tag color={meta.color}>{meta.label}</Tag>;}},
    {title: '题型', dataIndex: 'type', width: 90, render: (value: AdminLearningDiagnosticQuestion['type']) => questionTypeMeta[value] ?? value},
    {title: '选项', dataIndex: 'options', width: 80, render: (options: AdminLearningDiagnosticQuestion['options']) => `${options.length} 项`},
    {title: '版本', dataIndex: 'version', width: 72, render: (value: number) => `v${value}`},
    {title: '状态', dataIndex: 'status', width: 100, render: (value: AdminLearningDiagnosticQuestion['status']) => <Tag color={statusMeta[value].color}>{statusMeta[value].label}</Tag>},
    {title: '更新时间', dataIndex: 'updatedAt', width: 160, render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm')},
    {title: '操作', key: 'actions', fixed: 'right' as const, width: 250, render: (_: unknown, question: AdminLearningDiagnosticQuestion) => <Space size={4} wrap>
      {canWrite && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(question)}>编辑</Button>}
      {canPublish && question.status !== 'published' && <Popconfirm title="发布这道诊断题？" description="发布后会立即进入 App 的首次学习诊断。" onConfirm={() => publish(question)}><Button type="link" size="small" icon={<SendOutlined />}>发布</Button></Popconfirm>}
      {canPublish && question.status === 'published' && <Button type="link" danger size="small" icon={<PauseCircleOutlined />} onClick={() => {disableForm.resetFields(); setDisableTarget(question);}}>停用</Button>}
      {canWrite && question.status === 'draft' && <Popconfirm title="删除这份草稿？" description="删除后无法恢复。" okButtonProps={{danger: true}} onConfirm={() => remove(question)}><Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button></Popconfirm>}
    </Space>},
  ], [canPublish, canWrite, dimensions, disableForm]);

  return (
    <Space direction="vertical" size={20} style={{display: 'flex'}}>
      <div>
        <Typography.Title level={3} style={{margin: 0}}>首次学习诊断</Typography.Title>
        <Typography.Paragraph type="secondary" style={{margin: '6px 0 0'}}>配置用户购买“得恩私教”后首次进入时完成的画像问卷。选项分值仅用于后台计算，不会在 App 展示。</Typography.Paragraph>
      </div>

      {showQuestions && <Row gutter={16}>
        <Col span={6}><Card size="small"><Statistic title="全部题目" value={stats.total} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已发布" value={stats.published} valueStyle={{color: '#389e0d'}} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="草稿" value={stats.draft} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已停用" value={stats.disabled} valueStyle={{color: '#cf1322'}} /></Card></Col>
      </Row>}

      {showForm && <Card title="表单设置" extra={formSettings ? <Space><Typography.Text type="secondary">已发布题目 {formCounts.publishedQuestionCount} / {formCounts.totalQuestionCount}</Typography.Text><Tag color={formSettings.status === 'published' ? 'success' : formSettings.status === 'disabled' ? 'error' : 'default'}>{formSettings.status === 'published' ? '已发布' : formSettings.status === 'disabled' ? '已停用' : '草稿'}</Tag>{canPublish && formSettings.status !== 'published' && <Popconfirm title="发布整个诊断表单？" description="只有已发布的题目会出现在 App。" onConfirm={async () => {try {await publishLearningDiagnosticForm(); message.success('诊断表单已发布'); await loadConfiguration();} catch (error) {message.error(error instanceof Error ? error.message : '发布失败');}}}><Button type="primary" size="small">发布表单</Button></Popconfirm>}{canPublish && formSettings.status === 'published' && <Button danger size="small" onClick={() => setDisableFormOpen(true)}>停用表单</Button>}</Space> : null}>
        <Form form={settingsForm} layout="vertical" onFinish={saveSettings} requiredMark="optional">
          <Row gutter={16}><Col span={8}><Form.Item name="title" label="表单标题" rules={[{required: true, min: 2, max: 120}]}><Input /></Form.Item></Col><Col span={8}><Form.Item name="subtitle" label="副标题"><Input maxLength={160} /></Form.Item></Col><Col span={8}><Form.Item name="estimatedMinutes" label="预计用时（分钟）" rules={[{required: true}]}><InputNumber min={1} max={120} precision={0} style={{width: '100%'}} /></Form.Item></Col></Row>
          <Form.Item name="description" label="表单说明"><Input.TextArea rows={2} maxLength={1000} showCount /></Form.Item>
          <Row gutter={16}><Col span={8}><Form.Item name="submitLabel" label="提交按钮文案" rules={[{required: true}]}><Input maxLength={40} /></Form.Item></Col><Col span={8}><Form.Item name="successTitle" label="完成标题" rules={[{required: true}]}><Input maxLength={120} /></Form.Item></Col><Col span={8}><Form.Item name="successDescription" label="完成说明" rules={[{required: true}]}><Input maxLength={1000} /></Form.Item></Col></Row>
          <Button type="primary" htmlType="submit">保存表单设置</Button>
        </Form>
      </Card>}

      {showDimensions && <Card title="画像维度" extra={canWrite && <Button type="primary" onClick={() => {setEditingDimension(null); dimensionForm.resetFields(); dimensionForm.setFieldsValue({sortOrder: (dimensions.length + 1) * 10, color: 'blue'}); setDimensionDrawerOpen(true);}}>新建画像维度</Button>}>
        <Typography.Paragraph type="secondary">画像维度是诊断结果的指标。可以按产品需要新增，例如“应试焦虑”“基础法律素养”或“学习环境”。维度编码只用于系统识别，用户端展示的是名称。</Typography.Paragraph>
        <Table rowKey="code" pagination={false} dataSource={dimensions} columns={[{title: '名称', dataIndex: 'label', render: (value: string, item: AdminLearningDiagnosticDimension) => <Space><Tag color={item.color}>{value}</Tag>{item.status === 'disabled' && <Tag>已停用</Tag>}</Space>}, {title: '编码', dataIndex: 'code'}, {title: '说明', dataIndex: 'description'}, {title: '排序', dataIndex: 'sortOrder'}, {title: '操作', key: 'actions', render: (_: unknown, item: AdminLearningDiagnosticDimension) => <Space><Button type="link" size="small" onClick={() => editDimension(item)}>编辑</Button>{canWrite && <Popconfirm title="删除这个画像维度？" description="已有题目使用时不能删除。" onConfirm={() => removeDimension(item)}><Button type="link" danger size="small">删除</Button></Popconfirm>}</Space>}]} />
      </Card>}

      {showQuestions && <Card>
        <Space wrap style={{display: 'flex', justifyContent: 'space-between', marginBottom: 18}}>
          <Space wrap>
            <Input.Search value={keywordDraft} onChange={event => setKeywordDraft(event.target.value)} onSearch={value => setKeyword(value.trim())} allowClear placeholder="搜索诊断题" style={{width: 280}} />
            <Select allowClear value={status} onChange={setStatus} placeholder="全部状态" style={{width: 140}} options={Object.entries(statusMeta).map(([value, meta]) => ({value, label: meta.label}))} />
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
          </Space>
          {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建诊断题</Button>}
        </Space>
        <Table rowKey="id" loading={loading} dataSource={items} columns={columns} pagination={false} scroll={{x: 1280}} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有符合条件的诊断题" />}} />
      </Card>}

      {showQuestions && <Drawer title={editing ? '编辑诊断题' : '新建诊断题'} open={drawerOpen} width={720} onClose={closeDrawer} destroyOnHidden extra={<Button type="primary" loading={submitting} onClick={() => form.submit()}>{editing ? '保存为草稿' : '创建草稿'}</Button>}>
        {editing?.status === 'published' && <Alert showIcon type="warning" message="编辑后将转为草稿" description="已完成诊断的历史结果保留原题快照；当前题目重新发布前不会向新用户展示。" style={{marginBottom: 20}} />}
        <Form form={form} layout="vertical" onFinish={save} requiredMark="optional">
          <Form.Item name="stem" label="题目内容" rules={[{required: true, message: '请输入题目内容'}, {min: 4, max: 500}]}><Input.TextArea rows={3} maxLength={500} showCount placeholder="例如：你目前的法考备考基础更接近哪种情况？" /></Form.Item>
          <Form.Item name="description" label="作答提示" rules={[{max: 300}]}><Input maxLength={300} placeholder="可选，例如：请选择最符合当前真实状态的一项" /></Form.Item>
          <Row gutter={16}><Col span={12}><Form.Item name="section" label="题目分组"><Input maxLength={120} placeholder="例如：备考基础、学习习惯" /></Form.Item></Col><Col span={12}><Form.Item name="placeholder" label="填写提示"><Input maxLength={240} placeholder="文本题或数字题的输入提示" /></Form.Item></Col></Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="题型" rules={[{required: true}]}><Select options={Object.entries(questionTypeMeta).map(([value, label]) => ({value, label}))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="dimension" label="画像维度" rules={[{required: true}]}><Select options={dimensions.filter(item => item.status === 'active').map(item => ({value: item.code, label: `${item.label}${item.description ? ` · ${item.description}` : ''}`}))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="sortOrder" label="题目排序" extra="数字越小越靠前" rules={[{required: true}]}><InputNumber min={0} max={9999} precision={0} style={{width: '100%'}} /></Form.Item></Col>
            <Col span={12}><Form.Item name="required" label="是否必答" valuePropName="checked"><Switch checkedChildren="必答" unCheckedChildren="选答" /></Form.Item></Col>
          </Row>
          <Typography.Title level={5}>题目校验</Typography.Title>
          <Typography.Paragraph type="secondary">文本题可设置字数上限；数字题可设置最小值和最大值；量表题也可以使用选项分值。</Typography.Paragraph>
          <Row gutter={12}><Col span={6}><Form.Item name={['validation', 'min']} label="最小值"><InputNumber style={{width: '100%'}} /></Form.Item></Col><Col span={6}><Form.Item name={['validation', 'max']} label="最大值"><InputNumber style={{width: '100%'}} /></Form.Item></Col><Col span={6}><Form.Item name={['validation', 'minLength']} label="最少字数"><InputNumber min={0} max={5000} precision={0} style={{width: '100%'}} /></Form.Item></Col><Col span={6}><Form.Item name={['validation', 'maxLength']} label="最多字数"><InputNumber min={1} max={5000} precision={0} style={{width: '100%'}} /></Form.Item></Col></Row>
          <Form.Item noStyle shouldUpdate={(previous, current) => previous.type !== current.type}>
            {({getFieldValue}) => ['single', 'multiple', 'scale'].includes(getFieldValue('type')) ? <>
              <Typography.Title level={5}>选项与画像分值</Typography.Title>
              <Typography.Paragraph type="secondary">单选、多选、量表题需要配置选项。分值范围为 0～10，同一画像维度下分值越高表示该项能力或条件越充分。</Typography.Paragraph>
              <Form.List name="options" rules={[{validator: async (_, options) => {if (!options || options.length < 2) throw new Error('至少需要两个选项');}}]}>
                {(fields, {add, remove}, {errors}) => <Space direction="vertical" size={12} style={{display: 'flex'}}>
                  {fields.map((field, index) => <Card key={field.key} size="small" title={`选项 ${index + 1}`} extra={<Button type="text" danger icon={<DeleteOutlined />} disabled={fields.length <= 2} onClick={() => remove(field.name)}>删除</Button>}>
                    <Form.Item name={[field.name, 'id']} hidden><Input /></Form.Item>
                    <Row gutter={12}>
                      <Col flex="auto"><Form.Item name={[field.name, 'label']} label="选项内容" rules={[{required: true, message: '请输入选项内容'}, {max: 160}]}><Input maxLength={160} placeholder="用户在 App 中看到的选项" /></Form.Item></Col>
                      <Col flex="120px"><Form.Item name={[field.name, 'score']} label="画像分值" rules={[{required: true}]}><InputNumber min={0} max={10} precision={0} style={{width: '100%'}} /></Form.Item></Col>
                      <Col flex="110px"><Form.Item name={[field.name, 'sortOrder']} label="排序" rules={[{required: true}]}><InputNumber min={0} max={9999} precision={0} style={{width: '100%'}} /></Form.Item></Col>
                    </Row>
                  </Card>)}
                  <Button type="dashed" block icon={<PlusOutlined />} disabled={fields.length >= 8} onClick={() => add({label: '', score: fields.length, sortOrder: (fields.length + 1) * 10})}>添加选项</Button>
                  <Form.ErrorList errors={errors} />
                </Space>}
              </Form.List>
            </> : null}
          </Form.Item>
        </Form>
      </Drawer>}

      {showDimensions && <Drawer title={editingDimension ? '编辑画像维度' : '新建画像维度'} open={dimensionDrawerOpen} width={480} onClose={() => {setDimensionDrawerOpen(false); setEditingDimension(null); dimensionForm.resetFields();}} extra={<Button type="primary" onClick={() => dimensionForm.submit()}>保存</Button>}>
        <Form form={dimensionForm} layout="vertical" onFinish={saveDimension} requiredMark="optional">
          {!editingDimension && <Form.Item name="code" label="维度编码" extra="仅支持小写字母、数字、下划线和短横线，创建后不可修改" rules={[{required: true, pattern: /^[a-z][a-z0-9_-]{1,79}$/, message: '请输入 2～80 位小写编码'}]}><Input placeholder="例如：exam_anxiety" /> </Form.Item>}
          <Form.Item name="label" label="维度名称" rules={[{required: true, min: 2, max: 80}]}><Input placeholder="例如：应试焦虑" /></Form.Item>
          <Form.Item name="description" label="维度说明"><Input.TextArea rows={3} maxLength={240} showCount placeholder="给管理员看的说明，帮助选择合适的维度" /></Form.Item>
          <Row gutter={12}><Col span={8}><Form.Item name="color" label="标签颜色"><Select options={['blue', 'cyan', 'purple', 'geekblue', 'gold', 'green', 'red', 'orange'].map(value => ({value, label: value}))} /></Form.Item></Col><Col span={8}><Form.Item name="sortOrder" label="排序" rules={[{required: true}]}><InputNumber min={0} max={9999} precision={0} style={{width: '100%'}} /></Form.Item></Col><Col span={8}><Form.Item name="status" label="状态" valuePropName="checked" getValueProps={value => ({checked: value !== 'disabled'})} getValueFromEvent={checked => checked ? 'active' : 'disabled'}><Switch checkedChildren="启用" unCheckedChildren="停用" /></Form.Item></Col></Row>
        </Form>
      </Drawer>}

      {showQuestions && <Modal title="停用诊断题" open={Boolean(disableTarget)} okText="确认停用" okButtonProps={{danger: true, loading: submitting}} onOk={() => void disable()} onCancel={() => {setDisableTarget(null); disableForm.resetFields();}}>
        <Alert type="warning" showIcon message="停用后，新用户将不再看到这道题" description="已经提交的诊断结果会继续保留当时的题目和选项快照。" style={{marginBottom: 18}} />
        <Typography.Paragraph strong>{disableTarget?.stem}</Typography.Paragraph>
        <Form form={disableForm} layout="vertical"><Form.Item name="reason" label="停用原因" rules={[{required: true, message: '请填写停用原因'}, {min: 2, max: 300}]}><Input.TextArea rows={3} maxLength={300} showCount placeholder="例如：题目口径调整，暂时停止采集" /></Form.Item></Form>
      </Modal>}
      {showForm && <Modal title="停用诊断表单" open={disableFormOpen} okText="确认停用" okButtonProps={{danger: true}} onOk={async () => {try {await disableLearningDiagnosticForm('学习中心管理员手动停用'); message.success('诊断表单已停用'); setDisableFormOpen(false); await loadConfiguration();} catch (error) {message.error(error instanceof Error ? error.message : '停用失败');}}} onCancel={() => setDisableFormOpen(false)}><Alert type="warning" showIcon message="停用后，未完成诊断的新用户将暂时无法开始" /></Modal>}
    </Space>
  );
}
