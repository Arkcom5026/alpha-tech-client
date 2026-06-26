// src/features/purchaseOrder/schema/purchaseOrdersSchema.js

/**
 * 📜 ARCHITECTURE LAYER: API INTERFACE (Project-FE-API)
 * ─── กฎเหล็ก Validation Contract ป้องกัน Human Error ก่อนส่งออกจากเครื่อง ───
 */

export const purchaseOrderSchema = {
  /**
   * ตรวจสอบความถูกต้องของสัญญาสั่งซื้อ (ดักจับปุ่มบันทึกหน้าสร้างบิลใหม่)
   * @param {Object} data - ข้อมูลสเตทในตะกร้าและข้อมูลคู่ค้าของพาร์ตเนอร์ปัจจุบัน
   */
  validate: (data) => {
    const errors = {};

    // 1. ตรวจสอบข้อมูลรหัสระบุตัวตนพาร์ตเนอร์ (Tenant ID)
    if (!data.branchId) {
      errors.branch = 'ระบบยังโหลดข้อมูลสาขาพาร์ตเนอร์ไม่สำเร็จ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
    }

    // 2. ตรวจสอบข้อมูลผู้ส่งมอบ/คู่ค้า
    if (!data.supplierId) {
      errors.supplier = 'กรุณาเลือกข้อมูลคู่ค้า (Supplier) ในระบบก่อนดำเนินการ';
    }

    // 3. ตรวจสอบสภาพตะกร้าสินค้าท้ายบิล
    if (!data.products || data.products.length === 0) {
      errors.cart = 'ไม่สามารถออกใบสั่งซื้อได้ เนื่องจากยังไม่มีสินค้าอยู่ในรายการ';
    } else {
      // 4. สแกนตรวจสอบความสะอาดของข้อมูลรายบรรทัด (Line Items)
      data.products.forEach((item, index) => {
        const rowNum = index + 1;
        
        if (!item.id) {
          errors[`items[${index}].id`] = `รายการที่ ${rowNum}: ไม่พบรหัสระบุตัวตนสินค้า (Product ID)`;
        }
        
        // ตรวจสอบจำนวนสินค้า ต้องกรอกเป็นตัวเลขจำนวนเต็มบวกที่มากกว่า 0 เสมอ
        const qty = Number(item.quantity);
        if (Number.isNaN(qty) || qty <= 0) {
          errors[`items[${index}].quantity`] = `รายการที่ ${rowNum}: จำนวนสินค้าต้องเป็นตัวเลขจำนวนเต็มบวกที่มากกว่าศูนย์`;
        }
        
        // ตรวจสอบราคาต้นทุนจัดซื้อ ห้ามใส่ค่าติดลบ หรือค่าเป็นศูนย์เด็ดขาดตามนโยบายคลังใหม่
        const cost = Number(item.costPrice);
        if (Number.isNaN(cost) || cost <= 0) {
          errors[`items[${index}].costPrice`] = `รายการที่ ${rowNum}: ราคาต้นทุนจัดซื้อต้องเป็นตัวเลขจำนวนบวกและห้ามเป็นศูนย์เด็ดขาด`;
        }
      });
    }

    // ทำตามแผนผังเดิม คืนค่าสถานะตรวจสอบกลับไปให้ Hook คอนโทรลเลอร์ควบคุม
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};