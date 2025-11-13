/**
 * Production-safe logger utility
 * 
 * Only logs in development mode or when explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
const isLoggingEnabled = process.env.ENABLE_LOGGING === 'true' || isDevelopment;

export const logger = {
  log: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Always log warnings
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

