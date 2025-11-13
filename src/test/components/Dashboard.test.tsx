import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardHome from '../../../pages/DashboardHome';
import { Refine } from '@refinedev/core';
import { createDataProvider } from '../../core/providers/dataProvider';
import { createAuthProvider } from '../../core/providers/authProvider';
import { useApi } from '../../../services/apiClient';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'dashboard.welcomeBack' && params?.name) {
        return `Welcome back, ${params.name}! 👋`;
      }
      const translations: Record<string, string> = {
        'dashboard.loadingDashboard': 'Loading dashboard...',
        'dashboard.welcomeBackUser': 'Welcome back, User! 👋',
        'dashboard.overview': "Here's an overview of your assessments and activity.",
        'dashboard.totalAssessments': 'Total Assessments',
        'dashboard.completed': 'Completed',
        'dashboard.inProgress': 'In Progress',
        'dashboard.completionRate': 'Completion Rate',
        'dashboard.of': 'of',
        'dashboard.statusDistribution': 'Status Distribution',
        'dashboard.packageDistribution': 'Package Distribution',
        'dashboard.activityTrend': 'Activity Trend (Last 7 Days)',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.startNewAssessment': 'Start New Assessment',
        'dashboard.viewAllAssessments': 'View All Assessments',
        'dashboard.viewAnalytics': 'View Analytics',
        'dashboard.recentActivity': 'Recent Activity',
        'dashboard.noRecentActivity': 'No recent activity',
        'dashboard.noRecentActivityMessage': 'Start your first assessment to see activity here!',
        'dashboard.getStarted': 'Get Started',
        'dashboard.viewAll': 'View all assessments →',
        'dashboard.noDataAvailable': 'No data available',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock API client
vi.mock('../../../services/apiClient', () => ({
  useApi: vi.fn(() => ({
    getAssessments: vi.fn(() => Promise.resolve({
      data: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    })),
  })),
}));

// Mock Refine hooks
vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useList: vi.fn(() => ({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
    })),
    useGetIdentity: vi.fn(() => ({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
      isLoading: false,
    })),
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard home page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <DashboardHome />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('should display dashboard stats', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <DashboardHome />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Assessments')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });
});

