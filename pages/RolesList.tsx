import React from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import type { ColumnsType } from 'antd/es/table';

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  permissions?: Array<{ id: string; resource: string; action: string }>;
}

const RolesList: React.FC = () => {
  const { tableProps } = useTable<Role>({
    resource: 'roles',
  });

  const columns: ColumnsType<Role> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Type',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (isSystem: boolean) => (
        <Tag color={isSystem ? 'red' : 'blue'}>
          {isSystem ? 'System' : 'Custom'}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: Array<{ resource: string; action: string }>) => (
        <Space wrap>
          {permissions?.slice(0, 3).map((perm, index) => (
            <Tag key={index} color="green" style={{ fontSize: '11px' }}>
              {perm.resource}:{perm.action}
            </Tag>
          ))}
          {permissions && permissions.length > 3 && (
            <Tag color="default">+{permissions.length - 3} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          {!record.isSystem && (
            <>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PermissionGuard resource="roles" action="read">
      <List
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <PermissionGuard resource="roles" action="create" showError={false}>
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
            showTotal: (total) => `Total ${total} roles`,
          }}
        />
      </List>
    </PermissionGuard>
  );
};

export default RolesList;

