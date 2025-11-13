import React from 'react';
import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Switch } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const UsersCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: roleSelectProps } = useSelect({
    resource: 'roles',
    optionLabel: 'name',
    optionValue: 'id',
  });

  return (
    <PermissionGuard resource="users" action="create">
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Roles"
          name="roleIds"
        >
          <Select
            {...roleSelectProps}
            mode="multiple"
            placeholder="Select roles"
          />
        </Form.Item>

        <Form.Item
          label="Active"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
    </PermissionGuard>
  );
};

export default UsersCreate;

