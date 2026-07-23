import apiClient from '@/utils/apiClient';
import { attachSaleApiContext } from './saleApiSupport';

// Retained only for public compatibility. Customer feature owns new call sites.
export const updateCustomer = async (data) => {
  try {
    const response = await apiClient.patch('/customers/me', data);
    return response.data;
  } catch (error) {
    throw attachSaleApiContext(error, 'saleCustomerCompatibilityApi.updateCustomer');
  }
};
