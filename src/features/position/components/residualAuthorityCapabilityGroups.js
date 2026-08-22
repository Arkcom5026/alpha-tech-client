export const COMMUNICATION_CAPABILITIES = Object.freeze({
  READ: 'communication.read',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
});

export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIAL: 'product.trace.financial',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลการสื่อสารและจัดการโปรไฟล์ช่องทางการสื่อสารของร้าน',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.READ,
      label: 'ดูและบันทึกการสื่อสาร',
      description: 'ดูช่องทางติดต่อ ความต้องการการติดต่อ และกิจกรรมการสื่อสารของงานบริการ',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์ช่องทางการสื่อสารระดับร้าน',
    }),
  ]),
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์แก้ไขเนื้อหา สื่อ และการเผยแพร่หน้าร้านออนไลน์',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'จัดการหน้าร้านและสื่อ',
      description: 'ดูและแก้ไขฉบับร่าง รวมถึงจัดการไฟล์สื่อของหน้าร้าน',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หรือยกเลิกการเผยแพร่',
      description: 'เผยแพร่ฉบับร่างหรือยกเลิกการเผยแพร่หน้าร้านที่ใช้งานอยู่',
    }),
  ]),
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์ดูประวัติสินค้ารายชิ้นและข้อมูลการเงินที่มีความละเอียดอ่อน',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูเส้นทางสินค้า การขาย การคืน การเคลม และงานซ่อมตามสิทธิ์ข้อมูล',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูต้นทุน ผู้จำหน่าย และข้อมูลการเงินที่ถูกจำกัดในหน้าประวัติสินค้า',
    }),
  ]),
});
