import { db } from '../db/client.js';
import { users, roles, permissions, rolePermissions, userRoles, dashboardModules, modulePermissions } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// JWT_SECRET for seed script - allow default only in development
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error(
    '❌ CRITICAL: JWT_SECRET must be set in production environment.\n' +
    'Generate with: openssl rand -base64 32'
  );
}
if (JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. This is only safe for development!');
}

/**
 * Seed script to populate database with initial data
 * Run with: npx tsx backend/src/scripts/seed.ts
 */

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 0. Create tables if they don't exist (using raw SQL)
    console.log('📝 Checking/Creating database tables...');
    try {
      // Enable UUID extension
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      
      // Create tables using CREATE TABLE IF NOT EXISTS
      // This is a simplified approach - in production, use proper migrations
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          last_login_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          is_system BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resource VARCHAR(100) NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(resource, action)
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(role_id, permission_id)
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, role_id)
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          user_email VARCHAR(255),
          user_name VARCHAR(255),
          action VARCHAR(100) NOT NULL,
          resource VARCHAR(100) NOT NULL,
          resource_id UUID,
          changes JSONB,
          metadata JSONB,
          status VARCHAR(50) NOT NULL DEFAULT 'success',
          error_message TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS dashboard_modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(100),
          route VARCHAR(255) NOT NULL UNIQUE,
          is_active BOOLEAN NOT NULL DEFAULT true,
          "order" INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS module_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          module_id UUID NOT NULL REFERENCES dashboard_modules(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(module_id, permission_id)
        );
      `);
      
      // Create performance indexes
      try {
        await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);`);
        
        // Check if assessments table exists and add index
        const assessmentsExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'assessments'
          );
        `);
        
        if ((assessmentsExists[0] as any)?.exists) {
          await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);`);
          await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_assessments_clerk_user_id ON assessments(clerk_user_id);`);
        }
      } catch (indexError: any) {
        // Index creation errors are non-critical
        console.log('⚠️  Index creation warning (non-critical):', indexError.message);
      }
      
      console.log('✅ Tables created/verified\n');
    } catch (tableError: any) {
      // If tables already exist, that's fine
      if (tableError?.code === '42P07') {
        console.log('✅ Tables already exist\n');
      } else {
        console.error('⚠️  Table creation warning:', tableError.message);
        console.log('   Continuing with seed...\n');
      }
    }

    // 1. Create Permissions
    console.log('📝 Creating permissions...');
    
    const permissionData = [
      // Bilan permissions
      { resource: 'bilan', action: 'read', description: 'View bilan assessments' },
      { resource: 'bilan', action: 'create', description: 'Create bilan assessments' },
      { resource: 'bilan', action: 'update', description: 'Update bilan assessments' },
      { resource: 'bilan', action: 'delete', description: 'Delete bilan assessments' },
      { resource: 'bilan:assessment', action: 'read', description: 'View assessments' },
      { resource: 'bilan:assessment', action: 'create', description: 'Create assessments' },
      { resource: 'bilan:assessment', action: 'update', description: 'Update assessments' },
      { resource: 'bilan:assessment', action: 'delete', description: 'Delete assessments' },
      
      // User permissions
      { resource: 'users', action: 'read', description: 'View users' },
      { resource: 'users', action: 'create', description: 'Create users' },
      { resource: 'users', action: 'update', description: 'Update users' },
      { resource: 'users', action: 'delete', description: 'Delete users' },
      
      // Role permissions
      { resource: 'roles', action: 'read', description: 'View roles' },
      { resource: 'roles', action: 'create', description: 'Create roles' },
      { resource: 'roles', action: 'update', description: 'Update roles' },
      { resource: 'roles', action: 'delete', description: 'Delete roles' },
      
      // Permission permissions
      { resource: 'permissions', action: 'read', description: 'View permissions' },
      { resource: 'permissions', action: 'create', description: 'Create permissions' },
      
      // Analytics permissions
      { resource: 'analytics', action: 'read', description: 'View analytics' },
      
      // Dashboard permissions
      { resource: 'dashboard', action: 'read', description: 'View dashboard' },
    ];

    const createdPermissions = [];
    for (const perm of permissionData) {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(permissions)
        .where(and(
          eq(permissions.resource, perm.resource),
          eq(permissions.action, perm.action)
        ))
        .limit(1);

      if (existing.length === 0) {
        const [newPerm] = await db
          .insert(permissions)
          .values(perm)
          .returning();
        createdPermissions.push(newPerm);
        console.log(`  ✅ Created permission: ${perm.resource}:${perm.action}`);
      } else {
        createdPermissions.push(existing[0]);
        console.log(`  ⏭️  Permission already exists: ${perm.resource}:${perm.action}`);
      }
    }

    // 2. Create Roles
    console.log('\n👥 Creating roles...');
    
    const roleData = [
      {
        name: 'admin',
        description: 'Full system access',
        isSystem: true,
        permissions: createdPermissions.map(p => p.id), // All permissions
      },
      {
        name: 'bilan-manager',
        description: 'Can manage bilan assessments and view analytics',
        isSystem: true,
        permissions: createdPermissions
          .filter(p => 
            p.resource.startsWith('bilan') || 
            p.resource === 'analytics' || 
            p.resource === 'dashboard'
          )
          .map(p => p.id),
      },
      {
        name: 'bilan-user',
        description: 'Can create and manage own bilan assessments',
        isSystem: true,
        permissions: createdPermissions
          .filter(p => 
            (p.resource.startsWith('bilan') && (p.action === 'read' || p.action === 'create' || p.action === 'update')) ||
            p.resource === 'dashboard'
          )
          .map(p => p.id),
      },
      {
        name: 'viewer',
        description: 'Read-only access to dashboard and analytics',
        isSystem: true,
        permissions: createdPermissions
          .filter(p => 
            (p.action === 'read' && (p.resource === 'dashboard' || p.resource === 'analytics' || p.resource.startsWith('bilan')))
          )
          .map(p => p.id),
      },
    ];

    const createdRoles = [];
    for (const roleInfo of roleData) {
      const { permissions: rolePerms, ...roleDataWithoutPerms } = roleInfo;
      
      // Check if role already exists
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleInfo.name))
        .limit(1);

      let role;
      if (existing.length === 0) {
        [role] = await db
          .insert(roles)
          .values(roleDataWithoutPerms)
          .returning();
        console.log(`  ✅ Created role: ${roleInfo.name}`);
      } else {
        role = existing[0];
        console.log(`  ⏭️  Role already exists: ${roleInfo.name}`);
      }
      createdRoles.push(role);

      // Assign permissions to role
      if (rolePerms && rolePerms.length > 0) {
        for (const permId of rolePerms) {
          const existingRolePerm = await db
            .select()
            .from(rolePermissions)
            .where(and(
              eq(rolePermissions.roleId, role.id),
              eq(rolePermissions.permissionId, permId)
            ))
            .limit(1);

          if (existingRolePerm.length === 0) {
            await db.insert(rolePermissions).values({
              roleId: role.id,
              permissionId: permId,
            });
            console.log(`    ✅ Assigned permission to ${roleInfo.name}`);
          }
        }
      }
    }

    // 3. Create Default Admin User
    console.log('\n👤 Creating default admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bilan.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let adminUser;
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      [adminUser] = await db
        .insert(users)
        .values({
          email: adminEmail,
          passwordHash,
          name: adminName,
          isActive: true,
        })
        .returning();
      console.log(`  ✅ Created admin user: ${adminEmail}`);
    } else {
      adminUser = existingAdmin[0];
      console.log(`  ⏭️  Admin user already exists: ${adminEmail}`);
    }

    // Assign admin role to admin user
    const adminRole = createdRoles.find(r => r.name === 'admin');
    if (adminRole) {
      const existingUserRole = await db
        .select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, adminUser.id),
          eq(userRoles.roleId, adminRole.id)
        ))
        .limit(1);

      if (existingUserRole.length === 0) {
        await db.insert(userRoles).values({
          userId: adminUser.id,
          roleId: adminRole.id,
        });
        console.log(`  ✅ Assigned admin role to ${adminEmail}`);
      } else {
        console.log(`  ⏭️  Admin role already assigned to ${adminEmail}`);
      }
    }

    // 4. Create Dashboard Modules
    console.log('\n📦 Creating dashboard modules...');
    
    const moduleData = [
      {
        name: 'dashboard',
        displayName: 'Dashboard',
        description: 'Overview and statistics',
        icon: '📈',
        route: '/dashboard',
        isActive: true,
        order: 0,
        permissions: createdPermissions
          .filter(p => p.resource === 'dashboard')
          .map(p => p.id),
      },
      {
        name: 'bilan',
        displayName: 'Bilan de Compétences',
        description: 'Complete your skills assessment',
        icon: '📊',
        route: '/bilan',
        isActive: true,
        order: 1,
        permissions: createdPermissions
          .filter(p => p.resource.startsWith('bilan'))
          .map(p => p.id),
      },
      {
        name: 'assessments',
        displayName: 'Assessments',
        description: 'Manage your assessments',
        icon: '📝',
        route: '/assessments',
        isActive: true,
        order: 2,
        permissions: createdPermissions
          .filter(p => p.resource.startsWith('bilan'))
          .map(p => p.id),
      },
      {
        name: 'analytics',
        displayName: 'Analytics',
        description: 'View analytics and reports',
        icon: '📊',
        route: '/analytics',
        isActive: true,
        order: 3,
        permissions: createdPermissions
          .filter(p => p.resource === 'analytics')
          .map(p => p.id),
      },
      {
        name: 'users',
        displayName: 'User Management',
        description: 'Manage users and accounts',
        icon: '👥',
        route: '/users',
        isActive: true,
        order: 4,
        permissions: createdPermissions
          .filter(p => p.resource === 'users')
          .map(p => p.id),
      },
      {
        name: 'roles',
        displayName: 'Roles & Permissions',
        description: 'Manage roles and permissions',
        icon: '🔐',
        route: '/roles',
        isActive: true,
        order: 5,
        permissions: createdPermissions
          .filter(p => p.resource === 'roles' || p.resource === 'permissions')
          .map(p => p.id),
      },
    ];

    for (const moduleInfo of moduleData) {
      const { permissions: modulePerms, ...moduleDataWithoutPerms } = moduleInfo;
      
      const existing = await db
        .select()
        .from(dashboardModules)
        .where(eq(dashboardModules.name, moduleInfo.name))
        .limit(1);

      let module;
      if (existing.length === 0) {
        [module] = await db
          .insert(dashboardModules)
          .values(moduleDataWithoutPerms)
          .returning();
        console.log(`  ✅ Created module: ${moduleInfo.name}`);
      } else {
        module = existing[0];
        console.log(`  ⏭️  Module already exists: ${moduleInfo.name}`);
      }

      // Assign permissions to module
      if (modulePerms && modulePerms.length > 0) {
        for (const permId of modulePerms) {
          const existingModulePerm = await db
            .select()
            .from(modulePermissions)
            .where(and(
              eq(modulePermissions.moduleId, module.id),
              eq(modulePermissions.permissionId, permId)
            ))
            .limit(1);

          if (existingModulePerm.length === 0) {
            await db.insert(modulePermissions).values({
              moduleId: module.id,
              permissionId: permId,
            });
          }
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Permissions: ${createdPermissions.length}`);
    console.log(`  - Roles: ${createdRoles.length}`);
    console.log(`  - Admin User: ${adminEmail} (password: ${adminPassword})`);
    console.log(`  - Modules: ${moduleData.length}`);
    console.log('\n⚠️  IMPORTANT: Change the default admin password after first login!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
// ES module'de require.main kullanılamaz, import.meta.url kullan
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

export { seed };

