import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';
import { getAllSuppliers } from '@/features/supplier/api/supplierApi';
import { makeIdempotencyKey } from '@/features/quickReceive/api/quickReceiveApi';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const pendingCommandKeys = new Map();

const stablePayload = (value) => {
  if (Array.isArray(value)) return value.map(stablePayload);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = stablePayload(value[key]);
      return result;
    }, {});
};

const commandFingerprint = (scope, payload) => `${scope}:${JSON.stringify(stablePayload(payload))}`;
const getCommandKey = (fingerprint, explicitKey) => {
  if (explicitKey) return explicitKey;
  if (!pendingCommandKeys.has(fingerprint)) pendingCommandKeys.set(fingerprint, makeIdempotencyKey());
  return pendingCommandKeys.get(fingerprint);
};
const completeCommand = (fingerprint, explicitKey) => {
  if (!explicitKey) pendingCommandKeys.delete(fingerprint);
};

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

export const completeQuickReceipt = async (payload, commandKey) => {
  const fingerprint = commandFingerprint('complete', payload);
  const key = getCommandKey(fingerprint, commandKey);
  try {
    const response = await apiClient.post(
      'quick-stock/receipts/complete',
      payload,
      { headers: { 'X-Idempotency-Key': key } }
    );
    completeCommand(fingerprint, commandKey);
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

export const finalizeQuickReceipt = async (id, commandKey) => {
  const fingerprint = commandFingerprint('finalize', { id: Number(id) });
  const key = getCommandKey(fingerprint, commandKey);
  try {
    const response = await apiClient.post(
      `quick-stock/receipts/${id}/finalize`,
      {},
      { headers: { 'X-Idempotency-Key': key } }
    );
    completeCommand(fingerprint, commandKey);
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

export const __resetQuickReceiptCommandKeysForTest = () => pendingCommandKeys.clear();
