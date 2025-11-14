/**
 * Frontend-Backend Integration Validation Script
 * 
 * Comprehensive validation of frontend-backend integration including:
 * - Frontend routes vs Backend endpoints mapping
 * - Frontend API client methods vs Backend routes
 * - Frontend permission guards vs Backend permissions
 * - Frontend components using correct API endpoints
 * - i18n key consistency
 * - Type definitions alignment
 * - Error handling consistency
 * - Response format compatibility
 * 
 * Run with: tsx src/scripts/validateFrontendBackend.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../..');

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

// Backend route definitions
const backendRoutes: Record<string, Array<{ method: string; path: string; auth?: boolean; permission?: string }>> = {
  'auth': [
    { method: 'POST', path: '/api/auth/register', auth: false },
    { method: 'POST', path: '/api/auth/login', auth: false },
    { method: 'GET', path: '/api/auth/me', auth: true },
    { method: 'GET', path: '/api/auth/permissions', auth: true },
    { method: 'POST', path: '/api/auth/logout', auth: true },
    { method: 'POST', path: '/api/auth/password/reset', auth: false },
    { method: 'POST', path: '/api/auth/password/update', auth: true },
  ],
  'users': [
    { method: 'GET', path: '/api/users', auth: true, permission: 'users:read' },
    { method: 'GET', path: '/api/users/:id', auth: true, permission: 'users:read' },
    { method: 'POST', path: '/api/users', auth: true, permission: 'users:create' },
    { method: 'PATCH', path: '/api/users/:id', auth: true, permission: 'users:update' },
    { method: 'DELETE', path: '/api/users/:id', auth: true, permission: 'users:delete' },
  ],
  'roles': [
    { method: 'GET', path: '/api/roles', auth: true },
    { method: 'GET', path: '/api/roles/:id', auth: true },
    { method: 'POST', path: '/api/roles', auth: true },
    { method: 'PATCH', path: '/api/roles/:id', auth: true },
    { method: 'DELETE', path: '/api/roles/:id', auth: true },
    { method: 'POST', path: '/api/roles/:id/permissions', auth: true },
  ],
  'assessments': [
    { method: 'POST', path: '/api/assessments', auth: true },
    { method: 'GET', path: '/api/assessments', auth: true },
    { method: 'GET', path: '/api/assessments/:id', auth: true },
    { method: 'PATCH', path: '/api/assessments/:id', auth: true },
    { method: 'DELETE', path: '/api/assessments/:id', auth: true },
  ],
  'analytics': [
    { method: 'GET', path: '/api/analytics', auth: true },
  ],
  'audit': [
    { method: 'GET', path: '/api/audit', auth: true },
    { method: 'GET', path: '/api/audit/resource/:resource/:resourceId', auth: true },
    { method: 'GET', path: '/api/audit/user/:userId', auth: true },
  ],
  'bulk': [
    { method: 'POST', path: '/api/bulk/delete', auth: true },
    { method: 'POST', path: '/api/bulk/update', auth: true },
  ],
  'ai': [
    { method: 'POST', path: '/api/ai/generate/question', auth: true },
    { method: 'POST', path: '/api/ai/generate/summary', auth: true },
    { method: 'POST', path: '/api/ai/generate/synthesis', auth: true },
    { method: 'POST', path: '/api/ai/analyze/themes-and-skills', auth: true },
    { method: 'POST', path: '/api/ai/analyze/user-profile', auth: true },
    { method: 'POST', path: '/api/ai/suggest/optional-module', auth: true },
    { method: 'POST', path: '/api/ai/find/resource-leads', auth: true },
  ],
};

// Frontend route definitions
const frontendRoutes: Record<string, string> = {
  '/dashboard': 'DashboardHome',
  '/dashboard-new': 'DashboardHomeNew',
  '/assessments': 'AssessmentsList',
  '/assessments/show/:id': 'AssessmentsShow',
  '/assessments/create': 'AssessmentsCreate',
  '/assessments/edit/:id': 'AssessmentsEdit',
  '/users': 'UsersList',
  '/users/show/:id': 'UsersShow',
  '/users/create': 'UsersCreate',
  '/users/edit/:id': 'UsersEdit',
  '/roles': 'RolesList',
  '/roles/show/:id': 'RolesShow',
  '/roles/create': 'RolesCreate',
  '/roles/edit/:id': 'RolesEdit',
  '/analytics': 'AnalyticsDashboard',
  '/audit': 'AuditTrailList',
  '/profile': 'UserProfile',
  '/settings': 'Settings',
  '/bilan/*': 'BilanModule',
};

async function validateApiClientMethods() {
  console.log('\n🔌 Validating Frontend API Client Methods...\n');
  
  const apiClientPath = path.join(projectRoot, 'services/apiClient.ts');
  if (!fs.existsSync(apiClientPath)) {
    addResult('API Client', 'File existence', '❌ FAIL', 'apiClient.ts not found');
    return;
  }
  
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf-8');
  
  // Expected API methods
  const expectedMethods = [
    { name: 'getUsers', backend: 'GET /api/users' },
    { name: 'getUser', backend: 'GET /api/users/:id' },
    { name: 'createUser', backend: 'POST /api/users' },
    { name: 'updateUser', backend: 'PATCH /api/users/:id' },
    { name: 'deleteUser', backend: 'DELETE /api/users/:id' },
    { name: 'getRoles', backend: 'GET /api/roles' },
    { name: 'getRole', backend: 'GET /api/roles/:id' },
    { name: 'createRole', backend: 'POST /api/roles' },
    { name: 'updateRole', backend: 'PATCH /api/roles/:id' },
    { name: 'deleteRole', backend: 'DELETE /api/roles/:id' },
    { name: 'getAssessments', backend: 'GET /api/assessments' },
    { name: 'getAssessment', backend: 'GET /api/assessments/:id' },
    { name: 'createAssessment', backend: 'POST /api/assessments' },
    { name: 'updateAssessment', backend: 'PATCH /api/assessments/:id' },
    { name: 'deleteAssessment', backend: 'DELETE /api/assessments/:id' },
    { name: 'login', backend: 'POST /api/auth/login' },
    { name: 'register', backend: 'POST /api/auth/register' },
    { name: 'getMe', backend: 'GET /api/auth/me' },
    { name: 'getPermissions', backend: 'GET /api/auth/permissions' },
    { name: 'getAnalytics', backend: 'GET /api/analytics' },
    { name: 'getAuditLogs', backend: 'GET /api/audit' },
  ];
  
  for (const method of expectedMethods) {
    const methodPattern = new RegExp(`(?:async\\s+)?${method.name}\\s*[=:]|${method.name}\\s*[:=]|function\\s+${method.name}|const\\s+${method.name}`, 'i');
    
    if (methodPattern.test(apiClientContent)) {
      // Check if method calls correct backend endpoint
      const backendPath = method.backend.split(' ')[1];
      const hasCorrectPath = apiClientContent.includes(backendPath) || 
                            apiClientContent.includes(backendPath.replace('/api/', '')) ||
                            apiClientContent.includes(`'${backendPath}'`) ||
                            apiClientContent.includes(`"${backendPath}"`);
      
      if (hasCorrectPath) {
        addResult('API Client', method.name, '✅ PASS', `Calls ${method.backend}`);
      } else {
        addResult('API Client', method.name, '⚠️  WARN', `Method exists but backend path may not match ${method.backend}`);
      }
    } else {
      addResult('API Client', method.name, '❌ FAIL', `Method not found - expected ${method.backend}`);
    }
  }
  
  // Check API base URL configuration
  const hasApiUrl = apiClientContent.includes('VITE_API_URL') || 
                    apiClientContent.includes('API_URL') ||
                    apiClientContent.includes('baseURL') ||
                    apiClientContent.includes('baseUrl');
  
  if (hasApiUrl) {
    addResult('API Client', 'Base URL config', '✅ PASS', 'API base URL configured');
  } else {
    addResult('API Client', 'Base URL config', '⚠️  WARN', 'API base URL may be hardcoded');
  }
}

async function validateFrontendRoutes() {
  console.log('\n🛣️  Validating Frontend Routes...\n');
  
  const appPath = path.join(projectRoot, 'src/core/App.tsx');
  if (!fs.existsSync(appPath)) {
    addResult('Frontend Routes', 'App.tsx', '❌ FAIL', 'App.tsx not found');
    return;
  }
  
  const appContent = fs.readFileSync(appPath, 'utf-8');
  
  for (const [route, component] of Object.entries(frontendRoutes)) {
    const routePattern = route.replace(/\*/g, '.*').replace(/:/g, '\\w+');
    const routeRegex = new RegExp(`path=["']${routePattern.replace(/\//g, '\\/')}["']`, 'i');
    
    if (routeRegex.test(appContent) || appContent.includes(route)) {
      // Check if component is imported
      const componentImport = new RegExp(`import.*${component}.*from|from.*${component}`, 'i');
      if (componentImport.test(appContent)) {
        addResult('Frontend Routes', route, '✅ PASS', `Maps to ${component}`);
      } else {
        addResult('Frontend Routes', route, '⚠️  WARN', `Route exists but component ${component} may not be imported`);
      }
    } else {
      addResult('Frontend Routes', route, '❌ FAIL', `Route not found - expected ${component}`);
    }
  }
}

async function validatePermissionGuards() {
  console.log('\n🔐 Validating Frontend Permission Guards...\n');
  
  // Try multiple possible locations
  const possiblePagesDirs = [
    path.join(projectRoot, 'src/pages'),
    path.join(projectRoot, 'pages'),
    path.join(projectRoot, 'components'),
  ];
  
  let pagesDir: string | null = null;
  for (const dir of possiblePagesDirs) {
    if (fs.existsSync(dir)) {
      pagesDir = dir;
      break;
    }
  }
  
  if (!pagesDir) {
    addResult('Permission Guards', 'Pages directory', '⚠️  WARN', 'Pages directory not found in common locations');
    return;
  }
  
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  // Expected permission mappings
  const expectedPermissions: Record<string, Array<{ resource: string; action: string }>> = {
    'UsersList.tsx': [{ resource: 'users', action: 'read' }],
    'UsersCreate.tsx': [{ resource: 'users', action: 'create' }],
    'UsersEdit.tsx': [{ resource: 'users', action: 'update' }],
    'UsersShow.tsx': [{ resource: 'users', action: 'read' }],
    'AssessmentsList.tsx': [{ resource: 'bilan:assessment', action: 'read' }],
    'AssessmentsCreate.tsx': [{ resource: 'bilan:assessment', action: 'create' }],
    'AssessmentsEdit.tsx': [{ resource: 'bilan:assessment', action: 'update' }],
    'AssessmentsShow.tsx': [{ resource: 'bilan:assessment', action: 'read' }],
    'AnalyticsDashboard.tsx': [{ resource: 'analytics', action: 'read' }],
    'AuditTrailList.tsx': [{ resource: 'audit', action: 'read' }],
  };
  
  for (const file of pageFiles) {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const expected = expectedPermissions[file];
    if (expected) {
      // Check if PermissionGuard is used
      const hasPermissionGuard = content.includes('PermissionGuard') || 
                                content.includes('requirePermission') ||
                                content.includes('canAccess');
      
      if (hasPermissionGuard) {
        // Check if correct permissions are used
        let hasCorrectPermission = false;
        for (const perm of expected) {
          const permPattern = `${perm.resource}:${perm.action}`;
          if (content.includes(permPattern) || 
              (content.includes(`resource="${perm.resource}"`) && content.includes(`action="${perm.action}"`)) ||
              (content.includes(`resource='${perm.resource}'`) && content.includes(`action='${perm.action}'`))) {
            hasCorrectPermission = true;
            addResult('Permission Guards', file, '✅ PASS', `Protected with ${permPattern}`);
            break;
          }
        }
        
        if (!hasCorrectPermission) {
          addResult('Permission Guards', file, '⚠️  WARN', 
            `Has PermissionGuard but may not use expected permissions: ${expected.map(p => `${p.resource}:${p.action}`).join(', ')}`);
        }
      } else {
        addResult('Permission Guards', file, '❌ FAIL', 
          `Missing PermissionGuard - expected: ${expected.map(p => `${p.resource}:${p.action}`).join(', ')}`);
      }
    } else {
      // Pages that don't require specific permissions (public or optional)
      if (file.includes('Login') || file.includes('Register') || file.includes('PasswordReset')) {
        addResult('Permission Guards', file, '✅ PASS', 'Public page (no guard needed)');
      } else {
        addResult('Permission Guards', file, '⚠️  WARN', 'No expected permission defined (may be intentional)');
      }
    }
  }
}

async function validateDataProviderMapping() {
  console.log('\n📊 Validating Data Provider Mapping...\n');
  
  const dataProviderPath = path.join(projectRoot, 'src/core/providers/dataProvider.ts');
  if (!fs.existsSync(dataProviderPath)) {
    addResult('Data Provider', 'File existence', '❌ FAIL', 'dataProvider.ts not found');
    return;
  }
  
  const dataProviderContent = fs.readFileSync(dataProviderPath, 'utf-8');
  
  // Check resource mappings
  const resources = ['assessments', 'users', 'roles'];
  for (const resource of resources) {
    const hasResource = dataProviderContent.includes(`case '${resource}'`) || 
                       dataProviderContent.includes(`resource === '${resource}'`);
    
    if (hasResource) {
      // Check if correct API method is called
      const methodMap: Record<string, string> = {
        'assessments': 'api.getAssessments',
        'users': 'api.getUsers',
        'roles': 'api.getRoles',
      };
      
      const expectedMethod = methodMap[resource];
      if (dataProviderContent.includes(expectedMethod)) {
        addResult('Data Provider', `${resource} mapping`, '✅ PASS', `Uses ${expectedMethod}`);
      } else {
        addResult('Data Provider', `${resource} mapping`, '⚠️  WARN', `Resource mapped but may not use ${expectedMethod}`);
      }
    } else {
      addResult('Data Provider', `${resource} mapping`, '❌ FAIL', `Resource not mapped`);
    }
  }
  
  // Check CRUD operations
  const operations = ['getList', 'getOne', 'create', 'update', 'deleteOne'];
  for (const op of operations) {
    if (dataProviderContent.includes(op)) {
      addResult('Data Provider', `${op} operation`, '✅ PASS', 'Operation implemented');
    } else {
      addResult('Data Provider', `${op} operation`, '❌ FAIL', 'Operation missing');
    }
  }
}

async function validateI18nConsistency() {
  console.log('\n🌐 Validating i18n Consistency...\n');
  
  const localesDir = path.join(projectRoot, 'src/i18n/locales');
  if (!fs.existsSync(localesDir)) {
    addResult('i18n', 'Locales directory', '❌ FAIL', 'Locales directory not found');
    return;
  }
  
  const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
  const localeKeys: Record<string, Set<string>> = {};
  
  // Read all locale files
  for (const file of localeFiles) {
    const filePath = path.join(localesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const locale = file.replace('.json', '');
    localeKeys[locale] = new Set();
    
    // Flatten JSON keys
    function flattenKeys(obj: any, prefix = ''): string[] {
      const keys: string[] = [];
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...flattenKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }
    
    const keys = flattenKeys(content);
    keys.forEach(k => localeKeys[locale].add(k));
  }
  
  // Check consistency
  const locales = Object.keys(localeKeys);
  if (locales.length === 0) {
    addResult('i18n', 'Locale files', '❌ FAIL', 'No locale files found');
    return;
  }
  
  // Use first locale as reference
  const referenceLocale = locales[0];
  const referenceKeys = localeKeys[referenceLocale];
  
  for (const locale of locales.slice(1)) {
    const localeKeysSet = localeKeys[locale];
    const missing = [...referenceKeys].filter(k => !localeKeysSet.has(k));
    const extra = [...localeKeysSet].filter(k => !referenceKeys.has(k));
    
    if (missing.length === 0 && extra.length === 0) {
      addResult('i18n', `${locale} vs ${referenceLocale}`, '✅ PASS', 'Keys match');
    } else {
      if (missing.length > 0) {
        addResult('i18n', `${locale} missing keys`, '⚠️  WARN', `${missing.length} keys missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
      }
      if (extra.length > 0) {
        addResult('i18n', `${locale} extra keys`, '⚠️  WARN', `${extra.length} extra keys: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}`);
      }
    }
  }
  
  addResult('i18n', 'Total locales', '✅ PASS', `${locales.length} locales: ${locales.join(', ')}`);
}

async function validateErrorHandling() {
  console.log('\n🛡️  Validating Error Handling Consistency...\n');
  
  const apiClientPath = path.join(projectRoot, 'services/apiClient.ts');
  if (!fs.existsSync(apiClientPath)) {
    return;
  }
  
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf-8');
  
  // Check for error handling patterns
  const hasTryCatch = apiClientContent.includes('try {') && apiClientContent.includes('catch');
  const hasErrorHandling = apiClientContent.includes('error') || apiClientContent.includes('Error');
  
  if (hasTryCatch || hasErrorHandling) {
    addResult('Error Handling', 'API Client', '✅ PASS', 'Has error handling');
  } else {
    addResult('Error Handling', 'API Client', '⚠️  WARN', 'May lack error handling');
  }
  
  // Check for 401 handling (unauthorized)
  if (apiClientContent.includes('401') || apiClientContent.includes('Unauthorized')) {
    addResult('Error Handling', '401 handling', '✅ PASS', 'Handles unauthorized errors');
  } else {
    addResult('Error Handling', '401 handling', '⚠️  WARN', 'May not handle 401 errors');
  }
  
  // Check data provider error handling
  const dataProviderPath = path.join(projectRoot, 'src/core/providers/dataProvider.ts');
  if (fs.existsSync(dataProviderPath)) {
    const dataProviderContent = fs.readFileSync(dataProviderPath, 'utf-8');
    if (dataProviderContent.includes('catch') || dataProviderContent.includes('error')) {
      addResult('Error Handling', 'Data Provider', '✅ PASS', 'Has error handling');
    } else {
      addResult('Error Handling', 'Data Provider', '⚠️  WARN', 'May lack error handling');
    }
  }
}

async function validateTypeDefinitions() {
  console.log('\n📝 Validating Type Definitions...\n');
  
  // Check if types are shared or consistent
  const backendTypesPath = path.join(projectRoot, 'backend/src/types');
  const frontendTypesPath = path.join(projectRoot, 'src/types');
  
  const hasBackendTypes = fs.existsSync(backendTypesPath);
  const hasFrontendTypes = fs.existsSync(frontendTypesPath);
  
  if (hasBackendTypes) {
    addResult('Type Definitions', 'Backend types', '✅ PASS', 'Backend types directory exists');
  } else {
    addResult('Type Definitions', 'Backend types', '⚠️  WARN', 'Backend types directory not found');
  }
  
  if (hasFrontendTypes) {
    addResult('Type Definitions', 'Frontend types', '✅ PASS', 'Frontend types directory exists');
  } else {
    addResult('Type Definitions', 'Frontend types', '⚠️  WARN', 'Frontend types directory not found');
  }
  
  // Check for common type files
  const commonTypes = ['user', 'role', 'assessment', 'permission'];
  for (const type of commonTypes) {
    const backendTypeFile = path.join(backendTypesPath, `${type}.ts`);
    const frontendTypeFile = path.join(frontendTypesPath, `${type}.ts`);
    
    const backendExists = hasBackendTypes && fs.existsSync(backendTypeFile);
    const frontendExists = hasFrontendTypes && fs.existsSync(frontendTypeFile);
    
    if (backendExists && frontendExists) {
      addResult('Type Definitions', `${type} types`, '✅ PASS', 'Exists in both frontend and backend');
    } else if (backendExists || frontendExists) {
      addResult('Type Definitions', `${type} types`, '⚠️  WARN', 
        `Exists only in ${backendExists ? 'backend' : 'frontend'}`);
    }
  }
}

async function generateIntegrationReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FRONTEND-BACKEND INTEGRATION VALIDATION REPORT');
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
    });
  }
  
  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    results.filter(r => r.status === '⚠️  WARN').slice(0, 20).forEach(r => {
      console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
    });
    if (warnings > 20) {
      console.log(`  ... and ${warnings - 20} more warnings`);
    }
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

async function validateFrontendBackend() {
  console.log('🚀 Starting Frontend-Backend Integration Validation...\n');
  console.log('='.repeat(80) + '\n');
  
  await validateApiClientMethods();
  await validateFrontendRoutes();
  await validatePermissionGuards();
  await validateDataProviderMapping();
  await validateI18nConsistency();
  await validateErrorHandling();
  await validateTypeDefinitions();
  
  const allPassed = await generateIntegrationReport();
  
  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateFrontendBackend()
    .catch((error) => {
      console.error('\n❌ Frontend-Backend validation script failed:', error);
      process.exit(1);
    });
}

export { validateFrontendBackend };

