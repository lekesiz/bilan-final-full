import React from 'react';
import { Table, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 5,
  rows = 10,
  showHeader = true,
}) => {
  const skeletonColumns: ColumnsType<any> = Array(columns)
    .fill(null)
    .map((_, i) => ({
      key: `col-${i}`,
      title: showHeader ? (
        <Skeleton.Input active size="small" style={{ width: 100 }} />
      ) : undefined,
      render: () => <Skeleton.Input active size="small" block />,
    }));

  const dataSource = Array(rows)
    .fill(null)
    .map((_, i) => ({ key: `row-${i}` }));

  return (
    <Table
      columns={skeletonColumns}
      dataSource={dataSource}
      pagination={false}
      showHeader={showHeader}
    />
  );
};

