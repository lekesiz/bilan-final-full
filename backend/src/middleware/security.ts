import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';

/**
 * Security Headers Middleware
 * Adds essential security headers to all responses
 */
export const securityHeaders = async (c: Context<Env>, next: Next) => {
  await next();

  // Content Security Policy
  c.header('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for some libraries
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  // X-Frame-Options: Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection: Legacy XSS protection (for older browsers)
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Control browser features
  c.header('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
  ].join(', '));

  // Strict-Transport-Security: Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
};

/**
 * HTTPS Enforcement Middleware
 * Redirects HTTP to HTTPS in production
 */
export const httpsEnforcement = async (c: Context<Env>, next: Next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    const forwardedProto = c.req.header('x-forwarded-proto');
    const host = c.req.header('host');
    
    // Check if request is HTTP (not HTTPS)
    if (forwardedProto && forwardedProto !== 'https' && host) {
      const httpsUrl = `https://${host}${c.req.path}`;
      return c.redirect(httpsUrl, 301);
    }
  }

  await next();
};

/**
 * Rate Limiting Store (in-memory)
 * In production, use Redis or similar for distributed systems
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate Limiting Middleware
 * Limits requests per IP address
 */
export const rateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
  } = options;

  return async (c: Context<Env>, next: Next) => {
    // Get client identifier (IP address or user ID)
    const clientId = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
                     c.req.header('x-real-ip') ||
                     'unknown';

    const now = Date.now();
    const key = `rate_limit:${clientId}`;
    
    let record = rateLimitStore.get(key);

    // Clean up expired records
    if (record && record.resetTime < now) {
      rateLimitStore.delete(key);
      record = undefined;
    }

    // Initialize or get existing record
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    // Check if limit exceeded
    if (record.count >= max) {
      c.header('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
      return c.json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }, 429);
    }

    // Increment counter
    record.count++;

    // Execute request
    await next();

    // Only count successful requests if skipSuccessfulRequests is true
    if (skipSuccessfulRequests && c.res.status >= 200 && c.res.status < 300) {
      record.count--;
    }

    // Set rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
    c.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
  };
};

/**
 * Strict Rate Limiter for Auth Endpoints
 * More restrictive rate limiting for login/register
 * In development, use more lenient limits
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 in production, 50 in development
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful logins
});

