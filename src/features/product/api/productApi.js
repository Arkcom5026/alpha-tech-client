

// ✅ src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// LIST
export const getProducts = async ({ search, status } = {}) => {
  try {
    const params = { _ts: Date.now() };
    if (search?.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;
    const { data } = await apiClient.get('products', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' }});
    if (import.meta.env?.DEV) console.log('[productApi] getProductById', id, data);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createProduct = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createProduct payload', payload);
    const { data } = await apiClient.post('products', payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProduct = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`products/${id}`, payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};
  
/**
 * Patch แล้วดึงข้อมูลสินค้าล่าสุดกลับมาในคำสั่งเดียว (แก้ปัญหา UI ไม่อัพเดตทันทีหลังบันทึก)
 * ใช้ในหน้า EditProductPage เพื่อ reset ฟอร์มด้วยค่าล่าสุดหลังบันทึกสำเร็จ
 */
export const updateProductAndGet = async (id, payload) => {
  try {
    await apiClient.patch(`products/${id}`, payload);
    const { data: fresh } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now() } });
    if (import.meta.env?.DEV) console.log('[productApi] updateProductAndGet fresh', id, fresh);
    return fresh;
  } catch (err) { throw parseApiError(err); }
};

// alias สั้น ๆ
export const saveProduct = updateProductAndGet;

export const deleteProduct = async (id) => {
  try {
    const { data } = await apiClient.delete(`products/${id}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// =============================
// Enable / Disable (แยก API)
// =============================
// หมายเหตุ: ให้ BE ทำ endpoint ให้ชัดเจน เช่น
// POST /products/:id/disable  และ  POST /products/:id/enable
export const disableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/disable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const enableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/enable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Dropdowns (โหลดครั้งเดียว ใช้ทั้งระบบ)
export const getProductDropdownsPublic = async () => {
  const { data } = await apiClient.get('products/dropdowns', { params: { _ts: Date.now() }});
  return data;
};

export const getCatalogDropdowns = async () => {
  try {
    const raw = await getProductDropdownsPublic();
    const {
      categories = [],
      productTypes = [],
      productProfiles = [],
      productTemplates,
      templates = [], // alias (compat)
    } = raw || {};

    const tpl = Array.isArray(productTemplates) ? productTemplates : (templates || []);

    return {
      categories,
      productTypes,
      profiles: productProfiles,
      productProfiles,
      templates: tpl,
      productTemplates: tpl,
    };
  } catch (err) { throw parseApiError(err); }
};

// =============================
// Online Catalog (มาตรฐาน productTemplateId)
// =============================
const __buildOnlineParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
);

export const getOnlineProducts = async ({
  search,
  page = 1,
  pageSize = 24,
  sort = 'newest',
  categoryId,
  productTypeId,
  productProfileId,
  productTemplateId,
  branch, // slug (public)
} = {}) => {
  try {
    const params = __buildOnlineParams({ search, page, pageSize, sort, categoryId, productTypeId, productProfileId, productTemplateId, branch, _ts: Date.now() });
    const { data } = await apiClient.get('products/online/search', { params });
    return data; // { items, total, page, pageSize }
  } catch (err) { throw parseApiError(err); }
};

export const getProductOnlineById = async (id, { branch } = {}) => {
  try {
    const params = __buildOnlineParams({ branch, _ts: Date.now() });
    const { data } = await apiClient.get(`products/online/detail/${id}`, { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Prices
export const getProductPrices = async (productId) => {
  try {
    const { data } = await apiClient.get(`products/${productId}/prices`, { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProductPrices = async (productId, prices) => {
  try {
    const { data } = await apiClient.put(`products/${productId}/prices`, { prices });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const addProductPrice = async (productId, priceData) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] addProductPrice', { productId, priceData });
    const { data } = await apiClient.post(`products/${productId}/prices`, priceData);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const deleteProductPrice = async (productId, priceId) => {
  try {
    const { data } = await apiClient.delete(`products/${productId}/prices/${priceId}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// POS Search
export const getProductsForPos = async (filters = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Migration: STRUCTURED (SN) -> SIMPLE (quantity)
export const migrateSnToSimple = async (productId) => {
  try {
    const { data } = await apiClient.post(`products/${productId}/migrate-to-simple`);
    return data;
  } catch (err) { throw parseApiError(err); }
};





