/**
 * 📜 ARCHITECTURE LAYER: PRISMA DATA GATE (Project-FE-Prisma)
 * ─── เลเยอร์แปลงโครงสร้างวัตถุ (DTO) สะท้อนพิมพ์เขียว schema.prisma หลังบ้าน ───
 */

/**
 * แปลงข้อมูลจาก Line Item ของหน้าจอ POS (UI State) 
 * ให้กลายเป็นอ็อบเจกต์ที่สอดคล้องกับโครงสร้าง Model ของ Prisma ORM ขาออก
 */
export const transformToPrismaItemDto = (uiItem) => {
    // ดึงรหัสประเภทสินค้าเพื่อจำแนกสายพันธุ์ (เช่น 'SERIAL' หรือ 'SIMPLE')
    const productType = uiItem.productType || 'SIMPLE';
  
    // โครงสร้างพื้นฐานที่ทุก Model ใน Prisma ต้องมีร่วมกัน
    const baseDto = {
      productId: uiItem.productId,
      quantity: Number(uiItem.quantity),
      costPrice: Number(uiItem.costPrice),
      totalPrice: Number(uiItem.quantity) * Number(uiItem.costPrice),
      productType: productType
    };
  
    // 🧬 ประยุกต์ใช้กฎแยกสายพันธุ์วัตถุตามระบบจัดการคลังสินค้าจริง
    if (productType === 'SERIAL') {
      return {
        ...baseDto,
        // สินค้ากลุ่มไอที/SERIAL จะต้องเตรียมอาเรย์สำหรับสลัก Serial Numbers ตอนรับเข้าคลัง
        serialItems: uiItem.serialNumbers || [], 
        isSerialRequired: true
      };
    }
  
    // สินค้ากลุ่มทั่วไป/SIMPLE จะผูกเข้ากับโครงสร้าง Lot ข้อมูลปกติ
    return {
      ...baseDto,
      simpleLot: {
        initialQty: Number(uiItem.quantity),
        remainingQty: Number(uiItem.quantity)
      },
      isSerialRequired: false
    };
  };
  
  /**
   * 📦 รวมชุด DTO สำหรับการกดปุ่ม "บันทึก" บิลสั่งซื้อ (Payload Preparation)
   * แปลงสภาพสเตทของหน้าจอทั้งหมดให้กลายเป็นก้อน Payload ขาออกระดับความปลอดภัยสูง
   */
  export const transformToPurchaseOrderPayloadDto = (headerState, uiItemsList) => {
    return {
      supplierId: headerState.supplierId,
      purchaseDate: headerState.purchaseDate || new Date().toISOString(),
      remark: headerState.remark || '',
      // ทำการ Loop แปลงร่างชิ้นส่วนสินค้าทีละแถวผ่านเครื่องจักรจำแนกสายพันธุ์ด้านบน
      items: uiItemsList.map(item => transformToPrismaItemDto(item)),
      // คำนวณสรุปยอดรวมท้ายบิลเพื่อค้ำประกันตัวเลขขั้นสุดท้าย
      summary: {
        totalItems: uiItemsList.length,
        totalQuantity: uiItemsList.reduce((sum, item) => sum + Number(item.quantity), 0),
        netAmount: uiItemsList.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.costPrice)), 0)
      }
    };
  };