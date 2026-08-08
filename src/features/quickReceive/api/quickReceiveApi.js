// src/features/quickReceive/api/quickReceiveApi.js
// Compatibility API surface retained only for live Quick Receipt / Quick Stock consumers.

import { commitQuickStockExistingIntakeApi } from '@/features/receiving/quick-stock/api/quickStockIntakeApi';

// Compatibility helper still consumed by the Quick Receipt session boundary.
export function makeIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// Compatibility shim for legacy Quick Receive consumers. The QuickStock feature
// owns the transport and payload sanitation for the existing-product intake flow.
export const quickReceiveExistingProduct = async (payload = {}) =>
  commitQuickStockExistingIntakeApi(payload);

export const quickStockIntakeExistingApi = quickReceiveExistingProduct;
