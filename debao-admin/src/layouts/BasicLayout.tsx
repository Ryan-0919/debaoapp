import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {BarChartOutlined, DashboardOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, NotificationOutlined, PlayCircleOutlined, ReadOutlined, RobotOutlined, SafetyCertificateOutlined, SettingOutlined, ShoppingOutlined, TeamOutlined} from '@ant-design/icons';
import {Button, Layout, Menu, Space, Tag, Typography, type MenuProps} from 'antd';
import {useEffect, useState} from 'react';
import {getAdminNavigation, getCurrentAdmin, logoutAdmin} from '@/services/api';

type NavigationItem = NonNullable<MenuProps['items']>[number] & {key: string; children?: NavigationItem[]};
const menuItems: NavigationItem[] = [
  {key: '/dashboard', label: '工作台', icon: <DashboardOutlined />},
  {key: '/users', label: '用户与权益', icon: <TeamOutlined />},
  {key: 'content', label: '内容中心', icon: <ReadOutlined />, children: [
    {key: '/content/subjects', label: '科目章节'}, {key: '/content/questions', label: '题目管理'}, {key: '/content/papers', label: '试卷管理'}, {key: '/content/imports', label: '题库批量导入'}, {key: '/content/laws', label: '法条管理'},
  ]},
    {key: 'learning', label: '课程与学习', icon: <PlayCircleOutlined />, children: [
    {key: '/courses/audio', label: '音频课程库'}, {key: '/courses/video', label: '视频课程库'}, {key: '/courses', label: '课程管理'}, {key: '/courses/live-sessions', label: '直播排期'}, {key: '/learning/records', label: '学习记录'}, {key: '/learning/plans', label: '学习计划'}, {key: '/learning/inquiries', label: '学员错因答疑'},
  ]},
  {key: 'commerce', label: '商城交易', icon: <ShoppingOutlined />, children: [
    {key: '/commerce/products', label: '商品管理'}, {key: '/commerce/orders', label: '订单管理'}, {key: '/commerce/refunds', label: '退款售后'}, {key: '/commerce/entitlements', label: '权益记录'},
  ]},
  {key: 'community', label: '社区治理', icon: <SafetyCertificateOutlined />, children: [
    {key: '/community/posts', label: '帖子管理'}, {key: '/community/comments', label: '评论管理'}, {key: '/community/reports', label: '举报审核'}, {key: '/community/rules', label: '社区规则'},
  ]},
  {key: 'operations', label: '运营中心', icon: <NotificationOutlined />, children: [
    {key: '/operations/banners', label: 'Banner 管理'}, {key: '/operations/announcements', label: '公告管理'}, {key: '/operations/templates', label: '消息模板'}, {key: '/operations/push-jobs', label: '推送任务'},
  ]},
  {key: 'ai', label: 'AI 运营', icon: <RobotOutlined />, children: [
    {key: '/ai/quotas', label: '配额管理'}, {key: '/ai/flags', label: '风险记录'}, {key: '/ai/usage', label: '用量统计'},
  ]},
  {key: '/analytics', label: '数据分析', icon: <BarChartOutlined />},
  {key: 'system', label: '系统管理', icon: <SettingOutlined />, children: [
    {key: '/system/admins', label: '管理员与角色'}, {key: '/system/audit-logs', label: '审计日志'}, {key: '/system/settings', label: '系统配置'}, {key: '/system/health', label: '服务状态'},
  ]},
];

function filterNavigation(items: NavigationItem[], allowed: Set<string>): NavigationItem[] {
  return items.flatMap(item => {
    if (item.children) { const children = filterNavigation(item.children, allowed); return children.length ? [{...item, children}] : []; }
    return allowed.has(item.key) ? [item] : [];
  });
}
function activeMenuKey(items: NavigationItem[], pathname: string): string | undefined {
  for (const item of items) { if (item.children) { const child = activeMenuKey(item.children, pathname); if (child) return child; } else if (pathname === item.key || pathname.startsWith(`${item.key}/`)) return item.key; }
  return undefined;
}

export default function BasicLayout() {
  const navigate = useNavigate(); const location = useLocation();
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  const [checking, setChecking] = useState(true); const [navigation, setNavigation] = useState<NavigationItem[]>(menuItems);
  useEffect(() => { const onResize = () => { const nextCompact = window.innerWidth < 900; setCompact(nextCompact); if (nextCompact) setCollapsed(true); }; window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, []);
  useEffect(() => { getCurrentAdmin().then(() => getAdminNavigation()).then(result => { const allowed = new Set(result.items.map(item => item.key)); setNavigation(filterNavigation(menuItems, allowed)); }).catch(() => navigate('/login')).finally(() => setChecking(false)); }, [navigate]);
  if (checking) return <div style={{minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#666'}}>正在校验管理员会话...</div>;
  const active = activeMenuKey(navigation, location.pathname) ?? '/dashboard';
  return <Layout style={{minHeight: '100vh', background: '#f5f6fa'}}>
    <Layout.Sider collapsible collapsed={collapsed} trigger={null} width={224} collapsedWidth={compact ? 56 : 64} theme="light" style={{borderRight: '1px solid #e8e9ef'}}>
      <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '0 18px' : '0 22px', borderBottom: '1px solid #eef0f4'}}><SafetyCertificateOutlined style={{fontSize: 21, color: '#4C4BEA'}} />{!collapsed && <Typography.Text strong style={{fontSize: 16, whiteSpace: 'nowrap'}}>得宝运营后台</Typography.Text>}</div>
      <Menu mode="inline" selectedKeys={[active]} items={navigation} onClick={({key}) => { if (key.startsWith('/')) navigate(key); }} style={{borderInlineEnd: 0, paddingTop: 10}} />
    </Layout.Sider>
    <Layout>
      <Layout.Header style={{height: 56, lineHeight: '56px', paddingInline: compact ? 10 : 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #eef0f4'}}><Button type="text" aria-label={collapsed ? '展开导航' : '折叠导航'} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(value => !value)} /><Space size={compact ? 4 : 16}>{!compact && <Tag color="green">本地环境</Tag>}{!compact && <Typography.Text type="secondary">管理员</Typography.Text>}<Button type="text" aria-label="退出" icon={<LogoutOutlined />} onClick={async () => { await logoutAdmin().catch(() => undefined); navigate('/login'); }}>{compact ? null : '退出'}</Button></Space></Layout.Header>
      <Layout.Content style={{padding: compact ? '16px 12px' : '24px 28px', maxWidth: 1760, width: '100%', minWidth: 0, margin: '0 auto'}}><Outlet /></Layout.Content>
    </Layout>
  </Layout>;
}
