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
  FINANCIAL: 'product.trace.financial',
});

export const OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS = Object.freeze([
  Object.freeze({
    key: 'communication',
    title: 'การสื่อสารกับลูกค้า',
    description: 'กำหนดสิทธิ์ใช้งานช่องทางสื่อสาร ประวัติการติดต่อ และการตั้งค่าโปรไฟล์การสื่อสารของสาขา',
    options: Object.freeze([
      Object.freeze({
        key: COMMUNICATION_CAPABILITIES.ACCESS,
        label: 'ใช้งานการสื่อสาร',
        description: 'ดูและบันทึกช่องทางติดต่อ ความต้องการการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับงาน',
      }),
      Object.freeze({
        key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
        label: 'จัดการโปรไฟล์การสื่อสาร',
        description: 'สร้างหรือแก้ไขโปรไฟล์การสื่อสารของสาขา',
      }),
    ]),
  }),
  Object.freeze({
    key: 'store-experience',
    title: 'หน้าร้านและประสบการณ์ร้านค้า',
    description: 'กำหนดสิทธิ์ดู แก้ไข และเผยแพร่เนื้อหาหน้าร้าน รวมถึงสื่อประกอบของสาขา',
    options: Object.freeze([
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.READ,
        label: 'ดูการตั้งค่าหน้าร้าน',
        description: 'ดู draft และรายการสื่อของหน้าร้าน',
      }),
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
        label: 'แก้ไขหน้าร้าน',
        description: 'แก้ไข draft และอัปโหลดสื่อของหน้าร้าน',
      }),
      Object.freeze({
        key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
        label: 'เผยแพร่หน้าร้าน',
        description: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน',
      }),
    ]),
  }),
  Object.freeze({
    key: 'product-trace',
    title: 'ประวัติและการติดตามสินค้า',
    description: 'กำหนดสิทธิ์ดูเส้นทางสินค้าและข้อมูลทางการเงินที่อ่อนไหวในประวัติสินค้า',
    options: Object.freeze([
      Object.freeze({
        key: PRODUCT_TRACE_CAPABILITIES.READ,
        label: 'ดูประวัติสินค้า',
        description: 'ดูข้อมูล trace ของสินค้าภายในขอบเขตสาขาที่ได้รับอนุญาต',
      }),
      Object.freeze({
        key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL,
        label: 'ดูข้อมูลการเงินในประวัติสินค้า',
        description: 'ดูข้อมูลต้นทุน ผู้ขาย และข้อมูลทางการเงินที่ซ่อนจากผู้ใช้ทั่วไป',
      }),
    ]),
  }),
]);
