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
    return <Card loading />;
  }

  if (!identity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">{t('profile.notFound', 'User profile not found')}</Text>
        </div>
      </Card>
    );
  }

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
                  {identity.name || identity.email}
                </Title>
                <Text type="secondary">{identity.email}</Text>
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
                {identity.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    {t('profile.name', 'Name')}
                  </Space>
                }
              >
                {identity.name || t('profile.notSet', 'Not set')}
              </Descriptions.Item>

              {identity.roles && Array.isArray(identity.roles) && identity.roles.length > 0 && (
                <Descriptions.Item
                  label={t('profile.roles', 'Roles')}
                >
                  <Space wrap>
                    {identity.roles.map((role: any, index: number) => (
                      <Tag key={index} color="blue">
                        {typeof role === 'string' ? role : (role?.name || role?.id || role)}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}

              {!identity.roles && identity.role && (
                <Descriptions.Item
                  label={t('profile.role', 'Role')}
                >
                  <Tag color="blue">{identity.role}</Tag>
                </Descriptions.Item>
              )}

              {(identity.lastLoginAt || (identity as any).lastLoginAt) && (
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      {t('profile.lastLogin', 'Last Login')}
                    </Space>
                  }
                >
                  {formatDate(identity.lastLoginAt || (identity as any).lastLoginAt)}
                </Descriptions.Item>
              )}

              {(identity.createdAt || (identity as any).createdAt) && (
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      {t('profile.memberSince', 'Member Since')}
                    </Space>
                  }
                >
                  {formatDate(identity.createdAt || (identity as any).createdAt)}
                </Descriptions.Item>
              )}

              {((identity as any).isActive !== undefined) && (
                <Descriptions.Item
                  label={t('profile.status', 'Status')}
                >
                  <Tag color={(identity as any).isActive ? 'green' : 'red'}>
                    {(identity as any).isActive ? t('profile.active', 'Active') : t('profile.inactive', 'Inactive')}
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
                    const userId = (identity as any).id || (identity as any).userId;
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

