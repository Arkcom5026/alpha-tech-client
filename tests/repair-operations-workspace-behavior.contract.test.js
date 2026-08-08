import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const intakePage = read('src/features/repair/pages/RepairIntakePage.jsx');
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

const runtimePages = [jobsPage, detailPage, claimsPage, claimDetailPage];

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

  it('preserves repair queue search, lane projection, and navigation across workspace ownership', () => {
    expect(jobsPage).toContain("const [query, setQuery] = useState('')");
    expect(jobsPage).toContain('projectRepairQueue(jobs, query)');
    expect(jobsPage).toContain('RepairQueueWorkspace');
    expect(repairQueuePolicy).toContain('job?.stockItem?.serialNumber');
    expect(repairQueuePolicy).toContain('job?.device?.imei');
    expect(repairQueuePolicy).toContain('groupByStatus(filtered, REPAIR_LANES)');
    expect(jobsPage).toContain('/pos/services/repairs/${job.id}');
  });

  it('preserves warranty claim queue search, active-lane projection, and navigation', () => {
    expect(claimsPage).toContain("const [query, setQuery] = useState('')");
    expect(claimsPage).toContain('groupByStatus(filtered, CLAIM_LANES)');
    expect(claimsPage).toContain('.filter((lane) => lane.items.length > 0)');
    expect(claimsPage).toContain('claim.claimAsset?.serialNumber');
    expect(claimsPage).toContain('claim.device?.imei');
    expect(claimsPage).toContain('/pos/services/warranty-claims/${claim.id}');
  });

  it('preserves repair detail mutations for transition, parts, and claim handoff', () => {
    expect(detailPage).toContain('transitionJob');
    expect(detailPage).toContain('addPart');
    expect(detailPage).toContain('openClaim');
    expect(detailPage).toContain('onTransition={(payload) => transitionJob(repairJobId, payload)}');
    expect(detailPage).toContain('onAddPart={(payload) => addPart(repairJobId, payload)}');
    expect(detailPage).toContain('/pos/services/warranty-claims/${created.id}');
  });

  it('preserves warranty claim detail transition and repair handoff semantics', () => {
    expect(claimDetailPage).toContain('transitionClaim');
    expect(claimDetailPage).toContain('onTransition={(payload) => transitionClaim(claimId, payload)}');
    expect(claimDetailPage).toContain('onOpenRepair={(id) =>');
    expect(claimDetailPage).toContain('/pos/services/repairs/${id}');
  });

  it('preserves intake customer, device, repair creation, and external-device evidence flow', () => {
    expect(intakePage).toContain('RepairDeviceSearchPanel');
    expect(intakePage).toContain('RepairCustomerSection');
    expect(intakePage).toContain('CustomerWarrantyAssets');
    expect(intakePage).toContain('runtime.createJob');
    expect(intakePage).toContain('runtime.createExternalIntake');
    expect(intakePage).toContain('repairApi.saveIntakeEvidence');
    expect(intakePage).toContain('state: { evidenceWarning: error.message }');
  });

  it('preserves customer access, estimate approval, handover, and intake evidence surfaces', () => {
    expect(detailPage).toContain('RepairTrackingAccessPanel');
    expect(detailPage).toContain('RepairEstimateApprovalPanel');
    expect(detailPage).toContain('RepairHandoverPanel');
    expect(detailPage).toContain('IntakeEvidencePanel');
  });

  it('keeps loading, error, empty, and retry presentation semantics intact across workspace ownership', () => {
    expect(repairQueueWorkspace).toContain('RuntimeStatePanel');
    expect(repairQueueWorkspace).toContain('loading={loading}');
    expect(repairQueueWorkspace).toContain('error={error}');
    expect(repairQueueWorkspace).toContain('onRetry={onRetry}');

    for (const source of [detailPage, claimsPage, claimDetailPage]) {
      expect(source).toContain('RuntimeStatePanel');
      expect(source).toContain('loading={loading}');
      expect(source).toContain('error={error}');
      expect(source).toContain('onRetry=');
    }
    expect(intakePage).toContain('RuntimeStatePanel');
    expect(intakePage).toContain('loading={runtime.loading}');
    expect(intakePage).toContain('error={runtime.error}');
    expect(intakePage).toContain('onRetry={retryCurrentSearch}');
  });
});
