const ACCOUNTING_OFFICE_CAPABILITIES = Object.freeze({
  READ: 'tax.accounting-office.read',
});

const ACCOUNTING_OFFICE_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-accounting-office',
  title: 'ชุดข้อมูลสำหรับสำนักงานบัญชี',
  description: 'กำหนดสิทธิ์เข้าถึงชุดข้อมูลสรุปภาษีที่เตรียมไว้สำหรับสำนักงานบัญชี',
  options: Object.freeze([
    {
      key: ACCOUNTING_OFFICE_CAPABILITIES.READ,
      label: 'ดูชุดข้อมูลสำหรับสำนักงานบัญชี',
      description: 'ดูชุดข้อมูลและหลักฐานสรุปภาษีของสาขาที่เตรียมส่งให้สำนักงานบัญชี',
    },
  ]),
});

export {
  ACCOUNTING_OFFICE_CAPABILITIES,
  ACCOUNTING_OFFICE_CAPABILITY_GROUP,
};
