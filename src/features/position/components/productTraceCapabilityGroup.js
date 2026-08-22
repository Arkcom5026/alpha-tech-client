export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIAL_READ: 'product.trace.financial.read',
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์ดูประวัติสินค้าและข้อมูลทางการเงินที่เกี่ยวข้อง โดยผู้ใช้ที่ไม่ใช่พนักงานยังคงพฤติกรรมเดิมตามช่องทางที่ระบบอนุญาต',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูประวัติการรับเข้า การเคลื่อนไหว การขาย การคืน และงานที่เกี่ยวข้องกับสินค้าภายในขอบเขตที่ระบบอนุญาต',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL_READ,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูต้นทุน ข้อมูลผู้จำหน่าย และรายละเอียดทางการเงินที่ถูกปกปิดจากผู้ใช้ทั่วไป',
    }),
  ]),
});
