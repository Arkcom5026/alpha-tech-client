
// ==============================
// ========== FRONTEND ==========
// ==============================
// NOTE: Frontend uses ES Modules, centralized API via utils/apiClient.js, and Zustand stores.
// Files below are intended to be placed under src/features/position/

// --- filepath: src/features/position/api/positionApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// LIST
export const getPositions = async ({ page = 1, limit = 20, search = '', active } = {}) => {
  try {
    const params = { page, limit, _ts: Date.now() };
    if (search?.trim()) params.search = search.trim();
    if (active === true) params.active = 'true';
    if (active === false) params.active = 'false';
    const { data } = await apiClient.get('positions', { params });
    return data; // { items, meta }
  } catch (err) { throw parseApiError(err); }
};

// DROPDOWNS (active only by default)
export const getPositionDropdowns = async (active = true) => {
  try {
    const params = { _ts: Date.now() };
    if (active === true) params.active = 'true';
    else if (active === false) params.active = 'false';
    const { data } = await apiClient.get('positions/dropdowns', { params });
    return data; // [{ id, name }]
  } catch (err) { throw parseApiError(err); }
};

// GET BY ID
export const getPositionById = async (id) => {
  try {
    const { data } = await apiClient.get(`positions/${Number(id)}`, { params: { _ts: Date.now() } });
    if (import.meta.env?.DEV) console.log('[positionApi] getById', id, data);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// CREATE
export const createPosition = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[positionApi] create', payload);
    const { data } = await apiClient.post('positions', payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// UPDATE (PATCH like productApi)
export const updatePosition = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`positions/${Number(id)}`, payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// TOGGLE ACTIVE
export const toggleActivePosition = async (id) => {
  try {
    const { data } = await apiClient.patch(`positions/${Number(id)}/toggle-active`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// HARD DELETE (superadmin only; avoid in normal flows)
export const hardDeletePosition = async (id) => {
  try {
    const { data } = await apiClient.delete(`positions/${Number(id)}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};
