



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

      // ===== actions =====
      setQueryAction: (q) => set({ q: String(q || ''), page: 1 }),
      setIncludeInactiveAction: (v) => set({ includeInactive: !!v, page: 1 }),
      setPageAction: (page) => set({ page: Math.max(1, Number(page) || 1) }),
      setPageSizeAction: (pageSize) => {
        const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))
        set({ pageSize: ps, page: 1 })
      },
      clearErrorAction: () => set({ error: null }),

      fetchBrandDropdownsAction: async (override = {}) => {
        const state = get()
        set({ loading: true, error: null })
        try {
          const items = await brandApi.getBrandDropdowns({
            includeInactive: override.includeInactive ?? state.includeInactive,
          })

          set({
            items: Array.isArray(items) ? items : [],
            page: 1,
            pageSize: Array.isArray(items) ? items.length : 0,
            total: Array.isArray(items) ? items.length : 0,
            loading: false,
          })

          return { ok: true }
        } catch (err) {
          set({ loading: false, error: normalizeErrorMessage(err) })
          return { ok: false, error: normalizeErrorMessage(err) }
        }
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

          set({
            items: Array.isArray(data?.items) ? data.items : [],
            page: Number(data?.page) || (override.page ?? state.page),
            pageSize: Number(data?.pageSize) || (override.pageSize ?? state.pageSize),
            total: Number(data?.total) || 0,
            loading: false,
          })

          return { ok: true }
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
    }),
    { name: 'brandStore' }
  )
)

// ✅ Default export for backward-compatible imports
export default useBrandStore


