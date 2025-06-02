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

    console.log('📤 ----------------------- getPurchaseOrders  params  :', params);
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
    const res = await apiClient.get('/purchase-orders?status=PENDING,PARTIAL');
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
