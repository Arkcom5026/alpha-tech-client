






// src/features/brand/store/brandStore.js
 
// Zustand Store (Production-grade)
// ✅ Component must call store only. No direct API calls in components.

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import * as brandApi from '../api/brandApi'

const normalizeErrorMessage = (err) => {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err.message) return String(err.message)
  if (err.status && err.raw) return String(err.message || 'REQUEST_FAILED')
  try {
    return JSON.stringify(err)
  } catch {
    return 'REQUEST_FAILED'
  }
}

export const useBrandStore = create(
  devtools(
    (set, get) => ({
      // ===== state =====
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

      // ===== actions =====
      setQueryAction: (q) => set({ q: String(q || ''), page: 1 }),
      setIncludeInactiveAction: (v) => set({ includeInactive: !!v, page: 1 }),
      setPageAction: (page) => set({ page: Math.max(1, Number(page) || 1) }),
      setPageSizeAction: (pageSize) => {
        const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))
        set({ pageSize: ps, page: 1 })
      },
      clearErrorAction: () => set({ error: null }),
      resetBrandDropdownsAction: () => set({
        items: [],
        dropdownsLoaded: false,
        dropdownsLoading: false,
        error: null,
        lastFetchKey: null,
      }),

      fetchBrandDropdownsAction: async (override = {}) => {
        const state = get()
        const includeInactive = override.includeInactive ?? state.includeInactive
        const productTypeId =
          override.productTypeId === '' || override.productTypeId === null || override.productTypeId === undefined
            ? undefined
            : Number(override.productTypeId)
        const force = override.force === true
        const fetchKey = JSON.stringify({
          includeInactive,
          productTypeId: Number.isFinite(productTypeId) ? productTypeId : null,
        })

        if (
          !force &&
          state.dropdownsLoaded &&
          state.lastFetchKey === fetchKey &&
          Array.isArray(state.items) &&
          state.items.length > 0
        ) {
          return { ok: true, cached: true, items: state.items }
        }

        set({ loading: true, dropdownsLoading: true, error: null })
        try {
          const items = await brandApi.getBrandDropdowns({
            includeInactive,
            productTypeId: Number.isFinite(productTypeId) ? productTypeId : undefined,
          })
          const safeItems = Array.isArray(items) ? items : []

          set({
            items: safeItems,
            page: 1,
            pageSize: safeItems.length,
            total: safeItems.length,
            loading: false,
            dropdownsLoading: false,
            dropdownsLoaded: safeItems.length > 0,
            lastFetchKey: fetchKey,
          })

          return { ok: true, items: safeItems }
        } catch (err) {
          const normalized = normalizeErrorMessage(err)
          set({
            loading: false,
            dropdownsLoading: false,
            dropdownsLoaded: false,
            error: normalized,
          })
          return { ok: false, error: normalized }
        }
      },

      ensureBrandDropdownsAction: async (override = {}) => {
        const state = get()
        const includeInactive = override.includeInactive ?? state.includeInactive
        const productTypeId =
          override.productTypeId === '' || override.productTypeId === null || override.productTypeId === undefined
            ? undefined
            : Number(override.productTypeId)
        const fetchKey = JSON.stringify({
          includeInactive,
          productTypeId: Number.isFinite(productTypeId) ? productTypeId : null,
        })

        if (
          state.dropdownsLoaded &&
          state.lastFetchKey === fetchKey &&
          Array.isArray(state.items) &&
          state.items.length > 0
        ) {
          return { ok: true, cached: true, items: state.items }
        }

        return get().fetchBrandDropdownsAction({
          includeInactive,
          productTypeId: Number.isFinite(productTypeId) ? productTypeId : undefined,
          force: override.force === true,
        })
      },

      fetchBrandsAction: async (override = {}) => {
        const state = get()
        set({ loading: true, error: null })
        try {
          const data = await brandApi.getBrands({
            q: override.q ?? state.q,
            page: override.page ?? state.page,
            pageSize: override.pageSize ?? state.pageSize,
            includeInactive: override.includeInactive ?? state.includeInactive,
          })

          const safeItems = Array.isArray(data?.items) ? data.items : []

          set({
            items: safeItems,
            page: Number(data?.page) || (override.page ?? state.page),
            pageSize: Number(data?.pageSize) || (override.pageSize ?? state.pageSize),
            total: Number(data?.total) || 0,
            loading: false,
            dropdownsLoaded: safeItems.length > 0,
            lastFetchKey: null,
          })

          return { ok: true, items: safeItems }
        } catch (err) {
          set({ loading: false, error: normalizeErrorMessage(err) })
          return { ok: false, error: normalizeErrorMessage(err) }
        }
      },

      createBrandAction: async ({ name }) => {
        set({ saving: true, error: null })
        try {
          const created = await brandApi.createBrand({ name })

          // optimistic insert (keep list sorted like BE: isActive desc, name asc)
          const items = [...get().items, created]
            .filter(Boolean)
            .sort((a, b) => {
              const aAct = (a?.active ?? a?.isActive) ? 1 : 0
              const bAct = (b?.active ?? b?.isActive) ? 1 : 0
              if (aAct !== bAct) return bAct - aAct
              return String(a.name || '').localeCompare(String(b.name || ''), 'th')
            })

          set({ items, saving: false })
          return { ok: true, data: created }
        } catch (err) {
          set({ saving: false, error: normalizeErrorMessage(err) })
          return { ok: false, error: normalizeErrorMessage(err) }
        }
      },

      updateBrandAction: async ({ id, name }) => {
        set({ saving: true, error: null })
        try {
          const updated = await brandApi.updateBrand({ id, name })

          const items = get().items.map((it) => (it?.id === updated?.id ? updated : it))
          set({ items, saving: false })
          return { ok: true, data: updated }
        } catch (err) {
          set({ saving: false, error: normalizeErrorMessage(err) })
          return { ok: false, error: normalizeErrorMessage(err) }
        }
      },

      toggleBrandActiveAction: async ({ id, isActive }) => {
        set({ saving: true, error: null })
        try {
          const updated = await brandApi.toggleBrandActive({ id, isActive })

          const items = get().items.map((it) => (it?.id === updated?.id ? updated : it))
          set({ items, saving: false })
          return { ok: true, data: updated }
        } catch (err) {
          set({ saving: false, error: normalizeErrorMessage(err) })
          return { ok: false, error: normalizeErrorMessage(err) }
        }
      },

      // ===== Mapping: ProductType ↔ Brand =====
      attachBrandToProductTypeAction: async ({ productTypeId, brandId }) => {
        set({ saving: true, error: null })
        try {
          if (!productTypeId || !brandId) {
            throw new Error('INVALID_PRODUCTTYPE_OR_BRAND')
          }

          const res = await brandApi.attachBrandToProductType({
            productTypeId: Number(productTypeId),
            brandId: Number(brandId),
          })

          // หลัง mapping สำเร็จ → รีโหลด dropdown เฉพาะ productType นี้
          await get().fetchBrandDropdownsAction({
            productTypeId: Number(productTypeId),
            force: true,
          })

          set({ saving: false })
          return { ok: true, data: res }
        } catch (err) {
          const normalized = normalizeErrorMessage(err)
          set({ saving: false, error: normalized })
          return { ok: false, error: normalized }
        }
      },

      getBrandOptionsAction: () => {
        const items = get().items
        return Array.isArray(items) ? items : []
      },

      hasBrandDropdownsAction: () => {
        const state = get()
        return !!(state.dropdownsLoaded && Array.isArray(state.items) && state.items.length > 0)
      },
    }),
    { name: 'brandStore' }
  )
)

// ✅ Default export for backward-compatible imports
export default useBrandStore





