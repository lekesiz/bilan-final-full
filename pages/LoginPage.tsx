import React, { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { mutate: login, isLoading, isError, error: loginError } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Refine'in error state'ini kullan
  React.useEffect(() => {
    if (isError || loginError) {
      const errorMessage = (loginError as any)?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    }
  }, [isError, loginError]);

  const onFinish = (values: { email: string; password: string }) => {
    setError(null);
    // Refine'in useLogin hook'u mutate fonksiyonu Promise döndürmez
    // Hata durumunda error state'i otomatik set edilir
    login(values, {
      onError: (error: any) => {
        console.error('Login error:', error);
        const errorMessage = error?.message || error?.error || 'Login failed. Please check your credentials.';
        setError(errorMessage);
      },
      onSuccess: () => {
        // Başarılı login - Manuel redirect
        setError(null);
        navigate('/dashboard', { replace: true });
      },
    });
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
            <Title level={2} style={{ marginBottom: 8 }}>BILAN-EASY</Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            name="login"
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
                prefix={<UserOutlined />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                style={{ height: 45 }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Link to="/password-reset" style={{ fontSize: 14 }}>
                Forgot password?
              </Link>
              <Text type="secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ fontWeight: 500 }}>
                  Sign up
                </Link>
              </Text>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;

