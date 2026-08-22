export const COMMUNICATION_CAPABILITIES = Object.freeze({
  ACCESS: 'communication.access',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
});

export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  FINANCIAL: 'product.trace.financial',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ใช้งานช่องทางสื่อสารและการตั้งค่าโปรไฟล์การสื่อสารของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.ACCESS,
      label: 'ใช้งานข้อมูลการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อ ความต้องการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับงานบริการ',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'สร้างหรือแก้ไขการตั้งค่าโปรไฟล์การสื่อสารระดับสาขา',
    }),
  ]),
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์และประสบการณ์ร้าน',
  description: 'แยกสิทธิ์ดู แก้ไข และเผยแพร่หน้าร้านออกจากกันตามหน้าที่ของตำแหน่ง',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูข้อมูลหน้าร้าน',
      description: 'ดูร่างหน้าร้านและไฟล์สื่อที่อยู่ภายใต้สาขาปัจจุบัน',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้านและสื่อ',
      description: 'แก้ไขร่างหน้าร้านและอัปโหลดไฟล์สื่อ โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หรือยกเลิกเผยแพร่หน้าร้าน',
      description: 'เปลี่ยนสถานะหน้าร้านสู่สาธารณะหรือยกเลิกการเผยแพร่ โดยต้องมีสิทธิ์ดูและแก้ไขด้วย',
    }),
  ]),
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้าและข้อมูลต้นทุน',
  description: 'การดูประวัติสินค้าทั่วไปยังคงตามสิทธิ์เดิม ส่วนข้อมูลการเงินและคู่ค้าถูกแยกเป็นสิทธิ์เฉพาะ',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL,
      label: 'ดูข้อมูลการเงินและคู่ค้าในประวัติสินค้า',
      description: 'แสดงต้นทุน มูลค่าทางการเงิน และข้อมูลผู้จำหน่ายใน Product Trace',
    }),
  ]),
});
