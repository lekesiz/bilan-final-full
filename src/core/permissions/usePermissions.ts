import { useMemo } from 'react';
import { useGetIdentity } from '@refinedev/core';
import { useApi } from '../../../services/apiClient';

interface Permission {
  resource: string;
  action: string;
}

/**
 * Custom hook for permission checking
 * Provides convenient methods to check user permissions
 */
export const usePermissions = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const api = useApi();
  
  // Get permissions from localStorage (set by authProvider)
  const permissions = useMemo(() => {
    try {
      const stored = localStorage.getItem('bilan_permissions');
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to parse permissions from localStorage:', error);
      }
    }
    return [];
  }, []);

  // Return isLoading state
  const isLoading = identityLoading;

  // Convert permission strings to objects for easier checking
  const permissionObjects = useMemo(() => {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    return permissions.map((perm: string) => {
      const [resource, action] = perm.split(':');
      return { resource, action };
    });
  }, [permissions]);

  /**
   * Check if user has a specific permission
   * @param resource - Resource name (e.g., 'users', 'bilan:assessment')
   * @param action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns boolean
   */
  const canAccess = (resource: string, action: string): boolean => {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    const requiredPermission = `${resource}:${action}`;
    return permissions.includes(requiredPermission);
  };

  /**
   * Check if user has any of the specified permissions (OR logic)
   * @param permissionList - Array of { resource, action } objects
   * @returns boolean
   */
  const canAccessAny = (permissionList: Permission[]): boolean => {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    return permissionList.some(perm => {
      const requiredPermission = `${perm.resource}:${perm.action}`;
      return permissions.includes(requiredPermission);
    });
  };

  /**
   * Check if user has all of the specified permissions (AND logic)
   * @param permissionList - Array of { resource, action } objects
   * @returns boolean
   */
  const canAccessAll = (permissionList: Permission[]): boolean => {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    return permissionList.every(perm => {
      const requiredPermission = `${perm.resource}:${perm.action}`;
      return permissions.includes(requiredPermission);
    });
  };

  /**
   * Check if user can access a specific module
   * This checks if user has any permission related to the module
   * @param moduleName - Module name (e.g., 'users', 'assessments')
   * @returns boolean
   */
  const canAccessModule = (moduleName: string): boolean => {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    // Check if user has any permission for this module
    return permissions.some(perm => {
      const [resource] = perm.split(':');
      return resource.includes(moduleName) || resource === moduleName;
    });
  };

  /**
   * Get all permissions for a specific resource
   * @param resource - Resource name
   * @returns Array of action strings
   */
  const getResourcePermissions = (resource: string): string[] => {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    return permissions
      .filter(perm => {
        const [permResource] = perm.split(':');
        return permResource === resource;
      })
      .map(perm => {
        const [, action] = perm.split(':');
        return action;
      });
  };

  return {
    permissions: permissionObjects,
    permissionStrings: permissions || [],
    canAccess,
    canAccessAny,
    canAccessAll,
    canAccessModule,
    getResourcePermissions,
    isLoading: isLoading || false, // Use the isLoading state we defined
  };
};

