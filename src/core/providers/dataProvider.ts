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
          // TODO: Implement users API endpoint in apiClient
          const usersToken = localStorage.getItem('bilan_auth_token');
          const usersResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users?limit=${pageSize}&offset=${offset}`,
            {
              headers: {
                'Authorization': usersToken ? `Bearer ${usersToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          response = await usersResponse.json();
          break;
        case 'roles':
          // TODO: Implement roles API endpoint in apiClient
          const rolesToken = localStorage.getItem('bilan_auth_token');
          const rolesResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles?limit=${pageSize}&offset=${offset}`,
            {
              headers: {
                'Authorization': rolesToken ? `Bearer ${rolesToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          const rolesData = await rolesResponse.json();
          response = rolesData.data || { roles: rolesData.roles || rolesData, pagination: { total: rolesData.roles?.length || 0 } };
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      const data = response.data || response;
      const total = response.pagination?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        total,
      };
    } catch (error) {
      throw error;
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
          const userToken = localStorage.getItem('bilan_auth_token');
          const userResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/${id}`,
            {
              headers: {
                'Authorization': userToken ? `Bearer ${userToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          response = await userResponse.json();
          break;
        case 'roles':
          const roleToken = localStorage.getItem('bilan_auth_token');
          const roleResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles/${id}`,
            {
              headers: {
                'Authorization': roleToken ? `Bearer ${roleToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          response = await roleResponse.json();
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
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
          const createUserToken = localStorage.getItem('bilan_auth_token');
          const createUserResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users`,
            {
              method: 'POST',
              headers: {
                'Authorization': createUserToken ? `Bearer ${createUserToken}` : '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(variables),
            }
          );
          response = await createUserResponse.json();
          break;
        case 'roles':
          const createRoleToken = localStorage.getItem('bilan_auth_token');
          const createRoleResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles`,
            {
              method: 'POST',
              headers: {
                'Authorization': createRoleToken ? `Bearer ${createRoleToken}` : '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(variables),
            }
          );
          response = await createRoleResponse.json();
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
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
          const updateUserToken = localStorage.getItem('bilan_auth_token');
          const updateUserResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': updateUserToken ? `Bearer ${updateUserToken}` : '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(variables),
            }
          );
          response = await updateUserResponse.json();
          break;
        case 'roles':
          const updateRoleToken = localStorage.getItem('bilan_auth_token');
          const updateRoleResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': updateRoleToken ? `Bearer ${updateRoleToken}` : '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(variables),
            }
          );
          response = await updateRoleResponse.json();
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    try {
      switch (resource) {
        case 'assessments':
          await api.deleteAssessment(id as string);
          break;
        case 'users':
          const deleteUserToken = localStorage.getItem('bilan_auth_token');
          await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/${id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': deleteUserToken ? `Bearer ${deleteUserToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          break;
        case 'roles':
          const deleteRoleToken = localStorage.getItem('bilan_auth_token');
          await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles/${id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': deleteRoleToken ? `Bearer ${deleteRoleToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );
          break;
        default:
          throw new Error(`Resource ${resource} not supported`);
      }

      return {
        data: { id },
      };
    } catch (error) {
      throw error;
    }
  },

  getApiUrl: () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  },
});

