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
      console.error('Logout error:', error);
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
    const token = localStorage.getItem('bilan_auth_token');
    
    if (!token) {
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    }

    try {
      // Token'ı validate et (backend'den user bilgilerini çek)
      const user = await api.getMe(token);
      
      if (user && user.id) {
        return {
          authenticated: true,
        };
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      
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
        };
      }
    } catch (error) {
      console.error('Get identity error:', error);
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
      console.error('Get permissions error:', error);
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
    console.error('Auth error:', error);
    
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

