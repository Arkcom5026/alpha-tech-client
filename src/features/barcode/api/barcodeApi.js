



// src/features/barcode/api/barcodeApi.js
// ES Module API client for barcode & receipt operations
// All requests go through utils/apiClient (axios instance)

import apiClient from '@/utils/apiClient';

// ---------------------------------------------
// Generate barcodes that are missing for a receipt
// ---------------------------------------------
export const generateMissingBarcodes = async (receiptId, options = {}) => {
  if (!receiptId) throw new Error('Missing receiptId');
  const { dryRun = false, lotLabelPerLot = 1 } = options || {};
  try {
    const payload = { dryRun: !!dryRun, lotLabelPerLot: Number(lotLabelPerLot) || 1 };
    const res = await apiClient.post(`/barcodes/generate-missing/${receiptId}`, payload);
    return res.data;
  } catch (err) {
    console.error('❌ generateMissingBarcodes error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Fetch barcodes for a receipt (with optional filters)
// opts: { kind?: 'SN'|'LOT', onlyUnscanned?: boolean }
// ---------------------------------------------
export const getBarcodesByReceiptId = async (receiptId, opts = {}) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const params = {};
    if (opts.kind) params.kind = String(opts.kind).toUpperCase();
    if (opts.onlyUnscanned) params.onlyUnscanned = 1;
    const res = await apiClient.get(`/barcodes/by-receipt/${receiptId}`, { params });
    return res.data;
  } catch (err) {
    console.error('❌ getBarcodesByReceiptId error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Audit a receipt's barcode health (read-only)
// ---------------------------------------------
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

// ---------------------------------------------
// Get receipts that already have barcodes (รอพิมพ์บาร์โค้ด)
// ---------------------------------------------
export const getReceiptsWithBarcodes = async () => {
  try {
    const res = await apiClient.get('/barcodes/receipts-with-barcodes');
    return res.data;
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      const res2 = await apiClient.get('/barcodes/with-barcodes');
      return res2.data;
    }
    console.error('❌ getReceiptsWithBarcodes error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Get receipts that are ready to scan SN (มี SN และยังมี SN ค้างยิง)
// ---------------------------------------------
export const getReceiptsReadyToScanSN = async () => {
  try {
    const res = await apiClient.get('/barcodes/receipts-ready-to-scan-sn');
    return res.data;
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      const res2 = await apiClient.get('/barcodes/ready-to-scan-sn');
      return res2.data;
    }
    console.error('❌ getReceiptsReadyToScanSN error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Get receipts that are ready to scan/activate (รวม SN & LOT)
// ---------------------------------------------
export const getReceiptsReadyToScan = async () => {
  try {
    const res = await apiClient.get('/barcodes/receipts-ready-to-scan');
    return res.data;
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      const res2 = await apiClient.get('/barcodes/ready-to-scan');
      return res2.data;
    }
    console.error('❌ getReceiptsReadyToScan error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Receive stock item by scanning barcode (server decides SN policy)
// ---------------------------------------------
export const receiveStockItem = async (barcode, serialNumber) => {
  if (!barcode) throw new Error('Missing barcode');
  try {
    const payload = serialNumber != null ? { barcode, serialNumber } : { barcode };
    const res = await apiClient.post('/stock-items/receive-sn', payload);
    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Update serial number for a barcode
// ---------------------------------------------
export const updateSerialNumber = async (barcode, serialNumber) => {
  if (!barcode) throw new Error('Missing barcode');
  try {
    const res = await apiClient.patch(`/stock-items/update-sn/${barcode}`, { serialNumber });
    return res.data;
  } catch (err) {
    console.error('❌ updateSerialNumber error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Mark all barcodes of a receipt as printed
// ---------------------------------------------
export const markBarcodesAsPrinted = async (purchaseOrderReceiptId) => {
  if (!purchaseOrderReceiptId) throw new Error('Missing purchaseOrderReceiptId');
  try {
    const res = await apiClient.patch('/barcodes/mark-printed', { purchaseOrderReceiptId });
    return res.data;
  } catch (err) {
    console.error('❌ markBarcodesAsPrinted error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Reprint (load existing barcodes) for a receipt
// ---------------------------------------------
export const reprintBarcodes = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const res = await apiClient.patch(`/barcodes/reprint/${receiptId}`);
    return res.data;
  } catch (err) {
    console.error('❌ reprintBarcodes error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Search receipts for reprint flow (server-side search every time)
// params: { mode: 'RC' | 'PO', query: string, printed?: boolean }
// ---------------------------------------------
export const searchReprintReceipts = async (opts = {}) => {
  const { mode = 'RC', query, printed = true } = opts;
  const q = String(query || '').trim();
  if (!q) return [];
  try {
    const res = await apiClient.get('/barcodes/reprint-search', {
      params: { mode, query: q, printed },
    });
    const data = res && res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.error('❌ searchReprintReceipts error:', err);
    throw err;
  }
};

// ---------------------------------------------
// Finalize a purchase order receipt (idempotent on server)
// ---------------------------------------------
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

// ---------------------------------------------
// BULK: commit scans (local-first → backend)
// items: Array<{ barcode: string, sn?: string|null }>
// returns: { ok: boolean, committed: string[], errors: Array<{ barcode, sn?, code?, message? }>, message?: string }
// ---------------------------------------------
export const commitScans = async (receiptId, items) => {
  if (!receiptId) throw new Error('Missing receiptId');
  const payload = Array.isArray(items) ? items : [];
  try {
    const res = await apiClient.post(`/receipts/${receiptId}/commit-scans`, { items: payload });
    const data = (res && res.data) || {};
    return {
      ok: !!data.ok,
      committed: Array.isArray(data.committed) ? data.committed : [],
      errors: Array.isArray(data.errors) ? data.errors : [],
      message: data.message,
    };
  } catch (err) {
    console.error('❌ commitScans error:', err);
    if (err && err.response && err.response.data) {
      const d = err.response.data;
      return {
        ok: !!d.ok,
        committed: Array.isArray(d.committed) ? d.committed : [],
        errors: Array.isArray(d.errors) ? d.errors : [],
        message: d.message || 'Server error',
      };
    }
    return { ok: false, committed: [], errors: [], message: 'Network error' };
  }
};











