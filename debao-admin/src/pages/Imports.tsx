import {
  CheckOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Segmented,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  confirmAdminImport,
  createAdminImport,
  getAdminImports,
  type AdminImportJob,
} from '@/services/api';
import {
  autoMapQuestionImportFields,
  downloadQuestionImportTemplate,
  getQuestionImportFields,
  mapQuestionImportRows,
  parseQuestionImportFile,
  type ParsedQuestionFile,
  type QuestionImportFormat,
  type QuestionImportKind,
  type QuestionImportMapping,
} from '@/utils/questionImport';
import './Imports.css';

type Values = {questionKind: QuestionImportKind};

const statusLabels: Record<string, string> = {preflight: '待确认', completed: '已完成'};
const kindLabels: Record<QuestionImportKind, string> = {objective: '客观题', subjective: '主观题'};

export default function Imports() {
  const [items, setItems] = useState<AdminImportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileData, setFileData] = useState<ParsedQuestionFile>();
  const [mapping, setMapping] = useState<QuestionImportMapping>({});
  const [parseError, setParseError] = useState<string>();
  const [preview, setPreview] = useState<AdminImportJob>();
  const [form] = Form.useForm<Values>();
  const questionKind = Form.useWatch('questionKind', form) ?? 'objective';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const imports = await getAdminImports();
      setItems(imports.items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载导入任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!fileData) return;
    setMapping(autoMapQuestionImportFields(fileData.headers, questionKind));
    setPreview(undefined);
  }, [fileData, questionKind]);

  const fields = getQuestionImportFields(questionKind);

  const mappedRows = useMemo(() => {
    if (!fileData) return [];
    try { return mapQuestionImportRows(fileData.rows, mapping, questionKind); }
    catch { return []; }
  }, [fileData, mapping, questionKind]);


  const resetDraft = () => {
    form.resetFields();
    setFileData(undefined);
    setMapping({});
    setParseError(undefined);
    setPreview(undefined);
  };

  const openCreate = () => {
    resetDraft();
    setOpen(true);
  };

  const selectKind = (kind: QuestionImportKind) => {
    form.setFieldsValue({questionKind: kind});
    setPreview(undefined);
  };

  const readFile = async (file: File) => {
    setParseError(undefined);
    setPreview(undefined);
    try {
      const parsed = await parseQuestionImportFile(file);
      setFileData(parsed);
      setMapping(autoMapQuestionImportFields(parsed.headers, questionKind));
      message.success(`已读取 ${parsed.rows.length} 条数据`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '文件读取失败';
      setFileData(undefined);
      setMapping({});
      setParseError(reason);
    }
  };

  const runPreflight = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (!fileData) throw new Error('请先选择要导入的文件');
      const records = mapQuestionImportRows(fileData.rows, mapping, values.questionKind);
      const job = await createAdminImport({...values, filename: fileData.filename, format: fileData.format, records});
      setPreview(job);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '预检失败');
    } finally {
      setSubmitting(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setSubmitting(true);
    try {
      await confirmAdminImport(preview.id);
      message.success(`${kindLabels[preview.questionKind]}已导入题库草稿`);
      setOpen(false);
      resetDraft();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '确认导入失败');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = async (format: QuestionImportFormat) => {
    try { await downloadQuestionImportTemplate(questionKind, format); }
    catch (error) { message.error(error instanceof Error ? error.message : '模板生成失败'); }
  };

  const mappingColumns = [
    {title: '题库字段', dataIndex: 'label', width: 150, render: (value: string, field: (typeof fields)[number]) => <Space size={6}>{value}{field.required && <Tag color="red">必填</Tag>}</Space>},
    {title: '文件列', key: 'source', width: 240, render: (_: unknown, field: (typeof fields)[number]) => <Select allowClear showSearch value={mapping[field.key]} placeholder="请选择对应列" options={fileData?.headers.map(header => ({value: header, label: header}))} onChange={value => {setMapping(current => ({...current, [field.key]: value})); setPreview(undefined);}} style={{width: '100%'}} />},
    {title: '填写要求', dataIndex: 'description', render: (value: string) => <Typography.Text type="secondary">{value}</Typography.Text>},
  ];

  const previewColumns = questionKind === 'objective' ? [
    {title: '序号', width: 65, render: (_: unknown, __: unknown, index: number) => index + 1},
    {title: '章节', dataIndex: 'chapter', ellipsis: true},
    {title: '考点', dataIndex: 'point', ellipsis: true},
    {title: '题干', dataIndex: 'stem', ellipsis: true},
    {title: '选项', dataIndex: 'options', render: (value: unknown) => Array.isArray(value) ? `${value.length} 个` : '-'},
    {title: '答案', dataIndex: 'answerIndexes', render: (value: unknown) => Array.isArray(value) ? value.map(index => String.fromCharCode(65 + Number(index))).join('、') : '-'},
    {title: '题型', dataIndex: 'questionType', render: (value: unknown) => ({true_false: '判断题', single: '单选题', multiple: '多选题', indeterminate: '不定项选择题'}[String(value)] ?? '-')},
  ] : [
    {title: '序号', width: 65, render: (_: unknown, __: unknown, index: number) => index + 1},
    {title: '章节', dataIndex: 'chapter', ellipsis: true},
    {title: '考点', dataIndex: 'point', ellipsis: true},
    {title: '标题', dataIndex: 'title', ellipsis: true},
    {title: '案情材料', dataIndex: 'caseMaterial', ellipsis: true},
    {title: '设问', dataIndex: 'subQuestion', ellipsis: true},
    {title: '总分', dataIndex: 'totalScore', render: (value: unknown) => `${String(value)} 分`},
  ];

  return <div className="question-import-page">
    <div className="question-import-header">
      <div>
        <Typography.Title level={4}>题库批量导入</Typography.Title>
        <Typography.Text type="secondary">批量上传客观题或主观题，完成字段映射和预检后写入题库草稿。</Typography.Text>
      </div>
      <Space wrap>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建批量导入</Button>
      </Space>
    </div>

    <Table<AdminImportJob>
      rowKey="id"
      loading={loading}
      dataSource={items}
      locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无题库导入任务" />}}
      scroll={{x: 1120}}
      columns={[
        {title: '文件', dataIndex: 'filename', ellipsis: true, width: 210},
        {title: '题目分类', dataIndex: 'questionKind', width: 105, render: value => <Tag color={value === 'subjective' ? 'purple' : 'blue'}>{kindLabels[value as QuestionImportKind] ?? String(value)}</Tag>},
        {title: '格式', dataIndex: 'format', width: 80, render: value => String(value).toUpperCase()},
        {title: '科目 / 章节 / 考点', key: 'taxonomy', width: 260, render: () => <Space direction="vertical" size={0}><Typography.Text>按文件逐题归类</Typography.Text><Typography.Text type="secondary">科目、章节和考点来自上传文件</Typography.Text></Space>},
        {title: '状态', dataIndex: 'status', width: 95, render: value => <Tag color={value === 'completed' ? 'green' : 'gold'}>{statusLabels[value] ?? value}</Tag>},
        {title: '可导入', dataIndex: 'successCount', width: 85},
        {title: '重复跳过', dataIndex: 'warningCount', width: 95},
        {title: '错误', dataIndex: 'errorCount', width: 75},
        {title: '创建时间', dataIndex: 'createdAt', width: 180, render: value => new Date(value).toLocaleString('zh-CN', {hour12: false})},
      ]}
      pagination={{pageSize: 20, showTotal: total => `共 ${total} 个任务`}}
    />

    <Drawer
      title="新建题库批量导入"
      open={open}
      onClose={() => {setOpen(false); resetDraft();}}
      width={820}
      destroyOnClose
      footer={<div className="question-import-footer"><Button onClick={() => {setOpen(false); resetDraft();}}>取消</Button>{preview && preview.errorCount === 0 ? <Button type="primary" icon={<CheckOutlined />} loading={submitting} onClick={() => void confirm()}>确认导入 {preview.successCount} 题</Button> : <Button type="primary" loading={submitting} disabled={!fileData} onClick={() => void runPreflight()}>执行导入预检</Button>}</div>}
    >
      <div className="question-import-drawer">
        <Steps size="small" current={preview ? 3 : fileData ? 2 : 0} items={[{title: '选择分类'}, {title: '上传文件'}, {title: '字段映射'}, {title: '预检确认'}]} />

        <section className="question-import-section">
          <div className="question-import-section-title"><Typography.Title level={5}>导入分类</Typography.Title><Typography.Text type="secondary">科目、章节和考点都从上传文件中逐题读取</Typography.Text></div>
          <Form form={form} layout="vertical" initialValues={{questionKind: 'objective'}}>
            <Form.Item name="questionKind" label="题目分类" rules={[{required: true}]}>
              <Segmented block options={[{label: '客观题', value: 'objective'}, {label: '主观题', value: 'subjective'}]} onChange={value => selectKind(value as QuestionImportKind)} />
            </Form.Item>
            <Alert type="info" showIcon message="科目、章节和考点随每道题从文件读取" description="模板已包含“科目”“章节”和“考点”列，可填写名称或 ID；同一文件可以导入不同分类。" />
          </Form>
        </section>

        <section className="question-import-section">
          <div className="question-import-section-title">
            <div><Typography.Title level={5}>上传题目文件</Typography.Title><Typography.Text type="secondary">支持 XLSX、CSV、JSON，单次最多 5000 题，文件不超过 10 MB</Typography.Text></div>
            <Dropdown menu={{items: [{key: 'xlsx', label: '下载 Excel 模板', icon: <FileExcelOutlined />}, {key: 'csv', label: '下载 CSV 模板', icon: <FileTextOutlined />}, {key: 'json', label: '下载 JSON 模板', icon: <FileTextOutlined />}], onClick: ({key}) => void downloadTemplate(key as QuestionImportFormat)}}>
              <Button icon={<DownloadOutlined />}>下载{kindLabels[questionKind]}模板</Button>
            </Dropdown>
          </div>
          <Upload.Dragger accept=".xlsx,.csv,.json" maxCount={1} showUploadList={false} beforeUpload={file => {void readFile(file); return Upload.LIST_IGNORE;}}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">选择文件或拖到这里</p>
            <p className="ant-upload-hint">上传后自动识别表头，不会直接写入题库</p>
          </Upload.Dragger>
          {fileData && <Alert className="question-import-file-alert" type="success" showIcon message={`${fileData.filename} · ${fileData.rows.length} 条数据 · ${fileData.headers.length} 个字段`} />}
          {parseError && <Alert className="question-import-file-alert" type="error" showIcon message="文件读取失败" description={parseError} />}
        </section>

        {fileData && <section className="question-import-section">
          <div className="question-import-section-title"><Typography.Title level={5}>字段映射</Typography.Title><Typography.Text type="secondary">系统已按字段名自动匹配，请确认必填项</Typography.Text></div>
          <Table rowKey="key" size="small" pagination={false} dataSource={fields} columns={mappingColumns} scroll={{x: 650}} />
        </section>}

        {fileData && <section className="question-import-section">
          <div className="question-import-section-title"><Typography.Title level={5}>数据预览</Typography.Title><Typography.Text type="secondary">显示前 5 条，服务端预检会校验全部 {fileData.rows.length} 条</Typography.Text></div>
          <Table rowKey={(_, index) => String(index)} size="small" pagination={false} dataSource={mappedRows.slice(0, 5)} columns={previewColumns} locale={{emptyText: '完成必填字段映射后显示预览'}} scroll={{x: 650}} />
        </section>}

        {preview && <Alert
          className="question-import-result"
          type={preview.errorCount ? 'warning' : 'success'}
          showIcon
          message={`预检完成：可导入 ${preview.successCount} 题，重复跳过 ${preview.warningCount} 题，错误 ${preview.errorCount} 题`}
          description={preview.errorCount ? <div className="question-import-errors">{preview.errors?.map(item => <Typography.Text key={`${item.row}-${item.message}`} type="danger">第 {item.row} 行：{item.message}</Typography.Text>)}</div> : '预检通过。确认后题目将以草稿状态进入对应题库，不会自动发布。'}
        />}
      </div>
    </Drawer>
  </div>;
}
