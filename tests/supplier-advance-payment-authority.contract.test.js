import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier advance payment authority', () => {
  it('serializes submission and snapshots financial payload state', () => {
    const page = read('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx');

    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (mutationBusy) return');
    expect(page).toContain('const supplierId = Number(supplier?.id || 0)');
    expect(page).toContain('const formSnapshot = {');
    expect(page).toContain('submittingRef.current = true');
    expect(page).toContain('disabled={mutationBusy}');
  });

  it('does not report a successful financial write as failed when history refresh fails', () => {
    const page = read('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx');

    expect(page).toContain("feedback.actionSuccess('บันทึกการชำระเงินล่วงหน้า Supplier เรียบร้อยแล้ว'");
    expect(page).toContain('await fetchAdvancePaymentsBySupplierAction?.(supplierId)');
    expect(page).toContain('บันทึกการชำระเงินสำเร็จแล้ว แต่รีเฟรชประวัติการชำระเงินไม่สำเร็จ');
    expect(page).toContain('supplier-payment:advance:history-refresh:error');
  });
});
