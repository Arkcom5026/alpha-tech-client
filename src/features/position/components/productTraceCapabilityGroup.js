export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  FINANCIALS: 'product.trace.financials',
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลทางการเงินและข้อมูลซัพพลายเออร์ภายในประวัติสินค้า โดยไม่กระทบสิทธิ์ดูประวัติพื้นฐาน',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIALS,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูต้นทุน ข้อมูลซัพพลายเออร์ และรายละเอียดทางการเงินที่เกี่ยวข้องกับเส้นทางของสินค้า',
    }),
  ]),
});
