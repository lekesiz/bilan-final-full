/**
 * Chart Types
 * Type definitions for chart visualizations
 */

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  colors?: string[];
  theme?: 'light' | 'dark';
  animation?: boolean;
  responsive?: boolean;
}

export interface LineChartData {
  series: LineSeries[];
  xAxis?: {
    label?: string;
    format?: (value: any) => string;
  };
  yAxis?: {
    label?: string;
    format?: (value: any) => string;
  };
}

export interface LineSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface BarChartData {
  categories: string[];
  series: BarSeries[];
  stacked?: boolean;
  horizontal?: boolean;
}

export interface BarSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface PieChartData {
  data: PieDataPoint[];
  innerRadius?: number; // For donut charts
  showLabels?: boolean;
  showLegend?: boolean;
}

export interface PieDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface HeatmapData {
  data: HeatmapCell[];
  xCategories: string[];
  yCategories: string[];
  colorScale?: {
    min: string;
    max: string;
  };
}

export interface HeatmapCell {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

export interface SparklineData {
  data: number[];
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
  showPoints?: boolean;
}

