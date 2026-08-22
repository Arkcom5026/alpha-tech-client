export const FINANCE_RECEIVABLES_CAPABILITIES = Object.freeze({
  READ: 'finance.receivables.read',
});

export const FINANCE_RECEIVABLES_CAPABILITY_GROUP = Object.freeze({
  key: 'finance-receivables',
  title: 'ลูกหนี้และเครดิตลูกค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลลูกหนี้การค้าและเครดิตลูกค้าของสาขา โดยแยกจากสิทธิ์รับชำระหรือปิดยอด',
  options: Object.freeze([
    Object.freeze({
      key: FINANCE_RECEIVABLES_CAPABILITIES.READ,
      label: 'ดูลูกหนี้และเครดิตลูกค้า',
      description: 'ดูสรุปและรายละเอียดบัญชีลูกหนี้ รวมถึงข้อมูลเครดิตลูกค้าภายในสาขา',
    }),
  ]),
});
