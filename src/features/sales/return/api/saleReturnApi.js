import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';

// Compatibility boundary for the legacy Sales runtime slice.
export const returnSale = async (saleOrderId, saleItemId) => {
  try {
    const response = await apiClient.post(`/sales/${saleOrderId}/return`, { saleItemId });
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.returnSale');
  }
};

export const getReturnableSales = async () => {
  try {
    const response = await apiClient.get('/sales/return');
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.getReturnableSales');
  }
};

// Legacy compatibility alias used by the canonical Sales API facade.
export { getReturnableSales as getSaleReturns };

export const getSaleReturnEligibility = async (saleId) => {
  try {
    const response = await apiClient.get(`/sales/returns/eligible/${saleId}`);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.getSaleReturnEligibility');
  }
};

export const completeSaleReturn = async (command) => {
  try {
    const response = await apiClient.post('/sales/returns/complete', command);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.completeSaleReturn');
  }
};
