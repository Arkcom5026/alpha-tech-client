

// ✅ src/features/productProfile/api/productProfileApi.js
// ปรับมาตรฐานเดียวกับ Category/ProductType
// - ใช้ path แบบ relative (ไม่มี / นำหน้า) เพื่อพึ่ง baseURL จาก apiClient
// - ครอบ try...catch และโยน parseApiError
// - รองรับ page, limit, search, includeInactive (ไม่ผูก category/type แล้ว)
// - archive/restore ใช้ PATCH
// - dropdowns รองรับ active + filter
// - เพิ่ม cache-buster `_ts`

import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const BASE = 'product-profiles';

// 🔹 LIST
export const getProductProfiles = async ({
  page = 1,
  limit = 20,
  search = '',
  includeInactive = false,} = {}) => {
  try {    const params = { page, limit, search, includeInactive, _ts: Date.now() };

    // Backward-compatible: ignore legacy filters (categoryId/productTypeId)
    // ProductProfile ไม่ผูกกับ Category/ProductType ตาม BestLine ใหม่

    const { data } = await apiClient.get(BASE, { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 READ BY ID
export const getProductProfileById = async (id) => {
  try {
    const { data } = await apiClient.get(`${BASE}/${id}`, { params: { _ts: Date.now() } });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 CREATE
export const createProductProfile = async (payload) => {
  try {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 UPDATE
export const updateProductProfile = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 DELETE (hard delete)
export const deleteProductProfile = async (id) => {
  try {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 ARCHIVE
export const archiveProductProfile = async (id) => {
  try {
    const { data } = await apiClient.patch(`${BASE}/${id}/archive`);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 RESTORE
export const restoreProductProfile = async (id) => {
  try {
    const { data } = await apiClient.patch(`${BASE}/${id}/restore`);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// 🔹 DROPDOWNS
export const getProductProfileDropdowns = async ({ active = true } = {}) => {
  try {    const params = { active, _ts: Date.now() };

    // Backward-compatible: ignore legacy filters (categoryId/productTypeId)

    const { data } = await apiClient.get(`${BASE}/dropdowns`, { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};


