import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert, message } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../services/apiClient';
import { useGetIdentity } from '@refinedev/core';
import { PageWrapper } from '../src/core/components/PageWrapper';

const { Title, Text } = Typography;

const PasswordUpdatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();
  const { data: identity } = useGetIdentity();

  const onFinish = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (values.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('bilan_auth_token');
      await api.updatePassword(values.currentPassword, values.newPassword, token);
      message.success('Password updated successfully');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update password';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 8 }}>Update Password</Title>
              <Text type="secondary">
                Change your password for {identity?.email || 'your account'}
              </Text>
            </div>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}

            <Form
              name="password-update"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Update Password
                  </Button>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default PasswordUpdatePage;

