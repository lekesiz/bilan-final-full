import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthProvider } from '../../../core/providers/authProvider';

// Mock apiClient
const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
  getPermissions: vi.fn(),
  logout: vi.fn(),
};

describe('createAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should create auth provider with login function', () => {
    const authProvider = createAuthProvider(mockApi as any);
    expect(authProvider.login).toBeDefined();
    expect(typeof authProvider.login).toBe('function');
  });

  it('should create auth provider with logout function', () => {
    const authProvider = createAuthProvider(mockApi as any);
    expect(authProvider.logout).toBeDefined();
    expect(typeof authProvider.logout).toBe('function');
  });

  it('should create auth provider with check function', () => {
    const authProvider = createAuthProvider(mockApi as any);
    expect(authProvider.check).toBeDefined();
    expect(typeof authProvider.check).toBe('function');
  });

  it('should create auth provider with getIdentity function', () => {
    const authProvider = createAuthProvider(mockApi as any);
    expect(authProvider.getIdentity).toBeDefined();
    expect(typeof authProvider.getIdentity).toBe('function');
  });

  it('should create auth provider with getPermissions function', () => {
    const authProvider = createAuthProvider(mockApi as any);
    expect(authProvider.getPermissions).toBeDefined();
    expect(typeof authProvider.getPermissions).toBe('function');
  });
});

