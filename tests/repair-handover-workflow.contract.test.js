import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair handover workflow contract', () => {
  it('shows handover only after QC reaches ready-for-delivery', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(panel).toContain("['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED'].includes(workflowStatus)");
    expect(panel).toContain("workflowStatus === 'READY_FOR_DELIVERY'");
    expect(panel).toContain('รอลูกค้ากดยืนยันรับเครื่องจากลิงก์ติดตาม');
  });

  it('requires the three delivery checks before finalization', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(panel).toContain('checks.paymentConfirmed');
    expect(panel).toContain('checks.deviceReturned');
    expect(panel).toContain('checks.accessoriesReturned');
    expect(panel).toContain('ยืนยันส่งมอบขั้นสุดท้าย');
    expect(panel).toContain('finalizeHandover');
  });

  it('closes the repair only after handover advances workflow to DELIVERED', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

    expect(panel).toContain("action: 'CLOSE'");
    expect(panel).toContain("expectedWorkflowStatus: 'DELIVERED'");
    expect(panel).toContain('ปิดใบงานซ่อม');
    expect(workspace).toContain('onWorkflowAction={onWorkflowAction}');
    expect(workspace).toContain('onJobReload={onRetry}');
  });
});
