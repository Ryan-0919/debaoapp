import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, UploadOutlined} from '@ant-design/icons';
import {Button, DatePicker, Drawer, Form, Image, Input, InputNumber, Popconfirm, Select, Space, Table, Tag, Typography, Upload, message} from 'antd';
import zhCNDatePicker from 'antd/es/date-picker/locale/zh_CN';
import type {UploadProps} from 'antd';
import dayjs, {type Dayjs} from 'dayjs';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  getAdminCommunityPosts,
  getAdminCourses,
  getAdminProducts,
  updateAdminBanner,
  type AdminBanner,
  type AdminCommunityPost,
  type AdminCourse,
  type AdminProduct,
} from '@/services/api';

type TargetType = 'page' | 'product' | 'course' | 'post' | 'h5';
type FormValues = {
  title: string;
  imageUrl: string;
  targetType: TargetType;
  targetId?: string;
  h5Url?: string;
  position: string;
  sortOrder: number;
  requiresLogin: boolean;
  startsAt: Dayjs;
  endsAt?: Dayjs;
};

const BANNER_WIDTH = 640;
const BANNER_HEIGHT = 320;
const BANNER_MAX_BYTES = 1.5 * 1024 * 1024;
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const API_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const BANNER_TIME_MAX = dayjs('2099-12-31 23:59:59');
const DATE_TIME_MASK = {format: DATE_TIME_FORMAT, type: 'mask' as const};

function readImageFile(file: File): Promise<{dataUrl: string; width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const preview = new window.Image();
      preview.onerror = () => reject(new Error('无法识别图片'));
      preview.onload = () => resolve({dataUrl, width: preview.naturalWidth, height: preview.naturalHeight});
      preview.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

const pageOptions = [
  {value: '/home', label: '首页'},
  {value: '/questions', label: '题库'},
  {value: '/mall', label: '商城'},
  {value: '/courses', label: '课程'},
  {value: '/profile', label: '我的'},
  {value: '/learning/records', label: '学习记录'},
  {value: '/learning/plans', label: '学习计划'},
  {value: '/grading', label: '批改服务'},
  {value: '/notifications', label: '消息通知'},
  {value: '/law-search', label: '法条检索'},
];

const positionOptions = [
  {value: 'home-primary', label: '首页主 Banner'},
  {value: 'home-secondary', label: '首页次 Banner'},
  {value: 'home-promo', label: '首页活动位'},
];

function targetParts(target: string): Pick<FormValues, 'targetType' | 'targetId' | 'h5Url'> {
  if (/^https?:\/\//i.test(target)) return {targetType: 'h5', h5Url: target};
  const product = target.match(/^\/(?:products|commerce\/products)\/([^/]+)$/);
  if (product) return {targetType: 'product', targetId: decodeURIComponent(product[1])};
  const course = target.match(/^\/courses\/([^/]+)$/);
  if (course) return {targetType: 'course', targetId: decodeURIComponent(course[1])};
  const post = target.match(/^\/(?:forum\/posts|community\/posts)\/([^/]+)$/);
  if (post) return {targetType: 'post', targetId: decodeURIComponent(post[1])};
  return {targetType: 'page', targetId: target};
}

function statusOf(item: AdminBanner) {
  const now = Date.now();
  if (item.startsAt && Date.parse(item.startsAt) > now) return {label: '未开始', color: 'gold'};
  if (item.endsAt && Date.parse(item.endsAt) <= now) return {label: '已结束', color: 'default'};
  return {label: '展示中', color: 'green'};
}

function targetLabel(target: string, products: AdminProduct[], courses: AdminCourse[], posts: AdminCommunityPost[]) {
  const parts = targetParts(target);
  if (parts.targetType === 'h5') return '活动 H5：' + parts.h5Url;
  if (parts.targetType === 'product') return '商品：' + (products.find(item => item.id === parts.targetId)?.name ?? parts.targetId);
  if (parts.targetType === 'course') return '课程：' + (courses.find(item => item.id === parts.targetId)?.title ?? parts.targetId);
  if (parts.targetType === 'post') return '帖子：' + (posts.find(item => item.id === parts.targetId)?.title ?? parts.targetId);
  return pageOptions.find(item => item.value === parts.targetId)?.label ?? parts.targetId;
}

export default function Banners() {
  const [items, setItems] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [posts, setPosts] = useState<AdminCommunityPost[]>([]);
  const [imageSize, setImageSize] = useState<{width: number; height: number} | null>(null);
  const targetType = Form.useWatch('targetType', form);
  const imageUrl = Form.useWatch('imageUrl', form);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await getAdminBanners()).items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载 Banner 失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void Promise.all([getAdminProducts(), getAdminCourses(), getAdminCommunityPosts()])
      .then(([productResult, courseResult, postResult]) => {
        setProducts(productResult.items);
        setCourses(courseResult.items);
        setPosts(postResult.items);
      })
      .catch(error => message.error(error instanceof Error ? error.message : '加载跳转内容失败'));
  }, [load]);

  const productOptions = useMemo(() => products.map(item => ({value: item.id, label: item.name})), [products]);
  const courseOptions = useMemo(() => courses.map(item => ({value: item.id, label: item.title})), [courses]);
  const postOptions = useMemo(() => posts.map(item => ({value: item.id, label: item.title})), [posts]);

  const closeDrawer = () => {
    setOpen(false);
    setEditing(null);
    setImageSize(null);
    form.resetFields();
  };

  const openCreate = () => {
    setEditing(null);
    setImageSize(null);
    form.resetFields();
    form.setFieldsValue({targetType: 'page', position: 'home-primary', sortOrder: 0, requiresLogin: false});
    setOpen(true);
  };

  const openEdit = (item: AdminBanner) => {
    setEditing(item);
    setImageSize(null);
    form.setFieldsValue({
      title: item.title,
      imageUrl: item.imageUrl,
      position: item.position ?? 'home-primary',
      sortOrder: item.sortOrder ?? 0,
      requiresLogin: item.requiresLogin ?? false,
      startsAt: dayjs(item.startsAt),
      endsAt: item.endsAt ? dayjs(item.endsAt) : undefined,
      ...targetParts(item.target),
    });
    setOpen(true);
  };

  const submit = async (values: FormValues) => {
    let target = values.h5Url?.trim() ?? '';
    if (values.targetType !== 'h5') {
      if (!values.targetId) {
        message.error('请选择具体跳转内容');
        return;
      }
      target = values.targetType === 'product'
        ? '/products/' + encodeURIComponent(values.targetId)
        : values.targetType === 'course'
          ? '/courses/' + encodeURIComponent(values.targetId)
          : values.targetType === 'post'
            ? '/forum/posts/' + encodeURIComponent(values.targetId)
            : values.targetId;
    }
    if (!target) {
      message.error('请选择跳转页面或填写 H5 地址');
      return;
    }
    const payload = {
      title: values.title.trim(),
      imageUrl: values.imageUrl,
      target,
      position: values.position,
      sortOrder: Number(values.sortOrder ?? 0),
      requiresLogin: values.requiresLogin === true,
      startsAt: values.startsAt.format(API_TIME_FORMAT),
      endsAt: values.endsAt?.format(API_TIME_FORMAT),
    };
    try {
      if (editing) await updateAdminBanner(editing.id, payload);
      else await createAdminBanner(payload);
      message.success(editing ? 'Banner 已更新' : 'Banner 已创建');
      closeDrawer();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存 Banner 失败');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteAdminBanner(id);
      message.success('Banner 已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除 Banner 失败');
    }
  };

  const upload: UploadProps = {
    accept: 'image/png,image/jpeg,image/webp',
    maxCount: 1,
    showUploadList: false,
    beforeUpload: async file => {
      if (file.size > BANNER_MAX_BYTES) {
        message.error('图片不能超过 1.5MB');
        return Upload.LIST_IGNORE;
      }
      try {
        const image = await readImageFile(file as File);
        setImageSize({width: image.width, height: image.height});
        if (image.width !== BANNER_WIDTH || image.height !== BANNER_HEIGHT) {
          message.warning(`推荐尺寸为 ${BANNER_WIDTH} × ${BANNER_HEIGHT} px（2:1），当前为 ${image.width} × ${image.height} px，App 展示时会按 2:1 裁切`);
        }
        form.setFieldValue('imageUrl', image.dataUrl);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '无法读取图片');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
  };

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>Banner 管理</Typography.Title>
          <Typography.Text type="secondary">上传图片，选择具体业务内容，设置展示位置和时间。</Typography.Text>
        </div>
        <Space>
          <Button loading={loading} icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建 Banner</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{x: 1100}}
        columns={[
          {title: '标题', dataIndex: 'title', width: 180},
          {title: '状态', render: (_: unknown, item: AdminBanner) => { const status = statusOf(item); return <Tag color={status.color}>{status.label}</Tag>; }},
          {title: '展示位置', dataIndex: 'position', render: (value: string) => positionOptions.find(item => item.value === value)?.label ?? '首页主 Banner'},
          {title: '跳转内容', render: (_: unknown, item: AdminBanner) => <Typography.Text ellipsis={{tooltip: targetLabel(item.target, products, courses, posts)}} style={{maxWidth: 260, display: 'inline-block'}}>{targetLabel(item.target, products, courses, posts)}</Typography.Text>},
          {title: '排序', dataIndex: 'sortOrder', render: (value: number) => value ?? 0},
          {title: '展示时间', render: (_: unknown, item: AdminBanner) => dayjs(item.startsAt).format(DATE_TIME_FORMAT) + (item.endsAt ? ' 至 ' + dayjs(item.endsAt).format(DATE_TIME_FORMAT) : ' 起')},
          {title: '登录要求', dataIndex: 'requiresLogin', render: (value: boolean) => value ? '需要登录' : '无需登录'},
          {title: '操作', fixed: 'right', render: (_: unknown, item: AdminBanner) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(item)}>编辑</Button><Popconfirm title="确认删除这个 Banner？" onConfirm={() => void remove(item.id)}><Button danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></Space>},
        ]}
      />
      <Drawer title={editing ? '编辑 Banner' : '新建 Banner'} open={open} onClose={closeDrawer} width={540} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="title" label="标题" rules={[{required: true, min: 2, message: '请输入至少 2 个字的标题'}]}><Input placeholder="例如：2026 法考全程班" /></Form.Item>
          <Form.Item name="imageUrl" label="Banner 图片" rules={[{required: true, message: '请选择 Banner 图片'}]}>
            <Space direction="vertical" size={8} style={{width: '100%'}}>
              <Upload {...upload}><Button icon={<UploadOutlined />}>选择图片</Button></Upload>
              <Typography.Text type="secondary">推荐尺寸：{BANNER_WIDTH} × {BANNER_HEIGHT} px（2:1）；支持 JPG、PNG、WebP，最大 1.5 MB。</Typography.Text>
              {imageSize && <Typography.Text type={imageSize.width === BANNER_WIDTH && imageSize.height === BANNER_HEIGHT ? 'success' : 'warning'}>当前图片：{imageSize.width} × {imageSize.height} px{imageSize.width === BANNER_WIDTH && imageSize.height === BANNER_HEIGHT ? '，尺寸符合' : '，展示时会按 2:1 裁切'}</Typography.Text>}
              {imageUrl && <Image src={imageUrl} width={320} height={160} onLoad={event => setImageSize({width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight})} style={{objectFit: 'cover', borderRadius: 8}} />}
            </Space>
          </Form.Item>
          <Form.Item name="targetType" label="跳转类型" rules={[{required: true, message: '请选择跳转类型'}]}><Select options={[{value: 'page', label: 'App 页面'}, {value: 'product', label: '具体商品'}, {value: 'course', label: '具体课程'}, {value: 'post', label: '具体帖子'}, {value: 'h5', label: '活动 H5'}]} /></Form.Item>
          {targetType === 'h5' ? <Form.Item name="h5Url" label="活动 H5 地址" rules={[{required: true, type: 'url', message: '请输入完整的 https:// H5 地址'}]}><Input placeholder="https://example.com/activity/2026" /></Form.Item> : <Form.Item name="targetId" label={targetType === 'product' ? '选择商品' : targetType === 'course' ? '选择课程' : targetType === 'post' ? '选择帖子' : '选择 App 页面'} rules={[{required: true, message: '请选择跳转内容'}]}><Select showSearch optionFilterProp="label" options={targetType === 'product' ? productOptions : targetType === 'course' ? courseOptions : targetType === 'post' ? postOptions : pageOptions} placeholder="请选择" /></Form.Item>}
          <Form.Item name="position" label="展示位置" rules={[{required: true}]}><Select options={positionOptions} /></Form.Item>
          <Form.Item name="sortOrder" label="排序值" extra="数字越小越靠前"><InputNumber min={0} max={9999} style={{width: '100%'}} /></Form.Item>
          <Form.Item name="requiresLogin" label="登录要求" rules={[{required: true}]}><Select options={[{value: false, label: '无需登录即可查看'}, {value: true, label: '需要登录后查看'}]} /></Form.Item>
          <Form.Item
            name="startsAt"
            label="展示开始时间"
            extra={`可在面板中滚动选择，也可直接输入年月日时分秒；最晚 ${BANNER_TIME_MAX.format(DATE_TIME_FORMAT)}`}
            rules={[
              {required: true, message: '请选择展示开始时间'},
              {validator: async (_, value?: Dayjs) => {
                if (!value) return;
                if (!value.isValid()) throw new Error('请输入有效的开始时间');
                if (value.isAfter(BANNER_TIME_MAX)) throw new Error(`开始时间不能晚于 ${BANNER_TIME_MAX.format(DATE_TIME_FORMAT)}`);
              }},
            ]}
          >
            <DatePicker
              locale={zhCNDatePicker}
              showTime={{format: 'HH:mm:ss', changeOnScroll: true}}
              format={DATE_TIME_MASK}
              maxDate={BANNER_TIME_MAX}
              needConfirm
              showNow
              placeholder="选择或输入年月日时分秒"
              style={{width: '100%'}}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(previous, current) => previous.startsAt !== current.startsAt}
          >
            {({getFieldValue}) => {
              const startsAt = getFieldValue('startsAt') as Dayjs | undefined;
              return (
                <Form.Item
                  name="endsAt"
                  label="展示结束时间"
                  extra={`留空表示长期展示；最晚 ${BANNER_TIME_MAX.format(DATE_TIME_FORMAT)}`}
                  rules={[
                    {validator: async (_, value?: Dayjs) => {
                      if (!value) return;
                      if (!value.isValid()) throw new Error('请输入有效的结束时间');
                      if (value.isAfter(BANNER_TIME_MAX)) throw new Error(`结束时间不能晚于 ${BANNER_TIME_MAX.format(DATE_TIME_FORMAT)}`);
                      if (startsAt?.isValid() && !value.isAfter(startsAt)) throw new Error('结束时间必须晚于开始时间');
                    }},
                  ]}
                >
                  <DatePicker
                    locale={zhCNDatePicker}
                    showTime={{format: 'HH:mm:ss', changeOnScroll: true}}
                    format={DATE_TIME_MASK}
                    minDate={startsAt?.isValid() ? startsAt : undefined}
                    maxDate={BANNER_TIME_MAX}
                    needConfirm
                    allowClear
                    placeholder="选择或输入；留空为长期展示"
                    style={{width: '100%'}}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Button type="primary" htmlType="submit" block>{editing ? '保存修改' : '创建 Banner'}</Button>
        </Form>
      </Drawer>
    </Space>
  );
}
