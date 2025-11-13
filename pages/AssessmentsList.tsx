import React from 'react';
import { useList } from '@refinedev/core';
import { Table, Card, Typography, Space, Button, Tag, Row, Col } from 'antd';
import { FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { LoadingState } from '../src/core/components/LoadingState';
import { ErrorState } from '../src/core/components/ErrorState';
import { EmptyState } from '../src/core/components/EmptyState';
import { PageWrapper } from '../src/core/components/PageWrapper';

const { Title } = Typography;

interface Assessment {
  id: string;
  userName: string;
  packageName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  currentQuestionIndex: number;
}

const AssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useList<Assessment>({
    resource: 'assessments',
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const columns: ColumnsType<Assessment> = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Package',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          completed: 'green',
          in_progress: 'blue',
          abandoned: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = record.totalQuestions > 0
          ? Math.round((record.currentQuestionIndex / record.totalQuestions) * 100)
          : 0;
        return `${progress}%`;
      },
    },
    {
      title: 'Started At',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/assessments/show/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading assessments..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load assessments"
        description={error?.message || 'An error occurred while loading assessments'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const assessments = data?.data || [];

  return (
    <PageWrapper>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined /> Assessments
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => navigate('/bilan')}
              size="large"
            >
              New Assessment
            </Button>
          </Col>
        </Row>

        <Card>
          {assessments.length === 0 ? (
            <EmptyState
              title="No assessments found"
              description="Get started by creating your first assessment"
              actionLabel="Create Assessment"
              onAction={() => navigate('/bilan')}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={assessments}
              loading={isLoading}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                total: data?.total || 0,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} assessments`,
                responsive: true,
              }}
            />
          )}
        </Card>
      </Space>
    </PageWrapper>
  );
};

export default AssessmentsList;

