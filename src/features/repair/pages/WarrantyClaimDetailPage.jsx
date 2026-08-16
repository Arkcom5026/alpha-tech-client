import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import WarrantyClaimDetailWorkspace from '../claimDetail/workspace/components/WarrantyClaimDetailWorkspace';

const WarrantyClaimDetailPage = () => {
  const navigate = useNavigate();
  const { shopSlug, claimId } = useParams();

  const activeClaim = useRepairRuntimeStore((state) => state.activeClaim);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const submitting = useRepairRuntimeStore((state) => state.submitting);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadClaim = useRepairRuntimeStore((state) => state.loadClaim);
  const transitionClaim = useRepairRuntimeStore(
    (state) => state.transitionClaim
  );
  const transitionRef = useRef(false);

  useEffect(() => {
    loadClaim(claimId);
  }, [claimId, loadClaim]);

  const handleTransition = async (payload) => {
    if (transitionRef.current || submitting) return null;
    transitionRef.current = true;
    try {
      const updated = await transitionClaim(claimId, payload);
      if (!updated) {
        const message = useRepairRuntimeStore.getState().error || 'อัปเดตสถานะเคลมไม่สำเร็จ';
        feedback.actionError(
          new Error(message),
          message,
          `warranty-claim:${claimId}:${payload?.status || 'transition'}:error`,
        );
        return null;
      }

      await loadClaim(claimId);
      feedback.actionSuccess(
        'อัปเดตสถานะเคลมเรียบร้อยแล้ว',
        `warranty-claim:${claimId}:${payload?.status || 'transition'}:success`,
      );
      return updated;
    } finally {
      transitionRef.current = false;
    }
  };

  return (
    <WarrantyClaimDetailWorkspace
      claim={activeClaim}
      loading={loading}
      submitting={submitting}
      error={error}
      onRetry={() => loadClaim(claimId)}
      onTransition={handleTransition}
      onOpenRepair={(id) =>
        navigate(`/${shopSlug}/pos/services/repairs/${id}`)
      }
    />
  );
};

export default WarrantyClaimDetailPage;
