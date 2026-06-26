/**
 * @file liveCalculatorEngine.js
 * @description เอนจินคำนวณราคาจัดซื้อเรียลไทม์และตรวจสอบระดับวงเงินเครดิตคู่ค้า (Pure Functions)
 */

/**
 * คำนวณมูลค่ารวมและยอดรวมหลังหักส่วนลดของรายการสินค้าแต่ละแถว (Line Item Subtotal)
 * @param {Object} item - วัตถุสินค้าในตะกร้าจัดซื้อ
 * @param {number} item.quantity - จำนวนสินค้าที่ระบุในรายการสั่งซื้อ
 * @param {number} item.unitPrice - ราคาซื้อต่อหน่วย
 * @param {number} [item.discountAmount=0] - ส่วนลดคงที่ต่อแถวรายการสินค้า (บาท)
 * @returns {Object} อ็อบเจกต์สินค้าที่มีการคำนวณและแนบค่า subtotal เพิ่มเติม
 */
export const calculateLineItem = (item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const discountAmount = Math.max(0, Number(item.discountAmount) || 0);
  
    const rawTotal = quantity * unitPrice;
    const subtotal = Math.max(0, rawTotal - discountAmount);
  
    return {
      ...item,
      subtotal,
    };
  };
  
  /**
   * คำนวณหาผลสรุปทางการเงินของเอกสารใบสั่งซื้อทั้งหมด (ยอดรวม, ภาษีมูลค่าเพิ่ม 7%, และยอดสุทธิ)
   * @param {Array<Object>} items - รายการสินค้าจัดซื้อในตะกร้า
   * @param {number} [taxRate=0.07] - อัตราภาษีมูลค่าเพิ่มที่ใช้ในระบบ (ค่าเริ่มต้น 7%)
   * @returns {Object} ประกอบด้วยยอด subtotal, tax และ netTotal พร้อมรายการสินค้าที่คำนวณแล้ว
   */
  export const calculatePurchaseTotals = (items, taxRate = 0.07) => {
    const calculatedItems = items.map(calculateLineItem);
    
    const subtotal = calculatedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = subtotal * taxRate;
    const netTotal = subtotal + tax;
  
    return {
      items: calculatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      netTotal: Number(netTotal.toFixed(2)),
    };
  };
  
  /**
   * ตรวจสอบความปลอดภัยเทียบกับวงเงินเครดิตของคู่ค้า
   * @param {number} proposedOrderTotal - ยอดรวมสุทธิของบิลปัจจุบันที่กำลังทำรายการสั่งซื้อ
   * @param {number} creditLimit - วงเงินเครดิตสูงสุดของคู่ค้ารายนี้
   * @param {number} currentOutstandingBalance - ยอดหนี้สะสมหรือยอดค้างชำระเดิมที่มีอยู่กับคู่ค้านี้
   * @returns {boolean} คืนค่าเป็น true หากยอดรวมทั้งหมดอยู่ในเกณฑ์จำกัด, และ false หากเกินขีดจำกัด
   */
  export const isWithinCreditLimit = (proposedOrderTotal, creditLimit, currentOutstandingBalance) => {
    const totalExposure = (Number(currentOutstandingBalance) || 0) + (Number(proposedOrderTotal) || 0);
    return totalExposure <= (Number(creditLimit) || 0);
  };