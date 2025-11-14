/**
 * useDashboardData Hook
 * Custom hook for fetching and managing dashboard data
 */

import { useMemo } from 'react';
import { useList } from '@refinedev/core';
import { useDashboardStore } from '../stores/dashboardStore';
import type { DashboardMetrics, TrendData } from '../types/dashboard.types';

export const useDashboardData = () => {
  const { setMetrics, setMetricsLoading, setMetricsError } = useDashboardStore();
  
  const { data: assessmentsData, isLoading, isError } = useList({
    resource: 'assessments',
    pagination: {
      pageSize: 1000, // Get all for analytics
    },
  });

  const assessments = assessmentsData?.data || [];

  const metrics: DashboardMetrics = useMemo(() => {
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter((a: any) => a.status === 'completed').length;
    const inProgressAssessments = assessments.filter((a: any) => a.status === 'in_progress').length;
    const completionRate = totalAssessments > 0 
      ? Math.round((completedAssessments / totalAssessments) * 100) 
      : 0;

    // Calculate trends (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyData = assessments
      .filter((a: any) => new Date(a.createdAt) >= thirtyDaysAgo)
      .reduce((acc: Record<string, number>, assessment: any) => {
        const date = new Date(assessment.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    const trends: TrendData[] = Object.entries(dailyData)
      .map(([date, value]) => ({ date, value: value as number }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAssessments,
      completedAssessments,
      inProgressAssessments,
      completionRate,
      trends: {
        assessments: trends,
        completion: trends, // Simplified for now
        packages: trends, // Simplified for now
      },
    };
  }, [assessments]);

  // Update store
  useMemo(() => {
    if (isLoading) {
      setMetricsLoading(true);
    } else if (isError) {
      setMetricsError('Failed to load dashboard data');
      setMetricsLoading(false);
    } else {
      setMetrics(metrics);
      setMetricsLoading(false);
      setMetricsError(null);
    }
  }, [isLoading, isError, metrics, setMetrics, setMetricsLoading, setMetricsError]);

  // Chart data
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
      const pkg = assessment.package || assessment.pkg || 'unknown';
      acc[pkg] = (acc[pkg] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(packageCounts).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  }, [assessments]);

  const activityChartData = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = assessments.filter((a: any) => {
        const assessmentDate = new Date(a.createdAt).toISOString().split('T')[0];
        return assessmentDate === date;
      }).length;

      return {
        date,
        count,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      };
    });
  }, [assessments]);

  return {
    metrics,
    assessments,
    statusChartData,
    packageChartData,
    activityChartData,
    isLoading,
    isError,
  };
};

