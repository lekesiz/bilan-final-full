/**
 * GridLayout Component
 * Drag & drop grid layout for dashboard widgets
 */

import React, { useState, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/resizable.css';
import { BaseCard } from '../widgets/BaseCard';
import { Button } from '../controls/Button';
import { SaveOutlined, ReloadOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { Widget } from '../../types/widget.types';

export interface GridLayoutProps {
  widgets: Widget[];
  onLayoutChange?: (layout: Layout[]) => void;
  onWidgetUpdate?: (widgetId: string, updates: Partial<Widget>) => void;
  editable?: boolean;
  cols?: number;
  rowHeight?: number;
  margin?: [number, number];
}

export const DashboardGridLayout: React.FC<GridLayoutProps> = ({
  widgets,
  onLayoutChange,
  onWidgetUpdate,
  editable = true,
  cols = 12,
  rowHeight = 60,
  margin = [16, 16],
}) => {
  const { isEditing, toggleEditing, setSelectedWidget } = useDashboardStore();
  const [localLayout, setLocalLayout] = useState<Layout[]>(() =>
    widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: widget.position.minW || 2,
      minH: widget.position.minH || 2,
      maxW: widget.position.maxW || cols,
      maxH: widget.position.maxH || 20,
    }))
  );

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      setLocalLayout(layout);
      
      // Update widget positions
      layout.forEach((item) => {
        const widget = widgets.find((w) => w.id === item.i);
        if (widget && onWidgetUpdate) {
          onWidgetUpdate(item.i, {
            position: {
              ...widget.position,
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            },
          });
        }
      });

      onLayoutChange?.(layout);
    },
    [widgets, onLayoutChange, onWidgetUpdate]
  );

  const handleSave = () => {
    // Save layout to store or API
    toggleEditing();
  };

  const handleReset = () => {
    // Reset to default layout
    const defaultLayout = widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: widget.position.minW || 2,
      minH: widget.position.minH || 2,
      maxW: widget.position.maxW || cols,
      maxH: widget.position.maxH || 20,
    }));
    setLocalLayout(defaultLayout);
    handleLayoutChange(defaultLayout);
  };

  return (
    <div className="relative">
      {/* Edit Controls */}
      {editable && (
        <div className="mb-4 flex items-center justify-end gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              icon={<EditOutlined />}
              onClick={toggleEditing}
            >
              Edit Layout
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckOutlined />}
                onClick={handleSave}
              >
                Save Layout
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditing}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}

      {/* Grid Layout */}
      <GridLayout
        className="layout"
        layout={localLayout}
        onLayoutChange={handleLayoutChange}
        cols={cols}
        rowHeight={rowHeight}
        width={typeof window !== 'undefined' ? window.innerWidth - 64 : 1200}
        margin={margin}
        isDraggable={isEditing && editable}
        isResizable={isEditing && editable}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-container">
            <BaseCard
              className={`h-full ${isEditing ? 'border-2 border-dashed border-primary-500' : ''}`}
              padding="md"
            >
              {/* Drag Handle (only visible when editing) */}
              {isEditing && (
                <div className="drag-handle cursor-move mb-2 p-2 bg-primary-100 rounded flex items-center justify-center">
                  <span className="text-primary-600 text-sm">
                    ⋮⋮ Drag to move
                  </span>
                </div>
              )}

              {/* Widget Content */}
              <div
                onClick={() => !isEditing && setSelectedWidget(widget.id)}
                className={isEditing ? 'pointer-events-none' : ''}
              >
                {widget.visible !== false && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{widget.title}</h4>
                    {widget.description && (
                      <p className="text-sm text-neutral-500 mb-4">
                        {widget.description}
                      </p>
                    )}
                    {/* Widget content will be rendered here by parent */}
                  </div>
                )}
              </div>
            </BaseCard>
          </div>
        ))}
      </GridLayout>

      {/* Empty State */}
      {widgets.length === 0 && (
        <BaseCard padding="lg" className="text-center">
          <p className="text-neutral-500">
            No widgets added yet. Add widgets to get started.
          </p>
        </BaseCard>
      )}
    </div>
  );
};

