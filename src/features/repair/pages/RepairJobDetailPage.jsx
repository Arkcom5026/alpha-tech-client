import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
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
  const transitionJob = useRepairRuntimeStore((state) => state.transitionJob);
  const addPart = useRepairRuntimeStore((state) => state.addPart);
  const openClaim = useRepairRuntimeStore((state) => state.openClaim);

  useEffect(() => {
    loadJob(repairJobId);
  }, [loadJob, repairJobId]);

  const handleOpenClaim = async (value) => {
    if (typeof value === 'number' || typeof value === 'string') {
      navigate(`/${shopSlug}/pos/services/warranty-claims/${value}`);
      return;
    }

    const created = await openClaim(repairJobId, value);
    if (created?.id) {
      navigate(`/${shopSlug}/pos/services/warranty-claims/${created.id}`);
    }
  };

  return (
    <RepairDetailWorkspace
      repairJobId={repairJobId}
      job={activeJob}
      loading={loading}
      submitting={submitting}
      error={error}
      evidenceWarning={location.state?.evidenceWarning}
      onRetry={() => loadJob(repairJobId)}
      onTransition={(payload) => transitionJob(repairJobId, payload)}
      onAddPart={(payload) => addPart(repairJobId, payload)}
      onOpenClaim={handleOpenClaim}
    />
  );
};

export default RepairJobDetailPage;
