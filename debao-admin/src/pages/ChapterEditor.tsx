import {ArrowLeftOutlined, EditOutlined, InboxOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Spin, Table, Tag, Typography, Upload, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createAdminCourseLesson, getAdminCourseSections, updateAdminCourseLesson, type AdminCourseLesson, type AdminCourseSection} from '@/services/api';
import {formatMediaDuration, mediaFileKind, readMediaDuration} from '@/utils/mediaDuration';

const labels: Record<AdminCourseLesson['mediaKind'], string> = {audio: '音频', video: '视频', live: '直播', document: '讲义'};
type Values = {title: string; mediaKind: AdminCourseLesson['mediaKind']; mediaReference?: string; handoutReference?: string; durationSeconds?: number; trialEnabled?: boolean};

export default function ChapterEditor() {
  const {courseId, sectionId} = useParams(); const navigate = useNavigate();
  const [section, setSection] = useState<AdminCourseSection>(); const [loading, setLoading] = useState(true); const [uploading, setUploading] = useState(false); const [form] = Form.useForm<Values>();
  const selectedMediaKind = Form.useWatch('mediaKind', form) ?? 'video';
  const [editing, setEditing] = useState<AdminCourseLesson>(); const [editForm] = Form.useForm<Values>();
  const [readingDuration, setReadingDuration] = useState(false);
  const [readingEditDuration, setReadingEditDuration] = useState(false);
  const chooseMedia = async (file: File, isEdit = false) => {
    const target = isEdit ? editForm : form;
    const kind = mediaFileKind(file);
    if (kind === 'document' || (isEdit && editing?.mediaKind !== kind)) {
      message.error(isEdit ? '请选择与原课件相同类型的音视频文件' : '请选择音频或视频文件');
      return;
    }
    const setReading = isEdit ? setReadingEditDuration : setReadingDuration;
    setReading(true);
    target.setFieldsValue({mediaReference: file.name, title: target.getFieldValue('title') || file.name, ...(isEdit ? {} : {mediaKind: kind}), durationSeconds: undefined});
    try { target.setFieldsValue({durationSeconds: await readMediaDuration(file)}); }
    catch (error) { message.warning(error instanceof Error ? error.message : '无法读取时长，请手动填写'); }
    finally { setReading(false); }
  };
  const load = useCallback(async () => { if (!courseId || !sectionId) return; setLoading(true); try { const result = await getAdminCourseSections(courseId); setSection(result.items.find(item => item.id === sectionId)); } catch (error) { message.error(error instanceof Error ? error.message : '加载章节失败'); } finally { setLoading(false); } }, [courseId, sectionId]);
  useEffect(() => { void load(); }, [load]);
  const addLesson = async (values: Values) => { if (!courseId || !sectionId) return; try { await createAdminCourseLesson(courseId, {...values, sectionId, durationSeconds: values.mediaKind === 'live' ? 0 : values.durationSeconds ?? 0}); form.resetFields(); await load(); message.success('课件已添加，请在列表中关联讲义'); } catch (error) { message.error(error instanceof Error ? error.message : '添加素材失败'); } };
  const attachHandout = async (lessonId: string, file: File) => { if (!courseId) return; try { await updateAdminCourseLesson(courseId, lessonId, {handoutReference: file.name}); await load(); message.success(`已关联讲义：${file.name}`); } catch (error) { message.error(error instanceof Error ? error.message : '关联讲义失败'); } };
  const saveEdit = async (values: Values) => { if (!courseId || !editing) return; try { await updateAdminCourseLesson(courseId, editing.id, {...values, durationSeconds: editing.mediaKind === 'live' ? 0 : values.durationSeconds}); setEditing(undefined); await load(); message.success('素材已更新'); } catch (error) { message.error(error instanceof Error ? error.message : '保存失败'); } };
  const uploadBatch = async (files: File[]) => {
    if (!courseId || !sectionId) return;
    setUploading(true);
    let added = 0;
    for (const file of files) {
      try {
        const mediaKind = mediaFileKind(file);
        const durationSeconds = mediaKind === 'document' ? 0 : await readMediaDuration(file);
        await createAdminCourseLesson(courseId, {sectionId, title: file.name, mediaKind, mediaReference: file.name, durationSeconds, trialEnabled: false});
        added++;
      } catch (error) { message.error(error instanceof Error ? error.message : `${file.name} 添加失败`); }
    }
    if (added) { await load(); message.success(`已添加 ${added} 个素材，音视频时长已自动读取`); }
    setUploading(false);
  };
  if (loading) return <div style={{padding: 80, textAlign: 'center'}}><Spin tip="正在加载章节..." /></div>;
  if (!section) return <Alert type="error" message="章节不存在" action={<Button onClick={() => navigate(`/courses/${courseId}/edit`)}>返回章节列表</Button>} />;
  return <Space direction="vertical" size={20} style={{display: 'flex'}}>
    <Space><Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/courses/${courseId}/edit`)}>返回章节列表</Button><div><Typography.Title level={4} style={{margin: 0}}>章节素材</Typography.Title><Typography.Text type="secondary">{section.title}</Typography.Text></div></Space>
    <Alert type="info" showIcon message="课件和讲义分开上传" description="先上传音频、视频或直播课件，再在下方素材列表中单独上传并关联讲义。系统保存的是文件上传记录，不会使用桌面路径。" />
    <Card title="批量上传音频、视频或讲义"><Upload.Dragger multiple accept="audio/*,video/*,.pdf,.doc,.docx" showUploadList={false} disabled={uploading} beforeUpload={(file, files) => { if (file.uid === files[0]?.uid) void uploadBatch(files); return Upload.LIST_IGNORE; }}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">拖入文件或点击选择</p><p className="ant-upload-hint">支持多选：音频、视频、PDF、DOC、DOCX；音视频时长自动读取</p></Upload.Dragger></Card>
    <Card title="手动添加课件"><Form form={form} layout="inline" onFinish={addLesson}><Form.Item name="title" rules={[{required: true, min: 2, message: '请输入素材名称'}]}><Input placeholder="素材名称" /></Form.Item><Form.Item name="mediaKind" initialValue="video" rules={[{required: true}]}><Select style={{width: 110}} options={Object.entries(labels).filter(([value]) => value !== 'document').map(([value, label]) => ({value, label}))} /></Form.Item><Form.Item label="课件"><Space.Compact><Form.Item name="mediaReference" noStyle><Input placeholder="媒体引用" disabled={readingDuration} /></Form.Item><Upload accept="audio/*,video/*" disabled={readingDuration} maxCount={1} showUploadList={false} beforeUpload={file => { void chooseMedia(file); return Upload.LIST_IGNORE; }}><Button loading={readingDuration} icon={<UploadOutlined />}>选择课件</Button></Upload></Space.Compact></Form.Item>{selectedMediaKind !== 'live' ? <Form.Item name="durationSeconds" label="时长（秒）" rules={[{required: true, message: "请等待自动读取，失败时可手动填写"}]}><InputNumber min={0} precision={0} disabled={readingDuration} placeholder="选择文件后自动读取" /></Form.Item> : <Typography.Text type="secondary" style={{paddingTop: 8}}>直播时长由直播排期的开始和结束时间计算</Typography.Text>}<Button type="primary" icon={<PlusOutlined />} disabled={readingDuration} htmlType="submit">添加课件</Button></Form></Card>
    <Card title={`当前素材（${section.lessons.length}）`}><Table rowKey="id" pagination={false} dataSource={section.lessons} columns={[{title: '名称', dataIndex: 'title'}, {title: '类型', dataIndex: 'mediaKind', render: value => labels[value as AdminCourseLesson['mediaKind']] ?? value}, {title: '讲义', dataIndex: 'handoutReference', render: (value, record) => ['audio', 'video', 'live'].includes(record.mediaKind) ? (value ? <Tag color="green">已关联：{value}</Tag> : <Upload accept=".pdf,.doc,.docx" showUploadList={false} beforeUpload={file => { void attachHandout(record.id, file); return Upload.LIST_IGNORE; }}><Button size="small" danger>上传讲义</Button></Upload>) : <Tag>讲义素材</Tag>}, {title: '时长', dataIndex: 'durationSeconds', render: value => formatMediaDuration(Number(value))}, {title: '试看', dataIndex: 'trialEnabled', render: value => value ? <Tag color="green">是</Tag> : <Tag>否</Tag>}, {title: '媒体引用', dataIndex: 'mediaReference', render: value => value || '-'}, {title: '操作', render: (_: unknown, record: AdminCourseLesson) => <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); editForm.setFieldsValue(record); }}>编辑</Button>}]} /></Card>
    <Modal open={Boolean(editing)} title="编辑素材" closable={!readingEditDuration} maskClosable={!readingEditDuration} keyboard={!readingEditDuration} onCancel={() => { if (!readingEditDuration) setEditing(undefined); }} confirmLoading={readingEditDuration} cancelButtonProps={{disabled: readingEditDuration}} onOk={() => { if (!readingEditDuration) editForm.submit(); }}><Form form={editForm} layout="vertical" onFinish={saveEdit}><Form.Item name="title" label="名称" rules={[{required: true, min: 2}]}><Input /></Form.Item><Form.Item label="课件引用"><Space.Compact style={{width: '100%'}}><Form.Item name="mediaReference" noStyle><Input disabled={readingEditDuration} /></Form.Item>{editing?.mediaKind === 'audio' || editing?.mediaKind === 'video' ? <Upload accept={editing.mediaKind === 'audio' ? 'audio/*' : 'video/*'} disabled={readingEditDuration} showUploadList={false} beforeUpload={file => { void chooseMedia(file, true); return Upload.LIST_IGNORE; }}><Button loading={readingEditDuration}>更换课件</Button></Upload> : null}</Space.Compact></Form.Item><Form.Item name="handoutReference" label="讲义引用"><Input placeholder="可后续补充或修改" /></Form.Item>{editing?.mediaKind !== 'live' ? <Form.Item name="durationSeconds" label="时长（秒）" extra="更换音视频后自动读取时长" rules={[{required: true, message: "请等待自动读取，失败时可手动填写"}]}><InputNumber disabled={readingEditDuration} precision={0} min={0} style={{width: '100%'}} /></Form.Item> : <Typography.Text type="secondary">直播时长由直播排期计算</Typography.Text>}<Form.Item name="trialEnabled" label="试看"><Select options={[{value: true, label: '是'}, {value: false, label: '否'}]} /></Form.Item></Form></Modal>
  </Space>;
}
