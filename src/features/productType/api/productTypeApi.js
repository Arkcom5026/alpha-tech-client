import apiClient from '@/utils/apiClient';


export const getAllProductTypes = async () => {
  try {
    const res = await apiClient.get('/product-types');
    console.log('getAllProductTypes : ',res)
    return res.data;
  } catch (error) {
    console.error('❌ getAllProductTypes error:', error);
    throw error;
  }
};

export const createProductType = async (data) => {
  try {
    const res = await apiClient.post('/product-types', data);
    return res.data;
  } catch (err) {
    console.error('❌ createProductType ล้มเหลว:', err);
    throw err;
  }
};

export const updateProductType = async (id, data) => {
  try {
    const res = await apiClient.patch(`/product-types/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateProductType ล้มเหลว:', err);
    throw err;
  }
};

export const deleteProductType = async (id) => {
  try {
    const res = await apiClient.delete(`/product-types/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteProductType ล้มเหลว:', err);
    throw err;
  }
};

export const getProductTypes = async () => {
  try {
    const res = await apiClient.get('/product-types');
    return res.data;
  } catch (err) {
    console.error('❌ getProductTypes ล้มเหลว:', err);
    throw err;
  }
};

export const getProductTypeById = async (id) => {
  try {
    const res = await apiClient.get(`/product-types/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getProductTypeById ล้มเหลว:', err);
    throw err;
  }
};

export const getProductTypeDropdowns = async () => {
  try {
    const res = await apiClient.get('/product-types/dropdowns');
    return res.data; // expected format: [{ id: 1, name: 'Notebook' }, ...]
  } catch (err) {
    console.error('❌ getProductTypeDropdowns ล้มเหลว:', err);
    return [];
  }
};
