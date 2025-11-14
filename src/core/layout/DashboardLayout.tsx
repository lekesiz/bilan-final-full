import React from 'react';
import { Layout } from 'antd';
import { ThemedLayout } from '@refinedev/antd';
import { Header } from './Header';
import { Sider } from './Sider';

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <ThemedLayout
      Header={() => <Header />}
      Sider={({ Title }) => <Sider Title={Title} />}
      Title={() => <span>BILAN-EASY</span>}
    >
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        {children}
      </Content>
    </ThemedLayout>
  );
};

