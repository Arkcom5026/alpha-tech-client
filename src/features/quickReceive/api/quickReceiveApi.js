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

/**
 * สร้าง idempotency key สำหรับกันการกดซ้ำ/ยิงซ้ำ
 */
export function makeIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      productId: Number(it.productId),
      quantity: Number(it.quantity ?? it.qty),
      unitCost: Number(it.unitCost ?? 0),
      vatRate: Number(it.vatRate ?? 0),
    }))
    .filter((it) => Number.isFinite(it.productId) && it.productId > 0 && Number.isFinite(it.quantity) && it.quantity > 0);
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

/**
 * Preview คำนวณยอดและตรวจสอบข้อมูลก่อนบันทึก (ไม่เขียน DB)
 * POST /api/stock/simple/quick-receive/preview
 */
export async function previewQuickReceive(payload) {
  try {
    const body = {
      supplierId: payload?.supplierId ?? 0,
      note: payload?.note || undefined,
      items: normalizeItems(payload?.items),
    };
    const res = await apiClient.post('stock/simple/quick-receive/preview', body);
    return res.data;
  } catch (err) {
    console.error('❌ previewQuickReceive error:', err);
    throw err;
  }
}

/**
 * บันทึกรับสินค้าด่วน (Commit)
 * POST /api/stock/simple/quick-receive
 */
export async function createQuickReceive(payload, opts = {}) {
  try {
    const headers = {};
    if (opts?.idempotencyKey) headers['X-Idempotency-Key'] = String(opts.idempotencyKey);

    const body = {
      supplierId: payload?.supplierId ?? 0,
      note: payload?.note || undefined,
      managerPin: payload?.managerPin || undefined,
      items: normalizeItems(payload?.items),
    };

    const res = await apiClient.post('stock/simple/quick-receive', body, { headers });
    return res.data;
  } catch (err) {
    console.error('❌ createQuickReceive error:', err);
    throw err;
  }
}

// Compatibility shim for legacy Quick Receive consumers. The QuickStock feature
// owns the transport and payload sanitation for the existing-product intake flow.
export const quickReceiveExistingProduct = async (payload = {}) =>
  commitQuickStockExistingIntakeApi(payload);

export const quickStockIntakeExistingApi = quickReceiveExistingProduct;
