// ===============================================
// FE: src/features/quickReceive/api/quickReceiveApi.js
// API สำหรับ Quick Receive (SIMPLE) — ทางเลือก A (Draft ก่อน → Finalize คอมมิตทีเดียว)
// รูปแบบการ export: **named exports** เหมือน productTypeApi
// ===============================================

import apiClient from '@/utils/apiClient';

// ---- Helpers ----
const toNumber = (v, def = 0) => (v === '' || v == null ? def : (Number(v) || def));

export const makeIdempotencyKey = () => (
  globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `qr_${Date.now()}_${Math.random().toString(36).slice(2)}`
);

// ให้ข้อความ error อ่านง่ายและสอดคล้อง
export const parseApiError = (error) => {
  const fallback = { code: 'UNKNOWN', message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
  const res = error?.response;
  const code = res?.data?.code || fallback.code;
  const messageFromServer = res?.data?.message;
  const map = {
    DUPLICATE: 'รายการซ้ำในระบบ',
    INVALID: 'ข้อมูลไม่ถูกต้อง',
    NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
    CONFLICT: 'สถานะไม่พร้อมดำเนินการ',
  };
  return { code, message: map[code] || messageFromServer || fallback.message };
};

const normalizeItem = (it) => ({
  itemId: it?.itemId || undefined, // อาจว่างถ้ายังไม่เคยเซฟ
  productId: Number(it?.productId),
  qty: Number(it?.qty ?? it?.quantity ?? 0),
  unitCost: toNumber(it?.unitCost, 0),
  vatRate: toNumber(it?.vatRate, 0),
});

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : [])
    .map(normalizeItem)
    .filter((x) => Number.isFinite(x.productId) && x.productId > 0 && Number.isFinite(x.qty) && x.qty > 0);

// ---- Draft Receipt ----
// POST /api/quick-receipts
export const ensureQuickReceiptDraft = async ({ source = 'QUICK_HYBRID', supplierId = 0, note } = {}) => {
  try {
    const body = { source, supplierId, note };
    const { data } = await apiClient.post('quick-receipts', body);
    return data; // { id, ... }
  } catch (error) {
    throw parseApiError(error);
  }
};

// ---- Draft Items (Save/Delete) ----
// POST /api/quick-receipts/:id/items
export const saveQuickItemDraft = async (receiptId, payload, opts = {}) => {
  try {
    const headers = {};
    if (opts?.idempotencyKey) headers['X-Idempotency-Key'] = String(opts.idempotencyKey);
    const body = {
      itemId: payload?.itemId || undefined,
      productId: Number(payload?.productId),
      qty: Number(payload?.qty || 0),
      unitCost: toNumber(payload?.unitCost, 0),
      vatRate: toNumber(payload?.vatRate, 0),
    };
    const { data } = await apiClient.post(`quick-receipts/${receiptId}/items`, body, { headers });
    return data; // { itemId, ... }
  } catch (error) {
    throw parseApiError(error);
  }
};

// DELETE /api/quick-receipts/:id/items/:itemId
export const deleteQuickItemDraft = async (receiptId, itemId) => {
  try {
    const { data } = await apiClient.delete(`quick-receipts/${receiptId}/items/${itemId}`);
    return data; // { ok: true }
  } catch (error) {
    throw parseApiError(error);
  }
};

// ---- Finalize ----
// POST /api/quick-receipts/:id/finalize
export const finalizeQuickReceipt = async (receiptId, { finalizeToken }) => {
  try {
    const headers = {};
    if (finalizeToken) headers['X-Finalize-Token'] = String(finalizeToken);
    const { data } = await apiClient.post(`quick-receipts/${receiptId}/finalize`, {}, { headers });
    return data; // { receiptId, committedAt, lotBarcodes: [...], stockMovements: [...] }
  } catch (error) {
    throw parseApiError(error);
  }
};

// ---- Preview (Optional) ----
// POST /api/quick-receipts/preview
export const previewQuickReceive = async ({ supplierId = 0, note, items = [] } = {}) => {
  try {
    const body = { supplierId, note, items: normalizeItems(items) };
    const { data } = await apiClient.post('quick-receipts/preview', body);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};



