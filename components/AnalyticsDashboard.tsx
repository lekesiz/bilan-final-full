import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../services/apiClient';
import { usePermissions } from '../src/core/permissions/usePermissions';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';

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
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Result
            icon={<StopOutlined />}
            status="403"
            title="Access Denied"
            subTitle="You don't have permission to view analytics."
            extra={
              <Button type="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-red-800 dark:text-red-200 font-bold mb-2">{t('common.error')}</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
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
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('analytics.title') || 'Analytics Dashboard'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t('analytics.subtitle') || 'Comprehensive insights into your assessments'}
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {t('common.back') || 'Back'}
              </button>
            )}
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('analytics.dateRange') || 'Date Range'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('analytics.startDate') || 'Start Date'}
              </label>
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('analytics.endDate') || 'End Date'}
              </label>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({})}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {t('analytics.clear') || 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.totalAssessments') || 'Total Assessments'}
            </h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.totalAssessments}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.completionRate') || 'Completion Rate'}
            </h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {data.overview.completionRate}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {data.overview.completedCount} / {data.overview.totalAssessments}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.avgCompletionTime') || 'Avg Completion Time'}
            </h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.avgCompletionHours}h
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.recentActivity') || 'Recent Activity (7d)'}
            </h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.recentActivityCount}
            </p>
          </div>
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Package Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {t('analytics.packageDistribution') || 'Package Distribution'}
            </h3>
            <div className="space-y-3">
              {data.distributions.packages.map((pkg) => {
                const percentage = data.overview.totalAssessments > 0
                  ? Math.round((pkg.count / data.overview.totalAssessments) * 100)
                  : 0;
                return (
                  <div key={pkg.packageId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{pkg.packageName}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {pkg.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coaching Style Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {t('analytics.coachingStyleDistribution') || 'Coaching Style Distribution'}
            </h3>
            <div className="space-y-3">
              {data.distributions.coachingStyles.map((style) => {
                const percentage = data.overview.totalAssessments > 0
                  ? Math.round((style.count / data.overview.totalAssessments) * 100)
                  : 0;
                return (
                  <div key={style.coachingStyle}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300 capitalize">
                        {style.coachingStyle}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {style.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('analytics.dropOffAnalysis') || 'Drop-off Analysis (In Progress)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.dropOffAnalysis.map((dropOff) => {
              const totalInProgress = data.overview.inProgressCount;
              const percentage = totalInProgress > 0
                ? Math.round((dropOff.count / totalInProgress) * 100)
                : 0;
              return (
                <div key={dropOff.phase} className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {dropOff.count}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {dropOff.phase}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {percentage}% of in-progress
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.totalAnswers') || 'Total Answers'}
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.totalAnswers}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('analytics.avgPerAssessment') || 'Avg per assessment'}: {data.overview.avgAnswersPerAssessment}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.summariesGenerated') || 'Summaries Generated'}
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.summariesCount}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t('analytics.inProgress') || 'In Progress'}
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.overview.inProgressCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

