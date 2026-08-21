export const SUPPLIER_ADVANCE_CAPABILITIES = Object.freeze({
  READ: 'procurement.supplier-advance.read',
  MANAGE: 'procurement.supplier-advance.manage',
  CONTROL: 'procurement.supplier-advance.control',
});

export const SUPPLIER_ADVANCE_CAPABILITY_GROUP = Object.freeze({
  key: 'supplier-advance',
  title: 'เงินจ่ายล่วงหน้า Supplier',
  description: 'กำหนดสิทธิ์สำหรับดู จัดการ และควบคุมรายการเงินจ่ายล่วงหน้าของ Supplier แยกจากการชำระ Supplier ปกติ',
  options: Object.freeze([
    Object.freeze({
      key: SUPPLIER_ADVANCE_CAPABILITIES.READ,
      label: 'ดูเงินจ่ายล่วงหน้า Supplier',
      description: 'ดูรายการและยอดคงเหลือของเงินจ่ายล่วงหน้าที่อยู่ในสาขา',
    }),
    Object.freeze({
      key: SUPPLIER_ADVANCE_CAPABILITIES.MANAGE,
      label: 'จัดการเงินจ่ายล่วงหน้า Supplier',
      description: 'สร้างรายการเงินจ่ายล่วงหน้าและนำยอดไปตัดเจ้าหนี้ โดยต้องมีสิทธิ์ดูด้วย',
    }),
    Object.freeze({
      key: SUPPLIER_ADVANCE_CAPABILITIES.CONTROL,
      label: 'ควบคุมเงินจ่ายล่วงหน้า Supplier',
      description: 'ทำรายการควบคุมระดับสูง เช่น รับรองยอดเดิมหรือยกเลิกรายการ โดยต้องมีสิทธิ์ดูและจัดการด้วย',
    }),
  ]),
});
