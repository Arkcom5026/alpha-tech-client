// src/features/quickReceive/api/quickReceiveApi.js
// API สำหรับ Quick Receive workflow เท่านั้น
// - ไม่ใช้ Product Create dropdown/API
// - ไม่รับ branchId/employeeId จาก FE — ให้ BE ดึงจาก JWT

import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

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

const normalizeBarcodeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { barcode: item, serialNumber: item };
      }
      const barcode = item?.barcode ?? item?.serialNumber ?? item?.sn ?? '';
      const serialNumber = item?.serialNumber ?? item?.barcode ?? item?.sn ?? '';
      return { ...item, barcode, serialNumber };
    })
    .filter((item) => item?.barcode || item?.serialNumber);
};

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

export const quickReceiveExistingProduct = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    const rawItems = sanitizedPayload.items ?? sanitizedPayload.barcodes ?? sanitizedPayload.queue ?? [];
    sanitizedPayload.items = normalizeBarcodeItems(rawItems);
    delete sanitizedPayload.barcodes;
    delete sanitizedPayload.queue;

    const { data } = await apiClient.post('quick-stock/existing', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const quickStockIntakeExistingApi = quickReceiveExistingProduct;
