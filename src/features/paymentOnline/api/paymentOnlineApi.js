// src/features/paymentOnline/api/paymentOnlineApi.js

import apiClient from '@/utils/apiClient';

export const getOrderOnlineById = async (orderId) => {
  try {
    const res = await apiClient.get(`/order-online/customer/${orderId}`);
    return res.data;
  } catch (error) {
    throw new Error(`getOrderOnlineById failed: ${error?.response?.data?.message || error.message}`);
  }
};

export const uploadPaymentSlip = async (orderId, formData) => {
  try {
    const res = await apiClient.post(`/upload-slips/${orderId}/slip/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw new Error(`uploadPaymentSlip failed: ${error?.response?.data?.message || error.message}`);
  }
};

export const submitOrderOnlinePaymentSlip = async (orderId, payload) => {
  try {
    const res = await apiClient.post(`/order-online/${orderId}/payment-slip`, payload);
    return res.data;
  } catch (error) {
    throw new Error(`submitOrderOnlinePaymentSlip failed: ${error?.response?.data?.message || error.message}`);
  }
};

export const approveOrderOnlineSlip = async (orderId) => {
  try {
    const res = await apiClient.post(`/order-online/${orderId}/approve-slip`);
    return res.data;
  } catch (error) {
    throw new Error(`approveOrderOnlineSlip failed: ${error?.response?.data?.message || error.message}`);
  }
};

export const rejectOrderOnlineSlip = async (orderId) => {
  try {
    const res = await apiClient.post(`/order-online/${orderId}/reject-slip`);
    return res.data;
  } catch (error) {
    throw new Error(`rejectOrderOnlineSlip failed: ${error?.response?.data?.message || error.message}`);
  }
};