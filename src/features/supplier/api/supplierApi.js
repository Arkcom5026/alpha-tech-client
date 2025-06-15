
// ✅ supplierApi.js
import apiClient from '@/utils/apiClient';

export const getAllSuppliers = async () => {
  try {
    const response = await apiClient.get('/suppliers');
    return response.data;
  } catch (error) {
    console.error('❌ getAllSuppliers error:', error);
    throw error;
  }
};

export const getSupplierById = async (id) => {
  try {
    console.log('id : ',id)
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ getSupplierById error:', error);
    throw error;
  }
};

export const createSupplier = async (formData) => {
  try {
    const response = await apiClient.post('/suppliers', formData);
    return response.data;
  } catch (error) {
    console.error('❌ createSupplier error:', error);
    throw error;
  }
};

export const updateSupplier = async (id, formData) => {
  try {
    const response = await apiClient.put(`/suppliers/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('❌ updateSupplier error:', error);
    throw error;
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ deleteSupplier error:', error);
    throw error;
  }
};
