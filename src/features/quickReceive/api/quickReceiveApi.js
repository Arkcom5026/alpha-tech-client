


// ===============================================
// FE: src/features/quickReceive/api/quickReceiveApi.js
// API สำหรับ Quick Receive (Simple)
// - ใช้ apiClient แทน fetch ตรง ๆ (ตามมาตรฐานโปรเจกต์)
// - รองรับ X-Idempotency-Key เพื่อกัน double submit
// - ไม่รับ branchId/employeeId จาก FE — ให้ BE ดึงจาก JWT
// - ชื่อฟิลด์รายการใช้ { productId, quantity, unitCost, vatRate }
// ===============================================

import apiClient from '@/utils/apiClient';

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

