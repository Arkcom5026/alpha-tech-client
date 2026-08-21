export const TAX_PUBLICATION_RETRY_CAPABILITIES = Object.freeze({
  READ: 'tax.publication-retry.read',
  EXECUTE: 'tax.publication-retry.execute',
});

export const TAX_PUBLICATION_RETRY_CAPABILITY_GROUP = Object.freeze({
  key: 'tax-publication-retry',
  title: 'การเผยแพร่เอกสารภาษีซ้ำ',
  description: 'กำหนดสิทธิ์ตรวจสอบรายการที่เผยแพร่ไม่ครบ และสั่งให้ระบบลองเผยแพร่เอกสารภาษีซ้ำ',
  options: [
    {
      key: TAX_PUBLICATION_RETRY_CAPABILITIES.READ,
      label: 'ดูรายการที่เผยแพร่ไม่ครบ',
      description: 'ดูรายการขายที่ยังขาดหลักฐานการเผยแพร่เอกสารภาษี โดยไม่แก้ไขข้อมูล',
    },
    {
      key: TAX_PUBLICATION_RETRY_CAPABILITIES.EXECUTE,
      label: 'สั่งเผยแพร่เอกสารภาษีซ้ำ',
      description: 'สั่ง retry รายการเดียวหรือทั้งหมด เพื่อให้ระบบสร้างหลักฐานการเผยแพร่ที่ยังขาด',
    },
  ],
});
