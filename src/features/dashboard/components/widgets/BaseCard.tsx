/**
 * BaseCard Component
 * Modern card component with glassmorphism effect
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  gradient = false,
  padding = 'md',
  onClick,
}) => {
  const baseClasses = twMerge(
    'rounded-2xl transition-all duration-300',
    paddingClasses[padding],
    glass && 'bg-white/10 backdrop-blur-glass border border-white/20 shadow-glass',
    !glass && !gradient && 'bg-white border border-neutral-border shadow-md',
    gradient && 'bg-gradient-to-br from-primary-500 to-primary-700 text-white',
    hover && 'hover:shadow-xl hover:scale-[1.02] cursor-pointer',
    onClick && 'cursor-pointer',
    className
  );

  const content = (
    <div className={baseClasses}>
      {children}
    </div>
  );

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

