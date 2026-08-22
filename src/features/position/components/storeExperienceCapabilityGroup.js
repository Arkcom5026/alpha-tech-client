export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store.experience.read',
  MANAGE: 'store.experience.manage',
  PUBLISH: 'store.experience.publish',
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์ดู แก้ไข และเผยแพร่หน้าร้านออนไลน์ของสาขา โดยแยกการเผยแพร่ออกจากการแก้ไขทั่วไป',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูการตั้งค่าหน้าร้าน',
      description: 'ดูฉบับร่างและสื่อของหน้าร้านออนไลน์',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้าน',
      description: 'บันทึกฉบับร่างและอัปโหลดสื่อของหน้าร้าน',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หน้าร้าน',
      description: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้านออนไลน์',
    }),
  ]),
});
