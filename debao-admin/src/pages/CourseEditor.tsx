import {ArrowLeftOutlined, InboxOutlined, PlusOutlined, RightOutlined, SaveOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Space, Spin, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createAdminCourseLesson, createAdminCourseSection, getAdminCourseSections, getAdminCourses, type AdminCourse, type AdminCourseSection} from '@/services/api';

const mediaLabels = {video: '视频', audio: '音频', live: '直播', document: '讲义'} as const;
type LessonValues = {sectionId: string; title: string; mediaKind: keyof typeof mediaLabels; mediaReference?: string; durationSeconds?: number; trialEnabled?: boolean};

export default function CourseEditor() {
  const {courseId} = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<AdminCourse>();
  const [sections, setSections] = useState<AdminCourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchSectionId, setBatchSectionId] = useState<string>();
  const [batchUploading, setBatchUploading] = useState(false);
  const [sectionForm] = Form.useForm<{title: string}>();
  const [lessonForm] = Form.useForm<LessonValues>();

  const refresh = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courses, structure] = await Promise.all([getAdminCourses(), getAdminCourseSections(courseId)]);
      setCourse(courses.items.find(item => item.id === courseId));
      setSections(structure.items);
      setBatchSectionId(current => current && structure.items.some(item => item.id === current) ? current : structure.items[0]?.id);
    } catch (error) { message.error(error instanceof Error ? error.message : '加载课程编辑页失败'); }
    finally { setLoading(false); }
  }, [courseId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const addSection = async (values: {title: string}) => { if (!courseId) return; try { await createAdminCourseSection(courseId, values); sectionForm.resetFields(); await refresh(); message.success('章节已创建'); } catch (error) { message.error(error instanceof Error ? error.message : '创建章节失败'); } };
  const addLesson = async (values: LessonValues) => { if (!courseId) return; try { await createAdminCourseLesson(courseId, {...values, durationSeconds: values.durationSeconds ?? 0}); lessonForm.resetFields(); await refresh(); message.success('素材已添加'); } catch (error) { message.error(error instanceof Error ? error.message : '添加素材失败'); } };
  const uploadFile = async (file: File) => {
    if (!courseId || !batchSectionId) { message.warning('请先选择上传章节'); return; }
    setBatchUploading(true);
    try { const mediaKind = file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document'; await createAdminCourseLesson(courseId, {sectionId: batchSectionId, title: file.name, mediaKind, mediaReference: file.name, durationSeconds: 0, trialEnabled: false}); message.success(`${file.name} 已添加`); await refresh(); }
    catch (error) { message.error(error instanceof Error ? error.message : `${file.name} 上传失败`); }
    finally { setBatchUploading(false); }
  };

  if (loading) return <div style={{padding: 80, textAlign: 'center'}}><Spin tip="正在加载课程编辑页..." /></div>;
  if (!course) return <Alert type="error" showIcon message="课程不存在" action={<Button onClick={() => navigate('/courses')}>返回课程管理</Button>} />;
  return <Space direction="vertical" size={20} style={{display: 'flex'}}>
    <Space><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/courses')}>返回课程库</Button><div><Typography.Title level={4} style={{margin: 0}}>编辑课程：{course.title}</Typography.Title><Typography.Text type="secondary">{course.teacher} · {course.type === 'mixed' ? '混合课程' : course.type === 'audio' ? '音频课' : course.type === 'video' ? '视频课' : '直播课'}</Typography.Text></div></Space>
    <Card title="章节列表" extra={<Tag color={course.status === 'published' ? 'green' : 'gold'}>{course.status === 'published' ? '已发布' : '草稿'}</Tag>}>
      <Typography.Paragraph type="secondary">请选择一个章节进入课程素材上传页。课程列表页只展示章节，不在这里直接上传素材。</Typography.Paragraph>
      <Form form={sectionForm} layout="inline" onFinish={addSection} style={{marginBottom: 18}}><Form.Item name="title" rules={[{required: true, min: 2, message: '请输入章节名称'}]}><Input placeholder="新章节名称" /></Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />}>新增章节</Button></Form>
      <Space direction="vertical" size={10} style={{display: 'flex'}}>{sections.length ? sections.map(section => <Card key={section.id} size="small" hoverable onClick={() => navigate(`/courses/${encodeURIComponent(course.id)}/sections/${encodeURIComponent(section.id)}/edit`)} style={{cursor: 'pointer'}}><Space style={{width: '100%', justifyContent: 'space-between'}}><Space><Typography.Text strong>{section.sortOrder + 1}. {section.title}</Typography.Text><Tag>{section.lessons.length} 个素材</Tag></Space><Button type="link" icon={<RightOutlined />}>进入章节</Button></Space></Card>) : <Typography.Text type="secondary">暂无章节，请先新增章节。</Typography.Text>}</Space>
    </Card>
  </Space>;
}
