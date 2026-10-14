import {EditOutlined, EyeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Button, Empty, Form, Input, Modal, Space, Table, Tabs, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {getAdminSubjects, updateAdminSubject, type AdminSubject} from '@/services/api';

type QuestionCategory = 'objective' | 'subjective';

const typeLabels: Record<QuestionCategory, string> = {
  objective: '客观题',
  subjective: '主观题',
};

function chaptersFor(subject: AdminSubject, type: QuestionCategory) {
  return (subject.chapters ?? []).filter(chapter => chapter.questionType === type);
}

export default function Subjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminSubject>();
  const [form] = Form.useForm<{name: string}>();
  const activeType: QuestionCategory = searchParams.get('type') === 'subjective' ? 'subjective' : 'objective';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAdminSubjects());
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载科目失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openEdit = (subject: AdminSubject) => {
    setEditing(subject);
    form.setFieldsValue({name: subject.name});
  };

  const saveSubject = async ({name}: {name: string}) => {
    if (!editing) return;
    try {
      await updateAdminSubject(editing.id, {name});
      message.success('科目名称已保存');
      setEditing(undefined);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const tableFor = (type: QuestionCategory) => (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={items}
      locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`暂无${typeLabels[type]}科目`} />}}
      pagination={false}
      columns={[
        {
          title: '科目',
          dataIndex: 'name',
          render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
        },
        {
          title: `${typeLabels[type]}数量`,
          width: 140,
          render: (_: unknown, subject: AdminSubject) => type === 'objective'
            ? subject.objectiveQuestionCount ?? 0
            : subject.subjectiveQuestionCount ?? 0,
        },
        {
          title: '章节数',
          width: 110,
          render: (_: unknown, subject: AdminSubject) => chaptersFor(subject, type).length,
        },
        {
          title: '考点数',
          width: 110,
          render: (_: unknown, subject: AdminSubject) => chaptersFor(subject, type)
            .reduce((sum, chapter) => sum + (chapter.points?.length ?? 0), 0),
        },
        {
          title: '分类',
          width: 110,
          render: () => <Tag color={type === 'objective' ? 'blue' : 'purple'}>{typeLabels[type]}</Tag>,
        },
        {
          title: '状态',
          width: 100,
          render: () => <Tag color="green">已发布</Tag>,
        },
        {
          title: '操作',
          width: 260,
          render: (_: unknown, subject: AdminSubject) => (
            <Space>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/content/subjects/${encodeURIComponent(subject.id)}?type=${type}`)}
              >
                查看章节与考点
              </Button>
              <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(subject)}>编辑名称</Button>
            </Space>
          ),
        },
      ]}
    />
  );

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>科目、章节与考点</Typography.Title>
          <Typography.Text type="secondary">客观题与主观题使用独立目录，进入科目详情管理章节和考点。</Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>刷新</Button>
      </div>
      <Tabs
        activeKey={activeType}
        onChange={key => setSearchParams({type: key})}
        items={[
          {key: 'objective', label: '客观题分类', children: tableFor('objective')},
          {key: 'subjective', label: '主观题分类', children: tableFor('subjective')},
        ]}
      />
      <Modal
        title="编辑科目名称"
        open={Boolean(editing)}
        onCancel={() => setEditing(undefined)}
        onOk={() => form.submit()}
        okText="保存"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={saveSubject}>
          <Form.Item name="name" label="名称" rules={[{required: true, whitespace: true, message: '请输入科目名称'}]}>
            <Input maxLength={30} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
