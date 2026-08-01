import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Missing Cost Resolution lifecycle UI contract', () => {
  const api = read('src/features/inventoryRecovery/missingCostResolution/api/missingCostResolutionApi.js');
  const hooks = read('src/features/inventoryRecovery/missingCostResolution/hooks/useMissingCostResolutionWorkflow.js');
  const panel = read('src/features/inventoryRecovery/missingCostResolution/components/MissingCostResolutionWorkflowPanel.jsx');
  const detail = read('src/features/inventoryRecovery/missingCostResolution/pages/MissingCostResolutionDetailPage.jsx');

  it('uses the authenticated API client and never sends branchId authority', () => {
    expect(api).toContain("import apiClient from '@/utils/apiClient'");
    expect(api).toContain('/evidence-versions');
    expect(api).toContain('/transitions');
    expect(api).not.toMatch(/branchId\s*:/);
  });

  it('builds evidence from current detail snapshot and positive proposed cost', () => {
    expect(panel).toContain('expectedSnapshotHash: candidate.sourceSnapshotHash');
    expect(panel).toContain('stockBalanceId: candidate.stockBalanceId');
    expect(panel).toContain('productId: candidate.productId');
    expect(panel).toContain('proposedUnitCost: Number(form.proposedUnitCost)');
    expect(panel).toContain('min="0.01"');
  });

  it('supports the certified lifecycle without direct inventory mutation', () => {
    for (const status of ['SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED_FOR_CORRECTION', 'CANCELLED']) {
      expect(panel).toContain(status);
    }
    expect(panel).not.toContain('StockBalance');
    expect(panel).not.toMatch(/apiClient\.(put|patch|delete)/);
  });

  it('invalidates queue, detail, audit and recovery projections after mutation', () => {
    expect(hooks).toContain("['missing-cost-resolution', 'detail'");
    expect(hooks).toContain("['missing-cost-resolution', 'audit-history'");
    expect(hooks).toContain("['missing-cost-resolution', 'queue']");
    expect(hooks).toContain("['missing-cost-recovery'");
  });

  it('integrates the workflow panel inside resolution detail ownership', () => {
    expect(detail).toContain("import MissingCostResolutionWorkflowPanel");
    expect(detail).toContain('<MissingCostResolutionWorkflowPanel detail={detail} />');
  });
});
