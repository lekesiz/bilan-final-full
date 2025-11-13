import React from 'react';
import { useNavigation } from '@refinedev/core';
import { Menu } from 'antd';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '../permissions/usePermissions';
import {
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SafetyOutlined,
  AuditOutlined,
} from '@ant-design/icons';

export const Sider: React.FC = () => {
  const { push } = useNavigation();
  const location = useLocation();
  const { canAccess } = usePermissions();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => push('/dashboard'),
    },
    {
      key: '/bilan',
      icon: <FileTextOutlined />,
      label: 'Bilan de Compétences',
      onClick: () => push('/bilan'),
      visible: canAccess('bilan', 'read') || canAccess('bilan:assessment', 'read'),
    },
    {
      key: '/assessments',
      icon: <FileTextOutlined />,
      label: 'Assessments',
      onClick: () => push('/assessments'),
      visible: canAccess('bilan:assessment', 'read') || canAccess('bilan', 'read'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      onClick: () => push('/analytics'),
      visible: canAccess('analytics', 'read') || canAccess('admin', 'read') || canAccess('dashboard', 'read'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
      onClick: () => push('/users'),
      visible: canAccess('users', 'read'),
    },
    {
      key: '/roles',
      icon: <SafetyOutlined />,
      label: 'Roles & Permissions',
      onClick: () => push('/roles'),
      visible: canAccess('roles', 'read'),
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: 'Audit Trail',
      onClick: () => push('/audit'),
      visible: canAccess('audit', 'read'),
    },
  ].filter(item => item.visible !== false);

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      style={{ 
        height: '100%', 
        borderRight: 0,
        paddingTop: '8px',
      }}
    />
  );
};

