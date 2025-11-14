import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';

// TEST_MODE: Only enabled in test environment or when explicitly set
// CRITICAL: Must be false in production to prevent authentication bypass
const TEST_MODE = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';

// Security check: Prevent TEST_MODE in production
if (process.env.NODE_ENV === 'production' && TEST_MODE) {
  throw new Error(
    '❌ CRITICAL SECURITY ERROR: TEST_MODE cannot be enabled in production environment.\n' +
    'This would completely bypass authentication. Set TEST_MODE=false or remove it from .env'
  );
}

// Test modu için user ID storage (session-based)
const testUserStore = new Map<string, string>();

// Middleware pour vérifier l'authentification Clerk
export const requireAuth = async (c: Context<Env>, next: Next) => {
  // Test modu: Bypass auth, mock user ID kullan
  if (TEST_MODE) {
    // Frontend'den X-Test-User-Id header'ı al
    const testUserId = c.req.header('X-Test-User-Id') || 'test-user-default';
    
    // Session ID için header kullan
    const sessionId = c.req.header('X-Session-Id') || 'default-session';
    
    // Aynı session için aynı user ID kullan
    if (!testUserStore.has(sessionId)) {
      testUserStore.set(sessionId, testUserId);
    }
    
    const userId = testUserStore.get(sessionId) || testUserId;
    c.set('userId', userId);
    
    await next();
    return;
  }

  // Clerk kaldırıldı - Session-based authentication kullanılıyor
  // Bu kod artık kullanılmıyor (her zaman TEST_MODE aktif)
  // Ama yine de bir fallback olarak bırakıyoruz
  try {
    // Session-based auth - header'lardan user ID al
    const testUserId = c.req.header('X-Test-User-Id') || 'test-user-default';
    const sessionId = c.req.header('X-Session-Id') || 'default-session';
    
    if (!testUserStore.has(sessionId)) {
      testUserStore.set(sessionId, testUserId);
    }
    
    const userId = testUserStore.get(sessionId) || testUserId;
    c.set('userId', userId);
    
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized - Authentication failed' }, 401);
  }
};

// Middleware optionnel pour récupérer les infos user sans bloquer
export const optionalAuth = async (c: Context<Env>, next: Next) => {
  try {
    // Session-based auth - header'lardan user ID al
    const testUserId = c.req.header('X-Test-User-Id');
    const sessionId = c.req.header('X-Session-Id') || 'default-session';
    
    if (testUserId) {
      if (!testUserStore.has(sessionId)) {
        testUserStore.set(sessionId, testUserId);
      }
      const userId = testUserStore.get(sessionId) || testUserId;
      c.set('userId', userId);
    }

    await next();
  } catch (error) {
    // Continue sans auth
    await next();
  }
};
