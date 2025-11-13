import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteOptions {
  title?: string;
  content: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const confirmDelete = ({
  title,
  content,
  okText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDeleteOptions) => {
  // Note: useTranslation hook cannot be used here as this is not a React component
  // We'll use default English text or pass translated text from the caller
  const defaultTitle = title || 'Confirm Delete';
  const defaultOkText = okText || 'Delete';
  const defaultCancelText = cancelText || 'Cancel';
  
  Modal.confirm({
    title: defaultTitle,
    icon: React.createElement(ExclamationCircleOutlined, { style: { color: '#ff4d4f' } }),
    content,
    okText: defaultOkText,
    okType: 'danger',
    cancelText: defaultCancelText,
    onOk: async () => {
      try {
        await onConfirm();
      } catch (error) {
        // Error handling is done by the caller
        throw error;
      }
    },
    onCancel,
  });
};

