/**
 * SparklineWidget Component
 * Mini sparkline chart for trend visualization
 */

import React from 'react';
import { BaseCard } from './BaseCard';
import type { SparklineData } from '../../types/chart.types';

export interface SparklineWidgetProps {
  title?: string;
  data: SparklineData | number[];
  color?: string;
  showArea?: boolean;
  showPoints?: boolean;
  height?: number;
  loading?: boolean;
}

export const SparklineWidget: React.FC<SparklineWidgetProps> = ({
  title,
  data,
  color = '#667eea',
  showArea = true,
  showPoints = false,
  height = 60,
  loading = false,
}) => {
  const sparklineData = Array.isArray(data) ? data : data.data;
  const sparklineColor = Array.isArray(data) ? color : (data.color || color);
  const showAreaFill = Array.isArray(data) ? showArea : (data.showArea !== false);
  const showDataPoints = Array.isArray(data) ? showPoints : (data.showPoints || false);

  if (loading || !sparklineData || sparklineData.length === 0) {
    return (
      <BaseCard padding="sm">
        <div className="animate-pulse h-16 bg-neutral-200 rounded"></div>
      </BaseCard>
    );
  }

  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData.map((value, index) => {
    const x = (index / (sparklineData.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y, value };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${pathData} L 100,100 L 0,100 Z`;

  return (
    <BaseCard padding="sm" className="bg-transparent border-0 shadow-none">
      {title && (
        <h4 className="text-sm font-medium text-neutral-700 mb-2">
          {title}
        </h4>
      )}
      <div style={{ height, width: '100%' }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Area fill */}
          {showAreaFill && (
            <path
              d={areaPath}
              fill={sparklineColor}
              fillOpacity="0.2"
            />
          )}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {showDataPoints && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={sparklineColor}
            />
          ))}
        </svg>
      </div>
    </BaseCard>
  );
};

