import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';
import { getAllSuppliers } from '@/features/supplier/api/supplierApi';
import { makeIdempotencyKey } from '@/features/quickReceive/api/quickReceiveApi';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const loadQuickReceiptSuppliers = async () => {
  try {
    const raw = await getAllSuppliers({});
    const data = raw?.data ?? raw;
    return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  } catch (error) {
    throw parseApiError(error);
  }
};

export const listQuickReceiptDrafts = async (filters = {}) => {
  try {
    const response = await apiClient.get('quick-stock/receipts', { params: filters });
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getQuickReceipt = async (id) => {
  try {
    const response = await apiClient.get(`quick-stock/receipts/${id}`);
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const createQuickReceiptDraft = async (payload) => {
  try {
    const response = await apiClient.post('quick-stock/receipts', payload);
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const completeQuickReceipt = async (payload) => {
  try {
    const response = await apiClient.post(
      'quick-stock/receipts/complete',
      payload,
      { headers: { 'X-Idempotency-Key': makeIdempotencyKey() } }
    );
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const updateQuickReceiptDraft = async (id, payload) => {
  try {
    const response = await apiClient.patch(`quick-stock/receipts/${id}`, payload);
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const addQuickReceiptItem = async (id, payload) => {
  try {
    const response = await apiClient.post(`quick-stock/receipts/${id}/items`, payload);
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const deleteQuickReceiptItem = async (id, itemId) => {
  try {
    const response = await apiClient.delete(`quick-stock/receipts/${id}/items/${itemId}`);
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const finalizeQuickReceipt = async (id) => {
  try {
    const response = await apiClient.post(
      `quick-stock/receipts/${id}/finalize`,
      {},
      { headers: { 'X-Idempotency-Key': makeIdempotencyKey() } }
    );
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const cancelQuickReceipt = async (id, reason) => {
  try {
    const response = await apiClient.post(`quick-stock/receipts/${id}/cancel`, { reason });
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};
