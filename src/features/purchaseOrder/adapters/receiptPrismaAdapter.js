/**
 * DTO Adapter สำหรับสถานีที่ 3: ขั้นการตรวจรับสินค้าเข้าคลังจริง (Goods Receipt & Stock Ingest)
 * ทำหน้าที่จัดรูปแบบโครงสร้างข้อมูลตรวจรับให้สอดคล้องกับ schema.prisma ฝั่งคลังสินค้า
 */
export const receiptPrismaAdapter = {
    /**
     * แปลงข้อมูลยอดตรวจรับจริงฝั่งหน้าบ้าน ให้เข้าโครงสร้างตารางหลังบ้าน
     * @param {Array} receivedItems - รายการสินค้าที่ทำรายการรับเข้าสต็อกจริง
     * @param {string|number} purchaseOrderId - รหัสใบสั่งซื้อ PO อ้างอิง
     * @returns {Object} payload สำหรับยิงบันทึกรับของเข้าสต็อก
     */
    transform: (receivedItems, purchaseOrderId) => {
      const mappedItems = receivedItems.map((item) => {
        const isSerialProduct = item.productType === 'SERIAL';
  
        const basePayload = {
          productId: item.productId,
          receivedQty: item.receivedQty,
        };
  
        if (isSerialProduct) {
          // กรณีสินค้า SERIAL: แปลงรหัสเฉพาะ (Serial Numbers) ทั้งหมดให้เข้าตาราง SerialItem พร้อมตั้งค่า AVAILABLE
          return {
            ...basePayload,
            serialItems: {
              create: (item.serialNumbers || []).map((sn) => ({
                serialNumber: sn,
                status: 'AVAILABLE', // ปรับโหมดเป็นพร้อมขายหน้าร้านทันทีที่รับเข้าคลังสำเร็จ
              })),
            },
          };
        } else {
          // กรณีสินค้า SIMPLE: บันทึกข้อมูลและราคาทุนจัดซื้อจริงเข้าตาราง SimpleLot เพื่อตัดงวดสินค้าในคลัง
          return {
            ...basePayload,
            simpleLots: {
              create: [
                {
                  initialQty: item.receivedQty,
                  remainingQty: item.receivedQty,
                  costPrice: item.unitCost, // อ้างอิงราคาทุนจริงตามงวดบิลจัดซื้อ
                },
              ],
            },
          };
        }
      });
  
      const outputPayload = {
        purchaseOrderId: purchaseOrderId,
        receivedAt: new Date().toISOString(),
        items: mappedItems,
      };
  
      // === ปฏิบัติตามกฎเหล็กความปลอดภัย (Option A) ===
      // สกัดการส่ง branchId อย่างเข้มงวด เพื่อให้หลังบ้านแยกแยะพิกัดสาขาจาก Token Header เท่านั้น
      if (Object.prototype.hasOwnProperty.call(outputPayload, 'branchId')) {
        delete outputPayload.branchId;
      }
  
      return outputPayload;
    },
  };