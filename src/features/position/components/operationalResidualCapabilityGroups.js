export const COMMUNICATION_CAPABILITIES = Object.freeze({
  OPERATE: 'communication.operate',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
});

export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIALS: 'product.trace.financials',
});

const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์สำหรับงานสื่อสารกับลูกค้าและการตั้งค่าโปรไฟล์ช่องทางสื่อสารของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.OPERATE,
      label: 'ใช้งานการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อ การตั้งค่าการติดต่อในงานซ่อม และประวัติกิจกรรมการสื่อสาร',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'สร้างหรือแก้ไขโปรไฟล์ช่องทางสื่อสารระดับสาขา โดยต้องมีสิทธิ์ใช้งานการสื่อสารร่วมด้วย',
    }),
  ]),
});

const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์สำหรับดู แก้ไขสื่อและฉบับร่าง รวมถึงเผยแพร่หน้าร้านของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูข้อมูลหน้าร้าน',
      description: 'ดูฉบับร่างและสื่อหน้าร้านของสาขา',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้าน',
      description: 'แก้ไขฉบับร่างและอัปโหลดสื่อหน้าร้าน โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านร่วมด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หน้าร้าน',
      description: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน โดยต้องมีสิทธิ์ดูและแก้ไขหน้าร้านร่วมด้วย',
    }),
  ]),
});

const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์สำหรับดูเส้นทางสินค้า และแยกข้อมูลการเงิน/ต้นทุนออกจากข้อมูลปฏิบัติงานทั่วไป',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูเส้นทางสินค้า สต๊อก การขาย คืนสินค้า เคลม และงานซ่อมภายในสาขา',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูข้อมูลต้นทุน ผู้จำหน่าย และข้อมูลการเงินที่อยู่ในหน้าประวัติสินค้า',
    }),
  ]),
});

export const OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS = Object.freeze([
  COMMUNICATION_CAPABILITY_GROUP,
  STORE_EXPERIENCE_CAPABILITY_GROUP,
  PRODUCT_TRACE_CAPABILITY_GROUP,
]);
