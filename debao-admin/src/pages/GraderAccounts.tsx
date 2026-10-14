import {EditOutlined, PlusOutlined, ReloadOutlined, StopOutlined} from '@ant-design/icons';
import {Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {createAdminGraderAccount, getAdminGraderAccounts, updateAdminGraderAccount, type AdminGraderAccount} from '@/services/api';

const subjects = [{value: 'civil', label: '民法'}, {value: 'criminal', label: '刑法'}, {value: 'admin', label: '行政法'}, {value: 'procedure', label: '诉讼法'}];
type Values = {username: string; displayName: string; password?: string; subjectIds: string[]};

export default function GraderAccounts() {
  const [items, setItems] = useState<AdminGraderAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminGraderAccount>();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Values>();
  const load = useCallback(async () => { setLoading(true); try { const result = await getAdminGraderAccounts(); setItems(result.items); } catch (error) { message.error(error instanceof Error ? error.message : '加载批改账号失败'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const showCreate = () => { setEditing(undefined); form.resetFields(); form.setFieldsValue({subjectIds: []}); setOpen(true); };
  const showEdit = (record: AdminGraderAccount) => { setEditing(record); form.setFieldsValue({displayName: record.displayName, subjectIds: record.subjectIds}); setOpen(true); };
  const submit = async (values: Values) => { try { if (editing) await updateAdminGraderAccount(editing.id, {displayName: values.displayName, password: values.password || undefined, subjectIds: values.subjectIds ?? []}); else await createAdminGraderAccount({username: values.username, displayName: values.displayName, password: values.password ?? '', subjectIds: values.subjectIds ?? []}); message.success(editing ? '批改账号已更新' : '批改账号已创建'); setOpen(false); await load(); } catch (error) { message.error(error instanceof Error ? error.message : '保存批改账号失败'); } };
  const toggle = async (record: AdminGraderAccount) => { const status = record.status === 'disabled' ? 'active' : 'disabled'; try { await updateAdminGraderAccount(record.id, {status}); message.success(status === 'active' ? '账号已恢复' : '账号已停用'); await load(); } catch (error) { message.error(error instanceof Error ? error.message : '更新账号状态失败'); } };
  return <Space direction="vertical" size={16} style={{display: 'flex'}}>
    <Card title="兼职批改老师账号" extra={<Space><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button><Button type="primary" icon={<PlusOutlined />} onClick={showCreate}>新建批改老师</Button></Space>}><Typography.Paragraph type="secondary">批改管理员负责创建账号、授权科目和停用账号。兼职老师只能处理分发给自己的批改任务。</Typography.Paragraph><Table rowKey="id" loading={loading} dataSource={items} columns={[{title: '账号', dataIndex: 'username'}, {title: '姓名', dataIndex: 'displayName'}, {title: '科目权限', dataIndex: 'subjectIds', render: (values: string[]) => values?.length ? values.map(value => <Tag key={value}>{subjects.find(item => item.value === value)?.label ?? value}</Tag>) : <Tag color="blue">全科</Tag>}, {title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === 'disabled' ? 'default' : 'green'}>{value === 'disabled' ? '已停用' : '正常'}</Tag>}, {title: '操作', render: (_: unknown, record: AdminGraderAccount) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => showEdit(record)}>编辑</Button><Button size="small" danger={record.status !== 'disabled'} icon={<StopOutlined />} onClick={() => void toggle(record)}>{record.status === 'disabled' ? '恢复' : '停用'}</Button></Space>}]} pagination={{pageSize: 20}} /></Card>
    <Modal title={editing ? '编辑批改老师' : '新建批改老师'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} destroyOnClose><Form form={form} layout="vertical" onFinish={submit}><Form.Item name="username" label="登录账号" rules={[{required: !editing, min: 3}]}><Input disabled={Boolean(editing)} /></Form.Item><Form.Item name="displayName" label="姓名" rules={[{required: true, min: 2}]}><Input /></Form.Item><Form.Item name="password" label={editing ? '重置密码（可选）' : '初始密码'} rules={[{required: !editing, min: 8, message: '密码至少 8 位'}]}><Input.Password /></Form.Item><Form.Item name="subjectIds" label="科目权限" extra="不选择表示全科"><Select mode="multiple" options={subjects} placeholder="选择可批改科目" /></Form.Item></Form></Modal>
  </Space>;
}
