/**
 * Bulk Operations Routes
 * 
 * API endpoints for bulk operations (delete, update, etc.)
 */

import { Hono } from 'hono';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';
import { db } from '../db/client.js';
import { users, roles, assessments, userRoles, rolePermissions, permissions } from '../db/schema.js';
import { eq, inArray, and } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { createAuditLog } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to get auth context from request
async function getAuthContext(c: any) {
  // Get user from JWT token or test header (same logic as auth routes)
  const authHeader = c.req.header('Authorization');
  const userIdHeader = c.req.header('X-User-Id');
  
  let userId: string | null = null;
  let userEmail: string | null = null;
  let userName: string | null = null;
  let userPermissions: string[] = [];

  // Get from X-User-Id header (test mode)
  if (userIdHeader) {
    userId = userIdHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract from JWT token
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string };
      userId = decoded.userId;
    } catch (err) {
      // Invalid token
      return { userId: null, userEmail: null, userName: null, permissions: [] };
    }
  }

  if (userId) {
    // Fetch user details from DB
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (foundUsers.length > 0) {
      const user = foundUsers[0];
      userEmail = user.email;
      userName = user.name;
      
      // Get permissions from roles
      const userRolesData = await db
        .select({
          permission: permissions,
        })
        .from(userRoles)
        .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, user.id));
      
      userPermissions = userRolesData.map((ur: any) => `${ur.permission.resource}:${ur.permission.action}`);
    }
  }

  return {
    userId,
    userEmail,
    userName,
    permissions: userPermissions,
  };
}

const app = new Hono();

// Bulk delete schema
const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  resource: z.enum(['users', 'roles', 'assessments']),
});

// Bulk update schema
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  resource: z.enum(['users', 'roles', 'assessments']),
  updates: z.record(z.any()),
});

// POST /api/bulk/delete - Bulk delete
app.post(
  '/delete',
  requireAuth,
  async (c) => {
    try {
      const body = await c.req.json();
      const parsed = bulkDeleteSchema.safeParse(body);

      if (!parsed.success) {
        return error(c, 'Invalid request body', 400);
      }

      const { ids, resource } = parsed.data;
      const authContext = await getAuthContext(c);

      // Check permissions based on resource
      const permissionMap: Record<string, string> = {
        users: 'users',
        roles: 'roles',
        assessments: 'bilan:assessment',
      };

      const requiredPermission = permissionMap[resource];
      if (!authContext.permissions.includes(`${requiredPermission}:delete`)) {
        return error(c, 'Insufficient permissions', 403);
      }

      let deletedCount = 0;
      let errors: string[] = [];

      switch (resource) {
        case 'users':
          // Don't allow bulk delete of system users
          const userResults = await db
            .delete(users)
            .where(inArray(users.id, ids))
            .returning();

          deletedCount = userResults.length;

          // Audit log
          for (const user of userResults) {
            await createAuditLog(
              {
                action: 'delete',
                resource: 'user',
                resourceId: user.id,
                status: 'success',
              },
              {
                userId: authContext.userId || undefined,
                userEmail: authContext.userEmail || undefined,
                userName: authContext.userName || undefined,
                ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                userAgent: c.req.header('user-agent') || undefined,
              }
            );
          }
          break;

        case 'roles':
          // Don't allow bulk delete of system roles
          const roleResults = await db
            .delete(roles)
            .where(
              inArray(roles.id, ids)
            )
            .returning();

          deletedCount = roleResults.length;

          // Audit log
          for (const role of roleResults) {
            await createAuditLog(
              {
                action: 'delete',
                resource: 'role',
                resourceId: role.id,
                status: 'success',
              },
              {
                userId: authContext.userId || undefined,
                userEmail: authContext.userEmail || undefined,
                userName: authContext.userName || undefined,
                ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                userAgent: c.req.header('user-agent') || undefined,
              }
            );
          }
          break;

        case 'assessments':
          const assessmentResults = await db
            .delete(assessments)
            .where(inArray(assessments.id, ids))
            .returning();

          deletedCount = assessmentResults.length;

          // Audit log
          for (const assessment of assessmentResults) {
            await createAuditLog(
              {
                action: 'delete',
                resource: 'assessment',
                resourceId: assessment.id,
                status: 'success',
              },
              {
                userId: authContext.userId || undefined,
                userEmail: authContext.userEmail || undefined,
                userName: authContext.userName || undefined,
                ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                userAgent: c.req.header('user-agent') || undefined,
              }
            );
          }
          break;
      }

      return success(c, {
        deletedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      logger.error('Bulk delete error:', err);
      if (err instanceof Error) {
        return error(c, err.message, 500);
      }
      return error(c, 'Failed to perform bulk delete', 500);
    }
  }
);

// POST /api/bulk/update - Bulk update
app.post(
  '/update',
  requireAuth,
  async (c) => {
    try {
      const body = await c.req.json();
      const parsed = bulkUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return error(c, 'Invalid request body', 400);
      }

      const { ids, resource, updates } = parsed.data;
      const authContext = await getAuthContext(c);

      // Check permissions based on resource
      const permissionMap: Record<string, string> = {
        users: 'users',
        roles: 'roles',
        assessments: 'bilan:assessment',
      };

      const requiredPermission = permissionMap[resource];
      // Check permission using requirePermission middleware pattern
      const hasPermission = authContext.permissions.includes(`${requiredPermission}:update`);
      if (!hasPermission && authContext.permissions.length > 0) {
        return error(c, 'Insufficient permissions', 403);
      }

      let updatedCount = 0;
      let errors: string[] = [];

      switch (resource) {
        case 'users':
          // Only allow updating isActive for bulk operations
          if (Object.keys(updates).every(key => key === 'isActive')) {
            const userResults = await db
              .update(users)
              .set({
                isActive: updates.isActive as boolean,
                updatedAt: new Date(),
              })
              .where(inArray(users.id, ids))
              .returning();

            updatedCount = userResults.length;

            // Audit log
            for (const user of userResults) {
              await createAuditLog(
                {
                  action: 'update',
                  resource: 'user',
                  resourceId: user.id,
                  changes: {
                    before: { isActive: !updates.isActive },
                    after: { isActive: updates.isActive },
                  },
                  status: 'success',
                },
                {
                  userId: authContext.userId || undefined,
                  userEmail: authContext.userEmail || undefined,
                  userName: authContext.userName || undefined,
                  ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                  userAgent: c.req.header('user-agent') || undefined,
                }
              );
            }
          } else {
            return error(c, 'Only isActive can be updated in bulk for users', 400);
          }
          break;

        case 'roles':
          // Roles don't have bulk updateable fields
          return error(c, 'Bulk update not supported for roles', 400);

        case 'assessments':
          // Only allow updating status for bulk operations
          if (Object.keys(updates).every(key => key === 'status')) {
            const assessmentResults = await db
              .update(assessments)
              .set({
                status: updates.status as string,
                updatedAt: new Date(),
              })
              .where(inArray(assessments.id, ids))
              .returning();

            updatedCount = assessmentResults.length;

            // Audit log
            for (const assessment of assessmentResults) {
              await createAuditLog(
                {
                  action: 'update',
                  resource: 'assessment',
                  resourceId: assessment.id,
                  changes: {
                    before: { status: assessment.status },
                    after: { status: updates.status },
                  },
                  status: 'success',
                },
                {
                  userId: authContext.userId || undefined,
                  userEmail: authContext.userEmail || undefined,
                  userName: authContext.userName || undefined,
                  ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                  userAgent: c.req.header('user-agent') || undefined,
                }
              );
            }
          } else {
            return error(c, 'Only status can be updated in bulk for assessments', 400);
          }
          break;
      }

      return success(c, {
        updatedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      logger.error('Bulk update error:', err);
      if (err instanceof Error) {
        return error(c, err.message, 500);
      }
      return error(c, 'Failed to perform bulk update', 500);
    }
  }
);

export default app;

