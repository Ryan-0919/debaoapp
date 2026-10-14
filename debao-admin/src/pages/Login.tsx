import {LockOutlined, SafetyCertificateOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Space, Typography} from 'antd';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {loginAdmin, verifyAdminMfa} from '@/services/api';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [challengeToken, setChallengeToken] = useState<string>();
  const [enrollment, setEnrollment] = useState<{secret: string; otpAuthUri: string}>();

  const submit = async (values: {username: string; password: string}) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await loginAdmin(values.username, values.password);
      if (result.mfaRequired && result.challengeToken) {
        setChallengeToken(result.challengeToken);
        if (result.enrollmentRequired && result.secret && result.otpAuthUri) {
          setEnrollment({secret: result.secret, otpAuthUri: result.otpAuthUri});
        }
      } else {
        navigate('/dashboard', {replace: true});
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const submitMfa = async (values: {code: string}) => {
    setLoading(true);
    setError(undefined);
    try {
      await verifyAdminMfa(challengeToken ?? '', values.code);
      navigate('/dashboard', {replace: true});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'MFA 验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return <div style={{minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f5f6fa'}}>
    <Card style={{width: 'min(460px, 100%)', borderRadius: 8}} styles={{body: {padding: 32}}}>
      <Space direction="vertical" size={6} style={{display: 'flex', marginBottom: 24}}>
        <SafetyCertificateOutlined style={{fontSize: 28, color: '#4C4BEA'}} />
        <Typography.Title level={3} style={{margin: 0}}>登录得宝运营后台</Typography.Title>
        <Typography.Text type="secondary">{enrollment ? '首次登录需绑定身份验证器' : challengeToken ? '请输入身份验证器中的 6 位验证码' : '使用管理员账号进入工作台'}</Typography.Text>
      </Space>
      {error && <Alert type="error" showIcon message={error} style={{marginBottom: 16}} />}
      {enrollment && <Alert
        type="info"
        showIcon
        message="在身份验证器中添加密钥"
        description={<Space direction="vertical" size={4}>
          <Typography.Text copyable code>{enrollment.secret}</Typography.Text>
          <Typography.Text type="secondary">密钥只显示一次。添加后输入应用生成的 6 位验证码。</Typography.Text>
        </Space>}
        style={{marginBottom: 16}}
      />}
      {challengeToken ? <Form layout="vertical" onFinish={submitMfa}>
        <Form.Item label="MFA 验证码" name="code" rules={[{required: true, pattern: /^\d{6}$/, message: '请输入 6 位数字验证码'}]}>
          <Input size="large" inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
        </Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={loading}>验证并登录</Button>
      </Form> : <Form layout="vertical" onFinish={submit}>
        <Form.Item label="管理员账号" name="username" rules={[{required: true, message: '请输入管理员账号'}]}>
          <Input size="large" placeholder="请输入账号" autoComplete="username" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{required: true, message: '请输入密码'}]}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="请输入密码" autoComplete="current-password" />
        </Form.Item>
        <Button htmlType="submit" type="primary" size="large" block loading={loading}>登录</Button>
      </Form>}
      <Typography.Paragraph type="secondary" style={{fontSize: 12, margin: '20px 0 0'}}>管理员会话使用 HttpOnly Cookie，写操作同时校验 CSRF；生产环境默认强制 MFA。</Typography.Paragraph>
    </Card>
  </div>;
}
