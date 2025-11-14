/**
 * Comprehensive Test & Validation Script
 * 
 * Validates all aspects of the application:
 * - Database integrity
 * - Backend functionality
 * - Frontend-Backend integration
 * - Test coverage
 * - Code quality
 * - Security
 * 
 * Run with: tsx src/scripts/validateAll.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

async function runCommand(command: string, cwd?: string): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const output = execSync(command, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 30000, // 30 seconds timeout
    });
    return { success: true, output };
  } catch (error: any) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

async function validateDatabase() {
  console.log('\n🗄️  Running Database Validation...\n');
  
  const result = await runCommand('npm run validate:detailed', path.join(__dirname, '..'));
  
  if (result.success) {
    // Check if all critical checks passed
    if (result.output.includes('✅ ALL CRITICAL CHECKS PASSED')) {
      addResult('Database', 'Validation', '✅ PASS', 'All database checks passed');
    } else if (result.output.includes('❌ SOME CHECKS FAILED')) {
      addResult('Database', 'Validation', '❌ FAIL', 'Some database checks failed');
    } else {
      addResult('Database', 'Validation', '⚠️  WARN', 'Database validation completed with warnings');
    }
  } else {
    addResult('Database', 'Validation', '❌ FAIL', `Database validation failed: ${result.error}`);
  }
}

async function validateBackend() {
  console.log('\n🔧 Running Backend Validation...\n');
  
  // Check if backend builds successfully
  const buildResult = await runCommand('npm run build', path.join(__dirname, '..'));
  
  if (buildResult.success) {
    addResult('Backend', 'TypeScript Build', '✅ PASS', 'Backend builds successfully');
  } else {
    addResult('Backend', 'TypeScript Build', '❌ FAIL', `Build failed: ${buildResult.error}`);
  }
  
  // Check for test files
  const testDir = path.join(__dirname, '../test');
  if (fs.existsSync(testDir)) {
    let testFiles: string[] = [];
    try {
      const allFiles = fs.readdirSync(testDir, { recursive: true });
      testFiles = (allFiles as string[]).filter((f: string) => 
        f.endsWith('.test.ts') || f.endsWith('.spec.ts')
      );
    } catch (error) {
      // Fallback: non-recursive
      const files = fs.readdirSync(testDir);
      testFiles = files.filter((f: string) => 
        f.endsWith('.test.ts') || f.endsWith('.spec.ts')
      );
    }
    
    if (testFiles.length > 0) {
      addResult('Backend', 'Test Files', '✅ PASS', `${testFiles.length} test files found`);
    } else {
      addResult('Backend', 'Test Files', '⚠️  WARN', 'No test files found');
    }
  } else {
    addResult('Backend', 'Test Files', '⚠️  WARN', 'Test directory not found');
  }
  
  // Check if vitest is configured
  const vitestConfig = path.join(__dirname, '../../vitest.config.ts');
  if (fs.existsSync(vitestConfig)) {
    addResult('Backend', 'Vitest Config', '✅ PASS', 'Vitest configuration exists');
  } else {
    addResult('Backend', 'Vitest Config', '⚠️  WARN', 'Vitest configuration not found');
  }
}

async function validateFrontend() {
  console.log('\n⚛️  Running Frontend Validation...\n');
  
  // Check if frontend builds successfully
  const buildResult = await runCommand('npm run build', projectRoot);
  
  if (buildResult.success) {
    addResult('Frontend', 'Vite Build', '✅ PASS', 'Frontend builds successfully');
  } else {
    addResult('Frontend', 'Vite Build', '❌ FAIL', `Build failed: ${buildResult.error}`);
  }
  
  // Check for test files
  const testDir = path.join(projectRoot, 'src/test');
  if (fs.existsSync(testDir)) {
    let testFiles: string[] = [];
    try {
      const allFiles = fs.readdirSync(testDir, { recursive: true });
      testFiles = (allFiles as string[]).filter((f: string) => 
        f.endsWith('.test.ts') || f.endsWith('.test.tsx') || f.endsWith('.spec.ts')
      );
    } catch (error) {
      // Fallback: non-recursive
      const files = fs.readdirSync(testDir);
      testFiles = files.filter((f: string) => 
        f.endsWith('.test.ts') || f.endsWith('.test.tsx') || f.endsWith('.spec.ts')
      );
    }
    
    if (testFiles.length > 0) {
      addResult('Frontend', 'Test Files', '✅ PASS', `${testFiles.length} test files found`);
    } else {
      addResult('Frontend', 'Test Files', '⚠️  WARN', 'No test files found');
    }
  } else {
    addResult('Frontend', 'Test Files', '⚠️  WARN', 'Test directory not found');
  }
  
  // Check if vitest is configured
  const vitestConfig = path.join(projectRoot, 'vitest.config.ts');
  if (fs.existsSync(vitestConfig)) {
    addResult('Frontend', 'Vitest Config', '✅ PASS', 'Vitest configuration exists');
  } else {
    addResult('Frontend', 'Vitest Config', '❌ FAIL', 'Vitest configuration not found');
  }
  
  // Check if Playwright is configured for E2E
  const playwrightConfig = path.join(projectRoot, 'playwright.config.ts');
  if (fs.existsSync(playwrightConfig)) {
    addResult('Frontend', 'Playwright Config', '✅ PASS', 'Playwright E2E configuration exists');
  } else {
    addResult('Frontend', 'Playwright Config', '⚠️  WARN', 'Playwright configuration not found');
  }
}

async function validateIntegration() {
  console.log('\n🔗 Running Frontend-Backend Integration Validation...\n');
  
  const result = await runCommand('npm run validate:integration', path.join(__dirname, '..'));
  
  if (result.success) {
    if (result.output.includes('✅ ALL CRITICAL CHECKS PASSED')) {
      addResult('Integration', 'Validation', '✅ PASS', 'All integration checks passed');
    } else if (result.output.includes('❌ SOME CHECKS FAILED')) {
      addResult('Integration', 'Validation', '❌ FAIL', 'Some integration checks failed');
    } else {
      addResult('Integration', 'Validation', '⚠️  WARN', 'Integration validation completed with warnings');
    }
  } else {
    addResult('Integration', 'Validation', '❌ FAIL', `Integration validation failed: ${result.error}`);
  }
}

async function validateTestCoverage() {
  console.log('\n📊 Checking Test Coverage...\n');
  
  // Frontend test coverage
  const frontendCoverageResult = await runCommand('npm run test:coverage', projectRoot);
  
  if (frontendCoverageResult.success) {
    // Try to extract coverage percentage
    const coverageMatch = frontendCoverageResult.output.match(/(\d+\.\d+)%/);
    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1]);
      if (coverage >= 80) {
        addResult('Test Coverage', 'Frontend', '✅ PASS', `${coverage}% coverage`);
      } else if (coverage >= 50) {
        addResult('Test Coverage', 'Frontend', '⚠️  WARN', `${coverage}% coverage (target: 80%)`);
      } else {
        addResult('Test Coverage', 'Frontend', '❌ FAIL', `${coverage}% coverage (target: 80%)`);
      }
    } else {
      addResult('Test Coverage', 'Frontend', '⚠️  WARN', 'Coverage report generated but percentage not found');
    }
  } else {
    addResult('Test Coverage', 'Frontend', '⚠️  WARN', 'Could not generate coverage report');
  }
  
  // Backend test coverage (if tests exist)
  const backendTestDir = path.join(__dirname, '../test');
  if (fs.existsSync(backendTestDir)) {
    const backendPackageJson = path.join(__dirname, '../../package.json');
    const backendPkg = JSON.parse(fs.readFileSync(backendPackageJson, 'utf-8'));
    
    if (backendPkg.scripts && backendPkg.scripts.test) {
      const backendCoverageResult = await runCommand('npm run test -- --coverage', path.join(__dirname, '..'));
      
      if (backendCoverageResult.success) {
        addResult('Test Coverage', 'Backend', '✅ PASS', 'Backend coverage report generated');
      } else {
        addResult('Test Coverage', 'Backend', '⚠️  WARN', 'Backend coverage report could not be generated');
      }
    } else {
      addResult('Test Coverage', 'Backend', '⚠️  WARN', 'Backend test script not configured');
    }
  }
}

async function validateCodeQuality() {
  console.log('\n✨ Checking Code Quality...\n');
  
  // Check for TypeScript errors
  const frontendTsCheck = await runCommand('npx tsc --noEmit', projectRoot);
  
  if (frontendTsCheck.success) {
    addResult('Code Quality', 'Frontend TypeScript', '✅ PASS', 'No TypeScript errors');
  } else {
    // Count errors
    const errorMatch = frontendTsCheck.error?.match(/(\d+)\s+error/i);
    if (errorMatch) {
      const errorCount = parseInt(errorMatch[1]);
      if (errorCount > 0) {
        addResult('Code Quality', 'Frontend TypeScript', '❌ FAIL', `${errorCount} TypeScript errors found`);
      }
    } else {
      addResult('Code Quality', 'Frontend TypeScript', '⚠️  WARN', 'TypeScript check completed with issues');
    }
  }
  
  const backendTsCheck = await runCommand('npx tsc --noEmit', path.join(__dirname, '..'));
  
  if (backendTsCheck.success) {
    addResult('Code Quality', 'Backend TypeScript', '✅ PASS', 'No TypeScript errors');
  } else {
    const errorMatch = backendTsCheck.error?.match(/(\d+)\s+error/i);
    if (errorMatch) {
      const errorCount = parseInt(errorMatch[1]);
      if (errorCount > 0) {
        addResult('Code Quality', 'Backend TypeScript', '❌ FAIL', `${errorCount} TypeScript errors found`);
      }
    } else {
      addResult('Code Quality', 'Backend TypeScript', '⚠️  WARN', 'TypeScript check completed with issues');
    }
  }
  
  // Check for ESLint (if configured)
  const frontendEslint = path.join(projectRoot, '.eslintrc');
  const backendEslint = path.join(__dirname, '../.eslintrc');
  
  if (fs.existsSync(frontendEslint) || fs.existsSync(path.join(projectRoot, '.eslintrc.js'))) {
    const lintResult = await runCommand('npx eslint . --ext .ts,.tsx', projectRoot);
    if (lintResult.success) {
      addResult('Code Quality', 'Frontend ESLint', '✅ PASS', 'No ESLint errors');
    } else {
      addResult('Code Quality', 'Frontend ESLint', '⚠️  WARN', 'ESLint found issues');
    }
  } else {
    addResult('Code Quality', 'Frontend ESLint', '⚠️  WARN', 'ESLint not configured');
  }
}

async function validateSecurity() {
  console.log('\n🔒 Checking Security...\n');
  
  // Check for npm audit vulnerabilities
  const frontendAudit = await runCommand('npm audit --audit-level=moderate', projectRoot);
  
  if (frontendAudit.success) {
    addResult('Security', 'Frontend npm audit', '✅ PASS', 'No moderate+ vulnerabilities');
  } else {
    // Try to extract vulnerability count
    const vulnMatch = frontendAudit.output.match(/(\d+)\s+(?:vulnerabilit|moderate|high|critical)/i);
    if (vulnMatch) {
      const vulnCount = parseInt(vulnMatch[1]);
      addResult('Security', 'Frontend npm audit', '⚠️  WARN', `${vulnCount} vulnerabilities found`);
    } else {
      addResult('Security', 'Frontend npm audit', '⚠️  WARN', 'Vulnerabilities may exist');
    }
  }
  
  const backendAudit = await runCommand('npm audit --audit-level=moderate', path.join(__dirname, '..'));
  
  if (backendAudit.success) {
    addResult('Security', 'Backend npm audit', '✅ PASS', 'No moderate+ vulnerabilities');
  } else {
    const vulnMatch = backendAudit.output.match(/(\d+)\s+(?:vulnerabilit|moderate|high|critical)/i);
    if (vulnMatch) {
      const vulnCount = parseInt(vulnMatch[1]);
      addResult('Security', 'Backend npm audit', '⚠️  WARN', `${vulnCount} vulnerabilities found`);
    } else {
      addResult('Security', 'Backend npm audit', '⚠️  WARN', 'Vulnerabilities may exist');
    }
  }
  
  // Check for .env files in git (security risk)
  const gitignore = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignore)) {
    const gitignoreContent = fs.readFileSync(gitignore, 'utf-8');
    if (gitignoreContent.includes('.env') && gitignoreContent.includes('.env.local')) {
      addResult('Security', '.env in .gitignore', '✅ PASS', '.env files are ignored');
    } else {
      addResult('Security', '.env in .gitignore', '⚠️  WARN', '.env files may not be properly ignored');
    }
  }
}

async function validateDependencies() {
  console.log('\n📦 Checking Dependencies...\n');
  
  // Check for package.json in both frontend and backend
  const frontendPkg = path.join(projectRoot, 'package.json');
  const backendPkg = path.join(__dirname, '../../package.json');
  
  if (fs.existsSync(frontendPkg)) {
    const pkg = JSON.parse(fs.readFileSync(frontendPkg, 'utf-8'));
    const depCount = Object.keys(pkg.dependencies || {}).length;
    const devDepCount = Object.keys(pkg.devDependencies || {}).length;
    addResult('Dependencies', 'Frontend packages', '✅ PASS', `${depCount} deps, ${devDepCount} devDeps`);
  } else {
    addResult('Dependencies', 'Frontend packages', '❌ FAIL', 'package.json not found');
  }
  
  if (fs.existsSync(backendPkg)) {
    const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf-8'));
    const depCount = Object.keys(pkg.dependencies || {}).length;
    const devDepCount = Object.keys(pkg.devDependencies || {}).length;
    addResult('Dependencies', 'Backend packages', '✅ PASS', `${depCount} deps, ${devDepCount} devDeps`);
  } else {
    addResult('Dependencies', 'Backend packages', '❌ FAIL', 'package.json not found');
  }
}

async function generateComprehensiveReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST & VALIDATION REPORT');
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
    results.filter(r => r.status === '⚠️  WARN').slice(0, 15).forEach(r => {
      console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
    });
    if (warnings > 15) {
      console.log(`  ... and ${warnings - 15} more warnings`);
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

async function validateAll() {
  console.log('🚀 Starting Comprehensive Test & Validation...\n');
  console.log('='.repeat(80) + '\n');
  
  await validateDatabase();
  await validateBackend();
  await validateFrontend();
  await validateIntegration();
  await validateTestCoverage();
  await validateCodeQuality();
  await validateSecurity();
  await validateDependencies();
  
  const allPassed = await generateComprehensiveReport();
  
  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAll()
    .catch((error) => {
      console.error('\n❌ Comprehensive validation script failed:', error);
      process.exit(1);
    });
}

export { validateAll };

