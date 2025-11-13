import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDelete } from '@refinedev/core';
import { confirmDelete } from './ConfirmDelete';
import { useTranslation } from 'react-i18next';

interface CustomDeleteButtonProps {
  resource: string;
  recordItemId: string;
  recordName?: string;
  hideText?: boolean;
  size?: 'small' | 'middle' | 'large';
  onSuccess?: () => void;
}

export const CustomDeleteButton: React.FC<CustomDeleteButtonProps> = ({
  resource,
  recordItemId,
  recordName,
  hideText = false,
  size = 'small',
  onSuccess,
}) => {
  const { mutate, isLoading } = useDelete();
  const { t } = useTranslation();

  const handleDelete = () => {
    confirmDelete({
      title: t('common.confirmDelete', 'Confirm Delete'),
      content: recordName
        ? t('common.deleteConfirmMessage', 'Are you sure you want to delete "{{name}}"? This action cannot be undone.', { name: recordName })
        : t('common.deleteConfirmMessageGeneric', 'Are you sure you want to delete this item? This action cannot be undone.'),
      okText: t('common.delete', 'Delete'),
      cancelText: t('common.cancel', 'Cancel'),
      onConfirm: async () => {
        await mutate(
          {
            resource,
            id: recordItemId,
          },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      },
    });
  };

  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      onClick={handleDelete}
      loading={isLoading}
      size={size}
      {...(hideText ? { type: 'text' } : {})}
    >
      {!hideText && t('common.delete', 'Delete')}
    </Button>
  );
};

