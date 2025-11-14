/**
 * Script to assign permissions to existing users
 * Run with: tsx src/scripts/assignPermissions.ts
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import { users, roles, userRoles, permissions, rolePermissions } from '../db/schema.js';
import { eq, and, or, like } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function assignPermissions() {
  try {
    console.log('🚀 Assigning permissions to existing users...\n');

    // 1. Get all users
    const allUsers = await db.select().from(users);
    console.log(`📋 Found ${allUsers.length} users in database\n`);

    if (allUsers.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      return;
    }

    // 2. Get or create Admin role (try different variations)
    let adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
    
    if (adminRole.length === 0) {
      adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin')).limit(1);
    }
    
    if (adminRole.length === 0) {
      console.log('📝 Creating Admin role...');
      const [newAdminRole] = await db.insert(roles).values({
        name: 'admin',
        description: 'Administrator with full access',
        isSystem: true,
      }).returning();
      adminRole = [newAdminRole];
      console.log('✅ Admin role created\n');
    } else {
      console.log(`✅ Admin role already exists (name: ${adminRole[0].name})\n`);
    }

    // 3. Get all permissions
    const allPermissions = await db.select().from(permissions);
    console.log(`📝 Found ${allPermissions.length} permissions\n`);

    if (allPermissions.length === 0) {
      console.log('⚠️  No permissions found. Please run seed script first.');
      return;
    }

    // 4. Assign all permissions to Admin role
    console.log('📝 Assigning all permissions to Admin role...');
    let assignedCount = 0;
    for (const perm of allPermissions) {
      const existing = await db
        .select()
        .from(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, adminRole[0].id),
          eq(rolePermissions.permissionId, perm.id)
        ))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(rolePermissions).values({
          roleId: adminRole[0].id,
          permissionId: perm.id,
        });
        assignedCount++;
      }
    }
    console.log(`✅ Assigned ${assignedCount} new permissions to Admin role (total: ${allPermissions.length})\n`);

    // 5. Find admin users (email contains 'admin' or name contains 'admin')
    const adminUsers = allUsers.filter(user => 
      user.email.toLowerCase().includes('admin') || 
      (user.name && user.name.toLowerCase().includes('admin'))
    );

    console.log(`👤 Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'No name'})`);
    });
    console.log('');

    // 6. Assign Admin role to admin users
    for (const adminUser of adminUsers) {
      const existingUserRole = await db
        .select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, adminUser.id),
          eq(userRoles.roleId, adminRole[0].id)
        ))
        .limit(1);

      if (existingUserRole.length === 0) {
        await db.insert(userRoles).values({
          userId: adminUser.id,
          roleId: adminRole[0].id,
        });
        console.log(`✅ Assigned Admin role to ${adminUser.email}`);
      } else {
        console.log(`⏭️  ${adminUser.email} already has Admin role`);
      }
    }

    // 7. For non-admin users, assign basic User role if they don't have any role
    const nonAdminUsers = allUsers.filter(user => 
      !adminUsers.some(admin => admin.id === user.id)
    );

    if (nonAdminUsers.length > 0) {
      console.log(`\n👥 Processing ${nonAdminUsers.length} non-admin user(s)...`);

      // Get or create User role
      let userRole = await db.select().from(roles).where(eq(roles.name, 'user')).limit(1);
      
      if (userRole.length === 0) {
        userRole = await db.select().from(roles).where(eq(roles.name, 'bilan-user')).limit(1);
      }
      
      if (userRole.length === 0) {
        console.log('📝 Creating User role...');
        const [newUserRole] = await db.insert(roles).values({
          name: 'user',
          description: 'Regular user with basic access',
          isSystem: true,
        }).returning();
        userRole = [newUserRole];
        console.log('✅ User role created\n');
      }

      // Assign basic permissions to User role
      const basicPermissions = allPermissions.filter(p => 
        (p.resource === 'bilan:assessment' && (p.action === 'create' || p.action === 'read' || p.action === 'update')) ||
        (p.resource === 'dashboard' && p.action === 'read') ||
        (p.resource === 'bilan' && (p.action === 'read' || p.action === 'create'))
      );

      console.log(`📝 Assigning ${basicPermissions.length} basic permissions to User role...`);
      for (const perm of basicPermissions) {
        const existing = await db
          .select()
          .from(rolePermissions)
          .where(and(
            eq(rolePermissions.roleId, userRole[0].id),
            eq(rolePermissions.permissionId, perm.id)
          ))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(rolePermissions).values({
            roleId: userRole[0].id,
            permissionId: perm.id,
          });
        }
      }
      console.log('✅ Basic permissions assigned to User role\n');

      // Assign User role to users without any role
      for (const user of nonAdminUsers) {
        const existingRoles = await db
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, user.id))
          .limit(1);

        if (existingRoles.length === 0) {
          await db.insert(userRoles).values({
            userId: user.id,
            roleId: userRole[0].id,
          });
          console.log(`✅ Assigned User role to ${user.email}`);
        } else {
          console.log(`⏭️  ${user.email} already has a role`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Permission Assignment Completed!\n');
    console.log('📋 Summary:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Admin users: ${adminUsers.length} (all have Admin role with full permissions)`);
    console.log(`   - Regular users: ${nonAdminUsers.length} (have User role with basic permissions)`);
    console.log(`   - Total permissions: ${allPermissions.length}`);
    console.log(`   - Admin role has: ${allPermissions.length} permissions (full access)`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error assigning permissions:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  assignPermissions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { assignPermissions };

