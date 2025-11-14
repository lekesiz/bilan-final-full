/**
 * TreemapWidget Component
 * Hierarchical treemap visualization using Nivo
 */

import React from 'react';
import { BaseCard } from './BaseCard';
import { ResponsiveTreeMap } from '@nivo/treemap';

export interface TreemapData {
  name: string;
  value: number;
  color?: string;
  children?: TreemapData[];
}

export interface TreemapWidgetProps {
  title?: string;
  data: TreemapData;
  loading?: boolean;
  height?: number;
}

export const TreemapWidget: React.FC<TreemapWidgetProps> = ({
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

  return (
    <BaseCard padding="md" className="bg-white">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {title}
        </h3>
      )}
      <div style={{ height }}>
        <ResponsiveTreeMap
          data={data}
          identity="name"
          value="value"
          valueFormat=".02s"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.2]],
          }}
          parentLabelPosition="left"
          parentLabelTextColor={{
            from: 'color',
            modifiers: [['darker', 2]],
          }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.1]],
          }}
          animate={true}
          motionConfig="wobbly"
        />
      </div>
    </BaseCard>
  );
};

