/**
 * Color Palettes
 * Predefined color palettes for charts and visualizations
 */

export const colorPalettes = {
  // Primary gradient palette
  primary: [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
  ],
  
  // Vibrant accent palette
  vibrant: [
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#8b5cf6', // purple
  ],
  
  // Success/positive palette
  success: [
    '#10b981',
    '#34d399',
    '#6ee7b7',
    '#a7f3d0',
    '#d1fae5',
  ],
  
  // Warning palette
  warning: [
    '#f59e0b',
    '#fbbf24',
    '#fcd34d',
    '#fde68a',
    '#fef3c7',
  ],
  
  // Danger/error palette
  danger: [
    '#ef4444',
    '#f87171',
    '#fca5a5',
    '#fecaca',
    '#fee2e2',
  ],
  
  // Neutral/gray palette
  neutral: [
    '#64748b',
    '#94a3b8',
    '#cbd5e1',
    '#e2e8f0',
    '#f1f5f9',
  ],
  
  // Categorical (for pie charts, etc.)
  categorical: [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#a8edea',
  ],
  
  // Heatmap palette
  heatmap: {
    min: '#f0f9ff',
    max: '#0c4a6e',
  },
};

/**
 * Get color by index (with cycling)
 */
export const getColor = (palette: keyof typeof colorPalettes, index: number): string => {
  const colors = Array.isArray(colorPalettes[palette])
    ? colorPalettes[palette] as string[]
    : [];
  
  if (colors.length === 0) return '#667eea';
  
  return colors[index % colors.length];
};

/**
 * Get gradient colors
 */
export const getGradient = (from: string, to: string): string => {
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
};

