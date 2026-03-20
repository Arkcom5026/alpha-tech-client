


// ===============================
// superAdminStore.js
// Location: src/features/superadmin/store/superAdminStore.js
// ===============================

import { create } from 'zustand';
import {
  getSuperAdminCategories,
  createSuperAdminCategory,
  updateSuperAdminCategory,
} from '../api/superAdminApi';

const mapErrorMessage = (error, fallback = 'Something went wrong') => {
  const responseMessage = error?.response?.data?.message;
  const responseError = error?.response?.data?.error;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage.trim();
  }

  if (typeof responseError === 'string' && responseError.trim()) {
    return responseError.trim();
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};

export const useSuperAdminStore = create((set, get) => ({
  // -------------------------------
  // Categories State
  // -------------------------------
  categories: [],
  categoriesLoading: false,
  categoriesSubmitting: false,
  categoriesError: '',
  categoriesLoaded: false,

  // -------------------------------
  // Categories Helpers
  // -------------------------------
  clearCategoriesErrorAction: () => {
    set({ categoriesError: '' });
  },

  resetCategoriesStateAction: () => {
    set({
      categories: [],
      categoriesLoading: false,
      categoriesSubmitting: false,
      categoriesError: '',
      categoriesLoaded: false,
    });
  },

  // -------------------------------
  // Categories Actions
  // -------------------------------
  fetchCategoriesAction: async (params = {}) => {
    try {
      set({ categoriesLoading: true, categoriesError: '' });

      const response = await getSuperAdminCategories(params);
      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response && response.data)
          ? response.data
          : Array.isArray(response && response.items)
            ? response.items
            : [];

      set({
        categories: rows,
        categoriesLoading: false,
        categoriesLoaded: true,
      });

      return { ok: true, data: rows };
    } catch (error) {
      const message = mapErrorMessage(error, 'Failed to load categories');

      set({
        categoriesLoading: false,
        categoriesError: message,
        categoriesLoaded: false,
      });

      return { ok: false, error: message };
    }
  },

  createCategoryAction: async (payload) => {
    try {
      set({ categoriesSubmitting: true, categoriesError: '' });

      const response = await createSuperAdminCategory(payload);
      const created = response && response.data ? response.data : response;
      const current = get().categories;

      set({
        categories: created ? [created, ...current] : current,
        categoriesSubmitting: false,
      });

      return { ok: true, data: created };
    } catch (error) {
      const message = mapErrorMessage(error, 'Failed to create category');

      set({
        categoriesSubmitting: false,
        categoriesError: message,
      });

      return { ok: false, error: message };
    }
  },

  updateCategoryAction: async (categoryId, payload) => {
    try {
      set({ categoriesSubmitting: true, categoriesError: '' });

      const response = await updateSuperAdminCategory(categoryId, payload);
      const updated = response && response.data ? response.data : response;

      const nextRows = get().categories.map((item) => {
        if (item.id !== categoryId) return item;
        return { ...item, ...updated };
      });

      set({
        categories: nextRows,
        categoriesSubmitting: false,
      });

      return { ok: true, data: updated };
    } catch (error) {
      const message = mapErrorMessage(error, 'Failed to update category');

      set({
        categoriesSubmitting: false,
        categoriesError: message,
      });

      return { ok: false, error: message };
    }
  },
}));

// NOTE:
// - This store is SuperAdmin-only
// - No branchId
// - No POS permission logic
// - This store now calls superAdminApi.js directly
// - Next step: verify backend response shape and wire create/edit UI in SuperAdminCategoriesPage.jsx

