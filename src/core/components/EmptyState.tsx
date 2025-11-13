import React from 'react';
import { Empty, Button, Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  image?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data',
  description = 'There is no data to display',
  actionLabel,
  onAction,
  icon = <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
  image,
}) => {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <Empty
        image={image || icon}
        styles={{ image: { height: 120 } }}
        description={
          <Space direction="vertical" size="small">
            <Title level={4} type="secondary" style={{ margin: 0 }}>
              {title}
            </Title>
            <Text type="secondary">{description}</Text>
          </Space>
        }
      >
        {actionLabel && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Empty>
    </div>
  );
};

