import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import AuditTrailList from '../../../pages/AuditTrailList';
import { createDataProvider } from '../../../src/core/providers/dataProvider';
import { createAuthProvider } from '../../../src/core/providers/authProvider';
import { useApi } from '../../../services/apiClient';

// Mock audit logs data
const mockAuditLogs = [
  {
    id: '1',
    userId: 'user1',
    userEmail: 'user1@example.com',
    userName: 'User One',
    action: 'create',
    resource: 'assessment',
    resourceId: 'assessment1',
    status: 'success' as const,
    createdAt: '2024-11-14T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    userEmail: 'user2@example.com',
    userName: 'User Two',
    action: 'update',
    resource: 'user',
    resourceId: 'user2',
    status: 'success' as const,
    createdAt: '2024-11-14T11:00:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    userEmail: 'user1@example.com',
    userName: 'User One',
    action: 'delete',
    resource: 'assessment',
    resourceId: 'assessment2',
    status: 'failure' as const,
    errorMessage: 'Permission denied',
    createdAt: '2024-11-14T12:00:00Z',
  },
];

// Mock the API client
const mockGetAuditLogs = vi.fn(() => Promise.resolve({
  logs: mockAuditLogs,
  pagination: {
    total: 3,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
}));

vi.mock('../../../services/apiClient', () => ({
  useApi: vi.fn(() => ({
    getAuditLogs: mockGetAuditLogs,
  })),
}));

// Mock Refine hooks
vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useList: vi.fn(() => ({
      data: {
        data: mockAuditLogs,
        total: 3,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
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

describe('AuditTrailList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the audit trail list page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Audit Trail/i)).toBeInTheDocument();
    });
  });

  it('should display audit logs in table', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('should display action types', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/create/i)).toBeInTheDocument();
      expect(screen.getByText(/update/i)).toBeInTheDocument();
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });
  });

  it('should display resource types', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/user/i)).toBeInTheDocument();
    });
  });

  it('should display status badges', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByText(/failure/i)).toBeInTheDocument();
    });
  });

  it('should filter by action type', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const actionFilter = screen.getByPlaceholderText(/Filter by action/i);
      if (actionFilter) {
        fireEvent.change(actionFilter, { target: { value: 'create' } });
        expect(mockGetAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'create',
          })
        );
      }
    });
  });

  it('should filter by resource type', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const resourceFilter = screen.getByPlaceholderText(/Filter by resource/i);
      if (resourceFilter) {
        fireEvent.change(resourceFilter, { target: { value: 'assessment' } });
        expect(mockGetAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            resource: 'assessment',
          })
        );
      }
    });
  });

  it('should search audit logs', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Search/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'user1' } });
        expect(mockGetAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'user1',
          })
        );
      }
    });
  });

  it('should open drawer when view button is clicked', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view|eye/i });
      if (viewButtons.length > 0) {
        fireEvent.click(viewButtons[0]);
        // Drawer should open
        expect(screen.getByText(/Details/i)).toBeInTheDocument();
      }
    });
  });

  it('should display error message for failed actions', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    // Mock loading state
    vi.mocked(require('@refinedev/core').useList).mockReturnValueOnce({
      data: { data: [], total: 0 },
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
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
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    // Should show loading indicator
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should handle empty state', async () => {
    // Mock empty data
    mockGetAuditLogs.mockResolvedValueOnce({
      logs: [],
      pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
    });

    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AuditTrailList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No audit logs/i)).toBeInTheDocument();
    });
  });
});

