import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import UserProfile from '../../../pages/UserProfile';
import { createDataProvider } from '../../../src/core/providers/dataProvider';
import { createAuthProvider } from '../../../src/core/providers/authProvider';
import { useApi } from '../../../services/apiClient';

// Mock the API client
vi.mock('../../../services/apiClient', () => ({
  useApi: vi.fn(() => ({
    getUsers: vi.fn(() => Promise.resolve({ data: { users: [] } })),
  })),
}));

// Mock Refine hooks
const mockIdentity = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  isActive: true,
  roles: [{ id: '1', name: 'Admin' }],
  role: 'Admin',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-11-14T10:00:00Z',
};

vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useGetIdentity: vi.fn(() => ({
      data: mockIdentity,
      isLoading: false,
    })),
  };
});

// Mock PermissionGuard
vi.mock('../../../src/core/permissions/PermissionGuard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
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

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the user profile page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should display user email', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should display user roles', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    });
  });

  it('should show loading state when identity is loading', () => {
    // Mock loading state
    vi.mocked(require('@refinedev/core').useGetIdentity).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    } as any);

    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    const { container } = render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    // Check for loading card
    expect(container.querySelector('.ant-card-loading')).toBeInTheDocument();
  });

  it('should show not found message when identity is null', async () => {
    // Mock no identity
    vi.mocked(require('@refinedev/core').useGetIdentity).mockReturnValueOnce({
      data: null,
      isLoading: false,
    } as any);

    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/User profile not found/i)).toBeInTheDocument();
    });
  });

  it('should display profile information section', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <UserProfile />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check that dates are rendered (format may vary)
      const dateElements = screen.getAllByText(/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});

