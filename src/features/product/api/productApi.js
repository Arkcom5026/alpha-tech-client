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
  
export const updateProductAndGet = async (id, payload) => {
  try {
    await apiClient.patch(`products/${id}`, payload);
    const { data: fresh } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' } });
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
  try {
    const { data } = await apiClient.get('products/online/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductDropdowns = async () => {
  try {
    const { data } = await apiClient.get('products/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getCatalogDropdowns = async ({ scope = 'pos' } = {}) => {
  try {
    const raw = scope === 'online'
      ? await getProductDropdownsPublic()
      : await getProductDropdowns();

    const {
      categories = [],
      productTypes = [],
      productProfiles = [],
      brands = [],
      productTypeBrands = [],
      productTypeBrandMap = {},
      units = [],
      productTemplates,
      templates = [],
    } = raw || {};

    const tpl = Array.isArray(productTemplates) ? productTemplates : (templates || []);

    return {
      categories,
      productTypes,
      profiles: productProfiles,
      productProfiles,
      brands,
      productTypeBrands,
      productTypeBrandMap,
      units,
      templates: tpl,
      productTemplates: tpl,
    };
  } catch (err) { throw parseApiError(err); }
};

// =============================
// Online Catalog
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
  branch,
} = {}) => {
  try {
    const params = __buildOnlineParams({ search, page, pageSize, sort, categoryId, productTypeId, productProfileId, productTemplateId, branch, _ts: Date.now() });
    const { data } = await apiClient.get('products/online/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductOnlineById = async (id, { branch } = {}) => {
  try {
    const params = __buildOnlineParams({ branch, _ts: Date.now() });
    const { data = {} } = await apiClient.get(`products/online/detail/${id}`, { params });
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
    
    // 🟢 SECURITY SANITIZATION: ตัด branchId ออกก่อนยิงส่ง เพื่อปล่อยให้ระบบหลังบ้านแกะเช็กสิทธิ์พนักงานตรง ป้องกัน 401 ลูปค้าง
    delete sanitized.branchId;

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Migration
export const migrateSnToSimple = async (productId) => {
  try {
    const { data } = await apiClient.post(`products/${productId}/migrate-to-simple`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// ==================================================
// Ready-to-sell (summary)
// ==================================================
export const getReadyToSell = async ({ branchId, q = '', mode = 'ALL', page = 1, pageSize = 50, sort = 'receivedAt_desc' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      mode,
      page,
      pageSize,
      sort,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get('products/ready-to-sell', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// Ready-to-sell (STRUCTURED details)
// ==================================================
export const getReadyToSellStructuredDetails = async ({ branchId, productId, q = '' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }
    if (!productId) {
      const e = new Error('ไม่พบ productId');
      e.code = 'PRODUCT_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get(`products/ready-to-sell/structured/${productId}`, { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};