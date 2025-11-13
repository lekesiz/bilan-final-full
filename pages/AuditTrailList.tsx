import React, { useState, useMemo } from 'react';
import { useList } from '@refinedev/core';
import { List, Table, Card, Space, Button, Select, DatePicker, Tag, Typography, Drawer, Descriptions, Badge, Input } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import { useApi } from '../services/apiClient';
// Using native Date for now - can add dayjs if needed

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: any;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
  createdAt: string;
}

const AuditTrailList: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<{
    userId?: string;
    action?: string;
    resource?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({});

  const { data, isLoading, refetch } = useList<AuditLog>({
    resource: 'audit',
    filters: [
      ...(filters.userId ? [{ field: 'userId', operator: 'eq', value: filters.userId }] : []),
      ...(filters.action ? [{ field: 'action', operator: 'eq', value: filters.action }] : []),
      ...(filters.resource ? [{ field: 'resource', operator: 'eq', value: filters.resource }] : []),
      ...(filters.status ? [{ field: 'status', operator: 'eq', value: filters.status }] : []),
      ...(filters.startDate ? [{ field: 'startDate', operator: 'gte', value: filters.startDate }] : []),
      ...(filters.endDate ? [{ field: 'endDate', operator: 'lte', value: filters.endDate }] : []),
    ],
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  // Custom data fetching since Refine doesn't have direct audit resource
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, hasMore: false });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const result = await api.getAuditLogs({
          ...filters,
          limit: 50,
          offset: 0,
        });
        setLogs(result.logs || []);
        setPagination(result.pagination || { total: 0, limit: 50, offset: 0, hasMore: false });
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filters]);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].toISOString(),
        endDate: dates[1].toISOString(),
      });
    } else {
      setFilters({
        ...filters,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerVisible(true);
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'cyan',
      logout: 'default',
      view: 'purple',
    };
    return colors[action] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'success',
      failure: 'warning',
      error: 'error',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: t('audit.timestamp', 'Timestamp'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      sorter: true,
      width: 180,
    },
    {
      title: t('audit.user', 'User'),
      key: 'user',
      render: (_: any, record: AuditLog) => (
        <Space>
          {record.userName && <Text strong>{record.userName}</Text>}
          {record.userEmail && <Text type="secondary">({record.userEmail})</Text>}
        </Space>
      ),
      width: 200,
    },
    {
      title: t('audit.action', 'Action'),
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action.toUpperCase()}</Tag>
      ),
      width: 120,
    },
    {
      title: t('audit.resource', 'Resource'),
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => <Tag>{resource}</Tag>,
      width: 150,
    },
    {
      title: t('audit.resourceId', 'Resource ID'),
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (id: string) => id ? <Text code style={{ fontSize: 11 }}>{id.substring(0, 8)}...</Text> : '-',
      width: 120,
    },
    {
      title: t('audit.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status.toUpperCase()} />
      ),
      width: 100,
    },
    {
      title: t('audit.actions', 'Actions'),
      key: 'actions',
      render: (_: any, record: AuditLog) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          {t('audit.viewDetails', 'View Details')}
        </Button>
      ),
      width: 120,
    },
  ];

  const actionOptions = [
    { value: 'create', label: t('audit.actions.create', 'Create') },
    { value: 'update', label: t('audit.actions.update', 'Update') },
    { value: 'delete', label: t('audit.actions.delete', 'Delete') },
    { value: 'login', label: t('audit.actions.login', 'Login') },
    { value: 'logout', label: t('audit.actions.logout', 'Logout') },
    { value: 'view', label: t('audit.actions.view', 'View') },
  ];

  const resourceOptions = [
    { value: 'assessment', label: t('audit.resources.assessment', 'Assessment') },
    { value: 'user', label: t('audit.resources.user', 'User') },
    { value: 'role', label: t('audit.resources.role', 'Role') },
    { value: 'permission', label: t('audit.resources.permission', 'Permission') },
  ];

  const statusOptions = [
    { value: 'success', label: t('audit.status.success', 'Success') },
    { value: 'failure', label: t('audit.status.failure', 'Failure') },
    { value: 'error', label: t('audit.status.error', 'Error') },
  ];

  return (
    <PermissionGuard resource="audit" action="read">
      <List
        title={t('audit.title', 'Audit Trail')}
        headerButtons={[
          ({ defaultButtons }) => (
            <>
              {defaultButtons}
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              >
                {t('audit.refresh', 'Refresh')}
              </Button>
            </>
          ),
        ]}
      >
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Filters */}
            <Card size="small" title={<><FilterOutlined /> {t('audit.filters', 'Filters')}</>}>
              <Space wrap>
                <Input
                  placeholder={t('audit.searchPlaceholder', 'Search by user email or name...')}
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder={t('audit.filterByAction', 'Filter by Action')}
                  value={filters.action}
                  onChange={(value) => handleFilterChange('action', value)}
                  style={{ width: 150 }}
                  allowClear
                >
                  {actionOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder={t('audit.filterByResource', 'Filter by Resource')}
                  value={filters.resource}
                  onChange={(value) => handleFilterChange('resource', value)}
                  style={{ width: 150 }}
                  allowClear
                >
                  {resourceOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder={t('audit.filterByStatus', 'Filter by Status')}
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: 120 }}
                  allowClear
                >
                  {statusOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
                <RangePicker
                  showTime
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: 400 }}
                />
                <Button onClick={handleClearFilters}>
                  {t('audit.clearFilters', 'Clear Filters')}
                </Button>
              </Space>
            </Card>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={logs}
              loading={loading}
              rowKey="id"
              pagination={{
                total: pagination.total,
                pageSize: pagination.limit,
                current: Math.floor(pagination.offset / pagination.limit) + 1,
                showSizeChanger: true,
                showTotal: (total) => t('audit.totalLogs', 'Total {{total}} logs', { total }),
              }}
              scroll={{ x: 1200 }}
            />
          </Space>
        </Card>

        {/* Details Drawer */}
        <Drawer
          title={t('audit.logDetails', 'Audit Log Details')}
          placement="right"
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {selectedLog && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t('audit.timestamp', 'Timestamp')}>
                {new Date(selectedLog.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Descriptions.Item>
              <Descriptions.Item label={t('audit.user', 'User')}>
                <Space direction="vertical" size="small">
                  {selectedLog.userName && <Text strong>{selectedLog.userName}</Text>}
                  {selectedLog.userEmail && <Text type="secondary">{selectedLog.userEmail}</Text>}
                  {selectedLog.userId && <Text code style={{ fontSize: 11 }}>{selectedLog.userId}</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t('audit.action', 'Action')}>
                <Tag color={getActionColor(selectedLog.action)}>{selectedLog.action.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('audit.resource', 'Resource')}>
                <Tag>{selectedLog.resource}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('audit.resourceId', 'Resource ID')}>
                {selectedLog.resourceId ? <Text code>{selectedLog.resourceId}</Text> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('audit.status', 'Status')}>
                <Badge status={getStatusColor(selectedLog.status) as any} text={selectedLog.status.toUpperCase()} />
              </Descriptions.Item>
              {selectedLog.errorMessage && (
                <Descriptions.Item label={t('audit.errorMessage', 'Error Message')}>
                  <Text type="danger">{selectedLog.errorMessage}</Text>
                </Descriptions.Item>
              )}
              {selectedLog.changes && (
                <Descriptions.Item label={t('audit.changes', 'Changes')}>
                  <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
              {selectedLog.metadata && (
                <Descriptions.Item label={t('audit.metadata', 'Metadata')}>
                  <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Drawer>
      </List>
    </PermissionGuard>
  );
};

export default AuditTrailList;

