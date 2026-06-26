// src/features/purchaseOrder/api/purchaseOrderApi.js
// 🏛️ Canonical Port 5000 Router: (Fixed Response Mapping Shape & Safe Live API Influx)
import apiClient from '@/utils/apiClient.js'; 

const buildParams = ({ search, status, page, pageSize } = {}) => {
  const params = {};
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }
  if (status && status !== 'all') {
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
// Purchase Orders (แก้ไขกลไกส่งกลับเพื่อให้สอดรับกับหน้า Dashboard อย่างเป็นเอกภาพ)
// ────────────────────────────────────────────────────────────────────────────────
export const getPurchaseOrders = async (opts = {}) => {
  try {
    const res = await apiClient.get('/purchase-orders', {
      params: buildParams(opts),
    });

    // 🟢 [BUG FIX RESOLVED] คืนค่า res.data กลับไปตรง ๆ ห้ามหั่นย่อย Array เพื่อให้หน้าจอรับไปประมวลผลต่อได้สมบูรณ์
    return res.data;
  } catch (error) {
    console.error('❌ getPurchaseOrders error:', error);
    return { success: false, data: [] };
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
    return { success: false, data: [] };
  }
};

export const getPurchaseOrderById = async (id) => {
  try {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data && res.data.success ? res.data.data : res.data;
  } catch (error) {
    console.error(`❌ getPurchaseOrderById(${id}) error:`, error);
    return null;
  }
};

export const getPurchaseOrderDetailById = async (id) => {
  try {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data && res.data.success ? res.data.data : res.data;
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
  const hasAdvance = Array.isArray(data?.advancePaymentsUsed) && data.advancePaymentsUsed.length > 0;
  const err = new Error(
    hasAdvance
      ? 'Create PO ไม่รองรับ advancePaymentsUsed — ให้ไปผูก/ตัดชำระในขั้นตอนจ่ายเงิน Supplier'
      : 'Endpoint /purchase-orders/with-advance ถูกปิดสำหรับขั้น Create PO — ใช้ createPurchaseOrder แทน'
  );
  err.code = hasAdvance ? 'PO_ADVANCE_NOT_ALLOWED' : 'PO_WITH_ADVANCE_DISABLED';
  throw err;
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
    return { success: false, data: [] };
  }
};