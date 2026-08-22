export const COMMUNICATION_CAPABILITIES = Object.freeze({
  ACCESS: 'communication.access',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ใช้งานข้อมูลช่องทางติดต่อและการตั้งค่าโปรไฟล์การสื่อสารของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.ACCESS,
      label: 'ใช้งานการสื่อสาร',
      description: 'ดูและบันทึกช่องทางติดต่อ ความต้องการติดต่อ และกิจกรรมการสื่อสารที่เกี่ยวข้องกับงาน',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์การสื่อสารระดับสาขา',
    }),
  ]),
});
