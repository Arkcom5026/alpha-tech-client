import React, { useState } from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import RepairWorkflowOverview from '../../../components/RepairWorkflowOverview';
import JobRuntimePanel from '../../../components/JobRuntimePanel';
import RepairDiagnosisPanel from '../../../components/RepairDiagnosisPanel';
import RepairExecutionPanel from '../../../components/RepairExecutionPanel';
import RepairClaimHandoffPanel from '../../../components/RepairClaimHandoffPanel';
import RepairSubcontractPanel from '../../../components/RepairSubcontractPanel';
import RepairTrackingAccessPanel from '../../../customer-access/components/RepairTrackingAccessPanel';
import RepairEstimateApprovalPanel from '../../../customer-access/components/RepairEstimateApprovalPanel';
import RepairHandoverPanel from '../../../components/RepairHandoverPanel';
import IntakeEvidencePanel from '../../../components/IntakeEvidencePanel';
import RepairCommunicationPanel from '../../../components/RepairCommunicationPanel';
import DeferredRepairPanel from './DeferredRepairPanel';

const RepairDetailWorkspace = ({
  repairJobId,
  job,
  loading,
  submitting,
  error,
  evidenceWarning,
  communicationWarning,
  pendingIntakeEvidence,
  onRetry,
  onWorkflowAction,
  onAddPart,
  onOpenClaim,
}) => {
  const [evidenceRevision, setEvidenceRevision] = useState(0);
  const workflowStatus = job?.workflow?.status || null;
  const subcontractActive = Boolean(job?.workflow?.subcontractContext?.active);
  const estimateRelevant = workflowStatus === 'WAITING_APPROVAL';
  const handoverRelevant = ['READY_FOR_DELIVERY', 'DELIVERED'].includes(workflowStatus);
  const evidenceRelevant = Boolean(evidenceWarning || pendingIntakeEvidence);

  const handleEvidenceSaved = async () => {
    setEvidenceRevision((current) => current + 1);
    await onRetry?.();
  };

  return (
    <div>
      <RepairShellHeader
        eyebrow="Repair Runtime"
        title="รายละเอียดงานซ่อม"
        description="พื้นที่ปฏิบัติงานหลักที่พาผู้ใช้ทำงานตามขั้นตอน ตั้งแต่ตรวจสอบจนถึงส่งมอบ"
      />

      <RuntimeStatePanel
        loading={loading}
        error={error}
        empty={!loading && !error && !job}
        emptyText="ไม่พบงานซ่อม"
        onRetry={onRetry}
      />

      {job ? (
        <div className="space-y-4">
          {communicationWarning ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              เปิดงานซ่อมสำเร็จ แต่ยังบันทึกช่องทางติดต่อไม่ได้: {communicationWarning}
            </div>
          ) : null}
          <RepairWorkflowOverview
            job={job}
            submitting={submitting}
            onWorkflowAction={onWorkflowAction}
          />

          <DeferredRepairPanel eager={subcontractActive} minHeight={96}>
            <RepairSubcontractPanel
              job={job}
              onChanged={onRetry}
              refreshKey={evidenceRevision}
            />
          </DeferredRepairPanel>

          {!subcontractActive ? (
            <>
              <RepairDiagnosisPanel
                job={job}
                submitting={submitting}
                onWorkflowAction={onWorkflowAction}
              />
              <RepairExecutionPanel
                job={job}
                submitting={submitting}
                onWorkflowAction={onWorkflowAction}
                onAddPart={onAddPart}
              />
            </>
          ) : null}

          <JobRuntimePanel job={job} />

          {!subcontractActive ? (
            <RepairClaimHandoffPanel
              job={job}
              submitting={submitting}
              onOpenClaim={onOpenClaim}
            />
          ) : null}

          <DeferredRepairPanel minHeight={80}>
            <RepairTrackingAccessPanel repairJobId={repairJobId} jobNo={job.jobNo} />
          </DeferredRepairPanel>

          <DeferredRepairPanel minHeight={100}>
            <RepairCommunicationPanel repairJobId={repairJobId} />
          </DeferredRepairPanel>

          <DeferredRepairPanel eager={estimateRelevant} minHeight={100}>
            <RepairEstimateApprovalPanel repairJobId={repairJobId} job={job} />
          </DeferredRepairPanel>

          {!subcontractActive ? (
            <DeferredRepairPanel eager={handoverRelevant} minHeight={100}>
              <RepairHandoverPanel
                repairJobId={repairJobId}
                job={job}
                onWorkflowAction={onWorkflowAction}
                onJobReload={onRetry}
              />
            </DeferredRepairPanel>
          ) : null}

          <DeferredRepairPanel eager={evidenceRelevant} minHeight={100}>
            <IntakeEvidencePanel
              repairJobId={repairJobId}
              warning={evidenceWarning}
              retryDraft={pendingIntakeEvidence}
              onSaved={handleEvidenceSaved}
            />
          </DeferredRepairPanel>
        </div>
      ) : null}
    </div>
  );
};

export default RepairDetailWorkspace;
