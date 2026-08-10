import React from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import ClaimRuntimePanel from '../../../components/ClaimRuntimePanel';
import ClaimResolutionOutcomePanel from '../../../components/ClaimResolutionOutcomePanel';

const WarrantyClaimDetailWorkspace = ({
  claim,
  loading,
  submitting,
  error,
  onRetry,
  onTransition,
  onOpenRepair,
}) => (
  <div>
    <RepairShellHeader
      eyebrow="Warranty Runtime"
      title="รายละเอียดงานเคลม"
      description="พื้นที่ปฏิบัติงานสำหรับสถานะศูนย์บริการ การขนส่ง Timeline และผลการเคลม"
    />

    <RuntimeStatePanel
      loading={loading}
      error={error}
      empty={!loading && !error && !claim}
      emptyText="ไม่พบงานเคลม"
      onRetry={onRetry}
    />

    {claim ? (
      <div className="space-y-4">
        <ClaimResolutionOutcomePanel claim={claim} />
        <ClaimRuntimePanel
          claim={claim}
          submitting={submitting}
          onTransition={onTransition}
          onOpenRepair={onOpenRepair}
        />
      </div>
    ) : null}
  </div>
);

export default WarrantyClaimDetailWorkspace;
