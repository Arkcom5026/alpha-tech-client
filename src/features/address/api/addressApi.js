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

// helpers for fallback + shape normalization
const pickArray = (data) => (Array.isArray(data) ? data : (data?.items ?? data?.data ?? data?.result ?? []));
const normalizeProvince = (p) => ({
  code: String(p?.code ?? p?.provinceCode ?? p?.id ?? ''),
  nameTh: String(p?.nameTh ?? p?.name_th ?? p?.nameTH ?? p?.name ?? p?.label ?? ''),
});
const normalizeDistrict = (d) => ({
  code: String(d?.code ?? d?.districtCode ?? d?.id ?? ''),
  nameTh: String(d?.nameTh ?? d?.name_th ?? d?.nameTH ?? d?.name ?? d?.label ?? ''),
});
const normalizeSubdistrict = (s) => ({
  code: String(s?.code ?? s?.subdistrictCode ?? s?.id ?? ''),
  nameTh: String(s?.nameTh ?? s?.name_th ?? s?.nameTH ?? s?.name ?? s?.label ?? ''),
  postcode: String(s?.postcode ?? s?.postalCode ?? s?.zip ?? ''),
});
const tryGet = async (paths, params) => {
  for (const path of paths) {
    try {
      const res = await apiClient.get(path, params ? { params } : undefined);
      const arr = pickArray(res?.data);
      if (arr?.length) return arr;
    } catch {
      // continue to next path
    }
  }
  return [];
};

export const getProvinces = async () => {
  try {
    const raw = await tryGet(['/api/address/provinces', '/locations/provinces']);
    return raw.map(normalizeProvince).filter((p) => p.code && p.nameTh);
  } catch (err) {
    console.error('[addressApi.getProvinces] error', err);
    return [];
  }
};

export const getDistricts = async (provinceCode) => {
  try {
    if (!provinceCode) return [];
    const params = { provinceCode: String(provinceCode) };
    const raw = await tryGet(['/api/address/districts', '/locations/districts'], params);
    return raw.map(normalizeDistrict).filter((d) => d.code && d.nameTh);
  } catch (err) {
    console.error('[addressApi.getDistricts] error', err);
    return [];
  }
};

export const getSubdistricts = async (districtCode) => {
  try {
    if (!districtCode) return [];
    const params = { districtCode: String(districtCode) };
    const raw = await tryGet(['/api/address/subdistricts', '/locations/subdistricts'], params);
    return raw.map(normalizeSubdistrict).filter((s) => s.code && s.nameTh);
  } catch (err) {
    console.error('[addressApi.getSubdistricts] error', err);
    return [];
  }
};

