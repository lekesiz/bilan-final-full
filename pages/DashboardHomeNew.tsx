/**
 * DashboardHomeNew - Modern Dashboard with New Components
 * Integration of all new dashboard widgets and components
 */

import React, { useMemo } from 'react';
import { useGetIdentity } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../src/core/components/LoadingState';
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';
import { useDashboardData } from '../src/features/dashboard/hooks/useDashboardData';
import { useDashboardStore } from '../src/features/dashboard/stores/dashboardStore';

// Widgets
import { MetricCard } from '../src/features/dashboard/components/widgets/MetricCard';
import { ChartWidget } from '../src/features/dashboard/components/widgets/ChartWidget';
import { TableWidget } from '../src/features/dashboard/components/widgets/TableWidget';
import { GaugeWidget } from '../src/features/dashboard/components/widgets/GaugeWidget';
import { SparklineWidget } from '../src/features/dashboard/components/widgets/SparklineWidget';
import { AIInsights } from '../src/features/dashboard/components/insights/AIInsights';
import { AdvancedFilterBar } from '../src/features/dashboard/components/filters/AdvancedFilterBar';
import { DashboardGridLayout } from '../src/features/dashboard/components/layouts/GridLayout';

// Icons
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  PlusOutlined 
} from '@ant-design/icons';

const DashboardHomeNew: React.FC = () => {
  const { t } = useTranslation();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const navigate = useNavigate();
  
  const {
    metrics,
    assessments,
    statusChartData,
    packageChartData,
    activityChartData,
    isLoading,
  } = useDashboardData();

  const { filters, setFilters, insights } = useDashboardStore();

  if (identityLoading || isLoading) {
    return <LoadingState message={t('dashboard.loadingDashboard', 'Loading dashboard...')} />;
  }

  // Prepare sparkline data for metric cards
  const sparklineData = useMemo(() => {
    if (!metrics.trends?.assessments) return [];
    return metrics.trends.assessments.slice(-7).map(t => t.value);
  }, [metrics.trends]);

  // Prepare table data
  const tableColumns = [
    {
      key: 'id',
      title: t('common.id', 'ID'),
      dataIndex: 'id',
      width: 100,
    },
    {
      key: 'status',
      title: t('common.status', 'Status'),
      dataIndex: 'status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          completed: 'text-emerald-600',
          in_progress: 'text-amber-600',
          abandoned: 'text-red-600',
        };
        return (
          <span className={colors[value] || 'text-neutral-600'}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'package',
      title: t('common.package', 'Package'),
      dataIndex: 'package',
    },
    {
      key: 'createdAt',
      title: t('common.createdAt', 'Created At'),
      dataIndex: 'createdAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Calculate change percentages (mock for now)
  const totalChange = 12; // Would come from comparison with previous period
  const completedChange = 8;
  const inProgressChange = -5;
  const completionRateChange = 3;

  // Widgets configuration
  const widgets = useMemo(() => [
    {
      id: 'metrics-row',
      type: 'custom' as const,
      title: 'Metrics',
      position: { x: 0, y: 0, w: 12, h: 2 },
      visible: true,
    },
    {
      id: 'status-chart',
      type: 'chart' as const,
      title: t('dashboard.statusDistribution', 'Status Distribution'),
      position: { x: 0, y: 2, w: 6, h: 4 },
      visible: true,
    },
    {
      id: 'package-chart',
      type: 'chart' as const,
      title: t('dashboard.packageDistribution', 'Package Distribution'),
      position: { x: 6, y: 2, w: 6, h: 4 },
      visible: true,
    },
    {
      id: 'activity-chart',
      type: 'chart' as const,
      title: t('dashboard.activityTrend', 'Activity Trend (Last 7 Days)'),
      position: { x: 0, y: 6, w: 8, h: 4 },
      visible: true,
    },
    {
      id: 'gauge',
      type: 'gauge' as const,
      title: t('dashboard.completionRate', 'Completion Rate'),
      position: { x: 8, y: 6, w: 4, h: 4 },
      visible: true,
    },
    {
      id: 'recent-table',
      type: 'table' as const,
      title: t('dashboard.recentAssessments', 'Recent Assessments'),
      position: { x: 0, y: 10, w: 12, h: 5 },
      visible: true,
    },
  ], [t]);

  return (
    <PermissionGuard resource="dashboard" action="read">
      <div 
        className="p-6 space-y-6 bg-neutral-bg min-h-screen"
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {t('dashboard.title', 'Dashboard')}
            </h1>
            <p className="text-neutral-500 mt-1">
              {t('dashboard.welcome', 'Welcome back')}, {identity?.name || identity?.email}
            </p>
          </div>
          <button
            onClick={() => navigate('/assessments/create')}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-800 transition-all flex items-center gap-2"
          >
            <PlusOutlined />
            {t('dashboard.newAssessment', 'New Assessment')}
          </button>
        </div>

        {/* Filters */}
        <AdvancedFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          packages={[
            { id: 'basic', name: 'Basic' },
            { id: 'standard', name: 'Standard' },
            { id: 'premium', name: 'Premium' },
          ]}
          statuses={[
            { id: 'completed', name: 'Completed' },
            { id: 'in_progress', name: 'In Progress' },
            { id: 'abandoned', name: 'Abandoned' },
          ]}
        />

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('dashboard.totalAssessments', 'Total Assessments')}
            value={metrics.totalAssessments}
            change={totalChange}
            trend={totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'neutral'}
            icon={<FileTextOutlined className="text-2xl" />}
            sparklineData={sparklineData}
            color="primary"
            format="number"
          />
          
          <MetricCard
            title={t('dashboard.completed', 'Completed')}
            value={metrics.completedAssessments}
            change={completedChange}
            trend={completedChange > 0 ? 'up' : completedChange < 0 ? 'down' : 'neutral'}
            icon={<CheckCircleOutlined className="text-2xl" />}
            color="success"
            format="number"
          />
          
          <MetricCard
            title={t('dashboard.inProgress', 'In Progress')}
            value={metrics.inProgressAssessments}
            change={inProgressChange}
            trend={inProgressChange > 0 ? 'up' : inProgressChange < 0 ? 'down' : 'neutral'}
            icon={<ClockCircleOutlined className="text-2xl" />}
            color="warning"
            format="number"
          />
          
          <MetricCard
            title={t('dashboard.completionRate', 'Completion Rate')}
            value={metrics.completionRate}
            change={completionRateChange}
            trend={completionRateChange > 0 ? 'up' : completionRateChange < 0 ? 'down' : 'neutral'}
            icon={<TrophyOutlined className="text-2xl" />}
            color="info"
            format="percentage"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title={t('dashboard.statusDistribution', 'Status Distribution')}
            type="pie"
            data={{
              data: statusChartData.map(item => ({
                id: item.name,
                label: item.name,
                value: item.value,
                color: item.color,
              })),
            }}
            config={{
              showLabels: true,
              showLegend: true,
              showTooltip: true,
            }}
          />

          <ChartWidget
            title={t('dashboard.packageDistribution', 'Package Distribution')}
            type="bar"
            data={packageChartData}
            config={{
              xKey: 'name',
              series: [{ key: 'value', name: 'Count' }],
              showLegend: false,
              showTooltip: true,
              colors: ['#667eea'],
            }}
          />
        </div>

        {/* Activity & Gauge Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartWidget
              title={t('dashboard.activityTrend', 'Activity Trend (Last 7 Days)')}
              type="line"
              data={activityChartData}
              config={{
                xKey: 'label',
                series: [
                  { key: 'count', name: 'Assessments', color: '#667eea' },
                ],
                showGrid: true,
                showTooltip: true,
                showLegend: false,
              }}
              height={300}
            />
          </div>
          
          <GaugeWidget
            title={t('dashboard.completionRate', 'Completion Rate')}
            value={metrics.completionRate}
            max={100}
            min={0}
            unit="%"
            color="primary"
            size="lg"
          />
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              {t('dashboard.aiInsights', 'AI Insights')}
            </h2>
            <AIInsights insights={insights} />
          </div>
        )}

        {/* Recent Assessments Table */}
        <TableWidget
          title={t('dashboard.recentAssessments', 'Recent Assessments')}
          columns={tableColumns}
          data={assessments.slice(0, 10)}
          pagination={false}
          sortable
          searchable
          exportable
          onRowClick={(record) => navigate(`/assessments/show/${record.id}`)}
        />
      </div>
    </PermissionGuard>
  );
};

export default DashboardHomeNew;

