



// ✅ src/features/productTemplate/api/productTemplateApi.js
import apiClient from '@/utils/apiClient';

// แปลงพารามิเตอร์ให้สะอาด และไม่ส่ง branchId จาก FE ตามกฎ BRANCH_SCOPE_ENFORCED
const sanitizeParams = (params = {}) => {
  const out = {};
  const q = params.q ?? params.search;
  if (q != null && String(q).trim()) out.q = String(q).trim();

  // alias support: store uses `search`
  const search = params.search;
  if (search != null && String(search).trim()) out.q = String(search).trim();

  ['page', 'limit'].forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null || v === '') return;
    const n = Number(v);
    if (!Number.isNaN(n)) out[k] = n;
  });

  if (params.includeInactive !== undefined) {
    const v = params.includeInactive;
    out.includeInactive = typeof v === 'string' ? v === 'true' : !!v;
  }

  if (params.orderBy) out.orderBy = String(params.orderBy);
  if (params.orderDir) out.orderDir = String(params.orderDir);
  return out;
};

// ทำให้ response เป็นรูปแบบมาตรฐาน { items, totalPages, totalItems, page, limit }
const normalizeListResponse = (res) => {
  const data = res?.data ?? {};
  if (Array.isArray(data)) {
    const totalItems = Number(res?.headers?.['x-total-count'] ?? data.length);
    const page = Number(res?.headers?.['x-page'] ?? 1);
    const limit = Number(res?.headers?.['x-limit'] ?? data.length);
    const totalPages = Math.max(1, Math.ceil(totalItems / (limit || 1)));
    return { items: data, totalPages, totalItems, page, limit };
  }
  return {
    items: data.items ?? [],
    totalPages: Number(data.totalPages ?? data.total ?? 1) || 1,
    totalItems: Number(data.totalItems ?? data.total ?? (data.items?.length ?? 0)) || 0,
    page: Number(data.page ?? 1) || 1,
    limit: Number(data.limit ?? data.pageSize ?? 20) || 20,
  };
};

// ✅ ดึงรายการ template (พร้อมกรอง + เพจจิ้ง)
export const getProductTemplates = async (params = {}) => {
  try {
    const qp = sanitizeParams(params);
    const res = await apiClient.get('/product-templates', { params: qp }); // 🔧 ลบ /api ซ้ำ
    return normalizeListResponse(res);
  } catch (error) {
    console.error('❌ getProductTemplates error:', error);
    throw error;
  }
};

export const getProductTemplateById = async (id) => {
  try {
    const res = await apiClient.get(`/product-templates/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ getProductTemplateById error:', error);
    throw error;
  }
};

export const createProductTemplate = async (payload) => {
  try {
    const res = await apiClient.post('/product-templates', payload);
    return res.data;
  } catch (error) {
    console.error('❌ createProductTemplate error:', error);
    throw error;
  }
};

export const updateProductTemplate = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/product-templates/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error('❌ updateProductTemplate error:', error);
    throw error;
  }
};

export const deleteProductTemplate = async (id) => {
  try {
    const res = await apiClient.delete(`/product-templates/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ deleteProductTemplate error:', error);
    throw error;
  }
};

export const toggleActive = async (id) => {
  try {
    const res = await apiClient.patch(`/product-templates/${id}/toggle-active`);
    return res.data;
  } catch (error) {
    console.error('❌ toggleActive error:', error);
    throw error;
  }
};


