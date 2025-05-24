// ✅ src/features/category/api/categoryApi.js
import apiClient from '@/utils/apiClient';

export const getCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res.data;
  } catch (err) {
    console.error('❌ getCategories ล้มเหลว:', err);
    throw err;
  }
};

export const createCategory = async (data) => {
  try {
    const res = await apiClient.post('/categories', data);
    return res.data;
  } catch (err) {
    console.error('❌ createCategory ล้มเหลว:', err);
    throw err;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateCategory ล้มเหลว:', err);
    throw err;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteCategory ล้มเหลว:', err);
    throw err;
  }
};
