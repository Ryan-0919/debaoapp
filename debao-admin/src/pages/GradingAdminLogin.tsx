import {LockOutlined, HighlightOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Space, Typography} from 'antd';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {loginGradingAdmin} from '@/services/api';

export default function GradingAdminLogin() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false); const [error, setError] = useState<string>();
  const submit = async (values: {username: string; password: string}) => { setLoading(true); setError(undefined); try { await loginGradingAdmin(values.username, values.password); navigate('/grading-admin', {replace: true}); } catch (cause) { setError(cause instanceof Error ? cause.message : '登录失败'); } finally { setLoading(false); } };
  return <div style={{minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f5f6fa'}}><Card style={{width: 'min(460px, 100%)'}}><Space direction="vertical" size={6} style={{display: 'flex', marginBottom: 24}}><HighlightOutlined style={{fontSize: 28, color: '#4C4BEA'}} /><Typography.Title level={3} style={{margin: 0}}>批改管理端</Typography.Title><Typography.Text type="secondary">批改管理员专用入口，与运营后台分离</Typography.Text></Space>{error && <Alert type="error" showIcon message={error} style={{marginBottom: 16}} />}<Form layout="vertical" onFinish={submit}><Form.Item label="批改管理员账号" name="username" rules={[{required: true}]}><Input size="large" autoComplete="username" /></Form.Item><Form.Item label="密码" name="password" rules={[{required: true}]}><Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" /></Form.Item><Button htmlType="submit" type="primary" size="large" block loading={loading}>登录批改管理端</Button></Form></Card></div>;
}
