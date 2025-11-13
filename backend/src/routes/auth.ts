import { Hono } from 'hono';
import { db, users, userRoles, roles, rolePermissions, permissions } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { success, error } from '../utils/response.js';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register - Kullanıcı kaydı
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

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
    
    const existingUser = existingUsers[0];

    if (existingUser) {
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

    // Default 'user' rolünü ata (eğer yoksa 'bilan-user', 'viewer' veya 'admin' rolünü dene)
    let userRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'user'))
      .limit(1)
      .then(roles => roles[0]);
    
    // Eğer user yoksa, bilan-user rolünü dene
    if (!userRole) {
      userRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'bilan-user'))
        .limit(1)
        .then(roles => roles[0]);
    }
    
    // Eğer hala rol yoksa, viewer rolünü dene
    if (!userRole) {
      userRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'viewer'))
        .limit(1)
        .then(roles => roles[0]);
    }

    // Eğer hala rol yoksa, admin rolünü dene (fallback)
    if (!userRole) {
      userRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'admin'))
        .limit(1)
        .then(roles => roles[0]);
    }

    if (userRole) {
      await db.insert(userRoles).values({
        userId: newUser.id,
        roleId: userRole.id,
      });
    } else {
      console.warn('No default role found for new user. User created without role.');
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return success(c, {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to register user', 500);
  }
});

// POST /api/auth/login - Kullanıcı girişi
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return error(c, 'Email and password are required', 400);
    }

    // Kullanıcıyı bul
    const foundUsers = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.isActive, true)
      ))
      .limit(1);
    
    const user = foundUsers[0];

    if (!user) {
      return error(c, 'Invalid email or password', 401);
    }

    // Password kontrolü
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return error(c, 'Invalid email or password', 401);
    }

    // lastLoginAt güncelle
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return success(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to login', 500);
  }
});

// GET /api/auth/me - Mevcut kullanıcı bilgileri
app.get('/me', async (c) => {
  try {
    // TODO: JWT token'dan user ID al (şimdilik test mode)
    const userId = c.req.header('X-User-Id') || c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!userId) {
      return error(c, 'Unauthorized', 401);
    }

    // JWT token decode (eğer token ise)
    let decodedUserId: string;
    try {
      const decoded = jwt.verify(userId, JWT_SECRET) as { userId: string };
      decodedUserId = decoded.userId;
    } catch {
      // Token değilse, direkt userId olarak kullan
      decodedUserId = userId;
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedUserId))
      .limit(1);
    
    const user = foundUsers[0];

    if (!user) {
      return error(c, 'User not found', 404);
    }

    // Kullanıcının rollerini ve permission'larını çek
    const userRolesData = await db
      .select({
        role: roles,
        permissions: permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, user.id));

    // Permission'ları unique yap
    const uniquePermissions = Array.from(
      new Map(
        userRolesData
          .map(ur => ur.permissions)
          .filter(p => p !== null)
          .map(p => [p!.id, p!])
      ).values()
    );

    return success(c, {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: Array.from(new Map(userRolesData.map(ur => [ur.role.id, ur.role])).values()),
      permissions: uniquePermissions.map(p => `${p.resource}:${p.action}`),
    });
  } catch (err) {
    console.error('Get me error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to get user info', 500);
  }
});

// GET /api/auth/permissions - Kullanıcının permission'ları
app.get('/permissions', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!userId) {
      return error(c, 'Unauthorized', 401);
    }

    let decodedUserId: string;
    try {
      const decoded = jwt.verify(userId, JWT_SECRET) as { userId: string };
      decodedUserId = decoded.userId;
    } catch {
      decodedUserId = userId;
    }

    // Kullanıcının permission'larını çek
    const userPermissions = await db
      .select({
        permission: permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, decodedUserId));

    const permissionsList = userPermissions.map(up => ({
      resource: up.permission.resource,
      action: up.permission.action,
      description: up.permission.description,
    }));

    return success(c, {
      permissions: permissionsList,
      formatted: permissionsList.map(p => `${p.resource}:${p.action}`),
    });
  } catch (err) {
    console.error('Get permissions error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to get permissions', 500);
  }
});

// POST /api/auth/logout - Logout (client-side token silme)
app.post('/logout', async (c) => {
  // JWT stateless olduğu için backend'de bir şey yapmaya gerek yok
  // Client-side token'ı siler
  return success(c, { message: 'Logged out successfully' });
});

export default app;

