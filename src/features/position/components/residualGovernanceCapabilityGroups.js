export const COMMUNICATION_CAPABILITIES = Object.freeze({
  READ: 'communication.read',
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

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ดู บันทึกกิจกรรม และจัดการโปรไฟล์ช่องทางสื่อสารของร้าน',
  options: Object.freeze([
    Object.freeze({ key: COMMUNICATION_CAPABILITIES.READ, label: 'ดูข้อมูลการสื่อสาร', description: 'ดูช่องทางติดต่อลูกค้า การตั้งค่าการติดต่อ และประวัติกิจกรรมการสื่อสาร' }),
    Object.freeze({ key: COMMUNICATION_CAPABILITIES.OPERATE, label: 'บันทึกการสื่อสาร', description: 'เพิ่มช่องทางติดต่อ ปรับการตั้งค่าการติดต่อ และบันทึกกิจกรรมการสื่อสาร' }),
    Object.freeze({ key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE, label: 'จัดการโปรไฟล์การสื่อสาร', description: 'สร้างหรือแก้ไขโปรไฟล์ช่องทางสื่อสารของสาขา' }),
  ]),
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์ดู แก้ไข และเผยแพร่ประสบการณ์หน้าร้านของสาขา',
  options: Object.freeze([
    Object.freeze({ key: STORE_EXPERIENCE_CAPABILITIES.READ, label: 'ดูหน้าร้าน', description: 'ดู draft และสื่อที่ใช้กับหน้าร้าน' }),
    Object.freeze({ key: STORE_EXPERIENCE_CAPABILITIES.MANAGE, label: 'แก้ไขหน้าร้าน', description: 'แก้ไข draft และอัปโหลดสื่อหน้าร้าน' }),
    Object.freeze({ key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH, label: 'เผยแพร่หน้าร้าน', description: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน' }),
  ]),
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์ดูประวัติสินค้ารายหน่วย และข้อมูลทางการเงินที่เกี่ยวข้อง',
  options: Object.freeze([
    Object.freeze({ key: PRODUCT_TRACE_CAPABILITIES.READ, label: 'ดูประวัติสินค้า', description: 'ดูประวัติการรับเข้า เคลื่อนไหว ขาย คืน เคลม และซ่อมของสินค้า' }),
    Object.freeze({ key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS, label: 'ดูข้อมูลการเงินในประวัติสินค้า', description: 'ดูต้นทุน คู่ค้า และรายละเอียดทางการเงินที่ถูกปกปิดจากผู้ใช้ทั่วไป' }),
  ]),
});
