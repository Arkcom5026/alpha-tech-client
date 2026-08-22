export const COMMUNICATION_CAPABILITIES = Object.freeze({
  READ: 'communication.read',
  PROFILE_MANAGE: 'communication.profile.manage',
});

export const COMMUNICATION_CAPABILITY_GROUP = Object.freeze({
  key: 'communication',
  title: 'การสื่อสารกับลูกค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลการสื่อสารและจัดการช่องทางติดต่อของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.READ,
      label: 'ดูข้อมูลการสื่อสาร',
      description: 'ดูช่องทางติดต่อ ความต้องการติดต่อ และกิจกรรมการสื่อสารภายในสาขา',
    }),
    Object.freeze({
      key: COMMUNICATION_CAPABILITIES.PROFILE_MANAGE,
      label: 'จัดการช่องทางติดต่อของสาขา',
      description: 'เพิ่มหรือแก้ไขโปรไฟล์ช่องทางติดต่อที่ใช้กับลูกค้า',
    }),
  ]),
});
