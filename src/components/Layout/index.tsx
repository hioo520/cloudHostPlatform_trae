import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { PieChartOutlined, AlertOutlined, DatabaseOutlined, BarChartOutlined, GiftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/dashboard',
    icon: <PieChartOutlined />,
    label: '仪表盘',
  },
  {
      key: '/host-management',
      icon: <DatabaseOutlined />,
      label: '云主机管理',
    },
  {
    key: '/change-management',
    icon: <DatabaseOutlined />,
    label: '变更管理',
  },
  {
    key: '/inefficient-hosts',
    icon: <AlertOutlined />,
    label: '低效云主机',
  },
  {
    key: '/public-pool',
    icon: <GiftOutlined />,
    label: '公共池管理',
  },
  {
    key: '/metrics',
    icon: <BarChartOutlined />,
    label: '多维指标管理',
  },
];

const CustomLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={250}
      >
        <div style={{ padding: '16px', textAlign: 'center', color: '#fff' }}>
          {collapsed ? (
            <PieChartOutlined style={{ fontSize: 24 }} />
          ) : (
            <Title level={4} style={{ color: '#fff', margin: 0 }}>云主机管理平台</Title>
          )}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          items={menuItems}
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, display: 'flex', alignItems: 'center', paddingLeft: 24 }}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>云主机管理平台</Title>
        </Header>
        <Content 
          className="site-layout-background" 
          style={{ 
            margin: '24px 16px', 
            padding: 24, 
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;