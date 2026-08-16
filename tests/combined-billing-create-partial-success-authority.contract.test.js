import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/combinedBilling/pages/CombinedBillingPage.jsx'),
  'utf8',
);

describe('Combined Billing create partial-success authority', () => {
  it('owns create synchronously and snapshots the command before persistence', () => {
    expect(source).toContain('const confirmRef = useRef(false);');
    expect(source).toContain('if (confirmRef.current || mutationBusy');
    expect(source).toContain('const customerIdSnapshot = Number(customer.id);');
    expect(source).toContain('const command = {');
    expect(source).toContain('await confirmDocumentWorkspaceAction(command)');
  });

  it('keeps conflicting controls frozen for the complete create lifecycle', () => {
    expect(source).toContain('const mutationBusy = loading || confirming;');
    expect(source).toContain('disabled={!ready || mutationBusy}');
    expect(source).toContain('disabled={mutationBusy}');
    expect(source).toContain("confirming ? 'กำลังสร้างใบส่งของรวม...' : 'ยืนยันสร้างใบส่งของรวม'");
  });

  it('reports post-create refresh failure as partial success instead of create failure', () => {
    const successIndex = source.indexOf('feedback.actionSuccess(successMessage');
    const refreshIndex = source.indexOf('await loadDocumentWorkspaceAction(customerIdSnapshot)');
    const partialIndex = source.indexOf('refresh-after-create:error');
    expect(successIndex).toBeGreaterThan(-1);
    expect(refreshIndex).toBeGreaterThan(successIndex);
    expect(partialIndex).toBeGreaterThan(refreshIndex);
    expect(source).toContain('สร้างใบส่งของรวมสำเร็จแล้ว แต่รีเฟรชข้อมูลล่าสุดไม่สำเร็จ');
  });
});
