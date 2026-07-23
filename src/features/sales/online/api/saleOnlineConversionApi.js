import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';

export const convertOrderOnlineToSale = async (orderOnlineId, stockSelections) => {
  try {
    const response = await apiClient.post(`/order-online/${orderOnlineId}/convert-to-sale`, {
      stockSelections,
    });
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleOnlineConversionApi.convertOrderOnlineToSale');
  }
};
