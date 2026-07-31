const normalizeText = (value) => String(value ?? '').trim();

export const projectReceiptBarcodeQueryParams = (input = {}) => {
  const mode = String(input.mode || 'UNPRINTED').toUpperCase() === 'REPRINT'
    ? 'REPRINT'
    : 'UNPRINTED';
  const codeKeyword = normalizeText(input.codeKeyword ?? input.q);
  const supplierKeyword = normalizeText(input.supplierKeyword ?? input.supplier);
  const supplierId = Number(input.supplierId);
  const limitNumber = Number(input.limit);
  const limit = Number.isFinite(limitNumber)
    ? Math.min(Math.max(Math.trunc(limitNumber), 1), 100)
    : 50;

  return {
    printed: mode === 'REPRINT',
    ...(codeKeyword ? { q: codeKeyword } : {}),
    ...(Number.isFinite(supplierId) && supplierId > 0
      ? { supplierId }
      : supplierKeyword
        ? { supplier: supplierKeyword }
        : {}),
    limit,
  };
};

export const projectReceiptBarcodeSummary = (receipt = {}) => ({
  id: receipt.id ?? receipt.receiptId ?? null,
  receiptCode: normalizeText(
    receipt.receiptCode ?? receipt.code ?? receipt.receiptNumber
  ),
  purchaseOrderCode: normalizeText(
    receipt.purchaseOrderCode ?? receipt.poCode ?? receipt.purchaseOrder?.code
  ),
  supplierId: receipt.supplierId ?? receipt.supplier?.id ?? null,
  supplierName: normalizeText(
    receipt.supplierName ?? receipt.supplier?.name ?? receipt.Supplier?.name
  ),
  printed: Boolean(receipt.printed ?? receipt.isPrinted),
  barcodeCount: Number(receipt.barcodeCount ?? receipt.totalBarcodes ?? 0) || 0,
  sourceReceipt: receipt,
});

export const projectReceiptBarcodeQueryResult = (response) => {
  const sourceRows = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.receipts)
        ? response.receipts
        : [];

  return {
    receipts: sourceRows.map(projectReceiptBarcodeSummary),
    total: Number(response?.total ?? sourceRows.length) || 0,
    sourceResponse: response,
  };
};

export const projectReceiptBarcodeQueryError = (
  error,
  fallback = 'โหลดรายการใบรับสำหรับบาร์โค้ดไม่สำเร็จ'
) => {
  const backendMessage = normalizeText(
    error?.response?.data?.message ?? error?.response?.data?.error?.message
  );
  if (backendMessage) return backendMessage;

  const message = normalizeText(error?.message);
  if (message && !/^Request failed with status code \d+$/i.test(message)) {
    return message;
  }

  return fallback;
};
