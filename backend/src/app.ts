import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error.js';
import assessmentsRoutes from './routes/assessments.js';
import answersRoutes from './routes/answers.js';
import summariesRoutes from './routes/summaries.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import rolesRoutes from './routes/roles.js';
import permissionsRoutes from './routes/permissions.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import type { Env } from './types/env.js';

const app = new Hono<Env>();

// Global middleware
app.use('*', logger());

// CORS configuration
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Test-User-Id', 'X-Session-Id'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/roles', rolesRoutes);
app.route('/api/permissions', permissionsRoutes);
app.route('/api/assessments', assessmentsRoutes);
app.route('/api/assessments', answersRoutes);
app.route('/api/assessments', summariesRoutes);
app.route('/api/admin/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);

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
