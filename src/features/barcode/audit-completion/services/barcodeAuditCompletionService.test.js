import { describe, expect, it, vi } from 'vitest';
import {
  auditAndFinalizeReceipt,
  auditReceiptBarcodes,
  finalizeReceiptIfNeeded,
} from './barcodeAuditCompletionService';

describe('barcode audit completion service', () => {
  it('normalizes identity and audit options before transport', async () => {
    const api = vi.fn().mockResolvedValue({ total: 2 });
    const result = await auditReceiptBarcodes(' 7 ', { includeDetails: false }, { auditReceiptBarcodesApi: api });
    expect(api).toHaveBeenCalledWith('7', { includeDetails: false });
    expect(result.total).toBe(2);
  });

  it('does not finalize when audit contains missing or invalid barcode evidence', async () => {
    const auditApi = vi.fn().mockResolvedValue({ ok: true, missing: 1, invalid: 0 });
    const finalizeApi = vi.fn();
    const result = await auditAndFinalizeReceipt('7', {}, {
      auditReceiptBarcodesApi: auditApi,
      finalizeReceiptIfNeededApi: finalizeApi,
    });
    expect(result).toMatchObject({ ok: false, finalized: false });
    expect(finalizeApi).not.toHaveBeenCalled();
  });

  it('finalizes only after a healthy audit', async () => {
    const auditApi = vi.fn().mockResolvedValue({ ok: true, missing: 0, invalid: 0 });
    const finalizeApi = vi.fn().mockResolvedValue({ status: 'FINALIZED' });
    const result = await auditAndFinalizeReceipt('7', {}, {
      auditReceiptBarcodesApi: auditApi,
      finalizeReceiptIfNeededApi: finalizeApi,
    });
    expect(finalizeApi).toHaveBeenCalledWith('7');
    expect(result).toMatchObject({ ok: true, finalized: true });
  });

  it('retains idempotent completion evidence', async () => {
    const api = vi.fn().mockResolvedValue({ status: 'FINALIZED', alreadyFinalized: true });
    const result = await finalizeReceiptIfNeeded('7', { finalizeReceiptIfNeededApi: api });
    expect(result).toMatchObject({ finalized: true, alreadyFinalized: true });
  });
});
