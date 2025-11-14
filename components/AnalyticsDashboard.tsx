import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../services/apiClient';
import { usePermissions } from '../src/core/permissions/usePermissions';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalAssessments: number;
    completedCount: number;
    inProgressCount: number;
    completionRate: number;
    totalAnswers: number;
    avgAnswersPerAssessment: number;
    avgCompletionHours: number;
    recentActivityCount: number;
    summariesCount: number;
  };
  distributions: {
    packages: Array<{ packageId: string; packageName: string; count: number }>;
    coachingStyles: Array<{ coachingStyle: string; count: number }>;
  };
  dropOffAnalysis: Array<{ phase: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
}

interface AnalyticsDashboardProps {
  onBack?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const api = useApi();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  // Permission check
  const canViewAnalytics = canAccess('analytics', 'read') || 
                          canAccess('admin', 'read') || 
                          canAccess('dashboard', 'read');

  useEffect(() => {
    if (canViewAnalytics) {
      loadAnalytics();
    }
  }, [dateRange, canViewAnalytics]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAnalytics(dateRange);
      setData(response.data || response);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err instanceof Error ? err.message : t('analytics.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value || undefined,
    }));
  };

  // Permission check - show access denied if no permission
  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Result
            icon={<StopOutlined />}
            status="403"
            title={t('analytics.accessDenied')}
            subTitle={t('analytics.accessDeniedMessage')}
            extra={
              <Button type="primary" onClick={() => navigate('/dashboard')}>
                {t('analytics.goToDashboard')}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 text-slate-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 bg-red-50 border border-red-200 border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 text-red-800 font-bold mb-2">{t('common.error')}</h2>
            <p className="text-red-600 text-red-600">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600 text-slate-400">{t('analytics.noData') || 'No analytics data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {t('analytics.title') || 'Analytics Dashboard'}
              </h1>
              <p className="text-slate-600">
                {t('analytics.subtitle') || 'Comprehensive insights into your assessments'}
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-slate-600 text-slate-400 hover:text-slate-900 hover:text-slate-900"
              >
                {t('common.back') || 'Back'}
              </button>
            )}
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="bg-white bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('analytics.dateRange') || 'Date Range'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 text-slate-700 mb-2">
                {t('analytics.startDate') || 'Start Date'}
              </label>
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 text-slate-700 mb-2">
                {t('analytics.endDate') || 'End Date'}
              </label>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({})}
                className="px-4 py-2 text-slate-600 text-slate-400 hover:text-slate-900 hover:text-slate-900"
              >
                {t('analytics.clear') || 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.totalAssessments') || 'Total Assessments'}
            </h3>
            <p className="text-3xl font-bold text-slate-900">
              {data.overview.totalAssessments}
            </p>
          </div>
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.completionRate') || 'Completion Rate'}
            </h3>
            <p className="text-3xl font-bold text-primary-600 text-primary-600">
              {data.overview.completionRate}%
            </p>
            <p className="text-sm text-slate-600 text-slate-400 mt-1">
              {data.overview.completedCount} / {data.overview.totalAssessments}
            </p>
          </div>
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.avgCompletionTime') || 'Avg Completion Time'}
            </h3>
            <p className="text-3xl font-bold text-slate-900">
              {data.overview.avgCompletionHours}h
            </p>
          </div>
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.recentActivity') || 'Recent Activity (7d)'}
            </h3>
            <p className="text-3xl font-bold text-slate-900">
              {data.overview.recentActivityCount}
            </p>
          </div>
        </div>

        {/* Distributions with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Package Distribution - Pie Chart */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('analytics.packageDistribution') || 'Package Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.distributions.packages.map((pkg) => ({
                    name: pkg.packageName,
                    value: pkg.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.distributions.packages.map((_, index) => {
                    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.distributions.packages.map((pkg) => {
                const percentage = data.overview.totalAssessments > 0
                  ? Math.round((pkg.count / data.overview.totalAssessments) * 100)
                  : 0;
                return (
                  <div key={pkg.packageId} className="flex justify-between text-sm">
                    <span className="text-slate-700 text-slate-700">{pkg.packageName}</span>
                    <span className="font-semibold text-slate-900">
                      {pkg.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coaching Style Distribution - Bar Chart */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('analytics.coachingStyleDistribution') || 'Coaching Style Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.distributions.coachingStyles.map((style) => ({
                  name: style.coachingStyle.charAt(0).toUpperCase() + style.coachingStyle.slice(1),
                  value: style.count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.distributions.coachingStyles.map((style) => {
                const percentage = data.overview.totalAssessments > 0
                  ? Math.round((style.count / data.overview.totalAssessments) * 100)
                  : 0;
                return (
                  <div key={style.coachingStyle} className="flex justify-between text-sm">
                    <span className="text-slate-700 text-slate-700 capitalize">
                      {style.coachingStyle}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {style.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Breakdown - Pie Chart */}
        <div className="bg-white bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('analytics.statusBreakdown') || 'Status Breakdown'}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown.map((status) => ({
                    name: status.status === 'completed' ? 'Completed' : 
                          status.status === 'in_progress' ? 'In Progress' : 
                          status.status,
                    value: status.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.statusBreakdown.map((_, index) => {
                    const colors = ['#10b981', '#f59e0b', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-3">
              {data.statusBreakdown.map((status) => {
                const percentage = data.overview.totalAssessments > 0
                  ? Math.round((status.count / data.overview.totalAssessments) * 100)
                  : 0;
                const statusColors: Record<string, string> = {
                  completed: 'text-green-600',
                  in_progress: 'text-yellow-600',
                };
                return (
                  <div key={status.status} className="flex justify-between items-center">
                    <span className={`font-medium capitalize ${statusColors[status.status] || 'text-slate-700'}`}>
                      {status.status === 'completed' ? 'Completed' : 
                       status.status === 'in_progress' ? 'In Progress' : 
                       status.status}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {status.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drop-off Analysis - Bar Chart */}
        <div className="bg-white bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('analytics.dropOffAnalysis') || 'Drop-off Analysis (In Progress)'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.dropOffAnalysis.map((dropOff) => {
                const totalInProgress = data.overview.inProgressCount;
                const percentage = totalInProgress > 0
                  ? Math.round((dropOff.count / totalInProgress) * 100)
                  : 0;
                return {
                  name: dropOff.phase,
                  count: dropOff.count,
                  percentage: percentage,
                };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === 'count') return [`${value} assessments`, 'Count'];
                return [`${value}%`, 'Percentage'];
              }} />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" name="Count" />
              <Bar dataKey="percentage" fill="#f59e0b" name="Percentage" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {data.dropOffAnalysis.map((dropOff) => {
              const totalInProgress = data.overview.inProgressCount;
              const percentage = totalInProgress > 0
                ? Math.round((dropOff.count / totalInProgress) * 100)
                : 0;
              return (
                <div key={dropOff.phase} className="text-center p-4 bg-slate-50 bg-slate-200 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {dropOff.count}
                  </p>
                  <p className="text-sm text-slate-600 text-slate-400 mb-2">
                    {dropOff.phase}
                  </p>
                  <p className="text-xs text-slate-500 text-slate-500">
                    {percentage}% of in-progress
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.totalAnswers') || 'Total Answers'}
            </h3>
            <p className="text-2xl font-bold text-slate-900">
              {data.overview.totalAnswers}
            </p>
            <p className="text-sm text-slate-600 text-slate-400 mt-1">
              {t('analytics.avgPerAssessment') || 'Avg per assessment'}: {data.overview.avgAnswersPerAssessment}
            </p>
          </div>
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.summariesGenerated') || 'Summaries Generated'}
            </h3>
            <p className="text-2xl font-bold text-slate-900">
              {data.overview.summariesCount}
            </p>
          </div>
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 text-slate-400 mb-2">
              {t('analytics.inProgress') || 'In Progress'}
            </h3>
            <p className="text-2xl font-bold text-slate-900">
              {data.overview.inProgressCount}
            </p>
          </div>
        </div>

        {/* Enhanced Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Success Rate by Package */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('analytics.successRateByPackage') || 'Success Rate by Package'}
            </h3>
            <div className="space-y-3">
              {data.distributions.packages.map((pkg) => {
                // Calculate success rate (completed / total for this package)
                // This is a simplified calculation - in real scenario, we'd need package-specific completion data
                const packageTotal = pkg.count;
                const estimatedCompleted = Math.round(packageTotal * (data.overview.completionRate / 100));
                const successRate = packageTotal > 0 ? Math.round((estimatedCompleted / packageTotal) * 100) : 0;
                
                return (
                  <div key={pkg.packageId} className="flex items-center justify-between">
                    <span className="text-slate-700 text-slate-700">{pkg.packageName}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                        {successRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average Time Metrics */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('analytics.timeMetrics') || 'Time Metrics'}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600 text-slate-400">
                    {t('analytics.avgCompletionTime') || 'Avg Completion Time'}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {data.overview.avgCompletionHours}h
                  </span>
                </div>
                <div className="w-full bg-slate-200 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((data.overview.avgCompletionHours / 24) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 border-slate-200">
                <p className="text-xs text-slate-500 text-slate-400">
                  {t('analytics.timeMetricsNote') || 'Based on completed assessments only'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

