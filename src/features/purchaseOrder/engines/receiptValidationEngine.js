/**
 * ตรวจสอบเงื่อนไขข้อบังคับของจำนวนที่รับเข้าเทียบกับจำนวนที่สั่งซื้อในเอกสาร PO
 * @returns {Object} ผลการวิเคราะห์ { isValid: boolean, message: string }
 */
export const validateReceiptQuantities = (item) => {
    if (item.receivedQty < 0) {
      return { isValid: false, message: `สินค้า ${item.name} มีค่าติดลบไม่ได้` };
    }
    if (item.receivedQty > item.orderedQty) {
      return { isValid: false, message: `สินค้า ${item.name} จำนวนรับจริง เกินกว่ายอดที่สั่งใน PO` };
    }
    if (item.productType === 'SERIAL' && item.serialNumbers.length !== item.receivedQty) {
      return { isValid: false, message: `สินค้า ${item.name} มีจำนวนรหัสซีเรียลไม่ตรงกับจำนวนยอดรับจริง` };
    }
    return { isValid: true, message: '' };
  };