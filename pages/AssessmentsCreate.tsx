import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Option } = Select;

const AssessmentsCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <PermissionGuard resource="bilan:assessment" action="create">
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="User Name"
            name="userName"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Package"
            name="packageId"
            rules={[{ required: true, message: 'Please select a package' }]}
          >
            <Select placeholder="Select package">
              <Option value="decouverte">Découverte</Option>
              <Option value="approfondi">Approfondi</Option>
              <Option value="strategique">Stratégique</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Package Name"
            name="packageName"
            rules={[{ required: true, message: 'Please enter package name' }]}
          >
            <Input placeholder="Enter package name" />
          </Form.Item>

          <Form.Item
            label="Coaching Style"
            name="coachingStyle"
            rules={[{ required: true, message: 'Please select coaching style' }]}
          >
            <Select placeholder="Select coaching style">
              <Option value="collaborative">Collaborative</Option>
              <Option value="analytic">Analytic</Option>
              <Option value="creative">Creative</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Total Questions"
            name="totalQuestions"
            rules={[
              { required: true, message: 'Please enter total questions' },
              { type: 'number', min: 1, message: 'Must be at least 1' },
            ]}
          >
            <Input type="number" placeholder="Enter total questions" />
          </Form.Item>
        </Form>
      </Create>
    </PermissionGuard>
  );
};

export default AssessmentsCreate;

