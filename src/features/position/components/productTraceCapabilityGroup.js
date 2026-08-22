export const PRODUCT_TRACE_CAPABILITIES = Object.freeze({
  FINANCIAL_READ: 'product.trace.financial.read',
});

export const PRODUCT_TRACE_CAPABILITY_GROUP = Object.freeze({
  key: 'product-trace',
  title: 'ประวัติสินค้า',
  description: 'กำหนดสิทธิ์ดูข้อมูลด้านการเงินและแหล่งที่มาของสินค้าในหน้าประวัติสินค้า โดยการดูประวัติพื้นฐานยังคงตามสิทธิ์การเข้าสู่ระบบเดิม',
  options: Object.freeze([
    Object.freeze({
      key: PRODUCT_TRACE_CAPABILITIES.FINANCIAL_READ,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'ดูต้นทุน ข้อมูลผู้จำหน่าย และรายละเอียดทางการเงินที่ถูกปกปิดจากผู้ใช้ทั่วไป',
    }),
  ]),
});
