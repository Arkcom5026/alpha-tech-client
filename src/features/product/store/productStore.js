// ✅ src/features/product/store/productStore.js
import { create } from 'zustand';

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductDropdowns,
  getProductPrices,
  getProducts,
  updateProduct,
  updateProductPrices,
  addProductPrice,
  deleteProductPrice,
} from '../api/productApi';
import { uploadImagesProduct, uploadImagesProductFull ,deleteImageProduct } from '../api/productImagesApi';

const useProductStore = create((set) => ({
  products: [],
  currentProduct: null,
  dropdowns: {
    categories: [],
    productTypes: [],
    productProfiles: [],
    templates: [],
    units: [],
  },
  productPrices: [],
  isLoading: false,
  isLoadingPrices: false,
  priceError: null,
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
      console.log('🧾 [Store] กำลังส่ง payload ไป createProduct:', payload);
      const data = await createProduct(payload);
      console.log('✅ [Store] สร้าง product สำเร็จ:', data);
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
      const data = await updateProduct(id, payload);
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

  fetchDropdowns: async (productId = null) => {
    try {
      const data = await getProductDropdowns(productId);
      set({ dropdowns: data });
    } catch (error) {
      console.error('❌ fetchDropdowns error:', error);
    }
  },

  loadProductPrices: async (productId) => {
    set({ isLoadingPrices: true, priceError: null });
    try {
      const prices = await getProductPrices(productId);
      set({ productPrices: prices, isLoadingPrices: false });
    } catch (error) {
      console.error('❌ โหลดราคาสินค้าไม่สำเร็จใน Store:', error);
      set({ priceError: error, isLoadingPrices: false });
    }
  },

  updateProductPrices: async (productId, prices) => {
    try {
      const res = await updateProductPrices(productId, prices);
      set({ productPrices: res });
      return res;
    } catch (error) {
      console.error('❌ updateProductPrices error:', error);
      throw error;
    }
  },

  addProductPrice: async (productId, priceData) => {
    try {
      console.log('📤 [Store] เพิ่มราคาสินค้า:', { productId, priceData });
      const newPrice = await addProductPrice(productId, priceData);
      set((state) => ({
        productPrices: [...state.productPrices, newPrice],
      }));
      console.log('✅ [Store] เพิ่มราคาสำเร็จ:', newPrice);
      return newPrice;
    } catch (error) {
      console.error('❌ [Store] addProductPrice error:', error);
      throw error;
    }
  },

  deleteProductPrice: async (productId, priceId) => {
    try {
      await deleteProductPrice(productId, priceId);
      set((state) => ({
        productPrices: state.productPrices.filter((p) => p.id !== priceId),
      }));
    } catch (error) {
      console.error('❌ deleteProductPrice error:', error);
      throw error;
    }
  },

  clearProductPrices: () => {
    set({ productPrices: [], priceError: null });
  },

  uploadImages: async (files, captions, coverIndex) => {
    try {
      console.log('📤 [Store] กำลังอัปโหลดภาพ:', { count: files.length, captions, coverIndex });
      const uploaded = await uploadImagesProduct(files, captions, coverIndex);
      console.log('📥 [Store] ภาพที่ได้จาก Cloud:', uploaded);
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
    return await deleteImageProduct(productId, publicId); // ✅ เรียกผ่าน API Layer
  }
  
  


}));

export default useProductStore;
