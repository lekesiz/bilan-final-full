import React, { useState } from 'react';
import { useRegister } from '@refinedev/core';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const { mutate: register, isLoading, isError, error: registerError } = useRegister();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Refine'in error state'ini kullan
  React.useEffect(() => {
    if (isError || registerError) {
      const errorMessage = (registerError as any)?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  }, [isError, registerError]);

  const onFinish = async (values: { email: string; password: string; name: string; confirmPassword: string }) => {
    setError(null);

    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (values.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Refine'in useRegister hook'u mutate fonksiyonu Promise döndürmez
    // Hata durumunda error state'i otomatik set edilir
    register({
      email: values.email,
      password: values.password,
      name: values.name,
    }, {
      onError: (error: any) => {
        console.error('Register error:', error);
        const errorMessage = error?.message || error?.error || 'Registration failed. Please try again.';
        setError(errorMessage);
      },
      onSuccess: () => {
        // Başarılı kayıt - Manuel redirect
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
            <Text type="secondary">Create your account</Text>
          </div>

          {error && (
            <Alert
              message="Registration Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full Name"
              />
            </Form.Item>

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

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                autoComplete="new-password"
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
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
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

export default RegisterPage;

