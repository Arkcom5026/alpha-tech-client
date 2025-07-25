// ===== api/orderOnlinePosApi.js =====

import apiClient from '@/utils/apiClient';

export const getOrderOnlinePosList = async () => {
  try {
    const response = await apiClient.get('/order-online/branch');
    return response.data;
  } catch (error) {
    console.error('📦 getOrderOnlinePosList error:', error);
    throw error;
  }
};

export const getOrderOnlinePosById = async (id) => {
  try {
    const response = await apiClient.get(`/order-online/${id}`, {
      params: {
        includeDetails: true,
      },
    });
    console.log('📦 getOrderOnlinePosById response:', response);
    return response.data;
  } catch (error) {
    console.error(`📦 getOrderOnlinePosById (${id}) error:`, error);
    throw error;
  }
};

export const updateOrderOnlinePosStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/order-online/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(`📦 updateOrderOnlinePosStatus (${id}) error:`, error);
    throw error;
  }
};

export const approveOrderOnlineSlip = async (id) => {
  try {
    const response = await apiClient.post(`/order-online/${id}/approve-slip`);
    return response.data;
  } catch (error) {
    console.error(`📦 approveOrderOnlineSlip (${id}) error:`, error);
    throw error;
  }
};

export const rejectOrderOnlineSlip = async (id) => {
  try {
    const response = await apiClient.post(`/order-online/${id}/reject-slip`);
    return response.data;
  } catch (error) {
    console.error(`📦 rejectOrderOnlineSlip (${id}) error:`, error);
    throw error;
  }
};

export const deleteOrderOnline = async (id) => {
  try {
    const response = await apiClient.delete(`/order-online/${id}`);
    return response.data;
  } catch (error) {
    console.error(`📦 deleteOrderOnline (${id}) error:`, error);
    throw error;
  }
};

export const getOrderOnlineSummary = async (id) => {
  try {
    const response = await apiClient.get(`/order-online/${id}/summary`);
    console.log('📦 getOrderOnlineSummary response:', response);
    return response.data;
  } catch (error) {
    console.error(`📦 getOrderOnlineSummary (${id}) error:`, error);
    throw error;
  }
};
