import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pageSource = read('src/features/repair/pages/RepairJobDetailPage.jsx');
const workspaceSource = read(
  'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
);

describe('repair detail workspace cutover contract', () => {
  it('composes repair detail presentation through the workspace owner', () => {
    expect(pageSource).toContain('RepairDetailWorkspace');
    expect(pageSource).toContain('repairJobId={repairJobId}');
    expect(pageSource).toContain('job={activeJob}');
    expect(pageSource).toContain('evidenceWarning={location.state?.evidenceWarning}');
  });

  it('keeps route, store lifecycle, workflow mutation, and claim navigation authority in the page', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('useLocation');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('useParams');
    expect(pageSource).toContain('loadJob(repairJobId)');
    expect(pageSource).toContain('repairApi.transitionWorkflow(repairJobId');
    expect(pageSource).toContain('addPart(repairJobId, payload)');
    expect(pageSource).toContain('openClaim(repairJobId, value)');
    expect(pageSource).toContain('/pos/services/warranty-claims/${created.id}');
  });

  it('removes duplicated detail presentation implementation from the page', () => {
    expect(pageSource).not.toContain('RepairShellHeader');
    expect(pageSource).not.toContain('RuntimeStatePanel');
    expect(pageSource).not.toContain('JobRuntimePanel');
    expect(pageSource).not.toContain('RepairTrackingAccessPanel');
    expect(pageSource).not.toContain('RepairEstimateApprovalPanel');
    expect(pageSource).not.toContain('RepairHandoverPanel');
    expect(pageSource).not.toContain('IntakeEvidencePanel');
  });

  it('keeps workspace presentation free of store, router, lifecycle, and mutation authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('transitionWorkflow(');
    expect(workspaceSource).not.toContain('addPart(');
    expect(workspaceSource).not.toContain('openClaim(');
    expect(workspaceSource).toContain('onWorkflowAction={onWorkflowAction}');
    expect(workspaceSource).toContain('onAddPart={onAddPart}');
    expect(workspaceSource).toContain('onOpenClaim={onOpenClaim}');
  });
});
