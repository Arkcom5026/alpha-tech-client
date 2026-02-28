// src/features/purchaseReport/api/purchaseReportApi.js

import apiClient from '@/utils/apiClient';

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
    console.error('❌ [getPurchaseReport] error:', error);
    throw error;
  }
};

/**
 * รายงานสรุปตามใบรับ (ถ้าคุณทำ endpoint นี้ใน BE)
 */
export const getPurchaseReceiptSummaryReport = async (filters) => {
  try {
    const params = buildQueryParams(filters);

    const response = await apiClient.get('/purchase-reports/summary-by-receipt', { params });
    return response.data;
  } catch (error) {
    console.error('❌ [getPurchaseReceiptSummaryReport] error:', error);
    throw error;
  }
};