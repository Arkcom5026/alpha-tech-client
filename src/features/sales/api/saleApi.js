









// 📁 FILE: features/sales/api/saleApi.js

import apiClient from '@/utils/apiClient';

// ✅ Policy: ต้องมี try/catch ครอบทุกจุดเสี่ยง (Production)
// ✅ No console.log/console.error ใน production path
// ✅ catch ต้อง “เพิ่มค่า” บางอย่างเพื่อไม่ให้ eslint มองว่า useless-catch
const attachApiContext = (err, context) => {
  try {
    if (err && typeof err === 'object') {
      // ไม่ทับของเดิม ถ้ามีอยู่แล้ว
      if (!err._apiContext) err._apiContext = context;
      if (!err._apiAt) err._apiAt = new Date().toISOString();
    }
  } catch (_) {
    // ignore
  }
  return err;
};

export const createSaleOrder = async (payload) => {
  try {
    const res = await apiClient.post('/sale-orders', payload);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.createSaleOrder');
  }
};

export const getAllSales = async () => {
  try {
    const res = await apiClient.get('/sale-orders');
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getAllSales');
  }
};

// ✅ getSaleById (print-safe)
// - รองรับ options เพื่อส่ง query params เพิ่มเติม
// - ใส่ includePayments=1 เป็นค่าเริ่มต้นแบบ defensive (ถ้า BE ไม่รองรับจะถูก ignore)
export const getSaleById = async (id, options) => {
  try {
    const params = {
      includePayments: 1,
      ...(options?.params || {}),
    };

    const res = await apiClient.get(`/sale-orders/${id}`, { params });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getSaleById');
  }
};

export const returnSale = async (saleOrderId, saleItemId) => {
  try {
    const res = await apiClient.post(`/sale-orders/${saleOrderId}/return`, { saleItemId });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.returnSale');
  }
};

export const markSaleAsPaid = async (saleId) => {
  try {
    const res = await apiClient.post(`/sale-orders/${saleId}/mark-paid`);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.markSaleAsPaid');
  }
};

export const getSaleReturns = async () => {
  try {
    const res = await apiClient.get('/sale-orders/return');
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.getSaleReturns');
  }
};

// ✅ Update customer profile via token (no :id in URL)
export const updateCustomer = async (data) => {
  try {
    const res = await apiClient.patch('/customers/me', data);
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.updateCustomer');
  }
};

// ✅ Search printable sales with filters
export const searchPrintableSales = async (params) => {
  try {
    const res = await apiClient.get('/sale-orders/printable-sales', { params });
    return res.data;
  } catch (err) {
    throw attachApiContext(err, 'saleApi.searchPrintableSales');
  }
};

// ✅ Convert OrderOnline to Sale
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








