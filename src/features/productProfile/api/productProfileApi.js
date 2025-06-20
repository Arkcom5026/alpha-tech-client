// ✅ src/features/productProfile/api/productProfileApi.js
import apiClient from '@/utils/apiClient';




// 🔹 CREATE
export const createProductProfile = async (data) => {
  try {
    const res = await apiClient.post('/product-profiles', data);
    
    return res.data;
  } catch (err) {
    console.error('createProductProfile error:', err);
    throw err;
  }
};


// 🔹 READ (get all)
export const getAllProductProfiles = async () => {
  try {
    const res = await apiClient.get('/product-profiles');
    
    return res.data;
  } catch (err) {
    console.error('getAllProductProfiles error:', err);
    throw err;
  }
};


// 🔹 READ (get by id)
export const getProductProfileById = async (id) => {
  try {
    const res = await apiClient.get(`/product-profiles/${id}`);
    return res.data;
  } catch (err) {
    console.error('getProductProfileById error:', err);
    throw err;
  }
};

// 🔹 UPDATE
export const updateProductProfile = async (id, data) => {
  try {
    const res = await apiClient.put(`/product-profiles/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('updateProductProfile error:', err);
    throw err;
  }
};

// 🔹 DELETE
export const deleteProductProfile = async (id) => {
  try {
    const res = await apiClient.delete(`/product-profiles/${id}`);
    return res.data;
  } catch (err) {
    console.error('deleteProductProfile error:', err);
    throw err;
  }
};
