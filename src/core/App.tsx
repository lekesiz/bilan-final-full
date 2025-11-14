import React, { Suspense, lazy } from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { RefineThemes } from '@refinedev/antd';
import { ThemedLayout } from '@refinedev/antd';
import { ConfigProvider, App as AntdApp, notification } from 'antd';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useApi } from '../../services/apiClient';
import { createAuthProvider } from './providers/authProvider';
import { createDataProvider } from './providers/dataProvider';
import { Header } from './layout/Header';
import { Sider } from './layout/Sider';
import '@refinedev/antd/dist/reset.css';

// Import BILAN Module (keep as regular import - used in multiple places)
import BilanModule from '../modules/BilanModule';

interface RefineAppProps {
  api: ReturnType<typeof useApi>;
}

// Lazy load all pages for code splitting and performance optimization
// This reduces initial bundle size significantly

// Auth pages
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/RegisterPage'));
const PasswordResetPage = lazy(() => import('../../pages/PasswordResetPage'));
const PasswordUpdatePage = lazy(() => import('../../pages/PasswordUpdatePage'));

// User pages
const UserProfile = lazy(() => import('../../pages/UserProfile'));
const Settings = lazy(() => import('../../pages/Settings'));

// Dashboard pages
const DashboardHome = lazy(() => import('../../pages/DashboardHome'));
const DashboardHomeNew = lazy(() => import('../../pages/DashboardHomeNew'));
const AnalyticsDashboard = lazy(() => import('../../components/AnalyticsDashboard'));

// Assessment pages
const AssessmentsList = lazy(() => import('../../pages/AssessmentsList'));
const AssessmentsShow = lazy(() => import('../../pages/AssessmentsShow'));
const AssessmentsCreate = lazy(() => import('../../pages/AssessmentsCreate'));
const AssessmentsEdit = lazy(() => import('../../pages/AssessmentsEdit'));

// User management pages
const UsersList = lazy(() => import('../../pages/UsersList'));
const UsersShow = lazy(() => import('../../pages/UsersShow'));
const UsersCreate = lazy(() => import('../../pages/UsersCreate'));
const UsersEdit = lazy(() => import('../../pages/UsersEdit'));

// Role management pages
const RolesList = lazy(() => import('../../pages/RolesList'));
const RolesShow = lazy(() => import('../../pages/RolesShow'));
const RolesCreate = lazy(() => import('../../pages/RolesCreate'));
const RolesEdit = lazy(() => import('../../pages/RolesEdit'));

// Audit pages
const AuditTrailList = lazy(() => import('../../pages/AuditTrailList'));

// Loading fallback component
const PageLoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
    padding: '24px'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1890ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <div style={{ color: '#666' }}>Loading...</div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Create a simple notification provider using Ant Design
const createNotificationProvider = () => {
  return {
    open: ({ message, description, type }: any) => {
      notification[type || 'info']({
        message,
        description,
        placement: 'topRight',
      });
    },
    close: () => {
      // Ant Design notifications auto-close
    },
  };
};

const RefineApp: React.FC<RefineAppProps> = ({ api }) => {
  console.log('[RefineApp] Initializing...');
  const authProvider = React.useMemo(() => {
    console.log('[RefineApp] Creating authProvider...');
    return createAuthProvider(api);
  }, [api]);
  const dataProvider = React.useMemo(() => {
    console.log('[RefineApp] Creating dataProvider...');
    return createDataProvider(api);
  }, [api]);
  const notificationProvider = React.useMemo(() => {
    console.log('[RefineApp] Creating notificationProvider...');
    return createNotificationProvider();
  }, []);

  console.log('[RefineApp] All providers initialized, rendering...');
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <RefineKbarProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={notificationProvider}
              resources={[
                {
                  name: 'assessments',
                  list: '/assessments',
                  show: '/assessments/show/:id',
                  create: '/assessments/create',
                  edit: '/assessments/edit/:id',
                },
                {
                  name: 'users',
                  list: '/users',
                  show: '/users/show/:id',
                  create: '/users/create',
                  edit: '/users/edit/:id',
                },
                {
                  name: 'roles',
                  list: '/roles',
                  show: '/roles/show/:id',
                  create: '/roles/create',
                  edit: '/roles/edit/:id',
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: 'bilan-easy',
              }}
            >
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/login" 
                  element={
                    <Suspense fallback={
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '100vh',
                        padding: '24px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #1890ff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                          }} />
                          <div style={{ color: '#666' }}>Loading...</div>
                        </div>
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                      </div>
                    }>
                      <LoginPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <RegisterPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/password-reset" 
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <PasswordResetPage />
                    </Suspense>
                  } 
                />
                
                {/* Protected routes */}
                <Route path="/password-update" element={
                  <Authenticated fallback={<Navigate to="/login" replace />}>
                    <ThemedLayout 
                      Sider={({ Title }) => <Sider Title={Title} />}
                      Header={Header}
                    >
                      <Suspense fallback={<PageLoadingFallback />}>
                        <PasswordUpdatePage />
                      </Suspense>
                    </ThemedLayout>
                  </Authenticated>
                } />
                <Route path="/profile" element={
                  <Authenticated fallback={<Navigate to="/login" replace />}>
                    <ThemedLayout 
                      Sider={({ Title }) => <Sider Title={Title} />}
                      Header={Header}
                    >
                      <Suspense fallback={<PageLoadingFallback />}>
                        <UserProfile />
                      </Suspense>
                    </ThemedLayout>
                  </Authenticated>
                } />
                <Route path="/settings" element={
                  <Authenticated fallback={<Navigate to="/login" replace />}>
                    <ThemedLayout 
                      Sider={({ Title }) => <Sider Title={Title} />}
                      Header={Header}
                    >
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Settings />
                      </Suspense>
                    </ThemedLayout>
                  </Authenticated>
                } />

                {/* Protected routes */}
                <Route
                  element={
                    <Authenticated fallback={<Navigate to="/login" replace />}>
                      <ThemedLayout
                        Header={() => <Header />}
                        Sider={({ Title }) => <Sider Title={Title} />}
                        Title={() => <span>BILAN-EASY</span>}
                      >
                        <Outlet />
                      </ThemedLayout>
                    </Authenticated>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <DashboardHome />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/dashboard-new" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <DashboardHomeNew />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AnalyticsDashboard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/assessments" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AssessmentsList />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/assessments/show/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AssessmentsShow />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/assessments/create" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AssessmentsCreate />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/assessments/edit/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AssessmentsEdit />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <UsersList />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/users/create" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <UsersCreate />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/users/edit/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <UsersEdit />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/users/show/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <UsersShow />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/roles" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <RolesList />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/roles/create" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <RolesCreate />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/roles/edit/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <RolesEdit />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/roles/show/:id" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <RolesShow />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/audit" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AuditTrailList />
                      </Suspense>
                    } 
                  />
                </Route>

                {/* BILAN Module routes */}
                <Route 
                  path="/bilan/*" 
                  element={
                    <Authenticated fallback={<Navigate to="/login" replace />}>
                      <ThemedLayout
                        Header={() => <Header />}
                        Sider={({ Title }) => <Sider Title={Title} />}
                        Title={() => <span>BILAN-EASY</span>}
                      >
                        <BilanModule />
                      </ThemedLayout>
                    </Authenticated>
                  } 
                />

                {/* Catch all - redirect to login if not authenticated */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <RefineKbar />
            </Refine>
          </RefineKbarProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default RefineApp;

