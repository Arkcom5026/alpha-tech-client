import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import repairApi from '../api/repairApi';
import RepairDetailWorkspace from '../detail/workspace/components/RepairDetailWorkspace';

const RepairJobDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug, repairJobId } = useParams();

  const activeJob = useRepairRuntimeStore((state) => state.activeJob);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const submitting = useRepairRuntimeStore((state) => state.submitting);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadJob = useRepairRuntimeStore((state) => state.loadJob);
  const addPart = useRepairRuntimeStore((state) => state.addPart);
  const openClaim = useRepairRuntimeStore((state) => state.openClaim);
  const [workflowSubmitting, setWorkflowSubmitting] = useState(false);
  const [workflowError, setWorkflowError] = useState('');
  const claimOpeningRef = useRef(false);

  useEffect(() => {
    loadJob(repairJobId);
  }, [loadJob, repairJobId]);

  const handleWorkflowAction = async (payload) => {
    if (workflowSubmitting) return false;
    setWorkflowSubmitting(true);
    setWorkflowError('');
    try {
      await repairApi.transitionWorkflow(repairJobId, {
        ...payload,
        commandKey: payload.commandKey || `repair-workflow-${repairJobId}-${Date.now()}`,
      });
      await loadJob(repairJobId);
      feedback.actionSuccess('อัปเดตสถานะงานซ่อมเรียบร้อยแล้ว', `repair:workflow:${payload.action || 'transition'}:success`);
      return true;
    } catch (workflowActionError) {
      const message = workflowActionError?.response?.data?.error?.message || workflowActionError?.response?.data?.message || workflowActionError?.message || 'อัปเดตสถานะงานซ่อมไม่สำเร็จ';
      setWorkflowError(message);
      feedback.actionError(workflowActionError, message, `repair:workflow:${payload.action || 'transition'}:error`);
      return false;
    } finally {
      setWorkflowSubmitting(false);
    }
  };

  const handleOpenClaim = async (value) => {
    if (typeof value === 'number' || typeof value === 'string') {
      navigate(`/${shopSlug}/pos/services/warranty-claims/${value}`);
      return true;
    }

    if (claimOpeningRef.current || submitting) return null;
    claimOpeningRef.current = true;
    try {
      const created = await openClaim(repairJobId, value);
      if (created?.id) {
        feedback.actionSuccess(
          'เปิดรายการเคลมและพักงานซ่อมเรียบร้อยแล้ว',
          `repair:claim:${created.id}:create:success`,
        );
        navigate(`/${shopSlug}/pos/services/warranty-claims/${created.id}`);
        return created;
      }

      const message = useRepairRuntimeStore.getState().error || 'เปิดรายการเคลมไม่สำเร็จ';
      feedback.actionError(
        new Error(message),
        message,
        `repair:claim:${repairJobId}:create:error`,
      );
      return null;
    } finally {
      claimOpeningRef.current = false;
    }
  };

  return (
    <RepairDetailWorkspace
      repairJobId={repairJobId}
      job={activeJob}
      loading={loading}
      submitting={submitting || workflowSubmitting}
      error={workflowError || error}
      evidenceWarning={location.state?.evidenceWarning}
      communicationWarning={location.state?.communicationWarning}
      pendingIntakeEvidence={location.state?.pendingIntakeEvidence}
      onRetry={() => loadJob(repairJobId)}
      onWorkflowAction={handleWorkflowAction}
      onAddPart={(payload) => addPart(repairJobId, payload)}
      onOpenClaim={handleOpenClaim}
    />
  );
};

export default RepairJobDetailPage;
