import { Hono } from 'hono';
import { db, permissions } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import { success, error } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// GET /api/permissions - Tüm permission'lar
app.get('/', requireAuth, async (c) => {
  try {
    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.resource, permissions.action);

    return success(c, { permissions: allPermissions });
  } catch (err) {
    console.error('Get permissions error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch permissions', 500);
  }
});

// GET /api/permissions/:id - Tek bir permission
app.get('/:id', requireAuth, async (c) => {
  try {
    const permissionId = c.req.param('id');

    const foundPermissions = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, permissionId))
      .limit(1);

    const permission = foundPermissions[0];

    if (!permission) {
      return error(c, 'Permission not found', 404);
    }

    return success(c, permission);
  } catch (err) {
    console.error('Get permission error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch permission', 500);
  }
});

// POST /api/permissions - Yeni permission oluştur
app.post('/', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { resource, action, description } = body;

    if (!resource || !action) {
      return error(c, 'Resource and action are required', 400);
    }

    // (resource, action) unique kontrolü
    const existing = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.resource, resource),
          eq(permissions.action, action)
        )
      )
      .limit(1);

    if (existing[0]) {
      return error(c, 'Permission with this resource and action already exists', 409);
    }

    // Permission oluştur
    const [newPermission] = await db.insert(permissions).values({
      resource,
      action,
      description: description || null,
    }).returning();

    return success(c, newPermission, 201);
  } catch (err) {
    console.error('Create permission error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to create permission', 500);
  }
});

// GET /api/permissions/by-resource/:resource - Resource'a göre permission'lar
app.get('/by-resource/:resource', requireAuth, async (c) => {
  try {
    const resource = c.req.param('resource');

    const resourcePermissions = await db
      .select()
      .from(permissions)
      .where(eq(permissions.resource, resource))
      .orderBy(permissions.action);

    return success(c, { permissions: resourcePermissions });
  } catch (err) {
    console.error('Get permissions by resource error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch permissions by resource', 500);
  }
});

export default app;

