import React, { useState } from 'react';
import { List, useTable, EditButton, ShowButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import { CustomDeleteButton } from '../src/core/components/CustomDeleteButton';
import { TableSkeleton } from '../src/core/components/TableSkeleton';
import { NoUsersFound } from '../src/core/components/ContextualEmptyStates';
import { BulkActions } from '../src/core/components/BulkActions';
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { tableProps, searchFormProps, refetch } = useTable<User>({
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
          <PermissionGuard resource="users" action="read" showError={false}>
            <ShowButton hideText size="small" recordItemId={record.id} />
          </PermissionGuard>
          <PermissionGuard resource="users" action="update" showError={false}>
            <EditButton hideText size="small" recordItemId={record.id} />
          </PermissionGuard>
          <PermissionGuard resource="users" action="delete" showError={false}>
            <CustomDeleteButton
              resource="users"
              recordItemId={record.id}
              recordName={record.name || record.email}
              hideText
              size="small"
            />
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  if (tableProps.loading) {
    return (
      <PermissionGuard resource="users" action="read">
        <List>
          <TableSkeleton columns={6} rows={10} />
        </List>
      </PermissionGuard>
    );
  }

  const users = tableProps.dataSource || [];

  return (
    <PermissionGuard resource="users" action="read">
      <List
        headerButtons={({ defaultButtons }) => (
          <>
            <BulkActions
              selectedRowKeys={selectedRowKeys}
              resource="users"
              onSuccess={() => {
                setSelectedRowKeys([]);
                refetch();
              }}
              onRefresh={refetch}
            />
            {defaultButtons}
            <PermissionGuard resource="users" action="create" showError={false}>
              <CreateButton />
            </PermissionGuard>
          </>
        )}
      >
        {users.length === 0 ? (
          <NoUsersFound />
        ) : (
          <Table 
            {...tableProps} 
            columns={columns} 
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            scroll={{ x: 'max-content' }}
            pagination={{
              ...tableProps.pagination,
              responsive: true,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        )}
      </List>
    </PermissionGuard>
  );
};

export default UsersList;

