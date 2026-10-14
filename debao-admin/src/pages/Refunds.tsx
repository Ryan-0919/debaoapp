import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {ReloadOutlined, SafetyCertificateOutlined} from '@ant-design/icons';
import {useCallback, useEffect, useState} from 'react';
import {
  approveAdminRefund,
  getAdminRefunds,
  rejectAdminRefund,
  reviewAdminRefund,
  type AdminRefund,
} from '@/services/api';

type ActionState = {kind: 'review' | 'reject'; refund: AdminRefund} | undefined;

const stageLabel: Record<string, string> = {
  required: '待第一人复核',
  first_reviewed: '待第二人复核',
  ready: '双人复核完成',
  not_required: '无需双人复核',
};

function statusTag(status?: string) {
  if (status === 'completed') return <Tag color="green">已完成</Tag>;
  if (status === 'rejected') return <Tag color="red">已拒绝</Tag>;
  if (status === 'reviewing') return <Tag color="blue">复核中</Tag>;
  return <Tag color="gold">待审核</Tag>;
}

export default function Refunds() {
  const [items, setItems] = useState<AdminRefund[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<ActionState>();
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm<{reason: string}>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getAdminRefunds();
      setItems(result.items);
      setTotal(result.total);
    } catch (loadError) {
      const text = loadError instanceof Error ? loadError.message : '加载退款申请失败';
      setItems([]);
      setTotal(0);
      setError(text);
      message.error(text);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitAction = async ({reason}: {reason: string}) => {
    if (!action?.refund.id) return;
    setActionLoading(true);
    try {
      if (action.kind === 'review') {
        await reviewAdminRefund(action.refund.id, reason.trim());
        message.success('复核记录已保存');
      } else {
        await rejectAdminRefund(action.refund.id, reason.trim());
        message.success('退款申请已拒绝');
      }
      setAction(undefined);
      form.resetFields();
      await load();
    } catch (actionError) {
      message.error(actionError instanceof Error ? actionError.message : '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const approve = async (refund: AdminRefund) => {
    try {
      await approveAdminRefund(refund.id);
      message.success('退款已提交 Provider 并完成');
      await load();
    } catch (approveError) {
      message.error(approveError instanceof Error ? approveError.message : '退款审批失败');
    }
  };

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>退款售后</Typography.Title>
          <Typography.Text type="secondary">高金额退款必须由两位不同管理员复核，复核完成后才能调用 Provider。</Typography.Text>
        </div>
        <Button loading={loading} icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
      </div>
      {error && <Alert type="error" showIcon message="退款数据加载失败" description={error} action={<Button size="small" onClick={() => void load()}>重试</Button>} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          {title: '退款 ID', dataIndex: 'id', ellipsis: true},
          {title: '订单号', dataIndex: 'orderId', ellipsis: true},
          {title: '金额', dataIndex: 'amount', render: (value: unknown) => value == null ? '-' : `¥${Number(value).toFixed(2)}`},
          {title: '原因', dataIndex: 'reason', ellipsis: true},
          {
            title: '状态',
            dataIndex: 'status',
            render: (value: unknown) => statusTag(typeof value === 'string' ? value : undefined),
          },
          {
            title: '复核状态',
            render: (_: unknown, record: AdminRefund) => record.dualReviewRequired
              ? <Space direction="vertical" size={0}><Tag color={record.readyForApproval ? 'green' : 'orange'}>{stageLabel[record.reviewStage ?? 'required'] ?? record.reviewStage}</Tag>{record.reviewReason && <Typography.Text type="secondary">{record.reviewReason}</Typography.Text>}</Space>
              : <Tag>无需双人复核</Tag>,
          },
          {
            title: '操作',
            render: (_: unknown, record: AdminRefund) => {
              if (record.status === 'completed' || record.status === 'rejected') return <Typography.Text type="secondary">已结束</Typography.Text>;
              const needsReview = Boolean(record.dualReviewRequired);
              const ready = !needsReview || Boolean(record.readyForApproval || record.reviewStage === 'ready');
              return (
                <Space wrap>
                  {needsReview && !ready && <Button size="small" onClick={() => { setAction({kind: 'review', refund: record}); form.resetFields(); }}>记录复核</Button>}
                  <Popconfirm title="确认通过并提交退款？" description={needsReview && !ready ? '需先完成双人复核' : undefined} okText="确认" cancelText="取消" onConfirm={() => void approve(record)} disabled={!ready}>
                    <Button size="small" type="primary" danger icon={<SafetyCertificateOutlined />} disabled={!ready}>审核通过</Button>
                  </Popconfirm>
                  <Button size="small" danger onClick={() => { setAction({kind: 'reject', refund: record}); form.resetFields(); }}>拒绝</Button>
                </Space>
              );
            },
          },
        ]}
        pagination={{pageSize: 20, total}}
      />
      <Modal
        title={action?.kind === 'review' ? '记录退款复核' : '拒绝退款申请'}
        open={Boolean(action)}
        confirmLoading={actionLoading}
        okText="提交"
        cancelText="取消"
        onCancel={() => { if (!actionLoading) { setAction(undefined); form.resetFields(); } }}
        onOk={() => void form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submitAction} preserve={false}>
          <Form.Item name="reason" label={action?.kind === 'review' ? '复核说明' : '拒绝原因'} rules={[{required: true, min: 2, message: '请填写至少 2 个字'}]}>
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="请输入原因，内容会写入审计记录" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
