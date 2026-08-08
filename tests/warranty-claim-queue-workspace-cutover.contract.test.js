import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pageSource = read('src/features/repair/pages/WarrantyClaimsPage.jsx');
const workspaceSource = read(
  'src/features/repair/claimQueue/workspace/components/WarrantyClaimQueueWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/claimQueue/workspace/policies/warrantyClaimQueuePolicy.js'
);

describe('warranty claim queue workspace cutover contract', () => {
  it('composes claim queue presentation through the workspace owner', () => {
    expect(pageSource).toContain('WarrantyClaimQueueWorkspace');
    expect(pageSource).toContain('projectWarrantyClaimQueue(claims, query)');
    expect(pageSource).toContain('filteredClaims={filtered}');
    expect(pageSource).toContain('activeLanes={activeLanes}');
  });

  it('keeps store lifecycle and route navigation authority in the page', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('loadClaims');
    expect(pageSource).toContain('useEffect');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('useParams');
    expect(pageSource).toContain('/pos/services/warranty-claims/${claim.id}');
  });

  it('removes duplicated claim projection and presentation implementation from the page', () => {
    expect(pageSource).not.toContain('groupByStatus');
    expect(pageSource).not.toContain('CLAIM_LANES');
    expect(pageSource).not.toContain('claim.claimAsset?.serialNumber');
    expect(pageSource).not.toContain('claim.device?.imei');
    expect(pageSource).not.toContain('RepairShellHeader');
    expect(pageSource).not.toContain('RuntimeStatePanel');
    expect(pageSource).not.toContain('QueueBoard');
  });

  it('keeps policy and presentation free of store and router authority', () => {
    expect(policySource).not.toContain('react');
    expect(policySource).not.toContain('useRepairRuntimeStore');
    expect(policySource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('useNavigate');
    expect(workspaceSource).not.toContain('useParams');
  });
});
