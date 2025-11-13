import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../core/permissions/usePermissions';
import { PermissionGuard } from '../../core/permissions/PermissionGuard';
import { useApi } from '../../../services/apiClient';
import { useToast } from '../../../components/Toast';
import { Table, Button, Space, Tag, Card, Input, Select, Spin, Popconfirm } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Assessment } from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

interface AssessmentListProps {
  onViewAssessment?: (assessmentId: string) => void;
  onEditAssessment?: (assessmentId: string) => void;
  onDeleteAssessment?: (assessmentId: string) => void;
  onCreateAssessment?: () => void;
}

/**
 * AssessmentList component for BILAN Module
 * Displays assessments with permission-based filtering and actions
 */
export const AssessmentList: React.FC<AssessmentListProps> = ({
  onViewAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onCreateAssessment,
}) => {
  const { t } = useTranslation();
  const { canAccess } = usePermissions();
  const api = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');

  // Permission checks
  const canRead = canAccess('bilan:assessment', 'read') || canAccess('bilan', 'read');
  const canCreate = canAccess('bilan:assessment', 'create') || canAccess('bilan', 'create');
  const canUpdate = canAccess('bilan:assessment', 'update') || canAccess('bilan', 'update');
  const canDelete = canAccess('bilan:assessment', 'delete') || canAccess('bilan', 'delete');
  const canViewAll = canAccess('bilan:assessment', 'read') && canAccess('users', 'read'); // Admin can see all

  // Fetch assessments
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bilan_auth_token');
      const params: { status?: string; limit?: number; offset?: number } = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.getAssessments(params);
      
      // Backend already filters by user, but we handle response structure
      let filteredAssessments = response.assessments || response.data || [];
      
      // If response has pagination structure
      if (response.pagination) {
        filteredAssessments = response.data || [];
      }

      setAssessments(filteredAssessments);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      showToast('Failed to load assessments', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchAssessments();
    }
  }, [statusFilter, canRead]);

  // Handle delete
  const handleDelete = async (assessmentId: string) => {
    try {
      await api.deleteAssessment(assessmentId);
      showToast('Assessment deleted successfully', 'success', 3000);
      fetchAssessments();
      if (onDeleteAssessment) {
        onDeleteAssessment(assessmentId);
      }
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      showToast('Failed to delete assessment', 'error', 3000);
    }
  };

  // Filter assessments by search text
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      !searchText ||
      assessment.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      assessment.packageName.toLowerCase().includes(searchText.toLowerCase()) ||
      assessment.id.toLowerCase().includes(searchText.toLowerCase());

    const matchesPackage = 
      packageFilter === 'all' || 
      assessment.packageId === packageFilter;

    return matchesSearch && matchesPackage;
  });

  // Table columns
  const columns: ColumnsType<Assessment> = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Package',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'in_progress': 'orange',
          'completed': 'green',
          'abandoned': 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = record.currentQuestionIndex || 0;
        const total = record.totalQuestions || 1;
        const percentage = Math.round((progress / total) * 100);
        return `${progress}/${total} (${percentage}%)`;
      },
    },
    {
      title: 'Started',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              if (onViewAssessment) {
                onViewAssessment(record.id);
              } else {
                navigate(`/bilan/assessment/${record.id}`);
              }
            }}
          >
            View
          </Button>
          {canUpdate && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                if (onEditAssessment) {
                  onEditAssessment(record.id);
                } else {
                  navigate(`/bilan/assessment/${record.id}/edit`);
                }
              }}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Are you sure you want to delete this assessment?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!canRead) {
    return (
      <Card>
        <p>You don't have permission to view assessments.</p>
      </Card>
    );
  }

  return (
    <div className="assessment-list">
      <Card
        title="Assessments"
        extra={
          <Space>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  if (onCreateAssessment) {
                    onCreateAssessment();
                  } else {
                    navigate('/bilan');
                  }
                }}
              >
                New Assessment
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAssessments}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filters */}
          <Space wrap>
            <Search
              placeholder="Search by user name, package, or ID"
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="abandoned">Abandoned</Option>
            </Select>
            <Select
              value={packageFilter}
              onChange={setPackageFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Packages</Option>
              <Option value="decouverte">Découverte</Option>
              <Option value="approfondi">Approfondi</Option>
              <Option value="strategique">Stratégique</Option>
            </Select>
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredAssessments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} assessments`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default AssessmentList;

