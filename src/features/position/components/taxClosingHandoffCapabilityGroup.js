const TAX_CLOSING_HANDOFF_CAPABILITIES = Object.freeze({
  READ: 'tax.closing-handoff.read',
  FINALIZE: 'tax.closing-handoff.finalize',
});

const TAX_CLOSING_HANDOFF_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-closing-handoff',
  title: 'ส่งมอบงานปิดภาษี',
  description: 'แยกสิทธิ์ดูชุดส่งมอบงานปิดภาษีออกจากสิทธิ์ยืนยันชุดสุดท้าย',
  options: Object.freeze([
    {
      key: TAX_CLOSING_HANDOFF_CAPABILITIES.READ,
      label: 'ดูชุดส่งมอบงานปิดภาษี',
      description: 'ดูข้อมูลและหลักฐานในชุดส่งมอบงานปิดภาษีของสาขา',
    },
    {
      key: TAX_CLOSING_HANDOFF_CAPABILITIES.FINALIZE,
      label: 'ยืนยันชุดส่งมอบงานปิดภาษี',
      description: 'ยืนยัน snapshot ปัจจุบันเป็นชุดส่งมอบงานปิดภาษีขั้นสุดท้าย โดยต้องมีสิทธิ์ดูชุดส่งมอบร่วมด้วย',
    },
  ]),
});

export {
  TAX_CLOSING_HANDOFF_CAPABILITIES,
  TAX_CLOSING_HANDOFF_CAPABILITY_GROUP,
};
