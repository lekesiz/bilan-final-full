import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../../../core/permissions/usePermissions';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePermissions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return false when no permissions are stored', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('users', 'read')).toBe(false);
  });

  it('should return true when permission exists', () => {
    const permissions = JSON.stringify([
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'create' },
    ]);
    localStorage.setItem('permissions', permissions);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('users', 'read')).toBe(true);
    expect(result.current.canAccess('users', 'create')).toBe(true);
  });

  it('should return false when permission does not exist', () => {
    const permissions = JSON.stringify([
      { resource: 'users', action: 'read' },
    ]);
    localStorage.setItem('permissions', permissions);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('users', 'delete')).toBe(false);
  });

  it('should handle canAccessAny correctly', () => {
    const permissions = JSON.stringify([
      { resource: 'users', action: 'read' },
      { resource: 'roles', action: 'read' },
    ]);
    localStorage.setItem('permissions', permissions);

    const { result } = renderHook(() => usePermissions());
    expect(
      result.current.canAccessAny([
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'delete' },
      ])
    ).toBe(true);

    expect(
      result.current.canAccessAny([
        { resource: 'users', action: 'delete' },
        { resource: 'roles', action: 'delete' },
      ])
    ).toBe(false);
  });

  it('should handle canAccessAll correctly', () => {
    const permissions = JSON.stringify([
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'create' },
    ]);
    localStorage.setItem('permissions', permissions);

    const { result } = renderHook(() => usePermissions());
    expect(
      result.current.canAccessAll([
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'create' },
      ])
    ).toBe(true);

    expect(
      result.current.canAccessAll([
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'delete' },
      ])
    ).toBe(false);
  });
});

