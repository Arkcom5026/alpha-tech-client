/**
 * วางหลักเกณฑ์การตรวจสอบสัญญาการตรวจรับเข้าคลังสินค้า (Goods Receipt Validation Schema)
 */
export const goodsReceiptSchema = {
    validate: (receivedItems) => {
      const errors = {};
  
      if (!receivedItems || receivedItems.length === 0) {
        errors.global = 'กรุณาระบุรายการสินค้าสำหรับรับเข้าคลัง';
      } else {
        receivedItems.forEach((item, index) => {
          // ห้ามจำนวนรับเข้าเป็นค่าว่าง
          if (item.receivedQty === undefined || item.receivedQty === null || isNaN(item.receivedQty)) {
            errors[`items[${index}].receivedQty`] = `รายการที่ ${index + 1}: จำนวนรับจริงห้ามเว้นว่าง`;
          }
          // ห้ามจำนวนตัวเลขติดลบ
          if (item.receivedQty < 0) {
            errors[`items[${index}].receivedQty`] = `รายการที่ ${index + 1}: ตัวเลขยอดรับจริงห้ามติดลบ`;
          }
          // ตรวจสอบกรณี SERIAL: รหัสสแกนต้องเท่ากับยอดรับ 100%
          if (item.productType === 'SERIAL') {
            if (item.serialNumbers.length !== item.receivedQty) {
              errors[`items[${index}].serialNumbers`] = `รายการที่ ${index + 1}: ข้อมูลรหัสเครื่องสแกนบาร์โค้ดไม่ครบตามยอดรับ`;
            }
          }
        });
      }
  
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }
  };