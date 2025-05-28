// ✅ src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';

export const getAllProducts = async (branchId) => {
  try {
    const res = await apiClient.get(`/products?branchId=${branchId}`);
    return res.data;
  } catch (error) {
    console.error('❌ getAllProducts error:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res.data;
  } catch (error) {
    console.error('❌ getAllCategories error:', error);
    throw error;
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
    const res = await apiClient.post('/products', payload);
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

export const deleteProduct = async (id, branchId) => {
  try {
    const res = await apiClient.delete(`/products/${id}`, {
      data: { updatedByBranchId: branchId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ deleteProduct error:', error);
    throw error;
  }
};


// ✅ src/features/product/api/productApi.js

export const getProductDropdowns = async (branchId) => {
  if (!branchId) {
    throw new Error('Branch ID is required to fetch product dropdowns');
  }

  try {
    console.log('🔄 ---------------------------------------- Fetching product dropdowns for branch:', branchId); 
    const res = await apiClient.get(`/products/dropdowns?branchId=${branchId}`);
    return res.data;
  } catch (error) {
    console.error('❌ getProductDropdowns error:', error);
    throw error;
  }
};



  

