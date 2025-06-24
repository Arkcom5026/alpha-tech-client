// ✅ src/features/productTemplate/api/productTemplateApi.js
import apiClient from '@/utils/apiClient';

export const getAllProductTemplates = async () => {
  try {
    const res = await apiClient.get('/product-templates');
    return res.data;
  } catch (error) {
    console.error('❌ getAllProductTemplates error:', error);
    throw error;
  }
};

export const getProductTemplateById = async (id) => {
  try {
    const res = await apiClient.get(`/product-templates/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ getProductTemplateById error:', error);
    throw error;
  }
};

export const createProductTemplate = async (payload) => {
  try {
    const res = await apiClient.post('/product-templates', payload);
    return res.data;
  } catch (error) {
    console.error('❌ createProductTemplate error:', error);
    throw error;
  }
};

export const updateProductTemplate = async (id, payload) => {
  try {
    const res = await apiClient.put(`/product-templates/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error('❌ updateProductTemplate error:', error);
    throw error;
  }
};

export const deleteProductTemplate = async (id) => {
  try {
    const res = await apiClient.delete(`/product-templates/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ deleteProductTemplate error:', error);
    throw error;
  }
};
