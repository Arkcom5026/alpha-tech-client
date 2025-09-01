// ✅ src/features/product/store/productStore.js (updated)
import { create } from 'zustand';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsForPos,
  getCatalogDropdowns,
} from '../api/productApi';
import { uploadImagesProduct, uploadImagesProductFull, deleteImageProduct } from '../api/productImagesApi';

const initialDropdowns = {
  categories: [],
  productTypes: [],
  // รองรับทั้งชื่อเก่าและใหม่ให้ component ใช้งานร่วมกันได้
  productProfiles: [],
  profiles: [],
  templates: [],
};

const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  dropdowns: initialDropdowns,
  dropdownsLoaded: false,

  searchResults: [],
  isLoading: false,
  error: null,

  // -------- Products (List/Read) --------
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProducts(filters);
      set({ products: data, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('❌ getProductById error:', error);
      throw error;
    }
  },

  // -------- Products (Create/Update/Delete) --------
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('❌ deleteProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  // -------- Dropdowns (โหลดครั้งเดียว ใช้ทั้งระบบ) --------
  fetchDropdownsAction: async (force = false) => {
    // prevent unnecessary reload
    if (get().dropdownsLoaded && !force) return get().dropdowns;
    try {
      // call API
      const raw = await getCatalogDropdowns();

      // normalize various possible shapes from BE
      const pickArr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

      const categories = pickArr(
        raw?.categories,
        raw?.categoryList,
        raw?.category_list,
        raw?.data?.categories,
        raw?.list?.categories,
        raw?.categoriesList,
        raw?.items?.categories
      );

      const productTypes = pickArr(
        raw?.productTypes,
        raw?.productTypeList,
        raw?.product_types,
        raw?.types,
        raw?.data?.productTypes,
        raw?.list?.productTypes,
        raw?.items?.productTypes,
        raw?.list // some APIs return `list` for types
      );

      const profiles = pickArr(
        raw?.profiles,
        raw?.productProfiles,
        raw?.profileList,
        raw?.data?.profiles
      );

      const templates = pickArr(
        raw?.templates,
        raw?.productTemplates,
        raw?.templateList,
        raw?.data?.templates
      );

      const dropdowns = { categories, productTypes, profiles, productProfiles: profiles, templates };
      set({ dropdowns, dropdownsLoaded: true });
      return dropdowns;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchDropdownsAction error:', error);
      set({ error });
      throw error;
    }
  },

  ensureDropdownsAction: async () => {
    if (!get().dropdownsLoaded) {
      await get().fetchDropdownsAction(true);
    }
    return get().dropdowns;
  },

  resetDropdowns: () => set({ dropdowns: initialDropdowns, dropdownsLoaded: false }),

  // -------- Image Uploads --------
  uploadImages: async (files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProduct(files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ [Store] uploadImages ล้มเหลว:', error);
      throw error;
    }
  },

  uploadImagesFull: async (productId, files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProductFull(productId, files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ uploadImagesFull error:', error);
      throw error;
    }
  },

  deleteImage: async ({ productId, publicId }) => {
    if (!productId || !publicId) throw new Error('Missing data');
    return deleteImageProduct(productId, publicId);
  },

  // -------- POS Search / List for POS --------
  fetchProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductsForPos(filters);
      set({ products: data, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchProductsAction error:', error);
      set({ error, isLoading: false });
    }
  },

  refreshProductList: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const [products] = await Promise.all([
        getProductsForPos(filters),
      ]);
      set({ products, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ refreshProductList error:', error);
      set({ error, isLoading: false });
    }
  },
}));

export default useProductStore;
