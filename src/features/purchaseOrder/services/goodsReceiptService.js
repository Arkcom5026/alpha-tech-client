// src/features/purchaseOrder/services/goodsReceiptService.js
import apiClient from '../../../utils/apiClient'; // 🟢 รวมศูนย์: สลัด axios ดิบและพอร์ต 4000 ทิ้ง หันมาเกาะท่อหลัก 5000

export const goodsReceiptService = {
  /**
   * ส่งบันทึกตรวจรับสินค้าลงคลังจริงผ่าน API แกนหลักพอร์ต 5000
   */
  submitGoodsReceipt: async (prismaDTO) => {
    const sanitizedPayload = { ...prismaDTO };
    if (Object.prototype.hasOwnProperty.call(sanitizedPayload, 'branchId')) {
      delete sanitizedPayload.branchId;
    }

    try {
      // 🚀 ล้างบางตัวแปรหลอน ยิงตรงเข้า Endpoint ตรวจรับของฝั่งพอร์ต 5000 หลักอย่างปลอดภัย
      const response = await apiClient.post('/purchase-orders/purchase-order-receipts', sanitizedPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ท่อส่งสัญญาณระบบตรวจรับสินค้าเข้าคลังแกนหลักขัดข้อง';
      throw new Error(errorMessage);
    }
  },
};