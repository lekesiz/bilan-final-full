import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import AssessmentsList from '../../pages/AssessmentsList';
import { createDataProvider } from '../../core/providers/dataProvider';
import { createAuthProvider } from '../../core/providers/authProvider';
import { useApi } from '../../services/apiClient';

// Mock the API client
vi.mock('../../services/apiClient', () => ({
  useApi: vi.fn(() => ({
    getAssessments: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          userName: 'Test User',
          packageName: 'Découverte',
          status: 'in_progress',
          startedAt: '2024-01-01T00:00:00Z',
          totalQuestions: 30,
          currentQuestionIndex: 5,
        },
      ],
      pagination: { total: 1, limit: 10, offset: 0 },
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
            userName: 'Test User',
            packageName: 'Découverte',
            status: 'in_progress',
            startedAt: '2024-01-01T00:00:00Z',
            totalQuestions: 30,
            currentQuestionIndex: 5,
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
      data: ['bilan:assessment:read', 'bilan:assessment:create'],
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

describe('AssessmentsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the assessments list page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AssessmentsList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Assessments/i)).toBeInTheDocument();
    });
  });

  it('should display assessment data when loaded', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <AssessmentsList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Découverte')).toBeInTheDocument();
    });
  });

  it('should show empty state when no assessments', async () => {
    const { useList } = await import('@refinedev/core');
    vi.mocked(useList).mockReturnValueOnce({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
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
          <AssessmentsList />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No assessments found/i)).toBeInTheDocument();
    });
  });
});

