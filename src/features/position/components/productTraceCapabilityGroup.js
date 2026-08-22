export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  READ: 'product.trace.read',
  FINANCIAL: 'product.trace.financial',
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้าและการติดตาม',
  description: 'กำหนดสิทธิ์ดูประวัติสินค้าและข้อมูลต้นทุนหรือข้อมูลทางการเงินที่อ่อนไหว',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.READ,
      label: 'ดูประวัติสินค้า',
      description: 'ดูเส้นทางสินค้า สต๊อก การขาย การคืน การเคลม และงานซ่อมที่เกี่ยวข้อง',
    }),
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL,
      label: 'ดูข้อมูลทางการเงินของสินค้า',
      description: 'ดูข้อมูลต้นทุน ซัพพลายเออร์ และรายละเอียดทางการเงินในประวัติสินค้า',
    }),
  ]),
});
