import {Alert, Empty, Table, Tag, Typography} from 'antd';
import {useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {getAdminCollection} from '@/services/api';

type Config = {title: string; endpoint: string; columns: Array<{title: string; key: string}>};
const configs: Record<string, Config> = {
  '/content/subjects': {title: '科目与章节', endpoint: '/v1/admin/content/subjects', columns: [{title: '科目', key: 'name'}, {title: '题目数', key: 'questionCount'}, {title: '状态', key: 'status'}]},
  '/content/papers': {title: '试卷管理', endpoint: '/v1/admin/content/papers', columns: [{title: '试卷', key: 'name'}, {title: '年份', key: 'year'}, {title: '题目数', key: 'questionCount'}, {title: '状态', key: 'status'}]},
  '/content/imports': {title: '题库批量导入', endpoint: '/v1/admin/content/imports', columns: [{title: '导入任务', key: 'id'}, {title: '状态', key: 'status'}, {title: '成功数', key: 'successCount'}, {title: '错误数', key: 'errorCount'}]},
  '/content/laws': {title: '法条管理', endpoint: '/v1/admin/content/laws', columns: [{title: '标题', key: 'title'}, {title: '条号', key: 'article'}, {title: '生效日期', key: 'effectiveFrom'}, {title: '失效日期', key: 'effectiveTo'}]},
  '/learning/records': {title: '学习记录', endpoint: '/v1/admin/learning/records', columns: [{title: '用户', key: 'userId'}, {title: '题目', key: 'questionId'}, {title: '事件', key: 'eventType'}, {title: '创建时间', key: 'createdAt'}]},
  '/learning/plans': {title: '学习计划', endpoint: '/v1/admin/learning/plans', columns: [{title: '计划', key: 'title'}, {title: '用户', key: 'userId'}, {title: '每日分钟数', key: 'dailyMinutes'}, {title: '任务数', key: 'taskCount'}, {title: '状态', key: 'status'}]},
  '/courses/live-sessions': {title: '直播排期', endpoint: '/v1/admin/courses/live-sessions', columns: [{title: '场次', key: 'id'}, {title: '课程', key: 'courseId'}, {title: '开始时间', key: 'startsAt'}, {title: '状态', key: 'status'}]},
  '/grading': {title: '批改队列', endpoint: '/v1/admin/grading', columns: [{title: '提交', key: 'id'}, {title: '用户', key: 'userId'}, {title: '状态', key: 'status'}, {title: '创建时间', key: 'createdAt'}]},
  '/commerce/entitlements': {title: '权益记录', endpoint: '/v1/admin/entitlements', columns: [{title: '用户', key: 'userId'}, {title: '课程', key: 'courseId'}, {title: '来源订单', key: 'sourceOrderId'}, {title: '到期时间', key: 'expiresAt'}]},
  '/community/posts': {title: '帖子管理', endpoint: '/v1/admin/community/posts', columns: [{title: '标题', key: 'title'}, {title: '作者', key: 'userName'}, {title: '分类', key: 'category'}, {title: '状态', key: 'status'}, {title: '发布时间', key: 'createdAt'}]},
  '/community/comments': {title: '评论管理', endpoint: '/v1/admin/community/comments', columns: [{title: '帖子', key: 'postId'}, {title: '作者', key: 'userName'}, {title: '内容', key: 'body'}, {title: '发布时间', key: 'createdAt'}]},
  '/community/rules': {title: '社区规则', endpoint: '/v1/admin/community/rules', columns: [{title: '规则', key: 'name'}, {title: '处理动作', key: 'action'}, {title: '状态', key: 'status'}]},
  '/operations/banners': {title: 'Banner 管理', endpoint: '/v1/admin/banners', columns: [{title: '标题', key: 'title'}, {title: '跳转目标', key: 'target'}, {title: '开始时间', key: 'startsAt'}, {title: '结束时间', key: 'endsAt'}]},
  '/operations/templates': {title: '消息模板', endpoint: '/v1/admin/templates', columns: [{title: '模板', key: 'name'}, {title: '渠道', key: 'channel'}, {title: '状态', key: 'status'}]},
  '/operations/push-jobs': {title: '推送任务', endpoint: '/v1/admin/push-jobs', columns: [{title: '任务', key: 'id'}, {title: '渠道', key: 'channel'}, {title: '状态', key: 'status'}, {title: '创建时间', key: 'createdAt'}]},
  '/ai/flags': {title: 'AI 风险记录', endpoint: '/v1/admin/ai/flags', columns: [{title: '记录', key: 'id'}, {title: '用户', key: 'userId'}, {title: '风险等级', key: 'risk'}, {title: '状态', key: 'status'}]},
  '/ai/usage': {title: 'AI 用量统计', endpoint: '/v1/admin/ai/usage', columns: [{title: '用户', key: 'userId'}, {title: '请求次数', key: 'requests'}, {title: 'Token 数', key: 'tokens'}, {title: '费用', key: 'cost'}]},
  '/system/audit-logs': {title: '审计日志', endpoint: '/v1/admin/audit-logs', columns: [{title: '操作', key: 'action'}, {title: '资源类型', key: 'resourceType'}, {title: '原因', key: 'reason'}, {title: '创建时间', key: 'createdAt'}]},
  '/system/settings': {title: '系统配置', endpoint: '/v1/admin/settings', columns: [{title: '配置项', key: 'id'}, {title: '配置值', key: 'value'}]},
  '/system/health': {title: '服务状态', endpoint: '/v1/admin/health', columns: [{title: '服务', key: 'id'}, {title: '状态', key: 'value'}]},
  '/commerce/orders': {title: '订单管理', endpoint: '/v1/admin/orders', columns: [{title: '订单号', key: 'id'}, {title: '商品', key: 'productName'}, {title: '金额', key: 'amount'}, {title: '状态', key: 'status'}, {title: '创建时间', key: 'createdAt'}]},
};

export default function Placeholder() {
  const location = useLocation(); const config = configs[location.pathname] ?? configs['/commerce/orders']; const [rows, setRows] = useState<Array<Record<string, unknown>>>([]); const [error, setError] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); setError(false); getAdminCollection(config.endpoint).then(result => { const value = result as unknown as {items?: Array<Record<string, unknown>>} | Array<Record<string, unknown>>; const values: Array<Record<string, unknown>> = Array.isArray(value) ? value : Array.isArray(value.items) ? value.items : Object.entries(value).map(([id, item]) => ({id, value: item})); setRows(values.map((row, index) => ({...row, id: String(row.id ?? row.userId ?? row.orderId ?? row.postId ?? `${config.endpoint}-${index}`)}))); }).catch(() => setError(true)).finally(() => setLoading(false)); }, [config.endpoint]);
  return <div style={{background: '#fff', border: '1px solid #e8e9ef', borderRadius: 8, padding: 20, minWidth: 0}}><Typography.Title level={4} style={{marginTop: 0}}>{config.title}</Typography.Title>{error && <Alert type="warning" showIcon message="数据暂不可用" description="请检查管理员会话后重试。" style={{marginBottom: 16}} />}{!error && <Table rowKey="id" loading={loading} dataSource={rows} locale={{emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />}} scroll={{x: 'max-content'}} columns={config.columns.map(column => ({title: column.title, dataIndex: column.key, render: (value: unknown) => column.key === 'status' ? <Tag color={value === 'published' || value === 'paid' || value === 'on_sale' || value === 'active' ? 'green' : 'gold'}>{String(value ?? '未设置')}</Tag> : String(value ?? '-')}))} pagination={{pageSize: 20}} />}</div>;
}
