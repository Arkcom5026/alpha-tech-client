export const STORE_EXPERIENCE_CAPABILITIES = Object.freeze({
  READ: 'store-experience.read',
  MANAGE: 'store-experience.manage',
  PUBLISH: 'store-experience.publish',
  MEDIA: 'store-experience.media',
});

export const STORE_EXPERIENCE_CAPABILITY_GROUP = Object.freeze({
  key: 'store-experience',
  title: 'หน้าร้านออนไลน์',
  description: 'กำหนดสิทธิ์ดู แก้ไข เผยแพร่ และจัดการสื่อของหน้าร้านออนไลน์',
  options: Object.freeze([
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.READ,
      label: 'ดูหน้าร้านและฉบับร่าง',
      description: 'ดูการตั้งค่าหน้าร้าน ฉบับร่าง และคลังสื่อของสาขา',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MANAGE,
      label: 'แก้ไขหน้าร้าน',
      description: 'บันทึกการแก้ไขฉบับร่างและเนื้อหาหน้าร้าน',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.PUBLISH,
      label: 'เผยแพร่หรือยกเลิกการเผยแพร่',
      description: 'ควบคุมสถานะหน้าร้านที่ลูกค้าเห็นจริง',
    }),
    Object.freeze({
      key: STORE_EXPERIENCE_CAPABILITIES.MEDIA,
      label: 'จัดการสื่อหน้าร้าน',
      description: 'อัปโหลดและจัดการไฟล์ภาพหรือสื่อสำหรับหน้าร้าน',
    }),
  ]),
});
