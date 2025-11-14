import { AuthProvider } from '@refinedev/core';
import { useApi } from '../../services/apiClient';

// Custom auth provider for BILAN-EASY
// Backend API ile entegre edilmiş auth provider
export const createAuthProvider = (api: ReturnType<typeof useApi>): AuthProvider => ({
  login: async ({ email, password }) => {
    try {
      const response = await api.login(email, password);
      
      // JWT token'ı localStorage'a kaydet
      if (response.token) {
        localStorage.setItem('bilan_auth_token', response.token);
        localStorage.setItem('bilan_user_id', response.user.id);
        localStorage.setItem('bilan_user_name', response.user.name);
        localStorage.setItem('bilan_user_email', response.user.email);
        
        // Load permissions after login
        try {
          const permissionsResponse = await api.getPermissions(response.token);
          const formatted = permissionsResponse.formatted || [];
          localStorage.setItem('bilan_permissions', JSON.stringify(formatted));
        } catch (permError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to load permissions after login:', permError);
          }
          // Use default permissions as fallback
          const defaultPermissions = [
            'bilan:read',
            'bilan:create',
            'bilan:assessment:read',
            'bilan:assessment:create',
            'dashboard:read',
          ];
          localStorage.setItem('bilan_permissions', JSON.stringify(defaultPermissions));
        }
      }

      return {
        success: true,
        redirectTo: '/dashboard',
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Login failed',
          name: 'LoginError',
        },
      };
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('bilan_auth_token');
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Logout error:', error);
      }
    } finally {
      // Clear all auth data
      localStorage.removeItem('bilan_auth_token');
      localStorage.removeItem('bilan_user_id');
      localStorage.removeItem('bilan_user_name');
      localStorage.removeItem('bilan_user_email');
      localStorage.removeItem('bilan_session_id');
    }

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    console.log('[AuthProvider.check] Starting auth check...');
    const token = localStorage.getItem('bilan_auth_token');
    
    if (!token) {
      console.log('[AuthProvider.check] No token found, redirecting to login');
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    }

    console.log('[AuthProvider.check] Token found, validating with backend...');
    try {
      // Token'ı validate et (backend'den user bilgilerini çek)
      // Timeout ekle - backend yanıt vermezse 3 saniye sonra timeout (daha hızlı)
      const user = await Promise.race([
        api.getMe(token),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout - backend not responding')), 3000)
        )
      ]) as any;
      
      console.log('[AuthProvider.check] User validation result:', user ? 'SUCCESS' : 'FAILED');
      
      if (user && user.id) {
        console.log('[AuthProvider.check] User authenticated:', user.id);
        // Always reload permissions from backend to ensure they're up-to-date
        console.log('[AuthProvider.check] Loading permissions from backend...');
        try {
          const permissionsResponse = await api.getPermissions(token);
          const formatted = permissionsResponse.formatted || [];
          localStorage.setItem('bilan_permissions', JSON.stringify(formatted));
          console.log('[AuthProvider.check] Permissions loaded:', formatted.length, formatted);
        } catch (permError) {
          console.warn('[AuthProvider.check] Failed to load permissions, using defaults:', permError);
          // Use default permissions as fallback
          const defaultPermissions = [
            'bilan:read',
            'bilan:create',
            'bilan:assessment:read',
            'bilan:assessment:create',
            'dashboard:read',
          ];
          localStorage.setItem('bilan_permissions', JSON.stringify(defaultPermissions));
        }
        
        return {
          authenticated: true,
        };
      } else {
        console.warn('[AuthProvider.check] User validation failed: no user ID');
      }
    } catch (error: any) {
      console.error('[AuthProvider.check] Error:', error.message || error);
      
      // Network errors, timeouts, or connection issues - don't clear token immediately
      // Allow user to see login page even if backend is down
      if (
        error?.message?.includes('timeout') ||
        error?.message?.includes('Network') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.code === 'ECONNREFUSED'
      ) {
        console.warn('[AuthProvider.check] Backend not available, redirecting to login (keeping token)');
        // Backend is not available - redirect to login but don't clear token
        // User can try again when backend is back
        return {
          authenticated: false,
          redirectTo: '/login',
          logout: false, // Don't clear token - backend might be temporarily down
        };
      }
      
      // 401 Unauthorized - token expired veya geçersiz
      if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes('Unauthorized') || error?.message?.includes('expired')) {
        // Token geçersiz veya expire olmuş, logout yap
        localStorage.removeItem('bilan_auth_token');
        localStorage.removeItem('bilan_user_id');
        localStorage.removeItem('bilan_user_name');
        localStorage.removeItem('bilan_user_email');
        localStorage.removeItem('bilan_permissions');
        
        return {
          authenticated: false,
          redirectTo: '/login',
          logout: true,
        };
      }
      
      // Diğer hatalar için de logout yap (güvenlik için)
      localStorage.removeItem('bilan_auth_token');
      localStorage.removeItem('bilan_user_id');
      localStorage.removeItem('bilan_user_name');
      localStorage.removeItem('bilan_user_email');
      localStorage.removeItem('bilan_permissions');
    }

    return {
      authenticated: false,
      redirectTo: '/login',
      logout: true,
    };
  },

  getIdentity: async () => {
    const token = localStorage.getItem('bilan_auth_token');
    
    if (!token) {
      return null;
    }

    try {
      const user = await api.getMe(token);
      
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // Include additional fields if available
          roles: (user as any).roles,
          role: (user as any).role,
          lastLoginAt: (user as any).lastLoginAt,
          createdAt: (user as any).createdAt,
          isActive: (user as any).isActive,
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get identity error:', error);
      }
      // Token geçersiz, temizle
      localStorage.removeItem('bilan_auth_token');
      localStorage.removeItem('bilan_user_id');
      localStorage.removeItem('bilan_user_name');
      localStorage.removeItem('bilan_user_email');
      return null;
    }

    // Fallback kaldırıldı - sadece token ile çalış
    return null;
  },

  getPermissions: async () => {
    const token = localStorage.getItem('bilan_auth_token');
    
    if (!token) {
      // If no token, check if we're in test mode or give default permissions
      // For development: allow access to bilan module by default
      const defaultPermissions = [
        'bilan:read',
        'bilan:create',
        'bilan:assessment:read',
        'bilan:assessment:create',
        'dashboard:read',
      ];
      localStorage.setItem('bilan_permissions', JSON.stringify(defaultPermissions));
      return defaultPermissions;
    }

    try {
      const response = await api.getPermissions(token);
      const formatted = response.formatted || [];
      // Store permissions in localStorage for usePermissions hook
      localStorage.setItem('bilan_permissions', JSON.stringify(formatted));
      return formatted;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get permissions error:', error);
      }
      // Fallback: give default permissions for development
      const defaultPermissions = [
        'bilan:read',
        'bilan:create',
        'bilan:assessment:read',
        'bilan:assessment:create',
        'dashboard:read',
      ];
      localStorage.setItem('bilan_permissions', JSON.stringify(defaultPermissions));
      return defaultPermissions;
    }
  },

  onError: async (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth error:', error);
    }
    
    // 401 Unauthorized hatası ise logout yap
    if (error?.statusCode === 401 || error?.message?.includes('Unauthorized')) {
      localStorage.removeItem('bilan_auth_token');
      localStorage.removeItem('bilan_user_id');
      localStorage.removeItem('bilan_user_name');
      localStorage.removeItem('bilan_user_email');
      
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }

    return {
      logout: false,
      redirectTo: '/login',
      error,
    };
  },

  register: async ({ email, password, name }) => {
    try {
      const response = await api.register(email, password, name);
      
      // JWT token'ı localStorage'a kaydet
      if (response.token) {
        localStorage.setItem('bilan_auth_token', response.token);
        localStorage.setItem('bilan_user_id', response.user.id);
        localStorage.setItem('bilan_user_name', response.user.name);
        localStorage.setItem('bilan_user_email', response.user.email);
      }

      return {
        success: true,
        redirectTo: '/dashboard',
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Registration failed',
          name: 'RegistrationError',
        },
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      await api.resetPassword(email);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to send password reset email',
          name: 'PasswordResetError',
        },
      };
    }
  },

  updatePassword: async ({ password, confirmPassword }) => {
    try {
      const token = localStorage.getItem('bilan_auth_token');
      
      if (!token) {
        return {
          success: false,
          error: {
            message: 'You must be logged in to update your password',
            name: 'PasswordUpdateError',
          },
        };
      }

      if (password !== confirmPassword) {
        return {
          success: false,
          error: {
            message: 'Passwords do not match',
            name: 'PasswordUpdateError',
          },
        };
      }

      // Note: updatePassword requires currentPassword, but Refine's updatePassword
      // only provides new password. We'll need to handle this differently.
      // For now, we'll use a custom implementation in the UI.
      return {
        success: false,
        error: {
          message: 'Please use the password update form in your profile settings',
          name: 'PasswordUpdateError',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update password',
          name: 'PasswordUpdateError',
        },
      };
    }
  },
});

