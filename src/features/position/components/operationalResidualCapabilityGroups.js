export const COMMUNICATION_CAPABILITIES = Object.freeze({
  ACCESS: 'communication.access',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  FINANCIALS: 'product.trace.financials',
});

export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์งานสื่อสารกับลูกค้าและการตั้งค่าโปรไฟล์ช่องทางสื่อสารของร้าน',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.ACCESS,
      label: 'ใช้งานการสื่อสารกับลูกค้า',
      description: 'ดูและบันทึกช่องทางติดต่อ ความต้องการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับงานบริการ',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสารของร้าน',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์ช่องทางสื่อสารระดับร้าน โดยต้องมีสิทธิ์ใช้งานการสื่อสารด้วย',
    }),
  ]),
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์เปิดเผยข้อมูลการเงินและคู่ค้าที่มีความละเอียดอ่อนในประวัติสินค้า โดยไม่เปลี่ยนสิทธิ์ดูประวัติสินค้าพื้นฐาน',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูข้อมูลทางการเงินและข้อมูลผู้จำหน่ายที่ถูกปกปิดจากผู้ใช้ทั่วไปในประวัติสินค้า',
    }),
  ]),
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์ดู แก้ไขสื่อและแบบร่าง รวมถึงเผยแพร่หรือยกเลิกการเผยแพร่หน้าร้านออนไลน์',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูการตั้งค่าหน้าร้าน',
      description: 'ดูแบบร่างและรายการสื่อของหน้าร้านออนไลน์',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้านและสื่อ',
      description: 'แก้ไขแบบร่างและอัปโหลดสื่อ โดยต้องมีสิทธิ์ดูหน้าร้านด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หน้าร้าน',
      description: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน โดยต้องมีสิทธิ์ดูและแก้ไขด้วย',
    }),
  ]),
});
