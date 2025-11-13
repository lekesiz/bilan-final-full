/**
 * Audit Service
 * 
 * Service for logging audit trail events
 */

import { db } from '../db/client.js';
import { auditLogs } from '../db/schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import type { NewAuditLog } from '../db/schema.js';

export interface AuditLogContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any; // Additional metadata
}

export interface AuditLogOptions {
  action: string; // 'create', 'update', 'delete', 'login', 'logout', 'view', etc.
  resource: string; // 'assessment', 'user', 'role', 'permission', etc.
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  status?: 'success' | 'failure' | 'error';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  options: AuditLogOptions,
  context: AuditLogContext
): Promise<void> {
  try {
    const auditLog: NewAuditLog = {
      userId: context.userId,
      userEmail: context.userEmail,
      userName: context.userName,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      changes: options.changes ? JSON.parse(JSON.stringify(options.changes)) : null,
      status: options.status || 'success',
      errorMessage: options.errorMessage || null,
      metadata: {
        ...context,
        ...options.metadata,
      },
    };

    await db.insert(auditLogs).values(auditLog);
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    logger.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters.resource) {
    conditions.push(eq(auditLogs.resource, filters.resource));
  }
  if (filters.resourceId) {
    conditions.push(eq(auditLogs.resourceId, filters.resourceId));
  }
  if (filters.status) {
    conditions.push(eq(auditLogs.status, filters.status));
  }
  if (filters.startDate) {
    conditions.push(gte(auditLogs.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(auditLogs.createdAt, filters.endDate));
  }

  const query = db
    .select()
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(filters.limit || 100)
    .offset(filters.offset || 0);

  return await query;
}

/**
 * Get audit log count with filters
 */
export async function getAuditLogCount(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters.resource) {
    conditions.push(eq(auditLogs.resource, filters.resource));
  }
  if (filters.resourceId) {
    conditions.push(eq(auditLogs.resourceId, filters.resourceId));
  }
  if (filters.status) {
    conditions.push(eq(auditLogs.status, filters.status));
  }
  if (filters.startDate) {
    conditions.push(gte(auditLogs.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(auditLogs.createdAt, filters.endDate));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count || 0;
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(resource: string, resourceId: string, limit: number = 50) {
  return await db
    .select()
    .from(auditLogs)
    .where(and(
      eq(auditLogs.resource, resource),
      eq(auditLogs.resourceId, resourceId)
    ))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId: string, limit: number = 100) {
  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

