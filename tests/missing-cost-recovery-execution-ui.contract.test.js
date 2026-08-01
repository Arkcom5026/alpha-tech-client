import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Missing Cost Recovery controlled execution UI contract', () => {
  const component = read('src/features/inventoryRecovery/missingCostResolution/components/MissingCostRecoveryExecutionPanel.jsx');
  const api = read('src/features/inventoryRecovery/missingCostResolution/api/missingCostResolutionApi.js');
  const detail = read('src/features/inventoryRecovery/missingCostResolution/pages/MissingCostResolutionDetailPage.jsx');

  it('requests fresh preview and plan from server before execution', () => {
    expect(component).toContain('useMissingCostRecoveryPreview');
    expect(component).toContain('useMissingCostRecoveryApprovalPlan');
    expect(component).toContain('VALIDATED_PREVIEW_ONLY');
    expect(component).toContain('VALIDATED_APPROVAL_PLAN_ONLY');
  });

  it('submits exact plan authority and idempotency header without client branch authority', () => {
    expect(api).toContain("'X-Idempotency-Key'");
    expect(component).toContain('executionPlanId: plan.executionPlanId');
    expect(component).toContain('executionPlanHash: plan.executionPlanHash');
    expect(component).toContain('sourceSnapshotHash: plan.sourceSnapshotHash');
    expect(component).not.toMatch(/payload\s*=\s*[^;]*branchId/s);
    expect(component).not.toContain('approvalIdentity:');
  });

  it('requires explicit confirmation and handles stale duplicate and forbidden states', () => {
    expect(component).toContain('checked={confirmed}');
    expect(component).toContain("includes('STALE')");
    expect(component).toContain("includes('DUPLICATE')");
    expect(component).toContain('response?.status === 403');
  });

  it('renders post-recovery audit and resulting inventory authority', () => {
    expect(component).toContain('useMissingCostRecoveryAudit');
    expect(component).toContain('resultingInventoryAuthority');
    expect(component).toContain('latestExecution?.eventHash');
    expect(detail).toContain('<MissingCostRecoveryExecutionPanel detail={detail} />');
  });
});
