import {Button, Drawer, Form, Input, Modal, Select, Space, Table, Tabs, Tag, Typography, message} from 'antd';
import {PlusOutlined, ReloadOutlined, SendOutlined} from '@ant-design/icons';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createAdminQuestion,
  getAdminQuestionVersions,
  getAdminQuestions,
  getAdminSubjects,
  getAdminSubjectiveQuestions,
  publishAdminQuestion,
  updateAdminQuestion,
  type AdminQuestion,
  type AdminSubject,
  type AdminSubjectiveQuestion,
  type ObjectiveQuestionType,
} from '@/services/api';

type FormValues = {
  stem: string;
  optionsText: string;
  answerIndexesText: string;
  questionType: ObjectiveQuestionType;
  analysis: string;
  subjectId: string;
  chapterId: string;
  pointId: string;
};

const statusLabels: Record<string, string> = {published: '已发布', draft: '草稿'};
const questionTypeLabels: Record<ObjectiveQuestionType, string> = {
  true_false: '判断题',
  single: '单选题',
  multiple: '多选题',
  indeterminate: '不定项选择题',
};
const questionTypeOptions = Object.entries(questionTypeLabels).map(([value, label]) => ({value, label}));

function answerIndexesText(question: AdminQuestion) {
  const indexes = question.answerIndexes?.length ? question.answerIndexes : [question.answer];
  return indexes.map(index => String.fromCharCode(65 + index)).join(',');
}

function parseAnswerIndexes(value: string, optionCount: number) {
  const indexes = value
    .split(/[,，、;；/|\s]+/)
    .filter(Boolean)
    .map(token => token.trim().toUpperCase())
    .map(token => (/^[A-H]$/.test(token) ? token.charCodeAt(0) - 65 : -1));
  const unique = [...new Set(indexes)].sort((a, b) => a - b);
  if (!unique.length || unique.some(index => index < 0 || index >= optionCount)) {
    throw new Error('正确答案必须对应已填写的选项，例如 A 或 A,C');
  }
  return unique;
}

export default function Questions() {
  const [items, setItems] = useState<AdminQuestion[]>([]);
  const [subjectiveItems, setSubjectiveItems] = useState<AdminSubjectiveQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [subjectiveTotal, setSubjectiveTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminQuestion>();
  const [history, setHistory] = useState<AdminQuestion[]>();
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [keyword, setKeyword] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>();
  const [chapterFilter, setChapterFilter] = useState<string>();
  const [pointFilter, setPointFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>();
  const [questionTypeFilter, setQuestionTypeFilter] = useState<ObjectiveQuestionType>();
  const [activeType, setActiveType] = useState<'objective' | 'subjective'>('objective');
  const [form] = Form.useForm<FormValues>();

  const selectedFilterSubject = subjects.find(subject => subject.id === subjectFilter);
  const filterChapters = useMemo(
    () => (selectedFilterSubject?.chapters ?? []).filter(chapter => chapter.questionType === activeType || chapter.questionType === 'both'),
    [activeType, selectedFilterSubject],
  );
  const filterPoints = filterChapters.find(chapter => chapter.id === chapterFilter)?.points ?? [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [objective, subjective] = await Promise.all([
        getAdminQuestions({keyword: keyword.trim() || undefined, subjectId: subjectFilter, chapterId: chapterFilter, pointId: pointFilter, status: statusFilter, questionType: questionTypeFilter}),
        getAdminSubjectiveQuestions({keyword: keyword.trim() || undefined, subjectId: subjectFilter, chapterId: chapterFilter, pointId: pointFilter, status: statusFilter}),
      ]);
      setItems(objective.items);
      setTotal(objective.total);
      setSubjectiveItems(subjective.items);
      setSubjectiveTotal(subjective.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载题目失败');
    } finally {
      setLoading(false);
    }
  }, [chapterFilter, keyword, pointFilter, questionTypeFilter, statusFilter, subjectFilter]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    getAdminSubjects().then(setSubjects).catch(error => message.error(error instanceof Error ? error.message : '加载科目失败'));
  }, []);

  const openCreate = () => {
    setEditing(undefined);
    form.resetFields();
    form.setFieldsValue({questionType: 'single', answerIndexesText: 'A'});
    setOpen(true);
  };

  const submit = async (values: FormValues) => {
    const options = values.questionType === 'true_false'
      ? ['正确', '错误']
      : values.optionsText.split('\n').map(item => item.trim()).filter(Boolean);
    try {
      const answerIndexes = parseAnswerIndexes(values.answerIndexesText, options.length);
      if (values.questionType === 'single' && answerIndexes.length !== 1) throw new Error('单选题只能设置一个正确答案');
      if (values.questionType === 'true_false' && answerIndexes.length !== 1) throw new Error('判断题只能设置一个正确答案');
      if (values.questionType === 'multiple' && answerIndexes.length < 2) throw new Error('多选题至少设置两个正确答案');
      const input = {
        stem: values.stem,
        options,
        answer: answerIndexes[0],
        answerIndexes,
        questionType: values.questionType,
        analysis: values.analysis,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        pointId: values.pointId,
      };
      if (editing) {
        await updateAdminQuestion(editing.id, input);
        message.success('题目已更新');
      } else {
        await createAdminQuestion(input);
        message.success('题目草稿已创建');
      }
      setOpen(false);
      setEditing(undefined);
      form.resetFields();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存题目失败');
    }
  };

  const edit = (record: AdminQuestion) => {
    setEditing(record);
    form.setFieldsValue({
      stem: record.stem,
      optionsText: record.options.join('\n'),
      answerIndexesText: answerIndexesText(record),
      questionType: record.questionType ?? (record.answerIndexes && record.answerIndexes.length > 1 ? 'multiple' : 'single'),
      analysis: record.analysis,
      subjectId: record.subjectId ?? '',
      chapterId: record.chapterId ?? '',
      pointId: record.pointId ?? '',
    });
    setOpen(true);
  };

  const showHistory = async (record: AdminQuestion) => {
    try {
      const result = await getAdminQuestionVersions(record.id);
      setHistory(result.items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载版本历史失败');
    }
  };

  const publish = async (record: AdminQuestion) => {
    try {
      await publishAdminQuestion(record.id);
      message.success('题目已发布');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布题目失败');
    }
  };

  const subjectName = (id?: string) => subjects.find(subject => subject.id === id)?.name ?? id ?? '-';
  const chapterName = (subjectId?: string, chapterId?: string) => subjects.find(subject => subject.id === subjectId)?.chapters?.find(chapter => chapter.id === chapterId)?.name ?? chapterId ?? '-';
  const pointName = (subjectId?: string, chapterId?: string, pointId?: string) => subjects.find(subject => subject.id === subjectId)?.chapters?.find(chapter => chapter.id === chapterId)?.points?.find(point => point.id === pointId)?.name ?? pointId ?? '-';
  const objectiveColumns = [
    {title: '序号', key: 'index', width: 70, render: (_: unknown, __: AdminQuestion, index: number) => index + 1},
    {title: '题干', dataIndex: 'stem', ellipsis: true},
    {title: '科目', dataIndex: 'subjectId', render: (value: string) => subjectName(value)},
    {title: '章节', dataIndex: 'chapterId', render: (value: string, record: AdminQuestion) => chapterName(record.subjectId, value)},
    {title: '考点', dataIndex: 'pointId', render: (value: string, record: AdminQuestion) => pointName(record.subjectId, record.chapterId, value)},
    {title: '题型', dataIndex: 'questionType', render: (value: ObjectiveQuestionType | undefined, record: AdminQuestion) => questionTypeLabels[value ?? (record.answerIndexes && record.answerIndexes.length > 1 ? 'multiple' : 'single')]},
    {title: '版本', dataIndex: 'version', render: (value: number) => `v${value ?? 1}`},
    {title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? '草稿'}</Tag>},
    {title: '更新时间', dataIndex: 'updatedAt'},
    {title: '操作', render: (_: unknown, record: AdminQuestion) => <Space size={0}><Button type="link" onClick={() => edit(record)}>编辑</Button><Button type="link" onClick={() => void showHistory(record)}>版本历史</Button>{record.status !== 'published' && <Button type="link" icon={<SendOutlined />} onClick={() => void publish(record)}>发布</Button>}</Space>},
  ];
  const subjectiveColumns = [
    {title: '序号', key: 'index', width: 70, render: (_: unknown, __: AdminSubjectiveQuestion, index: number) => index + 1},
    {title: '题目标题', dataIndex: 'title', ellipsis: true},
    {title: '关联题目', dataIndex: 'questionId'},
    {title: '科目', dataIndex: 'subjectId', render: (value: string) => subjectName(value)},
    {title: '章节', dataIndex: 'chapterId', render: (value: string, record: AdminSubjectiveQuestion) => chapterName(record.subjectId, value)},
    {title: '考点', dataIndex: 'pointId', render: (value: string, record: AdminSubjectiveQuestion) => pointName(record.subjectId, record.chapterId, value)},
    {title: '总分', dataIndex: 'totalScore', render: (value: number) => `${value} 分`},
    {title: '建议用时', dataIndex: 'suggestedMinutes', render: (value: number) => `${value} 分钟`},
    {title: '版本', dataIndex: 'version', render: (value: number) => `v${value ?? 1}`},
    {title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === 'published' ? 'green' : 'gold'}>{statusLabels[String(value)] ?? value}</Tag>},
    {title: '更新时间', dataIndex: 'updatedAt'},
  ];

  return <Space direction="vertical" size={18} style={{display: 'flex'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
      <div><Typography.Title level={4} style={{margin: 0}}>题库管理</Typography.Title><Typography.Text type="secondary">按科目、章节、考点管理题目，客观题支持四种题型</Typography.Text></div>
      <Space wrap>
        <Input allowClear value={keyword} onChange={event => setKeyword(event.target.value)} onPressEnter={() => void load()} placeholder="搜索题干、标题或题目 ID" style={{width: 230}} />
        <Select allowClear placeholder="全部科目" value={subjectFilter} onChange={value => {setSubjectFilter(value || undefined); setChapterFilter(undefined); setPointFilter(undefined);}} options={subjects.map(subject => ({value: subject.id, label: subject.name}))} style={{minWidth: 130}} />
        <Select allowClear disabled={!subjectFilter} placeholder="全部章节" value={chapterFilter} onChange={value => {setChapterFilter(value || undefined); setPointFilter(undefined);}} options={filterChapters.map(chapter => ({value: chapter.id, label: chapter.name}))} style={{minWidth: 140}} />
        <Select allowClear disabled={!chapterFilter} placeholder="全部考点" value={pointFilter} onChange={value => setPointFilter(value || undefined)} options={filterPoints.map(point => ({value: point.id, label: point.name}))} style={{minWidth: 140}} />
        <Select allowClear placeholder="全部状态" value={statusFilter} onChange={value => setStatusFilter(value || undefined)} options={[{value: 'published', label: '已发布'}, {value: 'draft', label: '草稿'}, {value: 'review', label: '审核中'}, {value: 'disabled', label: '已停用'}]} style={{minWidth: 120}} />
        {activeType === 'objective' && <Select allowClear placeholder="全部题型" value={questionTypeFilter} onChange={value => setQuestionTypeFilter(value || undefined)} options={questionTypeOptions} style={{minWidth: 150}} />}
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
        {activeType === 'objective' && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建客观题</Button>}
      </Space>
    </div>
    <Tabs activeKey={activeType} onChange={key => {setActiveType(key as 'objective' | 'subjective'); setChapterFilter(undefined); setPointFilter(undefined);}} items={[
      {key: 'objective', label: `客观题（${total}）`, children: <Table rowKey="id" loading={loading} dataSource={items} locale={{emptyText: '暂无符合条件的客观题'}} columns={objectiveColumns} pagination={{pageSize: 20, total, showTotal: value => `共 ${value} 道`}} scroll={{x: 1120}} />},
      {key: 'subjective', label: `主观题（${subjectiveTotal}）`, children: <Table rowKey="id" loading={loading} dataSource={subjectiveItems} locale={{emptyText: '暂无符合条件的主观题'}} columns={subjectiveColumns} pagination={{pageSize: 20, total: subjectiveTotal, showTotal: value => `共 ${value} 道`}} scroll={{x: 1100}} />},
    ]}/>
    <Drawer title={editing ? '编辑客观题' : '新建客观题'} open={open} onClose={() => setOpen(false)} width={540} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="questionType" label="题型" rules={[{required: true, message: '请选择题型'}]}>
          <Select options={questionTypeOptions} onChange={(value: ObjectiveQuestionType) => {
            if (value === 'true_false') form.setFieldsValue({optionsText: '正确\n错误', answerIndexesText: 'A'});
          }} />
        </Form.Item>
        <Form.Item name="stem" label="题干" rules={[{required: true, min: 5, message: '请输入至少 5 个字的题干'}]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item noStyle shouldUpdate={(previous, current) => previous.questionType !== current.questionType}>
          {() => <Form.Item name="optionsText" label="选项（每行一项）" extra={form.getFieldValue('questionType') === 'true_false' ? '判断题固定为“正确、错误”两个选项' : '按 A、B、C、D 的顺序逐行填写'} rules={[{required: true, message: '请填写选项'}]}><Input.TextArea rows={5} disabled={form.getFieldValue('questionType') === 'true_false'} /></Form.Item>}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(previous, current) => previous.questionType !== current.questionType}>
          {() => <Form.Item name="answerIndexesText" label="正确答案" extra={['multiple', 'indeterminate'].includes(form.getFieldValue('questionType')) ? '多个答案用英文逗号分隔，例如 A,C' : '填写一个选项字母，例如 A'} rules={[{required: true, message: '请填写正确答案'}]}><Input placeholder={['multiple', 'indeterminate'].includes(form.getFieldValue('questionType')) ? '例如 A,C' : '例如 A'} /></Form.Item>}
        </Form.Item>
        <Form.Item name="analysis" label="题目解析" rules={[{required: true, message: '请输入题目解析'}]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="subjectId" label="科目" rules={[{required: true, message: '请选择科目'}]}><Select placeholder="选择科目" options={subjects.map(subject => ({value: subject.id, label: subject.name}))} onChange={() => form.setFieldsValue({chapterId: '', pointId: ''})} /></Form.Item>
        <Form.Item noStyle shouldUpdate={(previous, current) => previous.subjectId !== current.subjectId}>
          {() => <Form.Item name="chapterId" label="章节" rules={[{required: true, message: '请选择章节'}]}><Select placeholder="选择客观题章节" options={(subjects.find(subject => subject.id === form.getFieldValue('subjectId'))?.chapters ?? []).filter(chapter => chapter.questionType === 'objective' || chapter.questionType === 'both').map(chapter => ({value: chapter.id, label: chapter.name}))} onChange={() => form.setFieldValue('pointId', '')} /></Form.Item>}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(previous, current) => previous.chapterId !== current.chapterId || previous.subjectId !== current.subjectId}>
          {() => <Form.Item name="pointId" label="考点" rules={[{required: true, message: '请选择考点'}]}><Select placeholder="选择考点" options={(subjects.find(subject => subject.id === form.getFieldValue('subjectId'))?.chapters?.find(chapter => chapter.id === form.getFieldValue('chapterId'))?.points ?? []).map(point => ({value: point.id, label: point.name}))} /></Form.Item>}
        </Form.Item>
        <Button type="primary" htmlType="submit" block>保存草稿</Button>
      </Form>
    </Drawer>
    <Modal title="题目版本历史" open={Boolean(history)} onCancel={() => setHistory(undefined)} footer={null} width={700}>
      <Table size="small" rowKey={record => `${record.id ?? 'current'}-${record.version}`} dataSource={history} pagination={false} locale={{emptyText: '暂无版本记录'}} columns={[{title: '版本', dataIndex: 'version', render: value => `v${value}`}, {title: '状态', dataIndex: 'status', render: value => statusLabels[String(value)] ?? String(value ?? '-')}, {title: '更新时间', dataIndex: 'updatedAt'}, {title: '题干', dataIndex: 'stem', ellipsis: true}]} />
    </Modal>
  </Space>;
}
