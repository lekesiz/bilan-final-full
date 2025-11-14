/**
 * TableWidget Component
 * Virtualized table with sorting, filtering, and export
 */

import React, { useState, useMemo } from 'react';
import { BaseCard } from './BaseCard';
import { Button } from '../controls/Button';
import { Input } from '../controls/Input';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableColumn } from '../../types/widget.types';

export interface TableWidgetProps {
  title?: string;
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  searchable?: boolean;
  onRowClick?: (record: any) => void;
  height?: number;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  title,
  columns,
  data,
  loading = false,
  pagination = true,
  pageSize = 10,
  sortable = true,
  filterable = true,
  exportable = true,
  searchable = true,
  onRowClick,
  height = 400,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search && searchable) {
      const searchLower = search.toLowerCase();
      result = result.filter((record) =>
        columns.some((col) => {
          const value = record[col.dataIndex];
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Sort
    if (sortColumn && sortable) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sortColumn, sortDirection, columns, searchable, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map((col) => col.title).join(',');
    const rows = filteredData.map((record) =>
      columns.map((col) => {
        const value = record[col.dataIndex];
        return `"${value?.toString().replace(/"/g, '""') || ''}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'table'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <BaseCard padding="md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard padding="md" className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900">
            {title}
          </h3>
        )}
        <div className="flex items-center gap-2">
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch('');
              setCurrentPage(1);
              setSortColumn(null);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            icon={<SearchOutlined />}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-neutral-700 ${
                    sortable && column.sortable !== false
                      ? 'cursor-pointer hover:bg-neutral-50'
                      : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.dataIndex)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {sortable &&
                      column.sortable !== false &&
                      sortColumn === column.dataIndex && (
                        <span className="text-primary-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => (
                <tr
                  key={index}
                  className={`border-b border-neutral-border transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-neutral-50'
                      : ''
                  }`}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-neutral-900"
                    >
                      {column.render
                        ? column.render(record[column.dataIndex], record)
                        : record[column.dataIndex]?.toString() || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
            {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-neutral-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </BaseCard>
  );
};

