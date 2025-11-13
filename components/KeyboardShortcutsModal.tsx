import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const KeyboardShortcutsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? '⌘' : 'Ctrl';

    setShortcuts([
      {
        category: t('shortcuts.navigation', 'Navigation'),
        keys: [`${modifier} + K`],
        description: t('shortcuts.commandPalette', 'Open command palette'),
      },
      {
        category: t('shortcuts.navigation', 'Navigation'),
        keys: [`${modifier} + N`],
        description: t('shortcuts.newAssessment', 'Create new assessment'),
      },
      {
        category: t('shortcuts.navigation', 'Navigation'),
        keys: [`${modifier} + /`],
        description: t('shortcuts.showShortcuts', 'Show keyboard shortcuts'),
      },
      {
        category: t('shortcuts.general', 'General'),
        keys: ['Esc'],
        description: t('shortcuts.closeModal', 'Close modal or cancel action'),
      },
      {
        category: t('shortcuts.general', 'General'),
        keys: ['Enter'],
        description: t('shortcuts.submitForm', 'Submit form or confirm action'),
      },
    ]);
  }, [t]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Modal
      title={t('shortcuts.title', 'Keyboard Shortcuts')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {Object.entries(groupedShortcuts).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <Title level={5}>{category}</Title>
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text>{item.description}</Text>
                    <Space>
                      {item.keys.map((key, index) => (
                        <React.Fragment key={index}>
                          <Tag style={{ fontFamily: 'monospace' }}>{key}</Tag>
                          {index < item.keys.length - 1 && <span>or</span>}
                        </React.Fragment>
                      ))}
                    </Space>
                  </div>
                </List.Item>
              )}
            />
            <Divider style={{ margin: '16px 0' }} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {t('shortcuts.tip', 'Tip: Press Ctrl+/ (or ⌘+/) anytime to open this help')}
        </Text>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsModal;

