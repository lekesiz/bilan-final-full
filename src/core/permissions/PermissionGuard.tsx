import React from 'react';
import { usePermissions } from './usePermissions';
import { Alert, Result } from 'antd';
import { StopOutlined } from '@ant-design/icons';

interface PermissionGuardProps {
  /**
   * Resource name (e.g., 'users', 'bilan:assessment')
   */
  resource: string;
  /**
   * Action name (e.g., 'create', 'read', 'update', 'delete')
   */
  action: string;
  /**
   * Children to render if permission is granted
   */
  children: React.ReactNode;
  /**
   * Fallback component to render if permission is denied
   * If not provided, shows default access denied message
   */
  fallback?: React.ReactNode;
  /**
   * Show error message or hide completely
   * @default true
   */
  showError?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
}

/**
 * PermissionGuard component
 * Renders children only if user has the required permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback,
  showError = true,
  errorMessage,
}) => {
  const { canAccess, isLoading } = usePermissions();

  if (isLoading) {
    return <div style={{ padding: '24px' }}>Loading...</div>; // Return a valid React element instead of null
  }

  if (!canAccess(resource, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showError) {
      return null;
    }

    return (
      <Alert
        message="Access Denied"
        description={errorMessage || `You don't have permission to ${action} ${resource}`}
        type="error"
        icon={<StopOutlined />}
        showIcon
      />
    );
  }

  return <>{children}</>;
};

/**
 * PermissionGuard with multiple permissions (OR logic)
 * Renders children if user has ANY of the specified permissions
 */
interface AnyPermissionGuardProps {
  permissions: Array<{ resource: string; action: string }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

export const AnyPermissionGuard: React.FC<AnyPermissionGuardProps> = ({
  permissions,
  children,
  fallback,
  showError = true,
  errorMessage,
}) => {
  const { canAccessAny, isLoading } = usePermissions();

  if (isLoading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (!canAccessAny(permissions)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showError) {
      return null;
    }

    return (
      <Alert
        message="Access Denied"
        description={errorMessage || 'You don\'t have the required permissions'}
        type="error"
        icon={<StopOutlined />}
        showIcon
      />
    );
  }

  return <>{children}</>;
};

/**
 * PermissionGuard with multiple permissions (AND logic)
 * Renders children if user has ALL of the specified permissions
 */
interface AllPermissionGuardProps {
  permissions: Array<{ resource: string; action: string }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

export const AllPermissionGuard: React.FC<AllPermissionGuardProps> = ({
  permissions,
  children,
  fallback,
  showError = true,
  errorMessage,
}) => {
  const { canAccessAll, isLoading } = usePermissions();

  if (isLoading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (!canAccessAll(permissions)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showError) {
      return null;
    }

    return (
      <Alert
        message="Access Denied"
        description={errorMessage || 'You don\'t have all required permissions'}
        type="error"
        icon={<StopOutlined />}
        showIcon
      />
    );
  }

  return <>{children}</>;
};

