export const RESIDUAL_BUSINESS_CAPABILITIES = Object.freeze({
  COMMUNICATION_OPERATE: 'communication.operate',
  COMMUNICATION_PROFILE_MANAGE: 'communication.profile.manage',
  STORE_EXPERIENCE_READ: 'store-experience.read',
  STORE_EXPERIENCE_MANAGE: 'store-experience.manage',
  STORE_EXPERIENCE_PUBLISH: 'store-experience.publish',
  PRODUCT_TRACE_FINANCIALS: 'product.trace.financials',
});

export const RESIDUAL_BUSINESS_CAPABILITY_GROUP = Object.freeze({
  key: 'residual-business-authority',
  title: 'การสื่อสาร หน้าร้าน และข้อมูลเชิงลึกสินค้า',
  description: 'กำหนดสิทธิ์งานสื่อสาร การจัดการหน้าร้านออนไลน์ และการเห็นข้อมูลทางการเงินในประวัติสินค้า โดยไม่อิงชื่อบทบาทเดิม',
  options: Object.freeze([
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.COMMUNICATION_OPERATE,
      label: 'ใช้งานการสื่อสารกับลูกค้า',
      description: 'ดูช่องทางติดต่อ บันทึก preference และกิจกรรมการสื่อสารที่เกี่ยวข้องกับลูกค้าและงานซ่อม',
    }),
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.COMMUNICATION_PROFILE_MANAGE,
      label: 'จัดการโปรไฟล์การสื่อสาร',
      description: 'สร้างหรือแก้ไขโปรไฟล์การสื่อสารของสาขา แยกจากสิทธิ์ใช้งานการสื่อสารทั่วไป',
    }),
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_READ,
      label: 'ดูข้อมูลหน้าร้านออนไลน์',
      description: 'ดู draft และรายการ media ของหน้าร้านออนไลน์ในสาขา',
    }),
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_MANAGE,
      label: 'แก้ไขหน้าร้านออนไลน์',
      description: 'บันทึก draft และอัปโหลด media โดยต้องมีสิทธิ์ดูข้อมูลหน้าร้านออนไลน์ด้วย',
    }),
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.STORE_EXPERIENCE_PUBLISH,
      label: 'เผยแพร่หรือยกเลิกการเผยแพร่หน้าร้าน',
      description: 'อนุญาต publish หรือ unpublish หน้าร้าน โดยต้องมีสิทธิ์ดูและแก้ไขหน้าร้านด้วย',
    }),
    Object.freeze({
      key: RESIDUAL_BUSINESS_CAPABILITIES.PRODUCT_TRACE_FINANCIALS,
      label: 'ดูข้อมูลการเงินในประวัติสินค้า',
      description: 'แสดงต้นทุน ผู้ขาย และข้อมูลทางการเงินที่ถูกซ่อนจากผู้ใช้ทั่วไปใน Product Trace',
    }),
  ]),
});
