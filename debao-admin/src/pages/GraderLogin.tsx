import {LockOutlined, ReadOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Space, Typography} from 'antd';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {loginGrader} from '@/services/api';

export default function GraderLogin() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false); const [error, setError] = useState<string>();
  const submit = async (values: {username: string; password: string}) => { setLoading(true); setError(undefined); try { await loginGrader(values.username, values.password); navigate('/grader/workbench', {replace: true}); } catch (cause) { setError(cause instanceof Error ? cause.message : '登录失败，请重试'); } finally { setLoading(false); } };
  return <div style={{minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f5f6fa'}}>
    <Card style={{width: 'min(440px, 100%)', borderRadius: 8}} styles={{body: {padding: 32}}}>
      <Space direction="vertical" size={6} style={{display: 'flex', marginBottom: 24}}><ReadOutlined style={{fontSize: 28, color: '#4C4BEA'}} /><Typography.Title level={3} style={{margin: 0}}>批改老师工作台</Typography.Title><Typography.Text type="secondary">使用批改人员专用账号登录</Typography.Text></Space>
      {error && <Alert type="error" showIcon message={error} style={{marginBottom: 16}} />}
      <Form layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item label="批改账号" name="username" rules={[{required: true, message: '请输入批改账号'}]}><Input size="large" autoComplete="username" /></Form.Item>
        <Form.Item label="密码" name="password" rules={[{required: true, message: '请输入密码'}]}><Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" /></Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={loading}>登录工作台</Button>
      </Form>
      <Typography.Paragraph type="secondary" style={{fontSize: 12, margin: '20px 0 0'}}>该账号仅用于领取和提交批改任务，无法访问运营后台、模型配置和用户完整资料。</Typography.Paragraph>
    </Card>
  </div>;
}
