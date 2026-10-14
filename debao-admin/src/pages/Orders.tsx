import {EyeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Button, Descriptions, Drawer, Empty, Space, Table, Tag, Timeline, Typography, message} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {getAdminOrder, getAdminOrders, type AdminOrder, type AdminOrderDetail} from '@/services/api';

const statusColor: Record<string, string> = {paid: 'green', pending: 'gold', closed: 'default'};
const statusLabels: Record<string, string> = {paid: '已支付', pending: '待支付', closed: '已关闭'};
const eventLabels: Record<string, string> = {created: '订单创建', paid: '支付确认', entitlement_granted: '权益已发放'};

export default function Orders() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminOrderDetail>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const result = await getAdminOrders(); setItems(result.items); setTotal(result.total); }
    catch (error) { message.error(error instanceof Error ? error.message : '加载订单失败'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const openDetail = async (order: AdminOrder) => {
    setDetailOpen(true); setDetailLoading(true);
    try { setSelected(await getAdminOrder(order.id)); }
    catch (error) { message.error(error instanceof Error ? error.message : '加载订单详情失败'); }
    finally { setDetailLoading(false); }
  };

  return <Space direction="vertical" size={18} style={{display: 'flex'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div><Typography.Title level={4} style={{margin: 0}}>订单管理</Typography.Title><Typography.Text type="secondary">共 {total} 笔订单 · 金额和支付状态仅支持查看</Typography.Text></div><Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button></div>
    <Table rowKey="id" loading={loading} dataSource={items} scroll={{x: 980}} columns={[{title: '订单号', dataIndex: 'id'}, {title: '用户', dataIndex: 'userId', render: value => String(value ?? '-')}, {title: '商品', dataIndex: 'productName'}, {title: '金额', dataIndex: 'amount', render: value => `¥${Number(value ?? 0).toFixed(2)}`}, {title: '状态', dataIndex: 'status', render: value => <Tag color={statusColor[String(value)] ?? 'gold'}>{statusLabels[String(value)] ?? '未知'}</Tag>}, {title: '创建时间', dataIndex: 'createdAt'}, {title: '操作', render: (_: unknown, record: AdminOrder) => <Button type="link" icon={<EyeOutlined />} onClick={() => void openDetail(record)}>查看详情</Button>}]} pagination={{pageSize: 20, total}} />
    <Drawer title={selected ? `订单详情：${selected.id}` : '订单详情'} width={620} open={detailOpen} onClose={() => setDetailOpen(false)} loading={detailLoading} destroyOnClose>
      {selected ? <Space direction="vertical" size={20} style={{display: 'flex'}}><Descriptions bordered size="small" column={1}><Descriptions.Item label="用户">{selected.userId ?? '-'}</Descriptions.Item><Descriptions.Item label="商品">{selected.productName}</Descriptions.Item><Descriptions.Item label="金额">¥{selected.amount.toFixed(2)}</Descriptions.Item><Descriptions.Item label="状态"><Tag color={statusColor[selected.status] ?? 'gold'}>{statusLabels[selected.status] ?? '未知'}</Tag></Descriptions.Item><Descriptions.Item label="支付 Provider">{selected.payment.provider}</Descriptions.Item><Descriptions.Item label="支付状态">{statusLabels[selected.payment.status] ?? selected.payment.status}</Descriptions.Item></Descriptions><Typography.Title level={5} style={{margin: 0}}>状态时间线</Typography.Title><Timeline items={selected.timeline.map(event => ({children: <span><strong>{eventLabels[event.event] ?? event.event}</strong><br /><Typography.Text type="secondary">{event.at}</Typography.Text></span>}))} /><Typography.Title level={5} style={{margin: 0}}>退款记录</Typography.Title>{selected.refunds.length ? <Table size="small" rowKey="id" pagination={false} dataSource={selected.refunds} columns={[{title: '退款 ID', dataIndex: 'id'}, {title: '金额', dataIndex: 'amount', render: value => `¥${Number(value ?? 0).toFixed(2)}`}, {title: '状态', dataIndex: 'status'}, {title: '原因', dataIndex: 'reason'}]} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无退款记录" />}</Space> : <Empty description="请选择订单" />}
    </Drawer>
  </Space>;
}
