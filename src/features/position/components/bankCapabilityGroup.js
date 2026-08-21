export const BANK_CAPABILITIES = Object.freeze({
  READ: 'finance.bank.read',
  MANAGE: 'finance.bank.manage',
  DELETE: 'finance.bank.delete',
});

export const BANK_CAPABILITY_GROUP = Object.freeze({
  key: 'bank',
  title: 'ข้อมูลธนาคาร',
  description: 'กำหนดสิทธิ์สำหรับดู จัดการ และลบข้อมูลธนาคารของสาขา โดยแยกสิทธิ์ลบออกจากงานแก้ไขทั่วไป',
  options: Object.freeze([
    Object.freeze({
      key: BANK_CAPABILITIES.READ,
      label: 'ดูข้อมูลธนาคาร',
      description: 'ดูรายการและรายละเอียดธนาคารของสาขา',
    }),
    Object.freeze({
      key: BANK_CAPABILITIES.MANAGE,
      label: 'จัดการข้อมูลธนาคาร',
      description: 'เพิ่มและแก้ไขข้อมูลธนาคาร โดยต้องมีสิทธิ์ดูด้วย',
    }),
    Object.freeze({
      key: BANK_CAPABILITIES.DELETE,
      label: 'ลบข้อมูลธนาคาร',
      description: 'ลบข้อมูลธนาคารที่ไม่มีรายการอ้างอิง โดยต้องมีสิทธิ์ดูและจัดการด้วย',
    }),
  ]),
});
