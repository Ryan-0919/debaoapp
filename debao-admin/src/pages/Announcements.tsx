import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  PushpinFilled,
  ReloadOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import zhCNDatePicker from 'antd/es/date-picker/locale/zh_CN';
import type {DefaultOptionType} from 'antd/es/select';
import dayjs, {type Dayjs} from 'dayjs';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncementStats,
  getAdminAnnouncements,
  getAdminCommunityPosts,
  getAdminCourses,
  getAdminProducts,
  getCurrentAdmin,
  publishAdminAnnouncement,
  updateAdminAnnouncement,
  withdrawAdminAnnouncement,
  type AdminAnnouncement,
  type AdminAnnouncementStats,
  type AdminAnnouncementStatus,
  type AdminCommunityPost,
  type AdminCourse,
  type AdminProduct,
} from '@/services/api';

type TargetType = 'detail' | 'page' | 'product' | 'course' | 'post' | 'h5';
type FormValues = {
  title: string;
  body: string;
  isPinned: boolean;
  audienceType: 'all' | 'exam_year';
  audienceValue?: string;
  targetType: TargetType;
  targetId?: string;
  h5Url?: string;
  startsAt: Dayjs;
  endsAt?: Dayjs;
  status: 'draft' | 'published';
};

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const API_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const ANNOUNCEMENT_TIME_MAX = dayjs('2099-12-31 23:59:59');
const DATE_TIME_MASK = {format: DATE_TIME_FORMAT, type: 'mask' as const};

const statusMeta: Record<AdminAnnouncementStatus, {label: string; color: string}> = {
  draft: {label: '草稿', color: 'default'},
  scheduled: {label: '定时中', color: 'gold'},
  published: {label: '展示中', color: 'green'},
  expired: {label: '已结束', color: 'default'},
  withdrawn: {label: '已撤回', color: 'red'},
};

const pageOptionGroups = [
  {label: '主导航页面', options: [
    {value: '/home', label: '首页'},
    {value: '/questions', label: '题库首页'},
    {value: '/mall', label: '商城首页'},
    {value: '/courses', label: '课程首页'},
    {value: '/profile', label: '我的'},
  ]},
  {label: '学习与工具', options: [
    {value: '/learning/records', label: '学习记录'},
    {value: '/learning/plans', label: '学习计划'},
    {value: '/grading', label: '批改服务'},
    {value: '/notifications', label: '消息通知'},
    {value: '/law-search', label: '法条检索'},
    {value: '/mistakes', label: '错题本'},
    {value: '/favorites', label: '收藏夹'},
    {value: '/ai-chat', label: 'AI 答疑'},
    {value: '/orders', label: '订单列表'},
  ]},
];
const pageOptions = pageOptionGroups.flatMap(group => group.options);

const targetTypeOptions = [
  {value: 'detail', label: '公告详情（默认）'},
  {value: 'page', label: 'App 页面'},
  {value: 'product', label: '具体商品'},
  {value: 'course', label: '具体课程'},
  {value: 'post', label: '具体帖子'},
  {value: 'h5', label: '活动 H5'},
];

const examYearOptions = Array.from({length: 6}, (_, index) => {
  const value = String(dayjs().year() + index);
  return {value, label: `${value} 年法考生`};
});

function targetParts(target?: string): Pick<FormValues, 'targetType' | 'targetId' | 'h5Url'> {
  if (!target || /^\/announcements\//.test(target)) return {targetType: 'detail'};
  if (/^https:\/\//i.test(target)) return {targetType: 'h5', h5Url: target};
  const product = target.match(/^\/(?:products|commerce\/products)\/([^/]+)$/);
  if (product) return {targetType: 'product', targetId: decodeURIComponent(product[1])};
  const course = target.match(/^\/courses\/([^/]+)$/);
  if (course) return {targetType: 'course', targetId: decodeURIComponent(course[1])};
  const post = target.match(/^\/(?:forum\/posts|community\/posts)\/([^/]+)$/);
  if (post) return {targetType: 'post', targetId: decodeURIComponent(post[1])};
  return {targetType: 'page', targetId: target};
}

function formatTime(value?: string) {
  if (!value) return '未设置';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : value;
}

function deliveryPeriod(item: AdminAnnouncement) {
  return `${formatTime(item.startsAt)} 起${item.endsAt ? `，至 ${formatTime(item.endsAt)}` : '，长期展示'}`;
}

function audienceLabel(item: AdminAnnouncement) {
  return item.audienceType === 'exam_year' ? `${item.audienceValue ?? '未指定'} 年法考生` : '全部用户';
}

function targetLabel(target: string | undefined, products: AdminProduct[], courses: AdminCourse[], posts: AdminCommunityPost[]) {
  const parts = targetParts(target);
  if (parts.targetType === 'detail') return '公告详情';
  if (parts.targetType === 'h5') return `活动 H5：${parts.h5Url}`;
  if (parts.targetType === 'product') return `商品：${products.find(item => item.id === parts.targetId)?.name ?? parts.targetId}`;
  if (parts.targetType === 'course') return `课程：${courses.find(item => item.id === parts.targetId)?.title ?? parts.targetId}`;
  if (parts.targetType === 'post') return `帖子：${posts.find(item => item.id === parts.targetId)?.title ?? parts.targetId}`;
  return pageOptions.find(item => item.value === parts.targetId)?.label ?? parts.targetId ?? 'App 页面';
}

export default function Announcements() {
  const [canWrite, setCanWrite] = useState(false);
  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [stats, setStats] = useState<AdminAnnouncementStats>({total: 0, draft: 0, scheduled: 0, published: 0, expired: 0, withdrawn: 0, reads: 0, audience: 0, readRate: 0});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [preview, setPreview] = useState<AdminAnnouncement | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<AdminAnnouncement | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminAnnouncementStatus | 'all'>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'exam_year' | 'any'>('any');
  const [pinnedFilter, setPinnedFilter] = useState<'any' | 'true' | 'false'>('any');
  const [loadError, setLoadError] = useState('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [posts, setPosts] = useState<AdminCommunityPost[]>([]);
  const [form] = Form.useForm<FormValues>();
  const [withdrawForm] = Form.useForm<{reason: string}>();
  const targetType = Form.useWatch('targetType', form);
  const audienceType = Form.useWatch('audienceType', form);
  const publishMode = Form.useWatch('status', form);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [list, summary] = await Promise.all([
        getAdminAnnouncements({
          keyword: search.trim() || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          audienceType: audienceFilter === 'any' ? undefined : audienceFilter,
          isPinned: pinnedFilter === 'any' ? undefined : pinnedFilter === 'true',
          page,
          pageSize,
        }),
        getAdminAnnouncementStats(),
      ]);
      setItems(list.items);
      setTotal(list.total);
      setStats(summary);
    } catch (error) {
      const text = error instanceof Error ? error.message : '加载公告失败';
      setLoadError(text);
      message.error(text);
    } finally {
      setLoading(false);
    }
  }, [audienceFilter, page, pageSize, pinnedFilter, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    getCurrentAdmin().then(admin => {
      if (!active) return;
      const permissions = new Set(admin.permissions);
      setCanWrite(permissions.has('*') || permissions.has('operations.announcements.write'));
    }).catch(() => { if (active) setCanWrite(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    void Promise.allSettled([getAdminProducts(), getAdminCourses(), getAdminCommunityPosts()]).then(results => {
      const failures: string[] = [];
      const [productResult, courseResult, postResult] = results;
      if (productResult.status === 'fulfilled') setProducts(productResult.value.items);
      else failures.push('商品');
      if (courseResult.status === 'fulfilled') setCourses(courseResult.value.items);
      else failures.push('课程');
      if (postResult.status === 'fulfilled') setPosts(postResult.value.items);
      else failures.push('帖子');
      if (failures.length) message.warning(`${failures.join('、')}跳转内容加载失败，可稍后刷新重试`);
    });
  }, []);

  const productOptions = useMemo(() => products.filter(item => !item.status || item.status === 'on_sale').map(item => ({value: item.id, label: item.name})), [products]);
  const courseOptions = useMemo(() => courses.filter(item => !item.status || item.status === 'published').map(item => ({value: item.id, label: item.title})), [courses]);
  const postOptions = useMemo(() => posts.filter(item => item.status === 'published' && !item.deletedAt).map(item => ({value: item.id, label: item.title})), [posts]);

  const closeDrawer = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({isPinned: false, audienceType: 'all', targetType: 'detail', status: 'draft', startsAt: dayjs()});
    setOpen(true);
  };

  const openEdit = (item: AdminAnnouncement) => {
    setEditing(item);
    form.resetFields();
    form.setFieldsValue({
      title: item.title,
      body: item.body,
      isPinned: item.isPinned,
      audienceType: item.audienceType,
      audienceValue: item.audienceValue,
      startsAt: item.startsAt ? dayjs(item.startsAt) : dayjs(),
      endsAt: item.endsAt ? dayjs(item.endsAt) : undefined,
      status: 'draft',
      ...targetParts(item.deepLink),
    });
    setOpen(true);
  };

  const buildDeepLink = (values: FormValues) => {
    if (values.targetType === 'detail') return undefined;
    if (values.targetType === 'h5') return values.h5Url?.trim();
    if (!values.targetId) return undefined;
    if (values.targetType === 'product') return `/products/${encodeURIComponent(values.targetId)}`;
    if (values.targetType === 'course') return `/courses/${encodeURIComponent(values.targetId)}`;
    if (values.targetType === 'post') return `/forum/posts/${encodeURIComponent(values.targetId)}`;
    return values.targetId;
  };

  const submit = async (values: FormValues) => {
    setSubmitting(true);
    const payload = {
      title: values.title.trim(),
      body: values.body.trim(),
      isPinned: values.isPinned === true,
      audienceType: values.audienceType,
      audienceValue: values.audienceType === 'exam_year' ? values.audienceValue : undefined,
      deepLink: buildDeepLink(values) ?? null,
      startsAt: values.startsAt.format(API_TIME_FORMAT),
      endsAt: values.endsAt ? values.endsAt.format(API_TIME_FORMAT) : null,
    };
    try {
      if (editing) {
        await updateAdminAnnouncement(editing.id, payload);
        message.success('公告已更新');
      } else {
        const result = await createAdminAnnouncement({...payload, status: values.status});
        message.success(result.status === 'draft' ? '公告草稿已保存' : result.status === 'scheduled' ? '公告已设置定时发布' : '公告已发布');
      }
      closeDrawer();
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存公告失败');
    } finally {
      setSubmitting(false);
    }
  };

  const publish = (item: AdminAnnouncement, publishNow: boolean) => {
    const scheduledTime = item.startsAt && dayjs(item.startsAt).isAfter(dayjs()) ? formatTime(item.startsAt) : undefined;
    Modal.confirm({
      title: publishNow ? '立即发布这条公告？' : scheduledTime ? '确认定时发布？' : '发布这条公告？',
      content: publishNow ? '发布后会立即对目标用户可见。' : scheduledTime ? `公告将在 ${scheduledTime} 自动对目标用户展示。` : '发布后会立即对目标用户可见。',
      okText: publishNow ? '立即发布' : '确认发布',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await publishAdminAnnouncement(item.id, publishNow);
          message.success(result.status === 'scheduled' ? '已进入定时发布队列' : '公告已发布');
          await load();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '发布公告失败');
          throw error;
        }
      },
    });
  };

  const withdraw = async () => {
    if (!withdrawTarget) return;
    try {
      const {reason} = await withdrawForm.validateFields();
      setSubmitting(true);
      await withdrawAdminAnnouncement(withdrawTarget.id, reason.trim());
      message.success('公告已撤回，App 端将不再展示');
      setWithdrawTarget(null);
      withdrawForm.resetFields();
      await load();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error(error instanceof Error ? error.message : '撤回公告失败');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: AdminAnnouncement) => {
    try {
      await deleteAdminAnnouncement(item.id);
      message.success('公告草稿已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除公告失败');
    }
  };

  const targetSelectOptions: DefaultOptionType[] = targetType === 'product' ? productOptions : targetType === 'course' ? courseOptions : targetType === 'post' ? postOptions : pageOptionGroups;

  return (
    <Space direction="vertical" size={18} style={{display: 'flex'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap'}}>
        <div>
          <Typography.Title level={4} style={{margin: 0}}>公告管理</Typography.Title>
          <Typography.Text type="secondary">管理公告从草稿、定时、发布到撤回的完整生命周期，并查看触达效果。</Typography.Text>
        </div>
        <Space>
          <Button loading={loading} icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
          {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建公告</Button>}
        </Space>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={12} md={4}><Card size="small"><Statistic title="全部公告" value={stats.total} /></Card></Col>
        <Col xs={12} md={4}><Card size="small"><Statistic title="展示中" value={stats.published} valueStyle={{color: '#16a34a'}} /></Card></Col>
        <Col xs={12} md={4}><Card size="small"><Statistic title="定时中" value={stats.scheduled} valueStyle={{color: '#d97706'}} /></Card></Col>
        <Col xs={12} md={4}><Card size="small"><Statistic title="草稿" value={stats.draft} /></Card></Col>
        <Col xs={12} md={4}><Card size="small"><Statistic title="累计已读" value={stats.reads} /></Card></Col>
        <Col xs={12} md={4}><Card size="small"><Statistic title="综合已读率" value={stats.readRate} precision={1} suffix="%" /></Card></Col>
      </Row>

      {loadError && <Alert showIcon type="error" message="公告列表加载失败" description={loadError} action={<Button size="small" onClick={() => void load()}>重试</Button>} />}

      <Card size="small">
        <Space wrap>
          <Input.Search
            allowClear
            value={searchDraft}
            placeholder="搜索标题或正文"
            style={{width: 280}}
            onSearch={value => { setPage(1); setSearch(value); }}
            onChange={event => {
              const value = event.target.value;
              setSearchDraft(value);
              if (!value) { setPage(1); setSearch(''); }
            }}
          />
          <Select value={statusFilter} style={{width: 150}} onChange={value => { setPage(1); setStatusFilter(value); }} options={[{value: 'all', label: '全部状态'}, ...Object.entries(statusMeta).map(([value, meta]) => ({value, label: meta.label}))]} />
          <Select value={audienceFilter} style={{width: 150}} onChange={value => { setPage(1); setAudienceFilter(value); }} options={[{value: 'any', label: '全部受众'}, {value: 'all', label: '全部用户'}, {value: 'exam_year', label: '指定考试年份'}]} />
          <Select value={pinnedFilter} style={{width: 120}} onChange={value => { setPage(1); setPinnedFilter(value); }} options={[{value: 'any', label: '置顶不限'}, {value: 'true', label: '仅置顶'}, {value: 'false', label: '非置顶'}]} />
          <Typography.Text type="secondary">共 {total} 条</Typography.Text>
        </Space>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{x: 1280}}
        locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={loadError ? '请先重试加载公告' : search || statusFilter !== 'all' || audienceFilter !== 'any' || pinnedFilter !== 'any' ? '当前筛选条件下暂无公告' : '暂无公告'} />}}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: count => `共 ${count} 条`,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPageSize !== pageSize ? 1 : nextPage);
            setPageSize(nextPageSize);
          },
        }}
        columns={[
          {
            title: '公告内容',
            width: 280,
            render: (_: unknown, item: AdminAnnouncement) => (
              <div>
                <Space size={6}>
                  {item.isPinned && <PushpinFilled style={{color: '#ef4444'}} title="置顶" />}
                  <Typography.Text strong>{item.title}</Typography.Text>
                </Space>
                <Typography.Paragraph type="secondary" ellipsis={{rows: 2, tooltip: item.body}} style={{margin: '4px 0 0'}}>{item.body}</Typography.Paragraph>
              </div>
            ),
          },
          {title: '状态', width: 90, dataIndex: 'status', render: (status: AdminAnnouncementStatus) => <Tag color={statusMeta[status].color}>{statusMeta[status].label}</Tag>},
          {title: '投放受众', width: 130, render: (_: unknown, item: AdminAnnouncement) => <div>{audienceLabel(item)}<br /><Typography.Text type="secondary">预计 {item.audienceCount ?? 0} 人</Typography.Text></div>},
          {title: '展示时间', width: 220, render: (_: unknown, item: AdminAnnouncement) => deliveryPeriod(item)},
          {title: '点击后跳转', width: 190, render: (_: unknown, item: AdminAnnouncement) => <Typography.Text ellipsis={{tooltip: targetLabel(item.deepLink, products, courses, posts)}} style={{maxWidth: 180, display: 'inline-block'}}>{targetLabel(item.deepLink, products, courses, posts)}</Typography.Text>},
          {
            title: '触达效果',
            width: 130,
            render: (_: unknown, item: AdminAnnouncement) => item.status === 'draft' || item.status === 'scheduled'
              ? <Typography.Text type="secondary">尚未触达</Typography.Text>
              : <div>已读 {item.readCount ?? 0} 人（{(item.readRate ?? 0).toFixed(1)}%）<br /><Typography.Text type="secondary">关闭 {item.closedCount ?? 0} 人</Typography.Text></div>,
          },
          {title: '更新时间', width: 170, render: (_: unknown, item: AdminAnnouncement) => formatTime(item.updatedAt ?? item.createdAt)},
          {
            title: '操作',
            fixed: 'right',
            width: canWrite ? 300 : 100,
            render: (_: unknown, item: AdminAnnouncement) => (
              <Space size={4} wrap>
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setPreview(item)}>预览</Button>
                {canWrite && ['draft', 'scheduled'].includes(item.status) && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)}>编辑</Button>}
                {canWrite && item.status === 'draft' && <Button type="link" size="small" icon={<SendOutlined />} onClick={() => publish(item, false)}>{item.startsAt && dayjs(item.startsAt).isAfter(dayjs()) ? '确认定时' : '发布'}</Button>}
                {canWrite && item.status === 'scheduled' && <Button type="link" size="small" icon={<SendOutlined />} onClick={() => publish(item, true)}>立即发布</Button>}
                {canWrite && ['scheduled', 'published'].includes(item.status) && <Button danger type="link" size="small" icon={<StopOutlined />} onClick={() => { withdrawForm.resetFields(); setWithdrawTarget(item); }}>撤回</Button>}
                {canWrite && item.status === 'draft' && <Popconfirm title="确认删除这个公告草稿？" description="删除后无法恢复。" okText="删除" cancelText="取消" onConfirm={() => void remove(item)}><Button danger type="link" size="small" icon={<DeleteOutlined />}>删除</Button></Popconfirm>}
              </Space>
            ),
          },
        ]}
      />

      <Drawer title={editing ? '编辑公告' : '新建公告'} open={open} onClose={closeDrawer} width={620} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="title" label="公告标题" rules={[{required: true, min: 2, max: 160, message: '请输入 2 到 160 个字符的标题'}]}><Input maxLength={160} showCount placeholder="例如：2026 年法考报名提醒" /></Form.Item>
          <Form.Item name="body" label="公告正文" extra="支持换行，App 端会按当前段落展示。" rules={[{required: true, min: 2, max: 10000, message: '请输入 2 到 10000 个字符的正文'}]}><Input.TextArea rows={8} maxLength={10000} showCount placeholder="请输入需要告知用户的完整内容" /></Form.Item>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="isPinned" label="置顶展示（选填）" valuePropName="checked"><Switch checkedChildren="置顶" unCheckedChildren="普通" /></Form.Item></Col>
            <Col span={12}><Form.Item name="audienceType" label="投放受众" rules={[{required: true}]}><Select options={[{value: 'all', label: '全部用户'}, {value: 'exam_year', label: '指定考试年份'}]} onChange={() => form.setFieldValue('audienceValue', undefined)} /></Form.Item></Col>
          </Row>
          {audienceType === 'exam_year' && <Form.Item name="audienceValue" label="考试年份" rules={[{required: true, message: '请选择考试年份'}]}><Select options={examYearOptions} placeholder="请选择目标法考年份" /></Form.Item>}

          <Form.Item name="targetType" label="点击后跳转" rules={[{required: true, message: '请选择跳转类型'}]}><Select options={targetTypeOptions} onChange={() => { form.setFieldValue('targetId', undefined); form.setFieldValue('h5Url', undefined); }} /></Form.Item>
          {targetType === 'h5' && <Form.Item name="h5Url" label="活动 H5 地址" rules={[{required: true, validator: async (_, value?: string) => { if (!value || !/^https:\/\//i.test(value.trim())) throw new Error('请输入以 https:// 开头的完整 H5 地址'); }}]}><Input placeholder="https://example.com/activity/2026" /></Form.Item>}
          {targetType && !['detail', 'h5'].includes(targetType) && <Form.Item name="targetId" label={targetType === 'product' ? '选择商品' : targetType === 'course' ? '选择课程' : targetType === 'post' ? '选择帖子' : '选择 App 页面'} rules={[{required: true, message: '请选择具体跳转内容'}]}><Select showSearch optionFilterProp="label" options={targetSelectOptions} placeholder="请选择" /></Form.Item>}

          <Form.Item
            name="startsAt"
            label="展示开始时间"
            extra={`北京时间（UTC+8），可滚动选择，也可直接输入年月日时分秒；最晚 ${ANNOUNCEMENT_TIME_MAX.format(DATE_TIME_FORMAT)}`}
            rules={[
              {required: true, message: '请选择展示开始时间'},
              {validator: async (_, value?: Dayjs) => {
                if (!value) return;
                if (!value.isValid()) throw new Error('请输入有效的开始时间');
                if (value.isAfter(ANNOUNCEMENT_TIME_MAX)) throw new Error(`开始时间不能晚于 ${ANNOUNCEMENT_TIME_MAX.format(DATE_TIME_FORMAT)}`);
                if (editing?.status === 'scheduled' && !value.isAfter(dayjs())) throw new Error('定时公告的开始时间必须晚于当前时间；如需立即发布请使用列表中的“立即发布”');
              }},
            ]}
          >
            <DatePicker locale={zhCNDatePicker} showTime={{format: 'HH:mm:ss', changeOnScroll: true}} format={DATE_TIME_MASK} maxDate={ANNOUNCEMENT_TIME_MAX} needConfirm showNow placeholder="选择或输入年月日时分秒" style={{width: '100%'}} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(previous, current) => previous.startsAt !== current.startsAt || previous.status !== current.status}>
            {({getFieldValue}) => {
              const startsAt = getFieldValue('startsAt') as Dayjs | undefined;
              const status = getFieldValue('status') as FormValues['status'];
              return (
                <Form.Item
                  name="endsAt"
                  label="展示结束时间（选填）"
                  extra={`北京时间（UTC+8）；留空表示长期展示；最晚 ${ANNOUNCEMENT_TIME_MAX.format(DATE_TIME_FORMAT)}`}
                  rules={[{validator: async (_, value?: Dayjs) => {
                    if (!value) return;
                    if (!value.isValid()) throw new Error('请输入有效的结束时间');
                    if (value.isAfter(ANNOUNCEMENT_TIME_MAX)) throw new Error(`结束时间不能晚于 ${ANNOUNCEMENT_TIME_MAX.format(DATE_TIME_FORMAT)}`);
                    if (startsAt?.isValid() && !value.isAfter(startsAt)) throw new Error('结束时间必须晚于开始时间');
                    if (status === 'published' && !value.isAfter(dayjs())) throw new Error('发布公告的结束时间必须晚于当前时间');
                  }}]}
                >
                  <DatePicker locale={zhCNDatePicker} showTime={{format: 'HH:mm:ss', changeOnScroll: true}} format={DATE_TIME_MASK} minDate={startsAt?.isValid() ? startsAt : undefined} maxDate={ANNOUNCEMENT_TIME_MAX} needConfirm allowClear placeholder="选择或输入；留空为长期展示" style={{width: '100%'}} />
                </Form.Item>
              );
            }}
          </Form.Item>

          {!editing && <Form.Item name="status" label="保存方式" rules={[{required: true}]} extra={publishMode === 'published' ? '开始时间晚于当前时间时会自动进入定时发布。' : '草稿不会在 App 端展示，可以继续编辑或删除。'}><Select options={[{value: 'draft', label: '保存为草稿'}, {value: 'published', label: '发布 / 定时发布'}]} /></Form.Item>}
          <Button type="primary" htmlType="submit" loading={submitting} block>{editing ? '保存修改' : publishMode === 'published' ? '确认发布' : '保存草稿'}</Button>
        </Form>
      </Drawer>

      <Modal title="公告预览" open={Boolean(preview)} onCancel={() => setPreview(null)} footer={<Button onClick={() => setPreview(null)}>关闭</Button>} width={680}>
        {preview && <Space direction="vertical" size={18} style={{display: 'flex'}}>
          <Space wrap>
            <Tag color={statusMeta[preview.status].color}>{statusMeta[preview.status].label}</Tag>
            {preview.isPinned && <Tag color="red" icon={<PushpinFilled />}>置顶</Tag>}
            <Tag>{audienceLabel(preview)}</Tag>
          </Space>
          <div>
            <Typography.Title level={3} style={{marginBottom: 6}}>{preview.title}</Typography.Title>
            <Typography.Text type="secondary">{formatTime(preview.publishedAt ?? preview.startsAt ?? preview.createdAt)}</Typography.Text>
          </div>
          <Typography.Paragraph style={{fontSize: 16, lineHeight: 1.9, whiteSpace: 'pre-wrap'}}>{preview.body}</Typography.Paragraph>
          <Descriptions size="small" column={1} bordered items={[
            {key: 'period', label: '展示时间', children: deliveryPeriod(preview)},
            {key: 'target', label: '点击跳转', children: targetLabel(preview.deepLink, products, courses, posts)},
            {key: 'effect', label: '触达效果', children: `预计 ${preview.audienceCount ?? 0} 人，已读 ${preview.readCount ?? 0} 人（${(preview.readRate ?? 0).toFixed(1)}%），关闭 ${preview.closedCount ?? 0} 人`},
            ...(preview.withdrawalReason ? [{key: 'withdrawal', label: '撤回原因', children: preview.withdrawalReason}] : []),
          ]} />
        </Space>}
      </Modal>

      <Modal title="撤回公告" open={Boolean(withdrawTarget)} okText="确认撤回" okButtonProps={{danger: true, loading: submitting}} cancelText="取消" onOk={() => void withdraw()} onCancel={() => { setWithdrawTarget(null); withdrawForm.resetFields(); }}>
        <Typography.Paragraph type="secondary">撤回后，公告会立即从 App 首页、公告列表和消息中心消失。操作会记录在审计日志中。</Typography.Paragraph>
        <Form form={withdrawForm} layout="vertical">
          <Form.Item name="reason" label="撤回原因" rules={[{required: true, min: 2, max: 500, message: '请输入 2 到 500 个字符的撤回原因'}]}><Input.TextArea rows={4} maxLength={500} showCount placeholder="例如：公告内容有误，需要重新核对" /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
