import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspaceSource = read(
  'src/features/repair/claimDetail/workspace/components/WarrantyClaimDetailWorkspace.jsx'
);
const pageSource = read('src/features/repair/pages/WarrantyClaimDetailPage.jsx');

describe('warranty claim detail workspace foundation contract', () => {
  it('keeps claim detail presentation free of store, router, lifecycle, and mutation authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('useNavigate');
    expect(workspaceSource).not.toContain('useParams');
    expect(workspaceSource).not.toContain('transitionClaim(');
    expect(workspaceSource).not.toContain('loadClaim(');
  });

  it('preserves loading, error, missing-claim, and retry presentation through props', () => {
    expect(workspaceSource).toContain('loading={loading}');
    expect(workspaceSource).toContain('error={error}');
    expect(workspaceSource).toContain('empty={!loading && !error && !claim}');
    expect(workspaceSource).toContain('emptyText="ไม่พบงานเคลม"');
    expect(workspaceSource).toContain('onRetry={onRetry}');
  });

  it('preserves transition and repair handoff intents without acquiring their authority', () => {
    expect(workspaceSource).toContain('onTransition={onTransition}');
    expect(workspaceSource).toContain('onOpenRepair={onOpenRepair}');
    expect(workspaceSource).toContain('submitting={submitting}');
  });

  it('keeps current page lifecycle, mutation, and navigation authority intact before cutover', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('loadClaim');
    expect(pageSource).toContain('transitionClaim');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('navigate(`/${shopSlug}/pos/services/repairs/${id}`)');
  });
});
