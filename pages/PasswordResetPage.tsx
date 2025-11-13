import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../services/apiClient';

const { Title, Text } = Typography;

const PasswordResetPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.resetPassword(values.email);
      setSuccess(true);
      message.success('Password reset email sent (if email exists)');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send password reset email';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>Reset Password</Title>
            <Text type="secondary">Enter your email to receive a password reset link</Text>
          </div>

          {success && (
            <Alert
              message="Email Sent"
              description="If the email exists, a password reset link has been sent. Please check your inbox."
              type="success"
              showIcon
              closable
            />
          )}

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

          {!success ? (
            <Form
              name="password-reset"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ height: 45 }}
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/login')}
              block
            >
              Back to Login
            </Button>
          )}

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Remember your password?{' '}
              <Link to="/login" style={{ fontWeight: 500 }}>
                Sign in
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default PasswordResetPage;

