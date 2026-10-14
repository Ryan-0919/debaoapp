import {ReloadOutlined, SafetyCertificateOutlined} from '@ant-design/icons';
import {Alert, Button, Col, Form, Input, Modal, Row, Space, Table, Tag, Typography} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {enrollCurrentAdminMfa, getAdminAdmins, getAdminRoles, resetAdminMfa, verifyAdminMfa, type AdminMfaEnrollment} from '@/services/api';

interface AdminRecord {id: string; username: string; name: string; role: string; status: string; mfaEnabled: boolean; lastLoginAt?: string;}
const adminStatusLabels: Record<string, string> = {active: '正常', disabled: '已停用', locked: '已锁定'};
const roleLabels: Record<string, string> = {super_admin: '超级管理员', content_admin: '内容管理员', moderator: '社区管理员'};

export default function SystemAdmins() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [roles, setRoles] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [enrollment, setEnrollment] = useState<AdminMfaEnrollment>();
  const [mfaCode, setMfaCode] = useState('');
  const [resetTarget, setResetTarget] = useState<AdminRecord>();
  const [resetting, setResetting] = useState(false);
  const [resetForm] = Form.useForm<{reason: string; confirmation: string}>();
  const load = useCallback(() => { setError(undefined); Promise.all([getAdminAdmins(), getAdminRoles()]).then(([adminResult, roleResult]) => { setAdmins(adminResult.items as unknown as AdminRecord[]); setRoles(roleResult.items); }).catch(cause => setError(cause instanceof Error ? cause.message : '系统管理数据加载失败')); }, []);
  useEffect(load, [load]);
  const startEnrollment = async () => { try { setEnrollment(await enrollCurrentAdminMfa()); setNotice(undefined); } catch (cause) { setError(cause instanceof Error ? cause.message : 'MFA 绑定初始化失败'); } };
  const confirmEnrollment = async () => { if (!/^\d{6}$/.test(mfaCode)) { setError('请输入身份验证器生成的 6 位验证码'); return; } try { await verifyAdminMfa(enrollment?.challengeToken ?? '', mfaCode); setEnrollment(undefined); setMfaCode(''); setNotice('MFA 已启用，后续登录必须输入动态验证码。'); load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'MFA 验证失败'); } };
  const confirmReset = async () => { try { const values = await resetForm.validateFields(); if (!resetTarget) return; setResetting(true); await resetAdminMfa(resetTarget.id, values.reason, values.confirmation); setResetTarget(undefined); resetForm.resetFields(); window.sessionStorage.removeItem('debao_admin_csrf'); window.location.assign('/login'); } catch (cause) { if (cause instanceof Error) setError(cause.message); } finally { setResetting(false); } };
  return <div>
    <Space align="start" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}} wrap>
      <div><Typography.Title level={4} style={{margin: 0}}>系统管理</Typography.Title><Typography.Paragraph type="secondary" style={{margin: '4px 0 0'}}>管理员使用独立 MFA 密钥；重置会撤销该管理员全部后台会话并写入审计。</Typography.Paragraph></div>
      <Button icon={<SafetyCertificateOutlined />} onClick={startEnrollment}>绑定或更换我的 MFA</Button>
    </Space>
    {error && <Alert closable onClose={() => setError(undefined)} type="error" showIcon message={error} style={{marginBottom: 16}} />}
    {notice && <Alert closable onClose={() => setNotice(undefined)} type="success" showIcon message={notice} style={{marginBottom: 16}} />}
    {enrollment && <Alert type="info" showIcon message="绑定身份验证器" description={<Space direction="vertical" style={{display: 'flex'}}><Typography.Text>在身份验证器中手动添加以下密钥，密钥关闭后不再显示。</Typography.Text><Typography.Text copyable code>{enrollment.secret}</Typography.Text><Space.Compact style={{width: 'min(360px, 100%)'}}><Input aria-label="MFA 验证码" value={mfaCode} onChange={event => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 位验证码" inputMode="numeric" /><Button type="primary" onClick={confirmEnrollment}>确认启用</Button></Space.Compact></Space>} style={{marginBottom: 16}} />}
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20, minWidth: 0}}><Typography.Title level={5} style={{marginTop: 0}}>管理员</Typography.Title><Table<AdminRecord> size="small" rowKey="id" dataSource={admins} locale={{emptyText: '暂无管理员'}} pagination={false} scroll={{x: 720}} columns={[{title: '账号', dataIndex: 'username'}, {title: '名称', dataIndex: 'name'}, {title: '角色', dataIndex: 'role', render: value => roleLabels[String(value)] ?? String(value ?? '未知')}, {title: '状态', dataIndex: 'status', render: value => <Tag color={value === 'active' ? 'green' : 'red'}>{adminStatusLabels[String(value)] ?? '未知'}</Tag>}, {title: 'MFA', dataIndex: 'mfaEnabled', render: value => <Tag color={value ? 'green' : 'gold'}>{value ? '已启用' : '待绑定'}</Tag>}, {title: '操作', fixed: 'right', width: 96, render: (_, record) => <Button danger type="link" size="small" icon={<ReloadOutlined />} disabled={!record.mfaEnabled} onClick={() => setResetTarget(record)}>重置</Button>}]} /></div></Col>
      <Col xs={24} lg={10}><div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20, minWidth: 0}}><Typography.Title level={5} style={{marginTop: 0}}>角色与权限</Typography.Title><Table size="small" rowKey="id" dataSource={roles} pagination={false} scroll={{x: 420}} columns={[{title: '角色', dataIndex: 'name'}, {title: '编码', dataIndex: 'code'}, {title: '权限数', dataIndex: 'permissions', render: value => Array.isArray(value) ? value.length : 0}]} /></div></Col>
    </Row>
    <Modal title={`重置 ${resetTarget?.username ?? ''} 的 MFA`} open={Boolean(resetTarget)} okText="确认重置并强制下线" okButtonProps={{danger: true}} confirmLoading={resetting} onOk={confirmReset} onCancel={() => {setResetTarget(undefined); resetForm.resetFields();}} destroyOnHidden><Alert type="warning" showIcon message="该管理员全部后台会话会立即失效，下次登录需重新绑定 MFA。" style={{marginBottom: 16}} /><Form form={resetForm} layout="vertical"><Form.Item name="reason" label="操作原因" rules={[{required: true, min: 4, message: '请填写至少 4 个字的原因'}]}><Input.TextArea rows={3} maxLength={300} showCount /></Form.Item><Form.Item name="confirmation" label="输入 RESET 确认" rules={[{required: true}, {validator: (_, value) => value === 'RESET' ? Promise.resolve() : Promise.reject(new Error('请输入 RESET'))}]}><Input autoComplete="off" /></Form.Item></Form></Modal>
  </div>;
}
