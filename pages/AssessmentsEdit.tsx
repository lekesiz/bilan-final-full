import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber } from 'antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

const { Option } = Select;

const AssessmentsEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <PermissionGuard resource="bilan:assessment" action="update">
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="User Name"
            name="userName"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="abandoned">Abandoned</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Current Question Index"
            name="currentQuestionIndex"
            rules={[
              { required: true, message: 'Please enter current question index' },
              { type: 'number', min: 0, message: 'Must be 0 or greater' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Total Questions"
            name="totalQuestions"
            rules={[
              { required: true, message: 'Please enter total questions' },
              { type: 'number', min: 1, message: 'Must be at least 1' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Package Name"
            name="packageName"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Coaching Style"
            name="coachingStyle"
          >
            <Select>
              <Option value="collaborative">Collaborative</Option>
              <Option value="analytic">Analytic</Option>
              <Option value="creative">Creative</Option>
            </Select>
          </Form.Item>
        </Form>
      </Edit>
    </PermissionGuard>
  );
};

export default AssessmentsEdit;

