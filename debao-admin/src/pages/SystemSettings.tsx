import {ReloadOutlined, SaveOutlined} from '@ant-design/icons';
import {Alert, Button, Descriptions, Form, InputNumber, Space, Spin, Tag, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {getAdminSettings, updateAdminSettings, type AdminSettings} from '@/services/api';

type SettingsValues = {refundReviewThreshold: number};

export default function SystemSettings() {
  const [data, setData] = useState<AdminSettings>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [form] = Form.useForm<SettingsValues>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const next = await getAdminSettings();
      setData(next);
      form.setFieldsValue({refundReviewThreshold: next.refundReviewThreshold});
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : '加载系统配置失败';
      setData(undefined);
      setError(text);
      message.error(text);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (values: SettingsValues) => {
    setSaving(true);
    try {
      const next = await updateAdminSettings({refundReviewThreshold: values.refundReviewThreshold});
      setData(next);
      form.setFieldsValue({refundReviewThreshold: next.refundReviewThreshold});
      message.success('退款复核阈值已更新并写入审计日志');
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : '保存系统配置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>系统配置</Typography.Title>
          <Typography.Text type="secondary">非密钥配置可由具备权限的管理员调整，所有变更都会写入审计日志。</Typography.Text>
        </div>
        <Button loading={loading} icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
      </div>
      {error && <Alert type="error" showIcon message="系统配置加载失败" description={error} action={<Button size="small" onClick={() => void load()}>重试</Button>} />}
      {loading && !data && <Spin />}
      {data && <>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="考试年份">{data.examYear}</Descriptions.Item>
          <Descriptions.Item label="当前退款复核金额阈值">¥{data.refundReviewThreshold}</Descriptions.Item>
          <Descriptions.Item label="功能开关"><Space>{Object.entries(data.featureFlags).map(([key, enabled]) => <Tag key={key} color={enabled ? 'green' : 'default'}>{key}：{enabled ? '开启' : '关闭'}</Tag>)}</Space></Descriptions.Item>
        </Descriptions>
        <Form form={form} layout="inline" onFinish={save} initialValues={{refundReviewThreshold: data.refundReviewThreshold}}>
          <Form.Item name="refundReviewThreshold" label="退款复核阈值（元）" rules={[{required: true, message: '请输入阈值'}, {type: 'number', min: 0, max: 1_000_000_000, message: '阈值必须在 0 到 1000000000 之间'}]}>
            <InputNumber min={0} max={1_000_000_000} precision={2} style={{width: 220}} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>保存阈值</Button>
        </Form>
      </>}
    </Space>
  );
}
