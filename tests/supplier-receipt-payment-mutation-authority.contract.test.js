import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Supplier receipt payment mutation authority', () => {
  it('serializes receipt-based payment and freezes auto-selection while submitting', () => {
    const form = read('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');

    expect(form).toContain('const submittingRef = useRef(false)');
    expect(form).toContain('if (submitting || submittingRef.current) return');
    expect(form).toContain("if (submittingRef.current || formData.paymentType !== 'RECEIPT_BASED') return");
    expect(form).toContain('const supplierIdSnapshot = supplierId');
    expect(form).toContain('const formSnapshot = {');
    expect(form).toContain('receipts: formData.receipts.map((row) => ({ ...row }))');
    expect(form).toContain('const interactionBusy = submitting || submittingRef.current');
    expect(form).toContain('isLoading={isReceiptsLoading || interactionBusy}');
    expect(form).toContain("'supplier-payment:receipt:create:success'");
    expect(form).toContain("'supplier-payment:receipt:create:error'");
  });
});
