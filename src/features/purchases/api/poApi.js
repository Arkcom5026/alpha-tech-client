// ✅ API Utility: PO API (เชื่อมต่อ Backend จริง)
// File: src/features/purchases/api/poApi.js

import axios from 'axios';

export const createPO = async (data) => {
  const response = await axios.post('/api/po', data);
  return response.data;
};

export const getSuppliers = async () => {
  const response = await axios.get('/api/suppliers');
  return response.data;
};

export const getProducts = async () => {
  const response = await axios.get('/api/products');
  return response.data;
};
