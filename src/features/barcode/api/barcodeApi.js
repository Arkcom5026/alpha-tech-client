// src/features/barcode/api/barcodeApi.js
// ES Module API client for barcode & receipt operations
// All requests go through utils/apiClient (axios instance)

import apiClient from '@/utils/apiClient';
import { generateReceiptBarcodes } from '../generation';
import { loadReceiptBarcodes } from '../receipt-detail';
import {
  markReceiptBarcodesPrinted,
  reprintReceiptBarcodes,
  searchReceiptsForReprint,
} from '../print-reprint';

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

export const getReceiptsWithBarcodes = async (opts = {}) => {
  try {
    const printed = opts?.printed;
    const limit = opts?.limit;
    const params = {
      ...(typeof printed === 'boolean' ? { printed } : {}),
      ...(limit != null ? { limit: Math.min(Math.max(Number(limit) || 50, 1), 100) } : {}),
    };

    const res = await apiClient.get('/barcodes/receipts-with-barcodes', {
      params: Object.keys(params).length ? params : undefined,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const printed = opts?.printed;
      const limit = opts?.limit;
      const params = {
        ...(typeof printed === 'boolean' ? { printed } : {}),
        ...(limit != null ? { limit: Math.min(Math.max(Number(limit) || 50, 1), 100) } : {}),
      };

      const res2 = await apiClient.get('/barcodes/with-barcodes', {
        params: Object.keys(params).length ? params : undefined,
      });
      return res2.data;
    }
    console.error('❌ getReceiptsWithBarcodes error:', err);
    throw err;
  }
};

export const getReceiptsReadyToScanSN = async () => {
  try {
    const res = await apiClient.get('/barcodes/receipts-ready-to-scan-sn');
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const res2 = await apiClient.get('/barcodes/ready-to-scan-sn');
      return res2.data;
    }
    console.error('❌ getReceiptsReadyToScanSN error:', err);
    throw err;
  }
};

export const getReceiptsReadyToScan = async () => {
  try {
    const res = await apiClient.get('/barcodes/receipts-ready-to-scan');
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const res2 = await apiClient.get('/barcodes/ready-to-scan');
      return res2.data;
    }
    console.error('❌ getReceiptsReadyToScan error:', err);
    throw err;
  }
};

export const receiveStockItem = async (input, maybeSerialNumber) => {
  const isObjectInput = typeof input === 'object' && input !== null;
  const nested = isObjectInput ? input.barcode : null;

  const barcode = (() => {
    if (nested && typeof nested === 'object') return String(nested.barcode || '').trim();
    if (isObjectInput) return String(input.barcode || '').trim();
    return String(input || '').trim();
  })();

  if (!barcode) throw new Error('Missing barcode');

  const serialNumber = (() => {
    if (nested && typeof nested === 'object') return String(nested.serialNumber ?? '').trim();
    if (isObjectInput) return String(input.serialNumber ?? '').trim();
    return String(maybeSerialNumber ?? '').trim();
  })();

  const keepSN = Boolean(
    (nested && typeof nested === 'object' && nested.keepSN === true) ||
    (isObjectInput && input.keepSN === true)
  );

  try {
    const payload = keepSN || serialNumber
      ? {
          barcode: {
            barcode,
            ...(serialNumber ? { serialNumber } : {}),
          },
          keepSN,
        }
      : { barcode };

    const res = await apiClient.post('/stock-items/receive-sn', payload);
    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    throw err;
  }
};

export const updateSerialNumber = async (barcode, serialNumber) => {
  if (!barcode) throw new Error('Missing barcode');
  try {
    const res = await apiClient.patch('/barcodes/update-serial-number', {
      barcode,
      serialNumber,
    });
    return res.data;
  } catch (err) {
    console.error('❌ updateSerialNumber error:', err);
    throw err;
  }
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

export const commitScans = async (receiptId, items) => {
  if (!receiptId) throw new Error('Missing receiptId');

  const payload = Array.isArray(items)
    ? items
        .map((it) => {
          const barcode = String(it?.barcode ?? '').trim();
          const sn = String(it?.sn ?? it?.serialNumber ?? '').trim();
          if (!barcode) return null;
          return sn ? { barcode, sn } : { barcode };
        })
        .filter(Boolean)
    : [];

  try {
    const res = await apiClient.post(`/receipts/${receiptId}/commit-scans`, { items: payload });
    const data = res?.data || {};
    return {
      ok: Boolean(data.ok),
      committed: Array.isArray(data.committed) ? data.committed : [],
      errors: Array.isArray(data.errors) ? data.errors : [],
      message: data.message,
    };
  } catch (err) {
    console.error('❌ commitScans error:', err);
    if (err?.response?.data) {
      const data = err.response.data;
      return {
        ok: Boolean(data.ok),
        committed: Array.isArray(data.committed) ? data.committed : [],
        errors: Array.isArray(data.errors) ? data.errors : [],
        message: data.message || 'Server error',
      };
    }
    return { ok: false, committed: [], errors: [], message: 'Network error' };
  }
};
