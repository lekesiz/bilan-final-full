import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

interface ModuleLayoutProps {
  title?: string;
  children: React.ReactNode;
  showHeader?: boolean;
}

/**
 * ModuleLayout component
 * Provides a consistent layout for modules within the dashboard
 */
export const ModuleLayout: React.FC<ModuleLayoutProps> = ({ 
  title, 
  children, 
  showHeader = false 
}) => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      {showHeader && title && (
        <Layout.Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            {title}
          </h1>
        </Layout.Header>
      )}
      <Content style={{ padding: showHeader ? '24px' : '0' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default ModuleLayout;

