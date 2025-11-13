import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import './src/i18n/config'; // i18n initialization
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './hooks/useTheme';
import { useApi } from './services/apiClient';
import RefineApp from './src/core/App';

// Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
// if (import.meta.env.VITE_SENTRY_DSN) {
//   import('./sentry.client.config');
// }

// Main App Wrapper - Refine App'i API instance ile initialize et
const AppWrapper: React.FC = () => {
  const api = useApi();
  return <RefineApp api={api} />;
};

// Clerk kaldırıldı - Refine.dev ile authentication kullanılıyor
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppWrapper />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
