export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
  MEDIA: 'store-experience.media',
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'แยกสิทธิ์ดู แก้ไข เผยแพร่ และจัดการสื่อของหน้าร้านออนไลน์ออกจากกัน',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูข้อมูลหน้าร้าน',
      description: 'ดูร่างหน้าร้านและรายการสื่อที่อยู่ภายใต้สาขาปัจจุบัน',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้าน',
      description: 'บันทึกหรือแก้ไขร่างหน้าร้าน โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หรือยกเลิกเผยแพร่',
      description: 'ควบคุมสถานะการเผยแพร่หน้าร้าน โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านด้วย',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MEDIA,
      label: 'จัดการสื่อหน้าร้าน',
      description: 'อัปโหลดสื่อของหน้าร้าน โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านด้วย',
    }),
  ]),
});
