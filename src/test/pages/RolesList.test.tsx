import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import RolesList from '../../pages/RolesList';
import { createDataProvider } from '../../core/providers/dataProvider';
import { createAuthProvider } from '../../core/providers/authProvider';
import { useApi } from '../../services/apiClient';

// Mock the API client
vi.mock('../../services/apiClient', () => ({
  useApi: vi.fn(() => ({
    getRoles: vi.fn(() => Promise.resolve({
      data: {
        roles: [
          {
            id: '1',
            name: 'Admin',
            description: 'Administrator role',
            permissions: [{ id: '1', resource: 'users', action: 'read' }],
          },
        ],
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    })),
  })),
}));

// Mock Refine hooks
vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useList: vi.fn(() => ({
      data: {
        data: [
          {
            id: '1',
            name: 'Admin',
            description: 'Administrator role',
            permissions: [{ id: '1', resource: 'users', action: 'read' }],
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
    })),
    useGetIdentity: vi.fn(() => ({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
      isLoading: false,
    })),
    usePermissions: vi.fn(() => ({
      data: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
      isLoading: false,
    })),
  };
});

// Mock PermissionGuard
vi.mock('../../src/core/permissions/PermissionGuard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RolesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the roles list page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <RolesList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Roles/i)).toBeInTheDocument();
    });
  });

  it('should display role data when loaded', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <RolesList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });
});

