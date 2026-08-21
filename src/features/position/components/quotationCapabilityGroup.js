export const QUOTATION_CAPABILITIES = Object.freeze({
  READ: 'quotation.read',
  MANAGE: 'quotation.manage',
  ISSUE: 'quotation.issue',
  LIFECYCLE: 'quotation.lifecycle',
});

export const QUOTATION_CAPABILITY_GROUP = Object.freeze({
  key: 'quotation',
  title: 'ใบเสนอราคา',
  description: 'กำหนดสิทธิ์สำหรับดู จัดทำ ออก และควบคุมสถานะใบเสนอราคาของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: QUOTATION_CAPABILITIES.READ,
      label: 'ดูใบเสนอราคา',
      description: 'ดูรายการ รายละเอียด ประวัติ revision lineage และรายการอ้างอิงของใบเสนอราคา',
    }),
    Object.freeze({
      key: QUOTATION_CAPABILITIES.MANAGE,
      label: 'จัดทำใบเสนอราคา',
      description: 'สร้างและแก้ไขฉบับร่าง เพิ่ม/แก้ไข/ลบรายการ และสร้าง revision ใหม่',
    }),
    Object.freeze({
      key: QUOTATION_CAPABILITIES.ISSUE,
      label: 'ออกใบเสนอราคา',
      description: 'ยืนยันฉบับร่างเป็นใบเสนอราคาที่ออกแล้วพร้อม snapshot เอกสาร',
    }),
    Object.freeze({
      key: QUOTATION_CAPABILITIES.LIFECYCLE,
      label: 'ควบคุมสถานะใบเสนอราคา',
      description: 'รับ ยกเลิก ปฏิเสธ หรือยกเลิกใบเสนอราคาตาม lifecycle ที่ระบบอนุญาต',
    }),
  ]),
});
