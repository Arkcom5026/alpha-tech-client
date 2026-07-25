// src/features/purchaseOrder/schema/purchaseOrderSchema.js

export const purchaseOrderSchema = {
  validate: ({ branchId, supplierId, products, mode = 'create' }) => {
    const errors = {};

    if (!branchId) {
      errors.branch = 'ระบบยังโหลดข้อมูลสาขาไม่สำเร็จ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง';
    }

    if (mode === 'create' && !supplierId) {
      errors.supplier = 'กรุณาเลือกคู่ค้า (Supplier) ก่อนสร้างใบสั่งซื้อ';
    }

    if (!Array.isArray(products) || products.length === 0) {
      errors.items = 'ต้องมีรายการสินค้าอย่างน้อย 1 รายการ';
    } else {
      products.forEach((item, index) => {
        const rowNumber = index + 1;
        const productId = Number(item?.productId ?? item?.id);
        const quantity = Number(item?.quantity);
        const costPrice = Number(item?.costPrice);

        if (!Number.isInteger(productId) || productId <= 0) {
          errors[`items[${index}].productId`] = `รายการที่ ${rowNumber}: ไม่พบรหัสสินค้า`;
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          errors[`items[${index}].quantity`] = `รายการที่ ${rowNumber}: จำนวนต้องเป็นจำนวนเต็มมากกว่าศูนย์`;
        }

        if (!Number.isFinite(costPrice) || costPrice < 0) {
          errors[`items[${index}].costPrice`] = `รายการที่ ${rowNumber}: ราคาทุนต้องเป็นตัวเลขตั้งแต่ศูนย์ขึ้นไป`;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
