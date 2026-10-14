import {BookOutlined, LockOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Space, Typography} from 'antd';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {loginLearningAdmin} from '@/services/api';

export default function LearningAdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (values: {username: string; password: string}) => {
    setLoading(true);
    setError(undefined);
    try {
      await loginLearningAdmin(values.username, values.password);
      navigate('/learning-admin/classes', {replace: true});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f4f5fb'}}>
      <Card style={{width: 'min(460px, 100%)', boxShadow: '0 18px 60px rgba(31,35,48,.08)'}}>
        <Space direction="vertical" size={6} style={{display: 'flex', marginBottom: 24}}>
          <BookOutlined style={{fontSize: 28, color: '#4C4BEA'}} />
          <Typography.Title level={3} style={{margin: 0}}>得恩私教管理端</Typography.Title>
          <Typography.Text type="secondary">学习中心管理员专用入口，与运营后台独立</Typography.Text>
        </Space>
        {error && <Alert type="error" showIcon message={error} style={{marginBottom: 16}} />}
        <Form layout="vertical" onFinish={submit} requiredMark="optional">
          <Form.Item label="学习中心管理员账号" name="username" rules={[{required: true, message: '请输入管理员账号'}]}>
            <Input size="large" autoComplete="username" placeholder="请输入管理员账号" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{required: true, message: '请输入密码'}]}>
            <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" placeholder="请输入密码" />
          </Form.Item>
          <Button htmlType="submit" type="primary" size="large" block loading={loading}>登录学习中心管理端</Button>
        </Form>
      </Card>
    </div>
  );
}
