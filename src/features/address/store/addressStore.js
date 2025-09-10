
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
    resolving: false,
  },
  error: {
    provinces: '',
    districts: '',
    subdistricts: '',
    resolving: '',
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

  // --- Resolver (preload by subdistrictCode) -------------------
  resolveBySubdistrictCodeAction: async (subdistrictCode) => {
    const code = String(subdistrictCode || '');
    if (!code) return null;

    // mark loading
    set((s) => ({ loading: { ...s.loading, resolving: true }, error: { ...s.error, resolving: '' } }));

    try {
      // 1) call backend resolver
      const res = await fetch(`/api/address/resolve?subdistrictCode=${encodeURIComponent(code)}`, {
        headers: { Accept: 'application/json' },
      });
      const info = await res.json();
      if (!res.ok) throw new Error(info?.message || 'resolve failed');

      const pCode = String(info?.provinceCode || '');
      const dCode = String(info?.districtCode || '');
      const sCode = String(info?.subdistrictCode || code);

      // 2) ensure province list exists
      await get().ensureProvincesAction();

      // 3) load districts for province and set selection
      if (pCode) {
        await get().fetchDistrictsAction(pCode);
        get().setSelectedProvince(pCode);
      }

      // 4) load subdistricts for district and set selection
      if (dCode) {
        await get().fetchSubdistrictsAction(dCode);
        get().setSelectedDistrict(dCode);
      }

      // 5) set subdistrict & postal (prefer resolver value, fallback to list cache)
      const list = get().getSubdistrictsByDistrict(dCode);
      const found = list.find((x) => String(x.code) === sCode);
      const postal = String(info?.postalCode || found?.postcode || '');
      get().setSelectedSubdistrict(sCode);
      if (postal) get().setPostalCode(postal);

      return {
        provinceCode: pCode,
        districtCode: dCode,
        subdistrictCode: sCode,
        postalCode: postal,
      };
    } catch (err) {
      console.error('[addressStore.resolveBySubdistrictCodeAction] error', err);
      set((s) => ({ error: { ...s.error, resolving: 'ไม่สามารถเติมที่อยู่อัตโนมัติได้' } }));
      return null;
    } finally {
      set((s) => ({ loading: { ...s.loading, resolving: false } }));
    }
  },

  // --- Reset ---------------------------------------------------
  resetAll: () => set(() => ({ ...initialState, provinces: get().provinces })),
}));



