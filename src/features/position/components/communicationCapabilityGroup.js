export const COMMUNICATION_CAPABILITIES = Object.freeze({
  USE: 'communication.use',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ใช้งานช่องทางการสื่อสารของลูกค้าและงานซ่อม รวมถึงการตั้งค่าโปรไฟล์การสื่อสารของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.USE,
      label: 'ใช้งานการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อ การตั้งค่าการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับลูกค้าและงานซ่อม',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์การสื่อสารของสาขา ซึ่งเป็นสิทธิ์ยกระดับจากการใช้งานทั่วไป',
    }),
  ]),
});
