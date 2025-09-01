// ✅ src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// LIST
export const getProducts = async ({ search, status } = {}) => {
  try {
    const params = { _ts: Date.now() };
    if (search?.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;
    const { data } = await apiClient.get('products', { params });      // <- ไม่มี '/'
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now() }});
    if (import.meta.env?.DEV) console.log('[productApi] getProductById', id, data);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createProduct = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createProduct payload', payload);
    const { data } = await apiClient.post('products', payload);        // <- ไม่มี '/'
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProduct = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`products/${id}`, payload); // <- PATCH
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const deleteProduct = async (id) => {
  try {
    const { data } = await apiClient.delete(`products/${id}`);
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
    const { categories = [], productTypes = [], productProfiles = [], templates = [] } = raw || {};
    return { categories, productTypes, profiles: productProfiles, templates };
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
    const params = { ...filters, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};
