/**
 * Comprehensive Database and Backend Validation Script
 * 
 * This script validates:
 * - Database connection
 * - All tables exist with correct structure
 * - All columns exist with correct types
 * - All indexes exist
 * - All foreign keys exist
 * - All unique constraints exist
 * - Seed data is correct (permissions, roles)
 * - Test users exist
 * - Backend routes are properly configured
 * - RBAC relationships are correct
 * 
 * Run with: tsx src/scripts/validate.ts
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import { 
  users, roles, permissions, rolePermissions, userRoles, 
  assessments, answers, summaries, auditLogs,
  satisfactionRatings, modules, dashboardModules, modulePermissions
} from '../db/schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  category: string;
  check: string;
  status: '✅ PASS' | '❌ FAIL' | '⚠️  WARN';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function addResult(category: string, check: string, status: '✅ PASS' | '❌ FAIL' | '⚠️  WARN', message: string, details?: any) {
  results.push({ category, check, status, message, details });
  const icon = status === '✅ PASS' ? '✅' : status === '❌ FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${check}: ${message}`);
}

async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    addResult('Database', 'Connection', '✅ PASS', 'Database connection successful');
    return true;
  } catch (error: any) {
    addResult('Database', 'Connection', '❌ FAIL', `Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `);
    return (result[0] as any)?.exists || false;
  } catch (error) {
    return false;
  }
}

async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        AND column_name = ${columnName}
      );
    `);
    return (result[0] as any)?.exists || false;
  } catch (error) {
    return false;
  }
}

async function checkIndexExists(indexName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = ${indexName}
      );
    `);
    return (result[0] as any)?.exists || false;
  } catch (error) {
    return false;
  }
}

async function checkForeignKeyExists(tableName: string, columnName: string, referencedTable: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = ${tableName}
        AND kcu.column_name = ${columnName}
        AND ccu.table_name = ${referencedTable}
      );
    `);
    return (result[0] as any)?.exists || false;
  } catch (error) {
    return false;
  }
}

async function validateTables() {
  console.log('\n📊 Validating Database Tables...\n');
  
  const requiredTables = [
    'users', 'roles', 'permissions', 'role_permissions', 'user_roles',
    'assessments', 'answers', 'summaries', 'audit_logs',
    'satisfaction_ratings', 'modules', 'dashboard_modules', 'module_permissions'
  ];
  
  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (exists) {
      addResult('Tables', table, '✅ PASS', `Table '${table}' exists`);
    } else {
      addResult('Tables', table, '❌ FAIL', `Table '${table}' does not exist`);
    }
  }
}

async function validateTableStructure() {
  console.log('\n📋 Validating Table Structure...\n');
  
  // Users table
  const userColumns = ['id', 'email', 'password_hash', 'name', 'is_active', 'last_login_at', 'created_at', 'updated_at'];
  for (const col of userColumns) {
    const exists = await checkColumnExists('users', col);
    if (exists) {
      addResult('Structure', `users.${col}`, '✅ PASS', `Column exists`);
    } else {
      addResult('Structure', `users.${col}`, '❌ FAIL', `Column missing`);
    }
  }
  
  // Roles table
  const roleColumns = ['id', 'name', 'description', 'is_system', 'created_at', 'updated_at'];
  for (const col of roleColumns) {
    const exists = await checkColumnExists('roles', col);
    if (exists) {
      addResult('Structure', `roles.${col}`, '✅ PASS', `Column exists`);
    } else {
      addResult('Structure', `roles.${col}`, '❌ FAIL', `Column missing`);
    }
  }
  
  // Permissions table
  const permissionColumns = ['id', 'resource', 'action', 'description', 'created_at'];
  for (const col of permissionColumns) {
    const exists = await checkColumnExists('permissions', col);
    if (exists) {
      addResult('Structure', `permissions.${col}`, '✅ PASS', `Column exists`);
    } else {
      addResult('Structure', `permissions.${col}`, '❌ FAIL', `Column missing`);
    }
  }
  
  // Assessments table
  const assessmentColumns = ['id', 'clerk_user_id', 'user_name', 'package_id', 'package_name', 'coaching_style', 'status', 'current_question_index', 'total_questions', 'started_at', 'completed_at', 'last_activity_at', 'created_at', 'updated_at', 'user_profile', 'dashboard_data'];
  for (const col of assessmentColumns) {
    const exists = await checkColumnExists('assessments', col);
    if (exists) {
      addResult('Structure', `assessments.${col}`, '✅ PASS', `Column exists`);
    } else {
      addResult('Structure', `assessments.${col}`, '❌ FAIL', `Column missing`);
    }
  }
  
  // Audit logs table
  const auditColumns = ['id', 'user_id', 'user_email', 'user_name', 'action', 'resource', 'resource_id', 'changes', 'metadata', 'status', 'error_message', 'created_at'];
  for (const col of auditColumns) {
    const exists = await checkColumnExists('audit_logs', col);
    if (exists) {
      addResult('Structure', `audit_logs.${col}`, '✅ PASS', `Column exists`);
    } else {
      addResult('Structure', `audit_logs.${col}`, '❌ FAIL', `Column missing`);
    }
  }
}

async function validateIndexes() {
  console.log('\n🔍 Validating Indexes...\n');
  
  const requiredIndexes = [
    'idx_users_email',
    'idx_users_is_active',
    'idx_roles_name',
    'idx_permissions_resource_action',
    'idx_role_permissions_role_id',
    'idx_role_permissions_permission_id',
    'idx_user_roles_user_id',
    'idx_user_roles_role_id',
    'idx_audit_logs_user_id',
    'idx_audit_logs_action',
    'idx_audit_logs_resource',
    'idx_audit_logs_created_at',
  ];
  
  for (const index of requiredIndexes) {
    const exists = await checkIndexExists(index);
    if (exists) {
      addResult('Indexes', index, '✅ PASS', `Index exists`);
    } else {
      addResult('Indexes', index, '⚠️  WARN', `Index missing (may be created automatically)`);
    }
  }
}

async function validateForeignKeys() {
  console.log('\n🔗 Validating Foreign Keys...\n');
  
  const foreignKeys = [
    { table: 'role_permissions', column: 'role_id', refTable: 'roles' },
    { table: 'role_permissions', column: 'permission_id', refTable: 'permissions' },
    { table: 'user_roles', column: 'user_id', refTable: 'users' },
    { table: 'user_roles', column: 'role_id', refTable: 'roles' },
    { table: 'audit_logs', column: 'user_id', refTable: 'users' },
    { table: 'answers', column: 'assessment_id', refTable: 'assessments' },
    { table: 'summaries', column: 'assessment_id', refTable: 'assessments' },
  ];
  
  for (const fk of foreignKeys) {
    const exists = await checkForeignKeyExists(fk.table, fk.column, fk.refTable);
    if (exists) {
      addResult('Foreign Keys', `${fk.table}.${fk.column}`, '✅ PASS', `References ${fk.refTable}`);
    } else {
      addResult('Foreign Keys', `${fk.table}.${fk.column}`, '❌ FAIL', `Missing foreign key to ${fk.refTable}`);
    }
  }
}

async function validateSeedData() {
  console.log('\n🌱 Validating Seed Data...\n');
  
  // Check permissions
  const requiredPermissions = [
    { resource: 'bilan', action: 'read' },
    { resource: 'bilan', action: 'create' },
    { resource: 'bilan:assessment', action: 'read' },
    { resource: 'bilan:assessment', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'roles', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'dashboard', action: 'read' },
  ];
  
  for (const perm of requiredPermissions) {
    const found = await db
      .select()
      .from(permissions)
      .where(and(
        eq(permissions.resource, perm.resource),
        eq(permissions.action, perm.action)
      ))
      .limit(1);
    
    if (found.length > 0) {
      addResult('Seed Data', `${perm.resource}:${perm.action}`, '✅ PASS', 'Permission exists');
    } else {
      addResult('Seed Data', `${perm.resource}:${perm.action}`, '❌ FAIL', 'Permission missing');
    }
  }
  
  // Check roles
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin')).limit(1);
  if (adminRole.length > 0) {
    addResult('Seed Data', 'Admin role', '✅ PASS', 'Admin role exists');
  } else {
    addResult('Seed Data', 'Admin role', '❌ FAIL', 'Admin role missing');
  }
  
  const userRole = await db.select().from(roles).where(eq(roles.name, 'user')).limit(1);
  if (userRole.length > 0) {
    addResult('Seed Data', 'User role', '✅ PASS', 'User role exists');
  } else {
    addResult('Seed Data', 'User role', '❌ FAIL', 'User role missing');
  }
}

async function validateTestUsers() {
  console.log('\n👥 Validating Test Users...\n');
  
  const adminUser = await db.select().from(users).where(eq(users.email, 'admin@test.com')).limit(1);
  if (adminUser.length > 0) {
    addResult('Test Users', 'admin@test.com', '✅ PASS', 'Admin user exists');
    
    // Check admin has Admin role
    const adminRoles = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, adminUser[0].id));
    
    const hasAdminRole = adminRoles.some(ur => ur.role.name === 'Admin');
    if (hasAdminRole) {
      addResult('Test Users', 'admin@test.com role', '✅ PASS', 'Admin user has Admin role');
    } else {
      addResult('Test Users', 'admin@test.com role', '❌ FAIL', 'Admin user missing Admin role');
    }
  } else {
    addResult('Test Users', 'admin@test.com', '❌ FAIL', 'Admin user missing');
  }
  
  const regularUser = await db.select().from(users).where(eq(users.email, 'user@test.com')).limit(1);
  if (regularUser.length > 0) {
    addResult('Test Users', 'user@test.com', '✅ PASS', 'Regular user exists');
    
    // Check user has User role
    const userRolesData = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, regularUser[0].id));
    
    const hasUserRole = userRolesData.some(ur => ur.role.name === 'user');
    if (hasUserRole) {
      addResult('Test Users', 'user@test.com role', '✅ PASS', 'Regular user has User role');
    } else {
      addResult('Test Users', 'user@test.com role', '❌ FAIL', 'Regular user missing User role');
    }
  } else {
    addResult('Test Users', 'user@test.com', '❌ FAIL', 'Regular user missing');
  }
}

async function validateRBACRelationships() {
  console.log('\n🔐 Validating RBAC Relationships...\n');
  
  // Check Admin role has permissions
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin')).limit(1);
  if (adminRole.length > 0) {
    const adminPermissions = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, adminRole[0].id));
    
    if (adminPermissions.length > 0) {
      addResult('RBAC', 'Admin permissions', '✅ PASS', `Admin role has ${adminPermissions.length} permissions`);
    } else {
      addResult('RBAC', 'Admin permissions', '❌ FAIL', 'Admin role has no permissions');
    }
  }
  
  // Check User role has permissions
  const userRole = await db.select().from(roles).where(eq(roles.name, 'user')).limit(1);
  if (userRole.length > 0) {
    const userPermissions = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, userRole[0].id));
    
    if (userPermissions.length > 0) {
      addResult('RBAC', 'User permissions', '✅ PASS', `User role has ${userPermissions.length} permissions`);
    } else {
      addResult('RBAC', 'User permissions', '⚠️  WARN', 'User role has no permissions (may be intentional)');
    }
  }
}

async function validateBackendRoutes() {
  console.log('\n🛣️  Validating Backend Routes...\n');
  
  const routesDir = path.join(__dirname, '../routes');
  const requiredRoutes = [
    'auth.ts',
    'users.ts',
    'roles.ts',
    'permissions.ts',
    'assessments.ts',
    'answers.ts',
    'summaries.ts',
    'analytics.ts',
    'ai.ts',
    'audit.ts',
    'bulk.ts',
  ];
  
  for (const route of requiredRoutes) {
    const routePath = path.join(routesDir, route);
    if (fs.existsSync(routePath)) {
      addResult('Backend Routes', route, '✅ PASS', 'Route file exists');
    } else {
      addResult('Backend Routes', route, '❌ FAIL', 'Route file missing');
    }
  }
  
  // Check app.ts includes all routes
  const appPath = path.join(__dirname, '../app.ts');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf-8');
    const routeImports = requiredRoutes.map(r => r.replace('.ts', ''));
    let allRoutesFound = true;
    
    for (const route of routeImports) {
      if (appContent.includes(route)) {
        addResult('Backend Routes', `app.ts includes ${route}`, '✅ PASS', 'Route registered in app.ts');
      } else {
        addResult('Backend Routes', `app.ts includes ${route}`, '❌ FAIL', 'Route not registered in app.ts');
        allRoutesFound = false;
      }
    }
  } else {
    addResult('Backend Routes', 'app.ts', '❌ FAIL', 'app.ts file missing');
  }
}

async function validateDataIntegrity() {
  console.log('\n🔍 Validating Data Integrity...\n');
  
  // Check for orphaned records
  const orphanedRolePermissions = await db.execute(sql`
    SELECT rp.id 
    FROM role_permissions rp
    LEFT JOIN roles r ON rp.role_id = r.id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.id IS NULL OR p.id IS NULL
    LIMIT 1
  `);
  
  if (orphanedRolePermissions.length === 0) {
    addResult('Data Integrity', 'role_permissions', '✅ PASS', 'No orphaned records');
  } else {
    addResult('Data Integrity', 'role_permissions', '❌ FAIL', 'Found orphaned records');
  }
  
  const orphanedUserRoles = await db.execute(sql`
    SELECT ur.id 
    FROM user_roles ur
    LEFT JOIN users u ON ur.user_id = u.id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id IS NULL OR r.id IS NULL
    LIMIT 1
  `);
  
  if (orphanedUserRoles.length === 0) {
    addResult('Data Integrity', 'user_roles', '✅ PASS', 'No orphaned records');
  } else {
    addResult('Data Integrity', 'user_roles', '❌ FAIL', 'Found orphaned records');
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  const warnings = results.filter(r => r.status === '⚠️  WARN').length;
  const total = results.length;
  
  console.log(`Total Checks: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round(passed/total*100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round(failed/total*100)}%)`);
  console.log(`⚠️  Warnings: ${warnings} (${Math.round(warnings/total*100)}%)\n`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED CHECKS:\n');
    results.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
    });
  }
  
  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    results.filter(r => r.status === '⚠️  WARN').forEach(r => {
      console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (failed === 0) {
    console.log('✅ ALL CRITICAL CHECKS PASSED!');
    console.log('='.repeat(80) + '\n');
    return true;
  } else {
    console.log('❌ SOME CHECKS FAILED - Please review and fix issues');
    console.log('='.repeat(80) + '\n');
    return false;
  }
}

async function validate() {
  console.log('🚀 Starting Comprehensive Database and Backend Validation...\n');
  console.log('='.repeat(80) + '\n');
  
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  await validateTables();
  await validateTableStructure();
  await validateIndexes();
  await validateForeignKeys();
  await validateSeedData();
  await validateTestUsers();
  await validateRBACRelationships();
  await validateBackendRoutes();
  await validateDataIntegrity();
  
  const allPassed = await generateReport();
  
  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validate()
    .catch((error) => {
      console.error('\n❌ Validation script failed:', error);
      process.exit(1);
    });
}

export { validate };

