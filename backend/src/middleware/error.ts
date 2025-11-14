import { Context } from 'hono';
import { ZodError } from 'zod';
import type { Env } from '../types/env.js';
import { logger } from '../utils/logger.js';

// Global error handler
export const errorHandler = async (err: Error, c: Context<Env>) => {
  logger.error('Error:', err);
  
  // Capture error in Sentry if enabled
  // Note: Sentry is optional - install with: npm install @sentry/node
  if (process.env.SENTRY_DSN) {
    try {
      // @ts-expect-error - Sentry is an optional dependency
      const Sentry: any = await import('@sentry/node');
      Sentry.captureException(err, {
        tags: {
          path: c.req.path,
          method: c.req.method,
        },
        extra: {
          userId: c.get('userId'),
          headers: Object.fromEntries(c.req.raw.headers.entries()),
        },
      });
    } catch (sentryError) {
      // Sentry not available, continue without it
      logger.debug('Sentry not available:', sentryError);
    }
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400 as any);
  }

  // PostgreSQL errors
  if (err.message.includes('duplicate key')) {
    return c.json({
      error: 'Resource already exists',
    }, 409 as any);
  }

  if (err.message.includes('foreign key')) {
    return c.json({
      error: 'Referenced resource not found',
    }, 404 as any);
  }

  // Default error
  return c.json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500 as any);
};
