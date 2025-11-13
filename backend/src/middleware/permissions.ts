import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';
import jwt from 'jsonwebtoken';
import { db, userRoles, roles, rolePermissions, permissions } from '../db/client.js';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Kullanıcının permission'larını çek
async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userPerms = await db
      .select({
        permission: permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    return userPerms.map(up => `${up.permission.resource}:${up.permission.action}`);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

// JWT token'dan user ID al
function getUserIdFromRequest(c: Context<Env>): string | null {
  const authHeader = c.req.header('Authorization');
  const userIdHeader = c.req.header('X-User-Id');

  if (userIdHeader) {
    return userIdHeader;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      return null;
    }
  }

  return null;
}

// Permission kontrolü yapan middleware
export const requirePermission = (resource: string, action: string) => {
  return async (c: Context<Env>, next: Next) => {
    const userId = getUserIdFromRequest(c);

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userPermissions = await getUserPermissions(userId);
    const requiredPermission = `${resource}:${action}`;

    if (!userPermissions.includes(requiredPermission)) {
      return c.json(
        { 
          error: 'Forbidden',
          message: `You don't have permission to ${action} ${resource}`,
          required: requiredPermission,
          have: userPermissions,
        } as any,
        403
      );
    }

    await next();
  };
};

// Multiple permission kontrolü (OR logic - herhangi biri varsa yeterli)
export const requireAnyPermission = (permissionList: Array<{ resource: string; action: string }>) => {
  return async (c: Context<Env>, next: Next) => {
    const userId = getUserIdFromRequest(c);

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userPermissions = await getUserPermissions(userId);
    const requiredPermissions = permissionList.map(p => `${p.resource}:${p.action}`);

    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return c.json(
        { 
          error: 'Forbidden',
          message: 'You don\'t have any of the required permissions',
          required: requiredPermissions,
          have: userPermissions,
        } as any,
        403
      );
    }

    await next();
  };
};

// Multiple permission kontrolü (AND logic - hepsi gerekli)
export const requireAllPermissions = (permissionList: Array<{ resource: string; action: string }>) => {
  return async (c: Context<Env>, next: Next) => {
    const userId = getUserIdFromRequest(c);

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userPermissions = await getUserPermissions(userId);
    const requiredPermissions = permissionList.map(p => `${p.resource}:${p.action}`);

    const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasAllPermissions) {
      return c.json(
        { 
          error: 'Forbidden',
          message: 'You don\'t have all required permissions',
          required: requiredPermissions,
          have: userPermissions,
        } as any,
        403
      );
    }

    await next();
  };
};

