import React from 'react';
import { Show, TextField, DateField, TagField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { useParams } from 'react-router-dom';
import { Typography, Space, Tag, Card } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Title, Text } = Typography;

const RolesShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { queryResult } = useShow({
    resource: 'roles',
    id: id,
  });
  
  // Guard against undefined queryResult
  if (!queryResult) {
    return (
      <PermissionGuard resource="roles" action="read">
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
      <PermissionGuard resource="roles" action="read">
        <Show isLoading={false}>
          <Text type="danger">Error loading role: {error?.message || 'Unknown error'}</Text>
        </Show>
      </PermissionGuard>
    );
  }

  const record = data?.data;

  // Group permissions by resource
  const permissionsByResource = record?.permissions?.reduce((acc: any, perm: any) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, any[]>) || {};

  return (
    <PermissionGuard resource="roles" action="read">
      <Show isLoading={isLoading}>
      <Title level={5}>Name</Title>
      <TextField value={record?.name} />

      <Title level={5}>Description</Title>
      <TextField value={record?.description || 'No description'} />

      <Title level={5}>Type</Title>
      <TagField
        value={record?.isSystem ? 'System Role' : 'Custom Role'}
        color={record?.isSystem ? 'red' : 'blue'}
      />

      <Title level={5}>Permissions</Title>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {Object.entries(permissionsByResource).map(([resource, perms]) => (
          <Card key={resource} size="small" title={resource}>
            <Space wrap>
              {perms.map((perm: any, index: number) => (
                <Tag key={index} color="green">
                  {perm.action}
                </Tag>
              ))}
            </Space>
          </Card>
        ))}
        {Object.keys(permissionsByResource).length === 0 && (
          <Text type="secondary">No permissions assigned</Text>
        )}
      </Space>

      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} format="LLL" />
      </Show>
    </PermissionGuard>
  );
};

export default RolesShow;

