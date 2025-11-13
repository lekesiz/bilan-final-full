import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  padding?: number | string;
  maxWidth?: string;
}

/**
 * PageWrapper component
 * Provides consistent padding and layout for page content within ThemedLayout
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  padding = '24px',
  maxWidth = '100%',
}) => {
  return (
    <div
      style={{
        padding,
        maxWidth,
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

