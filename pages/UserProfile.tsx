import React from 'react';
import { useGetIdentity } from '@refinedev/core';
import { Card, Descriptions, Space, Button, Typography, Divider, Tag, Avatar } from 'antd';
import { UserOutlined, LockOutlined, EditOutlined, CalendarOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const { data: identity, isLoading } = useGetIdentity();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <Card loading />
      </div>
    );
  }

  if (!identity) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">{t('profile.notFound', 'User profile not found')}</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Safe access to identity properties
  const safeIdentity = identity as any;
  const userName = safeIdentity?.name || safeIdentity?.email || 'Unknown';
  const userEmail = safeIdentity?.email || '';
  const userRoles = Array.isArray(safeIdentity?.roles) ? safeIdentity.roles : [];
  const userRole = safeIdentity?.role;
  const lastLogin = safeIdentity?.lastLoginAt;
  const createdAt = safeIdentity?.createdAt;
  const isActive = safeIdentity?.isActive;
  const userId = safeIdentity?.id || safeIdentity?.userId;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t('profile.never', 'Never');
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return t('profile.never', 'Never');
    }
  };

  return (
    <PermissionGuard resource="users" action="read">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: 'var(--ant-color-primary)' }}
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {userName}
                </Title>
                <Text type="secondary">{userEmail}</Text>
              </div>
            </div>

            <Divider />

            {/* Profile Information */}
            <Descriptions
              title={t('profile.profileInformation', 'Profile Information')}
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined />
                    {t('profile.email', 'Email')}
                  </Space>
                }
              >
                {userEmail || t('profile.notSet', 'Not set')}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    {t('profile.name', 'Name')}
                  </Space>
                }
              >
                {safeIdentity?.name || t('profile.notSet', 'Not set')}
              </Descriptions.Item>

              {userRoles.length > 0 && (
                <Descriptions.Item
                  label={t('profile.roles', 'Roles')}
                >
                  <Space wrap>
                    {userRoles.map((role: any, index: number) => (
                      <Tag key={index} color="blue">
                        {typeof role === 'string' ? role : (role?.name || role?.id || String(role))}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}

              {userRoles.length === 0 && userRole && (
                <Descriptions.Item
                  label={t('profile.role', 'Role')}
                >
                  <Tag color="blue">{userRole}</Tag>
                </Descriptions.Item>
              )}

              {lastLogin && (
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      {t('profile.lastLogin', 'Last Login')}
                    </Space>
                  }
                >
                  {formatDate(lastLogin)}
                </Descriptions.Item>
              )}

              {createdAt && (
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      {t('profile.memberSince', 'Member Since')}
                    </Space>
                  }
                >
                  {formatDate(createdAt)}
                </Descriptions.Item>
              )}

              {isActive !== undefined && (
                <Descriptions.Item
                  label={t('profile.status', 'Status')}
                >
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? t('profile.active', 'Active') : t('profile.inactive', 'Inactive')}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* Actions */}
            <Space>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => navigate('/password-update')}
              >
                {t('profile.changePassword', 'Change Password')}
              </Button>
              <PermissionGuard resource="users" action="update" showError={false}>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    // Navigate to edit page if user has permission to edit themselves
                    if (userId) {
                      navigate(`/users/edit/${userId}`);
                    }
                  }}
                >
                  {t('profile.editProfile', 'Edit Profile')}
                </Button>
              </PermissionGuard>
            </Space>
          </Space>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default UserProfile;

