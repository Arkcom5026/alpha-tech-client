// =============================================================
// Module: src/features/address/
// Purpose: Address/ADM (Province → District → Subdistrict) API + Store + Components
// Convention: Project #1 (Frontend = ESM; Backend = CommonJS). No barrel file.
// =============================================================

// =============================================================
// File: src/features/address/api/addressApi.js
// Desc: API layer for Thailand ADM dropdowns (Province → District → Subdistrict)
// Note: Uses central axios instance from '@/utils/apiClient'
// =============================================================


import apiClient from '@/utils/apiClient';

export const getProvinces = async () => {
  try {
    const res = await apiClient.get('/locations/provinces');
    return Array.isArray(res?.data?.items) ? res.data.items : [];
  } catch (err) {
    console.error('[addressApi.getProvinces] error', err);
    throw err;
  }
};

export const getDistricts = async (provinceCode) => {
  try {
    if (!provinceCode) return [];
    const res = await apiClient.get('/locations/districts', { params: { provinceCode: String(provinceCode) } });
    return Array.isArray(res?.data?.items) ? res.data.items : [];
  } catch (err) {
    console.error('[addressApi.getDistricts] error', err);
    throw err;
  }
};

export const getSubdistricts = async (districtCode) => {
  try {
    if (!districtCode) return [];
    const res = await apiClient.get('/locations/subdistricts', { params: { districtCode: String(districtCode) } });
    return Array.isArray(res?.data?.items) ? res.data.items : [];
  } catch (err) {
    console.error('[addressApi.getSubdistricts] error', err);
    throw err;
  }
};
