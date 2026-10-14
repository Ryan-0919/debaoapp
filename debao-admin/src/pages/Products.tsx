import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import {useCallback, useEffect, useState} from 'react';
import {
  createAdminProduct,
  getAdminProductSkus,
  getAdminProducts,
  updateAdminProduct,
  updateAdminProductSku,
  type AdminProduct,
  type AdminProductSku,
} from '@/services/api';

export default function Products() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct>();
  const [form] = Form.useForm();

  const [skuProduct, setSkuProduct] = useState<AdminProduct>();
  const [skuItems, setSkuItems] = useState<AdminProductSku[]>([]);
  const [skuLoading, setSkuLoading] = useState(false);
  const [skuError, setSkuError] = useState<string>();
  const [skuEditing, setSkuEditing] = useState<AdminProductSku>();
  const [skuForm] = Form.useForm<{stock: number; status: 'active' | 'disabled'}>();
  const [skuOpen, setSkuOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminProducts();
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载商品失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadSkus = useCallback(async (productId: string) => {
    setSkuLoading(true);
    setSkuError(undefined);
    try {
      const result = await getAdminProductSkus(productId);
      setSkuItems(result.items);
    } catch (error) {
      const text = error instanceof Error ? error.message : '加载 SKU 失败';
      setSkuError(text);
      message.error(text);
    } finally {
      setSkuLoading(false);
    }
  }, []);

  const openSkus = (product: AdminProduct) => {
    setSkuProduct(product);
    setSkuEditing(undefined);
    skuForm.resetFields();
    setSkuItems([]);
    setSkuOpen(true);
    void loadSkus(product.id);
  };

  const submit = async (values: {name: string; category: string; price: number; originalPrice: number; benefits?: string; priceReason?: string}) => {
    try {
      const input = {...values, benefits: values.benefits?.split('\n').map(item => item.trim()).filter(Boolean)};
      if (editing) await updateAdminProduct(editing.id, {...input, updatedAt: editing.updatedAt});
      else await createAdminProduct(input);
      message.success('商品草稿已保存');
      setOpen(false);
      setEditing(undefined);
      form.resetFields();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存商品失败');
    }
  };

  const submitSku = async (values: {stock: number; status: 'active' | 'disabled'}) => {
    if (!skuProduct || !skuEditing) return;
    try {
      await updateAdminProductSku(skuProduct.id, skuEditing.id, values);
      message.success('SKU 库存状态已更新');
      setSkuEditing(undefined);
      skuForm.resetFields();
      await loadSkus(skuProduct.id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新 SKU 失败');
    }
  };

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>商品管理</Typography.Title>
          <Typography.Text type="secondary">共 {total} 个商品 · 修改价格必须填写原因并生成历史记录</Typography.Text>
        </div>
        <Space>
          <Button loading={loading} icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); form.resetFields(); setOpen(true); }}>新建商品</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          {title: '商品', dataIndex: 'name'},
          {title: '分类', dataIndex: 'category'},
          {title: '价格', dataIndex: 'price', render: (value: unknown) => `¥${Number(value).toFixed(2)}`},
          {title: '销量', dataIndex: 'sold'},
          {title: '状态', dataIndex: 'status', render: (value: unknown) => <Tag color={value === 'on_sale' ? 'green' : 'gold'}>{value === 'on_sale' ? '在售' : '草稿'}</Tag>},
          {
            title: '操作',
            render: (_: unknown, record: AdminProduct) => (
              <Space>
                <Button type="link" onClick={() => openSkus(record)}>SKU/库存</Button>
                <Button type="link" onClick={() => { setEditing(record); form.setFieldsValue({...record, benefits: record.benefits?.join('\n')}); setOpen(true); }}>编辑</Button>
              </Space>
            ),
          },
        ]}
        pagination={{pageSize: 20, total}}
      />
      <Drawer title={editing ? '编辑商品' : '新建商品'} width={480} open={open} onClose={() => setOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="商品名称" rules={[{required: true, min: 2}]}><Input /></Form.Item>
          <Form.Item name="category" label="商品分类" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="price" label="售价" rules={[{required: true}]}><InputNumber min={0} precision={2} style={{width: '100%'}} /></Form.Item>
          <Form.Item name="originalPrice" label="原价" rules={[{required: true}]}><InputNumber min={0} precision={2} style={{width: '100%'}} /></Form.Item>
          {editing && <Form.Item name="priceReason" label="价格变更原因"><Input.TextArea rows={3} /></Form.Item>}
          <Form.Item name="benefits" label="权益说明（每行一项）"><Input.TextArea rows={4} /></Form.Item>
          <Button type="primary" htmlType="submit" block>保存草稿</Button>
        </Form>
      </Drawer>
      <Drawer title={`${skuProduct?.name ?? '商品'} · SKU/库存`} width={720} open={skuOpen} onClose={() => { setSkuOpen(false); setSkuEditing(undefined); }}>
        <Space direction="vertical" size={16} style={{display: 'flex'}}>
          {skuError && <Alert type="error" showIcon message="SKU 数据加载失败" description={skuError} action={<Button size="small" onClick={() => skuProduct && void loadSkus(skuProduct.id)}>重试</Button>} />}
          <Table<AdminProductSku>
            rowKey="id"
            size="small"
            loading={skuLoading}
            dataSource={skuItems}
            columns={[
              {title: 'SKU', dataIndex: 'name'},
              {title: '价格', dataIndex: 'price', render: (value: number) => `¥${Number(value).toFixed(2)}`},
              {title: '库存', dataIndex: 'stock'},
              {title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>},
              {title: '属性', dataIndex: 'attributes', render: (value: Record<string, string>) => Object.keys(value ?? {}).length ? JSON.stringify(value) : '-'},
              {title: '操作', render: (_: unknown, record: AdminProductSku) => <Button type="link" onClick={() => { setSkuEditing(record); skuForm.setFieldsValue({stock: record.stock, status: record.status === 'disabled' ? 'disabled' : 'active'}); }}>编辑库存</Button>},
            ]}
            pagination={false}
          />
          {skuEditing && <Form form={skuForm} layout="inline" onFinish={submitSku} initialValues={{stock: skuEditing.stock, status: skuEditing.status === 'disabled' ? 'disabled' : 'active'}}>
            <Form.Item label="库存" name="stock" rules={[{required: true, type: 'number', min: 0}]}><InputNumber min={0} precision={0} /></Form.Item>
            <Form.Item label="状态" name="status" rules={[{required: true}]}><Select style={{width: 110}} options={[{label: '启用', value: 'active'}, {label: '停用', value: 'disabled'}]} /></Form.Item>
            <Form.Item><Space><Button type="primary" htmlType="submit">保存</Button><Button onClick={() => { setSkuEditing(undefined); skuForm.resetFields(); }}>取消</Button></Space></Form.Item>
          </Form>}
        </Space>
      </Drawer>
    </Space>
  );
}
