import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const intakePage = read('src/features/repair/pages/RepairIntakePage.jsx');
const intakeWorkspace = read(
  'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
);
const jobsPage = read('src/features/repair/pages/RepairJobsPage.jsx');
const detailPage = read('src/features/repair/pages/RepairJobDetailPage.jsx');
const claimsPage = read('src/features/repair/pages/WarrantyClaimsPage.jsx');
const claimDetailPage = read('src/features/repair/pages/WarrantyClaimDetailPage.jsx');
const repairQueueWorkspace = read(
  'src/features/repair/queue/workspace/components/RepairQueueWorkspace.jsx'
);
const repairQueuePolicy = read(
  'src/features/repair/queue/workspace/policies/repairQueuePolicy.js'
);
const repairDetailWorkspace = read(
  'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
);
const warrantyClaimQueueWorkspace = read(
  'src/features/repair/claimQueue/workspace/components/WarrantyClaimQueueWorkspace.jsx'
);
const warrantyClaimQueuePolicy = read(
  'src/features/repair/claimQueue/workspace/policies/warrantyClaimQueuePolicy.js'
);
const warrantyClaimDetailWorkspace = read(
  'src/features/repair/claimDetail/workspace/components/WarrantyClaimDetailWorkspace.jsx'
);

const runtimePages = [jobsPage, detailPage, claimsPage, claimDetailPage];
const runtimeStateWorkspaces = [
  repairQueueWorkspace,
  repairDetailWorkspace,
  warrantyClaimQueueWorkspace,
  warrantyClaimDetailWorkspace,
];

describe('repair operations workspace behavior contract', () => {
  it('keeps repair runtime store authority across current operational pages', () => {
    for (const source of [intakePage, ...runtimePages]) {
      expect(source).toContain('useRepairRuntimeStore');
    }
    expect(jobsPage).toContain('loadJobs');
    expect(detailPage).toContain('loadJob');
    expect(claimsPage).toContain('loadClaims');
    expect(claimDetailPage).toContain('loadClaim');
  });

  it('preserves repair queue search, derived external-repair lane projection, and navigation across workspace ownership', () => {
    expect(jobsPage).toContain("const [query, setQuery] = useState('')");
    expect(jobsPage).toContain('projectRepairQueue(jobs, query)');
    expect(jobsPage).toContain('RepairQueueWorkspace');
    expect(repairQueuePolicy).toContain('job?.repairAsset?.serialNumber');
    expect(repairQueuePolicy).toContain('job?.repairAsset?.imei');
    expect(repairQueuePolicy).not.toContain('job?.stockItem?.serialNumber');
    expect(repairQueuePolicy).not.toContain('job?.device?.imei');
    expect(repairQueuePolicy).toContain('job?.activeSubcontract?.providerName');
    expect(repairQueuePolicy).toContain('projectRepairQueueItem');
    expect(repairQueuePolicy).toContain("queueStatus: 'EXTERNAL_REPAIR'");
    expect(repairQueuePolicy).toContain('queueStatus: job?.status');
    expect(jobsPage).toContain('/pos/services/repairs/${job.id}');
  });

  it('preserves warranty claim queue search, active-lane projection, and navigation', () => {
    expect(claimsPage).toContain("const [query, setQuery] = useState('')");
    expect(claimsPage).toContain('projectWarrantyClaimQueue(claims, query)');
    expect(claimsPage).toContain('WarrantyClaimQueueWorkspace');
    expect(warrantyClaimQueuePolicy).toContain('claim?.claimAsset?.serialNumber');
    expect(warrantyClaimQueuePolicy).toContain('claim?.claimAsset?.imei');
    expect(warrantyClaimQueuePolicy).not.toContain('claim?.device?.imei');
    expect(warrantyClaimQueuePolicy).toContain('groupByStatus(filtered, CLAIM_LANES)');
    expect(warrantyClaimQueuePolicy).toContain('lane.items.length > 0');
    expect(claimsPage).toContain('/pos/services/warranty-claims/${claim.id}');
  });

  it('preserves repair detail workflow mutations and claim handoff across workspace ownership', () => {
    expect(detailPage).toContain('transitionWorkflow');
    expect(detailPage).toContain('handleWorkflowAction');
    expect(detailPage).toContain('addPart');
    expect(detailPage).toContain('openClaim');
    expect(detailPage).toContain('RepairDetailWorkspace');
    expect(detailPage).toContain('onWorkflowAction={handleWorkflowAction}');
    expect(detailPage).toContain('onAddPart={(payload) => addPart(repairJobId, payload)}');
    expect(detailPage).toContain('/pos/services/warranty-claims/${created.id}');
    expect(repairDetailWorkspace).toContain('onWorkflowAction={onWorkflowAction}');
    expect(repairDetailWorkspace).toContain('onAddPart={onAddPart}');
    expect(repairDetailWorkspace).toContain('onOpenClaim={onOpenClaim}');
  });

  it('preserves serialized warranty claim detail transition and repair handoff across workspace ownership', () => {
    expect(claimDetailPage).toContain('transitionClaim');
    expect(claimDetailPage).toContain('WarrantyClaimDetailWorkspace');
    expect(claimDetailPage).toContain('const handleTransition = async (payload) =>');
    expect(claimDetailPage).toContain('transitionRef.current');
    expect(claimDetailPage).toContain('await transitionClaim(claimId, payload)');
    expect(claimDetailPage).toContain('await loadClaim(claimId)');
    expect(claimDetailPage).toContain('feedback.actionSuccess');
    expect(claimDetailPage).toContain('feedback.actionError');
    expect(claimDetailPage).toContain('onTransition={handleTransition}');
    expect(claimDetailPage).toContain('onOpenRepair={(id) =>');
    expect(claimDetailPage).toContain('/pos/services/repairs/${id}');
    expect(warrantyClaimDetailWorkspace).toContain('onTransition={onTransition}');
    expect(warrantyClaimDetailWorkspace).toContain('onOpenRepair={onOpenRepair}');
  });

  it('preserves intake customer, device, repair creation, and external-device evidence flow across workspace ownership', () => {
    expect(intakeWorkspace).toContain('RepairDeviceSearchPanel');
    expect(intakeWorkspace).toContain('RepairCustomerSection');
    expect(intakeWorkspace).toContain('CustomerWarrantyAssets');
    expect(intakePage).toContain('runtime.createJob');
    expect(intakePage).toContain('runtime.createExternalIntake');
    expect(intakePage).toContain('repairApi.saveIntakeEvidence');
    expect(intakePage).toContain('navigationState.evidenceWarning = error.message');
    expect(intakePage).toContain('navigationState.pendingIntakeEvidence = externalEvidence');
  });

  it('preserves customer access, estimate approval, handover, and intake evidence surfaces across workspace ownership', () => {
    expect(repairDetailWorkspace).toContain('RepairTrackingAccessPanel');
    expect(repairDetailWorkspace).toContain('RepairEstimateApprovalPanel');
    expect(repairDetailWorkspace).toContain('RepairHandoverPanel');
    expect(repairDetailWorkspace).toContain('IntakeEvidencePanel');
    expect(detailPage).toContain('evidenceWarning={location.state?.evidenceWarning}');
  });

  it('keeps loading, error, empty, and retry presentation semantics intact across workspace ownership', () => {
    for (const source of runtimeStateWorkspaces) {
      expect(source).toContain('RuntimeStatePanel');
      expect(source).toContain('loading={loading}');
      expect(source).toContain('error={error}');
      expect(source).toContain('onRetry={onRetry}');
    }

    expect(intakeWorkspace).toContain('RuntimeStatePanel');
    expect(intakeWorkspace).toContain('loading={runtime.loading}');
    expect(intakeWorkspace).toContain('error={runtime.error}');
    expect(intakeWorkspace).toContain('onRetry={onRetry}');
    expect(warrantyClaimQueueWorkspace).toContain('filteredClaims.length');
    expect(warrantyClaimQueueWorkspace).toContain('activeLanes.length');
  });
});
