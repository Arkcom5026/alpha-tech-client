export const DAILY_CLOSING_CAPABILITIES = Object.freeze({
  READ: 'finance.daily-closing.read',
});

export const DAILY_CLOSING_CAPABILITY_GROUP = Object.freeze({
  key: 'daily-closing',
  title: 'สรุปปิดยอดประจำวัน',
  description: 'กำหนดสิทธิ์สำหรับดูสรุปยอดการเงินประจำวันของสาขา โดยไม่รวมสิทธิ์ปิดยอดหรือแก้ไขรายการทางการเงิน',
  options: Object.freeze([
    Object.freeze({
      key: DAILY_CLOSING_CAPABILITIES.READ,
      label: 'ดูสรุปปิดยอดประจำวัน',
      description: 'ดูยอดขาย การรับชำระ และข้อมูลสรุปปิดยอดของสาขาตามช่วงวันที่ที่ระบบรองรับ',
    }),
  ]),
});
