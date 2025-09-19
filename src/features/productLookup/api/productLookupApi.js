// src/features/productLookup/api/productLookupApi.js
import apiClient from '@/utils/apiClient';

// ---- helpers -------------------------------------------------
const unwrapList = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.rows))  return raw.rows;
  if (Array.isArray(raw?.data))  return raw.data;
  return [];
};
const unwrapOne = (raw) => {
  if (Array.isArray(raw))       return raw[0] ?? null;
  if (Array.isArray(raw?.items)) return raw.items[0] ?? null;
  if (Array.isArray(raw?.rows))  return raw.rows[0] ?? null;
  if (Array.isArray(raw?.data))  return raw.data[0] ?? null;
  return raw ?? null;
};

// ✅ ค้นหาสินค้าแบบทั่วไป
export const searchProducts = async ({ query, limit = 20, noSN = true, signal } = {}) => {
  try {
    const q = (query ?? '').toString().trim();
    if (!q) return [];
    const params = {};
    if (q) params.q = q;
    if (typeof limit === 'number')   params.limit = limit;
    if (typeof noSN === 'boolean')   params.noSN = noSN;

    const res = await apiClient.get('/products/lookup', { params, signal });
    return unwrapList(res?.data);
  } catch (error) {
    console.error('❌ searchProducts error:', error);
    return [];
  }
};

// ✅ ค้นหาแบบตรงตัว (barcode/SKU)
export const lookupByCode = async ({ code, signal } = {}) => {
  try {
    const value = (code ?? '').toString().trim();
    if (!value) return null;
    const res = await apiClient.get('/products/lookup', { params: { code: value }, signal });
    return unwrapOne(res?.data);
  } catch (error) {
    console.error('❌ lookupByCode error:', error);
    return null;
  }
};
