export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  MANAGE: 'store-experience.manage',
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์จัดการฉบับร่าง การเผยแพร่ และสื่อของหน้าร้านออนไลน์',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'จัดการหน้าร้านออนไลน์',
      description: 'ดู แก้ไข เผยแพร่ ยกเลิกเผยแพร่ และอัปโหลดสื่อสำหรับหน้าร้านของสาขา',
    }),
  ]),
});
