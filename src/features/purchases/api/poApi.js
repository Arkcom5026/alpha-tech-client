// ✅ API Utility: PO API (เชื่อมต่อ Backend จริง)
// File: src/features/purchases/api/poApi.js

import apiClient from '@/utils/apiClient';

export const createPO = async (data) => {
  const response = await apiClient.post('/api/po', data);
  return response.data;
};

export const getSuppliers = async () => {
  const response = await apiClient.get('/api/suppliers');
  return response.data;
};

export const getProducts = async () => {
  const response = await apiClient.get('/api/products');
  return response.data;
};
