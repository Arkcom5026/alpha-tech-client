import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Supplier payment read error authority', () => {
  it('propagates supplier payment history failures without projecting false empty data', () => {
    const store = read('src/features/supplierPayment/store/supplierPaymentStore.js');

    expect(store).toContain("supplierPaymentError: err?.message || 'ไม่สามารถโหลดประวัติการชำระเงินผู้ขายได้'");
    expect(store).toContain("supplierPaymentError: err?.message || 'ไม่สามารถโหลดประวัติการชำระเงินล่วงหน้าได้'");
    expect(store).toContain('throw err;');
    expect(store).toContain('return normalized;');
    expect(store).not.toContain('advancePaymentsBySupplier: { ...state.advancePaymentsBySupplier, [supplierId]: [] }');
  });
});
