/**
 * AIInsights Component
 * AI-powered insights, recommendations, and anomaly detection
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard } from '../widgets/BaseCard';
import { Button } from '../controls/Button';
import { 
  BulbOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  InfoCircleOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import type { DashboardInsight } from '../../types/dashboard.types';

export interface AIInsightsProps {
  insights: DashboardInsight[];
  loading?: boolean;
  onInsightClick?: (insight: DashboardInsight) => void;
}

const insightIcons = {
  anomaly: WarningOutlined,
  recommendation: BulbOutlined,
  prediction: InfoCircleOutlined,
  comparison: CheckCircleOutlined,
};

const insightColors = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-900',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-900',
  },
};

export const AIInsights: React.FC<AIInsightsProps> = ({
  insights,
  loading = false,
  onInsightClick,
}) => {
  if (loading) {
    return (
      <BaseCard padding="md">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </BaseCard>
    );
  }

  if (insights.length === 0) {
    return (
      <BaseCard padding="md" className="text-center">
        <InfoCircleOutlined className="text-4xl text-neutral-400 mb-2" />
        <p className="text-neutral-500">
          No insights available at this time.
        </p>
      </BaseCard>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => {
        const Icon = insightIcons[insight.type] || InfoCircleOutlined;
        const colors = insightColors[insight.severity || 'info'];

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BaseCard
              className={`${colors.bg} ${colors.border} border-l-4`}
              padding="md"
              hover={!!onInsightClick}
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <Icon className={`text-xl ${colors.icon}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${colors.text}`}>
                      {insight.title}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${colors.text} opacity-80 mb-2`}>
                    {insight.message}
                  </p>
                  
                  {insight.actionUrl && insight.actionLabel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowRightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (insight.actionUrl) {
                          window.location.href = insight.actionUrl;
                        }
                      }}
                      className={colors.text}
                    >
                      {insight.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </BaseCard>
          </motion.div>
        );
      })}
    </div>
  );
};

