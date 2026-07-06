// src/features/brand/api/brandApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// =============================
// Mappers
// =============================
const mapBrandFromApi = (b) => {
  if (!b || typeof b !== 'object') return b;
  const out = { ...b };

  if (Object.prototype.hasOwnProperty.call(out, 'active') && !Object.prototype.hasOwnProperty.call(out, 'isActive')) {
    out.isActive = !!out.active;
  }

  return out;
};

const mapBrandsPayloadFromApi = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(mapBrandFromApi);
  if (Array.isArray(payload.items)) return { ...payload, items: payload.items.map(mapBrandFromApi) };
  return mapBrandFromApi(payload);
};

const mapProductTypeFromApi = (item) => {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    id: Number(item.id),
    name: item.name || item.label || '-',
    active: item.active ?? item.isActive ?? true,
  };
};

const __buildParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null));

const __extractArray = (mapped) => {
  if (Array.isArray(mapped)) return mapped;
  if (Array.isArray(mapped?.items)) return mapped.items;
  if (Array.isArray(mapped?.data)) return mapped.data;
  return [];
};

// =============================
// Runtime ProductTypes for Brand page
// ดึง ProductType ของสาขาปัจจุบันจาก BE module ใหม่โดยตรง
// ไม่ใช้ productTypeStore เก่าในหน้านี้
// =============================
export const getRuntimeProductTypes = async ({ includeInactive = false, pageSize = 100, q = '' } = {}) => {
  try {
    const params = __buildParams({
      page: 1,
      limit: pageSize,
      pageSize,
      search: q?.trim() || undefined,
      includeInactive: includeInactive ? 'true' : 'false',
      _ts: Date.now(),
    });

    const { data } = await apiClient.get('product-types', { params });
    return __extractArray(data).map(mapProductTypeFromApi).filter((item) => item?.id && item?.name);
  } catch (err) {
    throw parseApiError(err);
  }
};

// =============================
// LIST
// =============================
export const getBrands = async ({ q = '', page = 1, pageSize = 20, includeInactive = false, productTypeId } = {}) => {
  try {
    const params = __buildParams({
      q: q?.trim() || undefined,
      page,
      pageSize,
      includeInactive: includeInactive ? 'true' : 'false',
      productTypeId: productTypeId || undefined,
      _ts: Date.now(),
    });

    const { data } = await apiClient.get('brands', { params });
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getBrandById = async (id) => {
  try {
    const { data } = await apiClient.get(`brands/${id}`, { params: { _ts: Date.now() } });
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createBrand = async ({ name }) => {
  try {
    const payload = { name: name?.trim() || '' };
    const { data } = await apiClient.post('brands', payload);
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const updateBrand = async ({ id, name }) => {
  try {
    const payload = { name: name?.trim() || '' };
    const { data } = await apiClient.put(`brands/${id}`, payload);
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const toggleBrandActive = async ({ id, isActive }) => {
  try {
    const payload = { active: !!isActive, isActive: !!isActive };
    const { data } = await apiClient.patch(`brands/${id}/toggle`, payload);
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getBrandDropdowns = async ({ includeInactive = false, productTypeId } = {}) => {
  const params = __buildParams({
    includeInactive: includeInactive ? 'true' : 'false',
    productTypeId: productTypeId || undefined,
    _ts: Date.now(),
  });

  try {
    const { data } = await apiClient.get('brands/dropdowns', { params });
    const mapped = mapBrandsPayloadFromApi(data);
    return __extractArray(mapped);
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404) throw parseApiError(err);
  }

  try {
    const listParams = __buildParams({
      page: 1,
      pageSize: 1000,
      includeInactive: includeInactive ? 'true' : 'false',
      productTypeId: productTypeId || undefined,
      _ts: Date.now(),
    });

    const { data } = await apiClient.get('brands', { params: listParams });
    const mapped = mapBrandsPayloadFromApi(data);
    return __extractArray(mapped);
  } catch (err) {
    throw parseApiError(err);
  }
};

// =============================
// MAPPING: ProductType ↔ Brand
// =============================
export const getProductTypeBrandLinks = async ({ productTypeId, includeInactive = false } = {}) => {
  try {
    const params = __buildParams({
      productTypeId: Number(productTypeId) || undefined,
      includeInactive: includeInactive ? 'true' : 'false',
      _ts: Date.now(),
    });
    const { data } = await apiClient.get('brands/product-type-brands', { params });
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404) throw parseApiError(err);
  }

  try {
    const params = __buildParams({
      productTypeId: Number(productTypeId) || undefined,
      includeInactive: includeInactive ? 'true' : 'false',
      _ts: Date.now(),
    });
    const { data } = await apiClient.get('product-type-brands', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const attachBrandToProductType = async ({ productTypeId, brandId }) => {
  const payload = {
    productTypeId: Number(productTypeId),
    brandId: Number(brandId),
  };

  try {
    const { data } = await apiClient.post('brands/product-type-brands', payload);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404) throw parseApiError(err);
  }

  try {
    const { data } = await apiClient.post('product-type-brands', payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const detachBrandFromProductType = async ({ id }) => {
  try {
    const { data } = await apiClient.delete(`brands/product-type-brands/${id}`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404) throw parseApiError(err);
  }

  try {
    const { data } = await apiClient.delete(`product-type-brands/${id}`);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getBrandsForDropdown = getBrandDropdowns;

export default {
  getRuntimeProductTypes,
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  toggleBrandActive,
  getBrandDropdowns,
  getBrandsForDropdown,
  getProductTypeBrandLinks,
  attachBrandToProductType,
  detachBrandFromProductType,
};
