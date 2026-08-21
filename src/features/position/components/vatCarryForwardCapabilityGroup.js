export const TAX_VAT_CARRY_FORWARD_CAPABILITIES = Object.freeze({
  READ: 'tax.vat-carry-forward.read',
  CONFIRM: 'tax.vat-carry-forward.confirm',
});

export const VAT_CARRY_FORWARD_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-vat-carry-forward',
  title: 'ภาษีมูลค่าเพิ่มยกไปงวดถัดไป',
  description: 'กำหนดสิทธิ์สำหรับดูและยืนยันยอด VAT ที่ยกไปงวดถัดไป',
  options: Object.freeze([
    Object.freeze({
      key: TAX_VAT_CARRY_FORWARD_CAPABILITIES.READ,
      label: 'ดูข้อมูล VAT ยกไป',
      description: 'ดูยอดและแหล่งที่มาของภาษีมูลค่าเพิ่มที่ยกไปงวดถัดไป',
    }),
    Object.freeze({
      key: TAX_VAT_CARRY_FORWARD_CAPABILITIES.CONFIRM,
      label: 'ยืนยันยอด VAT ยกไป',
      description: 'ยืนยันยอดและบันทึก authority สำหรับภาษีมูลค่าเพิ่มที่ยกไปงวดถัดไป',
    }),
  ]),
});
