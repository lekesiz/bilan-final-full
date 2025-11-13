import React from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles?: Array<{ id: string; name: string }>;
}

const UsersList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<User>({
    resource: 'users',
    onSearch: (values) => {
      return [
        {
          field: 'search',
          operator: 'contains',
          value: values.search,
        },
      ];
    },
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Array<{ name: string }>) => (
        <Space>
          {roles?.map((role, index) => (
            <Tag key={index} color="blue">
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <DeleteButton hideText size="small" recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <PermissionGuard resource="users" action="read">
      <List
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <PermissionGuard resource="users" action="create" showError={false}>
              <CreateButton />
            </PermissionGuard>
          </>
        )}
      >
        <Table 
          {...tableProps} 
          columns={columns} 
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            ...tableProps.pagination,
            responsive: true,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </List>
    </PermissionGuard>
  );
};

export default UsersList;

