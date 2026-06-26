// src/features/purchaseOrder/services/procurementService.js
import apiClient from '../../../utils/apiClient'; // 🟢 รวมศูนย์: เปลี่ยนมาดึงท่อหลักพอร์ต 5000 ล้างขยะพอร์ต 4000 ทิ้ง

export const procurementService = {
  /**
   * ดึงรายการเอกสารประวัติจัดซื้อทั้งหมดจากเซิร์ฟเวอร์แกนหลักพอร์ต 5000
   */
  getAllPurchaseOrders: async () => {
    try {
      // 🚀 ทะลวงตรงผ่าน apiClient เส้นหลัก วิ่งเข้าหา Route ปลายทางระบบใหม่ที่สลับไว้บนพอร์ต 5000
      const response = await apiClient.get('/purchase-orders', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ไม่สามารถเชื่อมต่อท่อสัญญาณพอร์ต 5000 เพื่อเรียกข้อมูลประวัติจัดซื้อจริงได้';
      throw new Error(errorMessage);
    }
  },

  /**
   * ส่งคำขออนุมัติสร้างใบสั่งซื้อสินค้าใหม่ไปยังระบบหลังบ้านหลัก
   */
  createPurchaseOrder: async (prismaDTO) => {
    const sanitizedPayload = { ...prismaDTO };
    if (Object.prototype.hasOwnProperty.call(sanitizedPayload, 'branchId')) {
      delete sanitizedPayload.branchId;
    }

    try {
      // 🚀 ยิงสร้างใบ PO ตรงเข้าพอร์ต 5000
      const response = await apiClient.post('/purchase-orders', sanitizedPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ไม่สามารถลำเลียงข้อมูลเอกสารจัดซื้อไปยังเซิร์ฟเวอร์หลักพอร์ต 5000 ได้';
      throw new Error(errorMessage);
    }
  },
};