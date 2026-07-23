import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';

export const createSaleOrder = async (payload) => {
  try {
    const response = await apiClient.post('/sales', payload);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleCreateApi.createSaleOrder');
  }
};
