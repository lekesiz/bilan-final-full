import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import Settings from '../../../pages/Settings';
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
const mockT = vi.fn((key: string, defaultValue?: string) => defaultValue || key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

// Mock LanguageSwitcher
vi.mock('../../../components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
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

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('should render the settings page', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  it('should display notification settings tab', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });
  });

  it('should display language settings tab', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Language/i)).toBeInTheDocument();
    });
  });

  it('should display account settings tab', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Account/i)).toBeInTheDocument();
    });
  });

  it('should toggle email notifications', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const switches = screen.getAllByRole('switch');
      const emailSwitch = switches.find((s) => 
        s.getAttribute('aria-label')?.includes('email') || 
        s.closest('div')?.textContent?.includes('Email')
      );
      
      if (emailSwitch) {
        fireEvent.click(emailSwitch);
        expect(localStorage.getItem('settings.emailNotifications')).toBe('false');
      }
    });
  });

  it('should change timezone', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const timezoneSelect = selects.find((s) => 
        s.getAttribute('aria-label')?.includes('timezone') ||
        s.closest('div')?.textContent?.includes('Timezone')
      );
      
      if (timezoneSelect) {
        fireEvent.mouseDown(timezoneSelect);
        // Select a timezone option
        const option = screen.getByText('Europe/Paris');
        fireEvent.click(option);
        expect(localStorage.getItem('settings.timezone')).toBe('Europe/Paris');
      }
    });
  });

  it('should show warning when delete account is clicked', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByText(/Delete Account/i);
      fireEvent.click(deleteButton);
    });

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });
  });

  it('should show warning when download data is clicked', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    // Mock message.warning
    const mockWarning = vi.fn();
    vi.mock('antd', async () => {
      const actual = await vi.importActual('antd');
      return {
        ...actual,
        message: {
          ...actual.message,
          warning: mockWarning,
        },
      };
    });

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      const downloadButton = screen.getByText(/Download My Data/i);
      fireEvent.click(downloadButton);
    });

    // Should show warning message
    await waitFor(() => {
      expect(mockT).toHaveBeenCalledWith(
        'settings.downloadDataNotImplemented',
        'Data export feature is not yet available'
      );
    });
  });

  it('should display language switcher', async () => {
    const api = useApi();
    const dataProvider = createDataProvider(api);
    const authProvider = createAuthProvider(api);

    render(
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
        >
          <Settings />
        </Refine>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });
  });
});

