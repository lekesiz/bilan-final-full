import React, { useState } from 'react';
import { Card, Tabs, Form, Switch, Select, Button, Space, Typography, Divider, Alert, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGetIdentity } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SettingsState {
  notifications: {
    email: boolean;
    browser: boolean;
    assessmentReminders: boolean;
  };
  timezone: string;
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: localStorage.getItem('settings.emailNotifications') !== 'false',
      browser: localStorage.getItem('settings.browserNotifications') !== 'false',
      assessmentReminders: localStorage.getItem('settings.assessmentReminders') !== 'true',
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleNotificationChange = (key: keyof SettingsState['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    setSettings(newSettings);
    localStorage.setItem(`settings.${key}`, value.toString());
  };

  const handleTimezoneChange = (value: string) => {
    setSettings({ ...settings, timezone: value });
    localStorage.setItem('settings.timezone', value);
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: t('settings.deleteAccountConfirm', 'Delete Account'),
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: t('settings.deleteAccountWarning', 'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'),
      okText: t('settings.delete', 'Delete'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Cancel'),
      onOk: async () => {
        // Account deletion feature - to be implemented when API endpoint is available
        // await api.deleteAccount();
        // logout();
        // navigate('/login');
        message.warning(t('settings.deleteAccountNotImplemented', 'Account deletion feature is not yet available'));
      },
    });
  };

  const handleDownloadData = async () => {
    // GDPR data export feature - to be implemented when API endpoint is available
    // const data = await api.exportUserData();
    // const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `bilan-data-${new Date().toISOString()}.json`;
    // a.click();
    // URL.revokeObjectURL(url);
    message.warning(t('settings.downloadDataNotImplemented', 'Data export feature is not yet available'));
  };

  const timezones = [
    'UTC',
    'Europe/Paris',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Istanbul',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  // Settings page should be accessible to all authenticated users (no permission check needed)
  // But we'll keep PermissionGuard with a fallback to handle loading states
  return (
    <PermissionGuard resource="users" action="read" showError={false} fallback={null}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {t('settings.title', 'Settings')}
              </Title>
              <Text type="secondary">
                {t('settings.subtitle', 'Manage your account settings and preferences')}
              </Text>
            </div>

            <Divider />

            <Tabs
              defaultActiveKey="general"
              items={[
                {
                  key: 'general',
                  label: t('settings.general', 'General'),
                  children: (
                    <Form form={form} layout="vertical">
                      <Form.Item
                        label={
                          <Space>
                            {t('settings.language', 'Language')}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ({t('settings.languageDesc', 'Change the interface language')})
                            </Text>
                          </Space>
                        }
                      >
                        <LanguageSwitcher />
                      </Form.Item>


                      <Form.Item
                        label={t('settings.timezone', 'Timezone')}
                        help={t('settings.timezoneHelp', 'Used for displaying dates and times')}
                      >
                        <Select
                          value={settings.timezone}
                          onChange={handleTimezoneChange}
                          style={{ width: '100%', maxWidth: 300 }}
                        >
                          {timezones.map(tz => (
                            <Option key={tz} value={tz}>
                              {tz}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'notifications',
                  label: t('settings.notifications', 'Notifications'),
                  children: (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div>
                        <Title level={5}>{t('settings.notificationPreferences', 'Notification Preferences')}</Title>
                        <Text type="secondary">
                          {t('settings.notificationDesc', 'Choose how you want to be notified about important updates')}
                        </Text>
                      </div>

                      <Card size="small">
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>{t('settings.emailNotifications', 'Email Notifications')}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {t('settings.emailNotificationsDesc', 'Receive email updates about your assessments')}
                              </Text>
                            </div>
                            <Switch
                              checked={settings.notifications.email}
                              onChange={(checked) => handleNotificationChange('email', checked)}
                            />
                          </div>

                          <Divider style={{ margin: '12px 0' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>{t('settings.browserNotifications', 'Browser Notifications')}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {t('settings.browserNotificationsDesc', 'Receive browser notifications for real-time updates')}
                              </Text>
                            </div>
                            <Switch
                              checked={settings.notifications.browser}
                              onChange={(checked) => handleNotificationChange('browser', checked)}
                            />
                          </div>

                          <Divider style={{ margin: '12px 0' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>{t('settings.assessmentReminders', 'Assessment Reminders')}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {t('settings.assessmentRemindersDesc', 'Get reminders to continue your in-progress assessments')}
                              </Text>
                            </div>
                            <Switch
                              checked={settings.notifications.assessmentReminders}
                              onChange={(checked) => handleNotificationChange('assessmentReminders', checked)}
                            />
                          </div>
                        </Space>
                      </Card>
                    </Space>
                  ),
                },
                {
                  key: 'privacy',
                  label: t('settings.privacy', 'Privacy'),
                  children: (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div>
                        <Title level={5}>{t('settings.dataManagement', 'Data Management')}</Title>
                        <Text type="secondary">
                          {t('settings.dataManagementDesc', 'Manage your personal data and account')}
                        </Text>
                      </div>

                      <Card size="small">
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong>{t('settings.downloadData', 'Download My Data (GDPR)')}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {t('settings.downloadDataDesc', 'Export all your personal data in JSON format')}
                            </Text>
                            <br />
                            <Button
                              type="default"
                              onClick={handleDownloadData}
                              style={{ marginTop: 8 }}
                            >
                              {t('settings.download', 'Download Data')}
                            </Button>
                          </div>

                          <Divider />

                          <div>
                            <Text strong type="danger">{t('settings.deleteAccount', 'Delete Account')}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {t('settings.deleteAccountDesc', 'Permanently delete your account and all associated data')}
                            </Text>
                            <br />
                            <Button
                              danger
                              onClick={handleDeleteAccount}
                              style={{ marginTop: 8 }}
                            >
                              {t('settings.delete', 'Delete Account')}
                            </Button>
                          </div>
                        </Space>
                      </Card>

                      <Alert
                        message={t('settings.privacyNote', 'Privacy Note')}
                        description={t('settings.privacyNoteDesc', 'Your data is encrypted and stored securely. We comply with GDPR regulations.')}
                        type="info"
                        showIcon
                      />
                    </Space>
                  ),
                },
              ]}
            />
          </Space>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default Settings;

