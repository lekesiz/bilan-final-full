/**
 * Widget Types
 * Type definitions for dashboard widgets
 */

import { ReactNode } from 'react';

export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'map'
  | 'timeline'
  | 'heatmap'
  | 'gauge'
  | 'sparkline'
  | 'insight'
  | 'custom';

export type ChartType = 
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'heatmap'
  | 'treemap'
  | 'sankey'
  | 'funnel';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: string;
  visible?: boolean;
  order?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  // Metric widget
  metric?: {
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    format?: 'number' | 'currency' | 'percentage' | 'duration';
    sparkline?: boolean;
  };
  
  // Chart widget
  chart?: {
    type: ChartType;
    data: any[];
    xKey?: string;
    yKey?: string;
    series?: ChartSeries[];
    colors?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    showGrid?: boolean;
    zoom?: boolean;
    animation?: boolean;
  };
  
  // Table widget
  table?: {
    columns: TableColumn[];
    data: any[];
    pagination?: boolean;
    pageSize?: number;
    sortable?: boolean;
    filterable?: boolean;
    exportable?: boolean;
  };
  
  // Custom widget
  custom?: {
    component: string;
    props?: Record<string, any>;
  };
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any) => ReactNode;
}

export interface WidgetMenuAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

