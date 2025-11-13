import React from 'react';

// Import BILAN components
import WelcomeScreen from '../../../components/WelcomeScreen';
import PackageSelector from '../../../components/PackageSelector';
import PhasePreliminaire from '../../../components/PhasePreliminaire';
import PersonalizationStep from '../../../components/PersonalizationStep';
import Questionnaire from '../../../components/Questionnaire';
import SummaryDashboard from '../../../components/SummaryDashboard';
import HistoryScreen from '../../../components/HistoryScreen';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';

export interface ModuleDefinition {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  component: React.ComponentType<any>;
  route: string;
  icon?: string;
  permissions?: string[]; // Array of permission strings (e.g., ['bilan:assessment:read'])
  isActive?: boolean;
  order?: number;
}

/**
 * Module Registry
 * Tüm modüllerin tanımlandığı merkezi kayıt
 */
export const modules: ModuleDefinition[] = [
  {
    id: 'bilan',
    name: 'bilan',
    displayName: 'Bilan de Compétences',
    description: 'Complete your skills assessment',
    component: WelcomeScreen, // Entry point
    route: '/bilan',
    icon: '📊',
    permissions: ['bilan:assessment:read'],
    isActive: true,
    order: 1,
  },
  {
    id: 'dashboard',
    name: 'dashboard',
    displayName: 'Dashboard',
    description: 'Overview and statistics',
    component: React.lazy(() => import('../../../pages/DashboardHome')),
    route: '/dashboard',
    icon: '📈',
    permissions: [], // Public (authenticated users)
    isActive: true,
    order: 0,
  },
  {
    id: 'assessments',
    name: 'assessments',
    displayName: 'Assessments',
    description: 'Manage your assessments',
    component: React.lazy(() => import('../../../pages/AssessmentsList')),
    route: '/assessments',
    icon: '📝',
    permissions: ['bilan:assessment:read'],
    isActive: true,
    order: 2,
  },
  {
    id: 'analytics',
    name: 'analytics',
    displayName: 'Analytics',
    description: 'View analytics and reports',
    component: AnalyticsDashboard,
    route: '/analytics',
    icon: '📊',
    permissions: ['analytics:read'],
    isActive: true,
    order: 3,
  },
  {
    id: 'users',
    name: 'users',
    displayName: 'User Management',
    description: 'Manage users and accounts',
    component: React.lazy(() => import('../../../pages/UsersList')),
    route: '/users',
    icon: '👥',
    permissions: ['users:read'],
    isActive: true,
    order: 4,
  },
  {
    id: 'roles',
    name: 'roles',
    displayName: 'Roles & Permissions',
    description: 'Manage roles and permissions',
    component: React.lazy(() => import('../../../pages/RolesList')),
    route: '/roles',
    icon: '🔐',
    permissions: ['roles:read'],
    isActive: true,
    order: 5,
  },
];

/**
 * Get module by ID
 */
export const getModule = (id: string): ModuleDefinition | undefined => {
  return modules.find(m => m.id === id);
};

/**
 * Get modules by permission
 */
export const getModulesByPermission = (permissions: string[]): ModuleDefinition[] => {
  return modules.filter(module => {
    if (!module.permissions || module.permissions.length === 0) {
      return true; // Public module
    }
    return module.permissions.some(perm => permissions.includes(perm));
  });
};

/**
 * Get active modules
 */
export const getActiveModules = (): ModuleDefinition[] => {
  return modules.filter(m => m.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
};

