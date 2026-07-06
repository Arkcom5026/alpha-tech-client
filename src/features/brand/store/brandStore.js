// src/features/brand/store/brandStore.js
// Zustand Store (Production-grade)

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import * as brandApi from '../api/brandApi';

const normalizeErrorMessage = (err) => {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err.message) return String(err.message);
  if (err.status && err.raw) return String(err.message || 'REQUEST_FAILED');
  try {
    return JSON.stringify(err);
  } catch {
    return 'REQUEST_FAILED';
  }
};

const normalizeId = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const useBrandStore = create(
  devtools(
    (set, get) => ({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      q: '',
      includeInactive: false,

      loading: false,
      saving: false,
      error: null,

      dropdownsLoaded: false,
      dropdownsLoading: false,
      lastFetchKey: null,

      runtimeProductTypes: [],
      runtimeProductTypesLoading: false,

      allBrandOptions: [],
      allBrandOptionsLoading: false,
      productTypeBrandLinks: [],
      productTypeBrandLinksLoading: false,

      setQueryAction: (q) => set({ q: String(q || ''), page: 1 }),
      setIncludeInactiveAction: (v) => set({ includeInactive: !!v, page: 1 }),
      setPageAction: (page) => set({ page: Math.max(1, Number(page) || 1) }),
      setPageSizeAction: (pageSize) => {
        const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
        set({ pageSize: ps, page: 1 });
      },
      clearErrorAction: () => set({ error: null }),

      fetchRuntimeProductTypesAction: async (override = {}) => {
        set({ runtimeProductTypesLoading: true, error: null });
        try {
          const items = await brandApi.getRuntimeProductTypes({
            includeInactive: override.includeInactive ?? false,
            pageSize: override.pageSize ?? 100,
            q: override.q ?? '',
          });
          const safeItems = Array.isArray(items) ? items : [];
          set({
            runtimeProductTypes: safeItems,
            runtimeProductTypesLoading: false,
          });
          return { ok: true, items: safeItems };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ runtimeProductTypesLoading: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      resetBrandDropdownsAction: () =>
        set({
          items: [],
          dropdownsLoaded: false,
          dropdownsLoading: false,
          error: null,
          lastFetchKey: null,
        }),

      fetchBrandDropdownsAction: async (override = {}) => {
        const state = get();
        const includeInactive = override.includeInactive ?? state.includeInactive;
        const productTypeId = normalizeId(override.productTypeId);
        const force = override.force === true;
        const fetchKey = JSON.stringify({
          includeInactive,
          productTypeId: productTypeId || null,
        });

        if (
          !force &&
          state.dropdownsLoaded &&
          state.lastFetchKey === fetchKey &&
          Array.isArray(state.items) &&
          state.items.length > 0
        ) {
          return { ok: true, cached: true, items: state.items };
        }

        set({ loading: true, dropdownsLoading: true, error: null });
        try {
          const items = await brandApi.getBrandDropdowns({
            includeInactive,
            productTypeId,
          });
          const safeItems = Array.isArray(items) ? items : [];

          set({
            items: safeItems,
            page: 1,
            pageSize: safeItems.length,
            total: safeItems.length,
            loading: false,
            dropdownsLoading: false,
            dropdownsLoaded: safeItems.length > 0,
            lastFetchKey: fetchKey,
          });

          return { ok: true, items: safeItems };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({
            loading: false,
            dropdownsLoading: false,
            dropdownsLoaded: false,
            error: normalized,
          });
          return { ok: false, error: normalized };
        }
      },

      ensureBrandDropdownsAction: async (override = {}) => {
        const state = get();
        const includeInactive = override.includeInactive ?? state.includeInactive;
        const productTypeId = normalizeId(override.productTypeId);
        const fetchKey = JSON.stringify({
          includeInactive,
          productTypeId: productTypeId || null,
        });

        if (
          state.dropdownsLoaded &&
          state.lastFetchKey === fetchKey &&
          Array.isArray(state.items) &&
          state.items.length > 0
        ) {
          return { ok: true, cached: true, items: state.items };
        }

        return get().fetchBrandDropdownsAction({
          includeInactive,
          productTypeId,
          force: override.force === true,
        });
      },

      fetchBrandsAction: async (override = {}) => {
        const state = get();
        set({ loading: true, error: null });
        try {
          const data = await brandApi.getBrands({
            q: override.q ?? state.q,
            page: override.page ?? state.page,
            pageSize: override.pageSize ?? state.pageSize,
            includeInactive: override.includeInactive ?? state.includeInactive,
            productTypeId: normalizeId(override.productTypeId),
          });

          const safeItems = Array.isArray(data?.items) ? data.items : [];

          set({
            items: safeItems,
            page: Number(data?.page) || (override.page ?? state.page),
            pageSize: Number(data?.pageSize) || (override.pageSize ?? state.pageSize),
            total: Number(data?.total) || 0,
            loading: false,
            dropdownsLoaded: safeItems.length > 0,
            lastFetchKey: null,
          });

          return { ok: true, items: safeItems };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ loading: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      fetchAllBrandOptionsAction: async (override = {}) => {
        set({ allBrandOptionsLoading: true, error: null });
        try {
          const items = await brandApi.getBrandDropdowns({
            includeInactive: override.includeInactive ?? false,
          });
          const safeItems = Array.isArray(items) ? items : [];
          set({
            allBrandOptions: safeItems,
            allBrandOptionsLoading: false,
          });
          return { ok: true, items: safeItems };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ allBrandOptionsLoading: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      createBrandAction: async ({ name }) => {
        set({ saving: true, error: null });
        try {
          const created = await brandApi.createBrand({ name });

          const items = [...get().items, created]
            .filter(Boolean)
            .sort((a, b) => {
              const aAct = (a?.active ?? a?.isActive) ? 1 : 0;
              const bAct = (b?.active ?? b?.isActive) ? 1 : 0;
              if (aAct !== bAct) return bAct - aAct;
              return String(a.name || '').localeCompare(String(b.name || ''), 'th');
            });

          const allBrandOptions = [...get().allBrandOptions, created]
            .filter(Boolean)
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'th'));

          set({ items, allBrandOptions, saving: false });
          return { ok: true, data: created };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ saving: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      updateBrandAction: async ({ id, name }) => {
        set({ saving: true, error: null });
        try {
          const updated = await brandApi.updateBrand({ id, name });

          const items = get().items.map((it) => (it?.id === updated?.id ? updated : it));
          const allBrandOptions = get().allBrandOptions.map((it) => (it?.id === updated?.id ? updated : it));
          set({ items, allBrandOptions, saving: false });
          return { ok: true, data: updated };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ saving: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      toggleBrandActiveAction: async ({ id, isActive }) => {
        set({ saving: true, error: null });
        try {
          const updated = await brandApi.toggleBrandActive({ id, isActive });

          const items = get().items.map((it) => (it?.id === updated?.id ? updated : it));
          const allBrandOptions = get().allBrandOptions.map((it) => (it?.id === updated?.id ? updated : it));
          set({ items, allBrandOptions, saving: false });
          return { ok: true, data: updated };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ saving: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      fetchProductTypeBrandLinksAction: async ({ productTypeId, includeInactive } = {}) => {
        const ptId = normalizeId(productTypeId);
        if (!ptId) {
          set({ productTypeBrandLinks: [], productTypeBrandLinksLoading: false });
          return { ok: true, items: [] };
        }

        set({ productTypeBrandLinksLoading: true, error: null });
        try {
          const data = await brandApi.getProductTypeBrandLinks({
            productTypeId: ptId,
            includeInactive: includeInactive ?? get().includeInactive,
          });
          const items = Array.isArray(data?.items) ? data.items : [];
          set({
            productTypeBrandLinks: items,
            productTypeBrandLinksLoading: false,
          });
          return { ok: true, items };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ productTypeBrandLinksLoading: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      attachBrandToProductTypeAction: async ({ productTypeId, brandId }) => {
        const ptId = normalizeId(productTypeId);
        const bId = normalizeId(brandId);

        set({ saving: true, error: null });
        try {
          if (!ptId || !bId) {
            throw new Error('INVALID_PRODUCTTYPE_OR_BRAND');
          }

          const res = await brandApi.attachBrandToProductType({
            productTypeId: ptId,
            brandId: bId,
          });

          await get().fetchProductTypeBrandLinksAction({ productTypeId: ptId, includeInactive: true });
          await get().fetchBrandsAction({
            q: get().q,
            page: get().page,
            pageSize: get().pageSize,
            includeInactive: get().includeInactive,
            productTypeId: ptId,
          });

          set({ saving: false });
          return { ok: true, data: res };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ saving: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      detachBrandFromProductTypeAction: async ({ id, productTypeId }) => {
        const linkId = normalizeId(id);
        const ptId = normalizeId(productTypeId);

        set({ saving: true, error: null });
        try {
          if (!linkId) throw new Error('INVALID_ID');

          const res = await brandApi.detachBrandFromProductType({ id: linkId });

          if (ptId) {
            await get().fetchProductTypeBrandLinksAction({ productTypeId: ptId, includeInactive: true });
            await get().fetchBrandsAction({
              q: get().q,
              page: get().page,
              pageSize: get().pageSize,
              includeInactive: get().includeInactive,
              productTypeId: ptId,
            });
          }

          set({ saving: false });
          return { ok: true, data: res };
        } catch (err) {
          const normalized = normalizeErrorMessage(err);
          set({ saving: false, error: normalized });
          return { ok: false, error: normalized };
        }
      },

      getBrandOptionsAction: () => {
        const items = get().items;
        return Array.isArray(items) ? items : [];
      },
    })
  )
);

export default useBrandStore;
