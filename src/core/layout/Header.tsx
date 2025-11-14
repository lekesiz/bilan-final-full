import React, { useState, useEffect } from 'react';
import { Layout, Space, Dropdown, Avatar, Typography, Menu, Grid, Button } from 'antd';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { UserOutlined, LogoutOutlined, SettingOutlined, LockOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import KeyboardShortcutsModal from '../../../components/KeyboardShortcutsModal';

const { useBreakpoint } = Grid;

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [shortcutsVisible, setShortcutsVisible] = useState(false);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + /: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        navigate('/profile');
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
        navigate('/settings');
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
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={() => setShortcutsVisible(true)}
          title="Keyboard Shortcuts (Ctrl+/)"
        />
        <LanguageSwitcher />
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
              className="hover:bg-gray-100"
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
      <KeyboardShortcutsModal
        visible={shortcutsVisible}
        onClose={() => setShortcutsVisible(false)}
      />
    </AntHeader>
  );
};

