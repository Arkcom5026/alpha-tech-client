import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import ClaimRuntimePanel from '../components/ClaimRuntimePanel';

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
    <div>
      <RepairShellHeader
        eyebrow="Warranty Runtime"
        title="รายละเอียดงานเคลม"
        description="พื้นที่ปฏิบัติงานสำหรับสถานะศูนย์บริการ การขนส่ง Timeline และผลการเคลม"
      />

      <RuntimeStatePanel
        loading={loading}
        error={error}
        empty={!loading && !error && !activeClaim}
        emptyText="ไม่พบงานเคลม"
        onRetry={() => loadClaim(claimId)}
      />

      {activeClaim ? (
        <ClaimRuntimePanel
          claim={activeClaim}
          submitting={submitting}
          onTransition={(payload) => transitionClaim(claimId, payload)}
          onOpenRepair={(id) =>
            navigate(`/${shopSlug}/pos/services/repairs/${id}`)
          }
        />
      ) : null}
    </div>
  );
};

export default WarrantyClaimDetailPage;
