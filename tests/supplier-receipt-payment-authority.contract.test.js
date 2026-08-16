import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier receipt payment authority', () => {
  it('serializes financial submission and snapshots receipt allocations', () => {
    const page = read('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');

    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('const mutationBusy = submitting || submittingRef.current');
    expect(page).toContain('const paymentSupplierId = supplierId');
    expect(page).toContain('receipts: formData.receipts.map((row) => ({ ...row }))');
    expect(page).toContain('chequeDetails: { ...formData.chequeDetails }');
    expect(page).toContain('submittingRef.current = true');
  });

  it('locks receipt search and allocation edits while a payment is being written', () => {
    const page = read('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');

    expect(page).toContain('if (submittingRef.current) return');
    expect(page).toContain('if (mutationBusy) return');
    expect(page).toContain('isLoading={isReceiptsLoading || mutationBusy}');
    expect(page).toContain('disabled={mutationBusy}');
  });
});
