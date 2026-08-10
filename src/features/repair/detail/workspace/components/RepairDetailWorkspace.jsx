import React from 'react';
import RepairShellHeader from '../../../components/RepairShellHeader';
import RuntimeStatePanel from '../../../components/RuntimeStatePanel';
import JobRuntimePanel from '../../../components/JobRuntimePanel';
import RepairDiagnosisPanel from '../../../components/RepairDiagnosisPanel';
import RepairTrackingAccessPanel from '../../../customer-access/components/RepairTrackingAccessPanel';
import RepairEstimateApprovalPanel from '../../../customer-access/components/RepairEstimateApprovalPanel';
import RepairHandoverPanel from '../../../components/RepairHandoverPanel';
import IntakeEvidencePanel from '../../../components/IntakeEvidencePanel';

const RepairDetailWorkspace = ({
  repairJobId,
  job,
  loading,
  submitting,
  error,
  evidenceWarning,
  onRetry,
  onWorkflowAction,
  onTransition,
  onAddPart,
  onOpenClaim,
}) => (
  <div>
    <RepairShellHeader
      eyebrow="Repair Runtime"
      title="รายละเอียดงานซ่อม"
      description="พื้นที่ปฏิบัติงานหลักที่พาผู้ใช้ทำงานตามขั้นตอน ตั้งแต่ตรวจวินิจฉัยจนถึงส่งมอบ"
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
        <RepairDiagnosisPanel
          job={job}
          submitting={submitting}
          onWorkflowAction={onWorkflowAction}
        />
        <JobRuntimePanel
          job={job}
          submitting={submitting}
          workflowManaged
          onTransition={onTransition}
          onAddPart={onAddPart}
          onOpenClaim={onOpenClaim}
        />
        <RepairTrackingAccessPanel repairJobId={repairJobId} jobNo={job.jobNo} />
        <RepairEstimateApprovalPanel repairJobId={repairJobId} job={job} />
        <RepairHandoverPanel repairJobId={repairJobId} jobStatus={job.status} />
        <IntakeEvidencePanel repairJobId={repairJobId} warning={evidenceWarning} />
      </div>
    ) : null}
  </div>
);

export default RepairDetailWorkspace;
