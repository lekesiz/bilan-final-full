/**
 * Audit Trail Routes
 * 
 * API endpoints for audit log management
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { success, error } from '../utils/response.js';
import { getAuditLogs, getAuditLogCount, getResourceAuditLogs, getUserAuditLogs } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

const app = new Hono();

// Query schema for audit logs
const auditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  status: z.enum(['success', 'failure', 'error']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// GET /api/audit - List audit logs with filters
app.get(
  '/',
  requireAuth,
  requirePermission('audit', 'read'),
  async (c) => {
    try {
      const query = c.req.query();
      const parsed = auditLogQuerySchema.safeParse(query);

      if (!parsed.success) {
        return error(c, 'Invalid query parameters', 400);
      }

      const filters = {
        userId: parsed.data.userId,
        action: parsed.data.action,
        resource: parsed.data.resource,
        resourceId: parsed.data.resourceId,
        status: parsed.data.status,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      };

      const [logs, total] = await Promise.all([
        getAuditLogs(filters),
        getAuditLogCount(filters),
      ]);

      return success(c, {
        logs,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < total,
        },
      });
    } catch (err) {
      logger.error('Get audit logs error:', err);
      if (err instanceof Error) {
        return error(c, err.message, 500);
      }
      return error(c, 'Failed to fetch audit logs', 500);
    }
  }
);

// GET /api/audit/resource/:resource/:resourceId - Get audit logs for a specific resource
app.get(
  '/resource/:resource/:resourceId',
  requireAuth,
  requirePermission('audit', 'read'),
  async (c) => {
    try {
      const resource = c.req.param('resource');
      const resourceId = c.req.param('resourceId');
      const limit = parseInt(c.req.query('limit') || '50', 10);

      if (!resource || !resourceId) {
        return error(c, 'Resource and resourceId are required', 400);
      }

      const logs = await getResourceAuditLogs(resource, resourceId, limit);

      return success(c, { logs });
    } catch (err) {
      logger.error('Get resource audit logs error:', err);
      if (err instanceof Error) {
        return error(c, err.message, 500);
      }
      return error(c, 'Failed to fetch resource audit logs', 500);
    }
  }
);

// GET /api/audit/user/:userId - Get audit logs for a specific user
app.get(
  '/user/:userId',
  requireAuth,
  requirePermission('audit', 'read'),
  async (c) => {
    try {
      const userId = c.req.param('userId');
      const limit = parseInt(c.req.query('limit') || '100', 10);

      if (!userId) {
        return error(c, 'UserId is required', 400);
      }

      const logs = await getUserAuditLogs(userId, limit);

      return success(c, { logs });
    } catch (err) {
      logger.error('Get user audit logs error:', err);
      if (err instanceof Error) {
        return error(c, err.message, 500);
      }
      return error(c, 'Failed to fetch user audit logs', 500);
    }
  }
);

export default app;

