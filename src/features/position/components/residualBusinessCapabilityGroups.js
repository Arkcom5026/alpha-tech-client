export const RESIDUAL_BUSINESS_CAPABILITIES = Object.freeze({
  COMMUNICATION_ACCESS: 'communication.access',
  COMMUNICATION_PROFILE_MANAGE: 'communication.profile.manage',
  PRODUCT_TRACE_READ: 'product.trace.read',
  PRODUCT_TRACE_FINANCIAL: 'product.trace.financial',
  STORE_EXPERIENCE_READ: 'store-experience.read',
  STORE_EXPERIENCE_MANAGE: 'store-experience.manage',
  STORE_EXPERIENCE_PUBLISH: 'store-experience.publish',
});

export const RESIDUAL_BUSINESS_CAPABILITY_GROUPS = Object.freeze([
  Object.freeze({
    key: 'communication',
    title: 'การสื่อสารกับลูกค้า',
    description: 'กำหนดสิทธิ์เข้าถึงข้อมูลการสื่อสารและแยกสิทธิ์จัดการโปรไฟล์ช่องทางของร้าน',
    options: Object.freeze([
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.COMMUNICATION_ACCESS, label: 'ใช้งานข้อมูลการสื่อสาร', description: 'ดูและบันทึกช่องทางลูกค้า ความต้องการติดต่อ และกิจกรรมการสื่อสารในงานบริการ' }),
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.COMMUNICATION_PROFILE_MANAGE, label: 'จัดการโปรไฟล์การสื่อสารของร้าน', description: 'สร้างหรือแก้ไขโปรไฟล์ช่องทางการสื่อสารที่ใช้ร่วมกันภายในสาขา' }),
    ]),
  }),
  Object.freeze({
    key: 'product-trace',
    title: 'ประวัติและการติดตามสินค้า',
    description: 'แยกสิทธิ์ดู trace ของสินค้าออกจากข้อมูลการเงินและข้อมูลผู้ขายที่มีความละเอียดอ่อน',
    options: Object.freeze([
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.PRODUCT_TRACE_READ, label: 'ดูประวัติสินค้า', description: 'ดู timeline การรับเข้า สต๊อก การขาย การคืน เคลม และงานซ่อมของสินค้าที่อยู่ในสาขา' }),
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.PRODUCT_TRACE_FINANCIAL, label: 'ดูข้อมูลการเงินในประวัติสินค้า', description: 'ดูต้นทุน ผู้ขาย และรายละเอียดทางการเงินที่ถูกปกปิดจาก trace ปกติ' }),
    ]),
  }),
  Object.freeze({
    key: 'store-experience',
    title: 'หน้าร้านออนไลน์',
    description: 'แยกสิทธิ์ดู แก้ไข และเผยแพร่หน้าร้านออนไลน์ของสาขาออกจากกัน',
    options: Object.freeze([
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_READ, label: 'ดูการตั้งค่าหน้าร้าน', description: 'ดู draft และรายการสื่อของหน้าร้านออนไลน์ในสาขา' }),
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_MANAGE, label: 'แก้ไขหน้าร้าน', description: 'แก้ไข draft และอัปโหลดสื่อ โดยต้องมีสิทธิ์ดูการตั้งค่าหน้าร้านด้วย' }),
      Object.freeze({ key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_PUBLISH, label: 'เผยแพร่หรือยกเลิกเผยแพร่หน้าร้าน', description: 'เปลี่ยนสถานะ storefront ที่เผยแพร่ โดยต้องมีสิทธิ์ดูการตั้งค่าหน้าร้านด้วย' }),
    ]),
  }),
]);
