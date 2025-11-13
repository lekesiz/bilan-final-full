import { Hono } from 'hono';
import { db, users, userRoles, roles } from '../db/client.js';
import { eq, and, or, like, count } from 'drizzle-orm';
import { success, error } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import bcrypt from 'bcrypt';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// GET /api/users - Tüm kullanıcılar (list)
app.get('/', requireAuth, requirePermission('users', 'read'), async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');
    const search = c.req.query('search');

    let whereClause: any = undefined;

    if (search) {
      whereClause = or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      );
    }

    // Kullanıcıları çek
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    // Total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Her kullanıcının rollerini çek
    const usersWithRoles = await Promise.all(
      allUsers.map(async (user) => {
        const userRolesData = await db
          .select({
            role: roles,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));

        return {
          ...user,
          roles: userRolesData.map(ur => ur.role),
        };
      })
    );

    return success(c, {
      data: usersWithRoles,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error('Get users error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch users', 500);
  }
});

// GET /api/users/:id - Tek bir kullanıcı
app.get('/:id', requireAuth, requirePermission('users', 'read'), async (c) => {
  try {
    const userId = c.req.param('id');

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = foundUsers[0];

    if (!user) {
      return error(c, 'User not found', 404);
    }

    // Kullanıcının rollerini çek
    const userRolesData = await db
      .select({
        role: roles,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    // Password hash'i döndürme
    const { passwordHash, ...userWithoutPassword } = user;

    return success(c, {
      ...userWithoutPassword,
      roles: userRolesData.map(ur => ur.role),
    });
  } catch (err) {
    console.error('Get user error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch user', 500);
  }
});

// POST /api/users - Yeni kullanıcı oluştur
app.post('/', requireAuth, requirePermission('users', 'create'), async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, roleIds } = body;

    if (!email || !password || !name) {
      return error(c, 'Email, password, and name are required', 400);
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error(c, 'Invalid email format', 400);
    }

    // Password uzunluk kontrolü
    if (password.length < 8) {
      return error(c, 'Password must be at least 8 characters', 400);
    }

    // Email zaten var mı kontrol et
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers[0]) {
      return error(c, 'Email already exists', 409);
    }

    // Password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      isActive: true,
    }).returning();

    // Rolleri ata (eğer verilmişse)
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      const userRoleValues = roleIds.map((roleId: string) => ({
        userId: newUser.id,
        roleId,
      }));

      await db.insert(userRoles).values(userRoleValues);
    } else {
      // Default 'user' rolünü ata
      const userRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'user'))
        .limit(1);

      if (userRole[0]) {
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId: userRole[0].id,
        });
      }
    }

    // Password hash'i döndürme
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return success(c, userWithoutPassword, 201);
  } catch (err) {
    console.error('Create user error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to create user', 500);
  }
});

// PATCH /api/users/:id - Kullanıcı güncelle
app.patch('/:id', requireAuth, requirePermission('users', 'update'), async (c) => {
  try {
    const userId = c.req.param('id');
    const body = await c.req.json();
    const { email, password, name, isActive, roleIds } = body;

    // Kullanıcı var mı kontrol et
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = foundUsers[0];

    if (!user) {
      return error(c, 'User not found', 404);
    }

    // Update fields
    const updateData: any = {};
    if (email !== undefined && email !== user.email) {
      // Email değişiyorsa, unique kontrolü yap
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUsers[0]) {
        return error(c, 'Email already exists', 409);
      }
      updateData.email = email;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (password !== undefined) {
      if (password.length < 8) {
        return error(c, 'Password must be at least 8 characters', 400);
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    }

    // Rolleri güncelle (eğer verilmişse)
    if (roleIds !== undefined && Array.isArray(roleIds)) {
      // Mevcut rolleri sil
      await db.delete(userRoles)
        .where(eq(userRoles.userId, userId));

      // Yeni rolleri ekle
      if (roleIds.length > 0) {
        const userRoleValues = roleIds.map((roleId: string) => ({
          userId: userId,
          roleId,
        }));

        await db.insert(userRoles).values(userRoleValues);
      }
    }

    // Güncellenmiş kullanıcıyı döndür
    const updatedUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const { passwordHash: _, ...userWithoutPassword } = updatedUsers[0];

    return success(c, userWithoutPassword);
  } catch (err) {
    console.error('Update user error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to update user', 500);
  }
});

// DELETE /api/users/:id - Kullanıcı sil
app.delete('/:id', requireAuth, requirePermission('users', 'delete'), async (c) => {
  try {
    const userId = c.req.param('id');

    // Kullanıcı var mı kontrol et
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!foundUsers[0]) {
      return error(c, 'User not found', 404);
    }

    // Kullanıcıyı sil (cascade ile rolleri de silinir)
    await db.delete(users).where(eq(users.id, userId));

    return success(c, { message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to delete user', 500);
  }
});

export default app;

