/**
 * DTO Adapter สำหรับสถานีที่ 1: ขั้นการเปิดบิลใบสั่งซื้อสินค้าใหม่ (Create & Issue PO)
 * ทำหน้าที่แปลงสเตทฝั่ง Client ให้สอดรับกับโครงสร้าง schema.prisma ของฐานข้อมูลหลังบ้าน
 */
export const prismaDataAdapter = {
    /**
     * แปลงข้อมูลสเตท POS ไปเป็นก้อนข้อมูลที่หลังบ้านต้องการ
     * @param {Object} storeState - สถานะของระบบจาก Zustand Store
     * @param {Object} storeState.supplierInfo - ข้อมูลคู่ค้าและเครดิตคงเหลือ
     * @param {Array} storeState.cartItems - รายการสินค้าในตะกร้าจัดซื้อ
     * @param {Object} financials - ตัวเลขทางการเงินที่ผ่านการคำนวณสด
     * @returns {Object} payload ข้อมูลสำหรับส่งบันทึกหลังบ้าน
     */
    transform: (storeState, financials) => {
      const { supplierInfo, cartItems } = storeState;
  
      const mappedItems = cartItems.map((item) => {
        const isSerialProduct = item.productType === 'SERIAL';
  
        // ข้อมูลพื้นฐานของการออกใบสั่งซื้อ
        const basePayload = {
          productId: item.productId,
          orderedQty: item.quantity,
          unitCost: item.unitPrice,
          discount: item.discountAmount || 0,
          productType: item.productType,
        };
  
        if (isSerialProduct) {
          // กรณีสินค้า SERIAL: จัดเตรียม Nested Object สำหรับรอรับรหัสเฉพาะรายชิ้นในขั้นตอนตรวจรับ
          return {
            ...basePayload,
            serialItems: {
              create: (item.serialNumbers || []).map((sn) => ({
                serialNumber: sn,
                status: 'PENDING_RECEIPT', // ตั้งสถานะเริ่มต้นเป็นรอรับเข้าคลัง
              })),
            },
          };
        } else {
          // กรณีสินค้า SIMPLE: เชื่อมโยงเข้ากับตาราง simpleLots บันทึกจำนวนเริ่มต้นและคงเหลือให้เท่ากัน
          return {
            ...basePayload,
            simpleLots: {
              create: {
                initialQty: item.quantity,
                remainingQty: item.quantity,
                costPrice: item.unitPrice,
              },
            },
          };
        }
      });
  
      const outputPayload = {
        supplierId: supplierInfo.id,
        subtotalAmount: financials.subtotal,
        taxAmount: financials.tax,
        totalAmount: financials.netTotal,
        items: mappedItems,
      };
  
      // === ปฏิบัติตามกฎเหล็กความปลอดภัย (Option A) ===
      // ล้างคีย์ branchId ออกจาก Payload เสมอ เพื่อให้หลังบ้านวิเคราะห์จากสิทธิ์ JWT Context
      if (Object.prototype.hasOwnProperty.call(outputPayload, 'branchId')) {
        delete outputPayload.branchId;
      }
  
      return outputPayload;
    },
  };