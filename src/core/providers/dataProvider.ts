import { DataProvider } from '@refinedev/core';
import type { useApi } from '../../services/apiClient';

// Custom data provider for BILAN-EASY API
export const createDataProvider = (api: ReturnType<typeof useApi>): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const offset = (current - 1) * pageSize;

    try {
      let response;
      
      switch (resource) {
        case 'assessments':
          response = await api.getAssessments({
            limit: pageSize,
            offset,
            ...(filters?.find(f => f.field === 'status')?.value && {
              status: filters.find(f => f.field === 'status')?.value as string,
            }),
          });
          break;
        case 'users':
          response = await api.getUsers({
            limit: pageSize,
            offset,
            ...(filters?.find(f => f.field === 'search')?.value && {
              search: filters.find(f => f.field === 'search')?.value as string,
            }),
          });
          break;
        case 'roles':
          response = await api.getRoles({
            limit: pageSize,
            offset,
          });
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      // Handle different response formats
      let data: any[];
      let total: number;
      
      if (resource === 'users') {
        data = response.data?.users || response.users || [];
        total = response.data?.pagination?.total || response.pagination?.total || data.length;
      } else if (resource === 'roles') {
        data = response.data?.roles || response.roles || (Array.isArray(response.data) ? response.data : []);
        total = response.data?.pagination?.total || response.pagination?.total || data.length;
      } else {
        data = response.data || (Array.isArray(response) ? response : []);
        total = response.pagination?.total || data.length;
      }

      return {
        data: Array.isArray(data) ? data : (data?.assessments || data?.users || data?.roles || []),
        total,
      };
    } catch (error: any) {
      // Better error handling
      console.error(`Error fetching ${resource} list:`, error);
      
      // If unauthorized, clear auth and redirect
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized')) {
        localStorage.removeItem('bilan_auth_token');
        localStorage.removeItem('bilan_user_id');
        localStorage.removeItem('bilan_user_name');
        localStorage.removeItem('bilan_user_email');
        window.location.href = '/login';
      }
      
      throw {
        message: error?.message || `Failed to fetch ${resource}`,
        statusCode: error?.statusCode || error?.status || 500,
        ...error,
      };
    }
  },

  getOne: async ({ resource, id, meta }) => {
    try {
      let response;
      
      switch (resource) {
        case 'assessments':
          response = await api.getAssessment(id as string);
          break;
        case 'users':
          response = await api.getUser(id as string);
          break;
        case 'roles':
          response = await api.getRole(id as string);
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error: any) {
      console.error(`Error fetching ${resource} with id ${id}:`, error);
      
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized')) {
        localStorage.removeItem('bilan_auth_token');
        window.location.href = '/login';
      }
      
      throw {
        message: error?.message || `Failed to fetch ${resource}`,
        statusCode: error?.statusCode || error?.status || 500,
        ...error,
      };
    }
  },

  create: async ({ resource, variables, meta }) => {
    try {
      let response;
      
      switch (resource) {
        case 'assessments':
          response = await api.createAssessment(variables as any);
          break;
        case 'users':
          response = await api.createUser(variables as any);
          break;
        case 'roles':
          response = await api.createRole(variables as any);
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error: any) {
      console.error(`Error creating ${resource}:`, error);
      
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized')) {
        localStorage.removeItem('bilan_auth_token');
        window.location.href = '/login';
      }
      
      throw {
        message: error?.message || `Failed to create ${resource}`,
        statusCode: error?.statusCode || error?.status || 500,
        ...error,
      };
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    try {
      let response;
      
      switch (resource) {
        case 'assessments':
          response = await api.updateAssessment(id as string, variables as any);
          break;
        case 'users':
          response = await api.updateUser(id as string, variables as any);
          break;
        case 'roles':
          response = await api.updateRole(id as string, variables as any);
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error: any) {
      console.error(`Error updating ${resource} with id ${id}:`, error);
      
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized')) {
        localStorage.removeItem('bilan_auth_token');
        window.location.href = '/login';
      }
      
      throw {
        message: error?.message || `Failed to update ${resource}`,
        statusCode: error?.statusCode || error?.status || 500,
        ...error,
      };
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    try {
      switch (resource) {
        case 'assessments':
          await api.deleteAssessment(id as string);
          break;
        case 'users':
          await api.deleteUser(id as string);
          break;
        case 'roles':
          await api.deleteRole(id as string);
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: { id },
      };
    } catch (error: any) {
      console.error(`Error deleting ${resource} with id ${id}:`, error);
      
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized')) {
        localStorage.removeItem('bilan_auth_token');
        window.location.href = '/login';
      }
      
      throw {
        message: error?.message || `Failed to delete ${resource}`,
        statusCode: error?.statusCode || error?.status || 500,
        ...error,
      };
    }
  },

  getApiUrl: () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  },
});

