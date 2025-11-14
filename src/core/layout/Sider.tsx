import React from 'react';
import { Menu, Layout } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../permissions/usePermissions';
import {
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SafetyOutlined,
  AuditOutlined,
} from '@ant-design/icons';

const { Sider: AntdSider } = Layout;

interface SiderProps {
  Title?: React.FC<{ collapsed?: boolean }>;
}

export const Sider: React.FC<SiderProps> = ({ Title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess, isLoading } = usePermissions();

  // Return loading state if permissions are loading
  if (isLoading) {
    return (
      <AntdSider
        width={200}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Menu
          mode="inline"
          items={[]}
          style={{ 
            height: '100%',
            borderRight: 0,
            paddingTop: '8px',
            width: '100%',
          }}
        />
      </AntdSider>
    );
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/bilan',
      icon: <FileTextOutlined />,
      label: 'Bilan de Compétences',
      visible: canAccess('bilan', 'read') || canAccess('bilan:assessment', 'read'),
    },
    {
      key: '/assessments',
      icon: <FileTextOutlined />,
      label: 'Assessments',
      visible: canAccess('bilan:assessment', 'read') || canAccess('bilan', 'read'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      visible: canAccess('analytics', 'read') || canAccess('admin', 'read') || canAccess('dashboard', 'read'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
      visible: canAccess('users', 'read'),
    },
    {
      key: '/roles',
      icon: <SafetyOutlined />,
      label: 'Roles & Permissions',
      visible: canAccess('roles', 'read'),
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: 'Audit Trail',
      visible: canAccess('audit', 'read'),
    },
  ].filter(item => item.visible !== false);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntdSider
      width={200}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
      }}
    >
      {Title && (
        <div
          style={{
            width: '100%',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '64px',
          }}
        >
          <Title collapsed={false} />
        </div>
      )}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          height: '100%',
          borderRight: 0,
          paddingTop: '8px',
          width: '100%',
        }}
      />
    </AntdSider>
  );
};

