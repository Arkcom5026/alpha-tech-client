const normalizeId = (value, label = 'receiptId') => {
  const id = String(value ?? '').trim();
  if (!id) throw new Error(`Missing ${label}`);
  return id;
};

export const projectAuditOptions = ({ includeDetails = true } = {}) => ({
  includeDetails: includeDetails !== false,
});

export const projectBarcodeAudit = (response = {}) => {
  const source = response?.data ?? response ?? {};
  const details = Array.isArray(source.details)
    ? source.details
    : Array.isArray(source.items)
      ? source.items
      : [];

  return {
    ok: source.ok !== false,
    receiptId: source.receiptId ?? source.purchaseOrderReceiptId ?? null,
    total: Number(source.total ?? source.totalBarcodes ?? details.length) || 0,
    printed: Number(source.printed ?? source.printedCount ?? 0) || 0,
    scanned: Number(source.scanned ?? source.scannedCount ?? 0) || 0,
    missing: Number(source.missing ?? source.missingCount ?? 0) || 0,
    invalid: Number(source.invalid ?? source.invalidCount ?? 0) || 0,
    details,
    sourceResponse: response,
  };
};

export const projectReceiptCompletion = (response = {}) => {
  const source = response?.data ?? response ?? {};
  return {
    ok: source.ok !== false,
    receiptId: source.receiptId ?? source.id ?? source.purchaseOrderReceiptId ?? null,
    status: source.status ?? source.receiptStatus ?? null,
    finalized: source.finalized === true || source.status === 'COMPLETED' || source.status === 'FINALIZED',
    alreadyFinalized: source.alreadyFinalized === true || source.idempotent === true,
    message: source.message ?? null,
    sourceResponse: response,
  };
};

export const projectAuditCompletionError = (error, fallback = 'ไม่สามารถตรวจสอบหรือปิดใบรับสินค้าได้') => {
  const serverMessage = error?.response?.data?.message ?? error?.response?.data?.error?.message;
  const message = String(serverMessage ?? error?.message ?? '').trim();
  if (!message || /request failed with status code|network error/i.test(message)) return fallback;
  return message;
};

export const normalizeReceiptIdentity = (receiptId) => normalizeId(receiptId);
