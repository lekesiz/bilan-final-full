import React from 'react';
import { Show, TextField, DateField, TagField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Space, Tag } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Title } = Typography;

const UsersShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <PermissionGuard resource="users" action="read">
      <Show isLoading={isLoading}>
      <Title level={5}>Name</Title>
      <TextField value={record?.name} />

      <Title level={5}>Email</Title>
      <TextField value={record?.email} />

      <Title level={5}>Status</Title>
      <TagField
        value={record?.isActive ? 'Active' : 'Inactive'}
        color={record?.isActive ? 'green' : 'red'}
      />

      <Title level={5}>Roles</Title>
      <Space>
        {record?.roles?.map((role: { id: string; name: string }, index: number) => (
          <Tag key={index} color="blue">
            {role.name}
          </Tag>
        ))}
      </Space>

      <Title level={5}>Last Login</Title>
      <DateField value={record?.lastLoginAt} format="LLL" />

      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} format="LLL" />
      </Show>
    </PermissionGuard>
  );
};

export default UsersShow;

