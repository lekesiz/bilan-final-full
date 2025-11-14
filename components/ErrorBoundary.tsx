import React, { Component, ErrorInfo, ReactNode } from 'react';
// Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
// import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);
    console.error('Error stack:', error.stack);
    
    // Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
    // if (import.meta.env.VITE_SENTRY_DSN) {
    //   Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   });
    // }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '20px'
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
            }}>Une erreur est survenue</h1>
            <p style={{
              color: '#64748b',
              marginBottom: '24px'
            }}>
              Désolé, quelque chose s'est mal passé. Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            {this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '24px',
                backgroundColor: '#f1f5f9',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Détails techniques
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#475569',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  fontWeight: 'bold',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

