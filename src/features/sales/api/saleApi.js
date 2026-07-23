// 📁 FILE: src/features/sales/api/saleApi.js

import apiClient from '@/utils/apiClient';
import { submitSaleCompletion } from '../create/api/saleCompletionApi';

// ✅ Policy: ต้องมี try/catch ครอบทุกจุดเสี่ยง (Production)
// ✅ No console.log/console.error ใน production path
// ✅ catch ต้อง “เพิ่มค่า” บางอย่างเพื่อไม่ให้ eslint มองว่า useless-catch
const attachApiContext = (err, context) => {
  try {
    if (err && typeof err === 'object') {
      if (!err._apiContext) err._apiContext = context;
      if (!err._apiAt) err._apiAt = new Date().toISOString();
    }
  } catch {
    // ignore
  }
  return err;
};

export const createSaleOrder = async (payload) => {
  try {
    const res = await apiClient.post('/sales', payload);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.createSaleOrder');
  }
};

export const getAllSales = async () => {
  try {
    const res = await apiClient.get('/sales');
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getAllSales');
  }
};

export const getSaleById = async (id, options) => {
  try {
    const params = {
      includePayments:
        options?.includePayments === false
          ? 0
          : options?.includePayments === true
            ? 1
            : 1,
      ...(options?.includeBranch ? { includeBranch: 1 } : {}),
      ...(options?.params || {}),
    };

    const res = await apiClient.get(`/sales/${id}`, { params });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getSaleById');
  }
};

export const updateSaleDocumentLines = async (saleId, payload) => {
  try {
    const res = await apiClient.put(`/sales/${saleId}/document-lines`, payload);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.updateSaleDocumentLines');
  }
};

// 🧭 Backward-compatible alias
export const updateSaleDocumentDescriptions = updateSaleDocumentLines;

export const returnSale = async (saleOrderId, saleItemId) => {
  try {
    const res = await apiClient.post(`/sales/${saleOrderId}/return`, { saleItemId });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.returnSale');
  }
};

export const markSaleAsPaid = async (saleId) => {
  try {
    const res = await apiClient.post(`/sales/${saleId}/mark-paid`);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.markSaleAsPaid');
  }
};

export const getSaleReturns = async () => {
  try {
    const res = await apiClient.get('/sales/return');
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getSaleReturns');
  }
};

export const updateCustomer = async (data) => {
  try {
    const res = await apiClient.patch('/customers/me', data);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.updateCustomer');
  }
};

export const searchPrintableSales = async (params) => {
  try {
    const safeParams = {
      ...(params || {}),
      _ts: Date.now(),
    };

    try {
      const res = await apiClient.get('/sales/printable', { params: safeParams });
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        const res2 = await apiClient.get('/sales/printable-sales', { params: safeParams });
        return res2.data;
      }
      throw err;
    }
  } catch (err) {
    throw attachApiContext(err, 'saleApi.searchPrintableSales');
  }
};

export const convertOrderOnlineToSale = async (orderOnlineId, stockSelections) => {
  try {
    const res = await apiClient.post(`/order-online/${orderOnlineId}/convert-to-sale`, {
      stockSelections,
    });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.convertOrderOnlineToSale');
  }
};

export const completeSaleOrder = async (command) => {
  return submitSaleCompletion(command);
};
