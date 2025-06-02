// ✅ src/features/productProfile/store/productProfileStore.js
import { create } from 'zustand';
import {
  getAllProductProfiles,
  getProductProfileById,
  createProductProfile,
  updateProductProfile,
  deleteProductProfile,
} from '../api/productProfileApi';

const useProductProfileStore = create((set, get) => ({
  profiles: [],
  selectedProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllProductProfiles();
      set({ profiles: data, isLoading: false });
    } catch (error) {
      console.error('❌ fetchProfiles error:', error);
      set({ error, isLoading: false });
    }
  },

  fetchProfileById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProductProfileById(id);
      set({ selectedProfile: profile, isLoading: false });
    } catch (error) {
      console.error('❌ fetchProfileById error:', error);
      set({ error, isLoading: false });
    }
  },

  addProfile: async (newData) => {
    set({ isLoading: true, error: null });
    try {
      await createProductProfile(newData);
      await get().fetchProfiles();
    } catch (error) {
      console.error('❌ addProfile error:', error);
      set({ error, isLoading: false });
    }
  },

  updateProfile: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      await updateProductProfile(id, updatedData);
      await get().fetchProfiles();
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      set({ error, isLoading: false });
    }
  },

  deleteProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProductProfile(id);
      await get().fetchProfiles();
    } catch (error) {
      console.error('❌ deleteProfile error:', error);
      set({ error, isLoading: false });
    }
  },
}));

export default useProductProfileStore;
