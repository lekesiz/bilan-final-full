import React from 'react';
import { Empty, Button, Typography, Space } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface NoAssessmentsYetProps {
  onCreateClick?: () => void;
}

export const NoAssessmentsYet: React.FC<NoAssessmentsYetProps> = ({ onCreateClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      navigate('/assessments/create');
    }
  };

  return (
    <Empty
      image={<FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
      description={
        <Space direction="vertical" size="small">
          <Title level={4} type="secondary" style={{ margin: 0 }}>
            {t('emptyStates.noAssessments', 'No assessments yet')}
          </Title>
          <Text type="secondary">
            {t('emptyStates.noAssessmentsDesc', 'Create your first assessment to get started')}
          </Text>
        </Space>
      }
      imageStyle={{ height: 100 }}
    >
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
        {t('emptyStates.createAssessment', 'Create Assessment')}
      </Button>
    </Empty>
  );
};

interface NoUsersFoundProps {
  onCreateClick?: () => void;
}

export const NoUsersFound: React.FC<NoUsersFoundProps> = ({ onCreateClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      navigate('/users/create');
    }
  };

  return (
    <Empty
      image={<UserOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
      description={
        <Space direction="vertical" size="small">
          <Title level={4} type="secondary" style={{ margin: 0 }}>
            {t('emptyStates.noUsers', 'No users found')}
          </Title>
          <Text type="secondary">
            {t('emptyStates.noUsersDesc', 'Create your first user to get started')}
          </Text>
        </Space>
      }
      imageStyle={{ height: 100 }}
    >
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
        {t('emptyStates.createUser', 'Create User')}
      </Button>
    </Empty>
  );
};

interface NoRolesFoundProps {
  onCreateClick?: () => void;
}

export const NoRolesFound: React.FC<NoRolesFoundProps> = ({ onCreateClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      navigate('/roles/create');
    }
  };

  return (
    <Empty
      image={<TeamOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
      description={
        <Space direction="vertical" size="small">
          <Title level={4} type="secondary" style={{ margin: 0 }}>
            {t('emptyStates.noRoles', 'No roles found')}
          </Title>
          <Text type="secondary">
            {t('emptyStates.noRolesDesc', 'Create your first role to get started')}
          </Text>
        </Space>
      }
      imageStyle={{ height: 100 }}
    >
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
        {t('emptyStates.createRole', 'Create Role')}
      </Button>
    </Empty>
  );
};

interface NoSearchResultsProps {
  query: string;
  onClearFilters?: () => void;
}

export const NoSearchResults: React.FC<NoSearchResultsProps> = ({ query, onClearFilters }) => {
  const { t } = useTranslation();

  return (
    <Empty
      image={<SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
      description={
        <Space direction="vertical" size="small">
          <Title level={4} type="secondary" style={{ margin: 0 }}>
            {t('emptyStates.noResults', 'No results found')}
          </Title>
          <Text type="secondary">
            {t('emptyStates.noResultsDesc', 'No results found for "{{query}}". Try adjusting your filters.', { query })}
          </Text>
        </Space>
      }
      imageStyle={{ height: 100 }}
    >
      {onClearFilters && (
        <Button onClick={onClearFilters}>
          {t('emptyStates.clearFilters', 'Clear Filters')}
        </Button>
      )}
    </Empty>
  );
};

