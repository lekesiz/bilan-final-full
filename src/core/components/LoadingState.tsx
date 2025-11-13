import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  fullScreen = false,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'default' ? 32 : 24 }} spin />;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullScreen ? '100px 24px' : '40px 24px',
        minHeight: fullScreen ? '100vh' : '200px',
      }}
    >
      <Spin indicator={antIcon} size={size} />
      {message && (
        <Text type="secondary" style={{ marginTop: 16, fontSize: 14 }}>
          {message}
        </Text>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ width: '100%', height: '100vh', minHeight: '100vh' }}>
        {content}
      </div>
    );
  }

  return content;
};

