const EMPLOYEE_MANAGE_CAPABILITY = 'employee.manage';

const REPAIR_CAPABILITIES = Object.freeze({
  READ: 'repair.read',
  INTAKE: 'repair.intake',
  WORKFLOW: 'repair.workflow',
  PARTS: 'repair.parts',
  ESTIMATE: 'repair.estimate',
  CLAIM: 'repair.claim',
  HANDOVER: 'repair.handover',
  CUSTOMER_ACCESS: 'repair.customer-access',
  CUSTOMER_OVERRIDE: 'repair.customer-override',
});

const INVENTORY_CAPABILITIES = Object.freeze({
  ADJUST: 'inventory.adjust',
  TRANSFER: 'inventory.transfer',
  AUDIT: 'inventory.audit',
  AUDIT_FINALIZE: 'inventory.audit.finalize',
  RECEIVE: 'inventory.receive',
  LIFECYCLE: 'inventory.lifecycle',
  QUICK_STOCK: 'inventory.quick-stock',
  QUICK_RECEIPT: 'inventory.quick-receipt',
  QUICK_RECEIPT_FINALIZE: 'inventory.quick-receipt.finalize',
});

const SALES_CAPABILITIES = Object.freeze({
  CORE: 'sales.core',
  COMPLETE: 'sales.complete',
  RETURN: 'sales.return',
  RETURN_DEDUCTION_APPROVE: 'sales.return.deduction-approve',
  PAYMENT_READ: 'sales.payment.read',
  PAYMENT_MANAGE: 'sales.payment.manage',
  PAYMENT_CANCEL: 'sales.payment.cancel',
  SETTLEMENT_CLOSE: 'sales.settlement.close',
  DOCUMENT_PREPARE: 'sales.document.prepare',
  DOCUMENT_LOCK: 'sales.document.lock',
  DOCUMENT_REPLACE: 'sales.document.replace',
  DOCUMENT_TAX_PUBLISH: 'sales.document.tax-publish',
});

const TAX_OUTPUT_CAPABILITIES = Object.freeze({
  READ: 'tax.output.read',
  PREPARE: 'tax.output.prepare',
  ISSUE: 'tax.output.issue',
  CREDIT_NOTE: 'tax.output.credit-note',
  LIFECYCLE: 'tax.output.lifecycle',
  FILING_READ: 'tax.output.filing.read',
  FILING_PREPARE: 'tax.output.filing.prepare',
  FILING_SUBMIT: 'tax.output.filing.submit',
});

const TAX_INPUT_CAPABILITIES = Object.freeze({
  READ: 'tax.input.read',
  REVIEW: 'tax.input.review',
  FILING: 'tax.input.filing',
  AUDIT: 'tax.input.audit',
  PERIOD_CONTROL: 'tax.input.period-control',
});

const PROCUREMENT_CAPABILITIES = Object.freeze({
  PURCHASE_ORDER: 'procurement.purchase-order',
  PURCHASE_ORDER_CONTROL: 'procurement.purchase-order.control',
  SUPPLIER: 'procurement.supplier',
  SUPPLIER_DELETE: 'procurement.supplier.delete',
  SUPPLIER_PAYMENT_READ: 'procurement.supplier-payment.read',
  SUPPLIER_PAYMENT_MANAGE: 'procurement.supplier-payment.manage',
  SUPPLIER_PAYMENT_VOID: 'procurement.supplier-payment.void',
  RECEIPT: 'procurement.receipt',
  RECEIPT_FINALIZE: 'procurement.receipt.finalize',
});

const CAPABILITY_GROUPS = Object.freeze([
  {
    key: 'employee',
    title: 'การจัดการพนักงาน',
    description: 'สิทธิ์ด้านบัญชีและโครงสร้างพนักงานภายในสาขา',
    options: [{
      key: EMPLOYEE_MANAGE_CAPABILITY,
      label: 'เพิ่มและจัดการพนักงาน',
      description: 'อนุญาตให้พนักงานในตำแหน่งนี้จัดการ flow เพิ่มพนักงานของสาขา',
    }],
  },
  {
    key: 'repair',
    title: 'งานซ่อมและเคลม',
    description: 'กำหนดขอบเขตงานซ่อมเป็นรายหน้าที่ โดยไม่อิงชื่อหรือตำแหน่งแบบตายตัว',
    options: [
      { key: REPAIR_CAPABILITIES.READ, label: 'ดูข้อมูลงานซ่อม', description: 'ดูรายการงานซ่อม รายละเอียด และข้อมูลประกอบที่อยู่ในสาขา' },
      { key: REPAIR_CAPABILITIES.INTAKE, label: 'รับงานซ่อมและรับอุปกรณ์', description: 'สร้างงานรับซ่อมและบันทึกข้อมูลการรับอุปกรณ์จากลูกค้า' },
      { key: REPAIR_CAPABILITIES.WORKFLOW, label: 'ดำเนินขั้นตอนงานซ่อม', description: 'รับงาน วินิจฉัย เริ่มซ่อม เปลี่ยนสถานะ และดำเนิน workflow ของช่าง' },
      { key: REPAIR_CAPABILITIES.PARTS, label: 'จัดการอะไหล่ในงานซ่อม', description: 'เพิ่มหรือเบิกอะไหล่และเชื่อมการใช้สต๊อกเข้ากับงานซ่อม' },
      { key: REPAIR_CAPABILITIES.ESTIMATE, label: 'จัดการการประเมินราคา', description: 'จัดทำและส่งข้อมูลประเมินราคาหรือข้อตกลงก่อนดำเนินงาน' },
      { key: REPAIR_CAPABILITIES.CLAIM, label: 'จัดการงานเคลม', description: 'เปิด ติดตาม และดำเนินสถานะงานเคลมที่เกี่ยวข้องกับงานซ่อม' },
      { key: REPAIR_CAPABILITIES.HANDOVER, label: 'ส่งมอบงานซ่อม', description: 'ยืนยันการส่งมอบอุปกรณ์และปิดขั้นตอน custody กับลูกค้า' },
      { key: REPAIR_CAPABILITIES.CUSTOMER_ACCESS, label: 'จัดการการเข้าถึงของลูกค้า', description: 'สร้างและจัดการข้อมูลสำหรับติดตามงานซ่อมจากฝั่งลูกค้า' },
      { key: REPAIR_CAPABILITIES.CUSTOMER_OVERRIDE, label: 'อนุญาตรับงานกรณีเจ้าของอุปกรณ์ไม่ตรง', description: 'อนุญาต override เจ้าของอุปกรณ์เดิมเมื่อมีเหตุผลและผู้ใช้เลือกยืนยันอย่างชัดเจน' },
    ],
  },
  {
    key: 'inventory',
    title: 'สต๊อกและการเคลื่อนไหวสินค้า',
    description: 'กำหนดสิทธิ์งานสต๊อกแบบ privileged แยกจากชื่อบทบาทเดิม',
    options: [
      { key: INVENTORY_CAPABILITIES.ADJUST, label: 'ปรับยอดสต๊อก', description: 'อนุญาตเพิ่มหรือลดยอดสต๊อกแบบ Simple เมื่อมีเหตุผลและหลักฐานประกอบ' },
      { key: INVENTORY_CAPABILITIES.TRANSFER, label: 'โอนสต๊อกระหว่างสาขา', description: 'อนุญาตสร้างรายการโอนสต๊อกแบบ Simple จากสาขาปัจจุบันไปยังสาขาปลายทาง' },
      { key: INVENTORY_CAPABILITIES.AUDIT, label: 'ตรวจนับสต๊อก', description: 'ดูรอบตรวจนับ เริ่มรอบใหม่ และสแกนสินค้า/หมายเลขเครื่องภายในรอบตรวจนับ' },
      { key: INVENTORY_CAPABILITIES.AUDIT_FINALIZE, label: 'ยืนยันหรือยกเลิกรอบตรวจนับ', description: 'อนุญาตยืนยันผลหรือล้มเลิกรอบตรวจนับสต๊อก โดยต้องมีสิทธิ์ตรวจนับสต๊อกด้วย' },
      { key: INVENTORY_CAPABILITIES.RECEIVE, label: 'รับสินค้าเข้าสต๊อก', description: 'อนุญาตรับสินค้าจากเอกสารรับเข้า บันทึกบาร์โค้ด/หมายเลขเครื่อง และยืนยันสินค้าเข้าสู่สต๊อก' },
      { key: INVENTORY_CAPABILITIES.LIFECYCLE, label: 'จัดการสถานะรายการสต๊อก', description: 'อนุญาตเปลี่ยนสถานะรายการสต๊อกแบบ manual และลบรายการที่ยังไม่ถูกขาย โดยไม่ครอบคลุมการตัดขายจาก flow การขาย' },
      { key: INVENTORY_CAPABILITIES.QUICK_STOCK, label: 'เพิ่มสต๊อกด่วน', description: 'อนุญาตใช้ Quick Stock แบบ one-shot เพื่อเพิ่มบาร์โค้ด รับสินค้าเดิม หรือสร้างสินค้าและรับเข้าสต๊อกในขั้นตอนเดียว โดยไม่รวม Quick Receipt Session' },
      { key: INVENTORY_CAPABILITIES.QUICK_RECEIPT, label: 'จัดทำใบรับสินค้าด่วน', description: 'ดู สร้าง และแก้ไข Quick Receipt Session รวมถึงเพิ่มหรือลบรายการในร่าง โดยยังไม่อนุญาตปิดรอบ' },
      { key: INVENTORY_CAPABILITIES.QUICK_RECEIPT_FINALIZE, label: 'ยืนยันหรือยกเลิกใบรับสินค้าด่วน', description: 'อนุญาต Complete, Finalize หรือ Cancel Quick Receipt Session โดยต้องมีสิทธิ์จัดทำใบรับสินค้าด่วนด้วย' },
    ],
  },
  {
    key: 'sales',
    title: 'การขายและหน้าขายสินค้า',
    description: 'แยกสิทธิ์หน้าขาย การคืนสินค้า การรับชำระ การปิดยอด และการกำกับเอกสารออกจากกันตาม authority ของแต่ละขั้นตอน',
    options: [
      { key: SALES_CAPABILITIES.CORE, label: 'ใช้งานการขาย', description: 'ค้นหาสินค้า ใช้ตะกร้าพัก สร้างรายการขาย และดูประวัติ/รายละเอียดการขาย โดยยังไม่รวมการยืนยันขาย' },
      { key: SALES_CAPABILITIES.COMPLETE, label: 'ยืนยันการขาย', description: 'อนุญาตยืนยันการขายผ่าน completion flow ที่ตัดสต๊อก บันทึก payment evidence และเผยแพร่ tax candidate โดยต้องมีสิทธิ์ใช้งานการขายด้วย' },
      { key: SALES_CAPABILITIES.RETURN, label: 'รับคืนสินค้า', description: 'ดูสิทธิ์คืนสินค้า ประวัติรายการคืน และยืนยันการคืนที่คืนสต๊อกและบันทึก refund evidence' },
      { key: SALES_CAPABILITIES.RETURN_DEDUCTION_APPROVE, label: 'อนุมัติการหักยอดคืน', description: 'อนุญาตยืนยันการคืนที่มีการหักยอดเงินคืน โดยต้องมีสิทธิ์รับคืนสินค้าด้วย' },
      { key: SALES_CAPABILITIES.PAYMENT_READ, label: 'ดูข้อมูลการชำระเงิน', description: 'ดูและค้นหารายการชำระเงินที่ใช้เป็นหลักฐานทางการเงินของการขาย' },
      { key: SALES_CAPABILITIES.PAYMENT_MANAGE, label: 'บันทึกการชำระเงิน', description: 'สร้าง payment evidence สำหรับการรับชำระ รวมถึง flow ที่เชื่อมเงินมัดจำหรือลูกหนี้ตามกฎเดิมของระบบ' },
      { key: SALES_CAPABILITIES.PAYMENT_CANCEL, label: 'ยกเลิกรายการชำระเงิน', description: 'ย้อนหรือยกเลิก payment evidence โดยต้องมีสิทธิ์บันทึกการชำระเงินด้วย' },
      { key: SALES_CAPABILITIES.SETTLEMENT_CLOSE, label: 'ปิดยอดการขาย', description: 'อนุญาตใช้ mark-paid เพื่อปิดยอดจากหลักฐานการชำระที่ระบบตรวจสอบแล้ว แยกจากสิทธิ์สร้างหรือยกเลิก payment evidence' },
      { key: SALES_CAPABILITIES.DOCUMENT_PREPARE, label: 'จัดเตรียมเอกสารการขาย', description: 'ดู สร้าง และแก้ไขร่างเอกสาร รวมถึงบรรทัดและข้อความประกอบ โดยไม่รวมการล็อกหรือเผยแพร่ภาษี' },
      { key: SALES_CAPABILITIES.DOCUMENT_LOCK, label: 'ล็อกเอกสารการขาย', description: 'ยืนยัน snapshot ของเอกสารที่จัดเตรียมหรือเอกสารทดแทน โดยต้องมีสิทธิ์ของ flow เอกสารนั้นร่วมด้วย' },
      { key: SALES_CAPABILITIES.DOCUMENT_REPLACE, label: 'จัดทำเอกสารทดแทน', description: 'สร้าง ดู และแก้ไขเอกสารทดแทนภายใต้ financial lock ของเอกสารเดิม โดยยังไม่รวมการล็อกเอกสาร' },
      { key: SALES_CAPABILITIES.DOCUMENT_TAX_PUBLISH, label: 'เผยแพร่เอกสารเข้าสู่ภาษี', description: 'อนุญาตลงทะเบียน tax candidate จากเอกสารที่จัดเตรียมแล้ว โดยแยกจากสิทธิ์ออกใบส่งของและ tax lifecycle อื่น' },
    ],
  },
  {
    key: 'tax-output',
    title: 'ภาษีขายและเอกสารภาษี',
    description: 'แยกสิทธิ์อ่าน เตรียม ออกเอกสาร เครดิตโน้ต ควบคุม lifecycle และการยื่นภาษีขายออกจากกัน',
    options: [
      { key: TAX_OUTPUT_CAPABILITIES.READ, label: 'ดูข้อมูลภาษีขาย', description: 'ดู tax candidate รายการเอกสาร รายละเอียด และเอกสารพร้อมพิมพ์ภายในสาขา' },
      { key: TAX_OUTPUT_CAPABILITIES.PREPARE, label: 'เตรียมเอกสารภาษีขาย', description: 'ลงทะเบียน tax candidate จากแหล่งที่รองรับและรีเฟรชข้อมูลผู้รับในเอกสารร่าง' },
      { key: TAX_OUTPUT_CAPABILITIES.ISSUE, label: 'ออกเอกสารภาษีขาย', description: 'ออกใบกำกับภาษีหรือเอกสารภาษีขายผ่าน atomic issuance authority ของระบบ' },
      { key: TAX_OUTPUT_CAPABILITIES.CREDIT_NOTE, label: 'ออกใบลดหนี้ภาษีขาย', description: 'ออก credit note จากเอกสารภาษีหรือ Sale Return ตาม eligibility และหลักฐานเดิมของระบบ' },
      { key: TAX_OUTPUT_CAPABILITIES.LIFECYCLE, label: 'ควบคุมสถานะเอกสารภาษี', description: 'ดำเนิน transition ของเอกสารภาษีผ่าน canonical lifecycle โดยไม่เปลี่ยนกฎ transition เดิม' },
      { key: TAX_OUTPUT_CAPABILITIES.FILING_READ, label: 'ดูชุดยื่นภาษีขาย', description: 'ดู filing batch ภาษีขายตามสาขาและงวด โดยไม่อนุญาตสร้างหรือยืนยันชุดยื่น' },
      { key: TAX_OUTPUT_CAPABILITIES.FILING_PREPARE, label: 'เตรียมชุดยื่นภาษีขาย', description: 'สร้างหรือรีเฟรช draft filing batch และรวบรวม Output VAT records ตามกฎงวดภาษีเดิม' },
      { key: TAX_OUTPUT_CAPABILITIES.FILING_SUBMIT, label: 'ยืนยันการยื่นภาษีขาย', description: 'ยืนยัน filing batch จาก DRAFT เป็น SUBMITTED โดยต้องมีสิทธิ์เตรียมชุดยื่นภาษีขายร่วมด้วย' },
    ],
  },
  {
    key: 'tax-input',
    title: 'ภาษีซื้อและการยื่นภาษี',
    description: 'แยกสิทธิ์อ่าน ตรวจสอบ จัดชุดยื่น ตรวจสอบหลักฐาน และควบคุมงวดภาษีซื้อออกจากกัน',
    options: [
      { key: TAX_INPUT_CAPABILITIES.READ, label: 'ดูข้อมูลภาษีซื้อ', description: 'ดูภาพรวม เอกสาร และข้อมูลที่ใช้ประกอบการตรวจสอบภาษีซื้อ รวมถึง export ที่ไม่แก้สถานะ' },
      { key: TAX_INPUT_CAPABILITIES.REVIEW, label: 'ตรวจสอบและตัดสินใจภาษีซื้อ', description: 'Review เอกสาร ตัดสินรายการซ้ำ เชื่อมเอกสารทดแทน และปิด investigation ตามกฎเดิมของระบบ' },
      { key: TAX_INPUT_CAPABILITIES.FILING, label: 'จัดชุดและยื่นภาษีซื้อ', description: 'เลือกหรือถอนเอกสารจากชุดยื่น เตรียม filing batch และยืนยันการยื่นภาษีซื้อ' },
      { key: TAX_INPUT_CAPABILITIES.AUDIT, label: 'จัดทำชุดตรวจสอบภาษีซื้อ', description: 'สร้าง audit package และหลักฐานประกอบสำหรับการตรวจสอบภาษีซื้อ โดยไม่ให้สิทธิ์ควบคุมงวดอัตโนมัติ' },
      { key: TAX_INPUT_CAPABILITIES.PERIOD_CONTROL, label: 'ควบคุมงวดภาษีซื้อ', description: 'ดำเนิน privileged period control เช่น reopen งวด โดยแยกจากสิทธิ์อ่าน ตรวจสอบ และ filing' },
    ],
  },
  {
    key: 'procurement',
    title: 'จัดซื้อและใบรับสินค้า',
    description: 'กำหนดสิทธิ์สำหรับ Supplier, ใบสั่งซื้อ การรับสินค้า และ authority การชำระ โดยแยกงานทั่วไป งานลบ และงานการเงินจริงออกจากกัน',
    options: [
      { key: PROCUREMENT_CAPABILITIES.SUPPLIER, label: 'จัดการข้อมูล Supplier', description: 'ดู เพิ่ม และแก้ไขข้อมูล Supplier ของสาขา โดยยังไม่อนุญาตลบ Supplier' },
      { key: PROCUREMENT_CAPABILITIES.SUPPLIER_DELETE, label: 'ลบข้อมูล Supplier', description: 'อนุญาตลบ Supplier ที่ไม่ใช่ Supplier ระบบและไม่มีเอกสารจัดซื้ออ้างอิง โดยต้องมีสิทธิ์จัดการข้อมูล Supplier ด้วย' },
      { key: PROCUREMENT_CAPABILITIES.PURCHASE_ORDER, label: 'จัดทำใบสั่งซื้อ', description: 'ดู สร้าง แก้ไข และพิมพ์ใบสั่งซื้อ รวมถึงค้นหา PO ตาม Supplier โดยยังไม่อนุญาตลบหรือเปลี่ยนสถานะเอกสาร' },
      { key: PROCUREMENT_CAPABILITIES.PURCHASE_ORDER_CONTROL, label: 'ควบคุมสถานะหรือลบใบสั่งซื้อ', description: 'อนุญาตเปลี่ยนสถานะหรือลบใบสั่งซื้อ โดยต้องมีสิทธิ์จัดทำใบสั่งซื้อด้วย' },
      { key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_READ, label: 'ดูข้อมูลการชำระ Supplier', description: 'ดูประวัติการชำระ เงินจ่ายล่วงหน้า และรายการตาม Supplier หรือ PO ผ่านพื้นผิว read-only เดิม' },
      { key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_MANAGE, label: 'จัดการการชำระ Supplier', description: 'ดูรายการใน payment-allocation authority และสร้างการชำระที่ยืนยันแล้วเพื่อจัดสรรยอดให้เจ้าหนี้ Supplier ตามขอบเขตเดิมของ OWNER/MANAGER' },
      { key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_VOID, label: 'ยกเลิกรายการชำระ Supplier', description: 'อนุญาต void การชำระที่ยืนยันแล้วและย้อน allocation อย่างมีประวัติ โดย route ยังต้องผ่านสิทธิ์จัดการการชำระ Supplier ด้วย' },
      { key: PROCUREMENT_CAPABILITIES.RECEIPT, label: 'จัดทำใบรับสินค้าจาก PO', description: 'ดู สร้าง และแก้ไขใบรับสินค้า รายการสินค้า บาร์โค้ด และข้อมูลประกอบ โดยยังไม่อนุญาตปิดหรือ commit เอกสาร' },
      { key: PROCUREMENT_CAPABILITIES.RECEIPT_FINALIZE, label: 'ยืนยันหรือลบใบรับสินค้า', description: 'อนุญาต Finalize, Commit เข้าสต๊อก หรือลบใบรับสินค้าทั้งใบ โดยต้องมีสิทธิ์จัดทำใบรับสินค้าจาก PO ด้วย' },
    ],
  },
]);

export {
  CAPABILITY_GROUPS,
  EMPLOYEE_MANAGE_CAPABILITY,
  INVENTORY_CAPABILITIES,
  PROCUREMENT_CAPABILITIES,
  REPAIR_CAPABILITIES,
  SALES_CAPABILITIES,
  TAX_INPUT_CAPABILITIES,
  TAX_OUTPUT_CAPABILITIES,
};
