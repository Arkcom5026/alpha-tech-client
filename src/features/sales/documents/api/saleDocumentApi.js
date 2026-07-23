import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from '../../shared/api/saleApiSupport';

export const updateSaleDocumentLines = async (saleId, payload) => {
  try {
    const response = await apiClient.put(`/sales/${saleId}/document-lines`, payload);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleDocumentApi.updateSaleDocumentLines');
  }
};

export const updateSaleDocumentDescriptions = updateSaleDocumentLines;
