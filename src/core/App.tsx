import React from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { RefineThemes } from '@refinedev/antd';
import { ThemedLayout } from '@refinedev/antd';
import { DataProvider, AuthProvider } from '@refinedev/core';
import { ConfigProvider, App as AntdApp, notification } from 'antd';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useApi } from '../../services/apiClient';
import { createAuthProvider } from './providers/authProvider';
import { createDataProvider } from './providers/dataProvider';
import { Header } from './layout/Header';
import { Sider } from './layout/Sider';
import '@refinedev/antd/dist/reset.css';

// Import BILAN Module
import BilanModule from '../modules/BilanModule';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

// Login/Register pages (to be created)
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';

// Dashboard pages
import DashboardHome from '../../pages/DashboardHome';
import AssessmentsList from '../../pages/AssessmentsList';
import UsersList from '../../pages/UsersList';
import UsersCreate from '../../pages/UsersCreate';
import UsersEdit from '../../pages/UsersEdit';
import UsersShow from '../../pages/UsersShow';
import RolesList from '../../pages/RolesList';
import RolesCreate from '../../pages/RolesCreate';
import RolesEdit from '../../pages/RolesEdit';
import RolesShow from '../../pages/RolesShow';

interface RefineAppProps {
  api: ReturnType<typeof useApi>;
}

// Create a simple notification provider using Ant Design
import { notification } from 'antd';

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
  const authProvider = React.useMemo(() => createAuthProvider(api), [api]);
  const dataProvider = React.useMemo(() => createDataProvider(api), [api]);
  const notificationProvider = React.useMemo(() => createNotificationProvider(), []);

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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  element={
                    <Authenticated fallback={<Navigate to="/login" replace />}>
                      <ThemedLayout
                        Header={() => <Header />}
                        Sider={() => <Sider />}
                        Title={() => <span>BILAN-EASY</span>}
                      >
                        <Outlet />
                      </ThemedLayout>
                    </Authenticated>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/assessments" element={<AssessmentsList />} />
                  <Route path="/users" element={<UsersList />} />
                  <Route path="/users/create" element={<UsersCreate />} />
                  <Route path="/users/edit/:id" element={<UsersEdit />} />
                  <Route path="/users/show/:id" element={<UsersShow />} />
                  <Route path="/roles" element={<RolesList />} />
                  <Route path="/roles/create" element={<RolesCreate />} />
                  <Route path="/roles/edit/:id" element={<RolesEdit />} />
                  <Route path="/roles/show/:id" element={<RolesShow />} />
                </Route>

                {/* BILAN Module routes */}
                <Route 
                  path="/bilan/*" 
                  element={
                    <Authenticated fallback={<Navigate to="/login" replace />}>
                      <BilanModule />
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

