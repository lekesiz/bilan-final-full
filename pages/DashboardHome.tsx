import React, { useMemo } from 'react';
import { useGetIdentity, useList } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../src/core/components/LoadingState';
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
  LineChart,
  Line,
} from 'recharts';

const DashboardHome: React.FC = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const navigate = useNavigate();
  
  const { data: assessmentsData, isLoading: assessmentsLoading, isError: assessmentsError } = useList({
    resource: 'assessments',
    pagination: {
      pageSize: 100,
    },
  });

  if (identityLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const assessments = assessmentsData?.data || [];
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter((a: any) => a.status === 'completed').length;
  const inProgressAssessments = assessments.filter((a: any) => a.status === 'in_progress').length;
  const completionRate = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

  // Chart data preparation
  const statusChartData = useMemo(() => {
    const statusCounts = assessments.reduce((acc: any, assessment: any) => {
      const status = assessment.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Completed', value: statusCounts.completed || 0, color: '#10b981' },
      { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#f59e0b' },
      { name: 'Abandoned', value: statusCounts.abandoned || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [assessments]);

  const packageChartData = useMemo(() => {
    const packageCounts = assessments.reduce((acc: any, assessment: any) => {
      const pkg = assessment.packageName || 'Unknown';
      acc[pkg] = (acc[pkg] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(packageCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [assessments]);

  const recentActivityData = useMemo(() => {
    // Get last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = assessments.filter((a: any) => {
        const assessmentDate = new Date(a.startedAt || a.createdAt || 0).toISOString().split('T')[0];
        return assessmentDate === date;
      }).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      };
    });
  }, [assessments]);

  // Icon components
  const FileIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const PlayIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ListIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div 
      className="w-full min-h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      style={{
        margin: '-24px',
        padding: '24px',
        minHeight: 'calc(100vh - 64px)',
        boxSizing: 'border-box',
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-2">
            Welcome back, {identity?.name || 'User'}! 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Here's an overview of your assessments and activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assessments */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileIcon />
              </div>
              {assessmentsLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Assessments</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalAssessments}</p>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CheckIcon />
              </div>
              {assessmentsLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Completed</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedAssessments}</p>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <ClockIcon />
              </div>
              {assessmentsLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">In Progress</h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{inProgressAssessments}</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <ChartIcon />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Completion Rate</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{completionRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {completedAssessments} of {totalAssessments}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution - Pie Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">Status Distribution</h2>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-500">
                No data available
              </div>
            )}
          </div>

          {/* Package Distribution - Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">Package Distribution</h2>
            {packageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={packageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400 dark:text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">Activity Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={recentActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Assessments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/bilan')}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              >
                <PlayIcon />
                Start New Assessment
              </button>
              <button
                onClick={() => navigate('/assessments')}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all transform hover:scale-[1.02]"
              >
                <ListIcon />
                View All Assessments
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all transform hover:scale-[1.02]"
              >
                <AnalyticsIcon />
                View Analytics
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-6">Recent Activity</h2>
            {assessmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <FileIcon />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No recent activity</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Start your first assessment to see activity here!</p>
                <button
                  onClick={() => navigate('/bilan')}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 5).map((assessment: any, index: number) => (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {assessment.userName || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(assessment.startedAt || assessment.createdAt || new Date()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        assessment.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : assessment.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {assessment.status || 'pending'}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {assessment.packageName || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
                {assessments.length > 5 && (
                  <button
                    onClick={() => navigate('/assessments')}
                    className="w-full mt-4 text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-2"
                  >
                    View all assessments →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

