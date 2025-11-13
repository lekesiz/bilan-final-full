import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Space, Button, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface FilterValues {
  search?: string;
  status?: string;
  role?: string;
  dateRange?: [Dayjs, Dayjs];
  [key: string]: any;
}

interface AdvancedFiltersProps {
  resource: 'users' | 'roles' | 'assessments';
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  showSearch?: boolean;
  showStatus?: boolean;
  showRole?: boolean;
  showDateRange?: boolean;
  customFilters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'input' | 'date';
    options?: Array<{ label: string; value: string }>;
  }>;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  resource,
  onFilterChange,
  initialFilters = {},
  showSearch = true,
  showStatus = true,
  showRole = resource === 'users',
  showDateRange = true,
  roleOptions = [],
  customFilters = [],
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      const formValues: any = { ...initialFilters };
      if (initialFilters.dateRange && Array.isArray(initialFilters.dateRange)) {
        formValues.dateRange = [
          dayjs(initialFilters.dateRange[0]),
          dayjs(initialFilters.dateRange[1]),
        ];
      }
      form.setFieldsValue(formValues);
    }
  }, [initialFilters, form]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const filters: FilterValues = {};

    if (values.search) filters.search = values.search;
    if (values.status) filters.status = values.status;
    if (values.role) filters.role = values.role;
    if (values.dateRange && values.dateRange.length === 2) {
      filters.dateRange = values.dateRange;
    }

    // Custom filters
    customFilters.forEach(filter => {
      if (values[filter.key]) {
        filters[filter.key] = values[filter.key];
      }
    });

    onFilterChange(filters);
  };

  const handleClear = () => {
    form.resetFields();
    onFilterChange({});
  };

  const getStatusOptions = () => {
    if (resource === 'users') {
      return [
        { label: t('filters.status.active', 'Active'), value: 'active' },
        { label: t('filters.status.inactive', 'Inactive'), value: 'inactive' },
      ];
    } else if (resource === 'assessments') {
      return [
        { label: t('filters.status.completed', 'Completed'), value: 'completed' },
        { label: t('filters.status.inProgress', 'In Progress'), value: 'in_progress' },
        { label: t('filters.status.abandoned', 'Abandoned'), value: 'abandoned' },
      ];
    }
    return [];
  };

  const getRoleOptions = () => {
    return roleOptions;
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <FilterOutlined />
          <span>{t('filters.title', 'Advanced Filters')}</span>
        </Space>
      }
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t('filters.collapse', 'Collapse') : t('filters.expand', 'Expand')}
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          {showSearch && (
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="search" label={t('filters.search', 'Search')}>
                <Input
                  placeholder={t('filters.searchPlaceholder', 'Search...')}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
          )}

          {showStatus && (
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label={t('filters.status.label', 'Status')}>
                <Select
                  placeholder={t('filters.status.placeholder', 'Select Status')}
                  allowClear
                >
                  {getStatusOptions().map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}

          {showRole && (
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="role" label={t('filters.role', 'Role')}>
                <Select
                  placeholder={t('filters.rolePlaceholder', 'Select Role')}
                  allowClear
                >
                  {getRoleOptions().map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}

          {showDateRange && (
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="dateRange" label={t('filters.dateRange', 'Date Range')}>
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          )}

          {expanded && customFilters.map(filter => (
            <Col xs={24} sm={12} md={8} key={filter.key}>
              <Form.Item name={filter.key} label={filter.label}>
                {filter.type === 'select' ? (
                  <Select
                    placeholder={`Select ${filter.label}`}
                    allowClear
                  >
                    {filter.options?.map(opt => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                ) : filter.type === 'input' ? (
                  <Input placeholder={`Enter ${filter.label}`} allowClear />
                ) : (
                  <DatePicker style={{ width: '100%' }} />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                {t('filters.clear', 'Clear')}
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                {t('filters.search', 'Search')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

