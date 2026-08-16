import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier payment detail read authority', () => {
  it('propagates supplier payment detail load failures through store state', () => {
    const store = read('src/features/supplierPayment/store/supplierPaymentStore.js');
    expect(store).toContain('set({ isSupplierPaymentLoading: true, supplierPaymentError: null })');
    expect(store).toContain('supplierPaymentError: message');
    expect(store).toContain('throw err;');
  });

  it('surfaces loading and error feedback without production debug logs', () => {
    const page = read('src/features/supplierPayment/pages/SupplierPaymentDetailPage.jsx');
    expect(page).toContain('isSupplierPaymentLoading');
    expect(page).toContain('supplierPaymentError');
    expect(page).toContain('feedback.actionError(');
    expect(page).not.toContain("console.log('selectedSupplier");
    expect(page).not.toContain("console.log('supplierPayments");
  });
});
