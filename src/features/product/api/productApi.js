// ✅ src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';

export const getProducts = async ({ search, status } = {}) => {
  try {
    const params = {};
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }
    if (status && status !== 'all') {
      params.status = status;
    }

    const res = await apiClient.get('/products', { params });

    return res.data;
  } catch (error) {
    console.error('❌ getProducts error:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    console.log('📥 [API] ผลลัพธ์จาก getProductById:', res.data); // ✅ เพิ่ม log นี้
    return res.data;
  } catch (error) {
    console.error('❌ getProductById error:', error);
    throw error;
  }
};

export const createProduct = async (payload) => {
  try {
    console.log('📤 [API] ส่งข้อมูลสร้างสินค้า:', payload); // ✅ เพิ่ม log นี้
    const res = await apiClient.post('/products', payload);
    console.log('📥 [API] ผลลัพธ์จาก createProduct:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ createProduct error:', error);
    throw error;
  }
};

export const updateProduct = async (id, payload) => {
  try {
    const res = await apiClient.put(`/products/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error('❌ updateProduct error:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ deleteProduct error:', error);
    throw error;
  }
};

export const getProductDropdownsPublic = async () => {
  const res = await apiClient.get('/products/dropdowns');
  return res.data;
};

export const getProductPrices = async (productId) => {
  try {
    const res = await apiClient.get(`/products/${productId}/prices`);
    return res.data;
  } catch (error) {
    console.error('❌ getProductPrices error:', error);
    return [];
  }
};

export const updateProductPrices = async (productId, prices) => {
  try {
    const res = await apiClient.put(`/products/${productId}/prices`, { prices });
    return res.data;
  } catch (error) {
    console.error('❌ updateProductPrices error:', error);
    throw error;
  }
};

export const addProductPrice = async (productId, priceData) => {
  try {
    console.log('📤 [API] เพิ่มราคาสินค้า:', { productId, priceData }); // ✅ เพิ่ม log นี้
    const res = await apiClient.post(`/products/${productId}/prices`, priceData);    
    return res.data;
  } catch (error) {
    console.error('❌ addProductPrice error:', error);
    throw error;
  }
};

export const deleteProductPrice = async (productId, priceId) => {
  try {
    const res = await apiClient.delete(`/products/${productId}/prices/${priceId}`);
    return res.data;
  } catch (error) {
    console.error('❌ deleteProductPrice error:', error);
    throw error;
  }
};

export const getProductsForPos = async (filters) => {
  try {
    const res = await apiClient.get('/products/pos/search', { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ getProductsForPos error:', error);
    return [];
  }
};





