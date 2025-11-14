import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import './src/i18n/config'; // i18n initialization
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './hooks/useTheme';
import { useApi } from './services/apiClient';
import RefineApp from './src/core/App';

// Remove dark class immediately before React renders
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  root.classList.remove('dark');
  localStorage.removeItem('bilan-theme');
}

// Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
// if (import.meta.env.VITE_SENTRY_DSN) {
//   import('./sentry.client.config');
// }

// Main App Wrapper - Refine App'i API instance ile initialize et
const AppWrapper: React.FC = () => {
  try {
    console.log('[AppWrapper] Initializing...');
    console.log('[AppWrapper] Document ready:', document.readyState);
    console.log('[AppWrapper] Root element:', document.getElementById('root') ? 'FOUND' : 'NOT FOUND');
    
    const api = useApi();
    console.log('[AppWrapper] API initialized:', api ? 'OK' : 'FAILED');
    console.log('[AppWrapper] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
    
    console.log('[AppWrapper] Rendering RefineApp...');
    return <RefineApp api={api} />;
  } catch (error) {
    console.error('[AppWrapper] ❌ Initialization error:', error);
    console.error('[AppWrapper] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error; // Let ErrorBoundary catch it
  }
};

// Clerk kaldırıldı - Refine.dev ile authentication kullanılıyor
console.log('[index.tsx] Looking for root element...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[index.tsx] ❌ Root element not found!');
  throw new Error('Could not find root element to mount to');
}

console.log('[index.tsx] Root element found, creating React root...');
const root = ReactDOM.createRoot(rootElement);
console.log('[index.tsx] React root created, rendering app...');

// Temporarily disable StrictMode to fix React 19 Activity property error
// TODO: Re-enable StrictMode after React 19 stabilizes
console.log('[index.tsx] Starting render...');
try {
  root.render(
    <ErrorBoundary fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '8px'
          }}>Application Error</h1>
          <p style={{
            color: '#64748b',
            marginBottom: '24px'
          }}>
            An error occurred while loading the application. Please check the browser console for details.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    }>
      <ThemeProvider>
        <ToastProvider>
          <AppWrapper />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
  console.log('[index.tsx] ✅ Render completed successfully');
} catch (error) {
  console.error('[index.tsx] ❌ Render error:', error);
  console.error('[index.tsx] Error stack:', error instanceof Error ? error.stack : 'No stack');
  
  // Fallback: Eğer render başarısız olursa, root element'e direkt mesaj yaz
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui;">
        <h1 style="color: #dc2626;">❌ Render Error</h1>
        <p style="color: #64748b;">Failed to render application. Check console for details.</p>
        <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: left; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
  throw error;
}
