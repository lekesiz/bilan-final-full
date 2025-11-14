/**
 * Dashboard Types
 * Type definitions for the new dashboard system
 */

export interface DashboardConfig {
  id: string;
  name: string;
  layout: DashboardLayout;
  widgets: Widget[];
  filters: FilterConfig;
  theme?: 'light' | 'dark' | 'auto';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  type: 'grid' | 'masonry' | 'custom';
  columns: number;
  gap: number;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

export interface FilterConfig {
  dateRange?: {
    start: Date;
    end: Date;
  };
  packages?: string[];
  statuses?: string[];
  users?: string[];
  search?: string;
  savedFilters?: SavedFilter[];
}

export interface SavedFilter {
  id: string;
  name: string;
  config: FilterConfig;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  completionRate: number;
  averageCompletionTime?: number;
  trends?: {
    assessments: TrendData[];
    completion: TrendData[];
    packages: TrendData[];
  };
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface DashboardInsight {
  id: string;
  type: 'anomaly' | 'recommendation' | 'prediction' | 'comparison';
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
}

