import {PlusOutlined, SendOutlined} from '@ant-design/icons';
import {Button, DatePicker, Drawer, Form, Input, Select, Space, Table, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {cancelAdminLiveSession, createAdminLiveSession, getAdminCourseSections, getAdminCourses, getAdminLiveSessions, type AdminCourse, type AdminCourseSection, type AdminLiveSession} from '@/services/api';

type PickerValue = {format: (template: string) => string};
type Values = {courseId: string; sectionId: string; lessonId: string; title: string; teacher: string; startsAt: string | PickerValue; endsAt: string | PickerValue; provider?: 'polyv'|'tencent'; providerRoomId?: string; recordingVideoId?: string};
const statusLabels: Record<string, string> = {scheduled: '已排期', cancelled: '已取消', live: '直播中', ended: '已结束'};
const noticeLabels: Record<string, string> = {not_required: '无需通知', sent: '已发送', pending: '待发送', unavailable: '不可用', failed: '发送失败'};

export default function LiveSessions() {
  const [items, setItems] = useState<AdminLiveSession[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [sections, setSections] = useState<AdminCourseSection[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Values>();
  const load = useCallback(async () => {
    try { const [sessions, courseResult] = await Promise.all([getAdminLiveSessions(), getAdminCourses()]); setItems(sessions.items); setCourses(courseResult.items); }
    catch (error) { message.error(error instanceof Error ? error.message : '加载直播排期失败'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const submit = async (values: Values) => {
    try {
      const {sectionId: _sectionId, ...payload} = values;
      await createAdminLiveSession({...payload, startsAt: typeof values.startsAt === 'string' ? values.startsAt : values.startsAt.format('YYYY-MM-DDTHH:mm:ssZ'), endsAt: typeof values.endsAt === 'string' ? values.endsAt : values.endsAt.format('YYYY-MM-DDTHH:mm:ssZ')});
      message.success('直播场次已创建'); setOpen(false); form.resetFields(); setSections([]); await load();
    }
    catch (error) { message.error(error instanceof Error ? error.message : '创建直播失败'); }
  };
  const loadSections = async (courseId: string) => { try { const result = await getAdminCourseSections(courseId); setSections(result.items); } catch (error) { message.error(error instanceof Error ? error.message : '加载课程章节失败'); } };
  const cancel = async (record: AdminLiveSession) => {
    try { await cancelAdminLiveSession(record.id, '运营调整'); message.success('场次已取消'); await load(); }
    catch (error) { message.error(error instanceof Error ? error.message : '取消失败'); }
  };
  return <Space direction="vertical" size={18} style={{display: 'flex'}}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}><div><Typography.Title level={4} style={{margin: 0}}>直播排期</Typography.Title><Typography.Text type="secondary">Provider 未配置时会明确标记通知不可用。</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>新建场次</Button></div>
    <Table rowKey="id" dataSource={items} locale={{emptyText: '暂无直播场次'}} scroll={{x: 900}} columns={[{title: '场次', dataIndex: 'title'}, {title: '关联课件', dataIndex: 'lessonId', render: value => value || '-'}, {title: '讲师', dataIndex: 'teacher'}, {title: '开始时间', dataIndex: 'startsAt'}, {title: '结束时间', dataIndex: 'endsAt'}, {title: '状态', dataIndex: 'status', render: value => <Tag color={value === 'cancelled' ? 'red' : value === 'scheduled' ? 'blue' : 'green'}>{statusLabels[String(value)] ?? String(value ?? '未知')}</Tag>}, {title: '通知状态', dataIndex: 'notificationStatus', render: value => <Tag color={value === 'unavailable' ? 'orange' : 'green'}>{noticeLabels[String(value)] ?? String(value ?? '未知')}</Tag>}, {title: '操作', render: (_: unknown, record: AdminLiveSession) => record.status === 'scheduled' && <Button danger type="link" icon={<SendOutlined />} onClick={() => void cancel(record)}>取消</Button>}]} />
    <Drawer title="新建直播场次" open={open} onClose={() => { setOpen(false); setSections([]); }} width={520} destroyOnClose><Form form={form} layout="vertical" onFinish={submit}><Form.Item name="courseId" label="关联课程" rules={[{required: true, message: '请选择课程'}]}><Select options={courses.map(course => ({value: course.id, label: course.title}))} onChange={value => { form.setFieldsValue({sectionId: undefined, lessonId: undefined}); void loadSections(value); }} /></Form.Item><Form.Item name="sectionId" label="关联章节" extra="先选择课程，再选择该课程下的章节" rules={[{required: true, message: '请选择章节'}]}><Select placeholder="先选择课程" options={sections.map(section => ({value: section.id, label: `${section.sortOrder + 1}. ${section.title}`}))} onChange={() => form.setFieldValue('lessonId', undefined)} /></Form.Item><Form.Item noStyle shouldUpdate={(previous, current) => previous.sectionId !== current.sectionId}>{({getFieldValue}) => { const section = sections.find(item => item.id === getFieldValue('sectionId')); const liveLessons = section?.lessons.filter(lesson => lesson.mediaKind === 'live') ?? []; return <Form.Item name="lessonId" label="关联直播课件" extra="只显示该章节下媒体类型为“直播”的课件" rules={[{required: true, message: '请选择直播课件'}]}><Select options={liveLessons.map(lesson => ({value: lesson.id, label: lesson.title}))} placeholder={section ? (liveLessons.length ? '请选择直播课件' : '该章节暂无直播课件') : '先选择章节'} disabled={!section || !liveLessons.length} /></Form.Item>; }}</Form.Item><Form.Item name="title" label="场次名称" rules={[{required: true, min: 2, message: '请输入场次名称'}]}><Input /></Form.Item><Form.Item name="teacher" label="讲师" rules={[{required: true, message: '请输入讲师'}]}><Input /></Form.Item><Form.Item name="startsAt" label="开始时间" rules={[{required: true, message: '请选择开始时间'}]}><DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" placeholder="请选择日期和时间" style={{width: '100%'}} /></Form.Item><Form.Item name="endsAt" label="结束时间" rules={[{required: true, message: '请选择结束时间'}]}><DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" placeholder="请选择日期和时间" style={{width: '100%'}} /></Form.Item><Form.Item name="provider" label="直播平台" initialValue="polyv" rules={[{required: true}]}><Select options={[{value: 'polyv', label: '保利威 Polyv'}, {value: 'tencent', label: '腾讯云'}]} /></Form.Item><Form.Item name="providerRoomId" label="保利威频道 ID"><Input placeholder="例如 8396848" /></Form.Item><Form.Item name="recordingVideoId" label="回放视频 ID"><Input placeholder="直播结束后填写" /></Form.Item><Button type="primary" htmlType="submit" block>保存排期</Button></Form></Drawer>
  </Space>;
}
