/**
 * HeatmapWidget Component
 * Interactive heatmap visualization using Nivo
 */

import React from 'react';
import { BaseCard } from './BaseCard';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import type { HeatmapData } from '../../types/chart.types';

export interface HeatmapWidgetProps {
  title?: string;
  data: HeatmapData;
  loading?: boolean;
  height?: number;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  title,
  data,
  loading = false,
  height = 400,
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

  // Transform data for Nivo
  const nivoData = data.data.map((cell) => ({
    id: `${cell.x}-${cell.y}`,
    data: [
      {
        x: String(cell.x),
        y: String(cell.y),
        value: cell.value,
      },
    ],
  }));

  return (
    <BaseCard padding="md" className="bg-white">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {title}
        </h3>
      )}
      <div style={{ height }}>
        <ResponsiveHeatMap
          data={nivoData}
          margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
          valueFormat=">-.2s"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: '',
            legendOffset: 46,
          }}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 70,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: -72,
          }}
          colors={{
            type: 'sequential',
            scheme: 'blues',
            minValue: Math.min(...data.data.map((d) => d.value)),
            maxValue: Math.max(...data.data.map((d) => d.value)),
          }}
          emptyColor="#555"
          legends={[
            {
              anchor: 'bottom',
              translateX: 0,
              translateY: 30,
              length: 400,
              thickness: 8,
              direction: 'row',
              tickPosition: 'after',
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: '>-.2s',
              title: 'Value →',
              titleAlign: 'start',
              titleOffset: 4,
            },
          ]}
        />
      </div>
    </BaseCard>
  );
};

