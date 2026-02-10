


// ✅ src/features/stock/brand/api/brandApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// =============================
// Mappers (compat active -> isActive)
// =============================
const mapBrandFromApi = (b) => {
  if (!b || typeof b !== 'object') return b;
  const out = { ...b };

  // compat: BE บางจุดอาจยังส่ง `active` มา
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

// helper: build params แบบเดียวกับ productApi (ไม่ส่งค่า empty)
const __buildParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null));

// =============================
// LIST (table / manage page)
// =============================
export const getBrands = async ({ q = '', page = 1, pageSize = 20, includeInactive = false } = {}) => {
  try {
    const params = __buildParams({
      q: q?.trim() || undefined,
      page,
      pageSize,
      includeInactive: includeInactive ? 'true' : 'false',
      _ts: Date.now(),
    });

    // ✅ no leading slash
    const { data } = await apiClient.get('brands', { params });
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

// =============================
// GET BY ID (optional helper)
// =============================
export const getBrandById = async (id) => {
  try {
    const { data } = await apiClient.get(`brands/${id}`, { params: { _ts: Date.now() } });
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

// =============================
// CREATE / UPDATE
// =============================
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

// =============================
// TOGGLE ACTIVE
// =============================
export const toggleBrandActive = async ({ id, isActive }) => {
  try {
    // ส่ง active ให้ตรง Prisma + ส่ง isActive เผื่อ BE รองรับ compat
    const payload = { active: !!isActive, isActive: !!isActive };
    const { data } = await apiClient.patch(`brands/${id}/toggle`, payload);
    return mapBrandsPayloadFromApi(data);
  } catch (err) {
    throw parseApiError(err);
  }
};

// =============================
// DROPDOWNS (ตามแนวทาง productApi)
// - พยายามเรียก endpoint เฉพาะ: GET brands/dropdowns
// - ถ้า BE ยังไม่มี endpoint นี้ → fallback ไปใช้ list (pageSize=1000)
// - คืนค่าเป็น array เสมอ
// =============================
const __extractArray = (mapped) => {
  if (Array.isArray(mapped)) return mapped;
  if (Array.isArray(mapped?.items)) return mapped.items;
  return [];
};

export const getBrandDropdowns = async ({ includeInactive = false } = {}) => {
  const params = __buildParams({
    includeInactive: includeInactive ? 'true' : 'false',
    _ts: Date.now(),
  });

  // 1) preferred: dedicated dropdown endpoint
  try {
    const { data } = await apiClient.get('brands/dropdowns', { params });
    const mapped = mapBrandsPayloadFromApi(data);
    return __extractArray(mapped);
  } catch (err) {
    // fallback เฉพาะกรณี "ไม่พบ endpoint" (404)
    const status = err?.response?.status;
    if (status !== 404) throw parseApiError(err);
  }

  // 2) fallback: list endpoint (stable, but heavier)
  try {
    const listParams = __buildParams({
      page: 1,
      pageSize: 1000,
      includeInactive: includeInactive ? 'true' : 'false',
      _ts: Date.now(),
    });

    const { data } = await apiClient.get('brands', { params: listParams });
    const mapped = mapBrandsPayloadFromApi(data);
    return __extractArray(mapped);
  } catch (err) {
    throw parseApiError(err);
  }
};

// Alias (backward-compatible)
export const getBrandsForDropdown = getBrandDropdowns;

// ✅ default export for backward-compatible imports
export default {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  toggleBrandActive,
  getBrandDropdowns,
  getBrandsForDropdown, // alias
};





