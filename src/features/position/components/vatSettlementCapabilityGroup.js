export const TAX_VAT_SETTLEMENT_CAPABILITIES = Object.freeze({
  READ: 'tax.vat-settlement.read',
});

export const VAT_SETTLEMENT_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-vat-settlement',
  title: 'การเตรียมยอดภาษีมูลค่าเพิ่ม',
  description: 'กำหนดสิทธิ์สำหรับดูข้อมูลการเตรียมยอด VAT ของงวดภาษี',
  options: Object.freeze([
    Object.freeze({
      key: TAX_VAT_SETTLEMENT_CAPABILITIES.READ,
      label: 'ดูข้อมูลการเตรียมยอด VAT',
      description: 'ดูข้อมูลสรุปและองค์ประกอบที่ใช้เตรียมยอดภาษีมูลค่าเพิ่มของงวดภาษี',
    }),
  ]),
});
