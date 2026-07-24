import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairShellHeader from '../components/RepairShellHeader';
import RuntimeStatePanel from '../components/RuntimeStatePanel';
import JobRuntimePanel from '../components/JobRuntimePanel';

const RepairJobDetailPage = () => {
  const navigate = useNavigate();
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
    <div>
      <RepairShellHeader
        eyebrow="Repair Runtime"
        title="รายละเอียดงานซ่อม"
        description="พื้นที่ปฏิบัติงานหลักสำหรับสถานะ อะไหล่ บันทึกช่าง และการส่งต่อเคลม"
      />

      <RuntimeStatePanel
        loading={loading}
        error={error}
        empty={!loading && !error && !activeJob}
        emptyText="ไม่พบงานซ่อม"
        onRetry={() => loadJob(repairJobId)}
      />

      {activeJob ? (
        <JobRuntimePanel
          job={activeJob}
          submitting={submitting}
          onTransition={(payload) => transitionJob(repairJobId, payload)}
          onAddPart={(payload) => addPart(repairJobId, payload)}
          onOpenClaim={handleOpenClaim}
        />
      ) : null}
    </div>
  );
};

export default RepairJobDetailPage;
