export const TAX_ISSUER_PROFILE_CAPABILITIES = Object.freeze({
  READ: 'tax.issuer-profile.read',
  MANAGE: 'tax.issuer-profile.manage',
});

export const TAX_ISSUER_PROFILE_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-issuer-profile',
  title: 'ข้อมูลผู้ออกเอกสารภาษี',
  description: 'กำหนดสิทธิ์สำหรับดูและแก้ไขข้อมูลนิติบุคคล/ร้านที่ใช้เป็นผู้ออกเอกสารภาษีของสาขา',
  options: Object.freeze([
    Object.freeze({
      key: TAX_ISSUER_PROFILE_CAPABILITIES.READ,
      label: 'ดูข้อมูลผู้ออกเอกสารภาษี',
      description: 'ดูข้อมูลชื่อผู้ประกอบการ เลขประจำตัวผู้เสียภาษี ที่อยู่ และการตั้งค่าเลขที่เอกสารของสาขา',
    }),
    Object.freeze({
      key: TAX_ISSUER_PROFILE_CAPABILITIES.MANAGE,
      label: 'แก้ไขข้อมูลผู้ออกเอกสารภาษี',
      description: 'บันทึกหรือปรับปรุงข้อมูลผู้ออกเอกสารภาษีและค่าที่เกี่ยวข้องของสาขา',
    }),
  ]),
});
