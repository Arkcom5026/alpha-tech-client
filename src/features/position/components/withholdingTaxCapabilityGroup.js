export const TAX_WITHHOLDING_CAPABILITIES = Object.freeze({
  READ: 'tax.withholding.read',
  TREATMENT: 'tax.withholding.treatment',
  CERTIFICATE_ISSUE: 'tax.withholding.certificate.issue',
  FILING_PREPARE: 'tax.withholding.filing.prepare',
  FILING_SUBMIT: 'tax.withholding.filing.submit',
});

export const WITHHOLDING_TAX_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-withholding',
  title: 'ภาษีหัก ณ ที่จ่าย',
  description: 'กำหนดสิทธิ์สำหรับตรวจสอบ ประเมิน ออกหนังสือรับรอง และยื่นแบบภาษีหัก ณ ที่จ่าย',
  options: Object.freeze([
    Object.freeze({ key: TAX_WITHHOLDING_CAPABILITIES.READ, label: 'ดูข้อมูลภาษีหัก ณ ที่จ่าย', description: 'ดู workspace รายการหัก ณ ที่จ่าย หนังสือรับรอง และสถานะการยื่นแบบ' }),
    Object.freeze({ key: TAX_WITHHOLDING_CAPABILITIES.TREATMENT, label: 'ประเมินรายการหัก ณ ที่จ่าย', description: 'เปลี่ยนผลการพิจารณาว่ารายการต้องหักภาษีหรือไม่และบันทึกผลการหัก' }),
    Object.freeze({ key: TAX_WITHHOLDING_CAPABILITIES.CERTIFICATE_ISSUE, label: 'ออกหนังสือรับรองหัก ณ ที่จ่าย', description: 'ออกหรือปรับปรุงหนังสือรับรองภาษีหัก ณ ที่จ่ายจากข้อมูลที่ผ่านการประเมินแล้ว' }),
    Object.freeze({ key: TAX_WITHHOLDING_CAPABILITIES.FILING_PREPARE, label: 'เตรียมแบบ ภ.ง.ด.3 / ภ.ง.ด.53', description: 'จัดเตรียมชุดข้อมูลสำหรับแบบยื่นภาษีหัก ณ ที่จ่ายของงวดภาษี' }),
    Object.freeze({ key: TAX_WITHHOLDING_CAPABILITIES.FILING_SUBMIT, label: 'ยืนยันการยื่นแบบ ภ.ง.ด.', description: 'บันทึกการยืนยันว่าแบบภาษีหัก ณ ที่จ่ายถูกยื่นแล้ว' }),
  ]),
});
