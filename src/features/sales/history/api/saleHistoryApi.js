import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';
import { runPrintableSalesRequest } from './printableRequestCoordinator';

export const getAllSales = async () => {
  try {
    const response = await apiClient.get('/sales');
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleHistoryApi.getAllSales');
  }
};

export const getSaleById = async (id, options) => {
  try {
    const params = {
      includePayments: options?.includePayments === false ? 0 : 1,
      ...(options?.includeBranch ? { includeBranch: 1 } : {}),
      ...(options?.params || {}),
    };
    const response = await apiClient.get(`/sales/${id}`, { params });
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleHistoryApi.getSaleById');
  }
};

export const markSaleAsPaid = async (saleId) => {
  try {
    const response = await apiClient.post(`/sales/${saleId}/mark-paid`);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleHistoryApi.markSaleAsPaid');
  }
};

export const searchPrintableSales = async (params) => {
  try {
    return await runPrintableSalesRequest(params, async (safeParams) => {
      try {
        const response = await apiClient.get('/sales/printable', { params: safeParams });
        return response.data;
      } catch (error) {
        if (error?.response?.status !== 404) throw error;
        const response = await apiClient.get('/sales/printable-sales', { params: safeParams });
        return response.data;
      }
    });
  } catch (error) {
    throw attachSaleApiContext(error, 'saleHistoryApi.searchPrintableSales');
  }
};
