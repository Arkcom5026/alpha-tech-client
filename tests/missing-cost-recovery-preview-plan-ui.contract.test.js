import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Missing Cost Recovery preview and plan UI contract', () => {
  const api = read('src/features/inventoryRecovery/missingCostResolution/api/missingCostResolutionApi.js');
  const hooks = read('src/features/inventoryRecovery/missingCostResolution/hooks/useMissingCostResolutionWorkflow.js');
  const panel = read('src/features/inventoryRecovery/missingCostResolution/components/MissingCostRecoveryPreviewPanel.jsx');
  const detail = read('src/features/inventoryRecovery/missingCostResolution/pages/MissingCostResolutionDetailPage.jsx');

  it('reads preview and plan from server-owned GET endpoints', () => {
    expect(api).toContain('/recovery-preview');
    expect(api).toContain('/recovery-approval-plan');
    expect(api).not.toMatch(/branchId\s*:/);
  });

  it('requests plan only after a fresh validated preview', () => {
    expect(panel).toContain("preview?.validation?.result === 'VALIDATED_PREVIEW_ONLY'");
    expect(hooks).toContain('staleTime: 0');
  });

  it('renders stale abort and deterministic plan authority without mutation', () => {
    expect(panel).toContain('preview.validation?.stale');
    expect(panel).toContain('executionPlanId');
    expect(panel).toContain('executionPlanHash');
    expect(panel).toContain('ยังไม่ใช่สิทธิ์แก้สต๊อก');
    expect(panel).not.toContain('executeMissingCostRecovery');
  });

  it('is owned by the resolution detail page', () => {
    expect(detail).toContain('MissingCostRecoveryPreviewPanel');
    expect(detail).toContain('<MissingCostRecoveryPreviewPanel resolution={resolution} />');
  });
});
