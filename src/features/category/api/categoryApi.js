// ✅ src/features/category/api/categoryApi.js
import apiClient from '@/utils/apiClient';

export const getCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res.data;
  } catch (err) {
    console.error('❌ getCategories error:', err);
    throw err;
  }
};

export const getCategoryById = async (id) => {
  try {
    const res = await apiClient.get(`/categories/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getCategoryById error:', err);
    throw err;
  }
};

export const createCategory = async (data) => {
  try {
    const res = await apiClient.post('/categories', data);
    return res.data;
  } catch (err) {
    console.error('❌ createCategory error:', err);
    throw err;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const res = await apiClient.put(`/categories/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateCategory error:', err);
    throw err;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteCategory error:', err);
    throw err;
  }
};
