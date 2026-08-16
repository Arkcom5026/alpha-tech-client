import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';
import { runPrintableSalesRequest } from './printableRequestCoordinator';
import { fetchPrintableSalesTransport } from './printableSalesTransport';

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
    return await runPrintableSalesRequest(params, fetchPrintableSalesTransport);
  } catch (error) {
    throw attachSaleApiContext(error, 'saleHistoryApi.searchPrintableSales');
  }
};
