/**
 * AdvancedFilterBar Component
 * Advanced filtering with date range, multi-select, and saved filters
 */

import React, { useState } from 'react';
import { BaseCard } from '../widgets/BaseCard';
import { Button } from '../controls/Button';
import { Input } from '../controls/Input';
import { DatePicker, Select, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { FilterConfig, SavedFilter } from '../../types/dashboard.types';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface AdvancedFilterBarProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  packages?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, config: FilterConfig) => void;
  onDeleteFilter?: (id: string) => void;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filters,
  onFiltersChange,
  packages = [],
  statuses = [],
  users = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    onFiltersChange({
      ...filters,
      dateRange: dates
        ? {
            start: dates[0]?.toDate() || new Date(),
            end: dates[1]?.toDate() || new Date(),
          }
        : undefined,
    });
  };

  const handlePackageChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      packages: values,
    });
  };

  const handleStatusChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      statuses: values,
    });
  };

  const handleUserChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      users: values,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  const handleReset = () => {
    setSearch('');
    onFiltersChange({});
  };

  const handleSaveFilter = () => {
    if (saveFilterName && onSaveFilter) {
      onSaveFilter(saveFilterName, filters);
      setSaveFilterName('');
    }
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.config);
    setSearch(savedFilter.config.search || '');
  };

  const activeFiltersCount =
    (filters.dateRange ? 1 : 0) +
    (filters.packages?.length || 0) +
    (filters.statuses?.length || 0) +
    (filters.users?.length || 0) +
    (filters.search ? 1 : 0);

  return (
    <BaseCard padding="md" className="bg-white mb-4">
      <div className="space-y-4">
        {/* Quick Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t('common.search', 'Search...')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<SearchOutlined />}
            />
          </div>

          {/* Date Range */}
          <RangePicker
            value={
              filters.dateRange
                ? [
                    dayjs(filters.dateRange.start),
                    dayjs(filters.dateRange.end),
                  ]
                : null
            }
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={[t('common.startDate', 'Start Date'), t('common.endDate', 'End Date')]}
          />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<FilterOutlined />}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {t('common.filters', 'Filters')}
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              {t('common.reset', 'Reset')}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-neutral-border space-y-4">
            {/* Packages */}
            {packages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('common.packages', 'Packages')}
                </label>
                <Select
                  mode="multiple"
                  placeholder={t('common.selectPackages', 'Select packages')}
                  value={filters.packages}
                  onChange={handlePackageChange}
                  options={packages.map((pkg) => ({
                    label: pkg.name,
                    value: pkg.id,
                  }))}
                  className="w-full"
                />
              </div>
            )}

            {/* Statuses */}
            {statuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('common.status', 'Status')}
                </label>
                <Select
                  mode="multiple"
                  placeholder={t('common.selectStatuses', 'Select statuses')}
                  value={filters.statuses}
                  onChange={handleStatusChange}
                  options={statuses.map((status) => ({
                    label: status.name,
                    value: status.id,
                  }))}
                  className="w-full"
                />
              </div>
            )}

            {/* Users */}
            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('common.users', 'Users')}
                </label>
                <Select
                  mode="multiple"
                  placeholder={t('common.selectUsers', 'Select users')}
                  value={filters.users}
                  onChange={handleUserChange}
                  options={users.map((user) => ({
                    label: user.name,
                    value: user.id,
                  }))}
                  className="w-full"
                />
              </div>
            )}

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('common.savedFilters', 'Saved Filters')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((filter) => (
                    <Tag
                      key={filter.id}
                      closable
                      onClose={() => onDeleteFilter?.(filter.id)}
                      onClick={() => handleLoadFilter(filter)}
                      className="cursor-pointer"
                    >
                      {filter.name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Save Filter */}
            {onSaveFilter && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t('common.filterName', 'Filter name')}
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<SaveOutlined />}
                  onClick={handleSaveFilter}
                  disabled={!saveFilterName}
                >
                  {t('common.save', 'Save')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-border">
            {filters.dateRange && (
              <Tag closable onClose={() => handleDateRangeChange(null)}>
                {t('common.dateRange', 'Date Range')}:{' '}
                {dayjs(filters.dateRange.start).format('MMM DD')} -{' '}
                {dayjs(filters.dateRange.end).format('MMM DD')}
              </Tag>
            )}
            {filters.packages?.map((pkgId) => {
              const pkg = packages.find((p) => p.id === pkgId);
              return pkg ? (
                <Tag
                  key={pkgId}
                  closable
                  onClose={() =>
                    handlePackageChange(
                      filters.packages?.filter((id) => id !== pkgId) || []
                    )
                  }
                >
                  {pkg.name}
                </Tag>
              ) : null;
            })}
            {filters.statuses?.map((statusId) => {
              const status = statuses.find((s) => s.id === statusId);
              return status ? (
                <Tag
                  key={statusId}
                  closable
                  onClose={() =>
                    handleStatusChange(
                      filters.statuses?.filter((id) => id !== statusId) || []
                    )
                  }
                >
                  {status.name}
                </Tag>
              ) : null;
            })}
          </div>
        )}
      </div>
    </BaseCard>
  );
};

