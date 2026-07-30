// src/features/barcode/api/barcodeApi.js
// ES Module API client for barcode & receipt operations
// All requests go through utils/apiClient (axios instance)

import apiClient from '@/utils/apiClient';
import { generateReceiptBarcodes } from '../generation';
import { loadReceiptBarcodes } from '../receipt-detail';
import { listReceiptsWithBarcodes } from '../receipt-listing';
import {
  listReceiptsReadyToScan,
  listReceiptsReadyToScanSn,
} from '../scan-listing';
import { receiveScannedStockItem } from '../scan';
import { updateBarcodeSerialNumber } from '../serial';
import {
  markReceiptBarcodesPrinted,
  reprintReceiptBarcodes,
  searchReceiptsForReprint,
} from '../print-reprint';
import { commitReceiptScans } from '../receipt-completion';

export const generateMissingBarcodes = async (receiptId, options = {}) => {
  const result = await generateReceiptBarcodes({ receiptId, options });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

export const getBarcodesByReceiptId = async (receiptId, opts = {}) => {
  const result = await loadReceiptBarcodes({ receiptId, ...opts });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

export const auditReceiptBarcodes = async (receiptId, { includeDetails = true } = {}) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const res = await apiClient.get(`/barcodes/receipt/${receiptId}/audit`, {
      params: { includeDetails: includeDetails ? 1 : 0 },
    });
    return res.data;
  } catch (err) {
    console.error('❌ auditReceiptBarcodes error:', err);
    throw err;
  }
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

// Legacy compatibility boundary now delegates to the scan slice.
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

export const finalizeReceiptIfNeeded = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const res = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`);
    return res.data;
  } catch (err) {
    console.error('❌ finalizeReceiptIfNeeded error:', err);
    throw err;
  }
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
