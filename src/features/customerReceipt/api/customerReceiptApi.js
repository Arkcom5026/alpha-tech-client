



// src/features/customerReceipt/api/customerReceiptApi.js

import apiClient from '@/utils/apiClient';

const normalizeAxiosError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage ||
    'เกิดข้อผิดพลาดในการเชื่อมต่อ API';

  const normalizedError = new Error(message);
  normalizedError.status = error?.response?.status || 500;
  normalizedError.originalError = error;
  return normalizedError;
};

const buildSearchParams = (filters = {}) => {
  const params = {};

  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.status) params.status = filters.status;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return params;
};

const buildCustomerSearchParams = (search = {}) => {
  const params = {};
  const keyword = String(search.keyword || '').trim();
  const mode = String(search.mode || 'NAME').trim().toUpperCase();

  if (keyword) params.keyword = keyword;
  if (mode) params.mode = mode;

  return params;
};

export const searchCustomerReceipts = async (filters = {}) => {
  try {
    const res = await apiClient.get('/customer-receipts', {
      params: buildSearchParams(filters),
    });
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถค้นหารายการรับชำระได้');
  }
};

export const searchCustomerProfilesForReceipt = async (search = {}) => {
  try {
    const res = await apiClient.get('/customer-receipts/customer-search', {
      params: buildCustomerSearchParams(search),
    });
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถค้นหาข้อมูลลูกค้าได้');
  }
};

export const createCustomerReceipt = async (data) => {
  try {
    const res = await apiClient.post('/customer-receipts', data);
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถสร้างรายการรับชำระได้');
  }
};

export const getCustomerReceiptById = async (receiptId) => {
  try {
    const res = await apiClient.get(`/customer-receipts/${receiptId}`);
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถดึงรายละเอียดใบรับเงินได้');
  }
};

export const getCustomerReceiptAllocationCandidates = async (receiptId, filters = {}) => {
  try {
    const res = await apiClient.get(`/customer-receipts/${receiptId}/allocation-candidates`, {
      params: {
        keyword: filters.keyword,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        limit: filters.limit,
      },
    });

    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถโหลดบิลค้างชำระสำหรับตัดรับเงินได้');
  }
};

export const allocateCustomerReceipt = async (receiptId, data) => {
  try {
    const res = await apiClient.post(`/customer-receipts/${receiptId}/allocate`, data);
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถตัดชำระใบรับเงินได้');
  }
};

export const cancelCustomerReceipt = async (receiptId, data = {}) => {
  try {
    const res = await apiClient.post(`/customer-receipts/${receiptId}/cancel`, data);
    return res.data;
  } catch (error) {
    throw normalizeAxiosError(error, 'ไม่สามารถยกเลิกรายการรับชำระได้');
  }
};
