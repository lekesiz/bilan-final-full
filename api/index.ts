// Vercel Serverless Function for Backend API
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from '../backend/src/middleware/error.js';
import assessmentsRoutes from '../backend/src/routes/assessments.js';
import answersRoutes from '../backend/src/routes/answers.js';
import summariesRoutes from '../backend/src/routes/summaries.js';
import type { Env } from '../backend/src/types/env.js';

const app = new Hono<Env>();

// Global middleware
app.use('*', logger());

// CORS configuration
app.use('*', cors({
  origin: process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000',
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
app.route('/api/assessments', assessmentsRoutes);
app.route('/api/assessments', answersRoutes);
app.route('/api/assessments', summariesRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
  }, 404);
});

// Global error handler
app.onError(errorHandler);

// Export for Vercel serverless function
export default app;
