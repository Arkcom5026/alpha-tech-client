// ✅ @filename: src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';

export const createProduct = async (data) => {
  try {
    const res = await apiClient.post('/products', data);
    return res.data;
  } catch (err) {
    console.error('❌ createProduct API error:', err);
    throw err;
  }
};

export const getAllProducts = async () => {
  try {
    const res = await apiClient.get('/products');
    return res.data;
  } catch (err) {
    console.error('❌ getAllProducts API error:', err);
    throw err;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getProductById API error:', err);
    throw err;
  }
};

export const updateProduct = async (id, data) => {
  try {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateProduct API error:', err);
    throw err;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteProduct API error:', err);
    throw err;
  }
};


export const getProductDropdowns = async () => {
  try {
    const res = await apiClient.get('/products/dropdowns');
    console.log('✅ API response:', res);
    return res.data; // <- ตรวจว่า res.data มีอะไร
  } catch (err) {
    console.error('❌ getProductDropdowns API error:', err);
    throw err;
  }
};
