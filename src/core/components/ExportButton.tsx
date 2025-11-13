import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
      console.error('CSV export error:', error);
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
      console.error('Excel export error:', error);
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
      
      // Table
      const tableColumn = columns.map(col => col.title);
      const tableRows = preparedData.map(row => 
        columns.map(col => {
          const value = row[col.title];
          return value !== null && value !== undefined ? String(value) : '';
        })
      );
      
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { top: 28 },
      });
      
      doc.save(`${filename || resource}_${new Date().toISOString().split('T')[0]}.pdf`);
      message.success(t('export.pdfSuccess', 'PDF exported successfully'));
    } catch (error) {
      message.error(t('export.pdfError', 'Failed to export PDF'));
      console.error('PDF export error:', error);
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

