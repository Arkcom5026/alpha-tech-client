// saleReturnApi.js
import apiClient from '@/utils/apiClient';

export const createSaleReturn = async (saleId, payload) => {
  try {
    const res = await apiClient.post(`/sale-returns/create`, {
      saleId,
      ...payload,
    });
    return res.data;
  } catch (error) {
    console.error('❌ [createSaleReturn] error:', error);
    throw error;
  }
};

export const getAllSaleReturns = async () => {
  try {
    const res = await apiClient.get(`/sale-returns`);
    return res.data;
  } catch (error) {
    console.error('❌ [getAllSaleReturns] error:', error);
    throw error;
  }
};

export const getSaleReturnById = async (saleReturnId) => {
  try {
    const res = await apiClient.get(`/sale-returns/${saleReturnId}`);
    return res.data;
  } catch (error) {
    console.error('❌ [getSaleReturnById] error:', error);
    throw error;
  }
};