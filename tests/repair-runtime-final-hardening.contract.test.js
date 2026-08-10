import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair runtime final hardening contract', () => {
  it('uses canonical workflow labels instead of legacy service status in job detail', () => {
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');
    const utils = read('src/features/repair/utils/repairRuntime.js');

    expect(utils).toContain('REPAIR_WORKFLOW_LANES');
    expect(utils).toContain("{ key: 'READY_FOR_DELIVERY', label: 'พร้อมส่งมอบ' }");
    expect(utils).toContain('REPAIR_WORKFLOW_LABELS');
    expect(runtime).toContain('REPAIR_WORKFLOW_LABELS[workflowStatus]');
    expect(runtime).not.toContain('REPAIR_LABELS[job.status]');
  });

  it('removes legacy free-status transition wiring from the repair detail workspace', () => {
    const page = read('src/features/repair/pages/RepairJobDetailPage.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');

    expect(page).not.toContain('transitionJob');
    expect(page).not.toContain('onTransition=');
    expect(workspace).not.toContain('onTransition');
    expect(runtime).not.toContain('workflowManaged');
    expect(runtime).not.toContain('transition.status');
  });

  it('keeps claim creation optional and constrained to explicit workflow statuses', () => {
    const handoff = read('src/features/repair/components/RepairClaimHandoffPanel.jsx');

    expect(handoff).toContain('CLAIM_OPENABLE_WORKFLOW_STATUSES');
    expect(handoff).toContain('CLAIM_OPENABLE_WORKFLOW_STATUSES.has(workflowStatus)');
    expect(handoff).toContain('เปิดขั้นตอนส่งเคลม');
  });
});
