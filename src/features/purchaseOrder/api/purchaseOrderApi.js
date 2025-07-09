// purchaseOrderApi.js
import apiClient from '@/utils/apiClient';

// ✅ ดึง Supplier ทั้งหมด
export const getSuppliers = async () => {
  try {
    const res = await apiClient.get('/suppliers');
    return res.data;
  } catch (error) {
    console.error('❌ getSuppliers error:', error);
    return [];
  }
};

// ✅ ดึง PO ทั้งหมด (ใช้ใน ListPage)
export const getPurchaseOrders = async ({ search, status } = {}) => {
  try {
    const params = {};

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    if (status && status !== 'all') {
      params.status = status;
    }

    const res = await apiClient.get('/purchase-orders', { params });
    return res.data;
  } catch (error) {
    console.error('❌ getPurchaseOrders error:', error);
    return [];
  }
};

// ✅ ดึง PO ที่ยังตรวจรับไม่ครบ (ใช้ในหน้า “ตรวจรับสินค้า”)
export const getEligiblePurchaseOrders = async () => {
  try {
    const res = await apiClient.get('/purchase-orders?status=PENDING,PARTIALLY_RECEIVED');
    return res.data;
  } catch (error) {
    console.error('❌ getEligiblePurchaseOrders error:', error);
    return [];
  }
};

// ✅ ดึง PO ตาม ID (ใช้ในหน้าแก้ไข/รายละเอียด)
export const getPurchaseOrderById = async (id) => {
  try {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ getPurchaseOrderById(${id}) error:`, error);
    return null;
  }
};

// ✅ สร้าง PO ใหม่
export const createPurchaseOrder = async (data) => {
  try {
    const res = await apiClient.post('/purchase-orders', data);
    return res.data;
  } catch (error) {
    console.error('❌ createPurchaseOrder error:', error);
    throw error;
  }
};

// ✅ สร้าง PO ใหม่
export const createPurchaseOrderWithAdvance = async (data) => {
  try {
    const res = await apiClient.post('/purchase-orders/with-advance', data);
    return res.data;
  } catch (error) {
    console.error('❌ createPurchaseOrderWithAdvance error:', error);
    throw error;
  }
};

// ✅ แก้ไข PO
export const updatePurchaseOrder = async (id, data) => {
  try {
    const res = await apiClient.put(`/purchase-orders/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ updatePurchaseOrder(${id}) error:`, error);
    throw error;
  }
};

// ✅ GET รายละเอียด PO แบบเต็ม (พร้อม supplier + รายการสินค้า + receiptItem)
export const getPurchaseOrderDetailById = async (poId) => {
  try {
    const res = await apiClient.get(`/purchase-orders/${poId}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getPurchaseOrderDetailById] error:', error);
    throw error;
  }
};

// ✅ ลบ PO
export const deletePurchaseOrder = async (id) => {
  try {
    const res = await apiClient.delete(`/purchase-orders/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ deletePurchaseOrder(${id}) error:`, error);
    throw error;
  }
};

// ✅ เปลี่ยนสถานะ PO
export const updatePurchaseOrderStatus = async ({ id, status }) => {
  try {
    console.log('✅ updatePurchaseOrderStatus:', { id, status });
    const res = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error(`❌ updatePurchaseOrderStatus error:`, error);
    throw error;
  }
};

// ✅ ดึง PO ตาม supplierId (ใช้ใน SupplierPaymentTabs)
export const getPurchaseOrdersBySupplier = async (supplierId) => {
  try {
    const res = await apiClient.get(`/purchase-orders/by-supplier`, {
      params: { supplierId },
    });
    return res.data;
  } catch (error) {
    console.error(`❌ getPurchaseOrdersBySupplier(${supplierId}) error:`, error);
    return [];
  }
};
