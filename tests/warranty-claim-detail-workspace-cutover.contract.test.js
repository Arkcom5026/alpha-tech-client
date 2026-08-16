import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pageSource = read('src/features/repair/pages/WarrantyClaimDetailPage.jsx');
const workspaceSource = read(
  'src/features/repair/claimDetail/workspace/components/WarrantyClaimDetailWorkspace.jsx'
);

describe('warranty claim detail workspace cutover contract', () => {
  it('composes claim detail presentation through the workspace owner', () => {
    expect(pageSource).toContain('WarrantyClaimDetailWorkspace');
    expect(pageSource).toContain('claim={activeClaim}');
    expect(pageSource).toContain('loading={loading}');
    expect(pageSource).toContain('submitting={submitting}');
    expect(pageSource).toContain('error={error}');
  });

  it('keeps route, lifecycle, serialized mutation, and repair navigation authority in the page', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('useParams');
    expect(pageSource).toContain('useEffect');
    expect(pageSource).toContain('useRef');
    expect(pageSource).toContain('loadClaim');
    expect(pageSource).toContain('transitionClaim');
    expect(pageSource).toContain('const handleTransition = async (payload) =>');
    expect(pageSource).toContain('transitionRef.current');
    expect(pageSource).toContain('await transitionClaim(claimId, payload)');
    expect(pageSource).toContain('await loadClaim(claimId)');
    expect(pageSource).toContain('feedback.actionSuccess');
    expect(pageSource).toContain('feedback.actionError');
    expect(pageSource).toContain('onRetry={() => loadClaim(claimId)}');
    expect(pageSource).toContain('onTransition={handleTransition}');
    expect(pageSource).toContain('/pos/services/repairs/${id}');
  });

  it('removes duplicated claim detail presentation implementation from the page', () => {
    expect(pageSource).not.toContain('RepairShellHeader');
    expect(pageSource).not.toContain('RuntimeStatePanel');
    expect(pageSource).not.toContain('ClaimRuntimePanel');
  });

  it('keeps workspace presentation free of store, router, lifecycle, and mutation authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('transitionClaim');
    expect(workspaceSource).not.toContain('loadClaim');
    expect(workspaceSource).toContain('onRetry={onRetry}');
    expect(workspaceSource).toContain('onTransition={onTransition}');
    expect(workspaceSource).toContain('onOpenRepair={onOpenRepair}');
  });
});
