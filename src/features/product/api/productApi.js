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
    console.log('getProducts : ',res)

    return res.data;
  } catch (error) {
    console.error('❌ getProducts error:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
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

export const getProductDropdowns = async (productId) => {
  const res = await apiClient.get(`/products/dropdowns/${productId}`);
  return res.data;
};

export const getProductDropdownsByBranch = async ({ branchId }) => {
  const res = await apiClient.get('/products/dropdowns', {
    params: { branchId },
  });
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
    console.log('📥 [API] ผลลัพธ์จาก addProductPrice:', res.data);
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

// ✅ เพิ่มฟังก์ชันค้นหาสินค้าแบบยืดหยุ่นสำหรับการขายหรือสั่งซื้อ
export const searchProducts = async (query) => {
  try {
    const res = await apiClient.get('/products/search', {
      params: { query }
    });
    return res.data;
  } catch (error) {
    console.error('❌ searchProducts error:', error);
    return [];
  }
};
