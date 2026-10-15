import {DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SendOutlined} from '@ant-design/icons';
import {Button, Drawer, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, Tabs, Tag, Typography, message, type TableProps} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createAdminPaper,
  getAdminPapers,
  getAdminQuestions,
  getAdminProducts,
  getAdminSubjects,
  getAdminSubjectiveQuestions,
  publishAdminPaper,
  updateAdminPaper,
  type AdminPaper,
  type AdminQuestion,
  type AdminSubject,
  type AdminSubjectiveQuestion,
} from '@/services/api';

type PaperType = 'objective' | 'subjective';
type Values = {
  name: string;
  year: string;
  subjectId?: string;
  volume?: string;
  mode?: string;
  durationMinutes?: number;
  totalScore: number;
  productId?: string;
};
type PoolQuestion = (AdminQuestion & {kind: 'objective'}) | (AdminSubjectiveQuestion & {kind: 'subjective'});

const typeLabels: Record<PaperType, string> = {objective: '客观题', subjective: '主观题'};
const statusLabels: Record<string, string> = {published: '已发布', draft: '草稿', review: '审核中', disabled: '已停用', archived: '已归档'};
const modeLabels: Record<string, string> = {real: '真题', mock: '模拟', chapter: '章节练习', marketing: '营销考试', advanced: '进阶考试（付费）'};

function questionKey(question: PoolQuestion) {
  return question.kind === 'subjective' ? question.questionId : question.id;
}

export default function Papers() {
  const [items, setItems] = useState<AdminPaper[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [products, setProducts] = useState<Array<{id: string; name: string; status?: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<PaperType>('objective');
  const [paperType, setPaperType] = useState<PaperType>('objective');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPaper>();
  const [pool, setPool] = useState<PoolQuestion[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerItems, setPickerItems] = useState<PoolQuestion[]>([]);
  const [pickerKeyword, setPickerKeyword] = useState('');
  const [pickerSubject, setPickerSubject] = useState<string>();
  const [pickerStatus, setPickerStatus] = useState<string>();
  const [form] = Form.useForm<Values>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await getAdminPapers()).items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载试卷失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    getAdminSubjects().then(setSubjects).catch(error => message.error(error instanceof Error ? error.message : '加载科目失败'));
    getAdminProducts().then(result => setProducts(result.items.filter(item => item.status === 'on_sale' || !item.status))).catch(error => message.error(error instanceof Error ? error.message : '加载商品失败'));
  }, [load]);

  const subjectName = (id?: string) => subjects.find(subject => subject.id === id)?.name ?? id ?? '-';
  const objectivePapers = items.filter(item => item.questionKind === 'objective');
  const subjectivePapers = items.filter(item => item.questionKind === 'subjective');

  const closeEditor = () => {
    setOpen(false);
    setEditing(undefined);
    setPool([]);
    setPickerOpen(false);
    form.resetFields();
  };

  const openCreate = (kind: PaperType) => {
    setEditing(undefined);
    setPaperType(kind);
    setPool([]);
    setPickerKeyword('');
    setPickerSubject(undefined);
    setPickerStatus(undefined);
    form.resetFields();
    form.setFieldsValue({
      year: String(new Date().getFullYear()),
      mode: 'real',
      volume: kind === 'objective' ? '客观题卷' : '主观题卷',
      durationMinutes: 180,
    });
    setOpen(true);
  };

  const openEdit = (record: AdminPaper) => {
    setEditing(record);
    setPaperType(record.questionKind);
    setPickerKeyword('');
    setPickerSubject(record.subjectId);
    setPickerStatus(undefined);
    setPool(record.questionIds.map(id => record.questionKind === 'subjective'
      ? ({id, questionId: id, kind: 'subjective', title: id, subjectId: record.subjectId ?? '', caseMaterial: '', totalScore: 0, suggestedMinutes: 0, status: 'draft'} as PoolQuestion)
      : ({id, kind: 'objective', stem: id, options: [], answer: 0, analysis: ''} as PoolQuestion)));
    form.setFieldsValue({
      name: record.name,
      year: record.year,
      subjectId: record.subjectId,
      volume: record.volume,
      mode: record.mode,
      durationMinutes: record.durationMinutes,
      totalScore: record.totalScore,
      productId: record.productId,
    });
    setOpen(true);
  };

  const submit = async (values: Values) => {
    if (!pool.length) {
      message.warning(`请先从${typeLabels[paperType]}题库选择题目`);
      return;
    }
    const input = {
      name: values.name,
      year: values.year,
      questionKind: paperType,
      subjectId: paperType === 'subjective' ? values.subjectId : undefined,
      volume: paperType === 'objective' ? values.volume ?? '客观题卷' : '主观题卷',
      mode: paperType === 'objective' ? values.mode ?? 'real' : 'real',
      durationMinutes: paperType === 'objective'
        ? values.durationMinutes ?? 180
        : pool.reduce((sum, item) => sum + (item.kind === 'subjective' ? item.suggestedMinutes : 0), 0),
      totalScore: values.totalScore,
      productId: paperType === 'objective' && values.mode === 'advanced' ? values.productId : undefined,
      questionIds: pool.map(questionKey),
    };
    try {
      if (editing) await updateAdminPaper(editing.id, {...input, updatedAt: editing.updatedAt});
      else await createAdminPaper(input);
      message.success(`${typeLabels[paperType]}试卷草稿已保存`);
      closeEditor();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存试卷失败');
    }
  };

  const loadPicker = useCallback(async () => {
    setPickerLoading(true);
    try {
      if (paperType === 'objective') {
        const result = await getAdminQuestions({keyword: pickerKeyword.trim() || undefined, subjectId: pickerSubject, status: pickerStatus, pageSize: 100});
        setPickerItems(result.items.map(item => ({...item, kind: 'objective' as const})));
      } else {
        const subjectId = form.getFieldValue('subjectId');
        const result = await getAdminSubjectiveQuestions({keyword: pickerKeyword.trim() || undefined, subjectId, status: pickerStatus});
        setPickerItems(result.items.map(item => ({...item, kind: 'subjective' as const})));
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载题库失败');
    } finally {
      setPickerLoading(false);
    }
  }, [form, paperType, pickerKeyword, pickerStatus, pickerSubject]);

  useEffect(() => {
    if (pickerOpen) void loadPicker();
  }, [loadPicker, pickerOpen]);

  const showPicker = async () => {
    if (paperType === 'subjective') {
      try {
        await form.validateFields(['subjectId']);
      } catch {
        message.warning('请先选择主观题试卷所属科目');
        return;
      }
    }
    setPickerItems([]);
    setPickerOpen(true);
  };

  const pickerRowSelection = useMemo(() => ({
    selectedRowKeys: pool.map(questionKey),
    onChange: (keys: React.Key[]) => {
      const selected = new Set(keys.map(String));
      const visible = new Set(pickerItems.map(questionKey));
      setPool(current => [
        ...current.filter(item => !visible.has(questionKey(item))),
        ...pickerItems.filter(item => selected.has(questionKey(item))),
      ]);
    },
  }), [pickerItems, pool]);

  const publish = async (record: AdminPaper) => {
    try {
      await publishAdminPaper(record.id);
      message.success(`${typeLabels[record.questionKind]}试卷已发布`);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    }
  };

  const actionColumn = {
    title: '操作',
    width: 150,
    fixed: 'right' as const,
    render: (_: unknown, record: AdminPaper) => <Space size={0}>
      <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
      {record.status !== 'published' && <Button type="link" icon={<SendOutlined />} onClick={() => void publish(record)}>发布</Button>}
    </Space>,
  };

  const objectiveColumns: TableProps<AdminPaper>['columns'] = [
    {title: '序号', width: 70, render: (_value, _record, index) => index + 1},
    {title: '试卷名称', dataIndex: 'name', ellipsis: true},
    {title: '年份', dataIndex: 'year', width: 90},
    {title: '卷别', dataIndex: 'volume', width: 120},
    {title: '模式', dataIndex: 'mode', width: 110, render: value => modeLabels[String(value)] ?? value},
    {title: '题数', dataIndex: 'questionCount', width: 80},
    {title: '时长', dataIndex: 'durationMinutes', width: 100, render: value => `${value} 分钟`},
    {title: '总分', dataIndex: 'totalScore', width: 80},
    {title: '状态', dataIndex: 'status', width: 100, render: value => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? '草稿'}</Tag>},
    actionColumn,
  ];

  const subjectiveColumns: TableProps<AdminPaper>['columns'] = [
    {title: '序号', width: 70, render: (_value, _record, index) => index + 1},
    {title: '试卷名称', dataIndex: 'name', ellipsis: true},
    {title: '年份', dataIndex: 'year', width: 90},
    {title: '科目', dataIndex: 'subjectId', width: 140, render: value => subjectName(String(value))},
    {title: '题数', dataIndex: 'questionCount', width: 80},
    {title: '建议时长', dataIndex: 'durationMinutes', width: 110, render: value => `${value} 分钟`},
    {title: '总分', dataIndex: 'totalScore', width: 80},
    {title: '状态', dataIndex: 'status', width: 100, render: value => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? '草稿'}</Tag>},
    actionColumn,
  ];

  const poolColumns: TableProps<PoolQuestion>['columns'] = [
    {title: '序号', width: 65, render: (_value, _record, index) => index + 1},
    {title: '题目', render: (_value, record) => <Space direction="vertical" size={0}>
      <Typography.Text strong>{record.kind === 'subjective' ? record.title : record.stem}</Typography.Text>
      <Typography.Text type="secondary">{questionKey(record)}</Typography.Text>
    </Space>},
    {title: '科目', width: 120, render: (_value, record) => subjectName(record.subjectId)},
    {title: '操作', width: 70, render: (_value, record) => <Button danger type="text" icon={<DeleteOutlined />} aria-label="移出组卷区" onClick={() => setPool(current => current.filter(item => questionKey(item) !== questionKey(record)))} />},
  ];

  const objectivePickerColumns: TableProps<AdminQuestion>['columns'] = [
    {title: '序号', width: 65, render: (_value, _record, index) => index + 1},
    {title: '题干', dataIndex: 'stem', ellipsis: true},
    {title: '科目', dataIndex: 'subjectId', width: 120, render: value => subjectName(String(value))},
    {title: '题型', width: 110, render: (_value, record) => ({true_false: '判断题', single: '单选题', multiple: '多选题', indeterminate: '不定项选择题'}[record.questionType ?? 'single'])},
    {title: '状态', dataIndex: 'status', width: 100, render: value => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? value}</Tag>},
  ];

  const subjectivePickerColumns: TableProps<AdminSubjectiveQuestion>['columns'] = [
    {title: '序号', width: 65, render: (_value, _record, index) => index + 1},
    {title: '题目标题', dataIndex: 'title', ellipsis: true},
    {title: '科目', dataIndex: 'subjectId', width: 120, render: value => subjectName(String(value))},
    {title: '总分', dataIndex: 'totalScore', width: 90, render: value => `${value} 分`},
    {title: '建议时长', dataIndex: 'suggestedMinutes', width: 110, render: value => `${value} 分钟`},
    {title: '状态', dataIndex: 'status', width: 100, render: value => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? value}</Tag>},
  ];

  const paperTable = (kind: PaperType) => <Table<AdminPaper>
    rowKey="id"
    loading={loading}
    dataSource={kind === 'objective' ? objectivePapers : subjectivePapers}
    columns={kind === 'objective' ? objectiveColumns : subjectiveColumns}
    locale={{emptyText: `暂无${typeLabels[kind]}试卷`}}
    scroll={{x: kind === 'objective' ? 1080 : 900}}
    pagination={{pageSize: 20}}
  />;

  return <Space direction="vertical" size={18} style={{display: 'flex'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
      <div>
        <Typography.Title level={4} style={{margin: 0}}>试卷管理</Typography.Title>
        <Typography.Text type="secondary">客观题试卷用于在线答题，主观题试卷用于提交答案和批改。</Typography.Text>
      </div>
      <Space>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(activeType)}>新建{typeLabels[activeType]}试卷</Button>
      </Space>
    </div>

    <Tabs
      activeKey={activeType}
      onChange={key => setActiveType(key as PaperType)}
      items={[
        {key: 'objective', label: `客观题试卷（${objectivePapers.length}）`, children: paperTable('objective')},
        {key: 'subjective', label: `主观题试卷（${subjectivePapers.length}）`, children: paperTable('subjective')},
      ]}
    />

    <Drawer title={`${editing ? '编辑' : '新建'}${typeLabels[paperType]}试卷`} open={open} onClose={closeEditor} width="min(780px, 100vw)" destroyOnClose>
      <Form form={form} layout="vertical" onFinish={submit}>
        <Space size={16} style={{display: 'flex'}} align="start">
          <Form.Item name="name" label="试卷名称" rules={[{required: true, min: 3, message: '请输入至少 3 个字的试卷名称'}]} style={{flex: 2}}>
            <Input placeholder={`例如：2026 民法${typeLabels[paperType]}模拟卷（一）`} />
          </Form.Item>
          <Form.Item name="year" label="考试年份" rules={[{required: true, pattern: /^20\d{2}$/, message: '请输入 4 位考试年份'}]} style={{flex: 1}}>
            <Input placeholder="2026" />
          </Form.Item>
        </Space>

        {paperType === 'subjective' ? <Form.Item name="subjectId" label="所属科目" rules={[{required: true, message: '请选择主观题试卷所属科目'}]}>
          <Select
            disabled={pool.length > 0}
            placeholder="选择科目后再从对应主观题库选题"
            options={subjects.filter(subject => subject.questionType !== 'objective').map(subject => ({value: subject.id, label: subject.name}))}
            onChange={value => setPickerSubject(value)}
          />
        </Form.Item> : <Space size={16} style={{display: 'flex'}} align="start">
          <Form.Item name="volume" label="卷别" rules={[{required: true, message: '请输入卷别'}]} style={{flex: 1}}>
            <Input placeholder="客观题卷一" />
          </Form.Item>
          <Form.Item name="mode" label="模式" rules={[{required: true, message: '请选择试卷模式'}]} style={{flex: 1}}>
            <Select options={[{value: 'real', label: '真题'}, {value: 'mock', label: '模拟'}, {value: 'chapter', label: '章节练习'}, {value: 'marketing', label: '营销考试'}, {value: 'advanced', label: '进阶考试（付费）'}]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.mode !== next.mode}>
            {({getFieldValue}) => getFieldValue('mode') === 'advanced' ? <Form.Item name="productId" label="绑定付费商品" rules={[{required: true, message: '进阶考试必须绑定商品'}]} style={{flex: 1}}>
              <Select placeholder="选择已上架商品" options={products.map(product => ({value: product.id, label: product.name}))} />
            </Form.Item> : null}
          </Form.Item>
          <Form.Item name="durationMinutes" label="答题时长（分钟）" rules={[{required: true, message: '请输入答题时长'}]} style={{flex: 1}}>
            <InputNumber min={1} max={600} style={{width: '100%'}} />
          </Form.Item>
        </Space>}

        <Form.Item name="totalScore" label="试卷总分" rules={[{required: true, message: '请输入试卷总分'}]}>
          <InputNumber min={1} max={1000} style={{width: '100%'}} />
        </Form.Item>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <Space>
            <Typography.Title level={5} style={{margin: 0}}>组卷题目</Typography.Title>
            <Tag color={paperType === 'objective' ? 'blue' : 'purple'}>{typeLabels[paperType]}</Tag>
            <Typography.Text type="secondary">已选 {pool.length} 题</Typography.Text>
          </Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => void showPicker()}>从{typeLabels[paperType]}题库选题</Button>
        </div>
        <Table<PoolQuestion>
          size="small"
          rowKey={questionKey}
          dataSource={pool}
          columns={poolColumns}
          pagination={false}
          locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`暂无题目，请从${typeLabels[paperType]}题库选择`} />}}
          scroll={{x: 620}}
          style={{marginBottom: 24}}
        />
        <Button type="primary" htmlType="submit" block>保存草稿</Button>
      </Form>
    </Drawer>

    <Modal title={`${typeLabels[paperType]}题库选题`} open={pickerOpen} width={1000} onCancel={() => setPickerOpen(false)} onOk={() => setPickerOpen(false)} okText="完成选题">
      <Space wrap style={{marginBottom: 12}}>
        <Input
          allowClear
          value={pickerKeyword}
          onChange={event => setPickerKeyword(event.target.value)}
          onPressEnter={() => void loadPicker()}
          placeholder="搜索题干、标题或题目 ID"
          prefix={<SearchOutlined />}
          style={{width: 260}}
        />
        {paperType === 'objective' ? <Select
          allowClear
          placeholder="全部科目"
          value={pickerSubject}
          onChange={setPickerSubject}
          options={subjects.filter(subject => subject.questionType !== 'subjective').map(subject => ({value: subject.id, label: subject.name}))}
          style={{width: 140}}
        /> : <Tag color="purple">{subjectName(form.getFieldValue('subjectId'))}</Tag>}
        <Select
          allowClear
          placeholder="全部状态"
          value={pickerStatus}
          onChange={setPickerStatus}
          options={[{value: 'published', label: '已发布'}, {value: 'draft', label: '草稿'}, {value: 'review', label: '审核中'}, {value: 'disabled', label: '已停用'}]}
          style={{width: 130}}
        />
        <Button icon={<ReloadOutlined />} onClick={() => void loadPicker()}>筛选</Button>
      </Space>
      {paperType === 'objective'
        ? <Table<AdminQuestion> size="small" rowKey="id" loading={pickerLoading} rowSelection={pickerRowSelection} dataSource={pickerItems as AdminQuestion[]} columns={objectivePickerColumns} pagination={{pageSize: 10}} scroll={{x: 780}} />
        : <Table<AdminSubjectiveQuestion> size="small" rowKey="questionId" loading={pickerLoading} rowSelection={pickerRowSelection} dataSource={pickerItems as AdminSubjectiveQuestion[]} columns={subjectivePickerColumns} pagination={{pageSize: 10}} scroll={{x: 800}} />}
    </Modal>
  </Space>;
}
