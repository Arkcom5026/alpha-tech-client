import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Supplier advance payment mutation authority', () => {
  it('serializes submit, snapshots payment data, separates refresh failure, and locks form interaction', () => {
    const form = read('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx');

    expect(form).toContain('const submittingRef = useRef(false)');
    expect(form).toContain('if (submitting || submittingRef.current) return');
    expect(form).toContain('const supplierId = supplier?.id || null');
    expect(form).toContain('const supplierIdSnapshot = supplierId');
    expect(form).toContain('const formSnapshot = {');
    expect(form).toContain('`supplier-payment:advance:${supplierIdSnapshot}:create:success`');
    expect(form).toContain('`supplier-payment:advance:${supplierIdSnapshot}:history-after-create:error`');
    expect(form).toContain('supplierIdRef.current === supplierIdSnapshot');
    expect(form).toContain('บันทึกสำเร็จแล้ว แต่โหลดประวัติการชำระเงินล่าสุดไม่สำเร็จ');
    expect(form).toContain('const mutationBusy = submitting || submittingRef.current');
    expect(form).toContain('disabled={mutationBusy}');
  });
});
