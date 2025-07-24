import apiClient from '@/utils/apiClient';

export const getOrderOnlineList = async (status = 'ALL') => {
  try {
    const query = status !== 'ALL' ? `?status=${status}` : '';
    const res = await apiClient.get(`/order-online${query}`);
    return res;
  } catch (error) {
    console.error('❌ getOrderOnlineList error:', error);
    throw error;
  }
};

export const getOrderOnlineListByCustomer = async (status = 'ALL') => {
  try {
    const query = status !== 'ALL' ? `?status=${status}` : '';
    const res = await apiClient.get(`/order-online/my${query}`);
    console.log('getOrderOnlineListByCustomer response:', res);
    return res;
  } catch (error) {
    console.error('❌ getOrderOnlineListByCustomer error:', error);
    throw error;
  }
};

export const getOrderOnlineByIdForCustomer = async (id) => {
  try {
    const res = await apiClient.get(`/order-online/customer/${id}`);
    return res;
  } catch (error) {
    console.error('❌ getOrderOnlineByIdForCustomer error:', error);
    throw error;
  }
};

export const getOrderOnlineByIdForEmployee = async (id) => {
  try {
    const res = await apiClient.get(`/order-online/${id}`);
    return res;
  } catch (error) {
    console.error('❌ getOrderOnlineByIdForEmployee error:', error);
    throw error;
  }
};
