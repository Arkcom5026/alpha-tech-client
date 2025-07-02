// customerDepositApi.js

import apiClient from '@/utils/apiClient';

export const createCustomerDeposit = async (data) => {
  try {
    const res = await apiClient.post('/customer-deposits', data);
    return res.data;
  } catch (error) {
    console.error('createCustomerDeposit error:', error);
    throw error;
  }
};

export const getCustomerDeposits = async (query = {}) => {
  try {
    const res = await apiClient.get('/customer-deposits', { params: query });
    return res.data;
  } catch (error) {
    console.error('getCustomerDeposits error:', error);
    throw error;
  }
};

export const getCustomerDepositById = async (id) => {
  try {
    const res = await apiClient.get(`/customer-deposits/${id}`);
    return res.data;
  } catch (error) {
    console.error('getCustomerDepositById error:', error);
    throw error;
  }
};

export const updateCustomerDeposit = async (id, data) => {
  try {
    const res = await apiClient.put(`/customer-deposits/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('updateCustomerDeposit error:', error);
    throw error;
  }
};

export const deleteCustomerDeposit = async (id) => {
  try {
    const res = await apiClient.delete(`/customer-deposits/${id}`);
    return res.data;
  } catch (error) {
    console.error('deleteCustomerDeposit error:', error);
    throw error;
  }
};

export const getCustomerDepositTotal = async (customerId) => {
  try {
    const res = await apiClient.get(`/customer-deposits/total`, { params: { customerId } });
    return res.data;
  } catch (error) {
    console.error('getCustomerDepositTotal error:', error);
    throw error;
  }
};

export const getCustomerAndDepositByPhone = async (phone) => {
  try {
    const res = await apiClient.get(`/customer-deposits/by-phone/${phone}`);
    console.log('getCustomerAndDepositByPhone res :',res)
    return res.data;
  } catch (error) {
    console.error('getCustomerAndDepositByPhone error:', error);
    throw error;
  }
};

export const applyDepositUsage = async (data) => {
  try {
    const res = await apiClient.post('/customer-deposits/use', data);
    return res.data;
  } catch (error) {
    console.error('applyDepositUsage error:', error);
    throw error;
  }
};
