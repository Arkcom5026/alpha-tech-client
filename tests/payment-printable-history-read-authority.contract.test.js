import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/payment/store/paymentStore.js'),
  'utf8',
);

describe('payment printable history read authority contract', () => {
  it('serializes printable payment searches with a shared request sequence', () => {
    expect(source).toContain('let printablePaymentsRequestSequence = 0');
    expect(source).toContain('const requestId = ++printablePaymentsRequestSequence');
    expect(source).toContain('const querySnapshot = {');
    expect(source).toContain('searchPrintablePayments(querySnapshot)');
  });

  it('discards stale success, error, and finally writes', () => {
    expect(source).toContain('requestId !== printablePaymentsRequestSequence');
    expect(source).toContain("return { ok: false, stale: true, items: listSafe }");
    expect(source).toContain("return { ok: false, stale: true, error: err }");
    expect(source).toContain('requestId === printablePaymentsRequestSequence');
    expect(source).toContain('set({ isLoadingPrintablePayments: false })');
  });

  it('returns observable read outcomes', () => {
    expect(source).toContain("return { ok: true, stale: false, items: listSafe }");
    expect(source).toContain("return { ok: false, stale: false, error: err }");
  });
});
