// src/features/quickReceive/api/quickReceiveApi.js
// API สำหรับ Quick Receive workflow เท่านั้น
// - ไม่ใช้ Product Create dropdown/API
// - ไม่รับ branchId/employeeId จาก FE — ให้ BE ดึงจาก JWT

import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';
import { commitQuickStockExistingIntakeApi } from '@/features/receiving/quick-stock/api/quickStockIntakeApi';

const stripEmptyParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null)
);

// Compatibility helper still consumed by the Quick Receipt session boundary.
export function makeIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const getQuickReceiveDropdowns = async ({ productTypeId } = {}) => {
  try {
    const params = stripEmptyParams({ productTypeId, _ts: Date.now() });
    const { data } = await apiClient.get('quick-stock/dropdowns', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// Compatibility shim for legacy Quick Receive consumers. The QuickStock feature
// owns the transport and payload sanitation for the existing-product intake flow.
export const quickReceiveExistingProduct = async (payload = {}) =>
  commitQuickStockExistingIntakeApi(payload);

export const quickStockIntakeExistingApi = quickReceiveExistingProduct;
