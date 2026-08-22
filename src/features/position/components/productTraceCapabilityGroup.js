export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIALS: 'product.trace.financials',
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้าและการติดตามย้อนหลัง',
  description: 'กำหนดสิทธิ์ดูประวัติสินค้าและข้อมูลการเงิน/คู่ค้าที่มีความละเอียดอ่อนแยกจากกัน',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูเส้นทางสินค้า สต๊อก การขาย การคืน เคลม และงานซ่อมภายในขอบเขตสาขา',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS,
      label: 'ดูข้อมูลการเงินและคู่ค้าในประวัติสินค้า',
      description: 'แสดงต้นทุน ข้อมูลผู้จำหน่าย และรายละเอียดทางการเงินที่ถูกซ่อนสำหรับสิทธิ์ทั่วไป',
    }),
  ]),
});
