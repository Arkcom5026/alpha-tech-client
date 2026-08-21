export const SUPPLIER_PAYABLE_CAPABILITIES = Object.freeze({
  READ: 'procurement.supplier-payable.read',
  MANAGE: 'procurement.supplier-payable.manage',
  CONTROL: 'procurement.supplier-payable.control',
});

export const SUPPLIER_PAYABLE_CAPABILITY_GROUP = Object.freeze({
  key: 'supplier-payable',
  title: 'เจ้าหนี้ Supplier',
  description: 'กำหนดสิทธิ์สำหรับดู จัดการข้อโต้แย้ง/ปรับยอด และควบคุมการย้อนรายการเจ้าหนี้ Supplier',
  options: Object.freeze([
    Object.freeze({
      key: SUPPLIER_PAYABLE_CAPABILITIES.READ,
      label: 'ดูเจ้าหนี้ Supplier',
      description: 'ดูรายการเจ้าหนี้ ผู้สมัครเจ้าหนี้ Aging และข้อโต้แย้งของสาขา',
    }),
    Object.freeze({
      key: SUPPLIER_PAYABLE_CAPABILITIES.MANAGE,
      label: 'จัดการเจ้าหนี้ Supplier',
      description: 'สร้างเจ้าหนี้จากใบรับสินค้า เปิดหรือแก้ไขข้อโต้แย้ง และบันทึกรายการปรับยอด โดยต้องมีสิทธิ์ดูด้วย',
    }),
    Object.freeze({
      key: SUPPLIER_PAYABLE_CAPABILITIES.CONTROL,
      label: 'ควบคุมการย้อนรายการเจ้าหนี้',
      description: 'อนุญาตย้อนรายการปรับยอดเจ้าหนี้ระดับสูง โดยต้องมีสิทธิ์ดูและจัดการด้วย',
    }),
  ]),
});
