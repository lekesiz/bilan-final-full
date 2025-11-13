import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import RolesForm from './RolesForm';

const RolesEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <PermissionGuard resource="roles" action="update">
      <Edit saveButtonProps={saveButtonProps}>
        <RolesForm formProps={formProps} saveButtonProps={saveButtonProps} />
      </Edit>
    </PermissionGuard>
  );
};

export default RolesEdit;

