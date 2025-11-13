import React from 'react';
import { Show, TextField, DateField, TagField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Space, Tag, Card } from 'antd';

const { Title, Text } = Typography;

const RolesShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

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
  );
};

export default RolesShow;

