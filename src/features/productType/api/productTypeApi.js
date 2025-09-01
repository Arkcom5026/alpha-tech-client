// src/features/productType/api/productTypeApi.js
import apiClient from '@/utils/apiClient';

const withParams = (params = {}) => ({ params });

// ให้ข้อความ error อ่านง่ายเหมือน categoryApi
export const parseApiError = (error) => {
  const fallback = { code: 'UNKNOWN', message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
  const res = error?.response;
  const code = res?.data?.code || fallback.code;
  const messageFromServer = res?.data?.message;
  const map = {
    HAS_REFERENCES: 'ไม่สามารถดำเนินการได้ เนื่องจากมีข้อมูลที่เชื่อมโยงอยู่',
    IS_SYSTEM_LOCKED: 'ไม่สามารถแก้ไข/ปิดใช้งานได้ เนื่องจากเป็นข้อมูลระบบ (ล็อก)',
    DUPLICATE: 'มีข้อมูลชื่อ/slug ซ้ำในระบบ',
  };
  return { code, message: map[code] || messageFromServer || fallback.message };
};

// LIST
export const getProductTypes = async (params = {}) => {
  try {
    // กัน cache 304 ด้วย cache-buster เหมือน categoryApi
    const merged = { ...params, _ts: Date.now() };
    const { data } = await apiClient.get('product-types', { params: merged });
    return data; // { items, total, page, limit } หรือ array
  } catch (error) {
    throw parseApiError(error);
  }
};

// GET BY ID
export const getProductTypeById = async (id) => {
  try {
    const { data } = await apiClient.get(`product-types/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// CREATE
export const createProductType = async (payload) => {
  try {
    const { data } = await apiClient.post('product-types', payload);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// UPDATE (PATCH เหมือน categoryApi)
export const updateProductType = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`product-types/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// ARCHIVE / RESTORE
export const archiveProductType = async (id) => {
  try {
    const { data } = await apiClient.patch(`product-types/${id}/archive`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const restoreProductType = async (id) => {
  try {
    const { data } = await apiClient.patch(`product-types/${id}/restore`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// DROPDOWNS (รองรับ active + filter ตามหมวด เช่น categoryId)
export const getProductTypeDropdowns = async (opts = { active: true, categoryId: undefined }) => {
  try {
    const params = {
      active: opts.active !== false,
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
    };
    const { data } = await apiClient.get('product-types/dropdowns', withParams(params));
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};
