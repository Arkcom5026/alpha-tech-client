// src/features/customer/api/customerApi.js

import apiClient from '@/utils/apiClient';

export const searchStoreCustomers = async (query) => {
  try {
    const res = await apiClient.get('/customers/search', {
      params: { q: String(query || '').trim() },
    });
    return res.data;
  } catch (error) {
    console.error('❌ [searchStoreCustomers] error:', error);
    throw error;
  }
};

export const listManagedCustomers = async ({ scope = 'STORE', query = '', limit = 100 } = {}) => {
  try {
    const res = await apiClient.get('/customers/management', {
      params: { scope, q: String(query || '').trim(), limit },
    });
    return res.data;
  } catch (error) {
    console.error('❌ [listManagedCustomers] error:', error);
    throw error;
  }
};

export const getManagedCustomerDetail = async (customerProfileId) => {
  try {
    const res = await apiClient.get(`/customers/management/${customerProfileId}`);
    return res.data?.customer || res.data;
  } catch (error) {
    console.error('❌ [getManagedCustomerDetail] error:', error);
    throw error;
  }
};

export const claimUnassignedCustomer = async (customerProfileId) => {
  try {
    const res = await apiClient.post(
      `/customers/management/unassigned/${customerProfileId}/claim`
    );
    return res.data;
  } catch (error) {
    console.error('❌ [claimUnassignedCustomer] error:', error);
    throw error;
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const res = await apiClient.get(`/customers/by-phone/${phone}`);
    return res.data;
  } catch (error) {
    console.error('❌ [getCustomerByPhone] error:', error);
    throw error;
  }
};

export const createCustomer = async (data) => {
  try {
    const res = await apiClient.post('/customers', data);
    return res.data;
  } catch (error) {
    console.error('❌ [createCustomer] error:', error);
    throw error;
  }
};

export const updateCustomerProfileOnline = async (data) => {
  try {
    const res = await apiClient.put('/customers/me', data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomerProfileOnline] error:', error);
    throw error;
  }
};

export const updateCustomerProfilePos = async (id, data) => {
  try {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateCustomerProfilePos] error:', error);
    throw error;
  }
};

export const getMyCustomerProfileOnline = async () => {
  try {
    const res = await apiClient.get('/customers/me');
    return res.data;
  } catch (error) {
    console.error('❌ [getMyCustomerProfileOnline] error:', error);
    throw error;
  }
};

export const getMyCustomerProfilePos = async () => {
  try {
    const res = await apiClient.get('/customers/me');
    return res.data;
  } catch (error) {
    console.error('❌ [getMyCustomerProfilePos] error:', error);
    throw error;
  }
};

export const getCustomerByName = async (keyword) => {
  try {
    const res = await apiClient.get('/customers/by-name', {
      params: { q: keyword },
    });
    return res.data;
  } catch (error) {
    console.error('❌ [getCustomerByName] error:', error);
    throw error;
  }
};
