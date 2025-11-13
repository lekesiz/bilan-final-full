import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  description,
  onRetry,
  retryText = 'Retry',
  fullScreen = false,
}) => {
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
      <Alert
        message={message}
        description={description}
        type="error"
        icon={<ExclamationCircleOutlined />}
        showIcon
        style={{ maxWidth: 600, width: '100%' }}
        action={
          onRetry && (
            <Button size="small" danger onClick={onRetry} icon={<ReloadOutlined />}>
              {retryText}
            </Button>
          )
        }
      />
    </div>
  );

  if (fullScreen) {
    return <div style={{ width: '100%', height: '100vh' }}>{content}</div>;
  }

  return content;
};

