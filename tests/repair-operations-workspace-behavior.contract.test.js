import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const jobsPage = read('src/features/repair/pages/RepairJobsPage.jsx');
const detailPage = read('src/features/repair/pages/RepairJobDetailPage.jsx');

const pages = [jobsPage, detailPage];

describe('repair operations workspace behavior contract', () => {
  it('keeps repair runtime store authority in both operational pages', () => {
    for (const source of pages) {
      expect(source).toContain('useRepairRuntimeStore');
    }
    expect(jobsPage).toContain('loadJobs');
    expect(detailPage).toContain('loadJob');
  });

  it('preserves repair queue search and lane projection semantics', () => {
    expect(jobsPage).toContain("const [query, setQuery] = useState('')");
    expect(jobsPage).toContain('groupByStatus(filtered, REPAIR_LANES)');
    expect(jobsPage).toContain('job.stockItem?.serialNumber');
    expect(jobsPage).toContain('job.device?.imei');
  });

  it('preserves repair queue navigation into the selected job', () => {
    expect(jobsPage).toContain('onOpen={(job) =>');
    expect(jobsPage).toContain('/pos/services/repairs/${job.id}');
  });

  it('preserves detail mutations for transition, parts, and claim handoff', () => {
    expect(detailPage).toContain('transitionJob');
    expect(detailPage).toContain('addPart');
    expect(detailPage).toContain('openClaim');
    expect(detailPage).toContain('onTransition={(payload) => transitionJob(repairJobId, payload)}');
    expect(detailPage).toContain('onAddPart={(payload) => addPart(repairJobId, payload)}');
  });

  it('preserves customer access, estimate approval, handover, and intake evidence surfaces', () => {
    expect(detailPage).toContain('RepairTrackingAccessPanel');
    expect(detailPage).toContain('RepairEstimateApprovalPanel');
    expect(detailPage).toContain('RepairHandoverPanel');
    expect(detailPage).toContain('IntakeEvidencePanel');
  });

  it('keeps loading, error, empty, and retry presentation semantics intact', () => {
    for (const source of pages) {
      expect(source).toContain('RuntimeStatePanel');
      expect(source).toContain('loading={loading}');
      expect(source).toContain('error={error}');
      expect(source).toContain('onRetry=');
    }
  });
});
