/**
 * GaugeWidget Component
 * Circular gauge/progress indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard } from './BaseCard';
import { formatNumber } from '../../utils/formatters';

export interface GaugeWidgetProps {
  title?: string;
  value: number;
  max?: number;
  min?: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  loading?: boolean;
}

const colorConfig = {
  primary: {
    gradient: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-100',
    text: 'text-primary-600',
  },
  success: {
    gradient: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  warning: {
    gradient: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  danger: {
    gradient: 'from-red-500 to-red-700',
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
};

const sizeConfig = {
  sm: { size: 120, stroke: 8, fontSize: 'text-2xl' },
  md: { size: 160, stroke: 10, fontSize: 'text-3xl' },
  lg: { size: 200, stroke: 12, fontSize: 'text-4xl' },
};

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({
  title,
  value,
  max = 100,
  min = 0,
  unit = '%',
  color = 'primary',
  size = 'md',
  showValue = true,
  loading = false,
}) => {
  const config = colorConfig[color];
  const sizeProps = sizeConfig[size];
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const circumference = 2 * Math.PI * (sizeProps.size / 2 - sizeProps.stroke);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <BaseCard padding="md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-32 bg-neutral-200 rounded-full"></div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard padding="md" className="bg-white">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <div className="flex flex-col items-center justify-center">
        <div className="relative" style={{ width: sizeProps.size, height: sizeProps.size }}>
          {/* Background circle */}
          <svg
            className="transform -rotate-90"
            width={sizeProps.size}
            height={sizeProps.size}
          >
            <circle
              cx={sizeProps.size / 2}
              cy={sizeProps.size / 2}
              r={sizeProps.size / 2 - sizeProps.stroke}
              fill="none"
              stroke="currentColor"
              strokeWidth={sizeProps.stroke}
              className="text-neutral-200"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx={sizeProps.size / 2}
              cy={sizeProps.size / 2}
              r={sizeProps.size / 2 - sizeProps.stroke}
              fill="none"
              stroke="url(#gauge-gradient)"
              strokeWidth={sizeProps.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" className={config.text} />
                <stop offset="100%" stopColor="currentColor" className={config.text} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Value display */}
          {showValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`font-bold ${sizeProps.fontSize} ${config.text}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {formatNumber(value, 'number')}
              </motion.span>
              {unit && (
                <span className={`text-sm ${config.text} opacity-70`}>{unit}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Min/Max labels */}
        <div className="flex justify-between w-full mt-4 text-xs text-neutral-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </BaseCard>
  );
};

