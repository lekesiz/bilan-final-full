import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import RolesForm from './RolesForm';

const RolesCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'roles',
  });

  return (
    <PermissionGuard resource="roles" action="create">
      <Create saveButtonProps={saveButtonProps}>
        <RolesForm formProps={formProps} saveButtonProps={saveButtonProps} />
      </Create>
    </PermissionGuard>
  );
};

export default RolesCreate;

