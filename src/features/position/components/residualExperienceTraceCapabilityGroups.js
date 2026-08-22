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
  READ: 'product.trace.read',
  FINANCIALS: 'product.trace.financials',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ใช้งานช่องทางติดต่อและกิจกรรมการสื่อสาร โดยแยกการตั้งค่าโปรไฟล์ของสาขาออกจากงานปฏิบัติการ',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.ACCESS,
      label: 'ใช้งานการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อ ความต้องการการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับงานของสาขา',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์การสื่อสารระดับสาขา โดยแยกจากการใช้งานสื่อสารทั่วไป',
    }),
  ]),
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านและประสบการณ์ร้านค้า',
  description: 'กำหนดสิทธิ์ดู แก้ไข และเผยแพร่หน้าร้าน โดยแยกการแก้ไขร่างออกจากการเผยแพร่สู่สาธารณะ',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูการตั้งค่าหน้าร้าน',
      description: 'ดูร่างหน้าร้านและสื่อที่ใช้ในหน้าร้านของสาขา',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้านและสื่อ',
      description: 'แก้ไขร่างหน้าร้านและอัปโหลดสื่อ โดยต้องมีสิทธิ์ดูหน้าร้านด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หรือยกเลิกเผยแพร่หน้าร้าน',
      description: 'อนุญาตเปลี่ยนสถานะการเผยแพร่หน้าร้าน โดยต้องมีสิทธิ์ดูและแก้ไขหน้าร้านด้วย',
    }),
  ]),
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติและการติดตามสินค้า',
  description: 'กำหนดสิทธิ์ดู trace ของสินค้าและแยกข้อมูลทางการเงิน/ซัพพลายเออร์ออกจากข้อมูลปฏิบัติการทั่วไป',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูเส้นทางการรับเข้า สต๊อก การขาย คืน เคลม และซ่อมของสินค้าภายในสาขา',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูต้นทุน ข้อมูลซัพพลายเออร์ และรายละเอียดทางการเงินที่ถูกปกปิดจากผู้ใช้ทั่วไป',
    }),
  ]),
});
