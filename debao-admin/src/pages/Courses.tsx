import {BookOutlined, InboxOutlined, PlusOutlined, ReloadOutlined, SendOutlined, UploadOutlined} from '@ant-design/icons';
import {Button, Collapse, Descriptions, Drawer, Empty, Form, Input, InputNumber, Segmented, Select, Space, Spin, Table, Tag, Typography, Upload, message} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {createAdminCourse, createAdminCourseLesson, createAdminCourseSection, getAdminCourseSections, getAdminCourses, publishAdminCourse, type AdminCourse, type AdminCourseSection} from '@/services/api';

type SectionValues = {title: string};
type LessonValues = {sectionId: string; title: string; mediaKind: 'video' | 'audio' | 'live' | 'document'; mediaReference?: string; durationSeconds?: number; trialEnabled?: boolean};

const mediaLabels: Record<LessonValues['mediaKind'], string> = {video: '视频', audio: '音频', live: '直播', document: '文档'};
const courseTypeLabels: Record<string, string> = {video: '视频课', audio: '音频课', live: '直播课', mixed: '混合课程'};

export default function Courses() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeType = location.pathname.endsWith('/audio') ? 'audio' : location.pathname.endsWith('/video') ? 'video' : 'all';
  const [items, setItems] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [structureLoading, setStructureLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse>();
  const [sections, setSections] = useState<AdminCourseSection[]>([]);
  const [form] = Form.useForm();
  const [sectionForm] = Form.useForm<SectionValues>();
  const [lessonForm] = Form.useForm<LessonValues>();
  const selectedLessonKind = Form.useWatch('mediaKind', lessonForm) ?? 'video';
  const [library, setLibrary] = useState<'all' | 'audio' | 'video' | 'live'>(routeType);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchSectionId, setBatchSectionId] = useState<string>();

  useEffect(() => { setLibrary(routeType); }, [routeType]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminCourses();
      setItems(result.items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载课程失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleItems = useMemo(() => items.filter(item => (library === 'all' || item.type === library) && (courseFilter === 'all' || item.id === courseFilter)), [items, library, courseFilter]);

  const submit = async (values: {title: string; teacher: string; type: 'video' | 'audio' | 'live' | 'mixed'; lessons: number}) => {
    try {
      await createAdminCourse(values);
      message.success('课程草稿已创建');
      setOpen(false);
      form.resetFields();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建课程失败');
    }
  };

  const refreshStructure = async (courseId: string) => {
    setStructureLoading(true);
    try {
      const nextSections = (await getAdminCourseSections(courseId)).items;
      setSections(nextSections);
      setBatchSectionId(current => current && nextSections.some(section => section.id === current) ? current : nextSections[0]?.id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载课程结构失败');
    } finally {
      setStructureLoading(false);
    }
  };

  const openStructure = (course: AdminCourse) => navigate(`/courses/${encodeURIComponent(course.id)}/edit`);

  const addSection = async (values: SectionValues) => {
    if (!selectedCourse) return;
    try {
      await createAdminCourseSection(selectedCourse.id, values);
      sectionForm.resetFields();
      await refreshStructure(selectedCourse.id);
      message.success('章节已创建');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建章节失败');
    }
  };

  const addLesson = async (values: LessonValues) => {
    if (!selectedCourse) return;
    try {
      await createAdminCourseLesson(selectedCourse.id, {...values, durationSeconds: values.mediaKind === 'live' ? 0 : values.durationSeconds ?? 0});
      lessonForm.resetFields(['title', 'mediaReference', 'durationSeconds', 'trialEnabled']);
      await refreshStructure(selectedCourse.id);
      message.success('课时已创建');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建课时失败');
    }
  };

  const publish = async (record: AdminCourse) => {
    try {
      await publishAdminCourse(record.id);
      message.success('课程已发布');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败，请先添加至少一个章节');
    }
  };

  const libraryTitle = library === 'audio' ? '音频课程库' : library === 'video' ? '视频课程库' : '课程管理';
  return <Space direction="vertical" size={18} style={{display: 'flex'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div><Typography.Title level={4} style={{margin: 0}}>{libraryTitle}</Typography.Title><Typography.Text type="secondary">共 {visibleItems.length} 门课程 · 草稿到发布流程</Typography.Text></div>
      <Space wrap><Select value={courseFilter} onChange={setCourseFilter} style={{minWidth: 190}} options={[{value: 'all', label: '全部关联课程'}, ...items.map(item => ({value: item.id, label: item.title}))]} /><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldsValue({type: library === 'all' ? 'video' : library}); setOpen(true); }}>{library === 'audio' ? '新建音频课程' : library === 'video' ? '新建视频课程' : '新建课程'}</Button></Space>
    </div>
    <Segmented value={library} onChange={value => setLibrary(value as typeof library)} options={[{label: '全部课程', value: 'all'}, {label: '音频课程库', value: 'audio'}, {label: '视频课程库', value: 'video'}, {label: '直播课程', value: 'live'}]} />
    <Table rowKey="id" loading={loading} dataSource={visibleItems} scroll={{x: 980}} columns={[
      {title: '课程', dataIndex: 'title'}, {title: '教师', dataIndex: 'teacher'}, {title: '类型', dataIndex: 'type', render: value => courseTypeLabels[String(value)] ?? String(value)}, {title: '课时数', dataIndex: 'lessons'}, {title: '学习人数', dataIndex: 'studentCount'},
      {title: '状态', dataIndex: 'status', render: value => <Tag color={value === 'published' ? 'green' : 'gold'}>{value === 'published' ? '已发布' : '草稿'}</Tag>},
      {title: '操作', render: (_: unknown, record: AdminCourse) => <Space size={0}><Button type="link" icon={<BookOutlined />} onClick={() => void openStructure(record)}>章节课时</Button>{record.status !== 'published' ? <Button type="link" icon={<SendOutlined />} onClick={() => void publish(record)}>发布</Button> : <Typography.Text type="secondary">已发布</Typography.Text>}</Space>}
    ]} pagination={{pageSize: 20, total: visibleItems.length}} />
    <Drawer title="新建课程" width={480} open={open} onClose={() => setOpen(false)} destroyOnClose><Form form={form} layout="vertical" onFinish={submit}><Form.Item name="title" label="课程名称" rules={[{required: true, min: 2}]}><Input /></Form.Item><Form.Item name="teacher" label="教师" rules={[{required: true}]}><Input /></Form.Item><Form.Item name="type" label="课程类型" initialValue="video"><Select options={[{value: 'video', label: '视频课'}, {value: 'audio', label: '音频课'}, {value: 'live', label: '直播课'}, {value: 'mixed', label: '混合课程（音频+视频+直播）'}]} /></Form.Item><Form.Item name="lessons" label="计划课时数" rules={[{required: true}]}><InputNumber min={1} precision={0} style={{width: '100%'}} /></Form.Item><Button type="primary" htmlType="submit" block>保存草稿</Button></Form></Drawer>
    <Drawer title={selectedCourse ? `课程结构：${selectedCourse.title}` : '课程结构'} width={680} open={structureOpen} onClose={() => setStructureOpen(false)} destroyOnClose>
      <Space direction="vertical" size={20} style={{display: 'flex'}}>
        <Descriptions size="small" bordered column={2}><Descriptions.Item label="教师">{selectedCourse?.teacher ?? '-'}</Descriptions.Item><Descriptions.Item label="状态"><Tag color={selectedCourse?.status === 'published' ? 'green' : 'gold'}>{selectedCourse?.status === 'published' ? '已发布' : '草稿'}</Tag></Descriptions.Item><Descriptions.Item label="章节数">{sections.length}</Descriptions.Item><Descriptions.Item label="实际课时数">{sections.reduce((count, section) => count + section.lessons.length, 0)}</Descriptions.Item></Descriptions>
        <Form form={sectionForm} layout="inline" onFinish={addSection}><Form.Item name="title" rules={[{required: true, min: 2, message: '请输入章节名称'}]}><Input placeholder="新章节名称" /></Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />}>新增章节</Button></Form>
        <Form form={lessonForm} layout="vertical" onFinish={addLesson}><Space align="start" wrap style={{width: '100%'}}><Form.Item name="sectionId" label="所属章节" rules={[{required: true}]} style={{minWidth: 190}}><Select placeholder="选择章节" options={sections.map(section => ({value: section.id, label: `${section.sortOrder + 1}. ${section.title}`}))} /></Form.Item><Form.Item name="title" label="课时名称" rules={[{required: true, min: 2}]} style={{minWidth: 250}}><Input /></Form.Item><Form.Item name="mediaKind" label="媒体类型" initialValue="video" rules={[{required: true}]} style={{minWidth: 130}}><Select options={Object.entries(mediaLabels).map(([value, label]) => ({value, label}))} /></Form.Item>{selectedLessonKind === 'live' ? <Typography.Text type="secondary" style={{paddingTop: 32}}>直播时长由排期计算</Typography.Text> : <Form.Item name="durationSeconds" label="时长（秒）"><InputNumber min={0} precision={0} /></Form.Item>}<Form.Item name="mediaReference" label="媒体引用"><Space.Compact><Input placeholder="对象存储 key 或 Provider ID" /><Upload accept="audio/*,video/*,.pdf,.doc,.docx" maxCount={1} showUploadList={false} beforeUpload={file => { const mediaKind = file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document'; lessonForm.setFieldsValue({mediaReference: file.name, mediaKind, title: lessonForm.getFieldValue('title') || file.name}); message.success(`已选择 ${file.name}`); return Upload.LIST_IGNORE; }}><Button icon={<UploadOutlined />}>上传</Button></Upload></Space.Compact></Form.Item><Form.Item name="trialEnabled" label="试看" initialValue={false}><Select options={[{value: true, label: '开启'}, {value: false, label: '关闭'}]} /></Form.Item></Space><Button type="primary" htmlType="submit" icon={<PlusOutlined />} disabled={!sections.length}>新增课时</Button></Form>
        <div style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><Typography.Text strong>批量上传课程素材</Typography.Text><Typography.Paragraph type="secondary" style={{marginTop: 6}}>选择关联章节后上传音频、视频或讲义文件；每个文件会创建一个课程素材，名称和媒体引用使用原始文件名。讲义支持 PDF、DOC、DOCX。当前保存的是课程素材元数据，正式对象存储接入后可替换媒体引用。</Typography.Paragraph><Select value={batchSectionId} onChange={setBatchSectionId} disabled={!sections.length || batchUploading} style={{width: '100%', marginBottom: 10}} placeholder="选择上传到的章节" options={sections.map(section => ({value: section.id, label: `${section.sortOrder + 1}. ${section.title}`}))} /><Upload.Dragger multiple accept="audio/*,video/*,.pdf,.doc,.docx" showUploadList={false} disabled={!sections.length || !batchSectionId || batchUploading} beforeUpload={async file => { if (!batchSectionId) { message.warning('请先选择章节'); return Upload.LIST_IGNORE; } setBatchUploading(true); try { const mediaKind = file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document'; await createAdminCourseLesson(selectedCourse!.id, {sectionId: batchSectionId, title: file.name, mediaKind, mediaReference: file.name, durationSeconds: 0, trialEnabled: false}); message.success(`${file.name} 已加入课程`); await refreshStructure(selectedCourse!.id); } catch (error) { message.error(error instanceof Error ? error.message : `${file.name} 上传失败`); } finally { setBatchUploading(false); } return Upload.LIST_IGNORE; }}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">批量选择音频、视频或讲义文件</p><p className="ant-upload-hint">支持多选；文件名将直接作为素材名称</p></Upload.Dragger></div>
        <Spin spinning={structureLoading}><Collapse items={sections.map(section => ({key: section.id, label: `${section.sortOrder + 1}. ${section.title}（${section.lessons.length} 个课时）`, children: section.lessons.length ? <Table size="small" rowKey="id" pagination={false} dataSource={section.lessons} columns={[{title: '课时', dataIndex: 'title'}, {title: '媒体', dataIndex: 'mediaKind', render: value => mediaLabels[value as LessonValues['mediaKind']] ?? String(value)}, {title: '时长', dataIndex: 'durationSeconds', render: (value, record) => record.mediaKind === 'live' ? '按排期计算' : `${Math.floor(Number(value ?? 0) / 60)} 分钟`}, {title: '试看', dataIndex: 'trialEnabled', render: value => value ? <Tag color="green">是</Tag> : <Tag>否</Tag>}, {title: '媒体引用', dataIndex: 'mediaReference', render: value => String(value ?? '-')}]} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无课时" />}))} /></Spin>
      </Space>
    </Drawer>
  </Space>;
}
