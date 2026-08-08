import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    loadClaim(claimId);
  }, [claimId, loadClaim]);

  return (
    <WarrantyClaimDetailWorkspace
      claim={activeClaim}
      loading={loading}
      submitting={submitting}
      error={error}
      onRetry={() => loadClaim(claimId)}
      onTransition={(payload) => transitionClaim(claimId, payload)}
      onOpenRepair={(id) =>
        navigate(`/${shopSlug}/pos/services/repairs/${id}`)
      }
    />
  );
};

export default WarrantyClaimDetailPage;
