// ✅ src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';

export const createProduct = async (payload) => {
  try {
    const res = await apiClient.post('/products', payload);
    return res.data;
  } catch (error) {
    console.error('❌ createProduct error:', error);
    throw error;
  }
};

export const getAllProducts = async (branchId) => {
  try {
    const res = await apiClient.get('/products', {
      params: { branchId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ getAllProducts error:', error);
    throw error;
  }
};

export const getProductById = async (id, branchId) => {
  try {
    const res = await apiClient.get(`/products/${id}`, {
      params: { branchId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ getProductById error:', error);
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
      data: { branchId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ deleteProduct error:', error);
    throw error;
  }
};
