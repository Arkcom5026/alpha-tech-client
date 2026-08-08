import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspaceSource = read(
  'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
);
const pageSource = read('src/features/repair/pages/RepairJobDetailPage.jsx');

describe('repair detail workspace foundation contract', () => {
  it('keeps detail workspace presentation free of store, router, and lifecycle authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('useNavigate');
    expect(workspaceSource).not.toContain('useParams');
    expect(workspaceSource).not.toContain('useLocation');
  });

  it('preserves loading, error, missing-job, and retry presentation through props', () => {
    expect(workspaceSource).toContain('loading={loading}');
    expect(workspaceSource).toContain('error={error}');
    expect(workspaceSource).toContain('empty={!loading && !error && !job}');
    expect(workspaceSource).toContain('emptyText="ไม่พบงานซ่อม"');
    expect(workspaceSource).toContain('onRetry={onRetry}');
  });

  it('preserves transition, part, and claim intents without acquiring mutation authority', () => {
    expect(workspaceSource).toContain('onTransition={onTransition}');
    expect(workspaceSource).toContain('onAddPart={onAddPart}');
    expect(workspaceSource).toContain('onOpenClaim={onOpenClaim}');
    expect(workspaceSource).not.toContain('transitionJob');
    expect(workspaceSource).not.toContain('addPart(');
    expect(workspaceSource).not.toContain('openClaim(');
  });

  it('preserves customer access, estimate approval, handover, and intake evidence presentation', () => {
    expect(workspaceSource).toContain('RepairTrackingAccessPanel');
    expect(workspaceSource).toContain('RepairEstimateApprovalPanel');
    expect(workspaceSource).toContain('RepairHandoverPanel');
    expect(workspaceSource).toContain('IntakeEvidencePanel');
    expect(workspaceSource).toContain('warning={evidenceWarning}');
  });

  it('keeps current page mutation and navigation authority intact before cutover', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('transitionJob');
    expect(pageSource).toContain('addPart');
    expect(pageSource).toContain('openClaim');
    expect(pageSource).toContain('handleOpenClaim');
    expect(pageSource).toContain('/pos/services/warranty-claims/${created.id}');
  });
});
