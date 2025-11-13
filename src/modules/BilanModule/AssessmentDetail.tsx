import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../core/permissions/usePermissions';
import { PermissionGuard } from '../../core/permissions/PermissionGuard';
import { useApi } from '../../../services/apiClient';
import { useToast } from '../../../components/Toast';
import { Card, Descriptions, Tag, Button, Space, Spin, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Assessment } from '../../../services/apiClient';

/**
 * AssessmentDetail component
 * Displays detailed information about a specific assessment
 */
export const AssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canAccess } = usePermissions();
  const api = useApi();
  const { showToast } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any[]>([]);

  const canRead = canAccess('bilan:assessment', 'read') || canAccess('bilan', 'read');
  const canUpdate = canAccess('bilan:assessment', 'update') || canAccess('bilan', 'update');
  const canDelete = canAccess('bilan:assessment', 'delete') || canAccess('bilan', 'delete');

  useEffect(() => {
    if (id && canRead) {
      fetchAssessment();
    }
  }, [id, canRead]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const assessmentData = await api.getAssessment(id!);
      setAssessment(assessmentData);

      // Fetch answers
      try {
        const answersResponse = await api.getAnswers(id!);
        setAnswers(answersResponse.answers || []);
      } catch (error) {
        console.error('Failed to fetch answers:', error);
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
      showToast('Failed to load assessment', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('bilan_auth_token');
      await api.deleteAssessment(id);
      showToast('Assessment deleted successfully', 'success', 3000);
      navigate('/bilan/assessments');
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      showToast('Failed to delete assessment', 'error', 3000);
    }
  };

  if (!canRead) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to view this assessment."
        extra={
          <Button type="primary" onClick={() => navigate('/bilan')}>
            Go Back
          </Button>
        }
      />
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <Result
        status="404"
        title="Assessment Not Found"
        subTitle="The assessment you're looking for doesn't exist."
        extra={
          <Button type="primary" onClick={() => navigate('/bilan')}>
            Go Back
          </Button>
        }
      />
    );
  }

  const statusColorMap: Record<string, string> = {
    'in_progress': 'orange',
    'completed': 'green',
    'abandoned': 'red',
  };

  return (
    <PermissionGuard resource="bilan:assessment" action="read">
      <div className="assessment-detail">
        <Card
          title={
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/bilan/assessments')}
              >
                Back
              </Button>
              <span>Assessment Details</span>
            </Space>
          }
          extra={
            <Space>
              {canUpdate && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/bilan/assessment/${id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </Space>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{assessment.id}</Descriptions.Item>
            <Descriptions.Item label="User Name">{assessment.userName}</Descriptions.Item>
            <Descriptions.Item label="Package">
              <Tag color="blue">{assessment.packageName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColorMap[assessment.status] || 'default'}>
                {assessment.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Coaching Style">{assessment.coachingStyle}</Descriptions.Item>
            <Descriptions.Item label="Progress">
              {assessment.currentQuestionIndex || 0} / {assessment.totalQuestions}
            </Descriptions.Item>
            <Descriptions.Item label="Started At">
              {new Date(assessment.startedAt).toLocaleString()}
            </Descriptions.Item>
            {assessment.completedAt && (
              <Descriptions.Item label="Completed At">
                {new Date(assessment.completedAt).toLocaleString()}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Last Activity">
              {new Date(assessment.lastActivityAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Answers" span={2}>
              {answers.length}
            </Descriptions.Item>
          </Descriptions>

          {assessment.userProfile && (
            <Card title="User Profile" style={{ marginTop: 16 }}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(assessment.userProfile, null, 2)}
              </pre>
            </Card>
          )}

          {answers.length > 0 && (
            <Card title="Answers" style={{ marginTop: 16 }}>
              <p>Total answers: {answers.length}</p>
              {/* Answers list can be expanded here */}
            </Card>
          )}
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default AssessmentDetail;

