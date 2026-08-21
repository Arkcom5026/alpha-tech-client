export const TAX_PERIOD_CAPABILITIES = Object.freeze({
  READ: 'tax.period.read',
  MANAGE: 'tax.period.manage',
  REOPEN: 'tax.period.reopen',
});

export const TAX_PERIOD_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-period',
  title: 'งวดภาษีและการปิดงวด',
  description: 'แยกสิทธิ์อ่าน จัดการ lifecycle ปกติ และ reopen งวดภาษีออกจากกัน',
  options: [
    {
      key: TAX_PERIOD_CAPABILITIES.READ,
      label: 'ดูข้อมูลงวดภาษี',
      description: 'ดูรายการ สรุป และรายละเอียดงวดภาษีของสาขา โดยไม่เปลี่ยนสถานะงวด',
    },
    {
      key: TAX_PERIOD_CAPABILITIES.MANAGE,
      label: 'จัดการและปิดงวดภาษี',
      description: 'สร้างงวดรายเดือนและดำเนิน close, lock หรือ submit ตามกฎ readiness เดิมของระบบ',
    },
    {
      key: TAX_PERIOD_CAPABILITIES.REOPEN,
      label: 'เปิดงวดภาษีอีกครั้ง',
      description: 'อนุญาต reopen งวดที่ปิด ล็อก หรือยื่นแล้ว โดยต้องมีสิทธิ์จัดการและปิดงวดภาษีร่วมด้วย',
    },
  ],
});
