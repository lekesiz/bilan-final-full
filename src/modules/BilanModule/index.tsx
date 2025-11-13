import React from 'react';
import { usePermissions } from '../../core/permissions/usePermissions';
import { PermissionGuard } from '../../core/permissions/PermissionGuard';
import { BilanApp } from './BilanApp';
import { ModuleLayout } from './ModuleLayout';
import AssessmentList from './AssessmentList';
import AssessmentDetail from './AssessmentDetail';
import { Result, Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

/**
 * BILAN Module Wrapper
 * Provides permission checking and module layout for the BILAN application
 */
export const BilanModule: React.FC = () => {
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  // Check if user has access to bilan module
  if (!canAccess('bilan', 'read') && !canAccess('bilan:assessment', 'read')) {
    return (
      <Result
        icon={<StopOutlined />}
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access the Bilan de Compétences module."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        }
      />
    );
  }

  // Render BILAN app with permission context and module layout
  // Handle nested routes for assessments
  const location = useLocation();
  
  // Check if we're on assessment management routes
  if (location.pathname === '/bilan/assessments' || location.pathname.startsWith('/bilan/assessment/')) {
    return (
      <PermissionGuard resource="bilan:assessment" action="read" showError={false}>
        <ModuleLayout title="Assessment Management" showHeader={false}>
          <Routes>
            <Route index element={<AssessmentList />} />
            <Route path="assessments" element={<AssessmentList />} />
            <Route path="assessment/:id" element={<AssessmentDetail />} />
            <Route path="assessment/:id/edit" element={<AssessmentDetail />} />
          </Routes>
        </ModuleLayout>
      </PermissionGuard>
    );
  }

  // Default: Render main BILAN app
  return (
    <PermissionGuard resource="bilan" action="read" showError={false}>
      <ModuleLayout title="Bilan de Compétences" showHeader={false}>
        <BilanApp />
      </ModuleLayout>
    </PermissionGuard>
  );
};

export default BilanModule;

