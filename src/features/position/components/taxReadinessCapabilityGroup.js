const TAX_READINESS_CAPABILITIES = Object.freeze({
  READ: 'tax.readiness.read',
});

const TAX_READINESS_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-readiness',
  title: 'ภาพรวมความพร้อมด้านภาษี',
  description: 'กำหนดสิทธิ์ดูภาพรวมความพร้อมของข้อมูลภาษีก่อนปิดงวดหรือส่งต่อสำนักงานบัญชี',
  options: Object.freeze([
    {
      key: TAX_READINESS_CAPABILITIES.READ,
      label: 'ดูภาพรวมความพร้อมด้านภาษี',
      description: 'ดูสถานะความพร้อมและข้อยกเว้นของงานภาษีในสาขา',
    },
  ]),
});

export {
  TAX_READINESS_CAPABILITIES,
  TAX_READINESS_CAPABILITY_GROUP,
};
