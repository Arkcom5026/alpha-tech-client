
// =============================================================
// File: src/features/address/store/addressStore.js
// Desc: Zustand store for address dropdowns w/ caching & controlled selection
// Rules respected:
// - All API calls go through api layer (not directly from components) [37][61]
// - Arrow functions, robust try/catch, production-ready defaults
// =============================================================

import { create } from 'zustand';
import { getProvinces, getDistricts, getSubdistricts } from '@/features/address/api/addressApi';

const initialState = {
  provinces: [],
  districtsByProvince: {},      // { [provinceCode]: District[] }
  subdistrictsByDistrict: {},   // { [districtCode]: Subdistrict[] }

  selected: {
    provinceCode: '',
    districtCode: '',
    subdistrictCode: '',
    postalCode: '',
  },

  loading: {
    provinces: false,
    districts: false,
    subdistricts: false,
  },
  error: {
    provinces: '',
    districts: '',
    subdistricts: '',
  },
};

export const useAddressStore = create((set, get) => ({
  ...initialState,

  // --- Loaders -------------------------------------------------
  ensureProvincesAction: async () => {
    const { provinces } = get();
    if (provinces.length > 0) return; // cached
    set((s) => ({ loading: { ...s.loading, provinces: true }, error: { ...s.error, provinces: '' } }));
    try {
      const items = await getProvinces();
      set((s) => ({ provinces: items, loading: { ...s.loading, provinces: false } }));
    } catch (err) {
      console.error('[addressStore] error', err);
      set((s) => ({ loading: { ...s.loading, provinces: false }, error: { ...s.error, provinces: 'โหลดจังหวัดไม่สำเร็จ' } }));
    }
  },

  fetchDistrictsAction: async (provinceCode) => {
    if (!provinceCode) return;
    const key = String(provinceCode);
    const { districtsByProvince } = get();
    if (Array.isArray(districtsByProvince[key])) return; // cached

    set((s) => ({ loading: { ...s.loading, districts: true }, error: { ...s.error, districts: '' } }));
    try {
      const items = await getDistricts(key);
      set((s) => ({
        districtsByProvince: { ...s.districtsByProvince, [key]: items },
        loading: { ...s.loading, districts: false },
      }));
    } catch (err) {
      console.error('[addressStore] error', err);
      set((s) => ({ loading: { ...s.loading, districts: false }, error: { ...s.error, districts: 'โหลดอำเภอไม่สำเร็จ' } }));
    }
  },

  fetchSubdistrictsAction: async (districtCode) => {
    if (!districtCode) return;
    const key = String(districtCode);
    const { subdistrictsByDistrict } = get();
    if (Array.isArray(subdistrictsByDistrict[key])) return; // cached

    set((s) => ({ loading: { ...s.loading, subdistricts: true }, error: { ...s.error, subdistricts: '' } }));
    try {
      const items = await getSubdistricts(key);
      set((s) => ({
        subdistrictsByDistrict: { ...s.subdistrictsByDistrict, [key]: items },
        loading: { ...s.loading, subdistricts: false },
      }));
    } catch (err) {
      console.error('[addressStore] error', err);
      set((s) => ({ loading: { ...s.loading, subdistricts: false }, error: { ...s.error, subdistricts: 'โหลดตำบลไม่สำเร็จ' } }));
    }
  },

  // --- Helpers -------------------------------------------------
  getDistrictsByProvince: (provinceCode) => {
    if (!provinceCode) return [];
    return get().districtsByProvince[String(provinceCode)] || [];
  },
  getSubdistrictsByDistrict: (districtCode) => {
    if (!districtCode) return [];
    return get().subdistrictsByDistrict[String(districtCode)] || [];
  },

  // --- Controlled selection setters ---------------------------
  setSelectedProvince: (provinceCode) => {
    const code = String(provinceCode || '');
    set(() => ({
      selected: {
        provinceCode: code,
        districtCode: '',
        subdistrictCode: '',
        postalCode: '',
      },
    }));
  },
  setSelectedDistrict: (districtCode) => {
    const code = String(districtCode || '');
    set((s) => ({
      selected: {
        ...s.selected,
        districtCode: code,
        subdistrictCode: '',
        postalCode: '',
      },
    }));
  },
  setSelectedSubdistrict: (subdistrictCode) => {
    const code = String(subdistrictCode || '');
    // try resolve postcode from cache
    const list = get().getSubdistrictsByDistrict(get().selected.districtCode);
    const found = list.find((x) => String(x.code) === code);
    const postal = found?.postcode ? String(found.postcode) : '';
    set((s) => ({ selected: { ...s.selected, subdistrictCode: code, postalCode: postal } }));
  },
  setPostalCode: (postalCode) => set((s) => ({ selected: { ...s.selected, postalCode: String(postalCode || '') } })),

  // --- Reset ---------------------------------------------------
  resetAll: () => set(() => ({ ...initialState, provinces: get().provinces })),
}));


