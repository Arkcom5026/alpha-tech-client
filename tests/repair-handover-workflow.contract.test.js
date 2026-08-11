import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair handover workflow contract', () => {
  it('shows handover when work is ready regardless of whether QC was used', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(panel).toContain("['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED'].includes(workflowStatus)");
    expect(panel).toContain("workflowStatus === 'READY_FOR_DELIVERY'");
    expect(panel).toContain('ลูกค้าสามารถยืนยันจากลิงก์ติดตาม หรือพนักงานยืนยันผู้รับที่หน้าร้านได้ทันที');
  });

  it('uses one consolidated custody confirmation instead of three separate checks', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(panel).toContain('handoverConfirmed');
    expect(panel).toContain('ยืนยันว่ารับชำระและส่งคืนเครื่อง/อุปกรณ์ครบแล้ว');
    expect(panel).toContain('การยืนยันนี้เป็นหลักฐานการส่งมอบแทนการติ๊กหลายรายการ');
    expect(panel).toContain('finalizeHandover');
    expect(panel).not.toContain('checks.paymentConfirmed');
    expect(panel).not.toContain('checks.deviceReturned');
    expect(panel).not.toContain('checks.accessoriesReturned');
  });

  it('allows counter receiver confirmation and closes automatically after delivery', () => {
    const panel = read('src/features/repair/components/RepairHandoverPanel.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

    expect(panel).toContain('receiverName');
    expect(panel).toContain('ส่งมอบและปิดงาน');
    expect(panel).toContain("action: 'CLOSE'");
    expect(panel).toContain("expectedWorkflowStatus: 'DELIVERED'");
    expect(panel).toContain('ปิดใบงานอัตโนมัติหลังยืนยันส่งมอบเครื่องคืนลูกค้าเรียบร้อยแล้ว');
    expect(workspace).toContain('onWorkflowAction={onWorkflowAction}');
    expect(workspace).toContain('onJobReload={onRetry}');
  });
});
