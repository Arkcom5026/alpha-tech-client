export const COMMUNICATION_CAPABILITIES = Object.freeze({
  USE: 'communication.use',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIAL: 'product.trace.financial',
});

export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
});

export const OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS = Object.freeze([
  Object.freeze({
    key: 'communication',
    title: 'การสื่อสารกับลูกค้า',
    description: 'กำหนดสิทธิ์ใช้งานช่องทางสื่อสารและแยกการจัดการโปรไฟล์การสื่อสารของสาขาออกจากงานทั่วไป',
    options: Object.freeze([
      Object.freeze({
        key: COMMUNICATION_CAPABILITIES.USE,
        label: 'ใช้งานการสื่อสาร',
        description: 'ดูและบันทึกช่องทางติดต่อลูกค้า การตั้งค่าการติดต่อในงานซ่อม และประวัติกิจกรรมการสื่อสาร',
      }),
      Object.freeze({
        key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
        label: 'จัดการโปรไฟล์การสื่อสาร',
        description: 'สร้างหรือแก้ไขโปรไฟล์การสื่อสารส่วนกลางของสาขา โดยแยกจากสิทธิ์ใช้งานการสื่อสารทั่วไป',
      }),
    ]),
  }),
  Object.freeze({
    key: 'product-trace',
    title: 'ประวัติและการติดตามสินค้า',
    description: 'แยกสิทธิ์ดูเส้นทางของสินค้าออกจากข้อมูลทางการเงินและข้อมูลต้นทุนที่มีความละเอียดอ่อน',
    options: Object.freeze([
      Object.freeze({
        key: PRODUCT_TRACE_CAPABILITIES.READ,
        label: 'ดูประวัติสินค้า',
        description: 'ดู timeline การรับเข้า สต๊อก การขาย คืน เคลม และงานซ่อมของสินค้าภายในสาขา',
      }),
      Object.freeze({
        key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL,
        label: 'ดูข้อมูลการเงินในประวัติสินค้า',
        description: 'ดูต้นทุน ผู้จำหน่าย และข้อมูลทางการเงินที่ถูกซ่อนจากผู้ใช้ trace ทั่วไป',
      }),
    ]),
  }),
  Object.freeze({
    key: 'store-experience',
    title: 'หน้าร้านออนไลน์และประสบการณ์ร้าน',
    description: 'แยกการดู แก้ไข และเผยแพร่หน้าร้าน เพื่อให้ตำแหน่งรับผิดชอบแต่ละขั้นตอนได้โดยไม่อิงชื่อ role เดิม',
    options: Object.freeze([
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.READ,
        label: 'ดูการตั้งค่าหน้าร้าน',
        description: 'ดู draft และสื่อที่ใช้กับหน้าร้านของสาขา',
      }),
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
        label: 'แก้ไขหน้าร้านและสื่อ',
        description: 'แก้ไข draft และอัปโหลดสื่อ โดยต้องมีสิทธิ์ดูการตั้งค่าหน้าร้านด้วย',
      }),
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
        label: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน',
        description: 'เปลี่ยนสถานะหน้าร้านที่ลูกค้าเห็น โดยต้องมีสิทธิ์ดูการตั้งค่าหน้าร้านด้วย',
      }),
    ]),
  }),
]);
