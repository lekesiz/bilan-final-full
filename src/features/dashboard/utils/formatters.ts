/**
 * Formatters
 * Utility functions for formatting data in dashboard
 */

import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';
import { de } from 'date-fns/locale/de';
import { tr } from 'date-fns/locale/tr';
import numeral from 'numeral';

const locales = {
  en: enUS,
  fr: fr,
  de: de,
  tr: tr,
};

/**
 * Format number
 */
export const formatNumber = (
  value: number,
  format: 'number' | 'currency' | 'percentage' | 'duration' = 'number',
  locale: string = 'en'
): string => {
  switch (format) {
    case 'currency':
      return numeral(value).format('$0,0.00');
    case 'percentage':
      return numeral(value / 100).format('0.0%');
    case 'duration':
      return formatDuration(value);
    default:
      return numeral(value).format('0,0');
  }
};

/**
 * Format duration (seconds to human readable)
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

/**
 * Format date
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = 'PP',
  locale: string = 'en'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale as keyof typeof locales] || locales.en;
  
  return format(dateObj, formatStr, { locale: localeObj });
};

/**
 * Format relative date
 */
export const formatRelativeDate = (
  date: Date | string,
  locale: string = 'en'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale as keyof typeof locales] || locales.en;
  
  return formatRelative(dateObj, new Date(), { locale: localeObj });
};

/**
 * Format distance date
 */
export const formatDistanceDate = (
  date: Date | string,
  locale: string = 'en'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale as keyof typeof locales] || locales.en;
  
  return formatDistance(dateObj, new Date(), { 
    locale: localeObj,
    addSuffix: true 
  });
};

/**
 * Format bytes
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format change percentage
 */
export const formatChange = (value: number, showSign: boolean = true): string => {
  const sign = value > 0 ? '+' : '';
  const formatted = numeral(Math.abs(value)).format('0.0');
  return showSign ? `${sign}${formatted}%` : `${formatted}%`;
};

