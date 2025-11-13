import React, { useState } from 'react';
import { Button, Dropdown, Space, message } from 'antd';
import { DeleteOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../services/apiClient';
import { confirmDelete } from './ConfirmDelete';

interface BulkActionsProps {
  selectedRowKeys: React.Key[];
  resource: 'users' | 'roles' | 'assessments';
  onSuccess?: () => void;
  onRefresh?: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedRowKeys,
  resource,
  onSuccess,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const api = useApi();
  const [loading, setLoading] = useState(false);

  const selectedCount = selectedRowKeys.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    confirmDelete({
      title: t('bulk.deleteConfirm', 'Delete Selected Items'),
      content: t('bulk.deleteConfirmMessage', 'Are you sure you want to delete {{count}} selected item(s)? This action cannot be undone.', { count: selectedCount }),
      okText: t('common.delete', 'Delete'),
      cancelText: t('common.cancel', 'Cancel'),
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await api.bulkDelete(selectedRowKeys as string[], resource);
          message.success(
            t('bulk.deleteSuccess', 'Successfully deleted {{count}} item(s)', { count: result.deletedCount })
          );
          onSuccess?.();
          onRefresh?.();
        } catch (error: any) {
          message.error(
            error?.message || t('bulk.deleteError', 'Failed to delete items')
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleBulkActivate = async (isActive: boolean) => {
    if (resource !== 'users') {
      message.warning(t('bulk.activateNotSupported', 'Bulk activate/deactivate is only supported for users'));
      return;
    }

    setLoading(true);
    try {
      const result = await api.bulkUpdate(selectedRowKeys as string[], resource, { isActive });
      message.success(
        t('bulk.updateSuccess', 'Successfully updated {{count}} item(s)', { count: result.updatedCount })
      );
      onSuccess?.();
      onRefresh?.();
    } catch (error: any) {
      message.error(
        error?.message || t('bulk.updateError', 'Failed to update items')
      );
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'delete',
      label: t('bulk.delete', 'Delete Selected'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleBulkDelete,
    },
    ...(resource === 'users' ? [
      {
        key: 'activate',
        label: t('bulk.activate', 'Activate Selected'),
        icon: <CheckCircleOutlined />,
        onClick: () => handleBulkActivate(true),
      },
      {
        key: 'deactivate',
        label: t('bulk.deactivate', 'Deactivate Selected'),
        icon: <CloseCircleOutlined />,
        onClick: () => handleBulkActivate(false),
      },
    ] : []),
  ];

  return (
    <Space>
      <span style={{ marginRight: 8 }}>
        {t('bulk.selectedCount', '{{count}} selected', { count: selectedCount })}
      </span>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
      >
        <Button icon={<MoreOutlined />} loading={loading}>
          {t('bulk.actions', 'Bulk Actions')}
        </Button>
      </Dropdown>
    </Space>
  );
};

