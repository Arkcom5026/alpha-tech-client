import {
  auditReceiptBarcodesApi,
  finalizeReceiptIfNeededApi,
} from '../api/barcodeAuditCompletionApi';
import {
  normalizeReceiptIdentity,
  projectAuditOptions,
  projectBarcodeAudit,
  projectReceiptCompletion,
} from '../projections/barcodeAuditCompletionProjection';

export const auditReceiptBarcodes = async (
  receiptId,
  options = {},
  dependencies = {}
) => {
  const id = normalizeReceiptIdentity(receiptId);
  const request = dependencies.auditReceiptBarcodesApi ?? auditReceiptBarcodesApi;
  const response = await request(id, projectAuditOptions(options));
  return projectBarcodeAudit(response);
};

export const finalizeReceiptIfNeeded = async (receiptId, dependencies = {}) => {
  const id = normalizeReceiptIdentity(receiptId);
  const request = dependencies.finalizeReceiptIfNeededApi ?? finalizeReceiptIfNeededApi;
  const response = await request(id);
  return projectReceiptCompletion(response);
};

export const auditAndFinalizeReceipt = async (receiptId, options = {}, dependencies = {}) => {
  const audit = await auditReceiptBarcodes(receiptId, options, dependencies);
  if (!audit.ok || audit.missing > 0 || audit.invalid > 0) {
    return { ok: false, finalized: false, audit, completion: null };
  }

  const completion = await finalizeReceiptIfNeeded(receiptId, dependencies);
  return { ok: completion.ok, finalized: completion.finalized, audit, completion };
};
