import React, { useEffect, useState } from 'react';
import { useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Checkbox, Card, Typography, Space, Divider, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';

const { Title, Text } = Typography;

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

interface RolesFormProps {
  formProps: FormProps;
  saveButtonProps: {
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
  };
}

const RolesForm: React.FC<RolesFormProps> = ({ formProps, saveButtonProps }) => {
  const { selectProps: permissionSelectProps } = useSelect<Permission>({
    resource: 'permissions',
    optionLabel: (item) => `${item.resource}:${item.action}`,
    optionValue: 'id',
  });

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  // Use formProps.form if available, otherwise try Form.useFormInstance()
  // But guard against undefined in all usages
  let form: any = null;
  try {
    form = formProps.form || Form.useFormInstance();
  } catch (e) {
    // Form instance not available yet, will be set when Form is mounted
    form = null;
  }

  // Fetch all permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem('bilan_auth_token');
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/permissions`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        if (data.data && data.data.permissions) {
          setPermissions(data.data.permissions);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    fetchPermissions();
  }, []);

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get initial permission IDs from form
  useEffect(() => {
    if (!form) return; // Guard against undefined form
    try {
      const initialPermissionIds = form.getFieldValue('permissionIds');
      if (initialPermissionIds && Array.isArray(initialPermissionIds)) {
        setSelectedPermissionIds(initialPermissionIds);
      }
    } catch (e) {
      // Form not ready yet, ignore
    }
  }, [form]);

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (!form) return; // Guard against undefined form
    const newSelected = checked
      ? [...selectedPermissionIds, permissionId]
      : selectedPermissionIds.filter(id => id !== permissionId);
    
    setSelectedPermissionIds(newSelected);
    form.setFieldValue('permissionIds', newSelected);
  };

  return (
    <Form {...formProps} layout="vertical">
      <Form.Item
        label={
          <Space>
            Role Name
            <Tooltip title="A unique identifier for this role (e.g., manager, editor)">
              <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          </Space>
        }
        name="name"
        rules={[{ required: true, message: 'Please enter role name' }]}
      >
        <Input placeholder="e.g., manager, editor" />
      </Form.Item>

      <Form.Item
        label={
          <Space>
            Description
            <Tooltip title="Optional description explaining the purpose of this role">
              <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          </Space>
        }
        name="description"
      >
        <Input.TextArea rows={3} placeholder="Describe the role's purpose" />
      </Form.Item>

      <Form.Item name="permissionIds" hidden>
        <Input />
      </Form.Item>

      <Divider />

      <Title level={5}>Permissions</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Select the permissions for this role
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
          <Card key={resource} size="small" title={resource}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {resourcePermissions.map((perm) => (
                <Checkbox
                  key={perm.id}
                  checked={selectedPermissionIds.includes(perm.id)}
                  onChange={(e) => handlePermissionToggle(perm.id, e.target.checked)}
                >
                  <Space>
                    <Text strong>{perm.action}</Text>
                    {perm.description && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        - {perm.description}
                      </Text>
                    )}
                  </Space>
                </Checkbox>
              ))}
            </Space>
          </Card>
        ))}
      </Space>
    </Form>
  );
};

export default RolesForm;

