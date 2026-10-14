import {LogoutOutlined, HighlightOutlined} from '@ant-design/icons';
import {Button, Layout, Space, Typography} from 'antd';
import {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {getCurrentAdmin, logoutAdmin} from '@/services/api';

export default function GradingAdminLayout() { const navigate = useNavigate(); const [checking, setChecking] = useState(true); useEffect(() => { getCurrentAdmin().catch(() => navigate('/grading-admin/login', {replace: true})).finally(() => setChecking(false)); }, [navigate]); if (checking) return <div style={{padding: 40}}>正在校验批改管理员会话...</div>; return <Layout style={{minHeight: '100vh', background: '#f5f6fa'}}><Layout.Header style={{background: '#fff', borderBottom: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><Space><HighlightOutlined style={{color: '#4C4BEA', fontSize: 20}} /><Typography.Text strong>得宝批改管理端</Typography.Text></Space><Button type="text" icon={<LogoutOutlined />} onClick={async () => {await logoutAdmin().catch(() => undefined); navigate('/grading-admin/login', {replace: true});}}>退出</Button></Layout.Header><Layout.Content style={{padding: 24, maxWidth: 1500, width: '100%', margin: '0 auto'}}><Outlet /></Layout.Content></Layout>; }
