import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error.js';
import { securityHeaders, httpsEnforcement, rateLimiter, strictRateLimiter } from './middleware/security.js';
import assessmentsRoutes from './routes/assessments.js';
import answersRoutes from './routes/answers.js';
import summariesRoutes from './routes/summaries.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import rolesRoutes from './routes/roles.js';
import permissionsRoutes from './routes/permissions.js';
import usersRoutes from './routes/users.js';
import auditRoutes from './routes/audit.js';
import aiRoutes from './routes/ai.js';
import bulkRoutes from './routes/bulk.js';
import docsRoutes from './routes/docs.js';
import type { Env } from './types/env.js';

const app = new Hono<Env>();

// HTTPS Enforcement (must be first)
app.use('*', httpsEnforcement);

// Security Headers (must be early)
app.use('*', securityHeaders);

// Global middleware
app.use('*', logger());

// CORS configuration
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Test-User-Id', 'X-Session-Id'],
}));

// Global rate limiting (100 requests per 15 minutes)
app.use('*', rateLimiter());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
// Auth routes with strict rate limiting (5 requests per 15 minutes)
// BUT: Exclude /api/auth/me from rate limiting (it's called frequently by Refine.dev)
app.use('/api/auth/*', async (c, next) => {
  // Skip rate limiting for /api/auth/me (authenticated endpoint, called frequently)
  if (c.req.path === '/api/auth/me' || c.req.path.endsWith('/me')) {
    await next();
    return;
  }
  // Apply strict rate limiting for other auth endpoints (login, register, etc.)
  return strictRateLimiter(c, next);
});
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/roles', rolesRoutes);
app.route('/api/permissions', permissionsRoutes);
app.route('/api/audit', auditRoutes);
app.route('/api/assessments', assessmentsRoutes);
app.route('/api/assessments', answersRoutes);
app.route('/api/assessments', summariesRoutes);
app.route('/api/admin/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/bulk', bulkRoutes);
app.route('/', docsRoutes); // API documentation routes

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
  }, 404);
});

// Global error handler
app.onError(errorHandler);

export default app;
