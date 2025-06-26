// ✅ src/features/product/store/productStore.js
import { create } from 'zustand';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsForPos,
  getProductDropdownsPublic,

} from '../api/productApi';
import { uploadImagesProduct, uploadImagesProductFull, deleteImageProduct } from '../api/productImagesApi';

const useProductStore = create((set,get) => ({
  products: [],
  currentProduct: null,
  dropdowns: {
    categories: [],
    productTypes: [],
    productProfiles: [],
    templates: []
  },
  dropdownsLoaded: false,

  searchResults: [],
  isLoading: false,
  error: null,

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProducts(filters);
      set({ products: data, isLoading: false });
    } catch (error) {
      console.error('❌ fetchProducts error:', error);
      set({ error, isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductById(id);
      set({ currentProduct: data, isLoading: false });
      return data;
    } catch (error) {
      console.error('❌ fetchProductById error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const data = await getProductById(id);
      return data;
    } catch (error) {
      console.error('❌ getProductById error:', error);
      throw error;
    }
  },

  saveProduct: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };
      delete cleanedPayload.unit;
      delete cleanedPayload.unitId;

      const data = await createProduct(cleanedPayload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      console.error('❌ [Store] saveProduct ล้มเหลว:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };
      delete cleanedPayload.unit;
      delete cleanedPayload.unitId;

      const data = await updateProduct(id, cleanedPayload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      console.error('❌ updateProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
      return data;
    } catch (error) {
      console.error('❌ deleteProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  fetchDropdownsAction: async () => {
    if (get().dropdownsLoaded) return;
    try {
      const data = await getProductDropdownsPublic();
      set({ dropdowns: data, dropdownsLoaded: true });
    } catch (error) {
      console.error('❌ fetchDropdownsAction error:', error);
    }
  },

  uploadImages: async (files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProduct(files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      console.error('❌ [Store] uploadImages ล้มเหลว:', error);
      throw error;
    }
  },

  uploadImagesFull: async (productId, files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProductFull(productId, files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      console.error('❌ uploadImagesFull error:', error);
      throw error;
    }
  },

  deleteImage: async ({ productId, publicId }) => {
    if (!productId || !publicId) throw new Error("Missing data");
    return await deleteImageProduct(productId, publicId);
  },

  fetchProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductsForPos(filters);
      set({ products: data, isLoading: false });
    } catch (error) {
      console.error('❌ fetchProductsAction error:', error);
      set({ error, isLoading: false });
    }
  },

  refreshProductList: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const [products, dropdowns] = await Promise.all([
        getProductsForPos(filters),
        getProductDropdownsByToken()
      ]);
      set({ products, dropdowns, isLoading: false });
    } catch (error) {
      console.error('❌ refreshProductList error:', error);
      set({ error, isLoading: false });
    }
  },

  resetDropdowns: () => set({
    dropdowns: {
      categories: [],
      productTypes: [],
      productProfiles: [],
      templates: []
    },
    dropdownsLoaded: false
  }),

}));

export default useProductStore;
