import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Dark theme disabled - always use light mode
  const actualTheme: 'light' | 'dark' = 'light';
  const theme: Theme = 'light';

  // Remove dark class immediately (before React renders)
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.removeItem('bilan-theme');
  }

  useEffect(() => {
    // Ensure dark class is never added (runs on every render)
    const root = document.documentElement;
    root.classList.remove('dark');
    
    // Remove any saved dark theme preference
    localStorage.removeItem('bilan-theme');
    
    // Watch for any attempts to add dark class and remove it immediately
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (root.classList.contains('dark')) {
            root.classList.remove('dark');
          }
        }
      });
    });
    
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const setTheme = () => {
    // No-op: theme is always light
  };

  const toggleTheme = () => {
    // No-op: theme is always light
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

