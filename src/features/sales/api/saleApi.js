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

export const markSaleAsPaid = async (saleId) => {
  try {
    const res = await apiClient.post(`/sale-orders/${saleId}/mark-paid`);
    return res.data;
  } catch (err) {
    console.error('❌ [markSaleAsPaid]', err);
    throw err;
  }
};

export const getSaleReturns = async () => {
  try {
    const res = await apiClient.get('/sale-orders/return');
    return res.data;
  } catch (error) {
    console.error('❌ [getSaleReturns] error:', error);
    throw error;
  }
};

// ✅ New: Update customer profile via token (no :id in URL)
export const updateCustomer = async (data) => {
  try {
    const res = await apiClient.patch('/customers/me', data);
    return res.data;
  } catch (err) {
    console.error('❌ [updateCustomer]', err);
    throw err;
  }
};

// ✅ New: Function to search printable sales with filters
export const searchPrintableSales = async (params) => {
  try {
    const res = await apiClient.get('/sale-orders/printable-sales', { params });
    return res.data;
  } catch (error) {
    console.error('❌ [searchPrintableSales] error:', error);
    throw error;
  }
};
