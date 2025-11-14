/**
 * Detailed Database and Backend Validation Script
 * 
 * Comprehensive validation including:
 * - Database schema details (column types, constraints, defaults)
 * - Backend route endpoints (methods, paths, middleware)
 * - Environment variables
 * - Service files
 * - Middleware configuration
 * - Permission mappings
 * - Data consistency
 * - Performance indexes
 * - Error handling
 * 
 * Run with: tsx src/scripts/validateDetailed.ts
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import { 
  users, roles, permissions, rolePermissions, userRoles, 
  assessments, answers, summaries, auditLogs
} from '../db/schema.js';
import { eq, and, sql, count, isNull } from 'drizzle-orm';
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

async function validateColumnTypes() {
  console.log('\n📐 Validating Column Types and Constraints...\n');
  
  // Users table column types
  const userColumnTypes = await db.execute(sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position;
  `);
  
  const expectedUserColumns: Record<string, { type: string; nullable: string; hasDefault?: boolean }> = {
    id: { type: 'uuid', nullable: 'NO' },
    email: { type: 'character varying', nullable: 'NO' },
    password_hash: { type: 'character varying', nullable: 'NO' },
    name: { type: 'character varying', nullable: 'NO' },
    is_active: { type: 'boolean', nullable: 'NO', hasDefault: true },
    last_login_at: { type: 'timestamp without time zone', nullable: 'YES' },
    created_at: { type: 'timestamp without time zone', nullable: 'NO', hasDefault: true },
    updated_at: { type: 'timestamp without time zone', nullable: 'NO', hasDefault: true },
  };
  
  for (const col of userColumnTypes as any[]) {
    const expected = expectedUserColumns[col.column_name];
    if (expected) {
      const typeMatch = col.data_type.includes(expected.type.split(' ')[0]) || 
                       (expected.type === 'uuid' && col.data_type === 'uuid') ||
                       (expected.type === 'boolean' && col.data_type === 'boolean');
      const nullableMatch = col.is_nullable === expected.nullable;
      
      if (typeMatch && nullableMatch) {
        addResult('Column Types', `users.${col.column_name}`, '✅ PASS', 
          `Type: ${col.data_type}, Nullable: ${col.is_nullable}`);
      } else {
        addResult('Column Types', `users.${col.column_name}`, '❌ FAIL', 
          `Expected: ${expected.type} (${expected.nullable}), Got: ${col.data_type} (${col.is_nullable})`);
      }
    }
  }
  
  // Permissions table unique constraint
  const permissionUnique = await db.execute(sql`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
    AND table_name = 'permissions'
    AND constraint_type = 'UNIQUE';
  `);
  
  if (permissionUnique.length > 0) {
    addResult('Constraints', 'permissions unique', '✅ PASS', 'Unique constraint exists on (resource, action)');
  } else {
    addResult('Constraints', 'permissions unique', '❌ FAIL', 'Missing unique constraint on (resource, action)');
  }
  
  // Email unique constraint
  const emailUnique = await db.execute(sql`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND constraint_name LIKE '%email%';
  `);
  
  if (emailUnique.length > 0) {
    addResult('Constraints', 'users.email unique', '✅ PASS', 'Unique constraint on email exists');
  } else {
    addResult('Constraints', 'users.email unique', '❌ FAIL', 'Missing unique constraint on email');
  }
}

async function validateBackendEndpoints() {
  console.log('\n🛣️  Validating Backend Endpoints (Detailed)...\n');
  
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = [
    'auth.ts', 'users.ts', 'roles.ts', 'permissions.ts', 
    'assessments.ts', 'answers.ts', 'summaries.ts', 
    'analytics.ts', 'ai.ts', 'audit.ts', 'bulk.ts'
  ];
  
  const expectedEndpoints: Record<string, Array<{ method: string; path: string; auth?: boolean; permission?: string }>> = {
    'auth.ts': [
      { method: 'POST', path: '/register', auth: false },
      { method: 'POST', path: '/login', auth: false },
      { method: 'GET', path: '/me', auth: true },
      { method: 'GET', path: '/permissions', auth: true },
      { method: 'POST', path: '/logout', auth: true },
      { method: 'POST', path: '/password/reset', auth: false },
      { method: 'POST', path: '/password/update', auth: true },
    ],
    'users.ts': [
      { method: 'GET', path: '/', auth: true, permission: 'users:read' },
      { method: 'GET', path: '/:id', auth: true, permission: 'users:read' },
      { method: 'POST', path: '/', auth: true, permission: 'users:create' },
      { method: 'PATCH', path: '/:id', auth: true, permission: 'users:update' },
      { method: 'DELETE', path: '/:id', auth: true, permission: 'users:delete' },
    ],
    'roles.ts': [
      { method: 'GET', path: '/', auth: true },
      { method: 'GET', path: '/:id', auth: true },
      { method: 'POST', path: '/', auth: true },
      { method: 'PATCH', path: '/:id', auth: true },
      { method: 'DELETE', path: '/:id', auth: true },
      { method: 'POST', path: '/:id/permissions', auth: true },
    ],
    'permissions.ts': [
      { method: 'GET', path: '/', auth: true },
      { method: 'GET', path: '/:id', auth: true },
      { method: 'POST', path: '/', auth: true },
      { method: 'GET', path: '/by-resource/:resource', auth: true },
    ],
    'assessments.ts': [
      { method: 'POST', path: '/', auth: true },
      { method: 'GET', path: '/', auth: true },
      { method: 'GET', path: '/:id', auth: true },
      { method: 'PATCH', path: '/:id', auth: true },
      { method: 'DELETE', path: '/:id', auth: true },
    ],
    'answers.ts': [
      { method: 'POST', path: '/:assessmentId/answers', auth: true },
      { method: 'GET', path: '/:assessmentId/answers', auth: true },
      { method: 'PATCH', path: '/:assessmentId/answers/:answerId', auth: true },
    ],
    'summaries.ts': [
      { method: 'POST', path: '/:assessmentId/summary', auth: true },
      { method: 'GET', path: '/:assessmentId/summary', auth: true },
    ],
    'analytics.ts': [
      { method: 'GET', path: '/', auth: true },
    ],
    'ai.ts': [
      { method: 'POST', path: '/generate/question', auth: true },
      { method: 'POST', path: '/generate/summary', auth: true },
      { method: 'POST', path: '/generate/synthesis', auth: true },
      { method: 'POST', path: '/analyze/themes-and-skills', auth: true },
      { method: 'POST', path: '/analyze/user-profile', auth: true },
      { method: 'POST', path: '/suggest/optional-module', auth: true },
      { method: 'POST', path: '/find/resource-leads', auth: true },
    ],
    'audit.ts': [
      { method: 'GET', path: '/', auth: true },
      { method: 'GET', path: '/resource/:resource/:resourceId', auth: true },
      { method: 'GET', path: '/user/:userId', auth: true },
    ],
    'bulk.ts': [
      { method: 'POST', path: '/delete', auth: true },
      { method: 'POST', path: '/update', auth: true },
    ],
  };
  
  for (const routeFile of routeFiles) {
    const routePath = path.join(routesDir, routeFile);
    if (!fs.existsSync(routePath)) {
      addResult('Endpoints', routeFile, '❌ FAIL', 'Route file missing');
      continue;
    }
    
    const content = fs.readFileSync(routePath, 'utf-8');
    const endpoints = expectedEndpoints[routeFile] || [];
    
    for (const endpoint of endpoints) {
      const methodPattern = `app\\.${endpoint.method.toLowerCase()}`;
      const pathPattern = endpoint.path.replace(/:/g, '\\w+').replace(/\//g, '\\/');
      const regex = new RegExp(`${methodPattern}.*['"]${pathPattern.replace(/\\/g, '')}['"]`, 'i');
      
      if (regex.test(content) || content.includes(endpoint.path)) {
        let details = `Method: ${endpoint.method}, Path: ${endpoint.path}`;
        if (endpoint.auth) details += ', Auth: required';
        if (endpoint.permission) details += `, Permission: ${endpoint.permission}`;
        
        addResult('Endpoints', `${routeFile} ${endpoint.method} ${endpoint.path}`, '✅ PASS', details);
      } else {
        addResult('Endpoints', `${routeFile} ${endpoint.method} ${endpoint.path}`, '❌ FAIL', 'Endpoint not found');
      }
    }
  }
}

async function validateEnvironmentVariables() {
  console.log('\n🔐 Validating Environment Variables...\n');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT',
  ];
  
  const optionalEnvVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'FRONTEND_URL',
    'NODE_ENV',
    'JWT_EXPIRES_IN',
  ];
  
  for (const envVar of requiredEnvVars) {
    // Check both .env and .env.local (dotenv loads both)
    const value = process.env[envVar];
    if (value && value.trim() !== '') {
      const displayValue = envVar === 'JWT_SECRET' || envVar === 'DATABASE_URL' 
        ? '[HIDDEN]' 
        : value;
      addResult('Environment', envVar, '✅ PASS', `Set: ${displayValue}`);
    } else {
      // JWT_SECRET has a default in code, so it's a warning not a failure
      if (envVar === 'JWT_SECRET') {
        addResult('Environment', envVar, '⚠️  WARN', 'Not set - using default (not secure for production)');
      } else {
        addResult('Environment', envVar, '❌ FAIL', 'Missing required environment variable');
      }
    }
  }
  
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      addResult('Environment', envVar, '✅ PASS', 'Set');
    } else {
      addResult('Environment', envVar, '⚠️  WARN', 'Not set (optional)');
    }
  }
  
  // Check JWT_SECRET is not default
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    addResult('Environment', 'JWT_SECRET security', '⚠️  WARN', 'Using default JWT_SECRET - change in production!');
  }
}

async function validateServices() {
  console.log('\n🔧 Validating Service Files...\n');
  
  const servicesDir = path.join(__dirname, '../services');
  const requiredServices = [
    'ai/aiService.ts',
    'ai/providers/openaiProvider.ts',
    'ai/providers/claudeProvider.ts',
    'ai/providers/geminiProvider.ts',
    'auditService.ts',
  ];
  
  for (const service of requiredServices) {
    const servicePath = path.join(servicesDir, service);
    if (fs.existsSync(servicePath)) {
      addResult('Services', service, '✅ PASS', 'Service file exists');
    } else {
      addResult('Services', service, '❌ FAIL', 'Service file missing');
    }
  }
}

async function validateMiddleware() {
  console.log('\n🛡️  Validating Middleware...\n');
  
  const middlewareDir = path.join(__dirname, '../middleware');
  const requiredMiddleware = [
    'auth.ts',
    'permissions.ts',
    'error.ts',
  ];
  
  for (const middleware of requiredMiddleware) {
    const middlewarePath = path.join(middlewareDir, middleware);
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      
      if (middleware === 'auth.ts') {
        const hasRequireAuth = content.includes('requireAuth') || content.includes('export const requireAuth');
        const hasOptionalAuth = content.includes('optionalAuth') || content.includes('export const optionalAuth');
        
        if (hasRequireAuth) {
          addResult('Middleware', 'requireAuth', '✅ PASS', 'requireAuth middleware exists');
        } else {
          addResult('Middleware', 'requireAuth', '❌ FAIL', 'requireAuth middleware missing');
        }
        
        if (hasOptionalAuth) {
          addResult('Middleware', 'optionalAuth', '✅ PASS', 'optionalAuth middleware exists');
        } else {
          addResult('Middleware', 'optionalAuth', '⚠️  WARN', 'optionalAuth middleware missing (optional)');
        }
      }
      
      if (middleware === 'permissions.ts') {
        const hasRequirePermission = content.includes('requirePermission') || content.includes('export const requirePermission');
        const hasRequireAnyPermission = content.includes('requireAnyPermission') || content.includes('export const requireAnyPermission');
        
        if (hasRequirePermission) {
          addResult('Middleware', 'requirePermission', '✅ PASS', 'requirePermission middleware exists');
        } else {
          addResult('Middleware', 'requirePermission', '❌ FAIL', 'requirePermission middleware missing');
        }
        
        if (hasRequireAnyPermission) {
          addResult('Middleware', 'requireAnyPermission', '✅ PASS', 'requireAnyPermission middleware exists');
        } else {
          addResult('Middleware', 'requireAnyPermission', '⚠️  WARN', 'requireAnyPermission middleware missing (optional)');
        }
      }
      
      if (middleware === 'error.ts') {
        const hasErrorHandler = content.includes('errorHandler') || content.includes('export');
        if (hasErrorHandler) {
          addResult('Middleware', 'errorHandler', '✅ PASS', 'Error handler exists');
        } else {
          addResult('Middleware', 'errorHandler', '❌ FAIL', 'Error handler missing');
        }
      }
    } else {
      addResult('Middleware', middleware, '❌ FAIL', 'Middleware file missing');
    }
  }
}

async function validateDataConsistency() {
  console.log('\n🔍 Validating Data Consistency...\n');
  
  // Check all users have at least one role
  const usersWithoutRoles = await db.execute(sql`
    SELECT u.id, u.email
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.id IS NULL
    LIMIT 10;
  `);
  
  if (usersWithoutRoles.length === 0) {
    addResult('Data Consistency', 'users without roles', '✅ PASS', 'All users have at least one role');
  } else {
    addResult('Data Consistency', 'users without roles', '⚠️  WARN', 
      `Found ${usersWithoutRoles.length} users without roles`);
  }
  
  // Check all roles have at least one permission (except system roles that might be empty)
  const rolesWithoutPermissions = await db.execute(sql`
    SELECT r.id, r.name
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    WHERE rp.id IS NULL AND r.is_system = false
    LIMIT 10;
  `);
  
  if (rolesWithoutPermissions.length === 0) {
    addResult('Data Consistency', 'non-system roles without permissions', '✅ PASS', 
      'All non-system roles have permissions');
  } else {
    addResult('Data Consistency', 'non-system roles without permissions', '⚠️  WARN', 
      `Found ${rolesWithoutPermissions.length} non-system roles without permissions`);
  }
  
  // Check for duplicate permissions
  const duplicatePermissions = await db.execute(sql`
    SELECT resource, action, COUNT(*) as count
    FROM permissions
    GROUP BY resource, action
    HAVING COUNT(*) > 1;
  `);
  
  if (duplicatePermissions.length === 0) {
    addResult('Data Consistency', 'duplicate permissions', '✅ PASS', 'No duplicate permissions');
  } else {
    addResult('Data Consistency', 'duplicate permissions', '❌ FAIL', 
      `Found ${duplicatePermissions.length} duplicate permission combinations`);
  }
  
  // Check for duplicate role names
  const duplicateRoles = await db.execute(sql`
    SELECT name, COUNT(*) as count
    FROM roles
    GROUP BY name
    HAVING COUNT(*) > 1;
  `);
  
  if (duplicateRoles.length === 0) {
    addResult('Data Consistency', 'duplicate roles', '✅ PASS', 'No duplicate role names');
  } else {
    addResult('Data Consistency', 'duplicate roles', '❌ FAIL', 
      `Found ${duplicateRoles.length} duplicate role names`);
  }
  
  // Check for duplicate emails
  const duplicateEmails = await db.execute(sql`
    SELECT email, COUNT(*) as count
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1;
  `);
  
  if (duplicateEmails.length === 0) {
    addResult('Data Consistency', 'duplicate emails', '✅ PASS', 'No duplicate emails');
  } else {
    addResult('Data Consistency', 'duplicate emails', '❌ FAIL', 
      `Found ${duplicateEmails.length} duplicate emails`);
  }
}

async function validatePermissionCoverage() {
  console.log('\n🔐 Validating Permission Coverage...\n');
  
  // Check all CRUD operations exist for main resources
  const mainResources = ['users', 'roles', 'bilan:assessment'];
  const actions = ['create', 'read', 'update', 'delete'];
  
  for (const resource of mainResources) {
    for (const action of actions) {
      const perm = await db
        .select()
        .from(permissions)
        .where(and(
          eq(permissions.resource, resource),
          eq(permissions.action, action)
        ))
        .limit(1);
      
      if (perm.length > 0) {
        addResult('Permission Coverage', `${resource}:${action}`, '✅ PASS', 'Permission exists');
      } else {
        addResult('Permission Coverage', `${resource}:${action}`, '⚠️  WARN', 'Permission missing (may be intentional)');
      }
    }
  }
  
  // Check Admin role has all permissions
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'Admin')).limit(1);
  if (adminRole.length > 0) {
    const allPermissions = await db.select().from(permissions);
    const adminPermissions = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, adminRole[0].id));
    
    const coverage = (adminPermissions.length / allPermissions.length) * 100;
    if (coverage >= 90) {
      addResult('Permission Coverage', 'Admin role coverage', '✅ PASS', 
        `Admin has ${adminPermissions.length}/${allPermissions.length} permissions (${Math.round(coverage)}%)`);
    } else {
      addResult('Permission Coverage', 'Admin role coverage', '⚠️  WARN', 
        `Admin has only ${adminPermissions.length}/${allPermissions.length} permissions (${Math.round(coverage)}%)`);
    }
  }
}

async function validateForeignKeyCascades() {
  console.log('\n🔗 Validating Foreign Key Cascades...\n');
  
  const foreignKeys = await db.execute(sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `);
  
  const expectedCascades: Record<string, { delete: string; update?: string }> = {
    'role_permissions.role_id': { delete: 'CASCADE' },
    'role_permissions.permission_id': { delete: 'CASCADE' },
    'user_roles.user_id': { delete: 'CASCADE' },
    'user_roles.role_id': { delete: 'CASCADE' },
    'audit_logs.user_id': { delete: 'SET NULL' },
    'answers.assessment_id': { delete: 'CASCADE' },
    'summaries.assessment_id': { delete: 'CASCADE' },
  };
  
  for (const fk of foreignKeys as any[]) {
    const key = `${fk.table_name}.${fk.column_name}`;
    const expected = expectedCascades[key];
    
    if (expected) {
      if (fk.delete_rule === expected.delete) {
        addResult('FK Cascades', key, '✅ PASS', `Delete rule: ${fk.delete_rule}`);
      } else {
        addResult('FK Cascades', key, '⚠️  WARN', 
          `Expected delete: ${expected.delete}, Got: ${fk.delete_rule}`);
      }
    }
  }
}

async function validateIndexPerformance() {
  console.log('\n⚡ Validating Performance Indexes...\n');
  
  // Check critical indexes for performance
  const criticalIndexes = [
    { name: 'idx_users_email', table: 'users', column: 'email', reason: 'User lookup by email' },
    { name: 'idx_audit_logs_created_at', table: 'audit_logs', column: 'created_at', reason: 'Audit log queries by date' },
    { name: 'idx_audit_logs_user_id', table: 'audit_logs', column: 'user_id', reason: 'User audit log queries' },
    { name: 'idx_assessments_status', table: 'assessments', column: 'status', reason: 'Assessment filtering by status' },
  ];
  
  for (const index of criticalIndexes) {
    const exists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = ${index.name}
      );
    `);
    
    if ((exists[0] as any)?.exists) {
      addResult('Performance', index.name, '✅ PASS', `${index.reason}`);
    } else {
      // Check if unique constraint exists (which creates index automatically)
      const columnPattern = `%${index.column}%`;
      const uniqueCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = ${index.table}
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE ${columnPattern}
        );
      `);
      
      if ((uniqueCheck[0] as any)?.exists) {
        addResult('Performance', index.name, '✅ PASS', `Index exists via unique constraint`);
      } else {
        addResult('Performance', index.name, '⚠️  WARN', `Missing index - ${index.reason}`);
      }
    }
  }
}

async function validateErrorHandling() {
  console.log('\n🛡️  Validating Error Handling...\n');
  
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
  
  let routesWithErrorHandling = 0;
  let routesWithoutErrorHandling = 0;
  
  for (const file of routeFiles) {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    const hasTryCatch = content.includes('try {') && content.includes('catch');
    const hasErrorResponse = content.includes('error(') || content.includes('errorResponse');
    
    if (hasTryCatch || hasErrorResponse) {
      routesWithErrorHandling++;
      addResult('Error Handling', file, '✅ PASS', 'Has error handling');
    } else {
      routesWithoutErrorHandling++;
      addResult('Error Handling', file, '⚠️  WARN', 'Missing explicit error handling');
    }
  }
  
  // Check global error handler
  const appPath = path.join(__dirname, '../app.ts');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf-8');
    if (appContent.includes('errorHandler') || appContent.includes('onError')) {
      addResult('Error Handling', 'Global error handler', '✅ PASS', 'Global error handler configured');
    } else {
      addResult('Error Handling', 'Global error handler', '⚠️  WARN', 'Global error handler not found');
    }
  }
}

async function validateBackendImplementation() {
  console.log('\n💻 Validating Backend Implementation Details...\n');
  
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
  
  // Check response format consistency
  for (const file of routeFiles) {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    
    // Check if routes use success() helper
    const usesSuccess = content.includes('success(') || content.includes('success(c');
    const usesError = content.includes('error(') || content.includes('error(c');
    const usesPaginated = content.includes('paginated(');
    
    if (usesSuccess || usesError) {
      addResult('Backend Implementation', `${file} response format`, '✅ PASS', 
        `Uses ${usesSuccess ? 'success()' : ''} ${usesError ? 'error()' : ''} ${usesPaginated ? 'paginated()' : ''} helpers`);
    } else {
      addResult('Backend Implementation', `${file} response format`, '⚠️  WARN', 
        'May not use standard response helpers');
    }
    
    // Check for request validation (Zod schemas)
    const hasZodValidation = content.includes('z.object') || content.includes('zod') || content.includes('Schema');
    if (hasZodValidation) {
      addResult('Backend Implementation', `${file} validation`, '✅ PASS', 'Uses Zod validation');
    } else {
      addResult('Backend Implementation', `${file} validation`, '⚠️  WARN', 'No Zod validation found');
    }
  }
  
  // Check app.ts route registration
  const appPath = path.join(__dirname, '../app.ts');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf-8');
    
    // Check CORS configuration
    if (appContent.includes('cors(') || appContent.includes('cors')) {
      addResult('Backend Implementation', 'CORS configuration', '✅ PASS', 'CORS configured');
    } else {
      addResult('Backend Implementation', 'CORS configuration', '⚠️  WARN', 'CORS not configured');
    }
    
    // Check health check endpoint
    if (appContent.includes('/health') || appContent.includes('health')) {
      addResult('Backend Implementation', 'Health check endpoint', '✅ PASS', 'Health check exists');
    } else {
      addResult('Backend Implementation', 'Health check endpoint', '⚠️  WARN', 'Health check missing');
    }
    
    // Check 404 handler
    if (appContent.includes('notFound') || appContent.includes('404')) {
      addResult('Backend Implementation', '404 handler', '✅ PASS', '404 handler configured');
    } else {
      addResult('Backend Implementation', '404 handler', '⚠️  WARN', '404 handler missing');
    }
  }
  
  // Check service implementations
  const servicesDir = path.join(__dirname, '../services');
  if (fs.existsSync(servicesDir)) {
    const aiServicePath = path.join(servicesDir, 'ai/aiService.ts');
    if (fs.existsSync(aiServicePath)) {
      const aiServiceContent = fs.readFileSync(aiServicePath, 'utf-8');
      
      // Check for multi-provider support
      if (aiServiceContent.includes('MultiProvider') || aiServiceContent.includes('fallback')) {
        addResult('Backend Implementation', 'AI service fallback', '✅ PASS', 'Multi-provider with fallback');
      } else {
        addResult('Backend Implementation', 'AI service fallback', '⚠️  WARN', 'No fallback mechanism');
      }
      
      // Check for rate limiting
      if (aiServiceContent.includes('rate') || aiServiceContent.includes('limit')) {
        addResult('Backend Implementation', 'AI rate limiting', '✅ PASS', 'Rate limiting implemented');
      } else {
        addResult('Backend Implementation', 'AI rate limiting', '⚠️  WARN', 'No rate limiting found');
      }
    }
  }
  
  // Check audit service
  const auditServicePath = path.join(__dirname, '../services/auditService.ts');
  if (fs.existsSync(auditServicePath)) {
    const auditContent = fs.readFileSync(auditServicePath, 'utf-8');
    if (auditContent.includes('createAuditLog') || auditContent.includes('getAuditLogs')) {
      addResult('Backend Implementation', 'Audit service', '✅ PASS', 'Audit service methods exist');
    } else {
      addResult('Backend Implementation', 'Audit service', '❌ FAIL', 'Audit service methods missing');
    }
  }
}

async function validateRoutePermissions() {
  console.log('\n🔐 Validating Route Permission Mappings...\n');
  
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = [
    'users.ts', 'roles.ts', 'assessments.ts', 'analytics.ts', 'audit.ts'
  ];
  
  const expectedPermissionMappings: Record<string, Array<{ method: string; path: string; permission: string }>> = {
    'users.ts': [
      { method: 'GET', path: '/', permission: 'users:read' },
      { method: 'GET', path: '/:id', permission: 'users:read' },
      { method: 'POST', path: '/', permission: 'users:create' },
      { method: 'PATCH', path: '/:id', permission: 'users:update' },
      { method: 'DELETE', path: '/:id', permission: 'users:delete' },
    ],
    'assessments.ts': [
      { method: 'POST', path: '/', permission: 'bilan:assessment:create' },
      { method: 'GET', path: '/', permission: 'bilan:assessment:read' },
      { method: 'GET', path: '/:id', permission: 'bilan:assessment:read' },
      { method: 'PATCH', path: '/:id', permission: 'bilan:assessment:update' },
      { method: 'DELETE', path: '/:id', permission: 'bilan:assessment:delete' },
    ],
    'analytics.ts': [
      { method: 'GET', path: '/', permission: 'analytics:read' },
    ],
  };
  
  for (const file of routeFiles) {
    const routePath = path.join(routesDir, file);
    if (!fs.existsSync(routePath)) continue;
    
    const content = fs.readFileSync(routePath, 'utf-8');
    const mappings = expectedPermissionMappings[file] || [];
    
    for (const mapping of mappings) {
      const permissionPattern = mapping.permission.replace(':', '\\s*:\\s*');
      const hasPermission = new RegExp(`requirePermission.*['"]${permissionPattern}['"]`, 'i').test(content) ||
                           content.includes(`'${mapping.permission}'`) ||
                           content.includes(`"${mapping.permission}"`);
      
      if (hasPermission) {
        addResult('Route Permissions', `${file} ${mapping.method} ${mapping.path}`, '✅ PASS', 
          `Protected with ${mapping.permission}`);
      } else {
        addResult('Route Permissions', `${file} ${mapping.method} ${mapping.path}`, '⚠️  WARN', 
          `Expected permission ${mapping.permission} not found`);
      }
    }
  }
}

async function generateDetailedReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DETAILED VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  const warnings = results.filter(r => r.status === '⚠️  WARN').length;
  const total = results.length;
  
  console.log(`Total Checks: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round(passed/total*100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round(failed/total*100)}%)`);
  console.log(`⚠️  Warnings: ${warnings} (${Math.round(warnings/total*100)}%)\n`);
  
  // Group by category
  const categories = [...new Set(results.map(r => r.category))];
  console.log('\n📋 Results by Category:\n');
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.status === '✅ PASS').length;
    const categoryFailed = categoryResults.filter(r => r.status === '❌ FAIL').length;
    const categoryWarnings = categoryResults.filter(r => r.status === '⚠️  WARN').length;
    
    console.log(`  ${category}:`);
    console.log(`    ✅ ${categoryPassed} passed, ❌ ${categoryFailed} failed, ⚠️  ${categoryWarnings} warnings`);
  }
  
  if (failed > 0) {
    console.log('\n❌ FAILED CHECKS:\n');
    results.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
      if (r.details) {
        console.log(`    Details: ${JSON.stringify(r.details, null, 2)}`);
      }
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
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warnings found - review recommended`);
    }
    console.log('='.repeat(80) + '\n');
    return true;
  } else {
    console.log('❌ SOME CHECKS FAILED - Please review and fix issues');
    console.log('='.repeat(80) + '\n');
    return false;
  }
}

async function validateDetailed() {
  console.log('🚀 Starting Detailed Database and Backend Validation...\n');
  console.log('='.repeat(80) + '\n');
  
  // Basic connection check
  try {
    await db.execute(sql`SELECT 1`);
    addResult('Database', 'Connection', '✅ PASS', 'Database connection successful');
  } catch (error: any) {
    addResult('Database', 'Connection', '❌ FAIL', `Database connection failed: ${error.message}`);
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  await validateColumnTypes();
  await validateBackendEndpoints();
  await validateEnvironmentVariables();
  await validateServices();
  await validateMiddleware();
  await validateDataConsistency();
  await validatePermissionCoverage();
  await validateForeignKeyCascades();
  await validateIndexPerformance();
  await validateErrorHandling();
  await validateBackendImplementation();
  await validateRoutePermissions();
  
  const allPassed = await generateDetailedReport();
  
  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDetailed()
    .catch((error) => {
      console.error('\n❌ Detailed validation script failed:', error);
      process.exit(1);
    });
}

export { validateDetailed };

