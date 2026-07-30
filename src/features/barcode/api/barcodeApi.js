// src/features/barcode/api/barcodeApi.js
// Compatibility facade for legacy barcode consumers.

import { generateReceiptBarcodes } from '../generation';
import { loadReceiptBarcodes } from '../receipt-detail';
import { listReceiptsWithBarcodes } from '../receipt-listing';
import {
  listReceiptsReadyToScan,
  listReceiptsReadyToScanSn,
} from '../scan-listing';
import { receiveScannedStockItem } from '@/features/stockItem/receive';
import { updateBarcodeSerialNumber } from '../serial';
import {
  markReceiptBarcodesPrinted,
  reprintReceiptBarcodes,
  searchReceiptsForReprint,
} from '../print-reprint';
import { commitReceiptScans } from '../receipt-completion';
import { auditReceiptBarcodes as auditReceiptBarcodesSlice } from '../audit';

export const generateMissingBarcodes = async (receiptId, options = {}) => {
  const result = await generateReceiptBarcodes({ receiptId, options });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

export const getBarcodesByReceiptId = async (receiptId, opts = {}) => {
  const result = await loadReceiptBarcodes({ receiptId, ...opts });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

// Legacy compatibility boundary now delegates to the audit slice.
export const auditReceiptBarcodes = async (receiptId, options = {}) => {
  const result = await auditReceiptBarcodesSlice(receiptId, options);
  return result?.sourceResponse;
};

// Legacy compatibility boundary now delegates to the receipt-listing slice.
export const getReceiptsWithBarcodes = async (opts = {}) => {
  const result = await listReceiptsWithBarcodes(opts);
  return result?.sourceResponse ?? result?.receipts ?? [];
};

// Legacy compatibility boundaries now delegate to the scan-listing slice.
export const getReceiptsReadyToScanSN = async () => {
  const result = await listReceiptsReadyToScanSn();
  return result?.sourceResponse ?? result?.receipts ?? [];
};

export const getReceiptsReadyToScan = async () => {
  const result = await listReceiptsReadyToScan();
  return result?.sourceResponse ?? result?.receipts ?? [];
};

// Temporary compatibility boundary only. StockItem owns receive-into-stock runtime.
export const receiveStockItem = async (input, maybeSerialNumber) => {
  const result = await receiveScannedStockItem(input, maybeSerialNumber);
  return result?.sourceResponse ?? result?.stockItem ?? result;
};

// Legacy compatibility boundary now delegates to the serial slice.
export const updateSerialNumber = async (barcode, serialNumber) => {
  const result = await updateBarcodeSerialNumber({ barcode, serialNumber });
  return result?.sourceResponse ?? result;
};

// Legacy compatibility boundaries now delegate to the print-reprint slice.
export const markBarcodesAsPrinted = async (purchaseOrderReceiptId) => {
  const result = await markReceiptBarcodesPrinted(purchaseOrderReceiptId);
  return result?.sourceResponse ?? result;
};

export const reprintBarcodes = async (receiptId) => {
  const result = await reprintReceiptBarcodes(receiptId);
  return result?.sourceResponse ?? { barcodes: result?.rows ?? [] };
};

export const searchReprintReceipts = async (opts = {}) => {
  const result = await searchReceiptsForReprint(opts);
  return Array.isArray(result?.receipts) ? result.receipts : [];
};

// Legacy compatibility boundary now delegates to the receipt-completion slice.
export const commitScans = async (receiptId, items) => {
  const result = await commitReceiptScans(receiptId, items);

  return {
    ok: Boolean(result?.ok),
    committed: Array.isArray(result?.committed) ? result.committed : [],
    errors: Array.isArray(result?.errors) ? result.errors : [],
    message: result?.message,
  };
};
