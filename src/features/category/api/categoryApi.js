// src/features/category/api/categoryApi.js
import apiClient from '@/utils/apiClient';

const withParams = (params = {}) => ({ params });

export const parseApiError = (error) => {
  const fallback = { code: 'UNKNOWN', message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
  const res = error?.response;
  const code = res?.data?.code || fallback.code;
  const messageFromServer = res?.data?.message;
  const map = {
    HAS_REFERENCES: 'ไม่สามารถดำเนินการได้ เนื่องจากมีข้อมูลที่เชื่อมโยงอยู่',
    PARENT_INACTIVE: 'ไม่สามารถทำรายการได้ เพราะอยู่ภายใต้หมวดหลักที่ปิดใช้งาน',
    IS_SYSTEM_LOCKED: 'ไม่สามารถแก้ไข/ปิดใช้งานได้ เนื่องจากเป็นหมวดระบบ (ล็อก)',
    DUPLICATE: 'มีข้อมูลชื่อ/slug ซ้ำในระบบ',
  };
  return { code, message: map[code] || messageFromServer || fallback.message };
};

export const getCategories = async (params = {}) => {
  try {
    // กัน cache 304 โดยเติม cache-buster param แทนการส่ง header เพื่อลดปัญหา CORS
    const merged = { ...params, _ts: Date.now() };
    const { data } = await apiClient.get('categories', { params: merged });
    return data; // { items, total, page, limit } หรือ array
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getCategoryById = async (id) => {
  try {
    const { data } = await apiClient.get(`categories/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const createCategory = async (payload) => {
  try {
    const { data } = await apiClient.post('categories', payload);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const updateCategory = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`categories/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const archiveCategory = async (id) => {
  try {
    const { data } = await apiClient.patch(`categories/${id}/archive`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const restoreCategory = async (id) => {
  try {
    const { data } = await apiClient.patch(`categories/${id}/restore`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getCategoryDropdowns = async (opts = { active: true }) => {
  try {
    const { data } = await apiClient.get('categories/dropdowns', withParams({ active: opts.active !== false }));
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};
