
// purchaseOrderApi.js (refined)
// - ใช้ apiClient กลางตามมาตรฐาน (#37, #61)
// - Getters คืน []/null เมื่อผิดพลาด; Mutations โยน error ให้ Store จัดการ
// - รองรับ params: search, status (string | string[]), page, pageSize

import apiClient from '@/utils/apiClient.js';

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────
const buildParams = ({ search, status, page, pageSize } = {}) => {
  const params = {};
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }
  if (status && status !== 'all') {
    // รองรับทั้ง string และ array แล้ว normalize เป็น CSV ตัวพิมพ์ใหญ่
    const list = Array.isArray(status) ? status : String(status).split(',');
    params.status = list
      .map((s) => String(s).trim().toUpperCase())
      .filter(Boolean)
      .join(',');
  }
  if (Number.isFinite(page)) params.page = page;
  if (Number.isFinite(pageSize)) params.pageSize = pageSize;
  return params;
};

// ────────────────────────────────────────────────────────────────────────────────
// Suppliers (minimal needed here)
// ────────────────────────────────────────────────────────────────────────────────
export const getSuppliers = async () => {
  try {
    const res = await apiClient.get('/suppliers');
    return res.data;
  } catch (error) {
    console.error('❌ getSuppliers error:', error);
    return [];
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Purchase Orders
// ────────────────────────────────────────────────────────────────────────────────
export const getPurchaseOrders = async (opts = {}) => {
  try {
    const res = await apiClient.get('/purchase-orders', {
      params: buildParams(opts),
    });
    return res.data;
  } catch (error) {
    console.error('❌ getPurchaseOrders error:', error);
    return [];
  }
};

export const getEligiblePurchaseOrders = async () => {
  try {
    const res = await apiClient.get('/purchase-orders', {
      params: { status: 'PENDING,PARTIALLY_RECEIVED' },
    });
    return res.data;
  } catch (error) {
    console.error('❌ getEligiblePurchaseOrders error:', error);
    return [];
  }
};

export const getPurchaseOrderById = async (id) => {
  try {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ getPurchaseOrderById(${id}) error:`, error);
    return null;
  }
};

export const getPurchaseOrderDetailById = async (id) => {
  // alias ของ getPurchaseOrderById เพื่อความชัดในที่ใช้งาน
  try {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getPurchaseOrderDetailById] error:', error);
    return null;
  }
};

export const createPurchaseOrder = async (data) => {
  try {
    const res = await apiClient.post('/purchase-orders', data);
    return res.data;
  } catch (error) {
    console.error('❌ createPurchaseOrder error:', error);
    throw error;
  }
};

export const createPurchaseOrderWithAdvance = async (data) => {
  try {
    const res = await apiClient.post('/purchase-orders/with-advance', data);
    return res.data;
  } catch (error) {
    console.error('❌ createPurchaseOrderWithAdvance error:', error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id, data) => {
  try {
    const res = await apiClient.put(`/purchase-orders/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ updatePurchaseOrder(${id}) error:`, error);
    throw error;
  }
};

export const updatePurchaseOrderStatus = async ({ id, status }) => {
  try {
    const res = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('❌ updatePurchaseOrderStatus error:', error);
    throw error;
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const res = await apiClient.delete(`/purchase-orders/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ deletePurchaseOrder(${id}) error:`, error);
    throw error;
  }
};

export const getPurchaseOrdersBySupplier = async (supplierId) => {
  try {
    const res = await apiClient.get('/purchase-orders/by-supplier', {
      params: { supplierId },
    });
    return res.data;
  } catch (error) {
    console.error(`❌ getPurchaseOrdersBySupplier(${supplierId}) error:`, error);
    return [];
  }
};


