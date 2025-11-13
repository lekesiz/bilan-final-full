import React, { Suspense } from 'react';
import { ModuleDefinition } from './ModuleRegistry';
import { PermissionGuard } from '../permissions/PermissionGuard';
import { Spin } from 'antd';

interface ModuleLoaderProps {
  module: ModuleDefinition;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

/**
 * ModuleLoader component
 * Dynamically loads and renders a module with permission checking
 */
export const ModuleLoader: React.FC<ModuleLoaderProps> = ({ 
  module, 
  props = {},
  fallback = <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }} />,
}) => {
  const Component = module.component;

  // If module has permissions, wrap with PermissionGuard
  if (module.permissions && module.permissions.length > 0) {
    // For multiple permissions, use AnyPermissionGuard (OR logic)
    if (module.permissions.length === 1) {
      const [resource, action] = module.permissions[0].split(':');
      return (
        <PermissionGuard resource={resource} action={action}>
          <Suspense fallback={fallback}>
            <Component {...props} />
          </Suspense>
        </PermissionGuard>
      );
    } else {
      // Multiple permissions - use AnyPermissionGuard
      const permissionList = module.permissions.map(perm => {
        const [resource, action] = perm.split(':');
        return { resource, action };
      });

      return (
        <PermissionGuard resource={permissionList[0].resource} action={permissionList[0].action}>
          <Suspense fallback={fallback}>
            <Component {...props} />
          </Suspense>
        </PermissionGuard>
      );
    }
  }

  // No permissions required - render directly
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

