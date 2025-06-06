// SaleApi ใหม่
// 📁 FILE: features/sales/api/saleApi.js

import apiClient from '@/utils/apiClient';

export const createSaleOrder = async (payload) => {
  try {
    const res = await apiClient.post('/sale-orders', payload);
    return res.data;
  } catch (err) {
    console.error('❌ [createSaleOrder]', err);
    throw err;
  }
};

export const getAllSales = async () => {
  try {
    const res = await apiClient.get('/sale-orders');
    return res.data;
  } catch (err) {
    console.error('❌ [getAllSales]', err);
    throw err;
  }
};

export const getSaleById = async (id) => {
  try {
    const res = await apiClient.get(`/sale-orders/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ [getSaleById]', err);
    throw err;
  }
};

export const returnSale = async (saleOrderId, saleItemId) => {
  try {
    const res = await apiClient.post(`/sale-orders/${saleOrderId}/return`, { saleItemId });
    return res.data;
  } catch (err) {
    console.error('❌ [returnSale]', err);
    throw err;
  }
};