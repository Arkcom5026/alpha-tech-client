import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier payment mutation authority', () => {
  it('serializes advance payment creation and separates history refresh failure', () => {
    const source = read('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx');

    expect(source).toContain('const submittingRef = useRef(false)');
    expect(source).toContain('if (submitting || submittingRef.current) return');
    expect(source).toContain('const formSnapshot = {');
    expect(source).toContain('submittingRef.current = true');
    expect(source).toContain('submittingRef.current = false');
    expect(source).toContain('supplier-payment:advance:history-after-create:error');
    expect(source).toContain('disabled={mutationBusy}');
  });

  it('serializes receipt payment creation and snapshots receipt allocations', () => {
    const source = read('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');

    expect(source).toContain('const submittingRef = useRef(false)');
    expect(source).toContain('if (submitting || submittingRef.current) return');
    expect(source).toContain('const supplierIdSnapshot = supplierId');
    expect(source).toContain('receipts: formData.receipts.map((row) => ({ ...row }))');
    expect(source).toContain("receiptItems: formSnapshot.paymentType === 'RECEIPT_BASED'");
    expect(source).toContain('submittingRef.current = true');
    expect(source).toContain('submittingRef.current = false');
    expect(source).toContain('disabled={mutationBusy}');
  });
});
