





// src/features/purchaseReport/api/purchaseReportApi.js

import apiClient from '@/utils/apiClient';

// ✅ No console.* in production path (allow in DEV only)
const devError = (...args) => {
  try {
    if (import.meta?.env?.DEV) console.error(...args);
  } catch (_) {
    // ignore
  }
};

/**
 * Build safe query params:
 * - omit branchId (BE uses branch context)
 * - omit undefined / null / '' / 'all'
 */
const buildQueryParams = (filters = {}) => {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'branchId') continue;

    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (value === 'all') continue;

    params[key] = value;
  }
  return params;
};

/**
 * ดึงรายงานการจัดซื้อ (แบบแยกรายการสินค้า)
 * รองรับ filters:
 * - dateFrom, dateTo
 * - supplierId
 * - productId
 * - receiptStatus (ReceiptStatus)
 * - paymentStatus (PaymentStatus)
 */
export const getPurchaseReport = async (filters) => {
  try {
    const params = buildQueryParams(filters);

    const response = await apiClient.get('/purchase-reports', { params });
    return response.data;
  } catch (error) {
    devError('❌ [getPurchaseReport] error:', error);
    throw error;
  }
};

/**
 * รายงานสรุปตามใบรับ (Receipt-level)
 * Route:
 *   GET /purchase-reports/receipts
 */
export const getPurchaseReceiptSummaryReport = async (filters) => {
  try {
    const params = buildQueryParams(filters);

    const response = await apiClient.get('/purchase-reports/receipts', { params });
    return response.data;
  } catch (error) {
    devError('❌ [getPurchaseReceiptSummaryReport] error:', error);
    throw error;
  }
};

/**
 * รายงานรายละเอียดใบรับ (Receipt detail)
 * Route:
 *   GET /purchase-reports/receipts/:receiptId
 */
export const getPurchaseReceiptReportDetail = async (receiptId) => {
  try {
    const rid = receiptId == null ? null : Number(receiptId);
    if (!Number.isFinite(rid) || rid <= 0) {
      throw new Error('Invalid receiptId');
    }

    const response = await apiClient.get(`/purchase-reports/receipts/${rid}`);
    return response.data;
  } catch (error) {
    devError('❌ [getPurchaseReceiptReportDetail] error:', error);
    throw error;
  }
};


