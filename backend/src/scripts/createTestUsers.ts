/**
 * Script to create test users (admin and regular user)
 * Run with: tsx src/scripts/createTestUsers.ts
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import { users, roles, userRoles, permissions, rolePermissions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...\n');

    // 1. Check if admin role exists, create if not
    let adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin')).limit(1);
    
    if (adminRole.length === 0) {
      console.log('📝 Creating Admin role...');
      const [newAdminRole] = await db.insert(roles).values({
        name: 'Admin',
        description: 'Administrator with full access',
        isSystem: true,
      }).returning();
      adminRole = [newAdminRole];
      console.log('✅ Admin role created\n');
    } else {
      console.log('✅ Admin role already exists\n');
    }

    // 2. Check if User role exists, create if not
    let userRole = await db.select().from(roles).where(eq(roles.name, 'User')).limit(1);
    
    if (userRole.length === 0) {
      console.log('📝 Creating User role...');
      const [newUserRole] = await db.insert(roles).values({
        name: 'User',
        description: 'Regular user with basic access',
        isSystem: true,
      }).returning();
      userRole = [newUserRole];
      console.log('✅ User role created\n');
    } else {
      console.log('✅ User role already exists\n');
    }

    // 3. Get all permissions and assign to Admin role
    const allPermissions = await db.select().from(permissions);
    
    if (allPermissions.length > 0) {
      console.log(`📝 Assigning ${allPermissions.length} permissions to Admin role...`);
      
      for (const perm of allPermissions) {
        const existing = await db
          .select()
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, adminRole[0].id))
          .where(eq(rolePermissions.permissionId, perm.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(rolePermissions).values({
            roleId: adminRole[0].id,
            permissionId: perm.id,
          });
        }
      }
      console.log('✅ Permissions assigned to Admin role\n');
    }

    // 4. Assign basic permissions to User role
    const basicPermissions = await db
      .select()
      .from(permissions)
      .where(eq(permissions.resource, 'bilan:assessment'))
      .where(eq(permissions.action, 'create'));
    
    if (basicPermissions.length > 0) {
      console.log('📝 Assigning basic permissions to User role...');
      
      for (const perm of basicPermissions) {
        const existing = await db
          .select()
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, userRole[0].id))
          .where(eq(rolePermissions.permissionId, perm.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(rolePermissions).values({
            roleId: userRole[0].id,
            permissionId: perm.id,
          });
        }
      }
      console.log('✅ Basic permissions assigned to User role\n');
    }

    // 5. Create or update admin user
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    let adminUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (adminUser.length === 0) {
      console.log('📝 Creating admin user...');
      const [newAdmin] = await db.insert(users).values({
        email: adminEmail,
        passwordHash: hashedAdminPassword,
        name: 'Test Admin',
        isActive: true,
      }).returning();
      adminUser = [newAdmin];
      console.log('✅ Admin user created\n');
    } else {
      console.log('✅ Admin user already exists\n');
      // Update password in case it changed
      await db.update(users)
        .set({ passwordHash: hashedAdminPassword })
        .where(eq(users.id, adminUser[0].id));
      console.log('✅ Admin password updated\n');
    }

    // Assign Admin role to admin user
    const adminUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, adminUser[0].id))
      .where(eq(userRoles.roleId, adminRole[0].id))
      .limit(1);

    if (adminUserRole.length === 0) {
      await db.insert(userRoles).values({
        userId: adminUser[0].id,
        roleId: adminRole[0].id,
      });
      console.log('✅ Admin role assigned to admin user\n');
    }

    // 6. Create or update regular user
    const userEmail = 'user@test.com';
    const userPassword = 'user123';
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    let regularUser = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (regularUser.length === 0) {
      console.log('📝 Creating regular user...');
      const [newUser] = await db.insert(users).values({
        email: userEmail,
        passwordHash: hashedUserPassword,
        name: 'Test User',
        isActive: true,
      }).returning();
      regularUser = [newUser];
      console.log('✅ Regular user created\n');
    } else {
      console.log('✅ Regular user already exists\n');
      // Update password in case it changed
      await db.update(users)
        .set({ passwordHash: hashedUserPassword })
        .where(eq(users.id, regularUser[0].id));
      console.log('✅ User password updated\n');
    }

    // Assign User role to regular user
    const regularUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, regularUser[0].id))
      .where(eq(userRoles.roleId, userRole[0].id))
      .limit(1);

    if (regularUserRole.length === 0) {
      await db.insert(userRoles).values({
        userId: regularUser[0].id,
        roleId: userRole[0].id,
      });
      console.log('✅ User role assigned to regular user\n');
    }

    // Summary
    console.log('='.repeat(50));
    console.log('✅ Test Users Created Successfully!\n');
    console.log('📋 Admin Account:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: Admin (Full Access)\n`);
    console.log('📋 Regular User Account:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: ${userPassword}`);
    console.log(`   Role: User (Basic Access - Can create assessments)\n`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { createTestUsers };

