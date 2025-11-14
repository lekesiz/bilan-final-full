import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface ExportButtonProps {
  data: any[];
  columns: Array<{
    title: string;
    dataIndex: string;
    key: string;
    render?: (value: any, record: any) => React.ReactNode;
  }>;
  filename?: string;
  resource?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename,
  resource = 'data',
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Prepare data for export (remove React components, format dates, etc.)
  const prepareData = () => {
    return data.map(record => {
      const row: any = {};
      columns.forEach(col => {
        if (col.dataIndex) {
          const value = record[col.dataIndex];
          if (value instanceof Date) {
            row[col.title] = value.toLocaleDateString();
          } else if (Array.isArray(value)) {
            row[col.title] = value.map((v: any) => v.name || v).join(', ');
          } else if (typeof value === 'object' && value !== null) {
            row[col.title] = JSON.stringify(value);
          } else {
            row[col.title] = value || '';
          }
        }
      });
      return row;
    });
  };

  const exportToCSV = () => {
    try {
      setLoading(true);
      const preparedData = prepareData();
      const worksheet = XLSX.utils.json_to_sheet(preparedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename || resource}_${new Date().toISOString().split('T')[0]}.csv`);
      message.success(t('export.csvSuccess', 'CSV exported successfully'));
    } catch (error) {
      message.error(t('export.csvError', 'Failed to export CSV'));
      if (process.env.NODE_ENV !== 'production') {
        console.error('CSV export error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      setLoading(true);
      const preparedData = prepareData();
      const worksheet = XLSX.utils.json_to_sheet(preparedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // Auto-size columns
      const maxWidth = 50;
      const wscols = columns.map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename || resource}_${new Date().toISOString().split('T')[0]}.xlsx`);
      message.success(t('export.excelSuccess', 'Excel exported successfully'));
    } catch (error) {
      message.error(t('export.excelError', 'Failed to export Excel'));
      if (process.env.NODE_ENV !== 'production') {
        console.error('Excel export error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      setLoading(true);
      const preparedData = prepareData();
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Title
      doc.setFontSize(16);
      doc.text(resource.charAt(0).toUpperCase() + resource.slice(1) + ' Export', 14, 15);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
      
      // Table - Simple text-based table
      let yPos = 28;
      const cellHeight = 7;
      const cellWidth = doc.internal.pageSize.width / columns.length;
      
      // Header
      doc.setFillColor(66, 139, 202);
      doc.setTextColor(255, 255, 255);
      columns.forEach((col, index) => {
        doc.rect(14 + (index * cellWidth), yPos, cellWidth, cellHeight, 'F');
        doc.text(col.title, 16 + (index * cellWidth), yPos + 5);
      });
      
      yPos += cellHeight;
      doc.setTextColor(0, 0, 0);
      
      // Rows
      preparedData.forEach((row, rowIndex) => {
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 15;
        }
        
        columns.forEach((col, colIndex) => {
          const value = row[col.title];
          const text = value !== null && value !== undefined ? String(value).substring(0, 30) : '';
          doc.text(text, 16 + (colIndex * cellWidth), yPos + 5);
        });
        
        yPos += cellHeight;
      });
      
      doc.save(`${filename || resource}_${new Date().toISOString().split('T')[0]}.pdf`);
      message.success(t('export.pdfSuccess', 'PDF exported successfully'));
    } catch (error) {
      message.error(t('export.pdfError', 'Failed to export PDF'));
      if (process.env.NODE_ENV !== 'production') {
        console.error('PDF export error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'csv',
      label: t('export.csv', 'Export as CSV'),
      icon: <FileTextOutlined />,
      onClick: exportToCSV,
    },
    {
      key: 'excel',
      label: t('export.excel', 'Export as Excel'),
      icon: <FileExcelOutlined />,
      onClick: exportToExcel,
    },
    {
      key: 'pdf',
      label: t('export.pdf', 'Export as PDF'),
      icon: <FilePdfOutlined />,
      onClick: exportToPDF,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
    >
      <Button icon={<DownloadOutlined />} loading={loading}>
        {t('export.title', 'Export')}
      </Button>
    </Dropdown>
  );
};

