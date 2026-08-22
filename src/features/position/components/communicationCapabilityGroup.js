export const COMMUNICATION_CAPABILITIES = Object.freeze({
  VIEW: 'communication.view',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลช่องทางสื่อสารและสิทธิ์จัดการโปรไฟล์การสื่อสารของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.VIEW,
      label: 'ใช้งานข้อมูลการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อลูกค้า ความต้องการติดต่อ และกิจกรรมการสื่อสารในงานที่เกี่ยวข้อง',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'สร้างหรือแก้ไขโปรไฟล์การสื่อสารของสาขา โดยแยกจากสิทธิ์ใช้งานข้อมูลทั่วไป',
    }),
  ]),
});
