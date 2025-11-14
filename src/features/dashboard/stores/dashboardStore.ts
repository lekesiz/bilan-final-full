/**
 * Dashboard Store (Zustand)
 * Global state management for dashboard
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { DashboardConfig, DashboardMetrics, DashboardInsight } from '../types/dashboard.types';
import type { Widget } from '../types/widget.types';

interface DashboardState {
  // Current dashboard
  currentDashboard: DashboardConfig | null;
  dashboards: DashboardConfig[];
  
  // Metrics
  metrics: DashboardMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;
  
  // Insights
  insights: DashboardInsight[];
  insightsLoading: boolean;
  
  // Widgets
  widgets: Widget[];
  
  // Filters
  filters: DashboardConfig['filters'];
  
  // UI State
  isFullscreen: boolean;
  isEditing: boolean;
  selectedWidget: string | null;
  
  // Actions
  setCurrentDashboard: (dashboard: DashboardConfig) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setMetricsLoading: (loading: boolean) => void;
  setMetricsError: (error: string | null) => void;
  setInsights: (insights: DashboardInsight[]) => void;
  addInsight: (insight: DashboardInsight) => void;
  removeInsight: (id: string) => void;
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  setFilters: (filters: DashboardConfig['filters']) => void;
  toggleFullscreen: () => void;
  toggleEditing: () => void;
  setSelectedWidget: (id: string | null) => void;
  resetDashboard: () => void;
}

const initialState = {
  currentDashboard: null,
  dashboards: [],
  metrics: null,
  metricsLoading: false,
  metricsError: null,
  insights: [],
  insightsLoading: false,
  widgets: [],
  filters: {},
  isFullscreen: false,
  isEditing: false,
  selectedWidget: null,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
        
        setMetrics: (metrics) => set({ metrics, metricsError: null }),
        setMetricsLoading: (loading) => set({ metricsLoading: loading }),
        setMetricsError: (error) => set({ metricsError: error }),
        
        setInsights: (insights) => set({ insights }),
        addInsight: (insight) => set((state) => ({ 
          insights: [...state.insights, insight] 
        })),
        removeInsight: (id) => set((state) => ({ 
          insights: state.insights.filter(i => i.id !== id) 
        })),
        
        setWidgets: (widgets) => set({ widgets }),
        addWidget: (widget) => set((state) => ({ 
          widgets: [...state.widgets, widget] 
        })),
        updateWidget: (id, updates) => set((state) => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, ...updates } : w
          )
        })),
        removeWidget: (id) => set((state) => ({ 
          widgets: state.widgets.filter(w => w.id !== id) 
        })),
        
        setFilters: (filters) => set({ filters }),
        
        toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
        toggleEditing: () => set((state) => ({ isEditing: !state.isEditing })),
        setSelectedWidget: (id) => set({ selectedWidget: id }),
        
        resetDashboard: () => set(initialState),
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({
          currentDashboard: state.currentDashboard,
          dashboards: state.dashboards,
          widgets: state.widgets,
          filters: state.filters,
        }),
      }
    ),
    { name: 'DashboardStore' }
  )
);

