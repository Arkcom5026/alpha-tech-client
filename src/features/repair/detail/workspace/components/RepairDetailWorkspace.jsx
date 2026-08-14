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
import DeferredRepairSection from './DeferredRepairSection';

const SUBCONTRACT_VISIBLE_STATUSES = new Set(['APPROVED', 'REPAIRING']);
const ESTIMATE_VISIBLE_STATUSES = new Set([
  'WAITING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REPAIRING',
  'WAITING_PARTS',
  'WAITING_QC',
  'QC_FAILED',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CLOSED',
]);
const HANDOVER_VISIBLE_STATUSES = new Set(['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED']);

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
  const workflowStatus = job?.workflow?.status || 'RECEIVED';
  const subcontractActive = Boolean(job?.workflow?.subcontractContext?.active);
  const preAgreedService = Boolean(job?.workflow?.preAgreedService?.enabled);
  const subcontractRelevant =
    subcontractActive || SUBCONTRACT_VISIBLE_STATUSES.has(workflowStatus);
  const estimateRelevant =
    preAgreedService || ESTIMATE_VISIBLE_STATUSES.has(workflowStatus);
  const handoverRelevant = HANDOVER_VISIBLE_STATUSES.has(workflowStatus);

  const handleEvidenceSaved = async () => {
    setEvidenceRevision((current) => current + 1);
    await onRetry?.();
  };

  return (
    <div>
      <RepairShellHeader
        eyebrow="Repair Runtime"
        title="à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™à¸‹à¹ˆà¸­à¸¡"
        description="à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¸›à¸à¸´à¸šà¸±à¸•à¸´à¸‡à¸²à¸™à¸«à¸¥à¸±à¸à¸—à¸µà¹ˆà¸žà¸²à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸³à¸‡à¸²à¸™à¸•à¸²à¸¡à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™ à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸ˆà¸™à¸–à¸¶à¸‡à¸ªà¹ˆà¸‡à¸¡à¸­à¸š"
      />

      <RuntimeStatePanel
        loading={loading}
        error={error}
        empty={!loading && !error && !job}
        emptyText="à¹„à¸¡à¹ˆà¸žà¸šà¸‡à¸²à¸™à¸‹à¹ˆà¸­à¸¡"
        onRetry={onRetry}
      />

      {job ? (
        <div className="space-y-4">
          {communicationWarning ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              à¹€à¸›à¸´à¸”à¸‡à¸²à¸™à¸‹à¹ˆà¸­à¸¡à¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¹à¸•à¹ˆà¸¢à¸±à¸‡à¸šà¸±à¸™à¸—à¸¶à¸à¸Šà¹ˆà¸­à¸‡à¸—à¸²à¸‡à¸•à¸´à¸”à¸•à¹ˆà¸­à¹„à¸¡à¹ˆà¹„à¸”à¹‰: {communicationWarning}
            </div>
          ) : null}
          <RepairWorkflowOverview
            job={job}
            submitting={submitting}
            onWorkflowAction={onWorkflowAction}
          />

          {subcontractRelevant ? (
            <RepairSubcontractPanel
              job={job}
              onChanged={onRetry}
              refreshKey={evidenceRevision}
            />
          ) : null}

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

          <RepairTrackingAccessPanel repairJobId={repairJobId} jobNo={job.jobNo} />

          <DeferredRepairSection minHeight={140} force={Boolean(communicationWarning)}>
            <RepairCommunicationPanel repairJobId={repairJobId} />
          </DeferredRepairSection>

          {estimateRelevant ? (
            <DeferredRepairSection minHeight={180}>
              <RepairEstimateApprovalPanel repairJobId={repairJobId} job={job} />
            </DeferredRepairSection>
          ) : null}

          {!subcontractActive && handoverRelevant ? (
            <DeferredRepairSection minHeight={180}>
              <RepairHandoverPanel
                repairJobId={repairJobId}
                job={job}
                onWorkflowAction={onWorkflowAction}
                onJobReload={onRetry}
              />
            </DeferredRepairSection>
          ) : null}

          <DeferredRepairSection
            minHeight={180}
            force={Boolean(evidenceWarning || pendingIntakeEvidence)}
          >
            <IntakeEvidencePanel
              repairJobId={repairJobId}
              warning={evidenceWarning}
              retryDraft={pendingIntakeEvidence}
              onSaved={handleEvidenceSaved}
            />
          </DeferredRepairSection>
        </div>
      ) : null}
    </div>
  );
};

export default RepairDetailWorkspace;

