import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';

export const returnSale = async (saleOrderId, saleItemId) => {
  try {
    const response = await apiClient.post(`/sales/${saleOrderId}/return`, { saleItemId });
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.returnSale');
  }
};

export const getSaleReturns = async () => {
  try {
    const response = await apiClient.get('/sales/return');
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleReturnApi.getSaleReturns');
  }
};
