import { Hono } from 'hono';
import { db, roles, rolePermissions, permissions, userRoles } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import { success, error } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// GET /api/roles - Tüm roller
app.get('/', requireAuth, async (c) => {
  try {
    const allRoles = await db
      .select()
      .from(roles)
      .orderBy(roles.name);

    return success(c, { roles: allRoles });
  } catch (err) {
    console.error('Get roles error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch roles', 500);
  }
});

// GET /api/roles/:id - Tek bir rol
app.get('/:id', requireAuth, async (c) => {
  try {
    const roleId = c.req.param('id');

    const foundRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    const role = foundRoles[0];

    if (!role) {
      return error(c, 'Role not found', 404);
    }

    // Rolün permission'larını çek
    const rolePerms = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return success(c, {
      ...role,
      permissions: rolePerms.map(rp => rp.permission),
    });
  } catch (err) {
    console.error('Get role error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch role', 500);
  }
});

// POST /api/roles - Yeni rol oluştur
app.post('/', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, permissionIds } = body;

    if (!name) {
      return error(c, 'Role name is required', 400);
    }

    // Name zaten var mı kontrol et
    const existingRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);

    if (existingRoles[0]) {
      return error(c, 'Role name already exists', 409);
    }

    // Rol oluştur
    const [newRole] = await db.insert(roles).values({
      name,
      description: description || null,
      isSystem: false,
    }).returning();

    // Permission'ları ata (eğer verilmişse)
    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      const rolePermValues = permissionIds.map((permId: string) => ({
        roleId: newRole.id,
        permissionId: permId,
      }));

      await db.insert(rolePermissions).values(rolePermValues);
    }

    return success(c, newRole, 201);
  } catch (err) {
    console.error('Create role error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to create role', 500);
  }
});

// PATCH /api/roles/:id - Rol güncelle
app.patch('/:id', requireAuth, async (c) => {
  try {
    const roleId = c.req.param('id');
    const body = await c.req.json();
    const { name, description, permissionIds } = body;

    // Rol var mı kontrol et
    const foundRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    const role = foundRoles[0];

    if (!role) {
      return error(c, 'Role not found', 404);
    }

    // System role'ları güncellenemez
    if (role.isSystem) {
      return error(c, 'System roles cannot be updated', 403);
    }

    // Update fields
    const updateData: any = {};
    if (name !== undefined) {
      // Name değişiyorsa, unique kontrolü yap
      if (name !== role.name) {
        const existingRoles = await db
          .select()
          .from(roles)
          .where(eq(roles.name, name))
          .limit(1);

        if (existingRoles[0]) {
          return error(c, 'Role name already exists', 409);
        }
      }
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(roles)
        .set(updateData)
        .where(eq(roles.id, roleId));
    }

    // Permission'ları güncelle (eğer verilmişse)
    if (permissionIds !== undefined && Array.isArray(permissionIds)) {
      // Mevcut permission'ları sil
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // Yeni permission'ları ekle
      if (permissionIds.length > 0) {
        const rolePermValues = permissionIds.map((permId: string) => ({
          roleId: roleId,
          permissionId: permId,
        }));

        await db.insert(rolePermissions).values(rolePermValues);
      }
    }

    // Güncellenmiş rolü döndür
    const updatedRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    return success(c, updatedRoles[0]);
  } catch (err) {
    console.error('Update role error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to update role', 500);
  }
});

// DELETE /api/roles/:id - Rol sil
app.delete('/:id', requireAuth, async (c) => {
  try {
    const roleId = c.req.param('id');

    // Rol var mı kontrol et
    const foundRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    const role = foundRoles[0];

    if (!role) {
      return error(c, 'Role not found', 404);
    }

    // System role'ları silinemez
    if (role.isSystem) {
      return error(c, 'System roles cannot be deleted', 403);
    }

    // Bu role sahip kullanıcı var mı kontrol et
    const usersWithRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId))
      .limit(1);

    if (usersWithRole.length > 0) {
      return error(c, 'Cannot delete role: users still have this role', 409);
    }

    // Rolü sil (cascade ile permission'lar da silinir)
    await db.delete(roles).where(eq(roles.id, roleId));

    return success(c, { message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Delete role error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to delete role', 500);
  }
});

// POST /api/roles/:id/permissions - Role permission ekle/çıkar
app.post('/:id/permissions', requireAuth, async (c) => {
  try {
    const roleId = c.req.param('id');
    const body = await c.req.json();
    const { permissionId, action } = body; // action: 'add' | 'remove'

    if (!permissionId || !action) {
      return error(c, 'permissionId and action (add/remove) are required', 400);
    }

    if (action !== 'add' && action !== 'remove') {
      return error(c, 'action must be "add" or "remove"', 400);
    }

    // Rol var mı kontrol et
    const foundRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!foundRoles[0]) {
      return error(c, 'Role not found', 404);
    }

    if (action === 'add') {
      // Permission zaten var mı kontrol et
      const existing = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId)
          )
        )
        .limit(1);

      if (existing[0]) {
        return error(c, 'Permission already assigned to role', 409);
      }

      await db.insert(rolePermissions).values({
        roleId,
        permissionId,
      });
    } else {
      // Remove
      await db.delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId)
          )
        );
    }

    return success(c, { message: `Permission ${action === 'add' ? 'added' : 'removed'} successfully` });
  } catch (err) {
    console.error('Manage role permission error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to manage role permission', 500);
  }
});

export default app;

