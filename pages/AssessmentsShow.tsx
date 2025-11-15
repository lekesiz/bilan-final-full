import React from 'react';
import { Show, TextField, DateField, TagField, NumberField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Space, Tag, Card, Progress } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import { FileTextOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AssessmentsShow: React.FC = () => {
  const { queryResult } = useShow({
    resource: 'assessments',
  });
  
  // Guard against undefined queryResult
  if (!queryResult) {
    return (
      <PermissionGuard resource="bilan:assessment" action="read">
        <Show isLoading={true}>
          <Text type="secondary">Loading...</Text>
        </Show>
      </PermissionGuard>
    );
  }

  const { data, isLoading, isError, error } = queryResult;

  // Guard against undefined data
  if (isError) {
    return (
      <PermissionGuard resource="bilan:assessment" action="read">
        <Show isLoading={false}>
          <Text type="danger">Error loading assessment: {error?.message || 'Unknown error'}</Text>
        </Show>
      </PermissionGuard>
    );
  }

  const record = data?.data;

  const progress = record?.totalQuestions 
    ? Math.round((record.currentQuestionIndex / record.totalQuestions) * 100)
    : 0;

  const statusColors: Record<string, string> = {
    completed: 'green',
    in_progress: 'blue',
    abandoned: 'red',
  };

  const coachingStyleColors: Record<string, string> = {
    collaborative: 'blue',
    analytic: 'purple',
    creative: 'pink',
  };

  return (
    <PermissionGuard resource="bilan:assessment" action="read">
      <Show isLoading={isLoading}>
        <Title level={5}>
          <UserOutlined /> User Name
        </Title>
        <TextField value={record?.userName} />

        <Title level={5}>
          <FileTextOutlined /> Package
        </Title>
        <TagField value={record?.packageName} color="blue" />

        <Title level={5}>Coaching Style</Title>
        <TagField 
          value={record?.coachingStyle?.charAt(0).toUpperCase() + record?.coachingStyle?.slice(1)} 
          color={coachingStyleColors[record?.coachingStyle] || 'default'}
        />

        <Title level={5}>Status</Title>
        <TagField
          value={record?.status === 'completed' ? 'Completed' : 
                 record?.status === 'in_progress' ? 'In Progress' : 
                 record?.status === 'abandoned' ? 'Abandoned' : 
                 record?.status}
          color={statusColors[record?.status] || 'default'}
        />

        {record?.status === 'in_progress' && (
          <>
            <Title level={5}>Progress</Title>
            <Card>
              <Progress 
                percent={progress} 
                status="active"
                format={(percent) => `${record?.currentQuestionIndex || 0} / ${record?.totalQuestions || 0} questions`}
              />
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                {progress}% completed
              </Text>
            </Card>
          </>
        )}

        <Title level={5}>Questions</Title>
        <Space>
          <NumberField value={record?.currentQuestionIndex || 0} />
          <Text type="secondary">of</Text>
          <NumberField value={record?.totalQuestions || 0} />
        </Space>

        <Title level={5}>
          <CalendarOutlined /> Started At
        </Title>
        <DateField value={record?.startedAt} format="LLL" />

        {record?.completedAt && (
          <>
            <Title level={5}>
              <CalendarOutlined /> Completed At
            </Title>
            <DateField value={record?.completedAt} format="LLL" />
          </>
        )}

        {record?.lastActivityAt && (
          <>
            <Title level={5}>Last Activity</Title>
            <DateField value={record?.lastActivityAt} format="LLL" />
          </>
        )}

        {record?.userProfile && (
          <>
            <Title level={5}>User Profile</Title>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                {record.userProfile.fullName && (
                  <div>
                    <Text strong>Full Name: </Text>
                    <Text>{record.userProfile.fullName}</Text>
                  </div>
                )}
                {record.userProfile.currentRole && (
                  <div>
                    <Text strong>Current Role: </Text>
                    <Text>{record.userProfile.currentRole}</Text>
                  </div>
                )}
                {record.userProfile.keySkills && record.userProfile.keySkills.length > 0 && (
                  <div>
                    <Text strong>Key Skills: </Text>
                    <Space wrap>
                      {record.userProfile.keySkills.map((skill: string, index: number) => (
                        <Tag key={index} color="green">{skill}</Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          </>
        )}

        <Title level={5}>Created At</Title>
        <DateField value={record?.createdAt} format="LLL" />
      </Show>
    </PermissionGuard>
  );
};

export default AssessmentsShow;

