import React from 'react';
import { Layout, Space, Dropdown, Avatar, Typography, Menu, Grid } from 'antd';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { UserOutlined, LogoutOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../../components/ThemeToggle';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';

const { useBreakpoint } = Grid;

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        // Navigate to profile page when available
        // TODO: implement profile page
      },
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => {
        navigate('/password-update');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        // Navigate to settings page when available
        // TODO: implement settings page
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        background: 'var(--ant-color-bg-container)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ fontSize: '18px', color: 'var(--ant-color-primary)' }}>
          BILAN-EASY
        </Text>
      </div>
      <Space size="middle">
        <LanguageSwitcher />
        <ThemeToggle />
        {identity && (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space
              style={{
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: 'var(--ant-color-primary)' }}
              />
              {screens.md && (
                <Text>
                  {identity.name || identity.email}
                </Text>
              )}
            </Space>
          </Dropdown>
        )}
      </Space>
    </AntHeader>
  );
};

