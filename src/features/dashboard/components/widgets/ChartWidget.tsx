/**
 * ChartWidget Component
 * Advanced chart widget with multiple chart types
 */

import React from 'react';
import { BaseCard } from './BaseCard';
import type { ChartType, WidgetConfig } from '../../types/widget.types';
import type { LineChartData, BarChartData, PieChartData } from '../../types/chart.types';

// Recharts components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartWidgetProps {
  title?: string;
  type: ChartType;
  data: any;
  config?: WidgetConfig['chart'];
  loading?: boolean;
  height?: number;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  type,
  data,
  config,
  loading = false,
  height = 300,
}) => {
  if (loading) {
    return (
      <BaseCard padding="md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </BaseCard>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              {config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={config?.xKey || 'x'} />
              <YAxis />
              {config?.showTooltip !== false && <Tooltip />}
              {config?.showLegend !== false && <Legend />}
              {config?.series?.map((series, index) => (
                <Line
                  key={series.key || index}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color || config?.colors?.[index] || '#667eea'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  animationDuration={config?.animation !== false ? 1000 : 0}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              {config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={config?.xKey || 'x'} />
              <YAxis />
              {config?.showTooltip !== false && <Tooltip />}
              {config?.showLegend !== false && <Legend />}
              {config?.series?.map((series, index) => (
                <Area
                  key={series.key || index}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color || config?.colors?.[index] || '#667eea'}
                  fill={series.color || config?.colors?.[index] || '#667eea'}
                  fillOpacity={0.6}
                  animationDuration={config?.animation !== false ? 1000 : 0}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              {config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={config?.xKey || 'x'} />
              <YAxis />
              {config?.showTooltip !== false && <Tooltip />}
              {config?.showLegend !== false && <Legend />}
              {config?.series?.map((series, index) => (
                <Bar
                  key={series.key || index}
                  dataKey={series.key}
                  name={series.name}
                  fill={series.color || config?.colors?.[index] || '#667eea'}
                  animationDuration={config?.animation !== false ? 1000 : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        const pieData = data as PieChartData;
        const innerRadius = type === 'donut' ? (config?.innerRadius || 60) : 0;
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={config?.showLabels !== false ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                outerRadius={80}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                animationDuration={config?.animation !== false ? 1000 : 0}
              >
                {pieData.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || config?.colors?.[index] || '#667eea'}
                  />
                ))}
              </Pie>
              {config?.showTooltip !== false && <Tooltip />}
              {config?.showLegend !== false && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            Chart type "{type}" not yet implemented
          </div>
        );
    }
  };

  return (
    <BaseCard padding="md" className="bg-white">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {title}
        </h3>
      )}
      {renderChart()}
    </BaseCard>
  );
};

