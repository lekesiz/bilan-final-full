/**
 * MetricCard Component
 * Animated metric card with gradient, sparkline, and trend indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
// Using react-spring directly (if @react-spring/web not available, fallback to react-spring)
import { useSpring, animated } from 'react-spring';
import { BaseCard } from './BaseCard';
import { formatNumber } from '../../utils/formatters';
// Icons - using Ant Design icons as fallback since lucide-react might not be available
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  sparklineData?: number[];
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  loading?: boolean;
  onClick?: () => void;
}

const colorConfig = {
  primary: {
    gradient: 'from-primary-500 to-primary-700',
    iconBg: 'bg-primary-500/20',
    trendUp: 'text-primary-200',
    trendDown: 'text-primary-300',
  },
  success: {
    gradient: 'from-emerald-500 to-emerald-700',
    iconBg: 'bg-emerald-500/20',
    trendUp: 'text-emerald-200',
    trendDown: 'text-emerald-300',
  },
  warning: {
    gradient: 'from-amber-500 to-amber-700',
    iconBg: 'bg-amber-500/20',
    trendUp: 'text-amber-200',
    trendDown: 'text-amber-300',
  },
  danger: {
    gradient: 'from-red-500 to-red-700',
    iconBg: 'bg-red-500/20',
    trendUp: 'text-red-200',
    trendDown: 'text-red-300',
  },
  info: {
    gradient: 'from-cyan-500 to-cyan-700',
    iconBg: 'bg-cyan-500/20',
    trendUp: 'text-cyan-200',
    trendDown: 'text-cyan-300',
  },
};

const AnimatedNumber: React.FC<{ value: number; format?: string }> = ({ value, format = 'number' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.span>
      {number.to((n) => {
        if (format === 'currency') {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
        }
        if (format === 'percentage') {
          return `${n.toFixed(1)}%`;
        }
        return Math.round(n).toLocaleString();
      })}
    </animated.span>
  );
};

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height: '32px' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.6"
      />
    </svg>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  sparklineData,
  color = 'primary',
  format = 'number',
  loading = false,
  onClick,
}) => {
  const config = colorConfig[color];
  const isNumber = typeof value === 'number';

  if (loading) {
    return (
      <BaseCard className={`bg-gradient-to-br ${config.gradient} text-white`} padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard
      className={`bg-gradient-to-br ${config.gradient} text-white relative overflow-hidden group`}
      hover
      onClick={onClick}
      padding="md"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm font-medium">{title}</span>
          {icon && (
            <div className={`p-2 rounded-lg ${config.iconBg} backdrop-blur-sm`}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isNumber ? (
              <AnimatedNumber value={value} format={format} />
            ) : (
              value
            )}
          </motion.span>

          {/* Change indicator */}
          {change !== undefined && (
            <motion.span
              className={`text-sm font-semibold flex items-center gap-1 ${
                change > 0 ? config.trendUp : change < 0 ? config.trendDown : 'text-white/60'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {change > 0 && <ArrowUpOutlined className="w-4 h-4" />}
              {change < 0 && <ArrowDownOutlined className="w-4 h-4" />}
              {change === 0 && <MinusOutlined className="w-4 h-4" />}
              {Math.abs(change)}%
            </motion.span>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 opacity-60">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>
    </BaseCard>
  );
};

